import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { supabase } from '../supabaseClient'; // Adjust import based on your setup

interface RefreshThumbnailButtonProps {
  projectId: string;
  liveUrl?: string;
}

export function RefreshThumbnailButton({ projectId, liveUrl }: RefreshThumbnailButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    if (!liveUrl) {
      alert('This project does not have a live URL');
      return;
    }
    
    setIsLoading(true);
    try {
      // Adjust this to match your API endpoint
      const response = await fetch('/api/thumbnail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          projectId,
          websiteUrl: liveUrl,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh thumbnail');
      }
      
      // Force reload to show the new thumbnail
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing thumbnail:', error);
      alert('Failed to refresh thumbnail');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button
      onClick={handleRefresh}
      disabled={isLoading || !liveUrl}
      className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
    >
      {isLoading ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          Refreshing...
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4" />
          Refresh Thumbnail
        </>
      )}
    </button>
  );
} 