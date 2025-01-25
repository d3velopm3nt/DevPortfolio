import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Github, ArrowLeft, Loader2, Star, GitFork, Code2, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ReactMarkdown from 'react-markdown';
import { useGitHubAuth } from '../hooks/useGitHubAuth';

interface Repository {
  id: string;
  github_id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  readme_content?: string;
  dependencies?: Record<string, string>;
  project_id?: string;
}

export function RepositoryProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isConnected, providerToken, username } = useGitHubAuth();
  const [repository, setRepository] = useState<Repository | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepository = async () => {
      try {
        if (!isConnected || !providerToken) {
          throw new Error('GitHub not connected');
        }
        if (!supabase) throw new Error('Supabase client not initialized');
        // First get the repository details from our database
        const { data: repoData, error: dbError } = await supabase
          .from('github_repositories')
          .select('*')
          .eq('id', id)
          .single();

        if (dbError) throw new Error('Repository not found in database');

        // Then fetch fresh data from GitHub API using the full_name
        const response = await fetch(`https://api.github.com/repos/${repoData.full_name}`, {
          headers: {
            Authorization: `token ${providerToken}`,
            Accept: 'application/vnd.github.v3+json'
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Repository not found on GitHub');
          }
          if (response.status === 401) {
            throw new Error('GitHub authentication failed. Please reconnect your GitHub account.');
          }
          throw new Error(`GitHub API error: ${response.status}`);
        }

        const data = await response.json();
        setRepository(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching repository:', err);
        setError(err instanceof Error ? err.message : 'Failed to load repository');
      } finally {
        setIsLoading(false);
      }
    };

    if (id && isConnected && providerToken) {
      fetchRepository();
    }
  }, [id, isConnected, providerToken]);

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">
          Please connect your GitHub account to view repositories
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="font-medium">Error:</span>
          {error}
        </div>
      </div>
    );
  }

  if (!repository) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">Repository not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <button
          onClick={() => navigate('/github/repositories')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Repositories
        </button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {repository.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {repository.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800"
            >
              <Github className="w-4 h-4" />
              View on GitHub
            </a>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          {repository.language && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Code2 className="w-4 h-4" />
              {repository.language}
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Star className="w-4 h-4" />
            {repository.stargazers_count}
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <GitFork className="w-4 h-4" />
            {repository.forks_count}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {repository.readme_content && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 prose dark:prose-invert max-w-none">
              <ReactMarkdown>{repository.readme_content}</ReactMarkdown>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {repository.dependencies && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Dependencies
              </h2>
              <div className="space-y-2">
                {Object.entries(repository.dependencies).map(([name, version]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-900 dark:text-white">{name}</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {version}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {repository.topics?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Topics
              </h2>
              <div className="flex flex-wrap gap-2">
                {repository.topics.map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 