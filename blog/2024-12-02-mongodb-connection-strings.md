---
slug: mongodb-connection-strings
title: MongoDB Connection Strings - The Complete Developer's Guide
authors: [saikiran]
tags: [mongodb, database, connection-strings, backend, devops, security]
---

MongoDB connection strings are the gateway to your database, yet they're often misunderstood and misconfigured. Whether you're connecting to a local development instance, a production replica set, or MongoDB Atlas in the cloud, understanding connection strings is crucial for building robust, secure applications.

<!-- truncate -->

## Why Connection Strings Matter

Every MongoDB application starts with a connection string. Get it wrong, and your app won't connect. Configure it poorly, and you'll face performance issues, security vulnerabilities, or unexpected failures in production.

I've seen applications fail in production because developers didn't understand the difference between `mongodb://` and `mongodb+srv://`, or because they hardcoded credentials that worked locally but failed in production environments.

This guide will help you master MongoDB connection strings, from basic syntax to advanced configurations for enterprise deployments.

## The Anatomy of a Connection String

### Basic Structure

MongoDB connection strings follow a specific URI format:

```
mongodb://[username:password@]host1[:port1][,...hostN[:portN]][/[defaultauthdb][?options]]
```

Let's break this down with a real example:

```javascript
// Basic local connection
const localConnection = "mongodb://localhost:27017/myapp";

// Production connection with authentication
const prodConnection = "mongodb://appuser:secretpass@prod-db1:27017,prod-db2:27017,prod-db3:27017/myapp?replicaSet=production&authSource=admin";

// MongoDB Atlas (cloud) connection
const atlasConnection = "mongodb+srv://username:password@cluster0.mongodb.net/myapp?retryWrites=true&w=majority";
```

### Understanding Each Component

**Protocol**: `mongodb://` vs `mongodb+srv://`
- `mongodb://`: Standard connection protocol
- `mongodb+srv://`: DNS seedlist connection format (primarily for Atlas)

**Authentication**: `username:password@`
- Optional but recommended for production
- Password must be URL-encoded if it contains special characters

**Hosts**: `host1:port1,host2:port2`
- Single host for standalone instances
- Multiple hosts for replica sets and sharded clusters
- Default port is 27017

**Database**: `/myapp`
- Default database for operations
- Optional - can be specified later in code

**Options**: `?option1=value1&option2=value2`
- Connection behavior configuration
- Authentication, SSL, timeouts, etc.

## Real-World Connection Examples

### Development Environment

```javascript
// Simple local development
const devConfig = {
  connectionString: "mongodb://localhost:27017/myapp_dev",
  options: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  }
};

// Local with authentication (if auth is enabled)
const devWithAuth = "mongodb://devuser:devpass@localhost:27017/myapp_dev?authSource=admin";

// Docker Compose setup
const dockerConnection = "mongodb://root:example@mongo:27017/myapp_dev?authSource=admin";
```

### Production Environments

```javascript
// Production replica set
const productionReplicaSet = `
mongodb://produser:${encodeURIComponent('complex!password#123')}@
prod-primary:27017,prod-secondary1:27017,prod-secondary2:27017/myapp
?replicaSet=production
&authSource=admin
&ssl=true
&retryWrites=true
&w=majority
&readPreference=secondaryPreferred
`.replace(/\s+/g, '');

// High-availability sharded cluster
const shardedCluster = `
mongodb://clusteruser:${encodeURIComponent('secure@password!')}@
mongos1:27017,mongos2:27017,mongos3:27017/myapp
?ssl=true
&authSource=admin
&readPreference=nearest
&maxPoolSize=100
&retryWrites=true
`.replace(/\s+/g, '');
```

### Cloud Deployments (MongoDB Atlas)

