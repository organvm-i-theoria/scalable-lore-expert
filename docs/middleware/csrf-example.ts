/**
 * CSRF Protection Usage Examples
 *
 * This file demonstrates how to integrate the CSRF protection middleware
 * with the existing OAuth2 implementation and other routes.
 */

import express, { Request, Response } from 'express';
import session from 'express-session';
import {
  csrfProtection,
  requireCsrfToken,
  initializeCsrfToken,
  csrfErrorHandler,
  generateCsrfToken,
  getCsrfToken,
  regenerateCsrfToken,
} from './csrf';
import { oauthLogin, oauthCallback } from '../routes/auth';

// =============================================================================
// EXAMPLE 1: Basic Application Setup with CSRF Protection
// =============================================================================

const app = express();

// Session middleware (required for CSRF protection)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax',
    },
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize CSRF token for all routes
// This makes the token available in res.locals.csrfToken for templates
app.use(initializeCsrfToken());

// =============================================================================
// EXAMPLE 2: OAuth Routes with CSRF Protection
// =============================================================================

// GET /auth/oauth/login - Initiates OAuth flow
// CSRF token is generated and stored in session automatically
app.get('/auth/oauth/login', requireCsrfToken, oauthLogin);

// GET /auth/oauth/callback - OAuth callback
// No CSRF validation needed (GET request, provider validates state parameter)
app.get('/auth/oauth/callback', oauthCallback);

// =============================================================================
// EXAMPLE 3: Protected Form Routes
// =============================================================================

// GET /form - Render form with CSRF token
app.get('/form', requireCsrfToken, (req: Request, res: Response) => {
  // Token is available in res.locals.csrfToken and req.session.csrfToken
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Example Form</title></head>
    <body>
      <h1>Submit Form</h1>
      <form method="POST" action="/form">
        <!-- Hidden CSRF token field -->
        <input type="hidden" name="_csrf" value="${res.locals.csrfToken}">
        <input type="text" name="data" placeholder="Enter data">
        <button type="submit">Submit</button>
      </form>
    </body>
    </html>
  `);
});

// POST /form - Process form with CSRF validation
app.post('/form', csrfProtection(), (req: Request, res: Response) => {
  // CSRF token validated automatically
  res.json({ success: true, data: req.body.data });
});

// =============================================================================
// EXAMPLE 4: API Routes with CSRF Protection
// =============================================================================

// GET /api/csrf-token - Get CSRF token for client-side apps
app.get('/api/csrf-token', requireCsrfToken, (req: Request, res: Response) => {
  res.json({
    csrfToken: getCsrfToken(req),
  });
});

// POST /api/data - API endpoint with CSRF validation
// Client must send token in header: x-csrf-token
app.post('/api/data', csrfProtection(), (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Data processed successfully',
    data: req.body,
  });
});

// PUT /api/data/:id - Update with CSRF protection
app.put('/api/data/:id', csrfProtection(), (req: Request, res: Response) => {
  res.json({
    success: true,
    message: `Data ${req.params.id} updated`,
  });
});

// DELETE /api/data/:id - Delete with CSRF protection
app.delete('/api/data/:id', csrfProtection(), (req: Request, res: Response) => {
  res.json({
    success: true,
    message: `Data ${req.params.id} deleted`,
  });
});

// =============================================================================
// EXAMPLE 5: Custom CSRF Options
// =============================================================================

// Use custom CSRF options for specific routes
app.post(
  '/api/custom',
  csrfProtection({
    rotateToken: true, // Rotate token after each request
    errorMessage: 'Custom CSRF error message',
    errorStatusCode: 401,
  }),
  (req: Request, res: Response) => {
    res.json({ success: true });
  }
);

// =============================================================================
// EXAMPLE 6: Manual Token Management
// =============================================================================

// POST /login - Login with token rotation
app.post('/login', csrfProtection(), (req: Request, res: Response) => {
  // Authenticate user (example)
  const { username, password } = req.body;

  // After successful login, regenerate CSRF token for security
  const newToken = regenerateCsrfToken(req);

  res.json({
    success: true,
    user: username,
    csrfToken: newToken,
  });
});

// =============================================================================
// EXAMPLE 7: Client-Side JavaScript Usage
// =============================================================================

/*
// Fetch API with CSRF token in header
async function submitData(data) {
  const response = await fetch('/api/csrf-token');
  const { csrfToken } = await response.json();

  const result = await fetch('/api/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken,
    },
    body: JSON.stringify(data),
  });

  return result.json();
}

// Axios with CSRF token in header
import axios from 'axios';

async function submitDataAxios(data) {
  const { data: { csrfToken } } = await axios.get('/api/csrf-token');

  const result = await axios.post('/api/data', data, {
    headers: {
      'x-csrf-token': csrfToken,
    },
  });

  return result.data;
}

// jQuery with CSRF token
$.ajax({
  url: '/api/data',
  method: 'POST',
  headers: {
    'x-csrf-token': $('#csrf-token').val(), // From hidden field
  },
  data: { key: 'value' },
  success: function(response) {
    console.log(response);
  },
});
*/

// =============================================================================
// EXAMPLE 8: Error Handling
// =============================================================================

// CSRF error handler (must be after routes)
app.use(csrfErrorHandler);

// Generic error handler
app.use((err: Error, req: Request, res: Response) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// =============================================================================
// EXAMPLE 9: Integration with OAuth Login Flow
// =============================================================================

// Complete OAuth flow with CSRF protection
app.get('/login', requireCsrfToken, (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Login</title></head>
    <body>
      <h1>Login</h1>
      <a href="/auth/oauth/login">Login with OAuth</a>

      <h2>Or login with credentials</h2>
      <form method="POST" action="/login">
        <input type="hidden" name="_csrf" value="${res.locals.csrfToken}">
        <input type="text" name="username" placeholder="Username">
        <input type="password" name="password" placeholder="Password">
        <button type="submit">Login</button>
      </form>
    </body>
    </html>
  `);
});

// =============================================================================
// EXAMPLE 10: Testing CSRF Protection
// =============================================================================

/*
// Using supertest for testing
import request from 'supertest';

describe('CSRF Protection', () => {
  let csrfToken: string;
  let sessionCookie: string;

  it('should get CSRF token', async () => {
    const res = await request(app)
      .get('/api/csrf-token')
      .expect(200);

    csrfToken = res.body.csrfToken;
    sessionCookie = res.headers['set-cookie'][0];
    expect(csrfToken).toBeTruthy();
  });

  it('should accept valid CSRF token', async () => {
    await request(app)
      .post('/api/data')
      .set('Cookie', sessionCookie)
      .set('x-csrf-token', csrfToken)
      .send({ data: 'test' })
      .expect(200);
  });

  it('should reject invalid CSRF token', async () => {
    await request(app)
      .post('/api/data')
      .set('Cookie', sessionCookie)
      .set('x-csrf-token', 'invalid-token')
      .send({ data: 'test' })
      .expect(403);
  });

  it('should reject missing CSRF token', async () => {
    await request(app)
      .post('/api/data')
      .set('Cookie', sessionCookie)
      .send({ data: 'test' })
      .expect(403);
  });
});
*/

// Export app for testing
export default app;

// Start server
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('CSRF protection is enabled');
  });
}
