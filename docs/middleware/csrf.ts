/**
 * CSRF Protection Middleware
 *
 * Provides Cross-Site Request Forgery (CSRF) protection for OAuth2 and other
 * authenticated routes. Implements secure token generation, storage, and validation
 * using express-session.
 *
 * Features:
 * - Cryptographically secure random token generation
 * - Timing-safe token comparison to prevent timing attacks
 * - Session-based token storage
 * - Multiple validation strategies (header, body, query)
 * - Token rotation support
 * - Integration with express-session
 *
 * Usage:
 * ```typescript
 * import { csrfProtection, requireCsrfToken, generateCsrfToken } from './middleware/csrf';
 *
 * // Protect a form submission route
 * app.post('/api/submit', csrfProtection, (req, res) => {
 *   res.json({ success: true });
 * });
 *
 * // Ensure a valid token exists in session
 * app.get('/api/data', requireCsrfToken, (req, res) => {
 *   res.json({ token: req.session.csrfToken });
 * });
 *
 * // Generate token manually
 * const token = generateCsrfToken();
 * ```
 *
 * Environment Variables:
 * - CSRF_TOKEN_LENGTH: Length of CSRF tokens in bytes (default: 32)
 * - CSRF_HEADER_NAME: Custom header name for CSRF token (default: 'x-csrf-token')
 * - CSRF_COOKIE_NAME: Cookie name for CSRF token (default: 'csrf-token')
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * CSRF Configuration Options
 */
export interface CsrfOptions {
  /** Length of CSRF token in bytes (default: 32) */
  tokenLength?: number;
  /** Custom header name for CSRF token */
  headerName?: string;
  /** Form field name for CSRF token */
  fieldName?: string;
  /** Query parameter name for CSRF token */
  queryName?: string;
  /** Cookie name for CSRF token (for double-submit cookie pattern) */
  cookieName?: string;
  /** Whether to rotate token after each validation */
  rotateToken?: boolean;
  /** Custom error message */
  errorMessage?: string;
  /** HTTP status code for CSRF errors */
  errorStatusCode?: number;
}

/**
 * CSRF Error class
 */
export class CsrfError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number = 403) {
    super(message);
    this.name = 'CsrfError';
    this.statusCode = statusCode;
    this.code = 'EBADCSRFTOKEN';
    Error.captureStackTrace(this, this.constructor);
  }
}

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Default CSRF configuration
 */
const DEFAULT_OPTIONS: Required<CsrfOptions> = {
  tokenLength: parseInt(process.env.CSRF_TOKEN_LENGTH || '32', 10),
  headerName: process.env.CSRF_HEADER_NAME || 'x-csrf-token',
  fieldName: '_csrf',
  queryName: '_csrf',
  cookieName: process.env.CSRF_COOKIE_NAME || 'csrf-token',
  rotateToken: false,
  errorMessage: 'Invalid CSRF token',
  errorStatusCode: 403,
};

/**
 * Merge user options with defaults
 */
function mergeOptions(options?: Partial<CsrfOptions>): Required<CsrfOptions> {
  return { ...DEFAULT_OPTIONS, ...options };
}

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Generate a cryptographically secure random CSRF token
 *
 * Uses Node.js crypto.randomBytes for secure random generation.
 * Tokens are base64url-encoded for safe transmission in URLs and headers.
 *
 * @param length - Length of token in bytes (default: 32)
 * @returns Base64url-encoded random token
 *
 * @example
 * ```typescript
 * const token = generateCsrfToken();
 * // Returns: "kJx9zY3wRqP5nL2mH8vT6uF4sA1dG7bC"
 * ```
 */
export function generateCsrfToken(length: number = DEFAULT_OPTIONS.tokenLength): string {
  return crypto
    .randomBytes(length)
    .toString('base64url'); // base64url encoding (URL-safe, no padding)
}

/**
 * Perform timing-safe comparison of two strings
 *
 * Prevents timing attacks by ensuring comparison takes constant time
 * regardless of where strings differ.
 *
 * @param a - First string
 * @param b - Second string
 * @returns true if strings are equal, false otherwise
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  // Ensure strings are same length to prevent timing attacks
  if (a.length !== b.length) {
    return false;
  }

  // Convert to buffers for crypto.timingSafeEqual
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  try {
    return crypto.timingSafeEqual(bufferA, bufferB);
  } catch (error) {
    // This should never happen if lengths are equal, but handle gracefully
    return false;
  }
}

/**
 * Extract CSRF token from request
 *
 * Checks multiple locations in order of precedence:
 * 1. Request header (x-csrf-token)
 * 2. Request body field (_csrf)
 * 3. Query parameter (_csrf)
 *
 * @param req - Express request object
 * @param options - CSRF options
 * @returns Extracted token or undefined
 */
