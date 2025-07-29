---
sidebar_position: 2
---

# MCP Architecture and Components

Understanding the architecture of Model Context Protocol is crucial for building effective integrations. This section explores the detailed architecture, communication patterns, and core components that make MCP a powerful standard for AI-tool integration.

## System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AI Application                           │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │   AI Assistant  │    │   MCP Client    │                    │
│  │   (Claude, etc.)│◄──►│   (Protocol)    │                    │
│  └─────────────────┘    └─────────────────┘                    │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ MCP Protocol
                                  │ (JSON-RPC 2.0)
┌─────────────────────────────────┴───────────────────────────────┐
│                        MCP Servers                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  File System    │  │    Database     │  │   API Gateway   │ │
│  │     Server      │  │     Server      │  │     Server      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Git Tools     │  │   Web Scraper   │  │   Custom Tools  │ │
│  │     Server      │  │     Server      │  │     Server      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```python
# Example of component interaction
class MCPInteractionFlow:
    def __init__(self):
        self.client = MCPClient()
        self.servers = {}
        
    async def initialize_system(self):
        """Initialize MCP system with multiple servers"""
        
        # 1. Start MCP servers
        servers_config = [
            {"name": "filesystem", "command": "python", "args": ["fs_server.py"]},
            {"name": "database", "command": "python", "args": ["db_server.py"]},
            {"name": "git", "command": "python", "args": ["git_server.py"]}
        ]
        
        for config in servers_config:
            server_session = await self.client.connect_to_server(
                config["name"],
                StdioServerParameters(
                    command=config["command"],
                    args=config["args"]
                )
            )
            self.servers[config["name"]] = server_session
        
        # 2. Discover available tools
        all_tools = {}
        for server_name, session in self.servers.items():
            tools = await session.list_tools()
            all_tools[server_name] = tools.tools
            
        return all_tools
    
    async def execute_ai_request(self, user_request: str):
        """Process AI request using available MCP tools"""
        
        # 1. AI determines which tools to use
        tool_plan = await self.analyze_request(user_request)
        
        # 2. Execute tools in sequence
        results = []
        for step in tool_plan:
            server_name = step["server"]
            tool_name = step["tool"]
            arguments = step["arguments"]
            
            if server_name in self.servers:
                result = await self.servers[server_name].call_tool(
                    tool_name, arguments
                )
                results.append(result)
        
        # 3. Combine results and generate response
        return await self.synthesize_response(results, user_request)
```

## Core Components Deep Dive

### MCP Client Architecture

```python
class AdvancedMCPClient:
    def __init__(self):
        self.sessions = {}
        self.tool_registry = {}
        self.resource_cache = {}
        self.permission_manager = PermissionManager()
        
    async def connect_server(self, server_config):
        """Connect to MCP server with advanced configuration"""
        
        session = ClientSession(server_config.transport)
        
        # Initialize connection
        await session.initialize()
        
        # Negotiate capabilities
        capabilities = await self.negotiate_capabilities(session)
        
        # Register tools and resources
        await self.register_server_capabilities(session, capabilities)
        
        # Store session
        self.sessions[server_config.name] = {
            "session": session,
            "capabilities": capabilities,
            "last_used": time.time(),
            "health_status": "healthy"
        }
        
        return session
    
    async def negotiate_capabilities(self, session):
        """Negotiate capabilities with server"""
        
        # Get server capabilities
        server_info = await session.get_server_info()
        
        # List available tools
        tools_response = await session.list_tools()
        
        # List available resources
        resources_response = await session.list_resources()
        
        return {
            "server_info": server_info,
            "tools": tools_response.tools,
            "resources": resources_response.resources,
            "protocol_version": server_info.protocol_version
        }
    
    async def call_tool_with_retry(self, server_name, tool_name, arguments, max_retries=3):
        """Call tool with retry logic and error handling"""
        
        for attempt in range(max_retries):
            try:
                # Check permissions
                if not await self.permission_manager.check_permission(
                    server_name, tool_name, arguments
                ):
                    raise PermissionError(f"Permission denied for {tool_name}")
                
                # Get session
                session_info = self.sessions.get(server_name)
                if not session_info:
                    raise ConnectionError(f"Not connected to {server_name}")
                
                session = session_info["session"]
                
                # Call tool
                result = await session.call_tool(tool_name, arguments)
                
                # Update last used time
                session_info["last_used"] = time.time()
                
                return result
                
            except Exception as e:
                if attempt == max_retries - 1:
                    raise e
                
                # Wait before retry
                await asyncio.sleep(2 ** attempt)
                
                # Try to reconnect if connection error
                if isinstance(e, ConnectionError):
                    await self.reconnect_server(server_name)
    
    async def health_check(self):
        """Perform health check on all connected servers"""
        
        health_status = {}
        
        for server_name, session_info in self.sessions.items():
            try:
                session = session_info["session"]
                
                # Send ping
                await session.ping()
                
                health_status[server_name] = {
                    "status": "healthy",
                    "last_used": session_info["last_used"],
                    "uptime": time.time() - session_info.get("connected_at", 0)
                }
                
            except Exception as e:
                health_status[server_name] = {
                    "status": "unhealthy",
                    "error": str(e),
                    "last_error": time.time()
                }
        
        return health_status
```

