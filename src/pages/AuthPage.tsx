import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseReady } from '../lib/supabase';
import { Lock, Mail, Loader2, Github } from 'lucide-react';

export function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkGitHubConnection = async () => {
      const response = await supabase?.auth.getSession();
      const session = response?.data?.session;
      setIsGitHubConnected(!!session?.provider_token && session?.user?.app_metadata?.provider === 'github');
    };

    checkGitHubConnection();
  }, []);

  if (!isSupabaseReady || !supabase) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Please click the "Connect to Supabase" button in the top right to set up your Supabase project.
        </p>
      </div>
    );
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = isSignUp
        ? await supabase?.auth.signUp({ email, password })
        : await supabase?.auth.signInWithPassword({ email, password });
      if (!response) throw new Error('Supabase client not initialized');

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubAuth = async () => {
    try {
      const redirectUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5173/auth/callback'
        : `${window.location.origin}/auth/callback`;

      const response = await supabase?.auth.signInWithOAuth({
        provider: 'github',
        options: {
          scopes: 'repo read:user',
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
        }
      });
      
      if (!response) throw new Error('Supabase client not initialized');
      if (response.error) throw response.error;
      if (response.data.url) window.location.href = response.data.url;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with GitHub');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* GitHub Sign In Button */}
            <button
              onClick={handleGitHubAuth}
              className="w-full flex items-center justify-center gap-3 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600"
            >
              <Github className="w-5 h-5" />
              {isGitHubConnected ? 'GitHub Connected' : 'Continue with GitHub'}
            </button>

            {isGitHubConnected && (
              <p className="text-sm text-green-600 dark:text-green-400 text-center">
                ✓ GitHub account connected
              </p>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}