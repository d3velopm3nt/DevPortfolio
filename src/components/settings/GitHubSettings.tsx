import React, { useState, useEffect } from 'react';
import { Github, Loader2, Check, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export function GitHubSettings() {
  const location = useLocation();
  const [profile, setProfile] = useState<{
    github_username: string | null;
    github_access_token: string | null;
    github_last_sync_at: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('github_username, github_access_token, github_last_sync_at')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load GitHub settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const { data: { url }, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          scopes: 'repo read:user',
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            state: JSON.stringify({ from: location.pathname })
          }
        }
      });

      if (error) throw error;
      if (url) window.location.href = url;
    } catch (err) {
      console.error('Error connecting GitHub:', err);
      setError('Failed to connect GitHub account');
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect your GitHub account?')) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({
          github_username: null,
          github_access_token: null,
          github_refresh_token: null,
          github_token_expires_at: null,
          github_last_sync_at: null
        })
        .eq('id', user.id);

      if (error) throw error;

      // Delete repositories
      await supabase
        .from('github_repositories')
        .delete()
        .eq('user_id', user.id);

      await fetchProfile();
    } catch (err) {
      console.error('Error disconnecting GitHub:', err);
      setError('Failed to disconnect GitHub account');
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch repositories from GitHub
      const response = await fetch('https://api.github.com/user/repos', {
        headers: {
          Authorization: `Bearer ${profile?.github_access_token}`,
          Accept: 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch repositories');

      const repos = await response.json();

      // Delete existing repositories
      await supabase
        .from('github_repositories')
        .delete()
        .eq('user_id', user.id);

      // Insert new repositories
      const { error: insertError } = await supabase
        .from('github_repositories')
        .insert(
          repos.map((repo: any) => ({
            user_id: user.id,
            github_id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            html_url: repo.html_url,
            language: repo.language,
            stargazers_count: repo.stargazers_count,
            forks_count: repo.forks_count,
            topics: repo.topics || []
          }))
        );

      if (insertError) throw insertError;

      // Update last sync time
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ github_last_sync_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await fetchProfile();
    } catch (err) {
      console.error('Error syncing repositories:', err);
      setError('Failed to sync GitHub repositories');
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">GitHub Integration</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Connect your GitHub account to import repositories and keep them in sync
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {profile?.github_username ? (
                  <>Connected as {profile.github_username}</>
                ) : (
                  'GitHub Account'
                )}
              </h3>
              {profile?.github_last_sync_at && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Last synced: {new Date(profile.github_last_sync_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {profile?.github_access_token ? (
              <>
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Sync Now
                    </>
                  )}
                </button>
                <button
                  onClick={handleDisconnect}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg"
                >
                  <X className="w-4 h-4" />
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={handleConnect}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600"
              >
                <Github className="w-4 h-4" />
                Connect GitHub
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}