### MCP Server Architecture

```python
class AdvancedMCPServer:
    def __init__(self, name: str):
        self.server = Server(name)
        self.tools = {}
        self.resources = {}
        self.middleware = []
        self.metrics = ServerMetrics()
        self.setup_core_functionality()
    
    def setup_core_functionality(self):
        """Setup core server functionality"""
        
        # Add middleware for logging
        self.add_middleware(LoggingMiddleware())
        
        # Add middleware for rate limiting
        self.add_middleware(RateLimitingMiddleware())
        
        # Add middleware for authentication
        self.add_middleware(AuthenticationMiddleware())
        
        # Setup error handling
        self.server.set_error_handler(self.handle_error)
    
    def add_middleware(self, middleware):
        """Add middleware to the server"""
        self.middleware.append(middleware)
    
    def tool(self, name: str, description: str = None, schema: dict = None):
        """Decorator for registering tools with advanced features"""
        
        def decorator(func):
            # Wrap function with middleware
            wrapped_func = func
            for middleware in reversed(self.middleware):
                wrapped_func = middleware.wrap_tool(wrapped_func)
            
            # Register tool with server
            self.server.tool(name, description, schema)(wrapped_func)
            
            # Store tool metadata
            self.tools[name] = {
                "function": func,
                "description": description,
                "schema": schema,
                "call_count": 0,
                "last_called": None,
                "average_duration": 0
            }
            
            return func
        
        return decorator
    
    def resource(self, uri_pattern: str, description: str = None):
        """Decorator for registering resources"""
        
        def decorator(func):
            # Wrap function with middleware
            wrapped_func = func
            for middleware in reversed(self.middleware):
                wrapped_func = middleware.wrap_resource(wrapped_func)
            
            # Register resource with server
            self.server.resource(uri_pattern, description)(wrapped_func)
            
            # Store resource metadata
            self.resources[uri_pattern] = {
                "function": func,
                "description": description,
                "access_count": 0,
                "last_accessed": None
            }
            
            return func
        
        return decorator
    
    async def handle_error(self, error: Exception, context: dict):
        """Handle server errors"""
        
        self.metrics.record_error(error, context)
        
        # Log error
        logger.error(f"MCP Server Error: {error}", extra=context)
        
        # Return user-friendly error message
        if isinstance(error, PermissionError):
            return "Permission denied for this operation"
        elif isinstance(error, FileNotFoundError):
            return "Requested resource not found"
        elif isinstance(error, ValueError):
            return f"Invalid input: {str(error)}"
        else:
            return "An unexpected error occurred"

# Example advanced server implementation
class DatabaseMCPServer(AdvancedMCPServer):
    def __init__(self, db_config: dict):
        super().__init__("database-server")
        self.db_config = db_config
        self.connection_pool = None
        self.setup_database_tools()
    
    async def initialize(self):
        """Initialize database connection pool"""
        self.connection_pool = await create_connection_pool(self.db_config)
    
    def setup_database_tools(self):
        
        @self.tool(
            name="execute_query",
            description="Execute a SQL query with safety checks",
            schema={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "SQL query to execute"},
                    "params": {"type": "array", "description": "Query parameters"}
                },
                "required": ["query"]
            }
        )
        async def execute_query(query: str, params: list = None) -> str:
            """Execute SQL query with safety checks"""
            
            # Validate query
            if not self.is_safe_query(query):
                raise ValueError("Query contains potentially dangerous operations")
            
            async with self.connection_pool.acquire() as conn:
                try:
                    if params:
                        result = await conn.fetch(query, *params)
                    else:
                        result = await conn.fetch(query)
                    
                    return self.format_query_result(result)
                    
                except Exception as e:
                    raise Exception(f"Database error: {str(e)}")
        
        @self.tool(
            name="get_schema",
            description="Get database schema information"
        )
        async def get_schema(table_name: str = None) -> str:
            """Get database schema information"""
            
            async with self.connection_pool.acquire() as conn:
                if table_name:
                    # Get specific table schema
                    schema_query = """
                        SELECT column_name, data_type, is_nullable
                        FROM information_schema.columns
                        WHERE table_name = $1
                        ORDER BY ordinal_position
                    """
                    result = await conn.fetch(schema_query, table_name)
                else:
                    # Get all tables
                    tables_query = """
                        SELECT table_name
                        FROM information_schema.tables
                        WHERE table_schema = 'public'
                        ORDER BY table_name
                    """
                    result = await conn.fetch(tables_query)
                
                return self.format_schema_result(result, table_name)
    
    def is_safe_query(self, query: str) -> bool:
        """Check if query is safe to execute"""
        
        dangerous_keywords = [
            "DROP", "DELETE", "TRUNCATE", "ALTER", "CREATE", "INSERT", "UPDATE"
        ]
        
        query_upper = query.upper().strip()
        
        for keyword in dangerous_keywords:
            if keyword in query_upper:
                return False
        
        return True
    
    def format_query_result(self, result) -> str:
        """Format query result as readable text"""
        
        if not result:
            return "No results found"
        
        # Convert to list of dictionaries
        rows = [dict(row) for row in result]
        
        # Format as table
        if rows:
            headers = list(rows[0].keys())
            
            # Calculate column widths
            col_widths = {}
            for header in headers:
                col_widths[header] = max(
                    len(header),
                    max(len(str(row[header])) for row in rows)
                )
            
            # Build table
            table_lines = []
            
            # Header
            header_line = " | ".join(header.ljust(col_widths[header]) for header in headers)
            table_lines.append(header_line)
            
            # Separator
            separator = " | ".join("-" * col_widths[header] for header in headers)
            table_lines.append(separator)
            
            # Data rows
            for row in rows:
                row_line = " | ".join(str(row[header]).ljust(col_widths[header]) for header in headers)
                table_lines.append(row_line)
            
            return "\n".join(table_lines)
        
        return "No data"
```

