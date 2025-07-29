# Practical Implementations and Real-World Examples

This section provides practical implementations and real-world examples of encoding, encryption, and hashing in various scenarios. These examples demonstrate how to properly apply each technique in production environments.

## Web Application Security

### Secure User Registration and Login System

```python
import hashlib
import secrets
import time
import re
from typing import Optional, Dict, Any
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64

class SecureWebAuthSystem:
    def __init__(self):
        self.users_db = {}  # In production, use a proper database
        self.sessions = {}
        self.failed_attempts = {}
        
        # Generate application encryption key (store securely in production)
        self.app_key = Fernet.generate_key()
        self.cipher = Fernet(self.app_key)
    
    def register_user(self, username: str, email: str, password: str) -> Dict[str, Any]:
        """Secure user registration with validation"""
        
        # Input validation
        validation_result = self._validate_registration_input(username, email, password)
        if not validation_result['valid']:
            return validation_result
        
        # Check if user already exists
        if username in self.users_db:
            return {'success': False, 'error': 'Username already exists'}
        
        # Generate salt and hash password
        salt = secrets.token_hex(32)
        password_hash = self._hash_password(password, salt)
        
        # Encrypt sensitive data (email)
        encrypted_email = self.cipher.encrypt(email.encode()).decode()
        
        # Store user data
        self.users_db[username] = {
            'password_hash': password_hash,
            'salt': salt,
            'email_encrypted': encrypted_email,
            'created_at': time.time(),
            'last_login': None,
            'login_count': 0,
            'account_locked': False,
            'failed_login_attempts': 0
        }
        
        return {'success': True, 'message': 'User registered successfully'}
    
    def login_user(self, username: str, password: str) -> Dict[str, Any]:
        """Secure user login with rate limiting"""
        
        # Check if user exists
        if username not in self.users_db:
            return {'success': False, 'error': 'Invalid credentials'}
        
        user = self.users_db[username]
        
        # Check account lock status
        if user['account_locked']:
            return {'success': False, 'error': 'Account locked due to multiple failed attempts'}
        
        # Check rate limiting
        if not self._check_rate_limit(username):
            return {'success': False, 'error': 'Too many login attempts. Please try again later.'}
        
        # Verify password
        if self._verify_password(password, user['password_hash'], user['salt']):
            # Successful login
            session_token = self._create_session(username)
            
            # Update user data
            user['last_login'] = time.time()
            user['login_count'] += 1
            user['failed_login_attempts'] = 0
            
            # Clear failed attempts tracking
            if username in self.failed_attempts:
                del self.failed_attempts[username]
            
            return {
                'success': True,
                'session_token': session_token,
                'message': 'Login successful'
            }
        else:
            # Failed login
            user['failed_login_attempts'] += 1
            
            # Lock account after 5 failed attempts
            if user['failed_login_attempts'] >= 5:
                user['account_locked'] = True
            
            # Track failed attempts for rate limiting
            self._track_failed_attempt(username)
            
            return {'success': False, 'error': 'Invalid credentials'}
    
    def get_user_profile(self, session_token: str) -> Dict[str, Any]:
        """Get user profile data (decrypt sensitive information)"""
        
        username = self._validate_session(session_token)
        if not username:
            return {'success': False, 'error': 'Invalid session'}
        
        user = self.users_db[username]
        
        # Decrypt email
        decrypted_email = self.cipher.decrypt(user['email_encrypted'].encode()).decode()
        
        return {
            'success': True,
            'profile': {
                'username': username,
                'email': decrypted_email,
                'last_login': user['last_login'],
                'login_count': user['login_count'],
                'member_since': user['created_at']
            }
        }
    
    def _validate_registration_input(self, username: str, email: str, password: str) -> Dict[str, Any]:
        """Validate registration input"""
        
        # Username validation
        if len(username) < 3 or len(username) > 20:
            return {'valid': False, 'error': 'Username must be 3-20 characters'}
        
        if not re.match(r'^[a-zA-Z0-9_]+$', username):
            return {'valid': False, 'error': 'Username can only contain letters, numbers, and underscores'}
        
        # Email validation
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return {'valid': False, 'error': 'Invalid email format'}
        
        # Password validation
        if len(password) < 8:
            return {'valid': False, 'error': 'Password must be at least 8 characters'}
        
        if not re.search(r'[A-Z]', password):
            return {'valid': False, 'error': 'Password must contain at least one uppercase letter'}
        
        if not re.search(r'[a-z]', password):
            return {'valid': False, 'error': 'Password must contain at least one lowercase letter'}
        
        if not re.search(r'\d', password):
            return {'valid': False, 'error': 'Password must contain at least one number'}
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            return {'valid': False, 'error': 'Password must contain at least one special character'}
        
        return {'valid': True}
    
    def _hash_password(self, password: str, salt: str) -> str:
        """Hash password using PBKDF2 with SHA-256"""
        return hashlib.pbkdf2_hmac(
            'sha256',
            password.encode(),
            salt.encode(),
            100000  # iterations
        ).hex()
    
    def _verify_password(self, password: str, stored_hash: str, salt: str) -> bool:
        """Verify password against stored hash"""
        password_hash = self._hash_password(password, salt)
        return secrets.compare_digest(password_hash, stored_hash)
    
    def _create_session(self, username: str) -> str:
        """Create secure session token"""
        session_token = secrets.token_urlsafe(32)
        
        self.sessions[session_token] = {
            'username': username,
            'created_at': time.time(),
            'expires_at': time.time() + 3600  # 1 hour
        }
        
        return session_token
    
    def _validate_session(self, session_token: str) -> Optional[str]:
        """Validate session token"""
        if session_token not in self.sessions:
            return None
        
        session = self.sessions[session_token]
        
        # Check if session expired
        if time.time() > session['expires_at']:
            del self.sessions[session_token]
            return None
        
        return session['username']
    
    def _check_rate_limit(self, username: str) -> bool:
        """Check if user is within rate limits"""
        if username not in self.failed_attempts:
            return True
        
        attempts = self.failed_attempts[username]
        current_time = time.time()
        
        # Remove attempts older than 15 minutes
        recent_attempts = [attempt for attempt in attempts if current_time - attempt < 900]
        self.failed_attempts[username] = recent_attempts
        
        # Allow max 5 attempts per 15 minutes
        return len(recent_attempts) < 5
    
    def _track_failed_attempt(self, username: str):
        """Track failed login attempt"""
        if username not in self.failed_attempts:
            self.failed_attempts[username] = []
        
        self.failed_attempts[username].append(time.time())

# Example usage
auth_system = SecureWebAuthSystem()

# Register a user
registration_result = auth_system.register_user(
    "john_doe",
    "john@example.com",
    "SecurePass123!"
)
print(f"Registration: {registration_result}")

# Login user
login_result = auth_system.login_user("john_doe", "SecurePass123!")
print(f"Login: {login_result}")

if login_result['success']:
    # Get user profile
    profile_result = auth_system.get_user_profile(login_result['session_token'])
    print(f"Profile: {profile_result}")
```

