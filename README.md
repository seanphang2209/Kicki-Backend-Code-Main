# Kicko AI Assistant

A full-stack AI-powered assistant that provides personalized suggestions for users based on their input and preferences.

## Features

- **AI-Powered Suggestions**: Uses OpenAI GPT-4o to generate intelligent recommendations
- **Category-Based Queries**: Support for "What to Eat", "Where to Go", "What to Buy", and "What to Do"
- **User Preferences**: Customizable diet, location, and budget preferences
- **Modern UI**: Clean, responsive interface built with React and TailwindCSS
- **Real-time Processing**: Fast API responses with error handling

## Tech Stack

### Frontend
- React 18 with TypeScript
- TailwindCSS for styling
- shadcn/ui component library
- React Query for state management
- Wouter for routing

### Backend
- Node.js with Express
- OpenAI GPT-4o integration
- Zod for validation
- CORS enabled

## Setup Instructions

### Prerequisites
- Node.js 20+
- OpenAI API key

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Add your OpenAI API key
OPENAI_API_KEY=your_openai_api_key_here
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## API Endpoints

### POST /api/ask
Generate AI suggestions based on user input.

**Request Body:**
```json
{
  "category": "What to Eat",
  "user_input": "I'm feeling tired and want something quick and healthy",
  "user_profile": {
    "diet": "vegetarian",
    "location": "Singapore", 
    "budget": "under $10"
  }
}
```

**Response:**
```json
{
  "suggestions": [
    {
      "title": "Quinoa salad from nearby cafe",
      "reason": "Light, healthy, and under $10"
    }
  ]
}
```

### GET /api/health
Health check endpoint.

## Deployment

This application is designed for Replit deployment:

1. Ensure all dependencies are installed
2. Set the OPENAI_API_KEY environment variable
3. The app runs on port 5000 by default
4. Both frontend and backend are served from the same port

## Environment Variables

- `OPENAI_API_KEY` - Required for AI functionality
- `NODE_ENV` - Set to 'production' for production builds

## Usage

1. Select a category (What to Eat, Where to Go, What to Buy, What to Do)
2. Describe what you're looking for
3. Optionally set your preferences (diet, location, budget)
4. Click "Get AI Suggestions" to receive personalized recommendations

## License

MIT License