function extractTokenFromRequest(
  req: Request,
  options: Required<CsrfOptions>
): string | undefined {
  // Check header first (most secure, not vulnerable to XSS in same way)
  const headerToken = req.get(options.headerName);
  if (headerToken) {
    return headerToken;
  }

  // Check body field (common for form submissions)
  if (req.body && typeof req.body[options.fieldName] === 'string') {
    return req.body[options.fieldName];
  }

  // Check query parameter (least preferred, but supported)
  if (req.query && typeof req.query[options.queryName] === 'string') {
    return req.query[options.queryName] as string;
  }

  return undefined;
}

/**
 * Validate CSRF token against session
 *
 * @param req - Express request object
 * @param options - CSRF options
 * @returns true if valid, false otherwise
 */
function validateCsrfToken(
  req: Request,
  options: Required<CsrfOptions>
): boolean {
  // Ensure session exists
  if (!req.session) {
    console.error('CSRF validation failed: Session not found');
    return false;
  }

  // Get expected token from session
  const expectedToken = req.session.csrfToken;
  if (!expectedToken) {
    console.error('CSRF validation failed: No token in session');
    return false;
  }

  // Extract token from request
  const providedToken = extractTokenFromRequest(req, options);
  if (!providedToken) {
    console.error('CSRF validation failed: No token provided in request');
    return false;
  }

  // Perform timing-safe comparison
  const isValid = timingSafeEqual(expectedToken, providedToken);

  if (!isValid) {
    console.error('CSRF validation failed: Token mismatch');
  }

  return isValid;
}

// =============================================================================
// MIDDLEWARE FUNCTIONS
// =============================================================================

/**
 * CSRF Protection Middleware
 *
 * Validates CSRF token on incoming requests. Use this middleware on routes
 * that perform state-changing operations (POST, PUT, DELETE, PATCH).
 *
 * Safe methods (GET, HEAD, OPTIONS) are exempt from CSRF validation.
 *
 * @param options - CSRF configuration options
 * @returns Express middleware function
 *
 * @example
 * ```typescript
 * // Protect individual route
 * app.post('/api/submit', csrfProtection, (req, res) => {
 *   res.json({ success: true });
 * });
 *
 * // Protect all routes with custom options
 * app.use(csrfProtection({ rotateToken: true }));
 * ```
 */
export function csrfProtection(
  options?: Partial<CsrfOptions>
): (req: Request, res: Response, next: NextFunction) => void {
  const opts = mergeOptions(options);

  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip CSRF validation for safe methods
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(req.method)) {
      return next();
    }

    // Ensure session exists
    if (!req.session) {
      const error = new CsrfError('Session not found', 500);
      return next(error);
    }

    // Validate CSRF token
    const isValid = validateCsrfToken(req, opts);

    if (!isValid) {
      const error = new CsrfError(opts.errorMessage, opts.errorStatusCode);
      return next(error);
    }

    // Optionally rotate token after successful validation
    if (opts.rotateToken) {
      req.session.csrfToken = generateCsrfToken(opts.tokenLength);
    }

    next();
  };
}

/**
 * Require CSRF Token Middleware
 *
 * Ensures a valid CSRF token exists in the session. If not, generates a new one.
 * Use this middleware on routes that need to provide a CSRF token to the client.
 *
 * @param options - CSRF configuration options
 * @returns Express middleware function
 *
 * @example
 * ```typescript
 * // Ensure token exists before rendering form
 * app.get('/form', requireCsrfToken, (req, res) => {
 *   res.render('form', { csrfToken: req.session.csrfToken });
 * });
 *
 * // API endpoint that provides token
 * app.get('/api/csrf-token', requireCsrfToken, (req, res) => {
 *   res.json({ token: req.session.csrfToken });
 * });
 * ```
 */
export function requireCsrfToken(
  options?: Partial<CsrfOptions>
): (req: Request, res: Response, next: NextFunction) => void {
  const opts = mergeOptions(options);

  return (req: Request, res: Response, next: NextFunction): void => {
    // Ensure session exists
    if (!req.session) {
      const error = new CsrfError('Session not found', 500);
      return next(error);
    }

    // Generate token if it doesn't exist
    if (!req.session.csrfToken) {
      req.session.csrfToken = generateCsrfToken(opts.tokenLength);
    }

    next();
  };
}

/**
 * Initialize CSRF Token Middleware
 *
 * Convenience middleware that combines requireCsrfToken with automatic
 * token attachment to response locals for easy template access.
 *
 * @param options - CSRF configuration options
 * @returns Express middleware function
 *
 * @example
 * ```typescript
 * app.use(initializeCsrfToken());
 *
 * // In templates, access token via res.locals.csrfToken
 * // EJS: <input type="hidden" name="_csrf" value="<%= csrfToken %>">
 * // Handlebars: <input type="hidden" name="_csrf" value="{{csrfToken}}">
 * ```
 */
