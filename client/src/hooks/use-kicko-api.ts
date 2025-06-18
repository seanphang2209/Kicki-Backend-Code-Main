import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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

export interface ApiError {
  error: string;
  message?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export function useAskKicko() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: AskRequest): Promise<AskResponse> => {
      const response = await apiRequest("POST", "/api/ask", request);
      return response.json();
    },
    onError: (error) => {
      console.error("Ask Kicko error:", error);
    },
    onSuccess: () => {
      // Invalidate any relevant queries if needed
      queryClient.invalidateQueries({ queryKey: ["/api/health"] });
    }
  });
}