```javascript
// Standard Atlas connection
const atlasStandard = "mongodb+srv://username:password@cluster0.mongodb.net/myapp?retryWrites=true&w=majority";

// Atlas with advanced options
const atlasAdvanced = `
mongodb+srv://username:password@cluster0.mongodb.net/myapp
?retryWrites=true
&w=majority
&readPreference=secondaryPreferred
&maxPoolSize=50
&serverSelectionTimeoutMS=5000
`.replace(/\s+/g, '');

// Atlas with specific region
const atlasRegional = "mongodb+srv://username:password@cluster0-shard-00-00.mongodb.net/myapp?ssl=true&replicaSet=atlas-cluster&authSource=admin";
```

## Security Best Practices

### Credential Management

Never hardcode credentials in your source code. Here's how to handle them properly:

```javascript
// ❌ Wrong: Hardcoded credentials
const badConnection = "mongodb://admin:password123@localhost:27017/myapp";

// ✅ Correct: Environment variables
const secureConnection = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`;

// ✅ Better: Using a configuration object
const config = {
  username: process.env.MONGO_USER,
  password: process.env.MONGO_PASSWORD,
  host: process.env.MONGO_HOST,
  port: process.env.MONGO_PORT || 27017,
  database: process.env.MONGO_DATABASE,
  authSource: process.env.MONGO_AUTH_SOURCE || 'admin'
};

const connectionString = `mongodb://${config.username}:${encodeURIComponent(config.password)}@${config.host}:${config.port}/${config.database}?authSource=${config.authSource}`;
```

### Password Encoding

Special characters in passwords must be URL-encoded:

```javascript
// Password encoding utility
function encodeMongoPassword(password) {
  return encodeURIComponent(password)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22')
    .replace(/`/g, '%60');
}

// Example with special characters
const complexPassword = "p@ssw0rd!#$%^&*()";
const encodedPassword = encodeMongoPassword(complexPassword);
const connectionString = `mongodb://user:${encodedPassword}@host:27017/db`;

console.log(`Encoded password: ${encodedPassword}`);
// Output: p%40ssw0rd!%23%24%25%5E%26*()
```

### SSL/TLS Configuration

```javascript
// Production SSL configuration
const sslConfig = `
mongodb://user:pass@secure-host:27017/myapp
?ssl=true
&sslValidate=true
&sslCA=/path/to/ca-certificate.crt
&authSource=admin
&retryWrites=true
`.replace(/\s+/g, '');

// Atlas SSL (automatically enabled)
const atlasSSL = "mongodb+srv://user:pass@cluster0.mongodb.net/myapp"; // SSL is automatic
```

## Advanced Configuration Patterns

### Connection Pooling Optimization

```javascript
// Optimized connection pool settings
const optimizedConnection = `
mongodb://user:pass@host:27017/myapp
?maxPoolSize=50
&minPoolSize=10
&maxIdleTimeMS=30000
&waitQueueTimeoutMS=5000
&connectTimeoutMS=10000
&socketTimeoutMS=30000
&serverSelectionTimeoutMS=5000
`.replace(/\s+/g, '');

// Connection pool monitoring
class ConnectionPoolMonitor {
  constructor(client) {
    this.client = client;
    this.setupMonitoring();
  }
  
  setupMonitoring() {
    this.client.on('connectionPoolCreated', (event) => {
      console.log(`Connection pool created for ${event.address}`);
    });
    
    this.client.on('connectionCreated', (event) => {
      console.log(`New connection created: ${event.connectionId}`);
    });
    
    this.client.on('connectionClosed', (event) => {
      console.log(`Connection closed: ${event.connectionId}, Reason: ${event.reason}`);
    });
    
    this.client.on('connectionPoolCleared', (event) => {
      console.log(`Connection pool cleared for ${event.address}`);
    });
  }
  
  getPoolStats() {
    // In a real implementation, you'd gather actual pool statistics
    return {
      totalConnections: 'Available via MongoDB driver events',
      availableConnections: 'Monitor via application metrics',
      checkedOutConnections: 'Track via pool events'
    };
  }
}
```

### Read and Write Preferences

```javascript
// Read preference configurations
const readConfigurations = {
  // Primary only (default)
  primary: "mongodb://user:pass@host:27017/db?readPreference=primary",
  
  // Secondary preferred (better for read-heavy workloads)
  secondaryPreferred: "mongodb://user:pass@host:27017/db?readPreference=secondaryPreferred&maxStalenessSeconds=90",
  
  // Nearest (lowest latency)
  nearest: "mongodb://user:pass@host:27017/db?readPreference=nearest",
  
  // Secondary only (read replicas)
  secondary: "mongodb://user:pass@host:27017/db?readPreference=secondary&maxStalenessSeconds=120"
};

// Write concern configurations
const writeConfigurations = {
  // Majority acknowledgment (recommended for production)
  majority: "mongodb://user:pass@host:27017/db?w=majority&wtimeoutMS=5000",
  
  // All nodes acknowledgment (highest consistency)
  all: "mongodb://user:pass@host:27017/db?w=3&wtimeoutMS=10000", // For 3-node replica set
  
  // Fast writes (lower consistency)
  fast: "mongodb://user:pass@host:27017/db?w=1&j=false",
  
  // Journaled writes
  journaled: "mongodb://user:pass@host:27017/db?w=1&j=true&wtimeoutMS=5000"
};
```

## Framework-Specific Implementations

### Express.js with Mongoose

```javascript
const mongoose = require('mongoose');

class MongooseConnection {
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
      bufferMaxEntries: 0,
      bufferCommands: false,
      ...options
    };
    
    this.setupEventHandlers();
  }
  
  setupEventHandlers() {
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from MongoDB');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Mongoose connection closed through app termination');
      process.exit(0);
    });
  }
  
  async connect() {
    try {
      await mongoose.connect(this.connectionString, this.options);
      console.log('Successfully connected to MongoDB via Mongoose');
      return mongoose.connection;
    } catch (error) {
      console.error('Mongoose connection failed:', error);
      throw error;
    }
  }
  
  async disconnect() {
    await mongoose.connection.close();
  }
  
  getConnectionState() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    return {
      state: states[mongoose.connection.readyState],
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    };
  }
}