### API Security Implementation

```python
import hmac
import hashlib
import time
import json
from urllib.parse import quote, unquote

class APISecuritySystem:
    def __init__(self, api_secret: str):
        self.api_secret = api_secret
        
    def generate_api_signature(self, method: str, endpoint: str, 
                             params: Dict[str, Any], timestamp: int) -> str:
        """Generate HMAC signature for API request"""
        
        # Sort parameters
        sorted_params = sorted(params.items())
        
        # Create query string
        query_string = '&'.join([f"{k}={quote(str(v))}" for k, v in sorted_params])
        
        # Create string to sign
        string_to_sign = f"{method.upper()}\n{endpoint}\n{query_string}\n{timestamp}"
        
        # Generate HMAC signature
        signature = hmac.new(
            self.api_secret.encode(),
            string_to_sign.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return signature
    
    def verify_api_signature(self, method: str, endpoint: str, 
                           params: Dict[str, Any], timestamp: int, 
                           provided_signature: str) -> bool:
        """Verify API request signature"""
        
        # Check timestamp (prevent replay attacks)
        current_time = int(time.time())
        if abs(current_time - timestamp) > 300:  # 5 minutes tolerance
            return False
        
        # Generate expected signature
        expected_signature = self.generate_api_signature(method, endpoint, params, timestamp)
        
        # Compare signatures using constant-time comparison
        return hmac.compare_digest(expected_signature, provided_signature)
    
    def create_api_request(self, method: str, endpoint: str, 
                          params: Dict[str, Any]) -> Dict[str, Any]:
        """Create signed API request"""
        
        timestamp = int(time.time())
        signature = self.generate_api_signature(method, endpoint, params, timestamp)
        
        return {
            'method': method,
            'endpoint': endpoint,
            'params': params,
            'timestamp': timestamp,
            'signature': signature
        }

# Example usage
api_security = APISecuritySystem("your-secret-api-key")

# Create signed API request
request_data = api_security.create_api_request(
    "POST",
    "/api/v1/users",
    {"name": "John Doe", "email": "john@example.com"}
)

print(f"Signed API Request: {json.dumps(request_data, indent=2)}")

# Verify signature
is_valid = api_security.verify_api_signature(
    request_data['method'],
    request_data['endpoint'],
    request_data['params'],
    request_data['timestamp'],
    request_data['signature']
)

print(f"Signature valid: {is_valid}")
```

