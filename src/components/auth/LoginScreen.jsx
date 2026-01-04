import React, { useState } from 'react';
import { AuthService } from '../../services/auth';
import { GitHubService } from '../../services/github';
import { Github, Key } from 'lucide-react';

export function LoginScreen() {
  const [token, setToken] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!token.trim()) {
      setError('Token is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Verify token works
      const github = new GitHubService(token.trim());
      await github.getCurrentUser();
      
      // Save and redirect
      AuthService.saveToken(token.trim());
      window.location.href = `${import.meta.env.BASE_URL || '/ghoten-ui/'}projects`;
    } catch (err) {
      setError('Invalid token or insufficient permissions');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full mb-6">
            <Github className="w-10 h-10 text-slate-900" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Ghoten UI</h1>
          <p className="text-slate-400 text-lg">
            Terraform Cloud Interface for OpenTofu with ORAS Backend
          </p>
        </div>

        <div className="bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome</h2>
            <p className="text-slate-400">
              Enter your GitHub Personal Access Token to get started.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Key className="w-4 h-4 inline mr-2" />
                Personal Access Token
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                disabled={loading}
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
            >
              <Github className="w-5 h-5" />
              {loading ? 'Verifying...' : 'Login'}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded bg-red-900/30 border border-red-700 text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="border-t border-slate-700 pt-4">
            <p className="text-sm text-slate-400 mb-2">Required scopes:</p>
            <div className="flex flex-wrap gap-2">
              {['repo', 'workflow', 'read:packages', 'read:org'].map((scope) => (
                <span key={scope} className="px-2 py-1 bg-slate-900 rounded text-xs text-slate-300 font-mono">
                  {scope}
                </span>
              ))}
            </div>
            <a
              href="https://github.com/settings/tokens/new?scopes=repo,workflow,read:packages,read:org&description=Ghoten%20UI"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-blue-400 hover:text-blue-300 text-sm"
            >
              Create a new token →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
