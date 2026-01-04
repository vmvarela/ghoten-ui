/**
 * Data Redaction Utility
 * Redact sensitive information from logs and outputs
 */

const SENSITIVE_PATTERNS = [
  /password\s*[:=]\s*[^\s]+/gi,
  /token\s*[:=]\s*[^\s]+/gi,
  /secret\s*[:=]\s*[^\s]+/gi,
  /api[_-]?key\s*[:=]\s*[^\s]+/gi,
  /aws[_-]?(?:access|secret)[_-]?key\s*[:=]\s*[^\s]+/gi,
  /authorization\s*[:=]\s*[^\s]+/gi,
  /bearer\s+[^\s]+/gi,
  /private[_-]?key\s*[:=]\s*[^\s]+/gi,
  /certificate\s*[:=]\s*[^\s]+/gi,
  /oauth[_-]?token\s*[:=]\s*[^\s]+/gi,
  /"value":\s*"[^"]*(?:password|token|secret|key)[^"]*"/gi,
  /value\s*=\s*"[^"]*(?:password|token|secret|key)[^"]*"/gi
];

export class RedactionService {
  /**
   * Redact sensitive data from text
   */
  static redact(text) {
    if (!text) return text;

    let redacted = text;

    // Apply all patterns
    SENSITIVE_PATTERNS.forEach(pattern => {
      redacted = redacted.replace(pattern, (match) => {
        // Keep the prefix, redact the value
        const prefix = match.split(/[:=]/)[0];
        return `${prefix}: ***`;
      });
    });

    // Also redact AWS-looking keys
    redacted = redacted.replace(/AKIA[0-9A-Z]{16}/g, 'AKIA***');
    
    // Redact common secret patterns
    redacted = redacted.replace(/(['"]\s*[a-zA-Z0-9_-]{20,}['"]\s*)/g, '"***"');

    return redacted;
  }

  /**
   * Redact variable values
   */
  static redactVariable(name, value) {
    if (!name || !value) return value;

    const lowerName = name.toLowerCase();
    const isSensitive = 
      lowerName.includes('password') ||
      lowerName.includes('token') ||
      lowerName.includes('secret') ||
      lowerName.includes('key') ||
      lowerName.includes('credential') ||
      lowerName.includes('auth');

    return isSensitive ? '***' : value;
  }

  /**
   * Redact variables object
   */
  static redactVariables(variables) {
    if (!variables || typeof variables !== 'object') return variables;

    const redacted = {};
    for (const [key, value] of Object.entries(variables)) {
      redacted[key] = this.redactVariable(key, value);
    }

    return redacted;
  }

  /**
   * Check if string appears to be sensitive
   */
  static isSensitive(value) {
    if (typeof value !== 'string') return false;
    
    const lowerValue = value.toLowerCase();
    return lowerValue.length > 10 && (
      lowerValue.includes('password') ||
      lowerValue.includes('token') ||
      lowerValue.includes('secret') ||
      lowerValue.includes('key') ||
      /[a-z0-9]{20,}/.test(value)
    );
  }
}

export default RedactionService;
