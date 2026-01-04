/**
 * GitHub OAuth and API Service
 * Handles authentication and all GitHub API interactions
 */

const GITHUB_API_URL = 'https://api.github.com';

export class GitHubService {
  constructor(token = null) {
    this.token = token || localStorage.getItem('github_token');
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Make authenticated API request to GitHub
   */
  async request(endpoint, options = {}) {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }

    const response = await fetch(`${GITHUB_API_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      localStorage.removeItem('github_token');
      throw new Error('Unauthorized: Token expired or invalid');
    }

    if (response.status === 403) {
      throw new Error('Forbidden: Check your permissions and rate limits');
    }

    if (response.status === 404) {
      throw new Error('Not found');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get cached data or fetch from API
   */
  async getCached(key, fn) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    const data = await fn();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * List repositories for an organization
   */
  async listOrgRepositories(org) {
    return this.getCached(`repos:${org}`, async () => {
      const repos = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const result = await this.request(`/orgs/${org}/repos?per_page=100&page=${page}&sort=updated&direction=desc`);
        repos.push(...result);
        hasMore = result.length === 100;
        page++;
      }

      return repos;
    });
  }

  /**
   * List repositories for the authenticated user (personal account, includes private)
   */
  async listUserRepositories(user) {
    return this.getCached(`user-repos:${user}`, async () => {
      const repos = [];
      let page = 1;
      let hasMore = true;
      const target = (user || '').toLowerCase();

      while (hasMore) {
        const result = await this.request(
          `/user/repos?per_page=100&page=${page}&affiliation=owner&visibility=all&sort=updated&direction=desc`
        );

        const owned = result.filter((r) => r.owner?.login?.toLowerCase() === target);
        repos.push(...owned);
        hasMore = result.length === 100;
        page++;
      }

      return repos;
    });
  }

  /**
   * Get file content from repository
   */
  async getFileContent(owner, repo, path) {
    try {
      const response = await this.request(`/repos/${owner}/${repo}/contents/${path}`);
      if (response.type !== 'file') {
        throw new Error('Not a file');
      }
      return atob(response.content);
    } catch (error) {
      throw new Error(`Failed to get file ${path}: ${error.message}`);
    }
  }

  /**
   * List files in a directory
   */
  async listDirectoryContents(owner, repo, path) {
    try {
      return await this.request(`/repos/${owner}/${repo}/contents/${path}`);
    } catch (error) {
      return [];
    }
  }

  /**
   * Dispatch a workflow
   */
  async dispatchWorkflow(owner, repo, workflowId, inputs = {}) {
    return this.request(`/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`, {
      method: 'POST',
      body: JSON.stringify({
        ref: 'main',
        inputs
      })
    });
  }

  /**
   * List workflow runs for a repository
   */
  async listWorkflowRuns(owner, repo, limit = 10) {
    const response = await this.request(`/repos/${owner}/${repo}/actions/runs?per_page=${limit}`);
    return response.workflow_runs || [];
  }

  /**
   * Get workflow run logs
   */
  async getWorkflowRunLogs(owner, repo, runId) {
    try {
      const response = await fetch(
        `${GITHUB_API_URL}/repos/${owner}/${repo}/actions/runs/${runId}/logs`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            ...(this.token ? { 'Authorization': `token ${this.token}` } : {})
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      throw new Error(`Error fetching logs: ${error.message}`);
    }
  }

  /**
   * Get authenticated user info
   */
  async getCurrentUser() {
    return this.request('/user');
  }

  /**
   * Get list of organizations for user
   */
  async getUserOrganizations() {
    return this.request('/user/orgs');
  }

  /**
   * Check if organization exists and is accessible
   */
  async getOrganization(org) {
    try {
      return await this.request(`/orgs/${org}`);
    } catch (error) {
      throw new Error(`Organization not found or not accessible: ${org}`);
    }
  }
}

export default GitHubService;
