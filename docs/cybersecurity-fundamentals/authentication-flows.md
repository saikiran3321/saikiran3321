---
sidebar_position: 2
---

# Modern Authentication Flows: OAuth2, JWT, and Session vs Token

Authentication is a critical component of modern web applications. Understanding different authentication flows and their appropriate use cases is essential for building secure, scalable applications. This guide covers the most important authentication mechanisms used today.

## Authentication Overview

### What is Authentication?

Authentication is the process of verifying the identity of a user, device, or system. It answers the question: "Who are you?" and is typically the first step in the security process, followed by authorization ("What are you allowed to do?").

### Key Authentication Concepts

#### Identity Verification
- **Something you know**: Passwords, PINs, security questions
- **Something you have**: Tokens, smart cards, mobile devices
- **Something you are**: Biometrics (fingerprints, facial recognition)

#### Authentication vs Authorization
- **Authentication**: Verifying identity ("Who are you?")
- **Authorization**: Granting permissions ("What can you do?")
- **Accounting**: Tracking actions ("What did you do?")

## Session-Based Authentication

### How Session Authentication Works

Session-based authentication stores user state on the server and uses session identifiers to track authenticated users.

```python
# Session-based authentication implementation
import uuid
import time
from typing import Dict, Optional

class SessionManager:
    def __init__(self):
        self.sessions = {}  # In production, use Redis or database
        self.session_timeout = 3600  # 1 hour
    
    def create_session(self, user_id: str, user_data: Dict) -> str:
        """Create a new session for authenticated user"""
        session_id = str(uuid.uuid4())
        
        self.sessions[session_id] = {
            'user_id': user_id,
            'user_data': user_data,
            'created_at': time.time(),
            'last_accessed': time.time(),
            'expires_at': time.time() + self.session_timeout
        }
        
        return session_id
    
    def validate_session(self, session_id: str) -> Optional[Dict]:
        """Validate session and return user data"""
        if session_id not in self.sessions:
            return None
        
        session = self.sessions[session_id]
        current_time = time.time()
        
        # Check if session expired
        if current_time > session['expires_at']:
            del self.sessions[session_id]
            return None
        
        # Update last accessed time
        session['last_accessed'] = current_time
        session['expires_at'] = current_time + self.session_timeout
        
        return session
    
    def destroy_session(self, session_id: str) -> bool:
        """Destroy a session (logout)"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False
    
    def cleanup_expired_sessions(self):
        """Remove expired sessions"""
        current_time = time.time()
        expired_sessions = [
            session_id for session_id, session in self.sessions.items()
            if current_time > session['expires_at']
        ]
        
        for session_id in expired_sessions:
            del self.sessions[session_id]

# Example Flask application with session authentication
from flask import Flask, request, session, jsonify
import hashlib
import secrets

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-in-production'

# Mock user database
users_db = {
    'john_doe': {
        'password_hash': hashlib.sha256('password123'.encode()).hexdigest(),
        'email': 'john@example.com',
        'role': 'user'
    }
}

@app.route('/login', methods=['POST'])
def login():
    """Session-based login endpoint"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    # Validate credentials
    if username in users_db:
        user = users_db[username]
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        if password_hash == user['password_hash']:
            # Create session
            session['user_id'] = username
            session['user_data'] = {
                'email': user['email'],
                'role': user['role']
            }
            
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'user': session['user_data']
            })
    
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@app.route('/profile')
def profile():
    """Protected route requiring session"""
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    
    return jsonify({
        'user_id': session['user_id'],
        'user_data': session['user_data']
    })

@app.route('/logout', methods=['POST'])
def logout():
    """Logout and destroy session"""
    session.clear()
    return jsonify({'message': 'Logged out successfully'})
```

### Session Authentication Characteristics

#### Advantages
- **Server Control**: Full control over session lifecycle
- **Security**: Session data stored securely on server
- **Revocation**: Easy to revoke sessions immediately
- **Stateful**: Server maintains user state

#### Disadvantages
- **Scalability**: Requires session storage across servers
- **Memory Usage**: Server memory consumption for sessions
- **Sticky Sessions**: Load balancer complexity
- **Cross-Domain**: Challenges with multiple domains

## Token-Based Authentication

### JSON Web Tokens (JWT)

JWT is a compact, URL-safe means of representing claims between two parties. It consists of three parts: Header, Payload, and Signature.