// Usage
const mongooseConn = new MongooseConnection(process.env.MONGODB_URI);
await mongooseConn.connect();
```

### Spring Boot with MongoDB

```java
// application.yml configuration
/*
spring:
  data:
    mongodb:
      uri: ${MONGODB_URI:mongodb://localhost:27017/myapp}
      auto-index-creation: true
      
# Or separate properties
spring:
  data:
    mongodb:
      host: ${MONGO_HOST:localhost}
      port: ${MONGO_PORT:27017}
      database: ${MONGO_DATABASE:myapp}
      username: ${MONGO_USER:}
      password: ${MONGO_PASSWORD:}
      authentication-database: ${MONGO_AUTH_DB:admin}
*/

@Configuration
public class MongoConfig {
    
    @Value("${spring.data.mongodb.uri}")
    private String connectionString;
    
    @Bean
    public MongoClient mongoClient() {
        ConnectionString connString = new ConnectionString(connectionString);
        
        MongoClientSettings settings = MongoClientSettings.builder()
            .applyConnectionString(connString)
            .readPreference(ReadPreference.secondaryPreferred())
            .writeConcern(WriteConcern.MAJORITY)
            .retryWrites(true)
            .build();
        
        return MongoClients.create(settings);
    }
    
    @Bean
    public MongoTemplate mongoTemplate() {
        return new MongoTemplate(mongoClient(), getDatabaseName());
    }
    
    private String getDatabaseName() {
        ConnectionString connString = new ConnectionString(connectionString);
        return connString.getDatabase() != null ? connString.getDatabase() : "defaultdb";
    }
}
```

### Python with Motor (Async)

```python
import motor.motor_asyncio
import asyncio
from urllib.parse import quote_plus
import os

