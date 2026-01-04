import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GitHubService } from '../../services/github';
import { ConfigParser } from '../../services/configParser';
import { RedactionService } from '../../services/redaction';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { StatusBadge } from '../shared/StatusBadge';
import { ChevronLeft, Play, LogSquare } from 'lucide-react';

export function WorkspaceDetail() {
  const { owner, repo, workspace } = useParams();
  const navigate = useNavigate();
  const [workspaceConfig, setWorkspaceConfig] = useState(null);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        setLoading(true);
        const github = new GitHubService();

        // Load workspace config
        const wsContent = await github.getFileContent(
          owner,
          repo,
          `.ghoten/workspaces/${workspace}.yaml`
        );
        const wsConfig = ConfigParser.parseWorkspaceConfig(wsContent);

        // Load workflow runs
        const runs = await github.listWorkflowRuns(owner, repo, 10);
        setWorkspaceConfig(wsConfig);
        setRuns(runs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (owner && repo && workspace) {
      loadWorkspace();
    }
  }, [owner, repo, workspace]);

  if (loading) {
    return <LoadingSpinner message="Loading workspace details..." />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/projects/${owner}/${repo}`)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Project
        </button>

        <h1 className="text-3xl font-bold text-white mb-2">{workspace}</h1>
        <p className="text-slate-400">{workspaceConfig?.description || 'No description'}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-700">
        {['overview', 'runs', 'variables', 'settings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Workspace Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-sm">Environment</p>
                <p className="text-white font-medium">{workspaceConfig?.environment || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Status</p>
                <StatusBadge status="success" />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
              <Play className="w-4 h-4" />
              Plan
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <Play className="w-4 h-4" />
              Apply
            </button>
          </div>
        </div>
      )}

      {activeTab === 'runs' && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Recent Runs</h2>
          {runs.length === 0 ? (
            <p className="text-slate-400">No runs yet</p>
          ) : (
            <div className="space-y-2">
              {runs.map((run) => (
                <div key={run.id} className="bg-slate-800 rounded-lg border border-slate-700 p-4 flex items-center justify-between hover:border-blue-500 transition-colors cursor-pointer">
                  <div>
                    <p className="text-white font-medium">{run.name}</p>
                    <p className="text-slate-400 text-sm">
                      {new Date(run.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={run.conclusion || 'in_progress'} />
                    <LogSquare className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'variables' && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Variables</h2>
          {Object.keys(workspaceConfig?.variables || {}).length === 0 ? (
            <p className="text-slate-400">No variables configured</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(workspaceConfig.variables).map(([key, value]) => (
                <div key={key} className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                  <p className="text-white font-mono text-sm">{key}</p>
                  <p className="text-slate-400 font-mono text-sm">
                    {RedactionService.redactVariable(key, value)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Settings</h2>
          <p className="text-slate-400">No settings available yet</p>
        </div>
      )}
    </div>
  );
}

export default WorkspaceDetail;