```python
# JWT implementation example
import jwt
import datetime
import hashlib
from typing import Dict, Optional

class JWTManager:
    def __init__(self, secret_key: str, algorithm: str = 'HS256'):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.token_expiry = 3600  # 1 hour
        self.refresh_expiry = 604800  # 7 days
    
    def generate_tokens(self, user_id: str, user_data: Dict) -> Dict[str, str]:
        """Generate access and refresh tokens"""
        current_time = datetime.datetime.utcnow()
        
        # Access token payload
        access_payload = {
            'user_id': user_id,
            'user_data': user_data,
            'iat': current_time,
            'exp': current_time + datetime.timedelta(seconds=self.token_expiry),
            'type': 'access'
        }
        
        # Refresh token payload
        refresh_payload = {
            'user_id': user_id,
            'iat': current_time,
            'exp': current_time + datetime.timedelta(seconds=self.refresh_expiry),
            'type': 'refresh'
        }
        
        # Generate tokens
        access_token = jwt.encode(access_payload, self.secret_key, algorithm=self.algorithm)
        refresh_token = jwt.encode(refresh_payload, self.secret_key, algorithm=self.algorithm)
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'expires_in': self.token_expiry
        }
    
    def verify_token(self, token: str, token_type: str = 'access') -> Optional[Dict]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(
                token, 
                self.secret_key, 
                algorithms=[self.algorithm]
            )
            
            # Verify token type
            if payload.get('type') != token_type:
                return None
            
            return payload
            
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    def refresh_access_token(self, refresh_token: str) -> Optional[Dict[str, str]]:
        """Generate new access token using refresh token"""
        payload = self.verify_token(refresh_token, 'refresh')
        
        if not payload:
            return None
        
        # Get user data (in production, fetch from database)
        user_id = payload['user_id']
        user_data = self.get_user_data(user_id)
        
        if not user_data:
            return None
        
        # Generate new access token
        return self.generate_tokens(user_id, user_data)
    
    def get_user_data(self, user_id: str) -> Optional[Dict]:
        """Fetch user data from database"""
        # Mock implementation - replace with actual database query
        users_db = {
            'john_doe': {
                'email': 'john@example.com',
                'role': 'user',
                'permissions': ['read', 'write']
            }
        }
        return users_db.get(user_id)

# Example Express.js-style API with JWT
from flask import Flask, request, jsonify
from functools import wraps

app = Flask(__name__)
jwt_manager = JWTManager('your-secret-key-change-in-production')

def token_required(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token missing'}), 401
        
        try:
            # Remove 'Bearer ' prefix
            if token.startswith('Bearer '):
                token = token[7:]
            
            payload = jwt_manager.verify_token(token)
            if not payload:
                return jsonify({'error': 'Invalid token'}), 401
            
            # Add user info to request context
            request.current_user = payload
            
        except Exception as e:
            return jsonify({'error': 'Token validation failed'}), 401
        
        return f(*args, **kwargs)
    
    return decorated

@app.route('/login', methods=['POST'])
def login():
    """JWT-based login endpoint"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    # Validate credentials (simplified)
    if username == 'john_doe' and password == 'password123':
        user_data = {
            'email': 'john@example.com',
            'role': 'user',
            'permissions': ['read', 'write']
        }
        
        tokens = jwt_manager.generate_tokens(username, user_data)
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'tokens': tokens
        })
    
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@app.route('/profile')
@token_required
def profile():
    """Protected route requiring JWT token"""
    return jsonify({
        'user_id': request.current_user['user_id'],
        'user_data': request.current_user['user_data']
    })

@app.route('/refresh', methods=['POST'])
def refresh():
    """Refresh access token using refresh token"""
    data = request.get_json()
    refresh_token = data.get('refresh_token')
    
    if not refresh_token:
        return jsonify({'error': 'Refresh token required'}), 400
    
    new_tokens = jwt_manager.refresh_access_token(refresh_token)
    
    if new_tokens:
        return jsonify({
            'success': True,
            'tokens': new_tokens
        })
    
    return jsonify({'error': 'Invalid refresh token'}), 401
```

### JWT Structure

#### Header
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

#### Payload (Claims)
```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022,
  "exp": 1516242622,
  "role": "user"
}
```

#### Signature
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

### Token Authentication Characteristics

#### Advantages
- **Stateless**: No server-side session storage required
- **Scalable**: Easy to scale across multiple servers
- **Cross-Domain**: Works across different domains
- **Mobile-Friendly**: Perfect for mobile applications
- **Decentralized**: Can be verified without central authority

