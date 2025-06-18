# Kicko AI Assistant

## Overview

Kicko AI Assistant is a full-stack application that provides personalized suggestions for users based on their input and preferences. The system consists of:

- **Frontend**: React-based SPA with TypeScript, shadcn/ui components, and TailwindCSS
- **Backend**: Express.js API server with OpenAI GPT-4 integration
- **Database**: PostgreSQL with Drizzle ORM for data persistence
- **Authentication**: Basic user management system (schema defined but not fully implemented)

The core functionality revolves around an AI-powered suggestion engine that takes user queries in four categories (What to Eat, Where to Go, What to Buy, What to Do) and returns personalized recommendations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: TailwindCSS with custom design tokens
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite with custom configuration for monorepo structure

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **AI Integration**: OpenAI GPT-4o API for generating suggestions
- **Validation**: Zod for request validation
- **CORS**: Enabled for frontend integration
- **Error Handling**: Centralized error handling middleware
- **Logging**: Custom request/response logging

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: User management schema defined in shared directory
- **Migrations**: Drizzle-kit for schema migrations
- **Connection**: Uses @neondatabase/serverless for database connectivity

## Key Components

### 1. AI Suggestion Engine (`/server/services/openai.ts`)
- Integrates with OpenAI GPT-4o model
- Constructs dynamic prompts based on user input and profile
- Handles API errors and response formatting
- Returns structured JSON with suggestions array

### 2. API Routes (`/server/routes.ts`)
- `/api/ask` - Main endpoint for AI suggestions (POST)
- `/api/health` - Health check endpoint (GET)
- `/` - Root endpoint returning status message (GET)
- Input validation using Zod schemas
- CORS configuration for frontend requests

### 3. Frontend UI Components
- **Home Page**: Main interface with category selection and form inputs
- **Category Selection**: Four predefined categories with icons and colors
- **User Profile**: Optional diet, location, and budget preferences
- **Suggestions Display**: Formatted AI responses with title and reasoning

### 4. Shared Schema (`/shared/schema.ts`)
- User table definition with username/password fields
- Zod validation schemas for type safety
- TypeScript type exports for frontend/backend consistency

## Data Flow

1. **User Input**: User selects category and enters query on frontend
2. **Form Submission**: React form data is validated and sent to `/api/ask`
3. **Backend Validation**: Zod schema validates request structure
4. **Prompt Construction**: Dynamic prompt built from user input and profile
5. **OpenAI API Call**: GPT-4o processes the constructed prompt
6. **Response Processing**: AI response formatted into suggestions array
7. **Frontend Display**: Suggestions rendered with title and reasoning

## External Dependencies

### AI Services
- **OpenAI API**: GPT-4o model for generating personalized suggestions
- **API Key**: Stored as environment variable (OPENAI_API_KEY)

### Database
- **PostgreSQL**: Primary database for user management and data persistence
- **Neon Database**: Serverless PostgreSQL provider integration
- **Connection**: DATABASE_URL environment variable required

### UI Dependencies
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library for UI elements
- **React Query**: Server state management and caching
- **Class Variance Authority**: Type-safe variant API for components

## Deployment Strategy

### Replit Configuration
- **Modules**: nodejs-20, web, postgresql-16
- **Run Command**: `npm run dev` for development
- **Build Process**: Vite build + esbuild for production bundle
- **Port**: Application runs on port 5000, exposed as port 80
- **Environment**: NODE_ENV controls development vs production behavior

### Build Pipeline
1. **Development**: `npm run dev` - runs server with hot reload
2. **Production Build**: 
   - Frontend: Vite builds React app to `dist/public`
   - Backend: esbuild bundles server to `dist/index.js`
3. **Production Start**: `npm run start` - runs bundled server

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API authentication
- `NODE_ENV` - Environment flag (development/production)

## Changelog
- June 18, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.