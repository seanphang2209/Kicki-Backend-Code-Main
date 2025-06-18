# 🚀 Kicko AI Backend - Smart Decision Assistant

A powerful, scalable Express.js API backend for **Kicko** — an AI-powered smart assistant that helps users make daily decisions based on context, preferences, and real-time data, with direct integration to third-party services.

## 🌟 Features

- 🤖 **AI-Powered Suggestions** using OpenAI GPT-4 with smart context enrichment
- 🌤️ **Real-time Weather Integration** via OpenWeatherMap API
- 🕒 **Smart Context Awareness** (time, day, weather, location)
- 🌍 **Multilingual Support** for global users
- 💾 **In-Memory History** with session management
- 🔒 **Content Filtering** and validation
- 🔗 **Third-party Service Integration** (GrabFood, Klook, Netflix, Amazon)
- 🎯 **Action URLs** with affiliate tracking
- ✅ **Comprehensive Error Handling** with specific HTTP status codes
- 🌐 **CORS Support** for frontend integration
- 📊 **Health Monitoring** and diagnostics

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Environment Variables

Create a `.env` file in the root directory:

```env
# OpenAI API Configuration
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Weather API Configuration (Optional)
# Get your API key from: https://openweathermap.org/api
WEATHER_API_KEY=your_openweathermap_api_key_here

# Server Configuration (optional)
PORT=5000
```

### 3. Run the Server

```bash
# Production
npm start

# Development (with auto-restart)
npm run dev

# Test the API
npm test
```

The server will start on port 5000 (or the port specified in your environment variables).

## 📡 API Endpoints

### GET `/`
**Status Check**
- Returns server status and feature list
- **Response:** 
```json
{
  "message": "Kicko AI backend is running",
  "version": "3.0.0",
  "features": [
    "AI Suggestions", 
    "Weather Integration", 
    "Context Enrichment", 
    "Multilingual Support",
    "Third-party Service Integration",
    "Action URLs"
  ]
}
```

### GET `/health`
**Health Check**
- Returns detailed health status and service configuration
- **Response:** 
```json
{
  "status": "OK",
  "version": "3.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "openai": "configured",
    "weather": "configured"
  }
}
```

### GET `/categories`
**Get Available Categories**
- Returns all supported categories and their service configurations
- **Response:**
```json
{
  "categories": ["What to Eat", "What to Do", "What to Watch", "What to Buy"],
  "services": {
    "What to Eat": {
      "type": "order",
      "label": "Order on GrabFood",
      "baseUrl": "https://food.grab.com/sg/en/search/",
      "affiliateTag": "?utm_source=kicko&utm_medium=referral"
    }
  }
}
```

### POST `/ask`
**Generate AI Suggestions with Smart Context and Actions**
- Accepts JSON request with category, user input, and profile
- Enriches context with time, weather, and location data
- Returns AI-generated suggestions with direct action URLs

**Request Body:**
```json
{
  "category": "What to Eat",
  "user_input": "I want something light and quick for lunch",
  "user_profile": {
    "diet": "vegetarian",
    "location": "Singapore",
    "budget": "under $10",
    "language": "en"
  }
}
```

**Response:**
```json
{
  "suggestions": [
    {
      "title": "Avocado Salad Bowl",
      "reason": "Quick, vegetarian-friendly, and refreshing for hot afternoons in Singapore.",
      "action": {
        "type": "order",
        "label": "Order on GrabFood",
        "url": "https://food.grab.com/sg/en/search/Avocado%20Salad%20Bowl?utm_source=kicko&utm_medium=referral"
      }
    },
    {
      "title": "Vegetarian Pho",
      "reason": "Light soup-based meal perfect for Singapore's humid weather.",
      "action": {
        "type": "order",
        "label": "Order on GrabFood",
        "url": "https://food.grab.com/sg/en/search/Vegetarian%20Pho?utm_source=kicko&utm_medium=referral"
      }
    }
  ],
  "context": {
    "time_of_day": "afternoon",
    "day_of_week": "Monday",
    "weather": {
      "temperature": 32,
      "condition": "clear",
      "description": "clear sky"
    },
    "user_preferences": {
      "diet": "vegetarian",
      "budget": "under $10",
      "location": "Singapore"
    }
  },
  "session_id": "uuid-session-id",
  "history_count": 1
}
```