#### Disadvantages
- **Token Size**: Larger than session IDs
- **Revocation**: Difficult to revoke before expiration
- **Security**: Tokens contain data (potential exposure)
- **Storage**: Client-side storage security concerns

## OAuth 2.0 Authentication

### OAuth 2.0 Overview

OAuth 2.0 is an authorization framework that enables applications to obtain limited access to user accounts. It works by delegating user authentication to the service that hosts the user account.

### OAuth 2.0 Roles

- **Resource Owner**: The user who owns the data
- **Client**: The application requesting access
- **Resource Server**: The server hosting protected resources
- **Authorization Server**: The server issuing access tokens

### OAuth 2.0 Flow Types

#### Authorization Code Flow
```python
# OAuth 2.0 Authorization Code Flow implementation
import requests
import secrets
import base64
from urllib.parse import urlencode, parse_qs

class OAuth2Client:
    def __init__(self, client_id: str, client_secret: str, 
                 authorization_url: str, token_url: str, redirect_uri: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.authorization_url = authorization_url
        self.token_url = token_url
        self.redirect_uri = redirect_uri
        self.state_store = {}  # In production, use secure storage
    
    def get_authorization_url(self, scope: str = 'read') -> Dict[str, str]:
        """Generate authorization URL for user consent"""
        
        # Generate random state for CSRF protection
        state = secrets.token_urlsafe(32)
        
        # Store state for later verification
        self.state_store[state] = {
            'created_at': time.time(),
            'scope': scope
        }
        
        # Build authorization URL
        params = {
            'response_type': 'code',
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'scope': scope,
            'state': state
        }
        
        auth_url = f"{self.authorization_url}?{urlencode(params)}"
        
        return {
            'authorization_url': auth_url,
            'state': state
        }
    
    def exchange_code_for_token(self, authorization_code: str, state: str) -> Dict:
        """Exchange authorization code for access token"""
        
        # Verify state parameter (CSRF protection)
        if state not in self.state_store:
            raise ValueError("Invalid state parameter")
        
        # Remove used state
        del self.state_store[state]
        
        # Prepare token request
        token_data = {
            'grant_type': 'authorization_code',
            'code': authorization_code,
            'redirect_uri': self.redirect_uri,
            'client_id': self.client_id,
            'client_secret': self.client_secret
        }
        
        # Request access token
        response = requests.post(
            self.token_url,
            data=token_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Token exchange failed: {response.text}")
    
    def refresh_access_token(self, refresh_token: str) -> Dict:
        """Refresh access token using refresh token"""
        
        token_data = {
            'grant_type': 'refresh_token',
            'refresh_token': refresh_token,
            'client_id': self.client_id,
            'client_secret': self.client_secret
        }
        
        response = requests.post(
            self.token_url,
            data=token_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Token refresh failed: {response.text}")
    
    def get_user_info(self, access_token: str, user_info_url: str) -> Dict:
        """Get user information using access token"""
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Accept': 'application/json'
        }
        
        response = requests.get(user_info_url, headers=headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"User info request failed: {response.text}")

# Example usage with GitHub OAuth
github_oauth = OAuth2Client(
    client_id='your_github_client_id',
    client_secret='your_github_client_secret',
    authorization_url='https://github.com/login/oauth/authorize',
    token_url='https://github.com/login/oauth/access_token',
    redirect_uri='http://localhost:3000/callback'
)

# Step 1: Get authorization URL
auth_info = github_oauth.get_authorization_url('user:email')
print(f"Visit: {auth_info['authorization_url']}")

# Step 2: After user consent, exchange code for token
# (This would be called in your callback endpoint)
# token_response = github_oauth.exchange_code_for_token(code, state)
# access_token = token_response['access_token']

# Step 3: Get user information
# user_info = github_oauth.get_user_info(access_token, 'https://api.github.com/user')
```

