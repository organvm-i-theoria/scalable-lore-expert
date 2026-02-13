/**
 * OAuth2 Strategy Configuration
 *
 * Defines OAuth2 provider settings including client credentials, endpoints, and callbacks.
 * All configuration values are loaded from environment variables with sensible defaults.
 *
 * Environment Variables:
 * - OAUTH_PROVIDER: OAuth2 provider type (e.g., 'google', 'github', 'microsoft')
 * - OAUTH_CLIENT_ID: OAuth2 application client ID
 * - OAUTH_CLIENT_SECRET: OAuth2 application client secret
 * - OAUTH_AUTHORIZE_URL: OAuth2 authorization endpoint
 * - OAUTH_TOKEN_URL: OAuth2 token endpoint
 * - OAUTH_USERINFO_URL: OAuth2 user information endpoint
 * - OAUTH_REDIRECT_URI: Callback URL after authorization
 * - OAUTH_SCOPE: Space-separated scopes (default: 'openid email profile')
 * - OAUTH_STATE_SECRET: Secret for CSRF state parameter (auto-generated if not set)
 * - DASHBOARD_URL: Post-login redirect destination (default: '/dashboard')
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * OAuth2 Provider Types
 */
export type OAuthProvider = 'google' | 'github' | 'microsoft' | 'custom';

/**
 * OAuth2 Token Response from provider
 */
export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type: string;
  scope?: string;
  id_token?: string; // For OpenID Connect providers
}

/**
 * User Profile obtained from OAuth2 provider
 */
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email_verified?: boolean;
}

/**
 * Session Token Storage
 */
export interface StoredTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType: string;
  idToken?: string; // For OpenID Connect
}

/**
 * Complete OAuth2 Strategy Configuration
 */
export interface OAuth2Config {
  provider: OAuthProvider;
  clientId: string;
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  redirectUri: string;
  scope: string[];
  stateSecret: string;
  dashboardUrl: string;
  // Optional: for advanced scenarios
  revokeUrl?: string;
  introspectUrl?: string;
  discoveryUrl?: string; // OpenID Connect Discovery URL
}

// =============================================================================
// ENVIRONMENT PARSING UTILITIES
// =============================================================================

/**
 * Get string environment variable with fallback
 */
function getEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

/**
 * Generate a random state parameter for CSRF protection
 */
function generateState(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

// =============================================================================
// PROVIDER PRESETS
// =============================================================================

/**
 * Known OAuth2 provider configurations
 * These can be overridden by environment variables
 */
const PROVIDER_PRESETS: Record<OAuthProvider, Partial<OAuth2Config>> = {
  google: {
    provider: 'google',
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
    discoveryUrl: 'https://accounts.google.com/.well-known/openid-configuration',
    scope: ['openid', 'email', 'profile'],
  },
  github: {
    provider: 'github',
    authorizeUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user',
    scope: ['user:email', 'read:user'],
  },
  microsoft: {
    provider: 'microsoft',
    authorizeUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
    discoveryUrl: 'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration',
    scope: ['openid', 'email', 'profile'],
  },
  custom: {
    provider: 'custom',
    // Custom providers should specify all URLs via environment variables
    scope: ['openid', 'email', 'profile'],
  },
};

// =============================================================================
// CONFIGURATION BUILDER
// =============================================================================

/**
 * Build OAuth2 configuration from environment variables
 *
 * @returns Complete OAuth2 configuration object
 * @throws Error if required configuration is missing
 */
function buildOAuth2Config(): OAuth2Config {
  const provider = getEnv('OAUTH_PROVIDER', 'google') as OAuthProvider;
  const preset = PROVIDER_PRESETS[provider] || PROVIDER_PRESETS.custom;

  const clientId = getEnv('OAUTH_CLIENT_ID', '');
  const clientSecret = getEnv('OAUTH_CLIENT_SECRET', '');
  const authorizeUrl = getEnv('OAUTH_AUTHORIZE_URL', preset.authorizeUrl || '');
  const tokenUrl = getEnv('OAUTH_TOKEN_URL', preset.tokenUrl || '');
  const userInfoUrl = getEnv('OAUTH_USERINFO_URL', preset.userInfoUrl || '');
  const redirectUri = getEnv('OAUTH_REDIRECT_URI', 'http://localhost:3000/auth/oauth/callback');
  const scopeString = getEnv('OAUTH_SCOPE', (preset.scope || ['openid', 'email', 'profile']).join(' '));
  const stateSecret = getEnv('OAUTH_STATE_SECRET', generateState());
  const dashboardUrl = getEnv('DASHBOARD_URL', '/dashboard');

  // Validate required fields
  if (!clientId) {
    console.warn('Warning: OAUTH_CLIENT_ID is not set. OAuth2 authentication will fail.');
  }
  if (!clientSecret) {
    console.warn('Warning: OAUTH_CLIENT_SECRET is not set. OAuth2 authentication will fail.');
  }
  if (!authorizeUrl) {
    console.warn('Warning: OAUTH_AUTHORIZE_URL is not set. OAuth2 authentication will fail.');
  }
  if (!tokenUrl) {
    console.warn('Warning: OAUTH_TOKEN_URL is not set. OAuth2 authentication will fail.');
  }
  if (!userInfoUrl) {
    console.warn('Warning: OAUTH_USERINFO_URL is not set. User profile fetching will fail.');
  }

  return {
    provider,
    clientId,
    clientSecret,
    authorizeUrl,
    tokenUrl,
    userInfoUrl,
    redirectUri,
    scope: scopeString.split(' ').filter(s => s.length > 0),
    stateSecret,
    dashboardUrl,
    revokeUrl: getEnv('OAUTH_REVOKE_URL', ''),
    introspectUrl: getEnv('OAUTH_INTROSPECT_URL', ''),
    discoveryUrl: getEnv('OAUTH_DISCOVERY_URL', preset.discoveryUrl),
  };
}

// =============================================================================
// CONFIGURATION EXPORT
// =============================================================================

/**
 * OAuth2 Configuration Object
 * Singleton instance built from environment variables
 *
 * Usage:
 * ```typescript
 * import { oauth2Config } from './config/oauth';
 *
 * const clientId = oauth2Config.clientId;
 * const redirectUri = oauth2Config.redirectUri;
 * ```
 */
export const oauth2Config: OAuth2Config = buildOAuth2Config();

/**
 * Helper to validate configuration
 *
 * @returns true if configuration has all required fields, false otherwise
 */
export function isOAuth2ConfigValid(): boolean {
  return !!(
    oauth2Config.clientId &&
    oauth2Config.clientSecret &&
    oauth2Config.authorizeUrl &&
    oauth2Config.tokenUrl &&
    oauth2Config.userInfoUrl &&
    oauth2Config.redirectUri
  );
}

/**
 * Get configuration for a specific provider
 * Useful for multi-provider OAuth2 systems
 *
 * @param provider OAuth provider type
 * @returns Partial configuration for the provider
 */
export function getProviderConfig(provider: OAuthProvider): Partial<OAuth2Config> {
  return PROVIDER_PRESETS[provider] || PROVIDER_PRESETS.custom;
}

/**
 * Create authorization URL for OAuth2 flow
 *
 * @param state CSRF protection state parameter
 * @returns Full authorization URL
 */
export function createAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: oauth2Config.clientId,
    redirect_uri: oauth2Config.redirectUri,
    response_type: 'code',
    scope: oauth2Config.scope.join(' '),
    state,
  });

  return `${oauth2Config.authorizeUrl}?${params.toString()}`;
}

/**
 * Default export of configuration
 */
export default oauth2Config;