## File and Data Protection

### Secure File Storage System

```python
import os
import json
import gzip
from pathlib import Path
from cryptography.fernet import Fernet

class SecureFileStorage:
    def __init__(self, storage_path: str, encryption_key: bytes = None):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(exist_ok=True)
        
        # Initialize encryption
        if encryption_key:
            self.cipher = Fernet(encryption_key)
        else:
            self.cipher = Fernet(Fernet.generate_key())
        
        # Metadata storage
        self.metadata_file = self.storage_path / "metadata.json"
        self.metadata = self._load_metadata()
    
    def store_file(self, file_id: str, data: bytes, compress: bool = True) -> Dict[str, Any]:
        """Store file with encryption and optional compression"""
        
        # Compress data if requested
        if compress:
            data = gzip.compress(data)
        
        # Encrypt data
        encrypted_data = self.cipher.encrypt(data)
        
        # Calculate integrity hash
        integrity_hash = hashlib.sha256(data).hexdigest()
        
        # Store encrypted file
        file_path = self.storage_path / f"{file_id}.enc"
        with open(file_path, 'wb') as f:
            f.write(encrypted_data)
        
        # Update metadata
        self.metadata[file_id] = {
            'file_path': str(file_path),
            'integrity_hash': integrity_hash,
            'compressed': compress,
            'size_original': len(data),
            'size_encrypted': len(encrypted_data),
            'created_at': time.time()
        }
        
        self._save_metadata()
        
        return {
            'success': True,
            'file_id': file_id,
            'integrity_hash': integrity_hash,
            'size_reduction': (1 - len(encrypted_data) / len(data)) * 100 if compress else 0
        }
    
    def retrieve_file(self, file_id: str) -> Dict[str, Any]:
        """Retrieve and decrypt file with integrity verification"""
        
        if file_id not in self.metadata:
            return {'success': False, 'error': 'File not found'}
        
        file_info = self.metadata[file_id]
        file_path = Path(file_info['file_path'])
        
        if not file_path.exists():
            return {'success': False, 'error': 'File data missing'}
        
        try:
            # Read encrypted file
            with open(file_path, 'rb') as f:
                encrypted_data = f.read()
            
            # Decrypt data
            decrypted_data = self.cipher.decrypt(encrypted_data)
            
            # Decompress if needed
            if file_info['compressed']:
                decrypted_data = gzip.decompress(decrypted_data)
            
            # Verify integrity
            calculated_hash = hashlib.sha256(decrypted_data).hexdigest()
            stored_hash = file_info['integrity_hash']
            
            if calculated_hash != stored_hash:
                return {
                    'success': False,
                    'error': 'File integrity check failed',
                    'expected_hash': stored_hash,
                    'actual_hash': calculated_hash
                }
            
            return {
                'success': True,
                'data': decrypted_data,
                'metadata': file_info,
                'integrity_verified': True
            }
            
        except Exception as e:
            return {'success': False, 'error': f'Decryption failed: {str(e)}'}
    
    def delete_file(self, file_id: str) -> bool:
        """Securely delete file"""
        
        if file_id not in self.metadata:
            return False
        
        file_info = self.metadata[file_id]
        file_path = Path(file_info['file_path'])
        
        # Secure deletion (overwrite before delete)
        if file_path.exists():
            file_size = file_path.stat().st_size
            
            # Overwrite with random data
            with open(file_path, 'wb') as f:
                f.write(os.urandom(file_size))
            
            # Delete file
            file_path.unlink()
        
        # Remove from metadata
        del self.metadata[file_id]
        self._save_metadata()
        
        return True
    
    def list_files(self) -> Dict[str, Any]:
        """List all stored files with metadata"""
        
        file_list = {}
        total_size_original = 0
        total_size_encrypted = 0
        
        for file_id, info in self.metadata.items():
            file_list[file_id] = {
                'created_at': info['created_at'],
                'size_original': info['size_original'],
                'size_encrypted': info['size_encrypted'],
                'compressed': info['compressed'],
                'compression_ratio': (1 - info['size_encrypted'] / info['size_original']) * 100
            }
            
            total_size_original += info['size_original']
            total_size_encrypted += info['size_encrypted']
        
        return {
            'files': file_list,
            'total_files': len(file_list),
            'total_size_original': total_size_original,
            'total_size_encrypted': total_size_encrypted,
            'overall_compression': (1 - total_size_encrypted / max(total_size_original, 1)) * 100
        }
    
    def _load_metadata(self) -> Dict[str, Any]:
        """Load metadata from file"""
        if self.metadata_file.exists():
            with open(self.metadata_file, 'r') as f:
                return json.load(f)
        return {}
    
    def _save_metadata(self):
        """Save metadata to file"""
        with open(self.metadata_file, 'w') as f:
            json.dump(self.metadata, f, indent=2)

# Example usage
storage = SecureFileStorage("secure_storage")

# Store a file
test_data = b"This is sensitive data that needs to be protected!"
result = storage.store_file("document_001", test_data, compress=True)
print(f"Storage result: {result}")

# Retrieve the file
retrieved = storage.retrieve_file("document_001")
if retrieved['success']:
    print(f"Retrieved data: {retrieved['data'].decode()}")
    print(f"Integrity verified: {retrieved['integrity_verified']}")

# List all files
file_list = storage.list_files()
print(f"File list: {json.dumps(file_list, indent=2)}")
```

