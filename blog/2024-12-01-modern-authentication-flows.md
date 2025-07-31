---
slug: modern-authentication-flows
title: Modern Authentication Flows - OAuth2, JWT, and Session vs Token
authors: [saikiran]
tags: [authentication, oauth2, jwt, security, web-development, cybersecurity]
---

Authentication is the backbone of modern web applications, yet many developers struggle with choosing the right approach. Should you use sessions or tokens? When is OAuth2 appropriate? How do JWTs fit into the picture? This comprehensive guide demystifies modern authentication flows and helps you make informed decisions for your applications.

<!-- truncate -->

## The Authentication Landscape Today

In today's interconnected world, authentication has evolved far beyond simple username-password combinations. We now have sophisticated flows that handle everything from single-page applications to microservices architectures, mobile apps to enterprise systems.

The challenge isn't just implementing authentication—it's choosing the right approach for your specific use case while maintaining security, scalability, and user experience.

## Understanding the Fundamentals

Before diving into specific implementations, let's establish the core concepts that underpin all modern authentication systems.

### Authentication vs Authorization

These terms are often confused, but they serve distinct purposes:

- **Authentication**: "Who are you?" - Verifying identity
- **Authorization**: "What can you do?" - Granting permissions
- **Accounting**: "What did you do?" - Tracking actions

```javascript
// Example: Authentication vs Authorization
const authenticatedUser = {
  id: 'user123',
  email: 'john@example.com',
  role: 'editor'
};

// Authentication: We know WHO this is
console.log(`Authenticated user: ${authenticatedUser.email}`);

// Authorization: We determine WHAT they can do
const canEditPosts = authenticatedUser.role === 'editor' || authenticatedUser.role === 'admin';
const canDeleteUsers = authenticatedUser.role === 'admin';
```

## Session-Based Authentication: The Traditional Approach

Session-based authentication stores user state on the server and uses session identifiers to track authenticated users. Think of it as a coat check system—you get a ticket (session ID), and the server keeps your coat (user data).

### How Sessions Work

```python
# Complete session authentication system
import uuid
import time
import hashlib
import secrets
from typing import Dict, Optional

class SessionAuthSystem:
    def __init__(self):
        self.sessions = {}  # In production: Redis or database
        self.users_db = {
            'john_doe': {
                'password_hash': hashlib.sha256('password123'.encode()).hexdigest(),
                'email': 'john@example.com',
                'role': 'user',
                'last_login': None
            }
        }
        self.session_timeout = 3600  # 1 hour
    
    def authenticate_user(self, username: str, password: str) -> Dict:
        """Authenticate user and create session"""
        
        # Verify credentials
        if username not in self.users_db:
            return {'success': False, 'error': 'Invalid credentials'}
        
        user = self.users_db[username]
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        if password_hash != user['password_hash']:
            return {'success': False, 'error': 'Invalid credentials'}
        
        # Create session
        session_id = str(uuid.uuid4())
        current_time = time.time()
        
        self.sessions[session_id] = {
            'user_id': username,
            'user_data': {
                'email': user['email'],
                'role': user['role']
            },
            'created_at': current_time,
            'last_accessed': current_time,
            'expires_at': current_time + self.session_timeout,
            'ip_address': None,  # Set from request
            'user_agent': None   # Set from request
        }
        
        # Update user's last login
        user['last_login'] = current_time
        
        return {
            'success': True,
            'session_id': session_id,
            'user_data': self.sessions[session_id]['user_data']
        }
    
    def validate_session(self, session_id: str) -> Optional[Dict]:
        """Validate session and extend if valid"""
        
        if session_id not in self.sessions:
            return None
        
        session = self.sessions[session_id]
        current_time = time.time()
        
        # Check expiration
        if current_time > session['expires_at']:
            del self.sessions[session_id]
            return None
        
        # Extend session
        session['last_accessed'] = current_time
        session['expires_at'] = current_time + self.session_timeout
        
        return session
    
    def logout(self, session_id: str) -> bool:
        """Destroy session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False
    
    def get_active_sessions(self, user_id: str) -> List[Dict]:
        """Get all active sessions for a user"""
        user_sessions = []
        
        for session_id, session in self.sessions.items():
            if session['user_id'] == user_id:
                user_sessions.append({
                    'session_id': session_id,
                    'created_at': session['created_at'],
                    'last_accessed': session['last_accessed'],
                    'ip_address': session.get('ip_address'),
                    'user_agent': session.get('user_agent')
                })
        
        return user_sessions

# Example Flask application
from flask import Flask, request, session, jsonify, make_response

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-in-production'
auth_system = SessionAuthSystem()

@app.route('/login', methods=['POST'])
def login():
    """Session-based login"""
    data = request.get_json()
    
    result = auth_system.authenticate_user(
        data.get('username'),
        data.get('password')
    )
    
    if result['success']:
        # Set session cookie
        response = make_response(jsonify({
            'success': True,
            'user': result['user_data']
        }))
        
        response.set_cookie(
            'session_id',
            result['session_id'],
            httponly=True,
            secure=True,  # HTTPS only
            samesite='Strict',
            max_age=3600
        )
        
        return response
    
    return jsonify(result), 401

@app.route('/profile')
def profile():
    """Protected route using session"""
    session_id = request.cookies.get('session_id')
    
    if not session_id:
        return jsonify({'error': 'No session found'}), 401
    
    session_data = auth_system.validate_session(session_id)
    
    if not session_data:
        return jsonify({'error': 'Invalid session'}), 401
    
    return jsonify({
        'user_id': session_data['user_id'],
        'user_data': session_data['user_data'],
        'session_info': {
            'created_at': session_data['created_at'],
            'last_accessed': session_data['last_accessed']
        }
    })
```