class AsyncMongoConnection:
    def __init__(self, connection_string, **options):
        self.connection_string = connection_string
        self.options = {
            'maxPoolSize': 50,
            'minPoolSize': 5,
            'maxIdleTimeMS': 30000,
            'serverSelectionTimeoutMS': 5000,
            'connectTimeoutMS': 10000,
            'socketTimeoutMS': 45000,
            **options
        }
        self.client = None
        self.db = None
    
    async def connect(self):
        """Connect to MongoDB asynchronously"""
        try:
            self.client = motor.motor_asyncio.AsyncIOMotorClient(
                self.connection_string, 
                **self.options
            )
            
            # Test the connection
            await self.client.admin.command('ping')
            print("Successfully connected to MongoDB (async)")
            
            # Get database name from connection string
            db_name = self._extract_database_name()
            if db_name:
                self.db = self.client[db_name]
            
            return self.db
            
        except Exception as e:
            print(f"MongoDB async connection failed: {e}")
            raise
    
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            print("Disconnected from MongoDB (async)")
    
    def _extract_database_name(self):
        """Extract database name from connection string"""
        try:
            from urllib.parse import urlparse
            parsed = urlparse(self.connection_string)
            return parsed.path.lstrip('/').split('?')[0] or None
        except:
            return None
    
    async def health_check(self):
        """Perform async health check"""
        try:
            if not self.client:
                return {'status': 'disconnected'}
            
            # Ping database
            result = await self.client.admin.command('ping')
            
            # Get server info
            server_info = await self.client.admin.command('buildInfo')
            
            return {
                'status': 'connected',
                'ping': result.get('ok') == 1,
                'server_version': server_info.get('version'),
                'uptime': server_info.get('uptime')
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e)
            }

# Usage example
async def main():
    # Build connection string from environment
    username = quote_plus(os.getenv('MONGO_USER', ''))
    password = quote_plus(os.getenv('MONGO_PASSWORD', ''))
    host = os.getenv('MONGO_HOST', 'localhost')
    port = os.getenv('MONGO_PORT', '27017')
    database = os.getenv('MONGO_DATABASE', 'myapp')
    
    if username and password:
        connection_string = f"mongodb://{username}:{password}@{host}:{port}/{database}?authSource=admin"
    else:
        connection_string = f"mongodb://{host}:{port}/{database}"
    
    conn = AsyncMongoConnection(connection_string)
    
    try:
        db = await conn.connect()
        
        # Perform database operations
        if db:
            collection = db['users']
            user_count = await collection.count_documents({})
            print(f"Total users: {user_count}")
            
            # Health check
            health = await conn.health_check()
            print(f"Database health: {health}")
        
    except Exception as e:
        print(f"Database operation failed: {e}")
    finally:
        await conn.disconnect()

# Run async example
if __name__ == "__main__":
    asyncio.run(main())
```

## Common Pitfalls and Solutions

### Password Special Characters

One of the most common issues is passwords with special characters:

```javascript
// ❌ Problem: Special characters not encoded
const problematicPassword = "myp@ssw0rd!";
const badConnection = `mongodb://user:${problematicPassword}@host:27017/db`;
// This will fail because @ and ! have special meaning in URLs

// ✅ Solution: Proper URL encoding
const encodedPassword = encodeURIComponent(problematicPassword);
const goodConnection = `mongodb://user:${encodedPassword}@host:27017/db`;

// ✅ Better: Utility function for safe encoding
function buildConnectionString(config) {
  const {
    protocol = 'mongodb',
    username,
    password,
    hosts,
    database,
    options = {}
  } = config;
  
  let connectionString = `${protocol}://`;
  
  // Add authentication if provided
  if (username && password) {
    connectionString += `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`;
  }
  
  // Add hosts
  connectionString += Array.isArray(hosts) ? hosts.join(',') : hosts;
  
  // Add database
  if (database) {
    connectionString += `/${database}`;
  }
  
  // Add options
  const optionString = Object.entries(options)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  
  if (optionString) {
    connectionString += `?${optionString}`;
  }
  
  return connectionString;
}

// Usage
const safeConnection = buildConnectionString({
  username: 'myuser',
  password: 'complex!p@ssw0rd#123',
  hosts: ['host1:27017', 'host2:27017'],
  database: 'myapp',
  options: {
    replicaSet: 'rs0',
    authSource: 'admin',
    ssl: 'true'
  }
});
```

### Atlas Connection Issues

```javascript
// Common Atlas connection problems and solutions