#### Client Credentials Flow
```python
# OAuth 2.0 Client Credentials Flow (for server-to-server)
class OAuth2ClientCredentials:
    def __init__(self, client_id: str, client_secret: str, token_url: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.token_url = token_url
    
    def get_access_token(self, scope: str = None) -> Dict:
        """Get access token using client credentials"""
        
        # Prepare credentials
        credentials = f"{self.client_id}:{self.client_secret}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        
        # Prepare request
        headers = {
            'Authorization': f'Basic {encoded_credentials}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        data = {'grant_type': 'client_credentials'}
        if scope:
            data['scope'] = scope
        
        # Request token
        response = requests.post(self.token_url, headers=headers, data=data)
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Token request failed: {response.text}")

# Example usage for API-to-API communication
api_client = OAuth2ClientCredentials(
    client_id='api_client_id',
    client_secret='api_client_secret',
    token_url='https://auth.example.com/oauth/token'
)

# Get access token for API calls
token_response = api_client.get_access_token('api:read api:write')
access_token = token_response['access_token']

# Use token for API calls
headers = {'Authorization': f'Bearer {access_token}'}
api_response = requests.get('https://api.example.com/data', headers=headers)
```

### OAuth 2.0 Security Considerations

#### PKCE (Proof Key for Code Exchange)
```python
# PKCE implementation for enhanced security
import hashlib
import base64
import secrets

class PKCEOAuth2Client(OAuth2Client):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.code_verifiers = {}
    
    def get_authorization_url_with_pkce(self, scope: str = 'read') -> Dict[str, str]:
        """Generate authorization URL with PKCE"""
        
        # Generate code verifier and challenge
        code_verifier = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode().rstrip('=')
        code_challenge = base64.urlsafe_b64encode(
            hashlib.sha256(code_verifier.encode()).digest()
        ).decode().rstrip('=')
        
        # Generate state
        state = secrets.token_urlsafe(32)
        
        # Store code verifier and state
        self.code_verifiers[state] = code_verifier
        self.state_store[state] = {
            'created_at': time.time(),
            'scope': scope
        }
        
        # Build authorization URL with PKCE
        params = {
            'response_type': 'code',
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'scope': scope,
            'state': state,
            'code_challenge': code_challenge,
            'code_challenge_method': 'S256'
        }
        
        auth_url = f"{self.authorization_url}?{urlencode(params)}"
        
        return {
            'authorization_url': auth_url,
            'state': state,
            'code_verifier': code_verifier
        }
    
    def exchange_code_for_token_with_pkce(self, authorization_code: str, state: str) -> Dict:
        """Exchange authorization code for token using PKCE"""
        
        # Verify state and get code verifier
        if state not in self.state_store or state not in self.code_verifiers:
            raise ValueError("Invalid state parameter")
        
        code_verifier = self.code_verifiers[state]
        
        # Clean up stored values
        del self.state_store[state]
        del self.code_verifiers[state]
        
        # Prepare token request with PKCE
        token_data = {
            'grant_type': 'authorization_code',
            'code': authorization_code,
            'redirect_uri': self.redirect_uri,
            'client_id': self.client_id,
            'code_verifier': code_verifier
        }
        
        # Request access token
        response = requests.post(
            self.token_url,
            data=token_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Token exchange failed: {response.text}")
```

## Session vs Token Comparison

### Detailed Comparison Matrix

| Aspect | Session-Based | Token-Based (JWT) |
|--------|---------------|-------------------|
| **Storage Location** | Server-side | Client-side |
| **Scalability** | Requires shared storage | Stateless, highly scalable |
| **Security** | Server controls all data | Token contains claims |
| **Revocation** | Immediate | Difficult until expiration |
| **Cross-Domain** | Limited by cookies | Full cross-domain support |
| **Mobile Apps** | Cookie limitations | Native support |
| **Server Memory** | High (stores sessions) | Low (stateless) |
| **Network Overhead** | Low (small session ID) | Higher (full token) |
| **Offline Capability** | None | Limited (until expiration) |

### When to Use Each Approach

#### Use Session-Based Authentication When:
```python
# Scenarios favoring session-based authentication
session_use_cases = {
    'traditional_web_apps': {
        'description': 'Server-rendered web applications',
        'benefits': ['Simple implementation', 'Server control', 'Immediate revocation']
    },
    'high_security_requirements': {
        'description': 'Banking, healthcare, government applications',
        'benefits': ['Server-side control', 'Easy audit trails', 'Immediate session termination']
    },
    'single_domain_apps': {
        'description': 'Applications within single domain',
        'benefits': ['Cookie security', 'CSRF protection', 'Simple implementation']
    },
    'real_time_applications': {
        'description': 'Chat apps, collaborative tools',
        'benefits': ['WebSocket integration', 'Real-time session management']
    }
}
```

