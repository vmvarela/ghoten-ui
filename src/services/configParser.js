/**
 * YAML Configuration Parser
 * Parses .ghoten/project.yaml and workspace configs
 */

import YAML from 'js-yaml';

export class ConfigParser {
  /**
   * Parse project configuration from YAML
   */
  static parseProjectConfig(yamlContent) {
    try {
      const config = YAML.load(yamlContent);
      return {
        name: config.name || 'Unknown Project',
        description: config.description || '',
        workspaces: config.workspaces || [],
        backend: config.backend || {},
        variables: config.variables || {}
      };
    } catch (error) {
      throw new Error(`Failed to parse project config: ${error.message}`);
    }
  }

  /**
   * Parse workspace configuration from YAML
   */
  static parseWorkspaceConfig(yamlContent) {
    try {
      const config = YAML.load(yamlContent);
      return {
        name: config.name || 'Unknown Workspace',
        description: config.description || '',
        variables: config.variables || {},
        backend: config.backend || {},
        environment: config.environment || 'development'
      };
    } catch (error) {
      throw new Error(`Failed to parse workspace config: ${error.message}`);
    }
  }

  /**
   * Validate that config has required fields
   */
  static validate(config, type = 'project') {
    if (type === 'project') {
      return config.name && Array.isArray(config.workspaces);
    } else if (type === 'workspace') {
      return config.name;
    }
    return true;
  }
}

export default ConfigParser;