// ❌ Problem: Using mongodb:// instead of mongodb+srv://
const wrongAtlas = "mongodb://user:pass@cluster0.mongodb.net/myapp";

// ✅ Solution: Use mongodb+srv:// for Atlas
const correctAtlas = "mongodb+srv://user:pass@cluster0.mongodb.net/myapp";

// ❌ Problem: Missing retryWrites for Atlas
const atlasWithoutRetry = "mongodb+srv://user:pass@cluster0.mongodb.net/myapp";

// ✅ Solution: Include retryWrites and write concern
const atlasWithRetry = "mongodb+srv://user:pass@cluster0.mongodb.net/myapp?retryWrites=true&w=majority";

// Atlas connection with comprehensive error handling
async function connectToAtlas(connectionString) {
  const { MongoClient } = require('mongodb');
  
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    maxPoolSize: 50,
    retryWrites: true
  };
  
  try {
    const client = new MongoClient(connectionString, options);
    await client.connect();
    
    // Verify connection
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to Atlas");
    
    return client;
    
  } catch (error) {
    console.error("Atlas connection failed:");
    
    if (error.message.includes('authentication failed')) {
      console.error("- Check username and password");
      console.error("- Verify user has correct permissions");
      console.error("- Check authentication database");
    } else if (error.message.includes('ENOTFOUND')) {
      console.error("- Check cluster hostname");
      console.error("- Verify network connectivity");
      console.error("- Check DNS resolution");
    } else if (error.message.includes('connection attempt failed')) {
      console.error("- Check IP whitelist in Atlas");
      console.error("- Verify network access");
      console.error("- Check firewall settings");
    }
    
    throw error;
  }
}
```

## Environment-Specific Configurations

### Docker and Container Deployments

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    environment:
      - MONGODB_URI=mongodb://root:example@mongo:27017/myapp?authSource=admin
    depends_on:
      - mongo
  
  mongo:
    image: mongo:6.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: example
      MONGO_INITDB_DATABASE: myapp
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

```javascript
// Container-aware connection handling
class ContainerMongoConnection {
  constructor() {
    this.connectionString = this.buildConnectionString();
  }
  
  buildConnectionString() {
    // Check if running in container
    const isContainer = process.env.NODE_ENV === 'production' || process.env.DOCKER_ENV;
    
    if (isContainer) {
      // Use service name from docker-compose
      return `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@mongo:27017/${process.env.MONGO_DATABASE}?authSource=admin`;
    } else {
      // Local development
      return `mongodb://localhost:27017/${process.env.MONGO_DATABASE || 'myapp_dev'}`;
    }
  }
  
  async connect() {
    const { MongoClient } = require('mongodb');
    
    const options = {
      maxPoolSize: isContainer ? 100 : 10,
      serverSelectionTimeoutMS: 5000,
      retryWrites: true
    };
    
    try {
      this.client = new MongoClient(this.connectionString, options);
      await this.client.connect();
      
      console.log(`Connected to MongoDB (${isContainer ? 'container' : 'local'})`);
      return this.client;
      
    } catch (error) {
      console.error('Container MongoDB connection failed:', error);
      throw error;
    }
  }
}
```

### Kubernetes Deployments

```yaml
# kubernetes-mongo-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: mongo-secret
type: Opaque
data:
  username: <base64-encoded-username>
  password: <base64-encoded-password>
  connection-string: <base64-encoded-full-connection-string>

---
# kubernetes-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:latest
        env:
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: mongo-secret
              key: connection-string
        - name: MONGO_USER
          valueFrom:
            secretKeyRef:
              name: mongo-secret
              key: username
        - name: MONGO_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mongo-secret
              key: password
```

## Monitoring and Troubleshooting

### Connection Health Monitoring

```javascript
class MongoHealthMonitor {
  constructor(client) {
    this.client = client;
    this.metrics = {
      connectionCount: 0,
      failedConnections: 0,
      avgResponseTime: 0,
      lastHealthCheck: null
    };
  }
  
