/**
 * 🚀 KICKO AI BACKEND - Smart Decision Assistant
 * 
 * A powerful, scalable backend API for Kicko - an AI-powered smart assistant
 * that helps users make daily decisions based on context, preferences, and real-time data.
 * 
 * Features:
 * - OpenAI GPT-4 integration with smart context enrichment
 * - Real-time weather data integration
 * - Third-party service integration (GrabFood, Klook, Netflix, Amazon)
 * - In-memory suggestion history
 * - Multilingual support
 * - Response filtering and validation
 * - Comprehensive error handling
 * - Action URLs for direct service access
 * 
 * Environment Variables Required:
 * - OPENAI_API_KEY: Your OpenAI API key
 * - WEATHER_API_KEY: Your OpenWeatherMap API key
 * - PORT: Server port (default: 5000)
 * 
 * Usage:
 * 1. npm install
 * 2. Set environment variables
 * 3. node index.js
 * 
 * Test with:
 * curl -X POST http://localhost:5000/ask \
 *   -H "Content-Type: application/json" \
 *   -d '{"category":"What to Eat", "user_input":"I want something light", "user_profile":{"location":"Singapore", "diet":"vegetarian", "budget":"under $10"}}'
 */

import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import axios from 'axios';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// In-memory storage for user session history (in production, use Redis or database)
const userHistory = new Map();

// Enhanced word filter for inappropriate content
const inappropriateWords = [
  'inappropriate', 'offensive', 'explicit', 'adult', 'nsfw', 'violence', 'explicit'
];

// Third-party service configurations
const SERVICE_CONFIGS = {
  'What to Eat': {
    type: 'order',
    label: 'Order on GrabFood',
    baseUrl: 'https://food.grab.com/sg/en/search/',
    affiliateTag: '?utm_source=kicko&utm_medium=referral'
  },
  'What to Do': {
    type: 'book',
    label: 'Book on Klook',
    baseUrl: 'https://www.klook.com/en-SG/search/?query=',
    affiliateTag: '&utm_source=kicko&utm_medium=referral'
  },
  'What to Watch': {
    type: 'stream',
    label: 'Watch on Netflix',
    baseUrl: 'https://www.netflix.com/search?q=',
    affiliateTag: '&utm_source=kicko&utm_medium=referral'
  },
  'What to Buy': {
    type: 'shop',
    label: 'Buy on Amazon',
    baseUrl: 'https://www.amazon.sg/s?k=',
    affiliateTag: '&utm_source=kicko&utm_medium=referral'
  }
};

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON request bodies

/**
 * Root endpoint - returns a simple status message
 */
app.get('/', (req, res) => {
  res.json({ 
    message: 'Kicko AI backend is running',
    version: '3.0.0',
    features: [
      'AI Suggestions', 
      'Weather Integration', 
      'Context Enrichment', 
      'Multilingual Support',
      'Third-party Service Integration',
      'Action URLs'
    ]
  });
});

/**
 * Health check endpoint for diagnostics
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    services: {
      openai: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
      weather: process.env.WEATHER_API_KEY ? 'configured' : 'missing'
    }
  });
});

/**
 * Get real-time weather data for location
 */
async function getWeatherData(location) {
  try {
    if (!process.env.WEATHER_API_KEY) {
      console.warn('Weather API key not configured, skipping weather data');
      return null;
    }

    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: {
        q: location,
        appid: process.env.WEATHER_API_KEY,
        units: 'metric'
      },
      timeout: 5000
    });

    const weather = response.data;
    return {
      temperature: Math.round(weather.main.temp),
      condition: weather.weather[0].main.toLowerCase(),
      description: weather.weather[0].description,
      humidity: weather.main.humidity,
      feels_like: Math.round(weather.main.feels_like)
    };
  } catch (error) {
    console.error('Weather API error:', error.message);
    return null;
  }
}

/**
 * Get current time context
 */
