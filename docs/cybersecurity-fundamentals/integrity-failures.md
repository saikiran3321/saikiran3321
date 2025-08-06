---
sidebar_position: 3
---

# Software and Data Integrity Failures

Software and data integrity failures represent one of the most critical security risks in modern computing systems. These failures occur when code, infrastructure, or data is compromised without proper verification, leading to unauthorized changes, system corruption, and security breaches. This comprehensive guide explores the causes, impacts, and prevention strategies for integrity failures.

## Understanding Integrity Failures

### What is Integrity?

**Integrity** ensures that data and software remain accurate, complete, and unmodified during storage, transmission, and processing. It's one of the three pillars of information security (CIA Triad):

- **Confidentiality**: Protecting data from unauthorized access
- **Integrity**: Ensuring data accuracy and preventing unauthorized modification
- **Availability**: Ensuring systems and data are accessible when needed

### Types of Integrity Failures

#### Software Integrity Failures
- **Code Tampering**: Unauthorized modification of application code
- **Supply Chain Attacks**: Compromised dependencies or third-party components
- **Binary Modification**: Altered executable files or libraries
- **Configuration Drift**: Unintended changes to system configurations

#### Data Integrity Failures
- **Data Corruption**: Accidental or malicious data modification
- **Database Inconsistencies**: Referential integrity violations
- **File System Corruption**: Damaged or modified files
- **Transmission Errors**: Data corruption during network transfer

## Common Causes of Integrity Failures

### Software Supply Chain Vulnerabilities

#### Dependency Confusion Attacks
```python
# Example: Vulnerable dependency management
import subprocess
import json

class VulnerableDependencyManager:
    def __init__(self):
        self.trusted_sources = ['pypi.org', 'npmjs.com']
        self.package_registry = {}
    
    def install_package(self, package_name: str, version: str = 'latest'):
        """Vulnerable package installation without integrity checks"""
        
        # ❌ No integrity verification
        # ❌ No source validation
        # ❌ No signature checking
        
        try:
            if version == 'latest':
                result = subprocess.run(
                    ['pip', 'install', package_name],
                    capture_output=True,
                    text=True
                )
            else:
                result = subprocess.run(
                    ['pip', 'install', f'{package_name}=={version}'],
                    capture_output=True,
                    text=True
                )
            
            if result.returncode == 0:
                return {'success': True, 'message': f'Installed {package_name}'}
            else:
                return {'success': False, 'error': result.stderr}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}

# ✅ Secure dependency management
class SecureDependencyManager:
    def __init__(self):
        self.trusted_sources = ['pypi.org']
        self.package_hashes = {}  # Store expected package hashes
        self.signature_keys = {}  # Store package signing keys
    
    def install_package_secure(self, package_name: str, version: str, 
                              expected_hash: str = None, verify_signature: bool = True):
        """Secure package installation with integrity verification"""
        
        try:
            # 1. Verify package source
            if not self.verify_package_source(package_name):
                return {'success': False, 'error': 'Package source not trusted'}
            
            # 2. Download package
            package_path = self.download_package(package_name, version)
            
            # 3. Verify package hash
            if expected_hash:
                if not self.verify_package_hash(package_path, expected_hash):
                    return {'success': False, 'error': 'Package hash verification failed'}
            
            # 4. Verify package signature
            if verify_signature:
                if not self.verify_package_signature(package_path):
                    return {'success': False, 'error': 'Package signature verification failed'}
            
            # 5. Install package
            result = subprocess.run(
                ['pip', 'install', package_path, '--no-deps'],  # Install without dependencies
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                self.log_package_installation(package_name, version, expected_hash)
                return {'success': True, 'message': f'Securely installed {package_name}'}
            else:
                return {'success': False, 'error': result.stderr}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def verify_package_source(self, package_name: str) -> bool:
        """Verify package comes from trusted source"""
        # Implementation would check package registry
        return True
    
    def verify_package_hash(self, package_path: str, expected_hash: str) -> bool:
        """Verify package integrity using hash"""
        import hashlib
        
        sha256_hash = hashlib.sha256()
        with open(package_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                sha256_hash.update(chunk)
        
        actual_hash = sha256_hash.hexdigest()
        return actual_hash == expected_hash
    
    def verify_package_signature(self, package_path: str) -> bool:
        """Verify package digital signature"""
        # Implementation would verify GPG/PGP signatures
        return True
    
    def log_package_installation(self, package_name: str, version: str, hash_value: str):
        """Log package installation for audit trail"""
        import datetime
        
        log_entry = {
            'timestamp': datetime.datetime.now().isoformat(),
            'package': package_name,
            'version': version,
            'hash': hash_value,
            'action': 'install'
        }
        
        # In production, log to secure audit system
        print(f"Package installed: {json.dumps(log_entry)}")
```

