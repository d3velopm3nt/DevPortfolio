import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, ArrowLeft, Plus, Loader2, Star, GitFork, Code2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useGitHubAuth } from '../hooks/useGitHubAuth';

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  private: boolean;
}

export function GitHubRepositoriesPage() {
  const navigate = useNavigate();
  const { isConnected, isLoading: isAuthLoading, error: authError, providerToken } = useGitHubAuth();
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthLoading && isConnected && providerToken) {
      setIsLoading(true);
      fetchGitHubRepositories();
    }
  }, [isAuthLoading, isConnected, providerToken]);

  const fetchGitHubRepositories = async () => {
    try {
      if (!providerToken) {
        throw new Error('GitHub token not found');
      }

      const response = await fetch('https://api.github.com/user/repos?per_page=100', {
        headers: {
          Authorization: `Bearer ${providerToken}`,
          Accept: 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch repositories from GitHub');
      }

      const repos = await response.json();
      setRepositories(repos);
      setError(null);
    } catch (err) {
      console.error('Error fetching GitHub repositories:', err);
      setError('Failed to load repositories from GitHub');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportRepository = async (repo: GitHubRepository) => {
    setIsImporting(repo.id);
    setError(null);

    try {
      if (!supabase) throw new Error('Supabase client not initialized');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First save repository to our database
      const { error: repoError } = await supabase
        .from('github_repositories')
        .insert([{
          user_id: user.id,
          github_id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          html_url: repo.html_url,
          language: repo.language,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          topics: repo.topics,
          is_private: repo.private
        }]);

      if (repoError) throw repoError;

      // Then create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([{
          user_id: user.id,
          title: repo.name,
          description: repo.description || `Imported from GitHub: ${repo.full_name}`,
          github_url: repo.html_url
        }])
        .select()
        .single();

      if (projectError) throw projectError;

      // Add language as a technology if it exists
      if (repo.language) {
        const { data: tech, error: techError } = await supabase
          .from('technologies')
          .select('id')
          .eq('name', repo.language)
          .single();

        if (!techError && tech) {
          await supabase
            .from('project_technologies')
            .insert([{
              project_id: project.id,
              technology_id: tech.id
            }]);
        }
      }

      navigate(`/projects/${project.id}`);
    } catch (err) {
      console.error('Error importing repository:', err);
      setError('Failed to import repository');
    } finally {
      setIsImporting(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header - Always visible */}
      <div>
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Projects
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                GitHub Repositories
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Import your GitHub repositories as projects
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      {/* Content area with loading states */}
      {(isAuthLoading || isLoading) ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {repositories.map((repo) => (
            <div
              key={repo.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {repo.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {repo.description || repo.full_name}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => handleImportRepository(repo)}
                    disabled={isImporting === repo.id}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {isImporting === repo.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Import
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                {repo.language && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Code2 className="w-4 h-4" />
                    {repo.language}
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Star className="w-4 h-4" />
                  {repo.stargazers_count}
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <GitFork className="w-4 h-4" />
                  {repo.forks_count}
                </div>
              </div>

              {repo.topics && repo.topics.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {repo.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {repositories.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              No repositories found. Connect your GitHub account to import repositories.
            </div>
          )}
        </div>
      )}
    </div>
  );
}