function getTimeContext() {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
  
  let timeOfDay;
  if (hour >= 5 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
  else timeOfDay = 'night';

  return {
    time_of_day: timeOfDay,
    day_of_week: dayOfWeek,
    current_hour: hour,
    is_weekend: ['Saturday', 'Sunday'].includes(dayOfWeek)
  };
}

/**
 * Enrich suggestions with third-party service actions
 */
function enrichSuggestionsWithActions(suggestions, category) {
  const serviceConfig = SERVICE_CONFIGS[category];
  
  if (!serviceConfig) {
    return suggestions; // No action for unknown categories
  }

  return suggestions.map(suggestion => {
    const enrichedSuggestion = { ...suggestion };
    
    // Only add action if title exists and is relevant
    if (suggestion.title && suggestion.title.trim()) {
      const encodedTitle = encodeURIComponent(suggestion.title.trim());
      enrichedSuggestion.action = {
        type: serviceConfig.type,
        label: serviceConfig.label,
        url: `${serviceConfig.baseUrl}${encodedTitle}${serviceConfig.affiliateTag}`
      };
    }
    
    return enrichedSuggestion;
  });
}

/**
 * Filter and validate suggestions
 */
function filterSuggestions(suggestions) {
  if (!Array.isArray(suggestions)) {
    throw new Error('Invalid suggestions format');
  }

  return suggestions
    .filter(suggestion => {
      // Ensure suggestion has required fields
      if (!suggestion.title || !suggestion.reason) {
        return false;
      }

      // Filter out inappropriate content
      const text = `${suggestion.title} ${suggestion.reason}`.toLowerCase();
      return !inappropriateWords.some(word => text.includes(word));
    })
    .slice(0, 5) // Limit to max 5 suggestions
    .map(suggestion => ({
      title: suggestion.title.trim(),
      reason: suggestion.reason.trim()
    }));
}

/**
 * Build smart context for AI prompt
 */
async function buildSmartContext(userProfile) {
  const timeContext = getTimeContext();
  const weatherData = await getWeatherData(userProfile.location);

  const context = {
    ...timeContext,
    weather: weatherData ? {
      temperature: weatherData.temperature,
      condition: weatherData.condition,
      description: weatherData.description
    } : null,
    user_preferences: {
      diet: userProfile.diet || 'any',
      budget: userProfile.budget || 'any',
      location: userProfile.location
    }
  };

  return context;
}

/**
 * Generate smart prompt for OpenAI with enhanced structure
 */
function buildSmartPrompt(category, userInput, userProfile, context, language = 'en') {
  const isMultilingual = language !== 'en';
  const languageInstruction = isMultilingual ? `Respond in ${language}.` : '';

  let prompt = `You are a smart decision assistant. Based on the user's context and preferences, suggest 3–5 options for: ${category}. ${languageInstruction}\n\n`;
  
  // Add context information
  prompt += `Time: ${context.current_hour}pm ${context.day_of_week}\n`;
  if (context.weather) {
    prompt += `Weather: ${context.weather.description} and ${context.weather.temperature}°C\n`;
  }
  prompt += `Location: ${context.user_preferences.location}\n`;
  prompt += `Profile: ${context.user_preferences.diet}, budget ${context.user_preferences.budget}\n\n`;

  prompt += `User Request: ${userInput}\n\n`;

  prompt += `Return results as structured JSON:\n`;
  prompt += `{\n`;
  prompt += `  "suggestions": [\n`;
  prompt += `    {\n`;
  prompt += `      "title": "Suggestion Title",\n`;
  prompt += `      "reason": "Detailed reason why this is a good choice"\n`;
  prompt += `    }\n`;
  prompt += `  ]\n`;
  prompt += `}\n\n`;

  prompt += `Guidelines:\n`;
  prompt += `- Make suggestions practical and actionable\n`;
  prompt += `- Consider the current context (time, weather, location)\n`;
  prompt += `- Keep suggestions appropriate and family-friendly\n`;
  prompt += `- Provide specific, detailed reasons\n`;

  return prompt;
}

/**
 * Main ask endpoint - generates AI-powered suggestions with smart context
 */
app.post('/ask', async (req, res) => {
  try {
    const { category, user_input, user_profile } = req.body;

    // Validate required fields
    if (!category || typeof category !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid category field. Category must be a string.'
      });
    }

    if (!user_input || typeof user_input !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid user_input field. User input must be a string.'
      });
    }

    if (!user_profile || !user_profile.location || typeof user_profile.location !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid user_profile.location field. Location is required.'
      });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not found in environment variables');
      return res.status(500).json({
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.'
      });
    }

    // Generate session ID for history tracking
    const sessionId = req.headers['x-session-id'] || uuidv4();

    // Build smart context
    const context = await buildSmartContext(user_profile);
    
    // Build smart prompt
    const language = user_profile.language || 'en';
    const prompt = buildSmartPrompt(category, user_input, user_profile, context, language);

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are Kicko AI, an intelligent daily decision assistant. Always respond with valid JSON containing a "suggestions" array. Each suggestion must have "title" and "reason" fields. Be helpful, practical, and consider the user\'s context.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
      temperature: 0.7
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    // Parse and validate the AI response
    let result;
    try {
      result = JSON.parse(content);
    } catch (parseError) {
      throw new Error('Invalid JSON response from OpenAI');
    }

    // Filter and validate suggestions
    const filteredSuggestions = filterSuggestions(result.suggestions);

    // Enrich suggestions with third-party service actions
    const enrichedSuggestions = enrichSuggestionsWithActions(filteredSuggestions, category);

    // Store in user history (last 3 responses)
    if (!userHistory.has(sessionId)) {
      userHistory.set(sessionId, []);
    }
    
    const history = userHistory.get(sessionId);
    history.unshift({
      timestamp: new Date().toISOString(),
      category,
      user_input,
      suggestions: enrichedSuggestions,
      context
    });
    
    // Keep only last 3 responses
    if (history.length > 3) {
      history.splice(3);
    }

    // Return structured response
    res.json({ 
      suggestions: enrichedSuggestions,
      context,
      session_id: sessionId,
      history_count: history.length
    });

  } catch (error) {
    console.error('Error in /ask endpoint:', error);

    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('authentication')) {
        return res.status(401).json({
          error: 'Invalid OpenAI API key. Please check your configuration.'
        });
      }
      
      if (error.message.includes('quota') || error.message.includes('billing')) {
        return res.status(429).json({
          error: 'OpenAI API quota exceeded. Please try again later.'
        });
      }

      if (error.message.includes('rate limit')) {
        return res.status(429).json({
          error: 'Rate limit exceeded. Please try again in a moment.'
        });
      }
    }

    // Generic error response
    res.status(500).json({
      error: 'Failed to generate suggestions',
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
});