### When to Use Session Authentication

**Perfect for:**
- Traditional web applications with server-side rendering
- Applications requiring immediate session revocation
- High-security applications (banking, healthcare)
- Single-domain applications
- Real-time applications with WebSocket connections

**Challenges:**
- Scalability across multiple servers
- Memory usage for session storage
- Cross-domain limitations
- Mobile application complexity

## Token-Based Authentication: The Modern Standard

Token-based authentication, particularly with JSON Web Tokens (JWT), has become the standard for modern applications. Instead of storing state on the server, all necessary information is encoded in the token itself.

### Understanding JWT Structure

A JWT consists of three parts separated by dots:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Header** (Algorithm and token type):
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload** (Claims about the user):
```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "iat": 1516239022,
  "exp": 1516242622
}
```

**Signature** (Verification):
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

### Implementing Secure JWT Authentication

```javascript
// Modern JWT implementation with security best practices
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

class JWTAuthSystem {
  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET;
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
    this.accessTokenExpiry = '15m';
    this.refreshTokenExpiry = '7d';
    this.blacklistedTokens = new Set(); // In production: Redis
  }
  
  generateTokenPair(userId, userData) {
    const currentTime = Math.floor(Date.now() / 1000);
    const jti = crypto.randomBytes(16).toString('hex');
    
    // Access token (short-lived, contains user data)
    const accessPayload = {
      sub: userId,
      userData: userData,
      iat: currentTime,
      jti: jti,
      type: 'access'
    };
    
    // Refresh token (long-lived, minimal data)
    const refreshPayload = {
      sub: userId,
      iat: currentTime,
      jti: jti,
      type: 'refresh'
    };
    
    const accessToken = jwt.sign(
      accessPayload,
      this.accessTokenSecret,
      { expiresIn: this.accessTokenExpiry }
    );
    
    const refreshToken = jwt.sign(
      refreshPayload,
      this.refreshTokenSecret,
      { expiresIn: this.refreshTokenExpiry }
    );
    
    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
      tokenType: 'Bearer'
    };
  }
  
  verifyAccessToken(token) {
    try {
      // Check blacklist
      if (this.blacklistedTokens.has(token)) {
        throw new Error('Token revoked');
      }
      
      const payload = jwt.verify(token, this.accessTokenSecret);
      
      // Verify token type
      if (payload.type !== 'access') {
        throw new Error('Invalid token type');
      }
      
      return { valid: true, payload };
      
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
  
  refreshAccessToken(refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, this.refreshTokenSecret);
      
      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      
      // Get fresh user data
      const userData = this.getUserData(payload.sub);
      if (!userData) {
        throw new Error('User not found');
      }
      
      // Generate new token pair
      return this.generateTokenPair(payload.sub, userData);
      
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }
  
  revokeToken(token) {
    // Add to blacklist
    this.blacklistedTokens.add(token);
    
    // In production, also add to persistent storage
    // and set expiration based on token's exp claim
  }
  
  getUserData(userId) {
    // Mock implementation - replace with database query
    const users = {
      'john_doe': {
        email: 'john@example.com',
        role: 'user',
        permissions: ['read', 'write']
      }
    };
    
    return users[userId];
  }
}

// Express.js middleware for JWT authentication
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  const token = authHeader.substring(7);
  const jwtAuth = new JWTAuthSystem();
  const verification = jwtAuth.verifyAccessToken(token);
  
  if (!verification.valid) {
    return res.status(401).json({ error: verification.error });
  }
  
  // Add user info to request
  req.user = verification.payload;
  next();
};

// Example protected route
app.get('/api/profile', authMiddleware, (req, res) => {
  res.json({
    userId: req.user.sub,
    userData: req.user.userData,
    tokenInfo: {
      issuedAt: req.user.iat,
      jwtId: req.user.jti
    }
  });
});
```