## Database Security

### Secure Database Operations

```python
import sqlite3
import json
from typing import List, Dict, Any, Optional

class SecureDatabaseManager:
    def __init__(self, db_path: str, encryption_key: bytes):
        self.db_path = db_path
        self.cipher = Fernet(encryption_key)
        self.init_database()
    
    def init_database(self):
        """Initialize database with secure schema"""
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Users table with encrypted sensitive data
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    salt TEXT NOT NULL,
                    email_encrypted TEXT NOT NULL,
                    phone_encrypted TEXT,
                    created_at REAL NOT NULL,
                    last_login REAL,
                    is_active BOOLEAN DEFAULT 1,
                    data_hash TEXT NOT NULL
                )
            ''')
            
            # Audit log table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS audit_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    action TEXT NOT NULL,
                    table_name TEXT NOT NULL,
                    record_id TEXT,
                    old_values_hash TEXT,
                    new_values_hash TEXT,
                    timestamp REAL NOT NULL,
                    ip_address TEXT,
                    user_agent TEXT
                )
            ''')
            
            conn.commit()
    
    def create_user(self, username: str, password: str, email: str, 
                   phone: str = None, audit_info: Dict = None) -> Dict[str, Any]:
        """Create user with encrypted sensitive data"""
        
        try:
            # Generate salt and hash password
            salt = secrets.token_hex(32)
            password_hash = self._hash_password(password, salt)
            
            # Encrypt sensitive data
            email_encrypted = self.cipher.encrypt(email.encode()).decode()
            phone_encrypted = self.cipher.encrypt(phone.encode()).decode() if phone else None
            
            # Create data for integrity hash
            user_data = {
                'username': username,
                'email': email,
                'phone': phone,
                'created_at': time.time()
            }
            data_hash = hashlib.sha256(json.dumps(user_data, sort_keys=True).encode()).hexdigest()
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute('''
                    INSERT INTO users (username, password_hash, salt, email_encrypted, 
                                     phone_encrypted, created_at, data_hash)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (username, password_hash, salt, email_encrypted, 
                     phone_encrypted, time.time(), data_hash))
                
                user_id = cursor.lastrowid
                
                # Log audit trail
                self._log_audit_action(
                    cursor, user_id, 'CREATE', 'users', str(user_id),
                    None, data_hash, audit_info
                )
                
                conn.commit()
                
                return {'success': True, 'user_id': user_id}
                
        except sqlite3.IntegrityError:
            return {'success': False, 'error': 'Username already exists'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def get_user(self, username: str, verify_integrity: bool = True) -> Dict[str, Any]:
        """Retrieve user with decrypted data and integrity verification"""
        
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
            row = cursor.fetchone()
            
            if not row:
                return {'success': False, 'error': 'User not found'}
            
            try:
                # Decrypt sensitive data
                email = self.cipher.decrypt(row['email_encrypted'].encode()).decode()
                phone = None
                if row['phone_encrypted']:
                    phone = self.cipher.decrypt(row['phone_encrypted'].encode()).decode()
                
                # Verify data integrity if requested
                if verify_integrity:
                    user_data = {
                        'username': row['username'],
                        'email': email,
                        'phone': phone,
                        'created_at': row['created_at']
                    }
                    calculated_hash = hashlib.sha256(
                        json.dumps(user_data, sort_keys=True).encode()
                    ).hexdigest()
                    
                    if calculated_hash != row['data_hash']:
                        return {
                            'success': False,
                            'error': 'Data integrity check failed',
                            'expected_hash': row['data_hash'],
                            'calculated_hash': calculated_hash
                        }
                
                return {
                    'success': True,
                    'user': {
                        'id': row['id'],
                        'username': row['username'],
                        'email': email,
                        'phone': phone,
                        'created_at': row['created_at'],
                        'last_login': row['last_login'],
                        'is_active': bool(row['is_active'])
                    },
                    'integrity_verified': verify_integrity
                }
                
            except Exception as e:
                return {'success': False, 'error': f'Decryption failed: {str(e)}'}
    
    def authenticate_user(self, username: str, password: str, 
                         audit_info: Dict = None) -> Dict[str, Any]:
        """Authenticate user and log attempt"""
        
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute(
                'SELECT id, password_hash, salt, is_active FROM users WHERE username = ?',
                (username,)
            )
            row = cursor.fetchone()
            
            if not row:
                # Log failed attempt
                self._log_audit_action(
                    cursor, None, 'LOGIN_FAILED', 'users', username,
                    None, None, audit_info, 'User not found'
                )
                conn.commit()
                return {'success': False, 'error': 'Invalid credentials'}
            
            if not row['is_active']:
                # Log failed attempt
                self._log_audit_action(
                    cursor, row['id'], 'LOGIN_FAILED', 'users', str(row['id']),
                    None, None, audit_info, 'Account inactive'
                )
                conn.commit()
                return {'success': False, 'error': 'Account inactive'}
            
            # Verify password
            if self._verify_password(password, row['password_hash'], row['salt']):
                # Update last login
                cursor.execute(
                    'UPDATE users SET last_login = ? WHERE id = ?',
                    (time.time(), row['id'])
                )
                
                # Log successful login
                self._log_audit_action(
                    cursor, row['id'], 'LOGIN_SUCCESS', 'users', str(row['id']),
                    None, None, audit_info
                )
                
                conn.commit()
                return {'success': True, 'user_id': row['id']}
            else:
                # Log failed attempt
                self._log_audit_action(
                    cursor, row['id'], 'LOGIN_FAILED', 'users', str(row['id']),
                    None, None, audit_info, 'Invalid password'
                )
                conn.commit()
                return {'success': False, 'error': 'Invalid credentials'}
    
    def get_audit_log(self, user_id: Optional[int] = None, 
                     action: Optional[str] = None, 
                     limit: int = 100) -> List[Dict[str, Any]]:
        """Retrieve audit log entries"""
        
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            query = 'SELECT * FROM audit_log WHERE 1=1'
            params = []
            
            if user_id:
                query += ' AND user_id = ?'
                params.append(user_id)
            
            if action:
                query += ' AND action = ?'
                params.append(action)
            
            query += ' ORDER BY timestamp DESC LIMIT ?'
            params.append(limit)
            
            cursor.execute(query, params)
            rows = cursor.fetchall()
            
            return [dict(row) for row in rows]
    
    def _hash_password(self, password: str, salt: str) -> str:
        """Hash password using PBKDF2"""
        return hashlib.pbkdf2_hmac(
            'sha256',
            password.encode(),
            salt.encode(),
            100000
        ).hex()
    
    def _verify_password(self, password: str, stored_hash: str, salt: str) -> bool:
        """Verify password against stored hash"""
        password_hash = self._hash_password(password, salt)
        return secrets.compare_digest(password_hash, stored_hash)
    
    def _log_audit_action(self, cursor, user_id: Optional[int], action: str, 
                         table_name: str, record_id: str,
                         old_values_hash: Optional[str], new_values_hash: Optional[str],
                         audit_info: Optional[Dict] = None, notes: str = None):
        """Log audit action"""
        
        ip_address = audit_info.get('ip_address') if audit_info else None
        user_agent = audit_info.get('user_agent') if audit_info else None
        
        cursor.execute('''
            INSERT INTO audit_log (user_id, action, table_name, record_id,
                                 old_values_hash, new_values_hash, timestamp,
                                 ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, action, table_name, record_id, old_values_hash,
              new_values_hash, time.time(), ip_address, user_agent))

# Example usage
encryption_key = Fernet.generate_key()
db_manager = SecureDatabaseManager("secure_app.db", encryption_key)

# Create user
audit_info = {
    'ip_address': '192.168.1.100',
    'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

create_result = db_manager.create_user(
    "john_doe",
    "SecurePassword123!",
    "john@example.com",
    "+1234567890",
    audit_info
)
print(f"User creation: {create_result}")

# Authenticate user
auth_result = db_manager.authenticate_user("john_doe", "SecurePassword123!", audit_info)
print(f"Authentication: {auth_result}")

# Get user data
user_data = db_manager.get_user("john_doe")
print(f"User data: {user_data}")

# Get audit log
audit_log = db_manager.get_audit_log(limit=5)
print(f"Recent audit entries: {len(audit_log)}")
```

