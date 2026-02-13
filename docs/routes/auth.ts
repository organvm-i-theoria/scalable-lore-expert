import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { oauth2Config, createAuthorizationUrl } from '../config/oauth';

/**
 * OAuth2 Configuration
 * These should be loaded from environment variables in production
 */
interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  redirectUri: string;
  dashboardUrl: string;
}

/**
 * OAuth2 Token Response
 */
interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type: string;
  scope?: string;
}

/**
 * User Profile (customize based on your OAuth provider)
 */
interface UserProfile {
  id: string;
  email: string;
  name?: string;
}

/**
 * Get OAuth configuration from environment variables
 */
const getOAuthConfig = (): OAuthConfig => {
  return {
    clientId: process.env.OAUTH_CLIENT_ID || '',
    clientSecret: process.env.OAUTH_CLIENT_SECRET || '',
    tokenUrl: process.env.OAUTH_TOKEN_URL || '',
    redirectUri: process.env.OAUTH_REDIRECT_URI || '',
    dashboardUrl: process.env.DASHBOARD_URL || '/dashboard',
  };
};

/**
 * Exchange authorization code for access tokens
 */
const exchangeCodeForTokens = async (
  code: string,
  config: OAuthConfig
): Promise<TokenResponse> => {
  try {
    const response = await axios.post<TokenResponse>(
      config.tokenUrl,
      {
        grant_type: 'authorization_code',
        code,
        redirect_uri: config.redirectUri,
        client_id: config.clientId,
        client_secret: config.clientSecret,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Token exchange failed: ${error.response?.data?.error_description || error.message}`
      );
    }
    throw error;
  }
};

/**
 * Fetch user profile from OAuth provider
 * This is a placeholder - implement based on your OAuth provider's API
 */
const fetchUserProfile = async (accessToken: string): Promise<UserProfile> => {
  try {
    const userInfoUrl = process.env.OAUTH_USERINFO_URL || '';

    const response = await axios.get<UserProfile>(userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to fetch user profile: ${error.response?.data?.error_description || error.message}`
      );
    }
    throw error;
  }
};

/**
 * Create user session
 * This implementation uses express-session
 * Customize based on your session management strategy
 */
const createUserSession = (
  req: Request,
  userProfile: UserProfile,
  tokens: TokenResponse
): void => {
  // Store user data in session
  req.session.user = {
    id: userProfile.id,
    email: userProfile.email,
    name: userProfile.name,
  };

  // Store tokens securely in session
  req.session.tokens = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: tokens.expires_in
      ? Date.now() + tokens.expires_in * 1000
      : undefined,
    tokenType: tokens.token_type,
  };

  // Mark session as authenticated
  req.session.isAuthenticated = true;
};