### JWT Best Practices

**Security Considerations:**
- Use strong signing algorithms (RS256 for production)
- Keep tokens short-lived (15-30 minutes for access tokens)
- Implement refresh token rotation
- Store tokens securely on the client
- Validate all claims, not just signature

**Performance Optimizations:**
- Cache public keys for RS256 verification
- Use token blacklisting judiciously
- Implement efficient token validation
- Consider token compression for large payloads

## OAuth 2.0: Delegated Authorization

OAuth 2.0 isn't technically an authentication protocol—it's an authorization framework. However, it's commonly used for authentication through services like "Login with Google" or "Login with GitHub."

### OAuth 2.0 Authorization Code Flow

This is the most secure OAuth flow, perfect for web applications:

```javascript
// Complete OAuth 2.0 implementation
class OAuth2AuthorizationCodeFlow {
  constructor(config) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.authorizationUrl = config.authorizationUrl;
    this.tokenUrl = config.tokenUrl;
    this.redirectUri = config.redirectUri;
    this.userInfoUrl = config.userInfoUrl;
    this.stateStore = new Map(); // In production: Redis
  }
  
  generateAuthorizationUrl(scopes = ['read']) {
    // Generate state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    
    // Generate PKCE parameters for enhanced security
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    
    // Store state and code verifier
    this.stateStore.set(state, {
      codeVerifier,
      createdAt: Date.now(),
      scopes
    });
    
    // Build authorization URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: scopes.join(' '),
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });
    
    return {
      authorizationUrl: `${this.authorizationUrl}?${params.toString()}`,
      state,
      codeVerifier
    };
  }
  
  async exchangeCodeForTokens(authorizationCode, state) {
    // Verify state parameter
    const stateData = this.stateStore.get(state);
    if (!stateData) {
      throw new Error('Invalid state parameter');
    }
    
    // Clean up state
    this.stateStore.delete(state);
    
    // Prepare token exchange request
    const tokenData = {
      grant_type: 'authorization_code',
      code: authorizationCode,
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code_verifier: stateData.codeVerifier
    };
    
    try {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams(tokenData)
      });
      
      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }
      
      const tokens = await response.json();
      
      // Get user information
      const userInfo = await this.getUserInfo(tokens.access_token);
      
      return {
        tokens,
        userInfo,
        scopes: stateData.scopes
      };
      
    } catch (error) {
      throw new Error(`OAuth flow failed: ${error.message}`);
    }
  }
  
  async getUserInfo(accessToken) {
    const response = await fetch(this.userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`User info request failed: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async refreshTokens(refreshToken) {
    const tokenData = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret
    };
    
    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams(tokenData)
    });
    
    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }
    
    return await response.json();
  }
}