## Communication Protocols

### Transport Layers

#### Standard I/O Transport
```python
# stdio_transport.py
class StdioTransport:
    def __init__(self):
        self.reader = None
        self.writer = None
    
    async def connect(self):
        """Connect using stdin/stdout"""
        self.reader = asyncio.StreamReader()
        self.writer = asyncio.StreamWriter(sys.stdout.buffer, None, None, None)
        
        # Setup stdin reading
        loop = asyncio.get_event_loop()
        await loop.connect_read_pipe(
            lambda: asyncio.StreamReaderProtocol(self.reader),
            sys.stdin
        )
    
    async def send_message(self, message: dict):
        """Send JSON-RPC message"""
        json_str = json.dumps(message)
        self.writer.write(f"{json_str}\n".encode())
        await self.writer.drain()
    
    async def receive_message(self) -> dict:
        """Receive JSON-RPC message"""
        line = await self.reader.readline()
        return json.loads(line.decode().strip())
```

#### HTTP Transport
```python
# http_transport.py
from aiohttp import web, ClientSession

class HTTPTransport:
    def __init__(self, host: str = "localhost", port: int = 8080):
        self.host = host
        self.port = port
        self.app = web.Application()
        self.setup_routes()
    
    def setup_routes(self):
        """Setup HTTP routes for MCP communication"""
        
        self.app.router.add_post("/mcp", self.handle_mcp_request)
        self.app.router.add_get("/health", self.health_check)
        self.app.router.add_get("/capabilities", self.get_capabilities)
    
    async def handle_mcp_request(self, request):
        """Handle incoming MCP request"""
        
        try:
            # Parse JSON-RPC request
            json_data = await request.json()
            
            # Process request
            response = await self.process_mcp_message(json_data)
            
            # Return JSON-RPC response
            return web.json_response(response)
            
        except Exception as e:
            # Return JSON-RPC error
            error_response = {
                "jsonrpc": "2.0",
                "error": {
                    "code": -32603,
                    "message": "Internal error",
                    "data": str(e)
                },
                "id": json_data.get("id")
            }
            return web.json_response(error_response, status=500)
    
    async def start_server(self):
        """Start HTTP server"""
        runner = web.AppRunner(self.app)
        await runner.setup()
        
        site = web.TCPSite(runner, self.host, self.port)
        await site.start()
        
        print(f"MCP HTTP server started on {self.host}:{self.port}")
```

