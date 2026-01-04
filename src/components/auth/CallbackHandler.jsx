import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitHubService } from '../../services/github';
import { AuthService } from '../../services/auth';
import { AlertCircle, Loader } from 'lucide-react';

export function CallbackHandler() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract params from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');

        if (!code) {
          throw new Error('No authorization code received');
        }

        if (!AuthService.verifyState(state)) {
          throw new Error('State mismatch - possible CSRF attack');
        }

        // Exchange code for token using a backend endpoint
        // For now, we'll use a simplified approach - in production,
        // this would go through a backend to keep client secret secure
        const response = await fetch('/.netlify/functions/github-callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        }).catch(() => {
          // Fallback: if no backend, show instructions
          throw new Error(
            'Please set up a backend to exchange OAuth code for token. ' +
            'See SETUP.md for instructions.'
          );
        });

        if (!response.ok) {
          throw new Error('Failed to exchange code for token');
        }

        const { token } = await response.json();
        if (!token) {
          throw new Error('No token received from backend');
        }

        // Save token and verify it works
        AuthService.saveToken(token);
        
        // Test token
        const github = new GitHubService(token);
        await github.getCurrentUser();

        // Redirect to projects
        navigate('/projects');
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err.message);
        setLoading(false);

        // Auto-redirect to login after 5 seconds
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      }
    };

    handleCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-white text-lg">Processing authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <h1 className="text-xl font-bold text-white">Authentication Error</h1>
        </div>
        <p className="text-slate-300 mb-4">{error}</p>
        <p className="text-slate-400 text-sm">
          Redirecting you back to login in 5 seconds...
        </p>
      </div>
    </div>
  );
}

export default CallbackHandler;