#### Compromised Build Pipelines
```python
# Example: Secure CI/CD pipeline with integrity checks
import hashlib
import subprocess
import json
from typing import Dict, List

class SecureBuildPipeline:
    def __init__(self):
        self.build_artifacts = {}
        self.integrity_checks = []
        self.security_scans = []
    
    def secure_build_process(self, source_code_path: str, build_config: Dict) -> Dict:
        """Secure build process with integrity verification"""
        
        build_result = {
            'success': False,
            'artifacts': [],
            'integrity_checks': [],
            'security_scans': [],
            'build_hash': None
        }
        
        try:
            # 1. Verify source code integrity
            source_integrity = self.verify_source_integrity(source_code_path)
            if not source_integrity['valid']:
                return {'success': False, 'error': 'Source code integrity check failed'}
            
            # 2. Scan for vulnerabilities
            security_scan = self.perform_security_scan(source_code_path)
            build_result['security_scans'].append(security_scan)
            
            if security_scan['critical_issues'] > 0:
                return {'success': False, 'error': 'Critical security issues found'}
            
            # 3. Build application
            build_output = self.build_application(source_code_path, build_config)
            if not build_output['success']:
                return build_output
            
            # 4. Generate build artifacts with hashes
            artifacts = self.generate_build_artifacts(build_output['build_path'])
            build_result['artifacts'] = artifacts
            
            # 5. Sign build artifacts
            signed_artifacts = self.sign_build_artifacts(artifacts)
            
            # 6. Generate build manifest
            build_manifest = self.generate_build_manifest(signed_artifacts, source_integrity)
            build_result['build_hash'] = build_manifest['hash']
            
            build_result['success'] = True
            return build_result
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def verify_source_integrity(self, source_path: str) -> Dict:
        """Verify source code integrity"""
        
        integrity_result = {
            'valid': True,
            'files_checked': 0,
            'modified_files': [],
            'source_hash': None
        }
        
        import os
        
        # Calculate hash of all source files
        source_hash = hashlib.sha256()
        
        for root, dirs, files in os.walk(source_path):
            # Skip hidden directories and common build directories
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', '__pycache__', 'build', 'dist']]
            
            for file in sorted(files):
                if not file.startswith('.'):
                    file_path = os.path.join(root, file)
                    
                    with open(file_path, 'rb') as f:
                        file_content = f.read()
                        source_hash.update(file_content)
                        integrity_result['files_checked'] += 1
        
        integrity_result['source_hash'] = source_hash.hexdigest()
        return integrity_result
    
    def perform_security_scan(self, source_path: str) -> Dict:
        """Perform security vulnerability scan"""
        
        scan_result = {
            'scan_type': 'static_analysis',
            'critical_issues': 0,
            'high_issues': 0,
            'medium_issues': 0,
            'low_issues': 0,
            'issues': []
        }
        
        # Example security checks
        security_patterns = {
            'hardcoded_secrets': [
                r'password\s*=\s*["\'][^"\']+["\']',
                r'api_key\s*=\s*["\'][^"\']+["\']',
                r'secret\s*=\s*["\'][^"\']+["\']'
            ],
            'sql_injection': [
                r'execute\s*\(\s*["\'].*\+.*["\']',
                r'query\s*\(\s*["\'].*\+.*["\']'
            ],
            'xss_vulnerabilities': [
                r'innerHTML\s*=\s*.*\+',
                r'document\.write\s*\('
            ]
        }
        
        import os
        import re
        
        for root, dirs, files in os.walk(source_path):
            for file in files:
                if file.endswith(('.py', '.js', '.ts', '.java', '.php')):
                    file_path = os.path.join(root, file)
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                            
                            for issue_type, patterns in security_patterns.items():
                                for pattern in patterns:
                                    matches = re.finditer(pattern, content, re.IGNORECASE)
                                    for match in matches:
                                        line_num = content[:match.start()].count('\n') + 1
                                        
                                        issue = {
                                            'type': issue_type,
                                            'file': file_path,
                                            'line': line_num,
                                            'pattern': pattern,
                                            'severity': 'high' if issue_type == 'hardcoded_secrets' else 'medium'
                                        }
                                        
                                        scan_result['issues'].append(issue)
                                        
                                        if issue['severity'] == 'critical':
                                            scan_result['critical_issues'] += 1
                                        elif issue['severity'] == 'high':
                                            scan_result['high_issues'] += 1
                                        elif issue['severity'] == 'medium':
                                            scan_result['medium_issues'] += 1
                                        else:
                                            scan_result['low_issues'] += 1
                    except:
                        continue
        
        return scan_result
    
    def build_application(self, source_path: str, build_config: Dict) -> Dict:
        """Build application with integrity tracking"""
        
        try:
            # Run build command
            build_command = build_config.get('command', ['npm', 'run', 'build'])
            
            result = subprocess.run(
                build_command,
                cwd=source_path,
                capture_output=True,
                text=True,
                timeout=build_config.get('timeout', 600)  # 10 minutes default
            )
            
            if result.returncode == 0:
                return {
                    'success': True,
                    'build_path': os.path.join(source_path, build_config.get('output_dir', 'build')),
                    'build_log': result.stdout
                }
            else:
                return {
                    'success': False,
                    'error': result.stderr,
                    'build_log': result.stdout
                }
                
        except subprocess.TimeoutExpired:
            return {'success': False, 'error': 'Build process timed out'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def generate_build_artifacts(self, build_path: str) -> List[Dict]:
        """Generate build artifacts with integrity hashes"""
        
        artifacts = []
        
        for root, dirs, files in os.walk(build_path):
            for file in files:
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, build_path)
                
                # Calculate file hash
                file_hash = self.calculate_file_hash(file_path)
                file_size = os.path.getsize(file_path)
                
                artifacts.append({
                    'path': relative_path,
                    'full_path': file_path,
                    'hash': file_hash,
                    'size': file_size,
                    'type': self.get_file_type(file)
                })
        
        return artifacts
    
    def calculate_file_hash(self, file_path: str) -> str:
        """Calculate SHA-256 hash of file"""
        sha256_hash = hashlib.sha256()
        
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                sha256_hash.update(chunk)
        
        return sha256_hash.hexdigest()
    
    def sign_build_artifacts(self, artifacts: List[Dict]) -> List[Dict]:
        """Sign build artifacts for integrity verification"""
        
        # In production, use proper code signing certificates
        signing_key = "build_signing_key"  # Placeholder
        
        for artifact in artifacts:
            # Create signature for artifact
            artifact_data = f"{artifact['path']}:{artifact['hash']}:{artifact['size']}"
            signature = hashlib.sha256(f"{signing_key}:{artifact_data}".encode()).hexdigest()
            artifact['signature'] = signature
        
        return artifacts
    
    def generate_build_manifest(self, artifacts: List[Dict], source_integrity: Dict) -> Dict:
        """Generate build manifest with integrity information"""
        
        import datetime
        
        # Calculate overall build hash
        build_data = {
            'source_hash': source_integrity['source_hash'],
            'artifacts': [{'path': a['path'], 'hash': a['hash']} for a in artifacts],
            'build_timestamp': datetime.datetime.now().isoformat()
        }
        
        build_hash = hashlib.sha256(json.dumps(build_data, sort_keys=True).encode()).hexdigest()
        
        manifest = {
            'build_hash': build_hash,
            'source_integrity': source_integrity,
            'artifacts': artifacts,
            'build_timestamp': build_data['build_timestamp'],
            'total_artifacts': len(artifacts),
            'total_size': sum(a['size'] for a in artifacts)
        }
        
        return manifest
    
    def get_file_type(self, filename: str) -> str:
        """Determine file type from extension"""
        
        type_mapping = {
            '.js': 'javascript',
            '.css': 'stylesheet',
            '.html': 'markup',
            '.json': 'data',
            '.png': 'image',
            '.jpg': 'image',
            '.svg': 'image',
            '.woff': 'font',
            '.woff2': 'font'
        }
        
        ext = os.path.splitext(filename)[1].lower()
        return type_mapping.get(ext, 'unknown')

# Example usage
build_pipeline = SecureBuildPipeline()

build_config = {
    'command': ['npm', 'run', 'build'],
    'output_dir': 'build',
    'timeout': 300
}

result = build_pipeline.secure_build_process('/path/to/source', build_config)
print(f"Build result: {json.dumps(result, indent=2)}")
```

### Database Integrity Failures

