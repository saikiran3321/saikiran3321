---
sidebar_position: 1
---

# MongoDB Connection Strings

MongoDB connection strings are URIs that specify how to connect to a MongoDB database. They contain all the necessary information including authentication credentials, server addresses, database names, and connection options. Understanding connection strings is crucial for properly configuring MongoDB applications.

## Connection String Format

### Standard URI Format

MongoDB connection strings follow the standard URI format:

```
mongodb://[username:password@]host1[:port1][,...hostN[:portN]][/[defaultauthdb][?options]]
```

### MongoDB Atlas (Cloud) Format

```
mongodb+srv://[username:password@]clustername.mongodb.net[/[defaultauthdb][?options]]
```

### Basic Components

#### Protocol
- **mongodb://**: Standard MongoDB protocol
- **mongodb+srv://**: DNS seedlist connection format (used by Atlas)

#### Authentication
- **username**: Database username
- **password**: Database password (URL encoded)
- **defaultauthdb**: Authentication database (optional)

#### Hosts and Ports
- **host**: Server hostname or IP address
- **port**: Port number (default: 27017)
- **Multiple hosts**: For replica sets and sharded clusters

#### Database and Options
- **database**: Default database name
- **options**: Connection parameters and settings

## Basic Connection Examples

### Local MongoDB Instance

```javascript
// Simple local connection
const connectionString = "mongodb://localhost:27017/myapp";

// With authentication
const authConnectionString = "mongodb://username:password@localhost:27017/myapp";

// Custom port
const customPortString = "mongodb://localhost:27018/myapp";
```

### MongoDB Atlas (Cloud)

```javascript
// Atlas connection string
const atlasConnectionString = "mongodb+srv://username:password@cluster0.mongodb.net/myapp";

// With additional options
const atlasWithOptions = "mongodb+srv://username:password@cluster0.mongodb.net/myapp?retryWrites=true&w=majority";
```

### Replica Set Connection

```javascript
// Replica set connection
const replicaSetString = "mongodb://username:password@host1:27017,host2:27017,host3:27017/myapp?replicaSet=myReplicaSet";

// With read preference
const replicaWithReadPref = "mongodb://username:password@host1:27017,host2:27017,host3:27017/myapp?replicaSet=myReplicaSet&readPreference=secondary";
```

## Connection Options

### Authentication Options

#### Authentication Mechanisms
```javascript
// SCRAM-SHA-256 (default for MongoDB 4.0+)
const scramSHA256 = "mongodb://user:pass@host:27017/db?authMechanism=SCRAM-SHA-256";

// SCRAM-SHA-1 (legacy)
const scramSHA1 = "mongodb://user:pass@host:27017/db?authMechanism=SCRAM-SHA-1";

// X.509 Certificate Authentication
const x509Auth = "mongodb://host:27017/db?authMechanism=MONGODB-X509&ssl=true";

// LDAP Authentication
const ldapAuth = "mongodb://user:pass@host:27017/db?authMechanism=PLAIN&authSource=$external";
```

#### Authentication Database
```javascript
// Specify authentication database
const authDbString = "mongodb://user:pass@host:27017/myapp?authSource=admin";

// External authentication source
const externalAuth = "mongodb://user:pass@host:27017/myapp?authSource=$external";
```

### SSL/TLS Options

```javascript
// Enable SSL
const sslEnabled = "mongodb://user:pass@host:27017/db?ssl=true";

// SSL with certificate validation
const sslWithValidation = "mongodb://user:pass@host:27017/db?ssl=true&sslValidate=true";

// SSL with custom CA file
const sslWithCA = "mongodb://user:pass@host:27017/db?ssl=true&sslCA=/path/to/ca.pem";

// Client certificate authentication
const clientCert = "mongodb://host:27017/db?ssl=true&sslCert=/path/to/client.pem&sslKey=/path/to/client-key.pem";
```

### Connection Pool Options