#### Use Token-Based Authentication When:
```python
# Scenarios favoring token-based authentication
token_use_cases = {
    'mobile_applications': {
        'description': 'iOS, Android, React Native apps',
        'benefits': ['No cookie limitations', 'Offline capability', 'Cross-platform']
    },
    'microservices_architecture': {
        'description': 'Distributed systems, API gateways',
        'benefits': ['Stateless', 'Service-to-service auth', 'Scalability']
    },
    'spa_applications': {
        'description': 'React, Vue, Angular single-page apps',
        'benefits': ['API-first design', 'Client-side routing', 'Cross-domain']
    },
    'third_party_integrations': {
        'description': 'OAuth providers, external APIs',
        'benefits': ['Standard protocol', 'Delegated authorization', 'Secure']
    }
}
```

## Advanced Authentication Patterns

### Multi-Factor Authentication (MFA)

```python
# MFA implementation with TOTP
import pyotp
import qrcode
from io import BytesIO
import base64

class MFAManager:
    def __init__(self):
        self.user_secrets = {}  # In production, store in database
    
    def setup_mfa(self, user_id: str, issuer_name: str = 'MyApp') -> Dict[str, str]:
        """Setup MFA for user"""
        
        # Generate secret key
        secret = pyotp.random_base32()
        
        # Store secret for user
        self.user_secrets[user_id] = secret
        
        # Generate provisioning URI for QR code
        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(
            name=user_id,
            issuer_name=issuer_name
        )
        
        # Generate QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        
        qr_image = qr.make_image(fill_color="black", back_color="white")
        
        # Convert QR code to base64 for display
        buffer = BytesIO()
        qr_image.save(buffer, format='PNG')
        qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return {
            'secret': secret,
            'qr_code': qr_code_base64,
            'provisioning_uri': provisioning_uri
        }
    
    def verify_mfa_token(self, user_id: str, token: str) -> bool:
        """Verify MFA token"""
        
        if user_id not in self.user_secrets:
            return False
        
        secret = self.user_secrets[user_id]
        totp = pyotp.TOTP(secret)
        
        # Verify token (with 30-second window tolerance)
        return totp.verify(token, valid_window=1)
    
    def generate_backup_codes(self, user_id: str, count: int = 10) -> List[str]:
        """Generate backup codes for MFA"""
        
        backup_codes = []
        for _ in range(count):
            code = secrets.token_hex(4).upper()
            backup_codes.append(code)
        
        # In production, hash and store these codes
        hashed_codes = [
            hashlib.sha256(code.encode()).hexdigest() 
            for code in backup_codes
        ]
        
        # Store hashed backup codes
        if user_id not in self.user_secrets:
            self.user_secrets[user_id] = {}
        
        self.user_secrets[user_id]['backup_codes'] = hashed_codes
        
        return backup_codes

# Enhanced authentication with MFA
class EnhancedAuthSystem:
    def __init__(self):
        self.jwt_manager = JWTManager('secret-key')
        self.mfa_manager = MFAManager()
        self.users_db = {}
    
    def login_step1(self, username: str, password: str) -> Dict:
        """First step of login - verify credentials"""
        
        # Verify username and password
        if not self.verify_credentials(username, password):
            return {'success': False, 'error': 'Invalid credentials'}
        
        user = self.users_db[username]
        
        # Check if MFA is enabled
        if user.get('mfa_enabled'):
            # Generate temporary token for MFA step
            temp_token = self.jwt_manager.generate_tokens(
                username, 
                {'mfa_pending': True}
            )
            
            return {
                'success': True,
                'mfa_required': True,
                'temp_token': temp_token['access_token']
            }
        else:
            # Complete login without MFA
            tokens = self.jwt_manager.generate_tokens(username, user)
            return {
                'success': True,
                'mfa_required': False,
                'tokens': tokens
            }
    
    def login_step2_mfa(self, temp_token: str, mfa_code: str) -> Dict:
        """Second step of login - verify MFA"""
        
        # Verify temporary token
        payload = self.jwt_manager.verify_token(temp_token)
        if not payload or not payload.get('user_data', {}).get('mfa_pending'):
            return {'success': False, 'error': 'Invalid temporary token'}
        
        username = payload['user_id']
        
        # Verify MFA code
        if not self.mfa_manager.verify_mfa_token(username, mfa_code):
            return {'success': False, 'error': 'Invalid MFA code'}
        
        # Generate final tokens
        user_data = self.users_db[username]
        tokens = self.jwt_manager.generate_tokens(username, user_data)
        
        return {
            'success': True,
            'tokens': tokens
        }
    
    def verify_credentials(self, username: str, password: str) -> bool:
        """Verify username and password"""
        if username not in self.users_db:
            return False
        
        user = self.users_db[username]
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        return password_hash == user['password_hash']
```