#### Transaction Integrity Issues
```python
import sqlite3
import hashlib
import json
import time
from typing import Dict, Any, List, Optional

class DatabaseIntegrityManager:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.init_integrity_tables()
    
    def init_integrity_tables(self):
        """Initialize integrity tracking tables"""
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Table for tracking data integrity
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS data_integrity (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    table_name TEXT NOT NULL,
                    record_id TEXT NOT NULL,
                    data_hash TEXT NOT NULL,
                    created_at REAL NOT NULL,
                    updated_at REAL NOT NULL,
                    version INTEGER DEFAULT 1
                )
            ''')
            
            # Table for integrity violations
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS integrity_violations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    table_name TEXT NOT NULL,
                    record_id TEXT NOT NULL,
                    violation_type TEXT NOT NULL,
                    expected_hash TEXT,
                    actual_hash TEXT,
                    detected_at REAL NOT NULL,
                    resolved BOOLEAN DEFAULT 0
                )
            ''')
            
            conn.commit()
    
    def insert_with_integrity(self, table_name: str, data: Dict[str, Any]) -> Dict:
        """Insert data with integrity tracking"""
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Calculate data hash
                data_hash = self.calculate_data_hash(data)
                
                # Insert main data
                columns = ', '.join(data.keys())
                placeholders = ', '.join(['?' for _ in data])
                values = list(data.values())
                
                cursor.execute(
                    f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})",
                    values
                )
                
                record_id = cursor.lastrowid
                
                # Insert integrity record
                cursor.execute('''
                    INSERT INTO data_integrity (table_name, record_id, data_hash, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?)
                ''', (table_name, str(record_id), data_hash, time.time(), time.time()))
                
                conn.commit()
                
                return {
                    'success': True,
                    'record_id': record_id,
                    'data_hash': data_hash
                }
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def update_with_integrity(self, table_name: str, record_id: str, 
                            data: Dict[str, Any]) -> Dict:
        """Update data with integrity verification"""
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Get current integrity record
                cursor.execute(
                    'SELECT data_hash, version FROM data_integrity WHERE table_name = ? AND record_id = ?',
                    (table_name, record_id)
                )
                integrity_row = cursor.fetchone()
                
                if not integrity_row:
                    return {'success': False, 'error': 'No integrity record found'}
                
                current_hash, current_version = integrity_row
                
                # Verify current data integrity
                cursor.execute(f'SELECT * FROM {table_name} WHERE id = ?', (record_id,))
                current_data = cursor.fetchone()
                
                if current_data:
                    # Convert to dict for hash calculation
                    cursor.execute(f'PRAGMA table_info({table_name})')
                    columns = [col[1] for col in cursor.fetchall()]
                    current_data_dict = dict(zip(columns, current_data))
                    
                    calculated_hash = self.calculate_data_hash(current_data_dict)
                    
                    if calculated_hash != current_hash:
                        # Integrity violation detected
                        self.log_integrity_violation(
                            table_name, record_id, 'hash_mismatch',
                            current_hash, calculated_hash
                        )
                        return {'success': False, 'error': 'Data integrity violation detected'}
                
                # Calculate new data hash
                new_data_hash = self.calculate_data_hash(data)
                
                # Update main data
                set_clause = ', '.join([f'{key} = ?' for key in data.keys()])
                values = list(data.values()) + [record_id]
                
                cursor.execute(
                    f"UPDATE {table_name} SET {set_clause} WHERE id = ?",
                    values
                )
                
                # Update integrity record
                cursor.execute('''
                    UPDATE data_integrity 
                    SET data_hash = ?, updated_at = ?, version = version + 1
                    WHERE table_name = ? AND record_id = ?
                ''', (new_data_hash, time.time(), table_name, record_id))
                
                conn.commit()
                
                return {
                    'success': True,
                    'record_id': record_id,
                    'new_hash': new_data_hash,
                    'version': current_version + 1
                }
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def verify_data_integrity(self, table_name: str, record_id: str = None) -> Dict:
        """Verify data integrity for table or specific record"""
        
        verification_result = {
            'table_name': table_name,
            'total_records': 0,
            'verified_records': 0,
            'violations': [],
            'integrity_score': 0.0
        }
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Get integrity records to verify
                if record_id:
                    cursor.execute(
                        'SELECT record_id, data_hash FROM data_integrity WHERE table_name = ? AND record_id = ?',
                        (table_name, record_id)
                    )
                else:
                    cursor.execute(
                        'SELECT record_id, data_hash FROM data_integrity WHERE table_name = ?',
                        (table_name,)
                    )
                
                integrity_records = cursor.fetchall()
                verification_result['total_records'] = len(integrity_records)
                
                # Get table schema
                cursor.execute(f'PRAGMA table_info({table_name})')
                columns = [col[1] for col in cursor.fetchall()]
                
                for record_id_check, expected_hash in integrity_records:
                    # Get current data
                    cursor.execute(f'SELECT * FROM {table_name} WHERE id = ?', (record_id_check,))
                    current_data = cursor.fetchone()
                    
                    if current_data:
                        # Calculate current hash
                        current_data_dict = dict(zip(columns, current_data))
                        calculated_hash = self.calculate_data_hash(current_data_dict)
                        
                        if calculated_hash == expected_hash:
                            verification_result['verified_records'] += 1
                        else:
                            violation = {
                                'record_id': record_id_check,
                                'expected_hash': expected_hash,
                                'calculated_hash': calculated_hash,
                                'violation_type': 'hash_mismatch'
                            }
                            verification_result['violations'].append(violation)
                            
                            # Log violation
                            self.log_integrity_violation(
                                table_name, record_id_check, 'hash_mismatch',
                                expected_hash, calculated_hash
                            )
                    else:
                        # Record missing
                        violation = {
                            'record_id': record_id_check,
                            'violation_type': 'record_missing'
                        }
                        verification_result['violations'].append(violation)
                
                # Calculate integrity score
                if verification_result['total_records'] > 0:
                    verification_result['integrity_score'] = (
                        verification_result['verified_records'] / verification_result['total_records']
                    ) * 100
                
                return verification_result
                
        except Exception as e:
            verification_result['error'] = str(e)
            return verification_result
    
    def calculate_data_hash(self, data: Dict[str, Any]) -> str:
        """Calculate hash of data dictionary"""
        # Sort keys for consistent hashing
        sorted_data = json.dumps(data, sort_keys=True, default=str)
        return hashlib.sha256(sorted_data.encode()).hexdigest()
    
    def log_integrity_violation(self, table_name: str, record_id: str, 
                              violation_type: str, expected_hash: str = None, 
                              actual_hash: str = None):
        """Log integrity violation"""
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO integrity_violations 
                (table_name, record_id, violation_type, expected_hash, actual_hash, detected_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (table_name, record_id, violation_type, expected_hash, actual_hash, time.time()))
            
            conn.commit()
    
    def get_integrity_report(self, days: int = 7) -> Dict:
        """Generate integrity report for specified period"""
        
        cutoff_time = time.time() - (days * 24 * 60 * 60)
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Get violation summary
            cursor.execute('''
                SELECT violation_type, COUNT(*) as count
                FROM integrity_violations
                WHERE detected_at > ?
                GROUP BY violation_type
            ''', (cutoff_time,))
            
            violations_by_type = dict(cursor.fetchall())
            
            # Get table integrity scores
            cursor.execute('SELECT DISTINCT table_name FROM data_integrity')
            tables = [row[0] for row in cursor.fetchall()]
            
            table_scores = {}
            for table in tables:
                verification = self.verify_data_integrity(table)
                table_scores[table] = verification['integrity_score']
            
            return {
                'period_days': days,
                'violations_by_type': violations_by_type,
                'total_violations': sum(violations_by_type.values()),
                'table_integrity_scores': table_scores,
                'overall_integrity_score': sum(table_scores.values()) / len(table_scores) if table_scores else 100
            }

# Example usage
db_integrity = DatabaseIntegrityManager("secure_app.db")

# Insert data with integrity tracking
user_data = {
    'username': 'john_doe',
    'email': 'john@example.com',
    'role': 'user'
}

insert_result = db_integrity.insert_with_integrity('users', user_data)
print(f"Insert result: {insert_result}")

# Verify integrity
verification = db_integrity.verify_data_integrity('users')
print(f"Integrity verification: {json.dumps(verification, indent=2)}")

# Generate integrity report
report = db_integrity.get_integrity_report(7)
print(f"Integrity report: {json.dumps(report, indent=2)}")
```

## Real-World Integrity Failure Examples

### Case Study 1: SolarWinds Supply Chain Attack

#### Attack Overview
The SolarWinds attack (2020) compromised the Orion software build process, affecting thousands of organizations worldwide.