```javascript
// Connection pool configuration
const poolOptions = "mongodb://user:pass@host:27017/db?maxPoolSize=50&minPoolSize=5&maxIdleTimeMS=30000";

// Connection timeout settings
const timeoutOptions = "mongodb://user:pass@host:27017/db?connectTimeoutMS=10000&socketTimeoutMS=30000&serverSelectionTimeoutMS=5000";
```

### Read and Write Concerns

```javascript
// Write concern options
const writeConcern = "mongodb://user:pass@host:27017/db?w=majority&wtimeoutMS=5000&journal=true";

// Read preference options
const readPreference = "mongodb://user:pass@host:27017/db?readPreference=secondaryPreferred&maxStalenessSeconds=120";

// Read concern
const readConcern = "mongodb://user:pass@host:27017/db?readConcernLevel=majority";
```

## Advanced Configuration

### Sharded Cluster Connection

```javascript
// Sharded cluster with mongos routers
const shardedCluster = `
mongodb://user:pass@mongos1:27017,mongos2:27017,mongos3:27017/myapp
?readPreference=nearest
&maxPoolSize=100
&retryWrites=true
`.replace(/\s+/g, '');
```

### High Availability Setup

```javascript
// High availability configuration
const haConfig = `
mongodb://user:pass@primary:27017,secondary1:27017,secondary2:27017/myapp
?replicaSet=myReplicaSet
&readPreference=secondaryPreferred
&maxStalenessSeconds=90
&retryWrites=true
&w=majority
&wtimeoutMS=5000
`.replace(/\s+/g, '');
```

### Performance Optimization

```javascript
// Performance-optimized connection
const performanceConfig = `
mongodb://user:pass@host:27017/myapp
?maxPoolSize=50
&minPoolSize=10
&maxIdleTimeMS=30000
&waitQueueTimeoutMS=5000
&connectTimeoutMS=10000
&socketTimeoutMS=30000
&compressors=snappy,zlib
`.replace(/\s+/g, '');
```

## Security Best Practices

### Password Security

#### URL Encoding Passwords
```javascript
// Passwords with special characters must be URL encoded
const specialChars = "p@ssw0rd!#$";
const encodedPassword = encodeURIComponent(specialChars);
const secureConnection = `mongodb://user:${encodedPassword}@host:27017/db`;

