import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON request bodies

/**
 * Root endpoint - returns a simple status message
 */
app.get('/', (req, res) => {
  res.json({ message: 'Kicko AI backend is running' });
});

/**
 * Main ask endpoint - generates AI-powered suggestions
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

    // Validate user_profile if provided
    if (user_profile && typeof user_profile !== 'object') {
      return res.status(400).json({
        error: 'Invalid user_profile field. User profile must be an object.'
      });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not found in environment variables');
      return res.status(500).json({
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.'
      });
    }

    // Build dynamic prompt for OpenAI
    const prompt = buildPrompt(category, user_input, user_profile);

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are Kicko AI, an intelligent daily decision assistant. Generate 3-5 personalized suggestions based on the user\'s request and preferences. Always respond with a JSON object containing a "suggestions" array. Each suggestion must have "title" and "reason" fields. Be helpful, practical, and consider the user\'s context.'
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

    // Validate response structure
    if (!result.suggestions || !Array.isArray(result.suggestions)) {
      throw new Error('Invalid response format: missing suggestions array');
    }

    // Ensure each suggestion has required fields
    const suggestions = result.suggestions.map((suggestion, index) => ({
      title: suggestion.title || `Suggestion ${index + 1}`,
      reason: suggestion.reason || 'No reason provided'
    }));

    // Return structured response
    res.json({ suggestions });

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
 * Build a dynamic prompt string based on user input and profile
 */
function buildPrompt(category, userInput, userProfile = {}) {
  let prompt = `Category: ${category}\n`;
  prompt += `User Request: ${userInput}\n\n`;
  
  // Add user profile information if provided
  const hasProfile = userProfile.diet || userProfile.location || userProfile.budget;
  
  if (hasProfile) {
    prompt += 'User Profile:\n';
    if (userProfile.diet) prompt += `- Diet: ${userProfile.diet}\n`;
    if (userProfile.location) prompt += `- Location: ${userProfile.location}\n`;
    if (userProfile.budget) prompt += `- Budget: ${userProfile.budget}\n`;
    prompt += '\n';
  }
  
  prompt += `Please provide 3-5 personalized suggestions for "${category}" based on the user's request`;
  if (hasProfile) {
    prompt += ' and their profile information';
  }
  prompt += '. Each suggestion should be practical and actionable.';
  
  return prompt;
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Kicko AI Backend'
  });
});

/**
 * 404 handler for undefined routes
 */
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.originalUrl} does not exist.`
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
  console.log(`   POST /ask - Generate AI suggestions`);
  console.log(`   GET  /health - Health check`);
  console.log(`🔑 OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
});

export default app; 