```python
# Simulation of how the attack could have been prevented
class SolarWindsPreventionSystem:
    def __init__(self):
        self.build_signatures = {}
        self.trusted_build_servers = []
        self.code_review_requirements = {}
    
    def secure_build_process(self, source_code: str, build_environment: str) -> Dict:
        """Secure build process that could have prevented SolarWinds-style attacks"""
        
        prevention_checks = {
            'source_code_integrity': False,
            'build_environment_verified': False,
            'code_review_completed': False,
            'dependency_verification': False,
            'build_signing': False,
            'distribution_integrity': False
        }
        
        try:
            # 1. Verify source code integrity
            if self.verify_source_code_integrity(source_code):
                prevention_checks['source_code_integrity'] = True
            
            # 2. Verify build environment
            if self.verify_build_environment(build_environment):
                prevention_checks['build_environment_verified'] = True
            
            # 3. Ensure code review
            if self.verify_code_review_process(source_code):
                prevention_checks['code_review_completed'] = True
            
            # 4. Verify all dependencies
            if self.verify_dependencies():
                prevention_checks['dependency_verification'] = True
            
            # 5. Sign build artifacts
            if self.sign_build_artifacts():
                prevention_checks['build_signing'] = True
            
            # 6. Verify distribution integrity
            if self.verify_distribution_integrity():
                prevention_checks['distribution_integrity'] = True
            
            # All checks must pass
            all_passed = all(prevention_checks.values())
            
            return {
                'build_approved': all_passed,
                'prevention_checks': prevention_checks,
                'security_score': sum(prevention_checks.values()) / len(prevention_checks) * 100
            }
            
        except Exception as e:
            return {
                'build_approved': False,
                'error': str(e),
                'prevention_checks': prevention_checks
            }
    
    def verify_source_code_integrity(self, source_code: str) -> bool:
        """Verify source code hasn't been tampered with"""
        # Implementation would check git signatures, code review approvals, etc.
        return True
    
    def verify_build_environment(self, build_environment: str) -> bool:
        """Verify build environment is secure and trusted"""
        # Implementation would check environment configuration, access logs, etc.
        return True
    
    def verify_code_review_process(self, source_code: str) -> bool:
        """Verify code has been properly reviewed"""
        # Implementation would check code review system for approvals
        return True
    
    def verify_dependencies(self) -> bool:
        """Verify all dependencies are from trusted sources"""
        # Implementation would check dependency hashes, signatures, sources
        return True
    
    def sign_build_artifacts(self) -> bool:
        """Sign build artifacts with trusted certificate"""
        # Implementation would use code signing certificates
        return True
    
    def verify_distribution_integrity(self) -> bool:
        """Verify distribution channel integrity"""
        # Implementation would verify update server integrity
        return True
```

### Case Study 2: Data Corruption in Financial Systems

```python
# Financial transaction integrity system
import decimal
from decimal import Decimal
import uuid
from typing import List

class FinancialIntegritySystem:
    def __init__(self):
        self.transactions = {}
        self.account_balances = {}
        self.integrity_log = []
        
        # Set decimal precision for financial calculations
        decimal.getcontext().prec = 28
    
    def create_account(self, account_id: str, initial_balance: Decimal = Decimal('0.00')) -> Dict:
        """Create account with integrity tracking"""
        
        if account_id in self.account_balances:
            return {'success': False, 'error': 'Account already exists'}
        
        self.account_balances[account_id] = {
            'balance': initial_balance,
            'created_at': time.time(),
            'transaction_count': 0,
            'last_transaction': None,
            'integrity_hash': self.calculate_account_hash(account_id, initial_balance, 0)
        }
        
        return {'success': True, 'account_id': account_id, 'balance': initial_balance}
    
    def process_transaction(self, from_account: str, to_account: str, 
                          amount: Decimal, description: str = '') -> Dict:
        """Process financial transaction with integrity verification"""
        
        transaction_id = str(uuid.uuid4())
        
        try:
            # Verify accounts exist
            if from_account not in self.account_balances or to_account not in self.account_balances:
                return {'success': False, 'error': 'Account not found'}
            
            # Verify sufficient balance
            if self.account_balances[from_account]['balance'] < amount:
                return {'success': False, 'error': 'Insufficient balance'}
            
            # Verify account integrity before transaction
            from_integrity = self.verify_account_integrity(from_account)
            to_integrity = self.verify_account_integrity(to_account)
            
            if not from_integrity['valid'] or not to_integrity['valid']:
                return {'success': False, 'error': 'Account integrity check failed'}
            
            # Record transaction
            transaction = {
                'id': transaction_id,
                'from_account': from_account,
                'to_account': to_account,
                'amount': amount,
                'description': description,
                'timestamp': time.time(),
                'status': 'pending'
            }
            
            # Calculate transaction hash for integrity
            transaction_hash = self.calculate_transaction_hash(transaction)
            transaction['hash'] = transaction_hash
            
            # Update balances atomically
            old_from_balance = self.account_balances[from_account]['balance']
            old_to_balance = self.account_balances[to_account]['balance']
            
            # Debit from account
            self.account_balances[from_account]['balance'] -= amount
            self.account_balances[from_account]['transaction_count'] += 1
            self.account_balances[from_account]['last_transaction'] = transaction_id
            
            # Credit to account
            self.account_balances[to_account]['balance'] += amount
            self.account_balances[to_account]['transaction_count'] += 1
            self.account_balances[to_account]['last_transaction'] = transaction_id
            
            # Update integrity hashes
            self.account_balances[from_account]['integrity_hash'] = self.calculate_account_hash(
                from_account, 
                self.account_balances[from_account]['balance'],
                self.account_balances[from_account]['transaction_count']
            )
            
            self.account_balances[to_account]['integrity_hash'] = self.calculate_account_hash(
                to_account,
                self.account_balances[to_account]['balance'],
                self.account_balances[to_account]['transaction_count']
            )
            
            # Mark transaction as completed
            transaction['status'] = 'completed'
            self.transactions[transaction_id] = transaction
            
            # Log integrity check
            self.log_integrity_event('transaction_processed', {
                'transaction_id': transaction_id,
                'from_account': from_account,
                'to_account': to_account,
                'amount': str(amount),
                'from_balance_before': str(old_from_balance),
                'to_balance_before': str(old_to_balance),
                'from_balance_after': str(self.account_balances[from_account]['balance']),
                'to_balance_after': str(self.account_balances[to_account]['balance'])
            })
            
            return {
                'success': True,
                'transaction_id': transaction_id,
                'transaction_hash': transaction_hash
            }
            
        except Exception as e:
            # Rollback on error
            if transaction_id in self.transactions:
                del self.transactions[transaction_id]
            
            return {'success': False, 'error': str(e)}
    
    def verify_account_integrity(self, account_id: str) -> Dict:
        """Verify account integrity"""
        
        if account_id not in self.account_balances:
            return {'valid': False, 'error': 'Account not found'}
        
        account = self.account_balances[account_id]
        
        # Calculate expected hash
        expected_hash = self.calculate_account_hash(
            account_id,
            account['balance'],
            account['transaction_count']
        )
        
        # Compare with stored hash
        if expected_hash == account['integrity_hash']:
            return {'valid': True, 'account_id': account_id}
        else:
            return {
                'valid': False,
                'error': 'Account integrity hash mismatch',
                'expected_hash': expected_hash,
                'actual_hash': account['integrity_hash']
            }
    
    def calculate_account_hash(self, account_id: str, balance: Decimal, transaction_count: int) -> str:
        """Calculate account integrity hash"""
        account_data = f"{account_id}:{balance}:{transaction_count}"
        return hashlib.sha256(account_data.encode()).hexdigest()
    
    def calculate_transaction_hash(self, transaction: Dict) -> str:
        """Calculate transaction integrity hash"""
        # Create deterministic string from transaction data
        transaction_data = f"{transaction['from_account']}:{transaction['to_account']}:{transaction['amount']}:{transaction['timestamp']}"
        return hashlib.sha256(transaction_data.encode()).hexdigest()
    
    def audit_system_integrity(self) -> Dict:
        """Comprehensive system integrity audit"""
        
        audit_result = {
            'total_accounts': len(self.account_balances),
            'total_transactions': len(self.transactions),
            'account_integrity_failures': 0,
            'transaction_integrity_failures': 0,
            'balance_discrepancies': [],
            'overall_integrity_score': 0.0
        }
        
        # Verify all accounts
        for account_id in self.account_balances:
            integrity_check = self.verify_account_integrity(account_id)
            if not integrity_check['valid']:
                audit_result['account_integrity_failures'] += 1
        
        # Verify transaction integrity
        for transaction_id, transaction in self.transactions.items():
            expected_hash = self.calculate_transaction_hash(transaction)
            if expected_hash != transaction['hash']:
                audit_result['transaction_integrity_failures'] += 1
        
        # Calculate overall integrity score
        total_checks = audit_result['total_accounts'] + audit_result['total_transactions']
        total_failures = audit_result['account_integrity_failures'] + audit_result['transaction_integrity_failures']
        
        if total_checks > 0:
            audit_result['overall_integrity_score'] = ((total_checks - total_failures) / total_checks) * 100
        
        return audit_result
    
    def log_integrity_event(self, event_type: str, event_data: Dict):
        """Log integrity-related events"""
        
        log_entry = {
            'timestamp': time.time(),
            'event_type': event_type,
            'event_data': event_data
        }
        
        self.integrity_log.append(log_entry)

# Example usage
financial_system = FinancialIntegritySystem()

# Create accounts
financial_system.create_account('ACC001', Decimal('1000.00'))
financial_system.create_account('ACC002', Decimal('500.00'))

# Process transaction
transaction_result = financial_system.process_transaction(
    'ACC001', 'ACC002', Decimal('100.00'), 'Payment for services'
)
print(f"Transaction result: {transaction_result}")

# Verify integrity
acc1_integrity = financial_system.verify_account_integrity('ACC001')
print(f"Account 1 integrity: {acc1_integrity}")

# System audit
audit_result = financial_system.audit_system_integrity()
print(f"System audit: {json.dumps(audit_result, indent=2, default=str)}")
```