// Example: GitHub OAuth integration
const githubOAuth = new OAuth2AuthorizationCodeFlow({
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  authorizationUrl: 'https://github.com/login/oauth/authorize',
  tokenUrl: 'https://github.com/login/oauth/access_token',
  redirectUri: 'http://localhost:3000/auth/github/callback',
  userInfoUrl: 'https://api.github.com/user'
});

// Express.js routes for OAuth flow
app.get('/auth/github', (req, res) => {
  const { authorizationUrl, state } = githubOAuth.generateAuthorizationUrl(['user:email']);
  
  // Store state in session for verification
  req.session.oauthState = state;
  
  res.redirect(authorizationUrl);
});

app.get('/auth/github/callback', async (req, res) => {
  const { code, state } = req.query;
  
  try {
    // Verify state matches
    if (state !== req.session.oauthState) {
      throw new Error('State mismatch');
    }
    
    // Exchange code for tokens
    const result = await githubOAuth.exchangeCodeForTokens(code, state);
    
    // Create local session or JWT
    const localTokens = jwtAuth.generateTokenPair(
      result.userInfo.login,
      {
        email: result.userInfo.email,
        name: result.userInfo.name,
        avatar: result.userInfo.avatar_url,
        provider: 'github'
      }
    );
    
    // Set secure cookie with tokens
    res.cookie('access_token', localTokens.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    res.cookie('refresh_token', localTokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.redirect('/dashboard');
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

## Session vs Token: Making the Right Choice

The choice between sessions and tokens isn't always clear-cut. Here's a practical decision framework:

### Decision Matrix

```javascript
// Authentication method selection framework
function selectAuthenticationMethod(requirements) {
  const {
    appType,
    scalabilityNeeds,
    securityLevel,
    crossDomain,
    mobileSupport,
    realTimeFeatures,
    thirdPartyIntegration
  } = requirements;
  
  // Score different approaches
  const scores = {
    session: 0,
    jwt: 0,
    oauth: 0
  };
  
  // App type considerations
  if (appType === 'traditional_web') {
    scores.session += 3;
  } else if (appType === 'spa' || appType === 'mobile') {
    scores.jwt += 3;
  }
  
  // Scalability needs
  if (scalabilityNeeds === 'high') {
    scores.jwt += 2;
    scores.session -= 1;
  }
  
  // Security requirements
  if (securityLevel === 'high') {
    scores.session += 2; // Easier to revoke
    scores.jwt += 1;     // With proper implementation
  }
  
  // Cross-domain requirements
  if (crossDomain) {
    scores.jwt += 3;
    scores.session -= 2;
  }
  
  // Mobile support
  if (mobileSupport) {
    scores.jwt += 2;
    scores.session -= 1;
  }
  
  // Third-party integration
  if (thirdPartyIntegration) {
    scores.oauth += 3;
    scores.jwt += 1;
  }
  
  // Real-time features
  if (realTimeFeatures) {
    scores.session += 1; // WebSocket integration
  }
  
  // Return recommendation
  const maxScore = Math.max(...Object.values(scores));
  const recommendation = Object.keys(scores).find(key => scores[key] === maxScore);
  
  return {
    recommendation,
    scores,
    reasoning: generateReasoning(recommendation, requirements)
  };
}

function generateReasoning(method, requirements) {
  const reasons = {
    session: [
      'Server-side control for security',
      'Immediate revocation capability',
      'Simple implementation for traditional apps'
    ],
    jwt: [
      'Stateless scalability',
      'Cross-domain support',
      'Mobile-friendly implementation'
    ],
    oauth: [
      'Third-party integration',
      'Delegated authorization',
      'Industry standard for external auth'
    ]
  };
  
  return reasons[method] || [];
}

// Example usage
const appRequirements = {
  appType: 'spa',
  scalabilityNeeds: 'high',
  securityLevel: 'medium',
  crossDomain: true,
  mobileSupport: true,
  realTimeFeatures: false,
  thirdPartyIntegration: true
};

const recommendation = selectAuthenticationMethod(appRequirements);
console.log('Recommended authentication method:', recommendation);
```

### Hybrid Approaches

Many modern applications use hybrid approaches that combine the benefits of different methods:

```javascript
// Hybrid authentication system
class HybridAuthSystem {
  constructor() {
    this.jwtManager = new JWTAuthSystem();
    this.sessionManager = new SessionAuthSystem();
    this.oauthManager = new OAuth2AuthorizationCodeFlow(oauthConfig);
  }
  
  async authenticateUser(method, credentials) {
    switch (method) {
      case 'local':
        return await this.localAuthentication(credentials);
      case 'oauth':
        return await this.oauthAuthentication(credentials);
      case 'sso':
        return await this.ssoAuthentication(credentials);
      default:
        throw new Error('Unsupported authentication method');
    }
  }
  
  async localAuthentication({ username, password, rememberMe }) {
    // Verify credentials
    const user = await this.verifyCredentials(username, password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    if (rememberMe) {
      // Use JWT for "remember me" functionality
      return {
        type: 'jwt',
        tokens: this.jwtManager.generateTokenPair(user.id, user.data),
        user: user.data
      };
    } else {
      // Use session for temporary login
      return {
        type: 'session',
        sessionId: this.sessionManager.createSession(user.id, user.data),
        user: user.data
      };
    }
  }
  
  async oauthAuthentication({ provider, code, state }) {
    // Handle OAuth flow
    const result = await this.oauthManager.exchangeCodeForTokens(code, state);
    
    // Create local JWT tokens
    const localTokens = this.jwtManager.generateTokenPair(
      result.userInfo.id,
      {
        ...result.userInfo,
        provider,
        externalTokens: result.tokens
      }
    );
    
    return {
      type: 'jwt',
      tokens: localTokens,
      user: result.userInfo,
      provider
    };
  }
  
  validateAuthentication(authData) {
    if (authData.type === 'session') {
      return this.sessionManager.validateSession(authData.sessionId);
    } else if (authData.type === 'jwt') {
      return this.jwtManager.verifyAccessToken(authData.token);
    }
    
    return { valid: false, error: 'Unknown authentication type' };
  }
}
```

## Advanced Security Considerations

### Multi-Factor Authentication (MFA)

```javascript
// MFA implementation with TOTP
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

class MFAManager {
  constructor() {
    this.userSecrets = new Map(); // In production: encrypted database storage
  }
  
  async setupMFA(userId, appName = 'MyApp') {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: userId,
      issuer: appName,
      length: 32
    });
    
    // Store secret (encrypt in production)
    this.userSecrets.set(userId, secret.base32);
    
    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    
    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes: this.generateBackupCodes(userId)
    };
  }
  
  verifyMFAToken(userId, token) {
    const secret = this.userSecrets.get(userId);
    if (!secret) {
      return false;
    }
    
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 time steps (60 seconds) tolerance
    });
  }
  
  generateBackupCodes(userId, count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    
    // Store hashed backup codes
    const hashedCodes = codes.map(code => 
      crypto.createHash('sha256').update(code).digest('hex')
    );
    
    // In production, store hashedCodes in database
    
    return codes; // Return unhashed codes to user (one time only)
  }
}

// Enhanced login with MFA
class MFAAuthSystem extends HybridAuthSystem {
  constructor() {
    super();
    this.mfaManager = new MFAManager();
  }
  
  async loginWithMFA(username, password, mfaToken = null) {
    // Step 1: Verify credentials
    const user = await this.verifyCredentials(username, password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Step 2: Check if MFA is required
    if (user.mfaEnabled) {
      if (!mfaToken) {
        // Return temporary token for MFA step
        const tempToken = this.jwtManager.generateTokenPair(
          user.id,
          { mfaPending: true, step: 'mfa_required' }
        );
        
        return {
          success: true,
          mfaRequired: true,
          tempToken: tempToken.accessToken
        };
      }
      
      // Verify MFA token
      if (!this.mfaManager.verifyMFAToken(user.id, mfaToken)) {
        throw new Error('Invalid MFA token');
      }
    }
    
    // Step 3: Complete authentication
    const tokens = this.jwtManager.generateTokenPair(user.id, user.data);
    
    return {
      success: true,
      mfaRequired: false,
      tokens,
      user: user.data
    };
  }
}
```

### Rate Limiting and Brute Force Protection

```javascript
// Rate limiting for authentication endpoints
class AuthRateLimiter {
  constructor() {
    this.attempts = new Map(); // In production: Redis with TTL
    this.maxAttempts = 5;
    this.windowMs = 15 * 60 * 1000; // 15 minutes
    this.blockDurationMs = 60 * 60 * 1000; // 1 hour
  }
  
  checkRateLimit(identifier) {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || {
      count: 0,
      firstAttempt: now,
      blockedUntil: null
    };
    
    // Check if currently blocked
    if (userAttempts.blockedUntil && now < userAttempts.blockedUntil) {
      const remainingTime = Math.ceil((userAttempts.blockedUntil - now) / 1000);
      throw new Error(`Too many attempts. Try again in ${remainingTime} seconds`);
    }
    
    // Reset if window expired
    if (now - userAttempts.firstAttempt > this.windowMs) {
      userAttempts.count = 0;
      userAttempts.firstAttempt = now;
      userAttempts.blockedUntil = null;
    }
    
    return userAttempts;
  }
  
  recordAttempt(identifier, success) {
    const userAttempts = this.checkRateLimit(identifier);
    
    if (success) {
      // Reset on successful login
      this.attempts.delete(identifier);
    } else {
      // Increment failed attempts
      userAttempts.count++;
      
      // Block if too many attempts
      if (userAttempts.count >= this.maxAttempts) {
        userAttempts.blockedUntil = Date.now() + this.blockDurationMs;
      }
      
      this.attempts.set(identifier, userAttempts);
    }
  }
}

// Protected login endpoint with rate limiting
app.post('/login', async (req, res) => {
  const { username, password, mfaToken } = req.body;
  const clientIP = req.ip;
  const identifier = `${clientIP}:${username}`;
  
  try {
    // Check rate limits
    rateLimiter.checkRateLimit(identifier);
    
    // Attempt authentication
    const result = await authSystem.loginWithMFA(username, password, mfaToken);
    
    // Record successful attempt
    rateLimiter.recordAttempt(identifier, true);
    
    res.json(result);
    
  } catch (error) {
    // Record failed attempt
    rateLimiter.recordAttempt(identifier, false);
    
    res.status(401).json({ error: error.message });
  }
});
```

## Real-World Implementation Patterns

### Microservices Authentication

```javascript
// JWT-based microservices authentication
class MicroservicesAuth {
  constructor() {
    this.publicKey = process.env.JWT_PUBLIC_KEY;
    this.serviceRegistry = new Map();
  }
  
  // Gateway authentication middleware
  authenticateRequest(req, res, next) {
    const token = this.extractToken(req);
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    try {
      // Verify token with public key
      const payload = jwt.verify(token, this.publicKey, { algorithms: ['RS256'] });
      
      // Add user context to request
      req.user = payload;
      req.permissions = payload.scope || [];
      
      next();
      
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
  
  // Service-to-service authentication
  async authenticateService(serviceId, serviceSecret) {
    // Verify service credentials
    const registeredService = this.serviceRegistry.get(serviceId);
    
    if (!registeredService || registeredService.secret !== serviceSecret) {
      throw new Error('Invalid service credentials');
    }
    
    // Generate service token
    const serviceToken = jwt.sign(
      {
        sub: serviceId,
        type: 'service',
        permissions: registeredService.permissions,
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_PRIVATE_KEY,
      { 
        algorithm: 'RS256',
        expiresIn: '1h',
        issuer: 'auth-service',
        audience: 'microservices'
      }
    );
    
    return serviceToken;
  }
  
  extractToken(req) {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    // Also check cookies for web clients
    return req.cookies?.access_token;
  }
}
```

### Progressive Web App Authentication

```javascript
// PWA-specific authentication considerations
class PWAAuthManager {
  constructor() {
    this.authSystem = new JWTAuthSystem();
    this.offlineQueue = [];
  }
  
  async authenticateWithOfflineSupport(credentials) {
    try {
      // Try online authentication first
      const result = await this.authSystem.authenticate(credentials);
      
      // Store tokens securely
      await this.storeTokensSecurely(result.tokens);
      
      // Cache user data for offline use
      await this.cacheUserData(result.user);
      
      return result;
      
    } catch (error) {
      // Check if we have cached credentials for offline mode
      if (navigator.onLine === false) {
        return await this.offlineAuthentication(credentials);
      }
      
      throw error;
    }
  }
  
  async storeTokensSecurely(tokens) {
    // Use IndexedDB for secure token storage
    const db = await this.openIndexedDB();
    const transaction = db.transaction(['tokens'], 'readwrite');
    const store = transaction.objectStore('tokens');
    
    // Encrypt tokens before storage
    const encryptedTokens = await this.encryptTokens(tokens);
    
    await store.put({
      id: 'current',
      tokens: encryptedTokens,
      timestamp: Date.now()
    });
  }
  
  async getStoredTokens() {
    const db = await this.openIndexedDB();
    const transaction = db.transaction(['tokens'], 'readonly');
    const store = transaction.objectStore('tokens');
    const result = await store.get('current');
    
    if (result) {
      return await this.decryptTokens(result.tokens);
    }
    
    return null;
  }
  
  async syncOfflineActions() {
    // Sync actions performed while offline
    if (this.offlineQueue.length > 0 && navigator.onLine) {
      for (const action of this.offlineQueue) {
        try {
          await this.executeAction(action);
        } catch (error) {
          console.error('Failed to sync offline action:', error);
        }
      }
      
      this.offlineQueue = [];
    }
  }
}
```

## Conclusion and Best Practices

Choosing the right authentication flow depends on your specific requirements, but here are the key takeaways:

### Quick Decision Guide

**Use Sessions when:**
- Building traditional web applications
- Need immediate session revocation
- Working within a single domain
- Security is paramount

**Use JWTs when:**
- Building SPAs or mobile apps
- Need cross-domain authentication
- Scalability is important
- Working with microservices

**Use OAuth 2.0 when:**
- Integrating with third-party services
- Building platforms that other apps will use
- Need delegated authorization
- Want to avoid storing user credentials

### Universal Security Principles

Regardless of which method you choose:

1. **Always use HTTPS** for authentication endpoints
2. **Implement proper rate limiting** to prevent brute force attacks
3. **Use strong, unique secrets** for signing and encryption
4. **Validate all inputs** and implement proper error handling
5. **Log authentication events** for security monitoring
6. **Keep tokens/sessions short-lived** when possible
7. **Implement proper logout** functionality
8. **Consider MFA** for sensitive applications

The authentication landscape continues to evolve, with new standards like WebAuthn and passwordless authentication gaining traction. However, understanding these fundamental flows provides the foundation for implementing any authentication system securely and effectively.

Remember: the best authentication system is one that balances security, usability, and maintainability for your specific use case. Start with the simplest approach that meets your requirements, and evolve as your needs grow.