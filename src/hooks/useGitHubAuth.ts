import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface GitHubAuthState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  username: string | null;
  providerToken: string | null;
  lastSyncedAt: string | null;
}

export function useGitHubAuth() {
  const [state, setState] = useState<GitHubAuthState>({
    isConnected: false,
    isLoading: true,
    error: null,
    username: null,
    providerToken: null,
    lastSyncedAt: null
  });

  const checkGitHubConnection = async () => {
    try {
      if (!supabase) throw new Error('Supabase client not initialized');

      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();

      if (!session || !user) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const isGitHubUser = user.app_metadata?.provider === 'github';
      const hasValidToken = !!session.provider_token;

      // Get additional GitHub info from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('github_username, github_last_sync_at')
        .eq('id', user.id)
        .single();

      setState({
        isConnected: isGitHubUser && hasValidToken,
        isLoading: false,
        error: null,
        username: profile?.github_username,
        providerToken: session.provider_token ?? null,
        lastSyncedAt: profile?.github_last_sync_at
      });
    } catch (err) {
      console.error('Error checking GitHub connection:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to check GitHub connection'
      }));
    }
  };

  useEffect(() => {
    checkGitHubConnection();
  }, []);

  return {
    ...state,
    refresh: checkGitHubConnection
  };
} 