### GET `/history/:sessionId`
**Get User History**
- Retrieves the last 3 interactions for a session
- **Response:**
```json
{
  "session_id": "uuid-session-id",
  "history": [
    {
      "timestamp": "2024-01-15T10:30:00.000Z",
      "category": "What to Eat",
      "user_input": "I want something light",
      "suggestions": [...],
      "context": {...}
    }
  ],
  "count": 1
}
```

### DELETE `/history/:sessionId`
**Clear User History**
- Removes all history for a session
- **Response:**
```json
{
  "message": "History cleared successfully",
  "session_id": "uuid-session-id"
}
```

## 🔗 Third-Party Service Integration

The backend automatically enriches suggestions with action URLs for direct service access:

### What to Eat → GrabFood
- **Action Type:** `order`
- **Label:** "Order on GrabFood"
- **URL:** `https://food.grab.com/sg/en/search/[encoded-title]?utm_source=kicko&utm_medium=referral`

### What to Do → Klook
- **Action Type:** `book`
- **Label:** "Book on Klook"
- **URL:** `https://www.klook.com/en-SG/search/?query=[encoded-title]&utm_source=kicko&utm_medium=referral`

### What to Watch → Netflix
- **Action Type:** `stream`
- **Label:** "Watch on Netflix"
- **URL:** `https://www.netflix.com/search?q=[encoded-title]&utm_source=kicko&utm_medium=referral`

### What to Buy → Amazon
- **Action Type:** `shop`
- **Label:** "Buy on Amazon"
- **URL:** `https://www.amazon.sg/s?k=[encoded-title]&utm_source=kicko&utm_medium=referral`

## 🌍 Smart Context Enrichment

The backend automatically enriches requests with:

- **Time Context:** Current time of day, day of week, weekend detection
- **Weather Data:** Real-time temperature, conditions, and descriptions
- **Location Awareness:** City-specific recommendations
- **User Preferences:** Diet, budget, language preferences

## 🌐 Multilingual Support

Set `user_profile.language` to get responses in different languages:

```json
{
  "user_profile": {
    "language": "ja",  // Japanese
    "location": "Tokyo"
  }
}
```

Supported languages: `en`, `ja`, `es`, `fr`, `de`, `zh`, `ko`, etc.

## 🔧 Setting Up on Replit

### 1. Create a New Replit Project
- Choose "Node.js" as your template
- Upload the `index.js` and `package.json` files

### 2. Install Dependencies
- Run `npm install` in the Replit shell

### 3. Set Environment Variables
- Go to the "Secrets" tab in your Replit project
- Add secrets:
  - **Key:** `OPENAI_API_KEY`
  - **Value:** Your OpenAI API key
  - **Key:** `WEATHER_API_KEY`
  - **Value:** Your OpenWeatherMap API key

### 4. Run the Server
- Click the "Run" button or use `npm start`

## 🧪 Testing the API

### Using the Test Script
```bash
npm test
```

### Using curl

**Test the root endpoint:**
```bash
curl http://localhost:5000/
```

**Test the health endpoint:**
```bash
curl http://localhost:5000/health
```

**Test the categories endpoint:**
```bash
curl http://localhost:5000/categories
```

**Test the ask endpoint with GrabFood integration:**
```bash
curl -X POST http://localhost:5000/ask \
  -H "Content-Type: application/json" \
  -d '{
    "category": "What to Eat",
    "user_input": "I want something light and quick for lunch",
    "user_profile": {
      "diet": "vegetarian",
      "location": "Singapore",
      "budget": "under $10",
      "language": "en"
    }
  }'
```

**Test Klook integration:**
```bash
curl -X POST http://localhost:5000/ask \
  -H "Content-Type: application/json" \
  -d '{
    "category": "What to Do",
    "user_input": "I want to explore something fun this weekend",
    "user_profile": {
      "location": "Singapore",
      "budget": "under $50",
      "language": "en"
    }
  }'
```

