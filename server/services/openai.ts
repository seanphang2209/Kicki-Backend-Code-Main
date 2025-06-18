import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface UserProfile {
  diet?: string;
  location?: string;
  budget?: string;
}

export interface AskRequest {
  category: string;
  user_input: string;
  user_profile: UserProfile;
}

export interface Suggestion {
  title: string;
  reason: string;
}

export interface AskResponse {
  suggestions: Suggestion[];
}

/**
 * Generate AI-powered suggestions using OpenAI GPT-4
 */
export async function generateSuggestions(request: AskRequest): Promise<AskResponse> {
  try {
    // Construct dynamic prompt based on input
    const prompt = buildPrompt(request);

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are Kicko AI, an intelligent assistant that provides personalized suggestions. Always respond with a JSON object containing a 'suggestions' array. Each suggestion should have 'title' and 'reason' fields. Provide 3-5 relevant suggestions based on the user's input and preferences."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
      temperature: 0.7
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response content from OpenAI");
    }

    const result = JSON.parse(content) as AskResponse;
    
    // Validate the response structure
    if (!result.suggestions || !Array.isArray(result.suggestions)) {
      throw new Error("Invalid response format from OpenAI");
    }

    // Ensure each suggestion has required fields
    result.suggestions = result.suggestions.map(suggestion => ({
      title: suggestion.title || "Suggestion",
      reason: suggestion.reason || "No reason provided"
    }));

    return result;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error(`Failed to generate suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Build a dynamic prompt based on the user's request
 */
function buildPrompt(request: AskRequest): string {
  const { category, user_input, user_profile } = request;
  
  let prompt = `Category: ${category}\n`;
  prompt += `User Request: ${user_input}\n\n`;
  
  // Add user profile information if provided
  if (user_profile.diet || user_profile.location || user_profile.budget) {
    prompt += "User Preferences:\n";
    if (user_profile.diet) prompt += `- Diet: ${user_profile.diet}\n`;
    if (user_profile.location) prompt += `- Location: ${user_profile.location}\n`;
    if (user_profile.budget) prompt += `- Budget: ${user_profile.budget}\n`;
    prompt += "\n";
  }
  
  prompt += `Please provide personalized suggestions for "${category}" based on the user's request`;
  if (user_profile.diet || user_profile.location || user_profile.budget) {
    prompt += " and their preferences";
  }
  prompt += ". Return your response as a JSON object with a 'suggestions' array, where each suggestion has 'title' and 'reason' fields.";
  
  return prompt;
}