### Single Sign-On (SSO)

```python
# SAML SSO implementation example
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
import base64
import zlib

class SAMLSSOProvider:
    def __init__(self, entity_id: str, sso_url: str, certificate: str):
        self.entity_id = entity_id
        self.sso_url = sso_url
        self.certificate = certificate
    
    def create_saml_request(self, sp_entity_id: str, acs_url: str) -> str:
        """Create SAML authentication request"""
        
        request_id = f"_{secrets.token_hex(16)}"
        issue_instant = datetime.utcnow().isoformat() + 'Z'
        
        # Build SAML request XML
        saml_request = f"""
        <samlp:AuthnRequest
            xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
            xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
            ID="{request_id}"
            Version="2.0"
            IssueInstant="{issue_instant}"
            Destination="{self.sso_url}"
            AssertionConsumerServiceURL="{acs_url}">
            <saml:Issuer>{sp_entity_id}</saml:Issuer>
            <samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress"/>
        </samlp:AuthnRequest>
        """
        
        # Compress and encode
        compressed = zlib.compress(saml_request.encode())
        encoded = base64.b64encode(compressed).decode()
        
        return encoded
    
    def parse_saml_response(self, saml_response: str) -> Dict:
        """Parse and validate SAML response"""
        
        # Decode and decompress
        decoded = base64.b64decode(saml_response)
        xml_response = zlib.decompress(decoded).decode()
        
        # Parse XML
        root = ET.fromstring(xml_response)
        
        # Extract user attributes
        attributes = {}
        for attr in root.findall('.//saml:Attribute', namespaces={'saml': 'urn:oasis:names:tc:SAML:2.0:assertion'}):
            attr_name = attr.get('Name')
            attr_value = attr.find('.//saml:AttributeValue', namespaces={'saml': 'urn:oasis:names:tc:SAML:2.0:assertion'}).text
            attributes[attr_name] = attr_value
        
        return {
            'success': True,
            'attributes': attributes,
            'name_id': attributes.get('email', 'unknown')
        }
```

## Best Practices and Security Considerations

### Token Security Best Practices

```python
# Secure token handling implementation
class SecureTokenHandler:
    def __init__(self):
        self.blacklisted_tokens = set()  # In production, use Redis
        self.token_rotation_threshold = 1800  # 30 minutes
    
    def create_secure_token(self, user_id: str, user_data: Dict) -> Dict:
        """Create token with security enhancements"""
        
        current_time = datetime.datetime.utcnow()
        
        # Add security claims
        payload = {
            'user_id': user_id,
            'user_data': user_data,
            'iat': current_time,
            'exp': current_time + datetime.timedelta(seconds=3600),
            'jti': secrets.token_hex(16),  # JWT ID for tracking
            'aud': 'myapp.com',  # Audience
            'iss': 'auth.myapp.com',  # Issuer
            'sub': user_id,  # Subject
            'scope': user_data.get('permissions', [])
        }
        
        return jwt.encode(payload, 'secret-key', algorithm='HS256')
    
    def validate_token_security(self, token: str) -> Dict:
        """Comprehensive token validation"""
        
        try:
            # Check if token is blacklisted
            if token in self.blacklisted_tokens:
                return {'valid': False, 'error': 'Token revoked'}
            
            # Decode and validate
            payload = jwt.decode(token, 'secret-key', algorithms=['HS256'])
            
            # Validate audience
            if payload.get('aud') != 'myapp.com':
                return {'valid': False, 'error': 'Invalid audience'}
            
            # Validate issuer
            if payload.get('iss') != 'auth.myapp.com':
                return {'valid': False, 'error': 'Invalid issuer'}
            
            # Check if token should be rotated
            issued_at = datetime.datetime.fromtimestamp(payload['iat'])
            if (datetime.datetime.utcnow() - issued_at).seconds > self.token_rotation_threshold:
                return {
                    'valid': True,
                    'payload': payload,
                    'should_rotate': True
                }
            
            return {
                'valid': True,
                'payload': payload,
                'should_rotate': False
            }
            
        except jwt.ExpiredSignatureError:
            return {'valid': False, 'error': 'Token expired'}
        except jwt.InvalidTokenError:
            return {'valid': False, 'error': 'Invalid token'}
    
    def revoke_token(self, token: str):
        """Revoke a token (add to blacklist)"""
        self.blacklisted_tokens.add(token)
    
    def cleanup_blacklist(self):
        """Remove expired tokens from blacklist"""
        # In production, implement proper cleanup based on token expiration
        pass
```

