/**
 * GitHub Container Registry (GHCR) Utilities
 * Build and parse GHCR paths for Terraform state
 */

export class GHCRService {
  /**
   * Build GHCR state path
   * Pattern: ghcr.io/{org}/tf-state.{repo-name}:{workspace-name}
   */
  static buildStatePath(org, repoName, workspace) {
    const safeName = repoName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const safeWorkspace = workspace.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    return `ghcr.io/${org}/tf-state.${safeName}:${safeWorkspace}`;
  }

  /**
   * Parse GHCR path to extract components
   */
  static parseStatePath(path) {
    const regex = /ghcr\.io\/([^/]+)\/tf-state\.([^:]+):(.+)/;
    const match = path.match(regex);
    
    if (!match) {
      throw new Error('Invalid GHCR state path format');
    }

    return {
      org: match[1],
      repo: match[2],
      workspace: match[3]
    };
  }

  /**
   * Format GHCR path for display
   */
  static formatPathForDisplay(path) {
    return path;
  }

  /**
   * Get registry URL from path
   */
  static getRegistryUrl(path) {
    const parts = path.split('/');
    if (parts[0] === 'ghcr.io') {
      return 'https://ghcr.io';
    }
    return null;
  }
}

export default GHCRService;