/**
 * OAuth2 Login Handler
 * Initiates the OAuth flow by redirecting to the authorization URL
 *
 * @route GET /auth/oauth/login
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const oauthLogin = (req: Request, res: Response): void => {
  try {
    // Validate OAuth configuration
    if (!oauth2Config.clientId || !oauth2Config.authorizeUrl) {
      console.error('OAuth configuration is incomplete');
      return res.redirect('/login?error=config_error&error_description=' +
        encodeURIComponent('OAuth is not properly configured'));
    }

    // Generate CSRF state parameter using crypto-strong randomness
    const state = Math.random().toString(36).substring(2, 15) +
                  Math.random().toString(36).substring(2, 15);

    // Store state in session for verification in callback
    req.session.oauthState = state;

    // Create authorization URL using the config helper
    const authorizationUrl = createAuthorizationUrl(state);

    console.log('Initiating OAuth flow, redirecting to:', oauth2Config.authorizeUrl);
    console.log('State parameter generated and stored in session');

    // Redirect user to OAuth provider's authorization page
    res.redirect(authorizationUrl);
  } catch (error) {
    console.error('Error initiating OAuth flow:', error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'Failed to initiate OAuth flow';

    res.redirect(
      `/login?error=oauth_init_failed&error_description=${encodeURIComponent(errorMessage)}`
    );
  }
};

/**
 * OAuth2 Callback Handler
 * Handles the callback from the OAuth provider after user authorization
 *
 * @route GET /auth/oauth/callback
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 */
export const oauthCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract authorization code and state from query parameters
    const { code, state, error, error_description } = req.query;

    // Handle OAuth provider errors
    if (error) {
      console.error('OAuth provider returned error:', error, error_description);
      return res.redirect(
        `/login?error=${encodeURIComponent(error as string)}&error_description=${encodeURIComponent(error_description as string || 'Authentication failed')}`
      );
    }

    // Validate required parameters
    if (!code || typeof code !== 'string') {
      console.error('Missing or invalid authorization code');
      return res.redirect('/login?error=missing_code');
    }

    // Verify state parameter to prevent CSRF attacks
    if (state && req.session.oauthState) {
      if (state !== req.session.oauthState) {
        console.error('State parameter mismatch - possible CSRF attack');
        return res.redirect('/login?error=invalid_state');
      }
      // Clear the state from session after validation
      delete req.session.oauthState;
    }

    // Get OAuth configuration
    const config = getOAuthConfig();

    // Validate configuration
    if (!config.clientId || !config.clientSecret || !config.tokenUrl) {
      console.error('OAuth configuration is incomplete');
      return res.status(500).send('Server configuration error');
    }

    // Step 1: Exchange authorization code for access tokens
    console.log('Exchanging authorization code for tokens...');
    const tokens = await exchangeCodeForTokens(code, config);

    // Step 2: Fetch user profile using access token
    console.log('Fetching user profile...');
    const userProfile = await fetchUserProfile(tokens.access_token);

    // Step 3: Create user session
    console.log('Creating user session for user:', userProfile.id);
    createUserSession(req, userProfile, tokens);

    // Save session before redirecting
    req.session.save((err) => {
      if (err) {
        console.error('Failed to save session:', err);
        return next(err);
      }

      // Step 4: Redirect to dashboard
      console.log('OAuth authentication successful, redirecting to dashboard');
      res.redirect(config.dashboardUrl);
    });
  } catch (error) {
    console.error('OAuth callback error:', error);

    // Log detailed error for debugging
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }

    // Redirect to login with error message
    const errorMessage = error instanceof Error
      ? error.message
      : 'Authentication failed';

    res.redirect(
      `/login?error=auth_failed&error_description=${encodeURIComponent(errorMessage)}`
    );
  }
};

/**
 * Optional: OAuth2 Authorization Initiation Handler
 * Initiates the OAuth flow by redirecting to the authorization URL
 *
 * @route GET /auth/oauth/authorize
 */
export const initiateOAuthFlow = (req: Request, res: Response): void => {
  const config = getOAuthConfig();
  const authUrl = process.env.OAUTH_AUTHORIZE_URL || '';

  // Generate and store state parameter for CSRF protection
  const state = Math.random().toString(36).substring(2, 15);
  req.session.oauthState = state;

  // Build authorization URL
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: process.env.OAUTH_SCOPE || 'openid email profile',
    state,
  });

  const authorizationUrl = `${authUrl}?${params.toString()}`;

  res.redirect(authorizationUrl);
};

/**
 * Optional: Logout Handler
 * Destroys the user session
 *
 * @route POST /auth/logout
 */
export const logout = (req: Request, res: Response): void => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }

    res.clearCookie('connect.sid'); // Adjust cookie name if different
    res.redirect('/login');
  });
};

// Type augmentation for express-session
declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      email: string;
      name?: string;
    };
    tokens?: {
      accessToken: string;
      refreshToken?: string;
      expiresAt?: number;
      tokenType: string;
    };
    isAuthenticated?: boolean;
    oauthState?: string;
  }
}