## Prevention and Mitigation Strategies

### Code Integrity Protection

#### Digital Signatures and Code Signing
```python
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes
import base64

class CodeSigningSystem:
    def __init__(self):
        self.private_key = None
        self.public_key = None
        self.generate_signing_keys()
    
    def generate_signing_keys(self):
        """Generate RSA key pair for code signing"""
        self.private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )
        self.public_key = self.private_key.public_key()
    
    def sign_code(self, code_content: str) -> Dict[str, str]:
        """Sign code with private key"""
        
        # Calculate code hash
        code_hash = hashlib.sha256(code_content.encode()).hexdigest()
        
        # Sign the hash
        signature = self.private_key.sign(
            code_hash.encode(),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        
        return {
            'code_hash': code_hash,
            'signature': base64.b64encode(signature).decode(),
            'algorithm': 'RSA-PSS-SHA256'
        }
    
    def verify_code_signature(self, code_content: str, signature_data: Dict[str, str]) -> bool:
        """Verify code signature"""
        
        try:
            # Calculate current code hash
            current_hash = hashlib.sha256(code_content.encode()).hexdigest()
            
            # Check if hash matches signed hash
            if current_hash != signature_data['code_hash']:
                return False
            
            # Verify signature
            signature_bytes = base64.b64decode(signature_data['signature'])
            
            self.public_key.verify(
                signature_bytes,
                signature_data['code_hash'].encode(),
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            
            return True
            
        except Exception:
            return False
    
    def get_public_key_pem(self) -> str:
        """Get public key for distribution"""
        return self.public_key.serialize(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode()

# Example usage
code_signer = CodeSigningSystem()

# Sign code
source_code = """
def secure_function():
    return "This is secure code"
"""

signature_info = code_signer.sign_code(source_code)
print(f"Code signature: {signature_info}")

# Verify signature
is_valid = code_signer.verify_code_signature(source_code, signature_info)
print(f"Signature valid: {is_valid}")

# Test with modified code
modified_code = source_code + "\n# Malicious comment"
is_valid_modified = code_signer.verify_code_signature(modified_code, signature_info)
print(f"Modified code signature valid: {is_valid_modified}")  # Should be False
```

### File System Integrity Monitoring

```python
import os
import time
import json
from pathlib import Path
from typing import Dict, List, Set

class FileSystemIntegrityMonitor:
    def __init__(self, monitored_paths: List[str]):
        self.monitored_paths = [Path(p) for p in monitored_paths]
        self.baseline = {}
        self.violations = []
        self.create_baseline()
    
    def create_baseline(self):
        """Create baseline of file system state"""
        
        print("Creating file system integrity baseline...")
        
        for path in self.monitored_paths:
            if path.exists():
                self.baseline.update(self._scan_directory(path))
        
        print(f"Baseline created with {len(self.baseline)} files")
    
    def _scan_directory(self, directory: Path) -> Dict[str, Dict]:
        """Scan directory and calculate file hashes"""
        
        file_info = {}
        
        for file_path in directory.rglob('*'):
            if file_path.is_file():
                try:
                    stat = file_path.stat()
                    file_hash = self._calculate_file_hash(file_path)
                    
                    file_info[str(file_path)] = {
                        'hash': file_hash,
                        'size': stat.st_size,
                        'modified_time': stat.st_mtime,
                        'permissions': oct(stat.st_mode)[-3:],
                        'baseline_time': time.time()
                    }
                    
                except (PermissionError, OSError):
                    # Skip files we can't read
                    continue
        
        return file_info
    
    def _calculate_file_hash(self, file_path: Path) -> str:
        """Calculate SHA-256 hash of file"""
        
        sha256_hash = hashlib.sha256()
        
        try:
            with open(file_path, 'rb') as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    sha256_hash.update(chunk)
            return sha256_hash.hexdigest()
        except:
            return "ERROR_READING_FILE"
    
    def check_integrity(self) -> Dict[str, Any]:
        """Check current file system state against baseline"""
        
        integrity_report = {
            'scan_time': time.time(),
            'total_files_baseline': len(self.baseline),
            'total_files_current': 0,
            'unchanged_files': 0,
            'modified_files': [],
            'new_files': [],
            'deleted_files': [],
            'permission_changes': [],
            'integrity_score': 0.0
        }
        
        # Scan current state
        current_state = {}
        for path in self.monitored_paths:
            if path.exists():
                current_state.update(self._scan_directory(path))
        
        integrity_report['total_files_current'] = len(current_state)
        
        # Compare with baseline
        baseline_files = set(self.baseline.keys())
        current_files = set(current_state.keys())
        
        # Find new files
        new_files = current_files - baseline_files
        integrity_report['new_files'] = list(new_files)
        
        # Find deleted files
        deleted_files = baseline_files - current_files
        integrity_report['deleted_files'] = list(deleted_files)
        
        # Check existing files for modifications
        common_files = baseline_files & current_files
        
        for file_path in common_files:
            baseline_info = self.baseline[file_path]
            current_info = current_state[file_path]
            
            # Check hash
            if baseline_info['hash'] != current_info['hash']:
                modification = {
                    'file': file_path,
                    'type': 'content_modified',
                    'baseline_hash': baseline_info['hash'],
                    'current_hash': current_info['hash'],
                    'size_change': current_info['size'] - baseline_info['size']
                }
                integrity_report['modified_files'].append(modification)
                
                # Log violation
                self.log_violation('file_modified', file_path, modification)
            
            # Check permissions
            elif baseline_info['permissions'] != current_info['permissions']:
                permission_change = {
                    'file': file_path,
                    'type': 'permission_changed',
                    'old_permissions': baseline_info['permissions'],
                    'new_permissions': current_info['permissions']
                }
                integrity_report['permission_changes'].append(permission_change)
                
                # Log violation
                self.log_violation('permission_changed', file_path, permission_change)
            
            else:
                integrity_report['unchanged_files'] += 1
        
        # Calculate integrity score
        total_baseline_files = len(baseline_files)
        if total_baseline_files > 0:
            violations = len(integrity_report['modified_files']) + len(integrity_report['deleted_files'])
            integrity_report['integrity_score'] = max(0, (total_baseline_files - violations) / total_baseline_files * 100)
        
        return integrity_report
    
    def log_violation(self, violation_type: str, file_path: str, details: Dict):
        """Log integrity violation"""
        
        violation = {
            'timestamp': time.time(),
            'type': violation_type,
            'file_path': file_path,
            'details': details
        }
        
        self.violations.append(violation)
        
        # In production, send alerts for critical violations
        if violation_type in ['file_modified', 'deleted_files']:
            self.send_integrity_alert(violation)
    
    def send_integrity_alert(self, violation: Dict):
        """Send alert for integrity violation"""
        
        alert_message = f"""
        INTEGRITY VIOLATION DETECTED
        
        Type: {violation['type']}
        File: {violation['file_path']}
        Time: {time.ctime(violation['timestamp'])}
        Details: {json.dumps(violation['details'], indent=2)}
        """
        
        print(f"ALERT: {alert_message}")
        # In production, integrate with alerting system (email, Slack, etc.)
    
    def update_baseline(self, file_path: str = None):
        """Update baseline after authorized changes"""
        
        if file_path:
            # Update specific file
            path = Path(file_path)
            if path.exists() and path.is_file():
                stat = path.stat()
                file_hash = self._calculate_file_hash(path)
                
                self.baseline[file_path] = {
                    'hash': file_hash,
                    'size': stat.st_size,
                    'modified_time': stat.st_mtime,
                    'permissions': oct(stat.st_mode)[-3:],
                    'baseline_time': time.time()
                }
        else:
            # Update entire baseline
            self.create_baseline()
    
    def get_violation_summary(self, days: int = 7) -> Dict:
        """Get summary of violations in specified period"""
        
        cutoff_time = time.time() - (days * 24 * 60 * 60)
        recent_violations = [v for v in self.violations if v['timestamp'] > cutoff_time]
        
        violation_types = {}
        for violation in recent_violations:
            v_type = violation['type']
            violation_types[v_type] = violation_types.get(v_type, 0) + 1
        
        return {
            'period_days': days,
            'total_violations': len(recent_violations),
            'violations_by_type': violation_types,
            'most_common_violation': max(violation_types, key=violation_types.get) if violation_types else None
        }

# Example usage
monitor = FileSystemIntegrityMonitor(['/etc', '/usr/bin', '/home/user/important'])

# Check integrity
integrity_report = monitor.check_integrity()
print(f"Integrity Report: {json.dumps(integrity_report, indent=2, default=str)}")

# Get violation summary
violation_summary = monitor.get_violation_summary(7)
print(f"Violations (last 7 days): {json.dumps(violation_summary, indent=2)}")
```

