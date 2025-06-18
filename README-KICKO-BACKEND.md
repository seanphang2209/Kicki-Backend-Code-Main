# Kicko AI Backend

An Express.js API backend for Kicko, an AI-powered daily decision assistant that provides personalized suggestions using OpenAI GPT-4.

## Features

- 🤖 AI-powered suggestions using OpenAI GPT-4o
- 🔒 Secure API key management
- ✅ Input validation and error handling
- 🌐 CORS support for frontend integration
- 📊 Health check endpoints
- 🚀 Ready for deployment on Replit

## Quick Start

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

# Server Configuration (optional)
PORT=5000
```

### 3. Run the Server

```bash
# Production
npm start

# Development (with auto-restart)
npm run dev
```

The server will start on port 5000 (or the port specified in your environment variables).

## API Endpoints

### GET `/`
**Status Check**
- Returns a simple status message
- **Response:** `{ "message": "Kicko AI backend is running" }`

### GET `/health`
**Health Check**
- Returns server health status and timestamp
- **Response:** 
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "Kicko AI Backend"
}
```

### POST `/ask`
**Generate AI Suggestions**
- Accepts JSON request with category, user input, and optional profile
- Returns AI-generated suggestions

**Request Body:**
```json
{
  "category": "restaurant",
  "user_input": "I want to try something new for dinner",
  "user_profile": {
    "diet": "vegetarian",
    "location": "San Francisco",
    "budget": "medium"
  }
}
```

**Response:**
```json
{
  "suggestions": [
    {
      "title": "Try the new plant-based ramen place",
      "reason": "Perfect for vegetarians and offers unique flavors"
    },
    {
      "title": "Visit the farmers market food court",
      "reason": "Fresh local ingredients with budget-friendly options"
    }
  ]
}
```

## Setting Up on Replit

### 1. Create a New Replit Project
- Choose "Node.js" as your template
- Upload the `index.js` and `package.json` files

### 2. Install Dependencies
- Run `npm install` in the Replit shell

### 3. Set Environment Variables
- Go to the "Secrets" tab in your Replit project
- Add a new secret:
  - **Key:** `OPENAI_API_KEY`
  - **Value:** Your OpenAI API key

### 4. Run the Server
- Click the "Run" button or use `npm start`

## Testing the API

### Using curl

**Test the root endpoint:**
```bash
curl http://localhost:5000/
```

**Test the health endpoint:**
```bash
curl http://localhost:5000/health
```

**Test the ask endpoint:**
```bash
curl -X POST http://localhost:5000/ask \
  -H "Content-Type: application/json" \
  -d '{
    "category": "restaurant",
    "user_input": "I want to try something new for dinner",
    "user_profile": {
      "diet": "vegetarian",
      "location": "San Francisco",
      "budget": "medium"
    }
  }'
```

### Using Postman

1. **Create a new request**
2. **Set method to POST**
3. **Set URL to:** `http://localhost:5000/ask`
4. **Set Headers:** `Content-Type: application/json`
5. **Set Body (raw JSON):**
```json
{
  "category": "restaurant",
  "user_input": "I want to try something new for dinner",
  "user_profile": {
    "diet": "vegetarian",
    "location": "San Francisco",
    "budget": "medium"
  }
}
```

## Error Handling

The API includes comprehensive error handling:

- **400 Bad Request:** Invalid input data
- **401 Unauthorized:** Invalid OpenAI API key
- **429 Too Many Requests:** Rate limit or quota exceeded
- **500 Internal Server Error:** Server-side errors

All error responses include descriptive messages to help with debugging.

## Security Considerations

- ✅ API key stored in environment variables
- ✅ Input validation on all endpoints
- ✅ CORS configured for frontend integration
- ✅ Error messages don't expose sensitive information

## Dependencies

- **express:** Web framework
- **cors:** Cross-origin resource sharing
- **openai:** OpenAI API client
- **dotenv:** Environment variable management

## Development

### Project Structure
```
kicko-backend/
├── index.js              # Main server file
├── package.json          # Dependencies and scripts
├── .env                  # Environment variables (create this)
└── README-KICKO-BACKEND.md  # This file
```

### Adding New Features

The code is modular and well-commented. To add new features:

1. Add new routes in the main `index.js` file
2. Create helper functions for complex logic
3. Update the validation as needed
4. Test thoroughly with different inputs

## Support

For issues or questions:
1. Check the error messages in the console
2. Verify your OpenAI API key is correct
3. Ensure all required fields are provided in requests
4. Check the OpenAI API status if you're getting errors

## License

MIT License - feel free to use this code for your own projects! 