## Blockchain and Cryptocurrency

### Simple Blockchain Implementation

```python
import hashlib
import json
import time
from typing import List, Dict, Any, Optional

class Block:
    def __init__(self, index: int, transactions: List[Dict], previous_hash: str, nonce: int = 0):
        self.index = index
        self.timestamp = time.time()
        self.transactions = transactions
        self.previous_hash = previous_hash
        self.nonce = nonce
        self.hash = self.calculate_hash()
    
    def calculate_hash(self) -> str:
        """Calculate block hash"""
        block_string = json.dumps({
            'index': self.index,
            'timestamp': self.timestamp,
            'transactions': self.transactions,
            'previous_hash': self.previous_hash,
            'nonce': self.nonce
        }, sort_keys=True)
        
        return hashlib.sha256(block_string.encode()).hexdigest()
    
    def mine_block(self, difficulty: int):
        """Mine block with proof of work"""
        target = "0" * difficulty
        
        while self.hash[:difficulty] != target:
            self.nonce += 1
            self.hash = self.calculate_hash()
        
        print(f"Block mined: {self.hash}")

class SimpleBlockchain:
    def __init__(self):
        self.chain = [self.create_genesis_block()]
        self.difficulty = 4
        self.pending_transactions = []
        self.mining_reward = 100
    
    def create_genesis_block(self) -> Block:
        """Create the first block in the chain"""
        return Block(0, [], "0")
    
    def get_latest_block(self) -> Block:
        """Get the latest block in the chain"""
        return self.chain[-1]
    
    def add_transaction(self, transaction: Dict[str, Any]):
        """Add transaction to pending transactions"""
        
        # Validate transaction
        if self.validate_transaction(transaction):
            self.pending_transactions.append(transaction)
            return True
        return False
    
    def mine_pending_transactions(self, mining_reward_address: str):
        """Mine pending transactions into a new block"""
        
        # Add mining reward transaction
        reward_transaction = {
            'from': None,
            'to': mining_reward_address,
            'amount': self.mining_reward,
            'timestamp': time.time(),
            'type': 'mining_reward'
        }
        
        self.pending_transactions.append(reward_transaction)
        
        # Create new block
        block = Block(
            len(self.chain),
            self.pending_transactions,
            self.get_latest_block().hash
        )
        
        # Mine the block
        block.mine_block(self.difficulty)
        
        # Add block to chain
        self.chain.append(block)
        
        # Clear pending transactions
        self.pending_transactions = []
    
    def get_balance(self, address: str) -> float:
        """Calculate balance for an address"""
        balance = 0
        
        for block in self.chain:
            for transaction in block.transactions:
                if transaction.get('from') == address:
                    balance -= transaction['amount']
                if transaction.get('to') == address:
                    balance += transaction['amount']
        
        return balance
    
    def validate_transaction(self, transaction: Dict[str, Any]) -> bool:
        """Validate a transaction"""
        
        # Check required fields
        required_fields = ['from', 'to', 'amount']
        if not all(field in transaction for field in required_fields):
            return False
        
        # Check if sender has sufficient balance (except for mining rewards)
        if transaction['from'] is not None:
            sender_balance = self.get_balance(transaction['from'])
            if sender_balance < transaction['amount']:
                return False
        
        # Check amount is positive
        if transaction['amount'] <= 0:
            return False
        
        return True
    
    def is_chain_valid(self) -> bool:
        """Validate the entire blockchain"""
        
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i - 1]
            
            # Check if current block hash is valid
            if current_block.hash != current_block.calculate_hash():
                print(f"Invalid hash at block {i}")
                return False
            
            # Check if current block points to previous block
            if current_block.previous_hash != previous_block.hash:
                print(f"Invalid previous hash at block {i}")
                return False
        
        return True
    
    def get_transaction_history(self, address: str) -> List[Dict[str, Any]]:
        """Get transaction history for an address"""
        
        transactions = []
        
        for block in self.chain:
            for transaction in block.transactions:
                if transaction.get('from') == address or transaction.get('to') == address:
                    transactions.append({
                        'block_index': block.index,
                        'timestamp': block.timestamp,
                        'transaction': transaction,
                        'block_hash': block.hash
                    })
        
        return transactions

# Example usage
blockchain = SimpleBlockchain()

# Add some transactions
blockchain.add_transaction({
    'from': 'alice',
    'to': 'bob',
    'amount': 50,
    'timestamp': time.time()
})

blockchain.add_transaction({
    'from': 'bob',
    'to': 'charlie',
    'amount': 25,
    'timestamp': time.time()
})

# Mine the transactions
print("Mining block...")
blockchain.mine_pending_transactions('miner1')

# Check balances
print(f"Alice balance: {blockchain.get_balance('alice')}")
print(f"Bob balance: {blockchain.get_balance('bob')}")
print(f"Charlie balance: {blockchain.get_balance('charlie')}")
print(f"Miner1 balance: {blockchain.get_balance('miner1')}")

# Validate blockchain
print(f"Blockchain valid: {blockchain.is_chain_valid()}")

# Get transaction history
alice_history = blockchain.get_transaction_history('alice')
print(f"Alice transaction history: {json.dumps(alice_history, indent=2)}")
```