// Example encoding function
function encodeMongoPassword(password) {
    return encodeURIComponent(password)
        .replace(/'/g, '%27')
        .replace(/"/g, '%22');
}
```

#### Environment Variables
```javascript
// Store credentials in environment variables
const connectionString = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`;

// Using dotenv for local development
require('dotenv').config();
const mongoUri = process.env.MONGODB_URI;
```

### SSL/TLS Configuration

```javascript
// Production SSL configuration
const productionSSL = `
mongodb://user:pass@host:27017/db
?ssl=true
&sslValidate=true
&sslCA=/etc/ssl/certs/mongodb-ca.crt
&sslCert=/etc/ssl/certs/mongodb-client.crt
&sslKey=/etc/ssl/private/mongodb-client.key
`.replace(/\s+/g, '');
```

### Network Security

```javascript
// IP whitelisting and network security
const secureNetwork = `
mongodb://user:pass@secure-host:27017/db
?ssl=true
&authSource=admin
&retryWrites=true
&w=majority
&readPreference=primary
`.replace(/\s+/g, '');
```

## Connection String Validation

### Validation Function

```javascript
function validateMongoConnectionString(connectionString) {
    const validationResult = {
        isValid: false,
        errors: [],
        warnings: [],
        parsed: null
    };
    
    try {
        // Basic format validation
        if (!connectionString.startsWith('mongodb://') && !connectionString.startsWith('mongodb+srv://')) {
            validationResult.errors.push('Connection string must start with mongodb:// or mongodb+srv://');
            return validationResult;
        }
        
        // Parse URL
        const url = new URL(connectionString);
        
        // Validate protocol
        if (!['mongodb:', 'mongodb+srv:'].includes(url.protocol)) {
            validationResult.errors.push('Invalid protocol. Use mongodb:// or mongodb+srv://');
        }
        
        // Validate hostname
        if (!url.hostname) {
            validationResult.errors.push('Hostname is required');
        }
        
        // Check for authentication
        if (url.username && !url.password) {
            validationResult.warnings.push('Username provided without password');
        }
        
        // Validate port (for mongodb://)
        if (url.protocol === 'mongodb:' && url.port && (isNaN(url.port) || url.port < 1 || url.port > 65535)) {
            validationResult.errors.push('Invalid port number');
        }
        
        // Parse query parameters
        const params = new URLSearchParams(url.search);
        
        // Validate common options
        const validOptions = [
            'authSource', 'authMechanism', 'ssl', 'tls', 'replicaSet',
            'readPreference', 'maxPoolSize', 'minPoolSize', 'maxIdleTimeMS',
            'connectTimeoutMS', 'socketTimeoutMS', 'serverSelectionTimeoutMS',
            'w', 'wtimeoutMS', 'journal', 'readConcernLevel', 'retryWrites',
            'compressors', 'zlibCompressionLevel'
        ];
        
        for (const [key, value] of params) {
            if (!validOptions.includes(key)) {
                validationResult.warnings.push(`Unknown option: ${key}`);
            }
        }
        
        // Validate specific option values
        if (params.has('maxPoolSize')) {
            const maxPool = parseInt(params.get('maxPoolSize'));
            if (isNaN(maxPool) || maxPool < 1) {
                validationResult.errors.push('maxPoolSize must be a positive integer');
            }
        }
        
        if (params.has('readPreference')) {
            const validReadPrefs = ['primary', 'primaryPreferred', 'secondary', 'secondaryPreferred', 'nearest'];
            if (!validReadPrefs.includes(params.get('readPreference'))) {
                validationResult.errors.push(`Invalid readPreference. Must be one of: ${validReadPrefs.join(', ')}`);
            }
        }
        
        // Set parsed information
        validationResult.parsed = {
            protocol: url.protocol,
            username: url.username,
            hostname: url.hostname,
            port: url.port || (url.protocol === 'mongodb:' ? '27017' : 'default'),
            database: url.pathname.slice(1),
            options: Object.fromEntries(params)
        };
        
        validationResult.isValid = validationResult.errors.length === 0;
        
    } catch (error) {
        validationResult.errors.push(`Invalid URL format: ${error.message}`);
    }
    
    return validationResult;
}

// Example usage
const testConnections = [
    "mongodb://localhost:27017/myapp",
    "mongodb+srv://user:pass@cluster0.mongodb.net/myapp",
    "mongodb://user:pass@host1:27017,host2:27017/myapp?replicaSet=rs0",
    "invalid-connection-string"
];

testConnections.forEach(conn => {
    const result = validateMongoConnectionString(conn);
    console.log(`Connection: ${conn}`);
    console.log(`Valid: ${result.isValid}`);
    if (result.errors.length > 0) {
        console.log(`Errors: ${result.errors.join(', ')}`);
    }
    if (result.warnings.length > 0) {
        console.log(`Warnings: ${result.warnings.join(', ')}`);
    }
    console.log('---');
});
```

## Language-Specific Examples

### Node.js with MongoDB Driver

```javascript
const { MongoClient } = require('mongodb');

class MongoDBConnection {
    constructor(connectionString, options = {}) {
        this.connectionString = connectionString;
        this.options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 50,
            minPoolSize: 5,
            maxIdleTimeMS: 30000,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            ...options
        };
        this.client = null;
        this.db = null;
    }
    
    async connect() {
        try {
            this.client = new MongoClient(this.connectionString, this.options);
            await this.client.connect();
            
            // Test the connection
            await this.client.db("admin").command({ ping: 1 });
            console.log("Successfully connected to MongoDB");
            
            // Get database from connection string or use default
            const dbName = this.extractDatabaseName(this.connectionString) || 'defaultdb';
            this.db = this.client.db(dbName);
            
            return this.db;
            
        } catch (error) {
            console.error("MongoDB connection failed:", error);
            throw error;
        }
    }
    
    async disconnect() {
        if (this.client) {
            await this.client.close();
            console.log("Disconnected from MongoDB");
        }
    }
    
    extractDatabaseName(connectionString) {
        try {
            const url = new URL(connectionString);
            return url.pathname.slice(1).split('?')[0];
        } catch {
            return null;
        }
    }
    
    async healthCheck() {
        try {
            if (!this.client) {
                return { status: 'disconnected' };
            }
            
            const adminDb = this.client.db("admin");
            const result = await adminDb.command({ ping: 1 });
            
            return {
                status: 'connected',
                ping: result.ok === 1,
                serverInfo: await adminDb.command({ buildInfo: 1 })
            };
            
        } catch (error) {
            return {
                status: 'error',
                error: error.message
            };
        }
    }
}

// Usage examples
async function examples() {
    // Local development
    const localConn = new MongoDBConnection("mongodb://localhost:27017/myapp");
    
    // Production with authentication
    const prodConn = new MongoDBConnection(
        "mongodb://user:password@prod-host:27017/myapp?authSource=admin",
        {
            maxPoolSize: 100,
            retryWrites: true
        }
    );
    
    // Atlas cloud connection
    const atlasConn = new MongoDBConnection(
        "mongodb+srv://user:password@cluster0.mongodb.net/myapp?retryWrites=true&w=majority"
    );
    
    try {
        const db = await localConn.connect();
        
        // Perform database operations
        const collection = db.collection('users');
        const users = await collection.find({}).toArray();
        console.log(`Found ${users.length} users`);
        
        // Health check
        const health = await localConn.healthCheck();
        console.log('Database health:', health);
        
    } catch (error) {
        console.error('Database operation failed:', error);
    } finally {
        await localConn.disconnect();
    }
}
```

### Python with PyMongo

```python
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import urllib.parse
from typing import Optional, Dict, Any

class MongoDBConnection:
    def __init__(self, connection_string: str, **options):
        self.connection_string = connection_string
        self.options = {
            'serverSelectionTimeoutMS': 5000,
            'connectTimeoutMS': 10000,
            'socketTimeoutMS': 45000,
            'maxPoolSize': 50,
            'minPoolSize': 5,
            'maxIdleTimeMS': 30000,
            **options
        }
        self.client = None
        self.db = None
    
    def connect(self) -> Optional[Any]:
        """Connect to MongoDB"""
        try:
            self.client = MongoClient(self.connection_string, **self.options)
            
            # Test the connection
            self.client.admin.command('ping')
            print("Successfully connected to MongoDB")
            
            # Extract database name from connection string
            db_name = self._extract_database_name(self.connection_string)
            if db_name:
                self.db = self.client[db_name]
            
            return self.db
            
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            print(f"MongoDB connection failed: {e}")
            raise
    
    def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            print("Disconnected from MongoDB")
    
    def _extract_database_name(self, connection_string: str) -> Optional[str]:
        """Extract database name from connection string"""
        try:
            parsed = urllib.parse.urlparse(connection_string)
            db_name = parsed.path.lstrip('/').split('?')[0]
            return db_name if db_name else None
        except:
            return None
    
    def health_check(self) -> Dict[str, Any]:
        """Perform health check"""
        try:
            if not self.client:
                return {'status': 'disconnected'}
            
            # Ping the database
            result = self.client.admin.command('ping')
            
            # Get server info
            server_info = self.client.admin.command('buildInfo')
            
            return {
                'status': 'connected',
                'ping': result.get('ok') == 1,
                'server_version': server_info.get('version'),
                'server_info': server_info
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e)
            }

# Usage examples
def main():
    # Local development
    local_conn = MongoDBConnection("mongodb://localhost:27017/myapp")
    
    # Production with authentication
    prod_conn = MongoDBConnection(
        "mongodb://user:password@prod-host:27017/myapp?authSource=admin",
        maxPoolSize=100,
        retryWrites=True
    )
    
    # Atlas cloud connection
    atlas_conn = MongoDBConnection(
        "mongodb+srv://user:password@cluster0.mongodb.net/myapp?retryWrites=true&w=majority"
    )
    
    try:
        db = local_conn.connect()
        
        if db:
            # Perform database operations
            collection = db['users']
            users = list(collection.find({}))
            print(f"Found {len(users)} users")
            
            # Health check
            health = local_conn.health_check()
            print(f"Database health: {health}")
        
    except Exception as e:
        print(f"Database operation failed: {e}")
    finally:
        local_conn.disconnect()

if __name__ == "__main__":
    main()
```

### Java with MongoDB Driver

```java
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.MongoCredential;
import com.mongodb.ReadPreference;
import com.mongodb.WriteConcern;
import com.mongodb.ReadConcern;

public class MongoDBConnection {
    private MongoClient mongoClient;
    private MongoDatabase database;
    
    // Connection using connection string
    public void connectWithString(String connectionString) {
        try {
            mongoClient = MongoClients.create(connectionString);
            
            // Test connection
            mongoClient.getDatabase("admin").runCommand(new Document("ping", 1));
            System.out.println("Successfully connected to MongoDB");
            
            // Extract database name
            ConnectionString connString = new ConnectionString(connectionString);
            String dbName = connString.getDatabase();
            if (dbName != null) {
                database = mongoClient.getDatabase(dbName);
            }
            
        } catch (Exception e) {
            System.err.println("MongoDB connection failed: " + e.getMessage());
            throw e;
        }
    }
    
    // Connection using MongoClientSettings
    public void connectWithSettings(String host, int port, String username, 
                                  String password, String authDatabase, String targetDatabase) {
        try {
            MongoCredential credential = MongoCredential.createCredential(
                username, authDatabase, password.toCharArray()
            );
            
            MongoClientSettings settings = MongoClientSettings.builder()
                .applyToClusterSettings(builder -> 
                    builder.hosts(Arrays.asList(new ServerAddress(host, port))))
                .credential(credential)
                .readPreference(ReadPreference.secondaryPreferred())
                .writeConcern(WriteConcern.MAJORITY)
                .readConcern(ReadConcern.MAJORITY)
                .retryWrites(true)
                .build();
            
            mongoClient = MongoClients.create(settings);
            database = mongoClient.getDatabase(targetDatabase);
            
            // Test connection
            database.runCommand(new Document("ping", 1));
            System.out.println("Successfully connected to MongoDB");
            
        } catch (Exception e) {
            System.err.println("MongoDB connection failed: " + e.getMessage());
            throw e;
        }
    }
    
    public void disconnect() {
        if (mongoClient != null) {
            mongoClient.close();
            System.out.println("Disconnected from MongoDB");
        }
    }
    
    public Document healthCheck() {
        try {
            if (mongoClient == null) {
                return new Document("status", "disconnected");
            }
            
            Document pingResult = mongoClient.getDatabase("admin")
                .runCommand(new Document("ping", 1));
            
            Document buildInfo = mongoClient.getDatabase("admin")
                .runCommand(new Document("buildInfo", 1));
            
            return new Document()
                .append("status", "connected")
                .append("ping", pingResult.getInteger("ok") == 1)
                .append("serverVersion", buildInfo.getString("version"));
                
        } catch (Exception e) {
            return new Document()
                .append("status", "error")
                .append("error", e.getMessage());
        }
    }
}

// Usage example
public class Example {
    public static void main(String[] args) {
        MongoDBConnection conn = new MongoDBConnection();
        
        try {
            // Connect using connection string
            conn.connectWithString("mongodb://user:password@localhost:27017/myapp?authSource=admin");
            
            // Perform health check
            Document health = conn.healthCheck();
            System.out.println("Health check: " + health.toJson());
            
        } catch (Exception e) {
            System.err.println("Connection failed: " + e.getMessage());
        } finally {
            conn.disconnect();
        }
    }
}
```

## Troubleshooting Common Issues

### Connection Failures

#### DNS Resolution Issues
```javascript
// DNS troubleshooting for Atlas connections
const troubleshootDNS = async (hostname) => {
    const dns = require('dns').promises;
    
    try {
        const addresses = await dns.lookup(hostname);
        console.log(`DNS resolution for ${hostname}:`, addresses);
        
        // For SRV records (mongodb+srv)
        if (hostname.includes('mongodb.net')) {
            const srvRecords = await dns.resolveSrv(`_mongodb._tcp.${hostname}`);
            console.log('SRV records:', srvRecords);
        }
        
    } catch (error) {
        console.error('DNS resolution failed:', error.message);
    }
};
```

#### Authentication Failures
```javascript
// Debug authentication issues
const debugAuth = (connectionString) => {
    const url = new URL(connectionString);
    
    console.log('Authentication Debug:');
    console.log(`Username: ${url.username || 'Not provided'}`);
    console.log(`Password: ${url.password ? '[HIDDEN]' : 'Not provided'}`);
    
    const params = new URLSearchParams(url.search);
    console.log(`Auth Source: ${params.get('authSource') || 'Database from path'}`);
    console.log(`Auth Mechanism: ${params.get('authMechanism') || 'Default (SCRAM-SHA-256)'}`);
};
```

#### Network Connectivity
```javascript
// Test network connectivity
const testConnectivity = async (host, port = 27017) => {
    const net = require('net');
    
    return new Promise((resolve) => {
        const socket = new net.Socket();
        const timeout = 5000;
        
        socket.setTimeout(timeout);
        
        socket.on('connect', () => {
            console.log(`Successfully connected to ${host}:${port}`);
            socket.destroy();
            resolve(true);
        });
        
        socket.on('timeout', () => {
            console.log(`Connection to ${host}:${port} timed out`);
            socket.destroy();
            resolve(false);
        });
        
        socket.on('error', (error) => {
            console.log(`Connection to ${host}:${port} failed:`, error.message);
            resolve(false);
        });
        
        socket.connect(port, host);
    });
};
```

## Environment-Specific Configurations

### Development Environment

```javascript
// Development configuration
const developmentConfig = {
    connectionString: "mongodb://localhost:27017/myapp_dev",
    options: {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferMaxEntries: 0,
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
};
```

### Testing Environment

```javascript
// Testing configuration with in-memory database
const testingConfig = {
    connectionString: "mongodb://localhost:27017/myapp_test",
    options: {
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 2000,
        socketTimeoutMS: 10000,
        bufferMaxEntries: 0
    }
};

// MongoDB Memory Server for testing
const { MongoMemoryServer } = require('mongodb-memory-server');

async function setupTestDatabase() {
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    return {
        connectionString: uri,
        cleanup: async () => await mongod.stop()
    };
}
```

### Production Environment

```javascript
// Production configuration
const productionConfig = {
    connectionString: process.env.MONGODB_URI,
    options: {
        maxPoolSize: 100,
        minPoolSize: 10,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        w: 'majority',
        readPreference: 'secondaryPreferred',
        readConcern: { level: 'majority' },
        ssl: true,
        sslValidate: true
    }
};
```

## Best Practices

### Security Guidelines

1. **Never hardcode credentials** in source code
2. **Use environment variables** for sensitive information
3. **Enable SSL/TLS** for production connections
4. **Use strong authentication mechanisms** (SCRAM-SHA-256)
5. **Implement proper error handling** for connection failures
6. **Regular credential rotation** and access review
7. **Network security** with IP whitelisting and VPNs

### Performance Optimization

1. **Connection pooling** with appropriate pool sizes
2. **Read preferences** for load distribution
3. **Write concerns** for consistency requirements
4. **Connection timeouts** to prevent hanging connections
5. **Compression** for large data transfers
6. **Monitoring** connection pool metrics

### Monitoring and Maintenance

1. **Health checks** for connection status
2. **Connection pool monitoring** for performance
3. **Error logging** for troubleshooting
4. **Regular testing** of connection strings
5. **Documentation** of connection configurations
6. **Backup connection strings** for failover scenarios

Understanding MongoDB connection strings is essential for building robust, secure, and performant applications that interact with MongoDB databases across different environments and deployment scenarios.