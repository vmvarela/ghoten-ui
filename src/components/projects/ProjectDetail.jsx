import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GitHubService } from '../../services/github';
import { ConfigParser } from '../../services/configParser';
import { GHCRService } from '../../services/ghcr';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { ChevronLeft, Package } from 'lucide-react';

export function ProjectDetail() {
  const { owner, repo } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        const github = new GitHubService();

        // Load project config
        const configContent = await github.getFileContent(owner, repo, '.ghoten/project.yaml');
        const config = ConfigParser.parseProjectConfig(configContent);

        // Load workspace configs
        const workspaceList = [];
        for (const wsName of (config.workspaces || [])) {
          try {
            const wsContent = await github.getFileContent(
              owner,
              repo,
              `.ghoten/workspaces/${wsName}.yaml`
            );
            const wsConfig = ConfigParser.parseWorkspaceConfig(wsContent);
            workspaceList.push({
              ...wsConfig,
              name: wsName,
              statePath: GHCRService.buildStatePath(owner, repo, wsName)
            });
          } catch (err) {
            console.warn(`Failed to load workspace ${wsName}:`, err);
          }
        }

        setProject({
          ...config,
          owner,
          repo
        });
        setWorkspaces(workspaceList);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (owner && repo) {
      loadProject();
    }
  }, [owner, repo]);

  if (loading) {
    return <LoadingSpinner message="Loading project details..." />;
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
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Projects
        </button>

        <h1 className="text-3xl font-bold text-white mb-2">{project?.name}</h1>
        <p className="text-slate-400">{project?.description || 'No description'}</p>
        <p className="text-slate-500 text-sm mt-2">
          {owner}/{repo}
        </p>
      </div>

      {/* Workspaces */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6">Workspaces ({workspaces.length})</h2>

        {workspaces.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No Workspaces Found"
            message="This project has no workspaces configured in .ghoten/workspaces/"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workspaces.map((ws) => (
              <div
                key={ws.name}
                className="bg-slate-800 rounded-lg border border-slate-700 p-6 cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => navigate(`/projects/${owner}/${repo}/workspaces/${ws.name}`)}
              >
                <h3 className="text-lg font-bold text-white mb-2">{ws.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{ws.description || 'No description'}</p>

                <div className="space-y-2 text-xs text-slate-500">
                  <div>
                    <span className="text-slate-400">Environment:</span> {ws.environment || 'N/A'}
                  </div>
                  <div className="break-all">
                    <span className="text-slate-400">State:</span>
                    <br />
                    <code className="text-slate-300 bg-slate-900 px-2 py-1 rounded">
                      {ws.statePath}
                    </code>
                  </div>
                  {Object.keys(ws.variables || {}).length > 0 && (
                    <div>
                      <span className="text-slate-400">Variables:</span> {Object.keys(ws.variables).length}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectDetail;