#### WebSocket Transport
```python
# websocket_transport.py
import websockets
import json

class WebSocketTransport:
    def __init__(self, uri: str):
        self.uri = uri
        self.websocket = None
        self.message_handlers = {}
    
    async def connect(self):
        """Connect to WebSocket server"""
        self.websocket = await websockets.connect(self.uri)
        
        # Start message handling loop
        asyncio.create_task(self.message_loop())
    
    async def message_loop(self):
        """Handle incoming messages"""
        
        try:
            async for message in self.websocket:
                data = json.loads(message)
                await self.handle_message(data)
                
        except websockets.exceptions.ConnectionClosed:
            print("WebSocket connection closed")
        except Exception as e:
            print(f"WebSocket error: {e}")
    
    async def send_message(self, message: dict):
        """Send message over WebSocket"""
        if self.websocket:
            await self.websocket.send(json.dumps(message))
    
    async def handle_message(self, message: dict):
        """Handle incoming message"""
        
        method = message.get("method")
        if method in self.message_handlers:
            handler = self.message_handlers[method]
            response = await handler(message)
            
            if response:
                await self.send_message(response)
    
    def register_handler(self, method: str, handler):
        """Register message handler"""
        self.message_handlers[method] = handler
```

## Security Architecture

### Permission Management
```python
class PermissionManager:
    def __init__(self):
        self.permissions = {}
        self.audit_log = []
    
    async def request_permission(self, operation: str, resource: str, context: dict) -> bool:
        """Request permission for operation"""
        
        permission_key = f"{operation}:{resource}"
        
        # Check existing permissions
        if permission_key in self.permissions:
            granted = self.permissions[permission_key]
        else:
            # Request user consent
            granted = await self.prompt_user_consent(operation, resource, context)
            self.permissions[permission_key] = granted
        
        # Log permission request
        self.audit_log.append({
            "timestamp": time.time(),
            "operation": operation,
            "resource": resource,
            "granted": granted,
            "context": context
        })
        
        return granted
    
    async def prompt_user_consent(self, operation: str, resource: str, context: dict) -> bool:
        """Prompt user for consent"""
        
        # In a real implementation, this would show a UI dialog
        message = f"Allow {operation} on {resource}?"
        
        if context.get("sensitive", False):
            message += " (This operation accesses sensitive data)"
        
        # Placeholder for user interaction
        return await self.get_user_response(message)
    
    def revoke_permission(self, operation: str, resource: str):
        """Revoke previously granted permission"""
        
        permission_key = f"{operation}:{resource}"
        if permission_key in self.permissions:
            del self.permissions[permission_key]
    
    def get_audit_log(self, since: float = None) -> list:
        """Get audit log entries"""
        
        if since:
            return [entry for entry in self.audit_log if entry["timestamp"] >= since]
        
        return self.audit_log.copy()
```

