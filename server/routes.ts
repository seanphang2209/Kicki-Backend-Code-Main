import type { Express } from "express";
import { createServer, type Server } from "http";
import cors from "cors";
import { generateSuggestions, type AskRequest } from "./services/openai";
import { z } from "zod";

// Validation schema for the ask request
const askRequestSchema = z.object({
  category: z.string().min(1, "Category is required"),
  user_input: z.string().min(1, "User input is required"),
  user_profile: z.object({
    diet: z.string().optional(),
    location: z.string().optional(),
    budget: z.string().optional(),
  }).optional().default({})
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Add CORS support for frontend integration
  app.use(cors({
    origin: process.env.NODE_ENV === 'development' ? true : false,
    credentials: true
  }));

  // Root endpoint - only for API status check
  app.get("/api", (req, res) => {
    res.json({ message: "Kicko AI backend is running." });
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Main ask endpoint for AI suggestions
  app.post("/api/ask", async (req, res) => {
    try {
      // Validate request body
      const validation = askRequestSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }

      const askRequest: AskRequest = validation.data;

      // Check if OpenAI API key is configured
      if (!process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY_ENV_VAR) {
        return res.status(500).json({
          error: "OpenAI API key not configured"
        });
      }

      // Generate AI suggestions
      const response = await generateSuggestions(askRequest);

      // Return structured response
      res.json(response);

    } catch (error) {
      console.error("Error in /api/ask endpoint:", error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          return res.status(401).json({
            error: "Invalid API key"
          });
        }
        
        if (error.message.includes("quota") || error.message.includes("billing")) {
          return res.status(429).json({
            error: "API quota exceeded"
          });
        }
      }

      // Generic error response
      res.status(500).json({
        error: "Failed to generate suggestions",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
