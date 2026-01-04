/**
 * Auth Service
 * Handle OAuth2 authentication with GitHub
 */

const GITHUB_DEVICE_CODE_URL = 'https://github.com/login/device/code';
const GITHUB_OAUTH_TOKEN_URL = 'https://github.com/login/oauth/access_token';

export class AuthService {
  static getClientId() {
    return import.meta.env.VITE_GITHUB_CLIENT_ID || '';
  }

  static getRedirectUri() {
    const basePath = import.meta.env.BASE_URL || '/ghoten-ui/';
    return `${window.location.origin}${basePath}callback`;
  }

  /**
   * Start OAuth Device Flow (does not require client secret)
   */
  static async startDeviceFlow() {
    const clientId = this.getClientId();
    if (!clientId) throw new Error('Missing VITE_GITHUB_CLIENT_ID');

    const params = new URLSearchParams({
      client_id: clientId,
      scope: 'repo,workflow,read:packages,read:org'
    });

    const res = await fetch(GITHUB_DEVICE_CODE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      body: params
    });

    if (!res.ok) {
      throw new Error('Failed to start device flow');
    }

    return res.json();
  }

  /**
   * Poll token endpoint using device_code
   */
  static async pollDeviceFlow(deviceCode, intervalSeconds = 5) {
    const clientId = this.getClientId();
    const params = new URLSearchParams({
      client_id: clientId,
      device_code: deviceCode,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
    });

    const res = await fetch(GITHUB_OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      body: params
    });

    if (!res.ok) {
      throw new Error('Failed to poll device flow');
    }

    const data = await res.json();
    if (data.error === 'authorization_pending') {
      return { pending: true, interval: intervalSeconds };
    }
    if (data.error === 'slow_down') {
      return { pending: true, interval: intervalSeconds + 5 };
    }
    if (data.error) {
      throw new Error(data.error_description || data.error);
    }

    return { token: data.access_token };
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
