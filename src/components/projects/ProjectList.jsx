import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitHubService } from '../../services/github';
import { ConfigParser } from '../../services/configParser';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { EmptyState } from '../shared/EmptyState';
import { Folder, ExternalLink } from 'lucide-react';

export function ProjectList({ organization, userLogin }) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const github = new GitHubService();
        const projectsList = [];

        const seen = new Set();

        const collectProjects = async (repos) => {
          for (const repo of repos) {
            try {
              const configContent = await github.getFileContent(
                repo.owner.login,
                repo.name,
                '.ghoten/project.yaml'
              );
              const config = ConfigParser.parseProjectConfig(configContent);
              if (ConfigParser.validate(config, 'project')) {
                const key = `${repo.owner.login}/${repo.name}`;
                if (!seen.has(key)) {
                  seen.add(key);
                  projectsList.push({
                    ...config,
                    repo: repo.name,
                    owner: repo.owner.login,
                    description: repo.description || config.description,
                    url: repo.html_url
                  });
                }
              }
            } catch (err) {
              // Not a Terraform project, skip
            }
          }
        };

        // 1) Try org repos if provided
        if (organization) {
          try {
            const orgRepos = await github.listOrgRepositories(organization);
            await collectProjects(orgRepos);
          } catch (orgErr) {
            // ignore, we'll try user next
          }
        }

        // 2) Always try user-owned repos (covers personal accounts or empty orgs)
        if (userLogin) {
          const userRepos = await github.listUserRepositories(userLogin);
          await collectProjects(userRepos);
        }

        setProjects(projectsList);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (organization || userLogin) {
      loadProjects();
    }
  }, [organization, userLogin]);

  if (loading) {
    return <LoadingSpinner message="Scanning repositories for Terraform projects..." />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={Folder}
        title="No Terraform Projects Found"
        message="No repositories with .ghoten/project.yaml configuration found in your organization."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <div
          key={`${project.owner}/${project.repo}`}
          className="bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors overflow-hidden cursor-pointer group"
          onClick={() => navigate(`/projects/${project.owner}/${project.repo}`)}
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <Folder className="w-8 h-8 text-blue-400" />
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ExternalLink className="w-4 h-4 text-slate-400 hover:text-white" />
              </a>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2">{project.name}</h3>
            <p className="text-slate-400 text-sm mb-4 line-clamp-2">
              {project.description || 'No description'}
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{project.repo}</span>
              <span>•</span>
              <span>{project.workspaces?.length || 0} workspaces</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProjectList;
