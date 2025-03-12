import React, { useState, useEffect } from "react";
import {
  Github,
  Loader2,
  Check,
  X,
  User,
  Link as LinkIcon,
  MapPin,
  Calendar,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useGitHubAuth } from "../../hooks/useGitHubAuth";

interface GitHubUser {
  avatar_url: string;
  name: string | null;
  login: string;
  bio: string | null;
  location: string | null;
  blog: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export function GitHubSettings() {
  const location = useLocation();
  const {
    isConnected,
    isLoading,
    error: authError,
    username,
    lastSyncedAt,
    refresh,
  } = useGitHubAuth();

  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);

    try {
      if (!supabase) throw new Error("Supabase client not initialized");
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.provider_token) {
        // Need to reconnect to GitHub
        setError("Please reconnect your GitHub account to sync repositories");
        return;
      }

      // Fetch repositories from GitHub using the provider_token
      const response = await fetch(
        "https://api.github.com/user/repos?per_page=100",
        {
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
            Accept: "application/vnd.github.v3+json",
          },
        },
      );

      if (!response.ok) {
        console.error("GitHub API Error:", await response.text());
        throw new Error("Failed to fetch repositories");
      }

      const repos = await response.json();
      console.log("Fetched repositories:", repos);

      // Delete existing repositories
      await supabase
        .from("github_repositories")
        .delete()
        .eq("user_id", session.user.id);

      if (repos.length > 0) {
        // Insert new repositories
        const { error: insertError } = await supabase
          .from("github_repositories")
          .insert(
            repos.map((repo: any) => ({
              user_id: session.user.id,
              github_id: repo.id,
              name: repo.name,
              full_name: repo.full_name,
              description: repo.description,
              html_url: repo.html_url,
              language: repo.language,
              stargazers_count: repo.stargazers_count,
              forks_count: repo.forks_count,
              topics: repo.topics || [],
              is_private: repo.private,
            })),
          );

        if (insertError) throw insertError;
      }

      // Update last sync time
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ github_last_sync_at: new Date().toISOString() })
        .eq("id", session.user.id);

      if (updateError) throw updateError;

      await refresh(); // Refresh GitHub connection state after sync
    } catch (err) {
      console.error("Error syncing repositories:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to sync GitHub repositories",
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConnect = async () => {
    try {
      if (!supabase) throw new Error("Supabase client not initialized");
      const {
        data: { url },
        error,
      } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          scopes: "repo read:user",
          redirectTo: `${window.location.origin}/auth/callback`,
          // queryParams: {
          //   state: JSON.stringify({ from: location.pathname })
          // }
        },
      });

      if (error) throw error;
      if (url) window.location.href = url;
    } catch (err) {
      console.error("Error connecting GitHub:", err);
      setError("Failed to connect GitHub account");
    }
  };

  const handleDisconnect = async () => {
    if (
      !window.confirm(
        "Are you sure you want to disconnect your GitHub account?",
      )
    )
      return;

    try {
      if (!supabase) throw new Error("Supabase client not initialized");
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          github_username: null,
          github_access_token: null,
          github_refresh_token: null,
          github_token_expires_at: null,
          github_last_sync_at: null,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Delete repositories
      await supabase
        .from("github_repositories")
        .delete()
        .eq("user_id", user.id);

      await refresh();
    } catch (err) {
      console.error("Error disconnecting GitHub:", err);
      setError("Failed to disconnect GitHub account");
    }
  };

  useEffect(() => {
    const fetchGitHubUser = async () => {
      if (!isConnected || !supabase) return;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.provider_token) return;

        const response = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
            Accept: "application/vnd.github.v3+json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch GitHub user");
        const userData = await response.json();
        setGithubUser(userData);
      } catch (err) {
        console.error("Error fetching GitHub user:", err);
      }
    };

    fetchGitHubUser();
  }, [isConnected]);

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
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          GitHub Integration
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Connect your GitHub account to import repositories and keep them in
          sync
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-[#232529] rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {githubUser?.avatar_url ? (
              <img
                src={githubUser.avatar_url}
                alt={`${githubUser.login}'s avatar`}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="p-3 rounded-xl bg-gray-100 dark:bg-[#2A2D35] text-gray-900 dark:text-white">
                <Github className="w-10 h-10" />
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {isConnected ? <>Connected as @{username}</> : "GitHub Account"}
              </h3>
              {isConnected && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✓ Connected
                </p>
              )}
              {lastSyncedAt && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Last synced: {new Date(lastSyncedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isConnected ? (
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
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-[#2A2D35] text-white rounded-lg hover:bg-gray-800"
              >
                <Github className="w-4 h-4" />
                Connect GitHub
              </button>
            )}
          </div>
        </div>

        {/* GitHub User Info Section */}
        {githubUser && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {githubUser.name && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    <span>{githubUser.name}</span>
                  </div>
                )}
                {githubUser.location && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{githubUser.location}</span>
                  </div>
                )}
                {githubUser.blog && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <LinkIcon className="w-4 h-4" />
                    <a
                      href={
                        githubUser.blog.startsWith("http")
                          ? githubUser.blog
                          : `https://${githubUser.blog}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {githubUser.blog}
                    </a>
                  </div>
                )}
                {githubUser.created_at && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Joined{" "}
                      {new Date(githubUser.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-xl font-semibold text-gray-900 dark:text-white">
                    {githubUser.public_repos}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Repositories
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold text-gray-900 dark:text-white">
                    {githubUser.followers}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Followers
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold text-gray-900 dark:text-white">
                    {githubUser.following}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Following
                  </div>
                </div>
              </div>
            </div>
            {githubUser.bio && (
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                {githubUser.bio}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
