/**
 * Auth Service
 * Handle OAuth2 authentication with GitHub
 */

const GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize';

export class AuthService {
  static getClientId() {
    return import.meta.env.VITE_GITHUB_CLIENT_ID || '';
  }

  static getRedirectUri() {
    return `${window.location.origin}/callback`;
  }

  /**
   * Generate OAuth authorization URL
   */
  static getAuthorizationUrl() {
    const params = new URLSearchParams({
      client_id: this.getClientId(),
      redirect_uri: this.getRedirectUri(),
      scope: 'repo,workflow,read:packages,read:org',
      state: this.generateState()
    });

    return `${GITHUB_OAUTH_URL}?${params.toString()}`;
  }

  /**
   * Generate random state for CSRF protection
   */
  static generateState() {
    const state = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('oauth_state', state);
    return state;
  }

  /**
   * Verify state from callback
   */
  static verifyState(state) {
    const savedState = sessionStorage.getItem('oauth_state');
    sessionStorage.removeItem('oauth_state');
    return savedState === state;
  }

  /**
   * Save token to storage
   */
  static saveToken(token) {
    if (token) {
      localStorage.setItem('github_token', token);
      localStorage.setItem('token_timestamp', Date.now().toString());
    }
  }

  /**
   * Get token from storage
   */
  static getToken() {
    return localStorage.getItem('github_token');
  }

  /**
   * Check if token exists and is valid
   */
  static isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Logout - clear token
   */
  static logout() {
    localStorage.removeItem('github_token');
    localStorage.removeItem('token_timestamp');
    sessionStorage.removeItem('oauth_state');
  }

  /**
   * Get token age in minutes
   */
  static getTokenAge() {
    const timestamp = localStorage.getItem('token_timestamp');
    if (!timestamp) return null;
    return Math.floor((Date.now() - parseInt(timestamp)) / 1000 / 60);
  }
}

export default AuthService;