**Test Netflix integration:**
```bash
curl -X POST http://localhost:5000/ask \
  -H "Content-Type: application/json" \
  -d '{
    "category": "What to Watch",
    "user_input": "I want to watch something relaxing and feel-good",
    "user_profile": {
      "location": "Singapore",
      "language": "en"
    }
  }'
```

**Test Amazon integration:**
```bash
curl -X POST http://localhost:5000/ask \
  -H "Content-Type: application/json" \
  -d '{
    "category": "What to Buy",
    "user_input": "I need something for my home office",
    "user_profile": {
      "location": "Singapore",
      "budget": "under $100",
      "language": "en"
    }
  }'
```

**Get user history:**
```bash
curl http://localhost:5000/history/YOUR_SESSION_ID
```

### Using Postman

1. **Create a new request**
2. **Set method to POST**
3. **Set URL to:** `http://localhost:5000/ask`
4. **Set Headers:** `Content-Type: application/json`
5. **Set Body (raw JSON):**
```json
{
  "category": "What to Eat",
  "user_input": "I want something light and quick for lunch",
  "user_profile": {
    "diet": "vegetarian",
    "location": "Singapore",
    "budget": "under $10",
    "language": "en"
  }
}
```

## 🛡️ Error Handling

The API includes comprehensive error handling:

- **400 Bad Request:** Invalid input data or missing required fields
- **401 Unauthorized:** Invalid OpenAI API key
- **429 Too Many Requests:** Rate limit or quota exceeded
- **500 Internal Server Error:** Server-side errors

All error responses include descriptive messages to help with debugging.

## 🔒 Security & Content Filtering

- ✅ API keys stored in environment variables
- ✅ Input validation on all endpoints
- ✅ Content filtering for inappropriate suggestions
- ✅ CORS configured for frontend integration
- ✅ Error messages don't expose sensitive information
- ✅ Session-based history management
- ✅ Affiliate tracking for monetization

## 📦 Dependencies

- **express:** Web framework
- **cors:** Cross-origin resource sharing
- **openai:** OpenAI API client
- **axios:** HTTP client for weather API
- **dotenv:** Environment variable management
- **uuid:** Session ID generation

## 🏗️ Architecture

### Smart Context Flow
1. **Request Validation** - Validate required fields
2. **Context Enrichment** - Get time, weather, and location data
3. **Prompt Building** - Create intelligent prompts with context
4. **AI Processing** - Generate suggestions with GPT-4
5. **Response Filtering** - Filter and validate suggestions
6. **Action Enrichment** - Add third-party service URLs
7. **History Storage** - Store interaction in memory
8. **Response Delivery** - Return structured response with context and actions

### In-Memory Storage
- User session history (last 3 interactions)
- Session-based tracking with UUID
- Automatic cleanup and management

## 💰 Monetization Features

The backend includes built-in monetization capabilities:

- **Affiliate Tracking:** All action URLs include UTM parameters
- **Service Integration:** Direct links to GrabFood, Klook, Netflix, Amazon
- **Click Tracking:** Session-based history for user behavior analysis
- **Revenue Attribution:** Clear source tracking for conversions

## 🚀 Production Considerations

For production deployment:

1. **Database Integration:** Replace in-memory storage with Redis or PostgreSQL
2. **Rate Limiting:** Add rate limiting middleware
3. **Caching:** Implement response caching for weather data
4. **Monitoring:** Add logging and monitoring
5. **Load Balancing:** Use multiple instances behind a load balancer
6. **Analytics:** Track click-through rates and conversions
7. **A/B Testing:** Test different affiliate strategies

## 🐛 Troubleshooting

### Common Issues

1. **OpenAI API Key Error**
   - Verify your API key is correct
   - Check your OpenAI account billing status

2. **Weather API Not Working**
   - Verify your OpenWeatherMap API key
   - Check if the location name is valid

3. **Server Won't Start**
   - Check if port 5000 is available
   - Verify all environment variables are set

4. **Suggestions Not Relevant**
   - Ensure location is a valid city name
   - Check that user_profile fields are properly formatted

5. **Action URLs Not Working**
   - Verify category names match exactly
   - Check if third-party services are accessible

## 📄 License

MIT License - feel free to use this code for your own projects!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Built with ❤️ for smart decision-making and seamless service integration!** 