### Security Headers and CSRF Protection

```python
# Security middleware for authentication
from flask import Flask, request, jsonify, make_response
import secrets

class SecurityMiddleware:
    def __init__(self, app: Flask):
        self.app = app
        self.csrf_tokens = {}
        self.setup_security_headers()
    
    def setup_security_headers(self):
        """Setup security headers"""
        
        @self.app.after_request
        def add_security_headers(response):
            # CSRF protection
            response.headers['X-Content-Type-Options'] = 'nosniff'
            response.headers['X-Frame-Options'] = 'DENY'
            response.headers['X-XSS-Protection'] = '1; mode=block'
            response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
            
            # CORS headers (configure based on your needs)
            response.headers['Access-Control-Allow-Origin'] = 'https://yourdomain.com'
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-CSRF-Token'
            
            return response
    
    def generate_csrf_token(self, session_id: str) -> str:
        """Generate CSRF token for session"""
        csrf_token = secrets.token_urlsafe(32)
        self.csrf_tokens[session_id] = {
            'token': csrf_token,
            'created_at': time.time()
        }
        return csrf_token
    
    def validate_csrf_token(self, session_id: str, provided_token: str) -> bool:
        """Validate CSRF token"""
        if session_id not in self.csrf_tokens:
            return False
        
        stored_data = self.csrf_tokens[session_id]
        
        # Check token age (expire after 1 hour)
        if time.time() - stored_data['created_at'] > 3600:
            del self.csrf_tokens[session_id]
            return False
        
        return secrets.compare_digest(stored_data['token'], provided_token)
```

## Implementation Guidelines

### Choosing the Right Authentication Method

```python
def choose_authentication_method(requirements: Dict) -> str:
    """Decision framework for authentication method selection"""
    
    # Analyze requirements
    app_type = requirements.get('app_type')
    scalability_needs = requirements.get('scalability', 'medium')
    security_level = requirements.get('security_level', 'medium')
    cross_domain = requirements.get('cross_domain', False)
    mobile_support = requirements.get('mobile_support', False)
    
    # Decision logic
    if mobile_support or cross_domain or scalability_needs == 'high':
        if security_level == 'high':
            return 'jwt_with_refresh_tokens'
        else:
            return 'jwt_simple'
    
    elif app_type == 'traditional_web' and security_level == 'high':
        return 'session_based'
    
    elif requirements.get('third_party_integration'):
        return 'oauth2'
    
    else:
        return 'session_based'  # Default for simple applications

# Example usage
app_requirements = {
    'app_type': 'spa',
    'scalability': 'high',
    'security_level': 'high',
    'cross_domain': True,
    'mobile_support': True,
    'third_party_integration': False
}

recommended_auth = choose_authentication_method(app_requirements)
print(f"Recommended authentication: {recommended_auth}")
```

### Security Checklist

#### Session-Based Security
- [ ] Use HTTPS for all authentication endpoints
- [ ] Implement proper session timeout
- [ ] Use secure, httpOnly cookies
- [ ] Implement CSRF protection
- [ ] Validate session on every request
- [ ] Implement proper logout functionality
- [ ] Use secure session storage (Redis, database)

#### Token-Based Security
- [ ] Use strong signing algorithms (RS256, ES256)
- [ ] Implement proper token expiration
- [ ] Use refresh token rotation
- [ ] Validate all token claims
- [ ] Implement token blacklisting for revocation
- [ ] Store tokens securely on client
- [ ] Implement proper error handling

#### OAuth 2.0 Security
- [ ] Use PKCE for public clients
- [ ] Validate state parameter
- [ ] Use HTTPS for all OAuth endpoints
- [ ] Implement proper scope validation
- [ ] Validate redirect URIs
- [ ] Use short-lived access tokens
- [ ] Implement proper error handling

Understanding these authentication flows and their security implications is crucial for building secure, scalable applications that protect user data and provide excellent user experience.