  async performHealthCheck() {
    const startTime = Date.now();
    
    try {
      // Ping database
      const result = await this.client.db("admin").command({ ping: 1 });
      
      // Get server status
      const serverStatus = await this.client.db("admin").command({ serverStatus: 1 });
      
      // Calculate response time
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, true);
      
      return {
        status: 'healthy',
        responseTime,
        serverInfo: {
          version: serverStatus.version,
          uptime: serverStatus.uptime,
          connections: serverStatus.connections,
          memory: serverStatus.mem
        },
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      this.updateMetrics(Date.now() - startTime, false);
      
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  updateMetrics(responseTime, success) {
    if (success) {
      this.metrics.connectionCount++;
      this.metrics.avgResponseTime = (
        (this.metrics.avgResponseTime * (this.metrics.connectionCount - 1)) + responseTime
      ) / this.metrics.connectionCount;
    } else {
      this.metrics.failedConnections++;
    }
    
    this.metrics.lastHealthCheck = new Date().toISOString();
  }
  
  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.connectionCount / (this.metrics.connectionCount + this.metrics.failedConnections) * 100
    };
  }
  
  async startPeriodicHealthCheck(intervalMs = 30000) {
    setInterval(async () => {
      const health = await this.performHealthCheck();
      console.log(`MongoDB Health: ${health.status} (${health.responseTime}ms)`);
      
      if (health.status === 'unhealthy') {
        console.error(`MongoDB health check failed: ${health.error}`);
        // Implement alerting logic here
      }
    }, intervalMs);
  }
}
```

### Connection String Testing

```javascript
// Comprehensive connection string testing
class ConnectionStringTester {
  static async testConnection(connectionString, testOptions = {}) {
    const { MongoClient } = require('mongodb');
    
    const testResults = {
      connectionString: connectionString.replace(/\/\/.*:.*@/, '//***:***@'), // Hide credentials
      tests: [],
      overall: 'unknown'
    };
    
    const options = {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      ...testOptions
    };
    
    let client;
    
    try {
      // Test 1: Basic connection
      testResults.tests.push(await this.testBasicConnection(connectionString, options));
      
      // Test 2: Authentication
      client = new MongoClient(connectionString, options);
      await client.connect();
      testResults.tests.push(await this.testAuthentication(client));
      
      // Test 3: Database access
      testResults.tests.push(await this.testDatabaseAccess(client, connectionString));
      
      // Test 4: Read/Write operations
      testResults.tests.push(await this.testReadWrite(client, connectionString));
      
      // Test 5: Connection pool
      testResults.tests.push(await this.testConnectionPool(client));
      
      // Determine overall result
      const failedTests = testResults.tests.filter(test => !test.passed);
      testResults.overall = failedTests.length === 0 ? 'passed' : 'failed';
      
    } catch (error) {
      testResults.tests.push({
        name: 'Connection Test',
        passed: false,
        error: error.message,
        duration: 0
      });
      testResults.overall = 'failed';
    } finally {
      if (client) {
        await client.close();
      }
    }
    
    return testResults;
  }
  
