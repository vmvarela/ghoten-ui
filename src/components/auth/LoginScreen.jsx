import React, { useEffect, useState } from 'react';
import { AuthService } from '../../services/auth';
import { Github, Clock } from 'lucide-react';

export function LoginScreen() {
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(false);
  const [intervalSeconds, setIntervalSeconds] = useState(5);
  const [manualMode, setManualMode] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [manualError, setManualError] = useState(null);

  const startFlow = async () => {
    try {
      setError(null);
      setPolling(false);
      const info = await AuthService.startDeviceFlow();
      setDeviceInfo(info);
      setIntervalSeconds(info.interval || 5);
      window.open(info.verification_uri, '_blank');
      setPolling(true);
    } catch (err) {
      setError(err.message || 'Failed to start login (device flow)');
    }
  };

  useEffect(() => {
    let timer;
    const poll = async () => {
      if (!deviceInfo || !polling) return;
      try {
        const result = await AuthService.pollDeviceFlow(deviceInfo.device_code, intervalSeconds);
        if (result.pending) {
          timer = setTimeout(poll, (result.interval || intervalSeconds) * 1000);
          return;
        }
        if (result.token) {
          AuthService.saveToken(result.token);
          window.location.href = `${import.meta.env.BASE_URL || '/ghoten-ui/'}projects`;
        }
      } catch (err) {
        setError(err.message);
        setPolling(false);
      }
    };

    if (polling && deviceInfo) {
      timer = setTimeout(poll, intervalSeconds * 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [polling, deviceInfo, intervalSeconds]);

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
              Manage your Terraform infrastructure with a modern web interface. Authenticate with GitHub to get started.
            </p>
          </div>

          {!deviceInfo && !manualMode && (
            <div className="space-y-3">
              <button
                onClick={startFlow}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <Github className="w-5 h-5" />
                Login with GitHub (Device Flow)
              </button>
              <button
                onClick={() => { setManualMode(true); setManualError(null); setError(null); }}
                className="w-full text-sm text-slate-300 underline decoration-dashed decoration-slate-500 hover:text-white"
              >
                Or paste a Personal Access Token manually
              </button>
            </div>
          )}

          {deviceInfo && (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
              <p className="text-slate-300 text-sm mb-2">Step 1: Open GitHub</p>
              <p className="text-slate-400 text-xs mb-3">We opened a new tab. If not, click below:</p>
              <a
                href={deviceInfo.verification_uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                {deviceInfo.verification_uri}
              </a>

              <div className="mt-4">
                <p className="text-slate-300 text-sm mb-1">Step 2: Enter this code</p>
                <div className="font-mono text-xl text-white bg-slate-800 px-4 py-2 rounded border border-slate-700 inline-block">
                  {deviceInfo.user_code}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-slate-400 text-sm">
                <Clock className="w-4 h-4" />
                Waiting for authorization...
              </div>
            </div>
          )}

          {manualMode && (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 space-y-3">
              <p className="text-slate-300 text-sm">Paste a fine-grained Personal Access Token with scopes:</p>
              <ul className="list-disc list-inside text-slate-400 text-sm">
                <li>repo</li>
                <li>workflow</li>
                <li>read:packages</li>
                <li>read:org</li>
              </ul>
              <textarea
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white font-mono"
                placeholder="ghp_..."
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setManualMode(false);
                    setManualToken('');
                    setManualError(null);
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!manualToken.trim()) {
                      setManualError('Token is required');
                      return;
                    }
                    AuthService.saveToken(manualToken.trim());
                    window.location.href = `${import.meta.env.BASE_URL || '/ghoten-ui/'}projects`;
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Save token
                </button>
              </div>
              {manualError && (
                <div className="p-2 rounded bg-red-900/30 border border-red-700 text-red-200 text-sm">
                  {manualError}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 rounded bg-red-900/30 border border-red-700 text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3 text-sm text-slate-400">
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

        <div className="mt-8 text-center text-xs text-slate-500">
          <p>
            By logging in, you agree to GitHub OAuth permissions:<br />
            repo, workflow, read:packages, read:org
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