export function initializeCsrfToken(
  options?: Partial<CsrfOptions>
): (req: Request, res: Response, next: NextFunction) => void {
  const opts = mergeOptions(options);

  return (req: Request, res: Response, next: NextFunction): void => {
    // Ensure session exists
    if (!req.session) {
      const error = new CsrfError('Session not found', 500);
      return next(error);
    }

    // Generate token if it doesn't exist
    if (!req.session.csrfToken) {
      req.session.csrfToken = generateCsrfToken(opts.tokenLength);
    }

    // Make token available in response locals for templates
    res.locals.csrfToken = req.session.csrfToken;

    next();
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get CSRF token from session
 *
 * @param req - Express request object
 * @returns CSRF token or undefined if not found
 *
 * @example
 * ```typescript
 * const token = getCsrfToken(req);
 * if (token) {
 *   res.json({ csrfToken: token });
 * }
 * ```
 */
export function getCsrfToken(req: Request): string | undefined {
  return req.session?.csrfToken;
}

/**
 * Set CSRF token in session
 *
 * @param req - Express request object
 * @param token - CSRF token to set (optional, generates new if not provided)
 * @returns The token that was set
 *
 * @example
 * ```typescript
 * const token = setCsrfToken(req);
 * res.cookie('csrf-token', token);
 * ```
 */
export function setCsrfToken(req: Request, token?: string): string {
  if (!req.session) {
    throw new CsrfError('Session not found', 500);
  }

  const newToken = token || generateCsrfToken();
  req.session.csrfToken = newToken;
  return newToken;
}

/**
 * Regenerate CSRF token
 *
 * Generates a new CSRF token and stores it in the session.
 * Useful for token rotation after sensitive operations.
 *
 * @param req - Express request object
 * @returns New CSRF token
 *
 * @example
 * ```typescript
 * // Rotate token after login
 * app.post('/login', (req, res) => {
 *   // ... authenticate user ...
 *   const newToken = regenerateCsrfToken(req);
 *   res.json({ token: newToken });
 * });
 * ```
 */
export function regenerateCsrfToken(req: Request): string {
  return setCsrfToken(req, generateCsrfToken());
}

/**
 * Clear CSRF token from session
 *
 * @param req - Express request object
 *
 * @example
 * ```typescript
 * app.post('/logout', (req, res) => {
 *   clearCsrfToken(req);
 *   req.session.destroy();
 *   res.redirect('/login');
 * });
 * ```
 */
export function clearCsrfToken(req: Request): void {
  if (req.session) {
    delete req.session.csrfToken;
  }
}

/**
 * Verify CSRF token manually
 *
 * Allows manual verification of CSRF token without middleware.
 * Useful for custom validation logic.
 *
 * @param req - Express request object
 * @param token - Token to verify
 * @returns true if token is valid, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = verifyCsrfToken(req, providedToken);
 * if (!isValid) {
 *   return res.status(403).json({ error: 'Invalid CSRF token' });
 * }
 * ```
 */
export function verifyCsrfToken(req: Request, token: string): boolean {
  if (!req.session?.csrfToken) {
    return false;
  }
  return timingSafeEqual(req.session.csrfToken, token);
}

// =============================================================================
// ERROR HANDLER
// =============================================================================

/**
 * CSRF Error Handler Middleware
 *
 * Handles CSRF validation errors and provides appropriate responses.
 * Should be registered after routes that use CSRF protection.
 *
 * @param err - Error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Next middleware function
 *
 * @example
 * ```typescript
 * app.use(csrfProtection);
 * app.use(csrfErrorHandler);
 * ```
 */
export function csrfErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof CsrfError) {
    // Log CSRF error for security monitoring
    console.error('CSRF validation failed:', {
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      error: err.message,
    });

    // Return JSON error for API requests
    if (req.xhr || req.get('accept')?.includes('application/json')) {
      res.status(err.statusCode).json({
        error: err.code,
        message: err.message,
      });
      return;
    }

    // Return HTML error for browser requests
    res.status(err.statusCode).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>CSRF Error</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          h1 { color: #d32f2f; }
          p { line-height: 1.6; }
          a { color: #1976d2; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>CSRF Token Validation Failed</h1>
        <p>${err.message}</p>
        <p>This error occurs when a request is missing a valid CSRF token. This is a security measure to prevent cross-site request forgery attacks.</p>
        <p><a href="javascript:history.back()">Go Back</a> or <a href="/">Go Home</a></p>
      </body>
      </html>
    `);
    return;
  }

  // Pass non-CSRF errors to next error handler
  next(err);
}

// =============================================================================
// SESSION TYPE AUGMENTATION
// =============================================================================

/**
 * Extend express-session SessionData interface to include CSRF token
 */
declare module 'express-session' {
  interface SessionData {
    /** CSRF protection token */
    csrfToken?: string;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

/**
 * Default export: CSRF protection middleware with default options
 */
export default csrfProtection();

/**
 * Named exports for flexibility
 */
export {
  // Middleware
  csrfProtection as csrf,
  requireCsrfToken as requireCsrf,
  initializeCsrfToken as initCsrf,

  // Types
  type CsrfOptions,
  type CsrfError as CsrfErrorType,
};