/**
 * Get user history endpoint
 */
app.get('/history/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const history = userHistory.get(sessionId) || [];
  
  res.json({
    session_id: sessionId,
    history: history,
    count: history.length
  });
});

/**
 * Clear user history endpoint
 */
app.delete('/history/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  userHistory.delete(sessionId);
  
  res.json({
    message: 'History cleared successfully',
    session_id: sessionId
  });
});

/**
 * Get available categories endpoint
 */
app.get('/categories', (req, res) => {
  res.json({
    categories: Object.keys(SERVICE_CONFIGS),
    services: SERVICE_CONFIGS
  });
});

/**
 * 404 handler for undefined routes
 */
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.originalUrl} does not exist.`,
    available_endpoints: [
      'GET /', 
      'GET /health', 
      'POST /ask', 
      'GET /history/:sessionId', 
      'DELETE /history/:sessionId',
      'GET /categories'
    ]
  });
});

/**
 * Global error handler
 */
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred on the server.'
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Kicko AI backend server running on port ${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   GET  / - Status check`);
  console.log(`   GET  /health - Health check`);
  console.log(`   POST /ask - Generate AI suggestions`);
  console.log(`   GET  /history/:sessionId - Get user history`);
  console.log(`   DELETE /history/:sessionId - Clear user history`);
  console.log(`   GET  /categories - Get available categories`);
  console.log(`🔑 OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`🌤️  Weather API Key: ${process.env.WEATHER_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`💾 In-memory history: Enabled`);
  console.log(`🌍 Multilingual support: Enabled`);
  console.log(`🔗 Third-party services: ${Object.keys(SERVICE_CONFIGS).join(', ')}`);
});

export default app; 