## Network Security

### Secure Communication Protocol

```python
import socket
import ssl
import threading
import json
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes

class SecureCommProtocol:
    def __init__(self):
        self.private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )
        self.public_key = self.private_key.public_key()
        
        # Symmetric key for session encryption
        self.session_key = None
        self.session_cipher = None
    
    def get_public_key_pem(self) -> bytes:
        """Get public key in PEM format"""
        return self.public_key.serialize(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
    
    def establish_session_key(self, peer_public_key_pem: bytes) -> bytes:
        """Establish session key with peer"""
        
        # Generate session key
        session_key = Fernet.generate_key()
        self.session_cipher = Fernet(session_key)
        
        # Load peer's public key
        peer_public_key = serialization.load_pem_public_key(peer_public_key_pem)
        
        # Encrypt session key with peer's public key
        encrypted_session_key = peer_public_key.encrypt(
            session_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        
        return encrypted_session_key
    
    def receive_session_key(self, encrypted_session_key: bytes):
        """Receive and decrypt session key"""
        
        # Decrypt session key with private key
        session_key = self.private_key.decrypt(
            encrypted_session_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        
        self.session_cipher = Fernet(session_key)
    
    def encrypt_message(self, message: str) -> bytes:
        """Encrypt message with session key"""
        if not self.session_cipher:
            raise ValueError("Session not established")
        
        return self.session_cipher.encrypt(message.encode())
    
    def decrypt_message(self, encrypted_message: bytes) -> str:
        """Decrypt message with session key"""
        if not self.session_cipher:
            raise ValueError("Session not established")
        
        return self.session_cipher.decrypt(encrypted_message).decode()
    
    def create_message_with_integrity(self, message: str) -> Dict[str, Any]:
        """Create message with integrity check"""
        
        # Calculate message hash
        message_hash = hashlib.sha256(message.encode()).hexdigest()
        
        # Create message package
        message_package = {
            'content': message,
            'hash': message_hash,
            'timestamp': time.time(),
            'sender_id': 'client_001'  # In practice, use actual sender ID
        }
        
        # Encrypt entire package
        encrypted_package = self.encrypt_message(json.dumps(message_package))
        
        return {
            'encrypted_data': base64.b64encode(encrypted_package).decode(),
            'signature': self.sign_message(message)
        }
    
    def verify_and_decrypt_message(self, encrypted_data: str, signature: str) -> Dict[str, Any]:
        """Verify and decrypt message"""
        
        try:
            # Decode and decrypt
            encrypted_bytes = base64.b64decode(encrypted_data.encode())
            decrypted_json = self.decrypt_message(encrypted_bytes)
            message_package = json.loads(decrypted_json)
            
            # Verify integrity
            calculated_hash = hashlib.sha256(message_package['content'].encode()).hexdigest()
            
            if calculated_hash != message_package['hash']:
                return {
                    'success': False,
                    'error': 'Message integrity check failed'
                }
            
            # Verify signature
            if not self.verify_signature(message_package['content'], signature):
                return {
                    'success': False,
                    'error': 'Message signature verification failed'
                }
            
            return {
                'success': True,
                'message': message_package['content'],
                'timestamp': message_package['timestamp'],
                'sender_id': message_package['sender_id']
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Decryption failed: {str(e)}'
            }
    
    def sign_message(self, message: str) -> str:
        """Sign message with private key"""
        signature = self.private_key.sign(
            message.encode(),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        return base64.b64encode(signature).decode()
    
    def verify_signature(self, message: str, signature: str) -> bool:
        """Verify message signature"""
        try:
            signature_bytes = base64.b64decode(signature.encode())
            self.public_key.verify(
                signature_bytes,
                message.encode(),
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            return True
        except:
            return False

# Example usage
# Client A
client_a = SecureCommProtocol()
client_b = SecureCommProtocol()

# Exchange public keys
pub_key_a = client_a.get_public_key_pem()
pub_key_b = client_b.get_public_key_pem()

# Establish session
encrypted_session_key = client_a.establish_session_key(pub_key_b)
client_b.receive_session_key(encrypted_session_key)

# Send secure message
message = "This is a confidential message!"
secure_message = client_a.create_message_with_integrity(message)
print(f"Encrypted message: {secure_message['encrypted_data'][:50]}...")

# Receive and verify message
result = client_b.verify_and_decrypt_message(
    secure_message['encrypted_data'],
    secure_message['signature']
)
print(f"Decrypted message: {result}")
```

These practical implementations demonstrate how encoding, encryption, and hashing work together to create secure systems in real-world applications. Each technique serves its specific purpose in the overall security architecture.