# Middleware

This directory contains Express middleware implementations for security and authentication.

## CSRF Protection Middleware

The CSRF (Cross-Site Request Forgery) protection middleware provides comprehensive security against CSRF attacks for your OAuth2 implementation and other routes.

### Features

- Cryptographically secure random token generation using `crypto.randomBytes`
- Timing-safe token comparison to prevent timing attacks
- Session-based token storage via `express-session`
- Multiple token validation strategies (header, body, query parameter)
- Token rotation support for enhanced security
- Comprehensive error handling with custom error responses
- TypeScript types and detailed documentation
- Integration with OAuth2 authentication flow

### Installation

The middleware is already included in this project. Ensure you have the required dependencies:

```bash
npm install express express-session @types/express @types/express-session
```

### Quick Start

```typescript
import express from 'express';
import session from 'express-session';
import {
  csrfProtection,
  requireCsrfToken,
  initializeCsrfToken,
  csrfErrorHandler,
} from './middleware/csrf';

const app = express();

// Setup session (required)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
}));

// Initialize CSRF tokens for all routes
app.use(initializeCsrfToken());

// Protect POST/PUT/DELETE routes
app.post('/api/data', csrfProtection(), (req, res) => {
  res.json({ success: true });
});

// Handle CSRF errors
app.use(csrfErrorHandler);
```

### API Reference

#### Middleware Functions

##### `csrfProtection(options?)`

Validates CSRF tokens on incoming requests. Safe methods (GET, HEAD, OPTIONS) are automatically exempt.

```typescript
app.post('/submit', csrfProtection(), (req, res) => {
  // Token validated automatically
  res.json({ success: true });
});
```

**Options:**
- `tokenLength` (number): Length of token in bytes (default: 32)
- `headerName` (string): Custom header name (default: 'x-csrf-token')
- `fieldName` (string): Form field name (default: '_csrf')
- `queryName` (string): Query parameter name (default: '_csrf')
- `rotateToken` (boolean): Rotate token after validation (default: false)
- `errorMessage` (string): Custom error message
- `errorStatusCode` (number): HTTP status code for errors (default: 403)

##### `requireCsrfToken(options?)`

Ensures a valid CSRF token exists in the session. Generates a new token if one doesn't exist.

```typescript
app.get('/form', requireCsrfToken, (req, res) => {
  res.render('form', { csrfToken: req.session.csrfToken });
});
```

##### `initializeCsrfToken(options?)`

Convenience middleware that combines `requireCsrfToken` with automatic token attachment to `res.locals`.

```typescript
app.use(initializeCsrfToken());

// Token available in templates as res.locals.csrfToken
app.get('/page', (req, res) => {
  res.render('page'); // <%= csrfToken %> in template
});
```

##### `csrfErrorHandler`

Error handling middleware for CSRF validation failures. Provides appropriate responses for JSON and HTML requests.

```typescript
app.use(csrfErrorHandler);
```

#### Helper Functions

##### `generateCsrfToken(length?)`

Generate a cryptographically secure random CSRF token.

```typescript
const token = generateCsrfToken(); // 32-byte token
const customToken = generateCsrfToken(64); // 64-byte token
```

##### `getCsrfToken(req)`

Get the CSRF token from the session.

```typescript
const token = getCsrfToken(req);
```

##### `setCsrfToken(req, token?)`

Set or generate a CSRF token in the session.

```typescript
const token = setCsrfToken(req); // Generates new token
setCsrfToken(req, customToken); // Sets specific token
```

##### `regenerateCsrfToken(req)`

Regenerate the CSRF token (useful after login/logout).

```typescript
app.post('/login', (req, res) => {
  // Authenticate user...
  const newToken = regenerateCsrfToken(req);
  res.json({ token: newToken });
});
```

##### `clearCsrfToken(req)`

Clear the CSRF token from the session.

```typescript
app.post('/logout', (req, res) => {
  clearCsrfToken(req);
  req.session.destroy();
  res.redirect('/login');
});
```

##### `verifyCsrfToken(req, token)`

Manually verify a CSRF token.

```typescript
const isValid = verifyCsrfToken(req, providedToken);
if (!isValid) {
  return res.status(403).json({ error: 'Invalid token' });
}
```

### Usage Patterns

#### Pattern 1: Form Submissions

```typescript
// Render form with token
app.get('/form', requireCsrfToken, (req, res) => {
  res.send(`
    <form method="POST" action="/submit">
      <input type="hidden" name="_csrf" value="${res.locals.csrfToken}">
      <input type="text" name="data">
      <button type="submit">Submit</button>
    </form>
  `);
});

// Validate token on submission
app.post('/submit', csrfProtection(), (req, res) => {
  res.json({ success: true });
});
```

