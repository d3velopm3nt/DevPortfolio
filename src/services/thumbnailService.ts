import { supabase } from "../lib/supabase";

/**
 * Requests a thumbnail generation for a project
 * @param projectId The ID of the project
 * @param websiteUrl The URL of the website to capture
 * @returns Promise that resolves to the thumbnail URL or null if failed
 */
export const requestThumbnailGeneration = async (
  projectId: string,
  websiteUrl: string
): Promise<string | null> => {
  try {
    console.log('Requesting thumbnail generation via Supabase Edge Function...');
    
    // Get the authentication token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error("No active session");
      return null;
    }
    
    // Get your Supabase URL from environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    // Make a direct fetch request to the Edge Function
    const response = await fetch(
      `${supabaseUrl}/functions/v1/generate-thumbnail`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ projectId, websiteUrl }),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate thumbnail');
    }
    
    const data = await response.json();
    console.log("Thumbnail generated successfully:", data.thumbnailUrl);
    return data.thumbnailUrl;
  } catch (error) {
    console.error("Error requesting thumbnail generation:", error);
    return null;
  }
}; 