## Detection and Response

### Automated Integrity Monitoring

```python
import threading
import schedule
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class IntegrityMonitoringSystem:
    def __init__(self, config: Dict):
        self.config = config
        self.monitors = {}
        self.alert_thresholds = config.get('alert_thresholds', {})
        self.notification_channels = config.get('notifications', {})
        self.monitoring_active = False
    
    def add_file_monitor(self, name: str, paths: List[str]):
        """Add file system integrity monitor"""
        self.monitors[name] = {
            'type': 'filesystem',
            'monitor': FileSystemIntegrityMonitor(paths),
            'last_check': None,
            'violation_count': 0
        }
    
    def add_database_monitor(self, name: str, db_path: str):
        """Add database integrity monitor"""
        self.monitors[name] = {
            'type': 'database',
            'monitor': DatabaseIntegrityManager(db_path),
            'last_check': None,
            'violation_count': 0
        }
    
    def start_monitoring(self, check_interval_minutes: int = 15):
        """Start automated integrity monitoring"""
        
        self.monitoring_active = True
        
        # Schedule regular integrity checks
        schedule.every(check_interval_minutes).minutes.do(self.run_integrity_checks)
        
        # Schedule daily reports
        schedule.every().day.at("09:00").do(self.generate_daily_report)
        
        # Start monitoring thread
        monitoring_thread = threading.Thread(target=self._monitoring_loop)
        monitoring_thread.daemon = True
        monitoring_thread.start()
        
        print(f"Integrity monitoring started (check interval: {check_interval_minutes} minutes)")
    
    def _monitoring_loop(self):
        """Main monitoring loop"""
        while self.monitoring_active:
            schedule.run_pending()
            time.sleep(60)  # Check every minute for scheduled tasks
    
    def run_integrity_checks(self):
        """Run integrity checks on all monitors"""
        
        print("Running scheduled integrity checks...")
        
        for monitor_name, monitor_info in self.monitors.items():
            try:
                if monitor_info['type'] == 'filesystem':
                    result = monitor_info['monitor'].check_integrity()
                    self.process_filesystem_result(monitor_name, result)
                
                elif monitor_info['type'] == 'database':
                    result = monitor_info['monitor'].get_integrity_report(1)  # Last 24 hours
                    self.process_database_result(monitor_name, result)
                
                monitor_info['last_check'] = time.time()
                
            except Exception as e:
                self.send_alert(f"Monitor '{monitor_name}' failed: {str(e)}", 'critical')
    
    def process_filesystem_result(self, monitor_name: str, result: Dict):
        """Process file system integrity check result"""
        
        violations = len(result['modified_files']) + len(result['deleted_files'])
        
        if violations > 0:
            self.monitors[monitor_name]['violation_count'] += violations
            
            # Check alert thresholds
            if violations >= self.alert_thresholds.get('filesystem_critical', 5):
                self.send_alert(
                    f"CRITICAL: {violations} file integrity violations detected in {monitor_name}",
                    'critical'
                )
            elif violations >= self.alert_thresholds.get('filesystem_warning', 1):
                self.send_alert(
                    f"WARNING: {violations} file integrity violations detected in {monitor_name}",
                    'warning'
                )
    
    def process_database_result(self, monitor_name: str, result: Dict):
        """Process database integrity check result"""
        
        violations = result['total_violations']
        
        if violations > 0:
            self.monitors[monitor_name]['violation_count'] += violations
            
            # Check alert thresholds
            if violations >= self.alert_thresholds.get('database_critical', 10):
                self.send_alert(
                    f"CRITICAL: {violations} database integrity violations detected in {monitor_name}",
                    'critical'
                )
            elif violations >= self.alert_thresholds.get('database_warning', 1):
                self.send_alert(
                    f"WARNING: {violations} database integrity violations detected in {monitor_name}",
                    'warning'
                )
    
    def send_alert(self, message: str, severity: str):
        """Send integrity violation alert"""
        
        alert_data = {
            'timestamp': time.time(),
            'message': message,
            'severity': severity,
            'system': 'integrity_monitor'
        }
        
        # Console alert
        print(f"INTEGRITY ALERT [{severity.upper()}]: {message}")
        
        # Email alert
        if 'email' in self.notification_channels:
            self.send_email_alert(alert_data)
        
        # Slack alert
        if 'slack' in self.notification_channels:
            self.send_slack_alert(alert_data)
        
        # Log alert
        self.log_alert(alert_data)
    
    def send_email_alert(self, alert_data: Dict):
        """Send email alert"""
        
        email_config = self.notification_channels['email']
        
        try:
            msg = MIMEMultipart()
            msg['From'] = email_config['from']
            msg['To'] = email_config['to']
            msg['Subject'] = f"Integrity Alert - {alert_data['severity'].upper()}"
            
            body = f"""
            Integrity Violation Detected
            
            Severity: {alert_data['severity'].upper()}
            Time: {time.ctime(alert_data['timestamp'])}
            Message: {alert_data['message']}
            
            Please investigate immediately.
            """
            
            msg.attach(MIMEText(body, 'plain'))
            
            server = smtplib.SMTP(email_config['smtp_server'], email_config['smtp_port'])
            server.starttls()
            server.login(email_config['username'], email_config['password'])
            server.send_message(msg)
            server.quit()
            
        except Exception as e:
            print(f"Failed to send email alert: {e}")
    
    def send_slack_alert(self, alert_data: Dict):
        """Send Slack alert"""
        
        slack_config = self.notification_channels['slack']
        
        try:
            import requests
            
            payload = {
                'text': f"🚨 Integrity Alert - {alert_data['severity'].upper()}",
                'attachments': [{
                    'color': 'danger' if alert_data['severity'] == 'critical' else 'warning',
                    'fields': [
                        {'title': 'Time', 'value': time.ctime(alert_data['timestamp']), 'short': True},
                        {'title': 'Severity', 'value': alert_data['severity'].upper(), 'short': True},
                        {'title': 'Message', 'value': alert_data['message'], 'short': False}
                    ]
                }]
            }
            
            response = requests.post(slack_config['webhook_url'], json=payload)
            
            if response.status_code != 200:
                print(f"Failed to send Slack alert: {response.text}")
                
        except Exception as e:
            print(f"Failed to send Slack alert: {e}")
    
    def log_alert(self, alert_data: Dict):
        """Log alert to file"""
        
        log_file = self.config.get('log_file', 'integrity_alerts.log')
        
        try:
            with open(log_file, 'a') as f:
                f.write(f"{json.dumps(alert_data)}\n")
        except Exception as e:
            print(f"Failed to log alert: {e}")
    
    def generate_daily_report(self):
        """Generate daily integrity report"""
        
        report = {
            'date': time.strftime('%Y-%m-%d'),
            'monitors': {},
            'total_violations': 0,
            'system_health': 'unknown'
        }
        
        for monitor_name, monitor_info in self.monitors.items():
            monitor_summary = {
                'type': monitor_info['type'],
                'last_check': monitor_info['last_check'],
                'violation_count': monitor_info['violation_count'],
                'status': 'healthy' if monitor_info['violation_count'] == 0 else 'violations_detected'
            }
            
            report['monitors'][monitor_name] = monitor_summary
            report['total_violations'] += monitor_info['violation_count']
        
        # Determine overall system health
        if report['total_violations'] == 0:
            report['system_health'] = 'healthy'
        elif report['total_violations'] < 5:
            report['system_health'] = 'warning'
        else:
            report['system_health'] = 'critical'
        
        # Save report
        report_file = f"integrity_report_{report['date']}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        print(f"Daily integrity report generated: {report_file}")
        
        # Send summary if violations detected
        if report['total_violations'] > 0:
            self.send_alert(
                f"Daily Report: {report['total_violations']} integrity violations detected",
                'warning' if report['total_violations'] < 5 else 'critical'
            )
    
    def stop_monitoring(self):
        """Stop integrity monitoring"""
        self.monitoring_active = False
        print("Integrity monitoring stopped")

# Example configuration and usage
monitoring_config = {
    'alert_thresholds': {
        'filesystem_warning': 1,
        'filesystem_critical': 5,
        'database_warning': 1,
        'database_critical': 10
    },
    'notifications': {
        'email': {
            'smtp_server': 'smtp.gmail.com',
            'smtp_port': 587,
            'username': 'alerts@company.com',
            'password': 'app_password',
            'from': 'alerts@company.com',
            'to': 'security@company.com'
        },
        'slack': {
            'webhook_url': 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
        }
    },
    'log_file': 'integrity_monitoring.log'
}

# Initialize monitoring system
integrity_monitor = IntegrityMonitoringSystem(monitoring_config)

# Add monitors
integrity_monitor.add_file_monitor('system_files', ['/etc', '/usr/bin'])
integrity_monitor.add_file_monitor('application_files', ['/opt/myapp'])
integrity_monitor.add_database_monitor('main_db', '/var/lib/myapp/main.db')

# Start monitoring
integrity_monitor.start_monitoring(check_interval_minutes=15)
```