#### Pattern 2: AJAX/API Requests

```typescript
// Get token
app.get('/api/csrf-token', requireCsrfToken, (req, res) => {
  res.json({ csrfToken: getCsrfToken(req) });
});

// Validate token in header
app.post('/api/data', csrfProtection(), (req, res) => {
  res.json({ success: true });
});
```

Client-side:
```javascript
// Fetch token
const { csrfToken } = await fetch('/api/csrf-token').then(r => r.json());

// Send with request
await fetch('/api/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken,
  },
  body: JSON.stringify({ data: 'value' }),
});
```

#### Pattern 3: OAuth Integration

```typescript
import { oauthLogin, oauthCallback } from '../routes/auth';

// OAuth login with CSRF token
app.get('/auth/oauth/login', requireCsrfToken, oauthLogin);

// OAuth callback (no CSRF needed, uses state parameter)
app.get('/auth/oauth/callback', oauthCallback);

// After login, regenerate token
app.post('/auth/login', csrfProtection(), (req, res) => {
  // Authenticate...
  const newToken = regenerateCsrfToken(req);
  res.json({ token: newToken });
});
```

### Security Best Practices

1. **Always use HTTPS in production** - Set `cookie.secure: true` in session config
2. **Use SameSite cookies** - Prevents CSRF attacks via cross-site requests
3. **Rotate tokens after sensitive operations** - Login, password change, etc.
4. **Keep token length at 32 bytes minimum** - Ensures sufficient entropy
5. **Validate tokens on all state-changing operations** - POST, PUT, DELETE, PATCH
6. **Clear tokens on logout** - Use `clearCsrfToken(req)`
7. **Monitor CSRF failures** - Check logs for potential attacks

### Environment Variables

```bash
# Optional: Configure CSRF middleware
CSRF_TOKEN_LENGTH=32          # Token length in bytes
CSRF_HEADER_NAME=x-csrf-token # Custom header name
CSRF_COOKIE_NAME=csrf-token   # Cookie name (for double-submit pattern)
```

### Error Handling

CSRF validation failures throw `CsrfError` with status code 403. The error handler provides appropriate responses:

**JSON Response (API requests):**
```json
{
  "error": "EBADCSRFTOKEN",
  "message": "Invalid CSRF token"
}
```

**HTML Response (Browser requests):**
```html
<h1>CSRF Token Validation Failed</h1>
<p>Invalid CSRF token</p>
```

### Testing

```typescript
import request from 'supertest';
import app from './app';

describe('CSRF Protection', () => {
  let csrfToken: string;
  let cookie: string;

  it('should get CSRF token', async () => {
    const res = await request(app)
      .get('/api/csrf-token')
      .expect(200);

    csrfToken = res.body.csrfToken;
    cookie = res.headers['set-cookie'][0];
  });

  it('should accept valid token', async () => {
    await request(app)
      .post('/api/data')
      .set('Cookie', cookie)
      .set('x-csrf-token', csrfToken)
      .expect(200);
  });

  it('should reject invalid token', async () => {
    await request(app)
      .post('/api/data')
      .set('Cookie', cookie)
      .set('x-csrf-token', 'invalid')
      .expect(403);
  });
});
```

### Migration Guide

If you're adding CSRF protection to an existing application:

1. Add session middleware (if not already present)
2. Add `initializeCsrfToken()` globally
3. Add `csrfProtection()` to state-changing routes
4. Update forms to include CSRF token field
5. Update AJAX requests to include CSRF token header
6. Add `csrfErrorHandler` at the end of middleware chain
7. Test thoroughly before deploying to production

### Troubleshooting

**Issue: "Invalid CSRF token" errors**
- Ensure session middleware is configured correctly
- Check that token is being sent in header/body/query
- Verify cookie settings (httpOnly, secure, sameSite)
- Check for token rotation issues

**Issue: "Session not found" errors**
- Ensure express-session is installed and configured
- Check that session middleware runs before CSRF middleware
- Verify session store is working correctly

**Issue: Token not available in templates**
- Use `initializeCsrfToken()` instead of `requireCsrfToken`
- Check that template is accessing `csrfToken` (not `req.session.csrfToken`)

### Further Reading

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Express Session Documentation](https://github.com/expressjs/session)
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)

### Examples

See `csrf-example.ts` for comprehensive usage examples including:
- Basic setup
- OAuth integration
- Form handling
- API protection
- Custom options
- Token management
- Client-side usage
- Testing

---

## License

This middleware is part of the OAuth2 implementation project.
