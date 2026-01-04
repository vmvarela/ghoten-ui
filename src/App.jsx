import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthService } from './services/auth';
import { GitHubService } from './services/github';
import { LoginScreen } from './components/auth/LoginScreen';
import { CallbackHandler } from './components/auth/CallbackHandler';
import { ProjectList } from './components/projects/ProjectList';
import { ProjectDetail } from './components/projects/ProjectDetail';
import { WorkspaceDetail } from './components/workspaces/WorkspaceDetail';
import { LogOut } from 'lucide-react';

function Layout({ children, user, onLogout }) {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Ghoten UI</h1>
            {user && <span className="text-slate-400 text-sm">@{user.login}</span>}
          </div>

          {user && (
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

function ProtectedRoute({ children, isAuthenticated, userOrg }) {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [userOrg, setUserOrg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (AuthService.isAuthenticated()) {
          const github = new GitHubService();
          const currentUser = await github.getCurrentUser();
          const orgs = await github.getUserOrganizations();

          setUser(currentUser);
          setUserOrg(orgs[0]?.login || currentUser.login);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        AuthService.logout();
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-900" />;
  }

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL || '/ghoten-ui/'}>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/callback" element={<CallbackHandler />} />

        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/projects" replace /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/projects"
          element={
            <Layout user={user} onLogout={handleLogout}>
              <ProtectedRoute isAuthenticated={isAuthenticated} userOrg={userOrg}>
                <h1 className="text-3xl font-bold text-white mb-8">Projects</h1>
                {userOrg && <ProjectList organization={userOrg} userLogin={user?.login} />}
              </ProtectedRoute>
            </Layout>
          }
        />

        <Route
          path="/projects/:owner/:repo"
          element={
            <Layout user={user} onLogout={handleLogout}>
              <ProtectedRoute isAuthenticated={isAuthenticated} userOrg={userOrg}>
                <ProjectDetail />
              </ProtectedRoute>
            </Layout>
          }
        />

        <Route
          path="/projects/:owner/:repo/workspaces/:workspace"
          element={
            <Layout user={user} onLogout={handleLogout}>
              <ProtectedRoute isAuthenticated={isAuthenticated} userOrg={userOrg}>
                <WorkspaceDetail />
              </ProtectedRoute>
            </Layout>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
