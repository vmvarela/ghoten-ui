import React from 'react';
import { AuthService } from '../../services/auth';
import { Github } from 'lucide-react';

export function LoginScreen() {
  const handleLogin = () => {
    const authUrl = AuthService.getAuthorizationUrl();
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full mb-6">
            <Github className="w-10 h-10 text-slate-900" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Ghoten UI</h1>
          <p className="text-slate-400 text-lg">
            Terraform Cloud Interface for OpenTofu with ORAS Backend
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome</h2>
          <p className="text-slate-400 mb-8">
            Manage your Terraform infrastructure with a modern web interface. Authenticate with GitHub to get started.
          </p>

          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            <Github className="w-5 h-5" />
            Login with GitHub
          </button>

          <div className="mt-8 space-y-4 text-sm text-slate-400">
            <div>
              <h3 className="font-semibold text-white mb-2">What you can do:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Manage Terraform projects</li>
                <li>View workspaces</li>
                <li>Trigger plan/apply operations</li>
                <li>Monitor infrastructure changes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <p>
            By logging in, you agree to our GitHub OAuth permissions for:<br />
            repo, workflow, read:packages, read:org
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