## Recovery and Incident Response

### Integrity Failure Response Plan

```python
class IntegrityIncidentResponse:
    def __init__(self):
        self.incident_log = []
        self.recovery_procedures = {}
        self.backup_systems = {}
    
    def handle_integrity_failure(self, failure_type: str, affected_systems: List[str], 
                                severity: str) -> Dict:
        """Handle integrity failure incident"""
        
        incident_id = str(uuid.uuid4())
        
        incident = {
            'id': incident_id,
            'type': failure_type,
            'affected_systems': affected_systems,
            'severity': severity,
            'detected_at': time.time(),
            'status': 'investigating',
            'response_actions': [],
            'recovery_time': None
        }
        
        # Immediate response actions
        response_plan = self.get_response_plan(failure_type, severity)
        
        for action in response_plan['immediate_actions']:
            try:
                result = self.execute_response_action(action, affected_systems)
                incident['response_actions'].append({
                    'action': action,
                    'result': result,
                    'timestamp': time.time()
                })
            except Exception as e:
                incident['response_actions'].append({
                    'action': action,
                    'result': {'success': False, 'error': str(e)},
                    'timestamp': time.time()
                })
        
        # Log incident
        self.incident_log.append(incident)
        
        return {
            'incident_id': incident_id,
            'immediate_actions_completed': len(incident['response_actions']),
            'next_steps': response_plan['next_steps']
        }
    
    def get_response_plan(self, failure_type: str, severity: str) -> Dict:
        """Get incident response plan"""
        
        response_plans = {
            'file_modified': {
                'immediate_actions': [
                    'isolate_affected_system',
                    'preserve_evidence',
                    'restore_from_backup'
                ],
                'next_steps': [
                    'forensic_analysis',
                    'root_cause_investigation',
                    'security_patch_deployment'
                ]
            },
            'data_corruption': {
                'immediate_actions': [
                    'stop_write_operations',
                    'backup_current_state',
                    'restore_from_clean_backup'
                ],
                'next_steps': [
                    'data_recovery_analysis',
                    'integrity_verification',
                    'gradual_service_restoration'
                ]
            },
            'supply_chain_compromise': {
                'immediate_actions': [
                    'quarantine_affected_components',
                    'revert_to_known_good_version',
                    'scan_for_indicators_of_compromise'
                ],
                'next_steps': [
                    'dependency_audit',
                    'build_pipeline_review',
                    'security_controls_enhancement'
                ]
            }
        }
        
        return response_plans.get(failure_type, {
            'immediate_actions': ['isolate_system', 'preserve_evidence'],
            'next_steps': ['investigate', 'recover']
        })
    
    def execute_response_action(self, action: str, affected_systems: List[str]) -> Dict:
        """Execute incident response action"""
        
        action_handlers = {
            'isolate_affected_system': self.isolate_system,
            'preserve_evidence': self.preserve_evidence,
            'restore_from_backup': self.restore_from_backup,
            'stop_write_operations': self.stop_write_operations,
            'backup_current_state': self.backup_current_state,
            'quarantine_affected_components': self.quarantine_components
        }
        
        handler = action_handlers.get(action)
        if handler:
            return handler(affected_systems)
        else:
            return {'success': False, 'error': f'Unknown action: {action}'}
    
    def isolate_system(self, systems: List[str]) -> Dict:
        """Isolate affected systems"""
        
        isolation_results = []
        
        for system in systems:
            # In production, this would:
            # - Disconnect from network
            # - Stop services
            # - Prevent further access
            
            isolation_results.append({
                'system': system,
                'isolated': True,
                'timestamp': time.time()
            })
        
        return {
            'success': True,
            'isolated_systems': isolation_results
        }
    
    def preserve_evidence(self, systems: List[str]) -> Dict:
        """Preserve evidence for forensic analysis"""
        
        evidence_preservation = []
        
        for system in systems:
            # Create forensic image
            evidence_id = f"evidence_{int(time.time())}_{system}"
            
            # In production, this would create bit-for-bit copies
            evidence_preservation.append({
                'system': system,
                'evidence_id': evidence_id,
                'preservation_time': time.time(),
                'hash': hashlib.sha256(f"{system}_{time.time()}".encode()).hexdigest()
            })
        
        return {
            'success': True,
            'evidence_preserved': evidence_preservation
        }
    
    def restore_from_backup(self, systems: List[str]) -> Dict:
        """Restore systems from clean backups"""
        
        restoration_results = []
        
        for system in systems:
            # Find latest clean backup
            backup_info = self.find_clean_backup(system)
            
            if backup_info:
                # Restore from backup
                restore_result = self.perform_restoration(system, backup_info)
                restoration_results.append(restore_result)
            else:
                restoration_results.append({
                    'system': system,
                    'success': False,
                    'error': 'No clean backup found'
                })
        
        return {
            'success': all(r.get('success', False) for r in restoration_results),
            'restoration_results': restoration_results
        }
    
    def find_clean_backup(self, system: str) -> Optional[Dict]:
        """Find latest clean backup for system"""
        
        # Mock implementation - in production, query backup system
        return {
            'backup_id': f"backup_{system}_clean",
            'timestamp': time.time() - 86400,  # 24 hours ago
            'integrity_verified': True,
            'backup_hash': hashlib.sha256(f"backup_{system}".encode()).hexdigest()
        }
    
    def perform_restoration(self, system: str, backup_info: Dict) -> Dict:
        """Perform system restoration from backup"""
        
        # Mock implementation - in production, perform actual restoration
        return {
            'system': system,
            'success': True,
            'backup_used': backup_info['backup_id'],
            'restoration_time': time.time()
        }
    
    def stop_write_operations(self, systems: List[str]) -> Dict:
        """Stop write operations to prevent further corruption"""
        
        # Implementation would stop database writes, file modifications, etc.
        return {'success': True, 'systems_protected': systems}
    
    def backup_current_state(self, systems: List[str]) -> Dict:
        """Backup current state before recovery"""
        
        # Implementation would create backups of current (potentially corrupted) state
        return {'success': True, 'backups_created': systems}
    
    def quarantine_components(self, systems: List[str]) -> Dict:
        """Quarantine compromised components"""
        
        # Implementation would isolate and analyze compromised components
        return {'success': True, 'quarantined_components': systems}

# Example usage
incident_response = IntegrityIncidentResponse()

# Simulate integrity failure
failure_response = incident_response.handle_integrity_failure(
    'file_modified',
    ['/etc/passwd', '/usr/bin/sudo'],
    'critical'
)

print(f"Incident response: {json.dumps(failure_response, indent=2)}")
```

