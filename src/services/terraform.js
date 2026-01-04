/**
 * Terraform Output and Plan Parser
 * Parse Terraform plan and apply outputs
 */

export class TerraformParser {
  /**
   * Parse Terraform plan output to extract changes
   */
  static parsePlanOutput(output) {
    const changes = {
      toAdd: 0,
      toChange: 0,
      toDestroy: 0
    };

    // Simple regex patterns
    const addPattern = /(\d+) to add/;
    const changePattern = /(\d+) to change/;
    const destroyPattern = /(\d+) to destroy/;

    const addMatch = output.match(addPattern);
    const changeMatch = output.match(changePattern);
    const destroyMatch = output.match(destroyPattern);

    if (addMatch) changes.toAdd = parseInt(addMatch[1]);
    if (changeMatch) changes.toChange = parseInt(changeMatch[1]);
    if (destroyMatch) changes.toDestroy = parseInt(destroyMatch[1]);

    return changes;
  }

  /**
   * Extract resource changes from plan
   */
  static extractResourceChanges(output) {
    const resources = [];
    const lines = output.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for lines with resource type patterns
      if (line.includes('# ') && (line.includes('will be') || line.includes('must be'))) {
        const resource = {
          name: line.trim(),
          action: line.includes('created') ? 'create' : line.includes('destroyed') ? 'destroy' : 'update',
          index: i
        };
        resources.push(resource);
      }
    }

    return resources;
  }

  /**
   * Get summary from output
   */
  static getSummary(output) {
    const lines = output.split('\n');
    const lastNonEmpty = lines.reverse().find(l => l.trim());
    return lastNonEmpty || 'No summary available';
  }

  /**
   * Check if plan has errors
   */
  static hasErrors(output) {
    return output.toLowerCase().includes('error') ||
           output.toLowerCase().includes('failed');
  }

  /**
   * Extract error messages
   */
  static extractErrors(output) {
    const errors = [];
    const lines = output.split('\n');

    lines.forEach(line => {
      if (line.toLowerCase().includes('error:')) {
        errors.push(line.trim());
      }
    });

    return errors;
  }
}

export default TerraformParser;