  static async testBasicConnection(connectionString, options) {
    const startTime = Date.now();
    
    try {
      const client = new MongoClient(connectionString, options);
      await client.connect();
      await client.close();
      
      return {
        name: 'Basic Connection',
        passed: true,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: 'Basic Connection',
        passed: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }
  
  static async testAuthentication(client) {
    const startTime = Date.now();
    
    try {
      await client.db("admin").command({ ping: 1 });
      
      return {
        name: 'Authentication',
        passed: true,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: 'Authentication',
        passed: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }
  
  static async testDatabaseAccess(client, connectionString) {
    const startTime = Date.now();
    
    try {
      // Extract database name
      const url = new URL(connectionString);
      const dbName = url.pathname.slice(1).split('?')[0] || 'test';
      
      const db = client.db(dbName);
      await db.command({ ping: 1 });
      
      return {
        name: 'Database Access',
        passed: true,
        database: dbName,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: 'Database Access',
        passed: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }
  
  static async testReadWrite(client, connectionString) {
    const startTime = Date.now();
    
    try {
      const url = new URL(connectionString);
      const dbName = url.pathname.slice(1).split('?')[0] || 'test';
      
      const db = client.db(dbName);
      const collection = db.collection('connection_test');
      
      // Test write
      const testDoc = { _id: 'test', timestamp: new Date(), test: true };
      await collection.insertOne(testDoc);
      
      // Test read
      const foundDoc = await collection.findOne({ _id: 'test' });
      
      // Cleanup
      await collection.deleteOne({ _id: 'test' });
      
      return {
        name: 'Read/Write Operations',
        passed: foundDoc && foundDoc.test === true,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: 'Read/Write Operations',
        passed: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }
  
  static async testConnectionPool(client) {
    const startTime = Date.now();
    
    try {
      // Simulate multiple concurrent operations
      const promises = Array.from({ length: 10 }, async (_, i) => {
        return client.db("admin").command({ ping: 1 });
      });
      
      await Promise.all(promises);
      
      return {
        name: 'Connection Pool',
        passed: true,
        concurrentOperations: 10,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: 'Connection Pool',
        passed: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }
}

// Usage
async function runConnectionTests() {
  const testConnections = [
    "mongodb://localhost:27017/test",
    "mongodb+srv://user:pass@cluster0.mongodb.net/myapp?retryWrites=true&w=majority",
    process.env.MONGODB_URI
  ].filter(Boolean);
  
  for (const connectionString of testConnections) {
    console.log('\n' + '='.repeat(50));
    console.log(`Testing: ${connectionString.replace(/\/\/.*:.*@/, '//***:***@')}`);
    console.log('='.repeat(50));
    
    const results = await ConnectionStringTester.testConnection(connectionString);
    
    console.log(`Overall Result: ${results.overall.toUpperCase()}`);
    console.log('\nTest Details:');
    
    results.tests.forEach(test => {
      const status = test.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`  ${status} ${test.name} (${test.duration}ms)`);
      if (!test.passed && test.error) {
        console.log(`    Error: ${test.error}`);
      }
    });
  }
}
```

## Production Deployment Checklist

### Pre-Deployment Validation

```javascript
// Production readiness checklist
class ProductionReadinessChecker {
  static checkConnectionString(connectionString) {
    const checks = [];
    
    // Security checks
    checks.push(this.checkSSL(connectionString));
    checks.push(this.checkAuthentication(connectionString));
    checks.push(this.checkCredentialSecurity(connectionString));
    
    // Performance checks
    checks.push(this.checkConnectionPool(connectionString));
    checks.push(this.checkTimeouts(connectionString));
    checks.push(this.checkWriteConcern(connectionString));
    
    // Reliability checks
    checks.push(this.checkReplicaSet(connectionString));
    checks.push(this.checkRetryWrites(connectionString));
    
    return {
      passed: checks.every(check => check.passed),
      checks: checks,
      score: (checks.filter(check => check.passed).length / checks.length) * 100
    };
  }
  
  static checkSSL(connectionString) {
    const hasSSL = connectionString.includes('ssl=true') || 
                   connectionString.includes('tls=true') ||
                   connectionString.startsWith('mongodb+srv://');
    
    return {
      name: 'SSL/TLS Enabled',
      passed: hasSSL,
      message: hasSSL ? 'SSL/TLS is enabled' : 'SSL/TLS should be enabled for production',
      severity: hasSSL ? 'info' : 'critical'
    };
  }
  
  static checkAuthentication(connectionString) {
    const hasAuth = connectionString.includes('@');
    
    return {
      name: 'Authentication',
      passed: hasAuth,
      message: hasAuth ? 'Authentication is configured' : 'Authentication is required for production',
      severity: hasAuth ? 'info' : 'critical'
    };
  }
  
  static checkCredentialSecurity(connectionString) {
    // This is a simplified check - in reality, you'd verify against environment variables
    const hasHardcodedCreds = /mongodb:\/\/[^@]*:[^@]*@/.test(connectionString) && 
                              !connectionString.includes('${') && 
                              !connectionString.includes('process.env');
    
    return {
      name: 'Credential Security',
      passed: !hasHardcodedCreds,
      message: hasHardcodedCreds ? 'Credentials appear to be hardcoded' : 'Credentials properly externalized',
      severity: hasHardcodedCreds ? 'critical' : 'info'
    };
  }
  
  static checkConnectionPool(connectionString) {
    const url = new URL(connectionString);
    const params = new URLSearchParams(url.search);
    const maxPoolSize = parseInt(params.get('maxPoolSize')) || 100;
    
    const isOptimal = maxPoolSize >= 50 && maxPoolSize <= 200;
    
    return {
      name: 'Connection Pool Size',
      passed: isOptimal,
      message: `Pool size: ${maxPoolSize} (recommended: 50-200)`,
      severity: isOptimal ? 'info' : 'warning'
    };
  }
  
  static checkWriteConcern(connectionString) {
    const hasMajorityWrite = connectionString.includes('w=majority');
    
    return {
      name: 'Write Concern',
      passed: hasMajorityWrite,
      message: hasMajorityWrite ? 'Using majority write concern' : 'Consider using w=majority for production',
      severity: hasMajorityWrite ? 'info' : 'warning'
    };
  }
  
  static checkReplicaSet(connectionString) {
    const hasReplicaSet = connectionString.includes('replicaSet=') || 
                          connectionString.includes(',') || 
                          connectionString.startsWith('mongodb+srv://');
    
    return {
      name: 'High Availability',
      passed: hasReplicaSet,
      message: hasReplicaSet ? 'Replica set or cluster configured' : 'Consider using replica sets for production',
      severity: hasReplicaSet ? 'info' : 'warning'
    };
  }
  
  static checkRetryWrites(connectionString) {
    const hasRetryWrites = connectionString.includes('retryWrites=true');
    
    return {
      name: 'Retry Writes',
      passed: hasRetryWrites,
      message: hasRetryWrites ? 'Retry writes enabled' : 'Enable retryWrites for better reliability',
      severity: hasRetryWrites ? 'info' : 'warning'
    };
  }
  
  static checkTimeouts(connectionString) {
    const url = new URL(connectionString);
    const params = new URLSearchParams(url.search);
    
    const hasTimeouts = params.has('serverSelectionTimeoutMS') || 
                        params.has('connectTimeoutMS') || 
                        params.has('socketTimeoutMS');
    
    return {
      name: 'Timeout Configuration',
      passed: hasTimeouts,
      message: hasTimeouts ? 'Timeouts configured' : 'Consider configuring timeouts for production',
      severity: hasTimeouts ? 'info' : 'warning'
    };
  }
}

// Usage
const prodConnectionString = process.env.MONGODB_URI;
const readinessCheck = ProductionReadinessChecker.checkConnectionString(prodConnectionString);

console.log(`Production Readiness Score: ${readinessCheck.score.toFixed(1)}%`);
console.log(`Overall Status: ${readinessCheck.passed ? 'READY' : 'NEEDS ATTENTION'}`);

readinessCheck.checks.forEach(check => {
  const icon = check.passed ? '✅' : (check.severity === 'critical' ? '🚨' : '⚠️');
  console.log(`${icon} ${check.name}: ${check.message}`);
});
```

## Conclusion

MongoDB connection strings are more than just database URLs—they're the foundation of your application's database connectivity, performance, and security. Understanding their structure, options, and best practices is essential for building robust applications.

Key takeaways:

1. **Security First**: Never hardcode credentials, always use SSL in production
2. **Environment Awareness**: Different configurations for dev, test, and production
3. **Performance Optimization**: Proper connection pooling and timeout settings
4. **High Availability**: Use replica sets and proper read/write concerns
5. **Monitoring**: Implement health checks and connection monitoring
6. **Testing**: Validate connection strings before deployment

Whether you're building a simple web application or a complex microservices architecture, mastering MongoDB connection strings will save you countless hours of debugging and ensure your applications are secure, performant, and reliable.

Remember: a well-configured connection string is the first step toward a successful MongoDB deployment. Take the time to understand and properly configure your connections—your future self (and your users) will thank you.