## Best Practices and Prevention

### Comprehensive Integrity Strategy

```python
class IntegrityStrategy:
    def __init__(self):
        self.controls = {
            'preventive': [],
            'detective': [],
            'corrective': []
        }
        self.setup_integrity_controls()
    
    def setup_integrity_controls(self):
        """Setup comprehensive integrity controls"""
        
        # Preventive controls
        self.controls['preventive'] = [
            {
                'name': 'Code Signing',
                'description': 'Sign all code and verify signatures',
                'implementation': 'Digital signatures with PKI',
                'effectiveness': 'high'
            },
            {
                'name': 'Dependency Management',
                'description': 'Verify all dependencies and their integrity',
                'implementation': 'Hash verification and trusted sources',
                'effectiveness': 'high'
            },
            {
                'name': 'Access Controls',
                'description': 'Restrict access to critical systems and data',
                'implementation': 'RBAC and principle of least privilege',
                'effectiveness': 'medium'
            },
            {
                'name': 'Secure Development',
                'description': 'Implement secure coding practices',
                'implementation': 'Code review, static analysis, security training',
                'effectiveness': 'medium'
            }
        ]
        
        # Detective controls
        self.controls['detective'] = [
            {
                'name': 'File Integrity Monitoring',
                'description': 'Monitor file system for unauthorized changes',
                'implementation': 'Hash-based monitoring with alerts',
                'effectiveness': 'high'
            },
            {
                'name': 'Database Integrity Checks',
                'description': 'Regular verification of data integrity',
                'implementation': 'Checksums and referential integrity',
                'effectiveness': 'high'
            },
            {
                'name': 'Audit Logging',
                'description': 'Comprehensive logging of all system activities',
                'implementation': 'Centralized logging with integrity protection',
                'effectiveness': 'medium'
            },
            {
                'name': 'Anomaly Detection',
                'description': 'Detect unusual patterns in system behavior',
                'implementation': 'ML-based behavioral analysis',
                'effectiveness': 'medium'
            }
        ]
        
        # Corrective controls
        self.controls['corrective'] = [
            {
                'name': 'Automated Recovery',
                'description': 'Automatic restoration from clean backups',
                'implementation': 'Backup and restore automation',
                'effectiveness': 'high'
            },
            {
                'name': 'Incident Response',
                'description': 'Structured response to integrity failures',
                'implementation': 'Incident response procedures and tools',
                'effectiveness': 'high'
            },
            {
                'name': 'Forensic Analysis',
                'description': 'Detailed analysis of integrity failures',
                'implementation': 'Digital forensics tools and procedures',
                'effectiveness': 'medium'
            }
        ]
    
    def assess_integrity_posture(self, current_controls: List[str]) -> Dict:
        """Assess current integrity security posture"""
        
        assessment = {
            'implemented_controls': current_controls,
            'coverage_by_type': {},
            'gaps': [],
            'recommendations': [],
            'overall_score': 0
        }
        
        # Check coverage by control type
        for control_type, controls in self.controls.items():
            implemented = [c for c in controls if c['name'] in current_controls]
            coverage = len(implemented) / len(controls) * 100
            assessment['coverage_by_type'][control_type] = coverage
        
        # Identify gaps
        all_controls = []
        for controls in self.controls.values():
            all_controls.extend([c['name'] for c in controls])
        
        assessment['gaps'] = [c for c in all_controls if c not in current_controls]
        
        # Generate recommendations
        high_impact_missing = []
        for control_type, controls in self.controls.items():
            for control in controls:
                if control['name'] not in current_controls and control['effectiveness'] == 'high':
                    high_impact_missing.append(control['name'])
        
        assessment['recommendations'] = high_impact_missing[:5]  # Top 5 recommendations
        
        # Calculate overall score
        total_coverage = sum(assessment['coverage_by_type'].values())
        assessment['overall_score'] = total_coverage / len(self.controls)
        
        return assessment

# Example usage
strategy = IntegrityStrategy()

current_controls = [
    'Code Signing',
    'File Integrity Monitoring',
    'Audit Logging',
    'Automated Recovery'
]

posture_assessment = strategy.assess_integrity_posture(current_controls)
print(f"Integrity Posture Assessment: {json.dumps(posture_assessment, indent=2)}")
```

## Conclusion

Software and data integrity failures represent critical security risks that can have devastating consequences for organizations and users. Understanding the causes, implementing proper prevention measures, and having robust detection and response capabilities are essential for maintaining system security and reliability.

Key takeaways for maintaining integrity:

1. **Prevention is Key**: Implement strong preventive controls including code signing, dependency verification, and secure development practices
2. **Continuous Monitoring**: Deploy automated monitoring systems to detect integrity violations quickly
3. **Rapid Response**: Have well-defined incident response procedures for integrity failures
4. **Regular Auditing**: Conduct regular integrity audits and assessments
5. **Backup and Recovery**: Maintain clean, verified backups for rapid recovery
6. **Supply Chain Security**: Verify the integrity of all third-party components and dependencies

By implementing comprehensive integrity protection measures, organizations can significantly reduce their risk of integrity failures and minimize the impact when they do occur.