### Secure Communication
```python
class SecureMCPTransport:
    def __init__(self, cert_file: str, key_file: str):
        self.cert_file = cert_file
        self.key_file = key_file
        self.ssl_context = self.create_ssl_context()
    
    def create_ssl_context(self):
        """Create SSL context for secure communication"""
        
        import ssl
        
        context = ssl.create_default_context(ssl.Purpose.SERVER_AUTH)
        context.load_cert_chain(self.cert_file, self.key_file)
        context.check_hostname = False
        context.verify_mode = ssl.CERT_REQUIRED
        
        return context
    
    async def secure_send(self, message: dict, encryption_key: bytes):
        """Send encrypted message"""
        
        # Serialize message
        json_str = json.dumps(message)
        
        # Encrypt message
        encrypted_data = self.encrypt_message(json_str.encode(), encryption_key)
        
        # Send over secure transport
        await self.send_encrypted_data(encrypted_data)
    
    def encrypt_message(self, data: bytes, key: bytes) -> bytes:
        """Encrypt message data"""
        
        from cryptography.fernet import Fernet
        
        cipher = Fernet(key)
        return cipher.encrypt(data)
    
    def decrypt_message(self, encrypted_data: bytes, key: bytes) -> dict:
        """Decrypt message data"""
        
        from cryptography.fernet import Fernet
        
        cipher = Fernet(key)
        decrypted_data = cipher.decrypt(encrypted_data)
        
        return json.loads(decrypted_data.decode())
```

## Performance and Monitoring

### Metrics Collection
```python
class ServerMetrics:
    def __init__(self):
        self.tool_calls = {}
        self.resource_accesses = {}
        self.errors = []
        self.performance_data = {}
    
    def record_tool_call(self, tool_name: str, duration: float, success: bool):
        """Record tool call metrics"""
        
        if tool_name not in self.tool_calls:
            self.tool_calls[tool_name] = {
                "total_calls": 0,
                "successful_calls": 0,
                "total_duration": 0,
                "average_duration": 0,
                "last_called": None
            }
        
        metrics = self.tool_calls[tool_name]
        metrics["total_calls"] += 1
        metrics["total_duration"] += duration
        metrics["average_duration"] = metrics["total_duration"] / metrics["total_calls"]
        metrics["last_called"] = time.time()
        
        if success:
            metrics["successful_calls"] += 1
    
    def record_error(self, error: Exception, context: dict):
        """Record error information"""
        
        self.errors.append({
            "timestamp": time.time(),
            "error_type": type(error).__name__,
            "error_message": str(error),
            "context": context
        })
    
    def get_performance_summary(self) -> dict:
        """Get performance summary"""
        
        return {
            "tool_performance": self.tool_calls,
            "resource_performance": self.resource_accesses,
            "error_rate": len(self.errors) / max(1, sum(
                metrics["total_calls"] for metrics in self.tool_calls.values()
            )),
            "uptime": time.time() - self.start_time if hasattr(self, 'start_time') else 0
        }
```

Understanding MCP architecture is essential for building robust, secure, and performant integrations between AI applications and external tools and data sources.