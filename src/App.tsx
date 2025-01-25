import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { TimelinePage } from './pages/TimelinePage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectProfilePage } from './pages/ProjectProfilePage';
import { TechnologyProfilePage } from './pages/TechnologyProfilePage';
import { TechStackProfilePage } from './pages/TechStackProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { GitHubRepositoriesPage } from './pages/GitHubRepositoriesPage';
import { RepositoryProfilePage } from './pages/RepositoryProfilePage';
import { ThemeProvider } from './context/ThemeContext';
import { useAuthStore } from './store/authStore';
import { supabase, isSupabaseReady } from './lib/supabase';
import { TechFeedPage } from './pages/TechFeedPage';

// Auth callback handler component
function AuthCallback() {
  const navigate = useNavigate();
  const setUser = useAuthStore(state => state.setUser);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (!supabase) throw new Error('Supabase client not initialized');
        const response = await supabase?.auth.getSession();
        if (!response) throw new Error('Supabase client not initialized');
        
        const { data: { session }, error } = response;
        
        if (error) throw error;
        
        if (session) {
          setUser(session.user);

          // Store GitHub token if present
          if (session.provider_token) {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                github_access_token: session.provider_token,
                github_username: session.user.user_metadata.user_name,
                github_last_sync_at: new Date().toISOString()
              })
              .eq('id', session.user.id);

            if (updateError) {
              console.error('Error storing GitHub token:', updateError);
            }
          }

          navigate('/dashboard', { replace: true });
        } else {
          navigate('/auth', { replace: true });
        }
      } catch (err) {
        console.error('Error handling auth callback:', err);
        navigate('/auth', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Authenticating...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we complete the authentication process.
        </p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  
  if (!isSupabaseReady) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 p-4 text-center">
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Please click the "Connect to Supabase" button in the top right to set up your Supabase project.
        </p>
      </div>
    );
  }
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  return <>{children}</>;
}

export default function App() {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    if (!isSupabaseReady) return;

    // Get initial session
    supabase?.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase!.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
          <Navigation />
          
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route 
                path="/auth" 
                element={
                  isSupabaseReady 
                    ? <AuthPage /> 
                    : <div className="min-h-[60vh] flex items-center justify-center">
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                          Please click the "Connect to Supabase" button in the top right to set up your Supabase project.
                        </p>
                      </div>
                } 
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications"
                element={
                  <ProtectedRoute>
                    <ApplicationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications/:id"
                element={
                  <ProtectedRoute>
                    <ProjectsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <ProjectsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/:id"
                element={
                  <ProtectedRoute>
                    <ProjectProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/github/repositories"
                element={
                  <ProtectedRoute>
                    <GitHubRepositoriesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/github/repositories/:id"
                element={
                  <ProtectedRoute>
                    <RepositoryProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/timeline"
                element={
                  <ProtectedRoute>
                    <TimelinePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/technology/:techName"
                element={
                  <ProtectedRoute>
                    <TechnologyProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/tech-stacks/new"
                element={
                  <ProtectedRoute>
                    <TechStackProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/tech-stacks/:id"
                element={
                  <ProtectedRoute>
                    <TechStackProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/feed"
                element={
                  <ProtectedRoute>
                    <TechFeedPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <p className="text-center text-gray-600 dark:text-gray-400">
                © {new Date().getFullYear()} DevFolio. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </ThemeProvider>
  );
}