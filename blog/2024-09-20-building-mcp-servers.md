---
slug: building-mcp-servers
title: Building Production-Ready MCP Servers - A Complete Guide
authors: [saikiran]
tags: [mcp, servers, development, production, tools]
---

Building MCP (Model Context Protocol) servers is the key to extending AI applications with custom tools and integrations. Whether you're creating a simple file system interface or a complex business intelligence platform, understanding how to build robust, secure, and scalable MCP servers is essential for modern AI development.

<!-- truncate -->

## Understanding MCP Server Architecture

MCP servers act as bridges between AI applications and external systems. They expose tools and resources through a standardized protocol, enabling AI models to interact with databases, APIs, file systems, and any other external service you can imagine.

### Core Server Components

Every MCP server consists of several key components:

```python
# Core MCP server structure
from mcp.server import Server
from mcp.types import Tool, Resource, TextContent

class BaseMCPServer:
    def __init__(self, name: str):
        self.server = Server(name)
        self.tools = {}
        self.resources = {}
        self.middleware = []
        self.setup_core_functionality()
    
    def setup_core_functionality(self):
        """Setup essential server functionality"""
        
        # Health check tool (always include this)
        @self.server.tool("health_check")
        async def health_check() -> str:
            """Check server health and status"""
            return f"Server {self.server.name} is healthy"
        
        # Server info tool
        @self.server.tool("server_info")
        async def server_info() -> str:
            """Get server information"""
            info = {
                "name": self.server.name,
                "tools_count": len(self.tools),
                "resources_count": len(self.resources),
                "version": "1.0.0"
            }
            return json.dumps(info, indent=2)
    
    async def run(self):
        """Start the server"""
        await self.server.run()
```

## Building Specialized MCP Servers

### Database Integration Server

One of the most common use cases is providing AI access to databases. Here's a production-ready database MCP server:

```python
# database_mcp_server.py
import asyncio
import asyncpg
import json
from typing import List, Dict, Any, Optional
from mcp.server import Server

class DatabaseMCPServer:
    def __init__(self, db_config: Dict[str, str]):
        self.server = Server("database-server")
        self.db_config = db_config
        self.connection_pool = None
        self.query_cache = {}
        self.setup_database_tools()
    
    async def initialize(self):
        """Initialize database connection pool"""
        try:
            self.connection_pool = await asyncpg.create_pool(
                host=self.db_config["host"],
                port=self.db_config["port"],
                user=self.db_config["user"],
                password=self.db_config["password"],
                database=self.db_config["database"],
                min_size=2,
                max_size=10,
                command_timeout=30
            )
            print("Database connection pool initialized")
        except Exception as e:
            print(f"Failed to initialize database: {e}")
            raise
    
    def setup_database_tools(self):
        
        @self.server.tool("execute_query")
        async def execute_query(query: str, params: List[Any] = None) -> str:
            """Execute a SELECT query safely"""
            
            # Validate query safety
            if not self.is_safe_query(query):
                return "Error: Query contains potentially dangerous operations"
            
            # Check cache first
            cache_key = f"{query}:{str(params)}"
            if cache_key in self.query_cache:
                return f"(Cached) {self.query_cache[cache_key]}"
            
            async with self.connection_pool.acquire() as conn:
                try:
                    if params:
                        rows = await conn.fetch(query, *params)
                    else:
                        rows = await conn.fetch(query)
                    
                    result = self.format_query_result(rows)
                    
                    # Cache result for 5 minutes
                    self.query_cache[cache_key] = result
                    asyncio.create_task(self.expire_cache_entry(cache_key, 300))
                    
                    return result
                    
                except Exception as e:
                    return f"Database error: {str(e)}"
        
        @self.server.tool("get_table_schema")
        async def get_table_schema(table_name: str) -> str:
            """Get detailed schema information for a table"""
            
            schema_query = """
                SELECT 
                    column_name,
                    data_type,
                    is_nullable,
                    column_default,
                    character_maximum_length
                FROM information_schema.columns
                WHERE table_name = $1
                ORDER BY ordinal_position
            """
            
            async with self.connection_pool.acquire() as conn:
                try:
                    rows = await conn.fetch(schema_query, table_name)
                    
                    if not rows:
                        return f"Table '{table_name}' not found"
                    
                    schema_info = []
                    schema_info.append(f"Schema for table '{table_name}':")
                    schema_info.append("-" * 50)
                    
                    for row in rows:
                        column_info = f"  {row['column_name']} ({row['data_type']}"
                        
                        if row['character_maximum_length']:
                            column_info += f"({row['character_maximum_length']})"
                        
                        column_info += ")"
                        
                        if row['is_nullable'] == 'NO':
                            column_info += " NOT NULL"
                        
                        if row['column_default']:
                            column_info += f" DEFAULT {row['column_default']}"
                        
                        schema_info.append(column_info)
                    
                    return "\n".join(schema_info)
                    
                except Exception as e:
                    return f"Error getting schema: {str(e)}"
        
        @self.server.tool("analyze_table")
        async def analyze_table(table_name: str) -> str:
            """Analyze table statistics and data distribution"""
            
            # Get row count
            count_query = f"SELECT COUNT(*) as row_count FROM {table_name}"
            
            # Get column statistics
            stats_query = f"""
                SELECT 
                    column_name,
                    data_type
                FROM information_schema.columns
                WHERE table_name = $1
            """
            
            async with self.connection_pool.acquire() as conn:
                try:
                    # Get row count
                    count_result = await conn.fetchrow(count_query)
                    row_count = count_result['row_count']
                    
                    # Get column info
                    columns = await conn.fetch(stats_query, table_name)
                    
                    analysis = []
                    analysis.append(f"Analysis for table '{table_name}':")
                    analysis.append(f"Total rows: {row_count:,}")
                    analysis.append(f"Total columns: {len(columns)}")
                    analysis.append("")
                    
                    # Analyze each column
                    for column in columns:
                        col_name = column['column_name']
                        col_type = column['data_type']
                        
                        if col_type in ['integer', 'bigint', 'numeric', 'real', 'double precision']:
                            # Numeric column analysis
                            numeric_query = f"""
                                SELECT 
                                    MIN({col_name}) as min_val,
                                    MAX({col_name}) as max_val,
                                    AVG({col_name}) as avg_val,
                                    COUNT(DISTINCT {col_name}) as distinct_count
                                FROM {table_name}
                                WHERE {col_name} IS NOT NULL
                            """
                            
                            stats = await conn.fetchrow(numeric_query)
                            analysis.append(f"  {col_name} ({col_type}):")
                            analysis.append(f"    Range: {stats['min_val']} - {stats['max_val']}")
                            analysis.append(f"    Average: {stats['avg_val']:.2f}")
                            analysis.append(f"    Distinct values: {stats['distinct_count']}")
                        
                        else:
                            # Text/other column analysis
                            text_query = f"""
                                SELECT 
                                    COUNT(DISTINCT {col_name}) as distinct_count,
                                    COUNT(*) - COUNT({col_name}) as null_count
                                FROM {table_name}
                            """
                            
                            stats = await conn.fetchrow(text_query)
                            analysis.append(f"  {col_name} ({col_type}):")
                            analysis.append(f"    Distinct values: {stats['distinct_count']}")
                            analysis.append(f"    Null values: {stats['null_count']}")
                        
                        analysis.append("")
                    
                    return "\n".join(analysis)
                    
                except Exception as e:
                    return f"Error analyzing table: {str(e)}"
        
        @self.server.tool("suggest_queries")
        async def suggest_queries(table_name: str, analysis_type: str = "overview") -> str:
            """Suggest useful queries for a table"""
            
            suggestions = {
                "overview": [
                    f"SELECT COUNT(*) FROM {table_name};",
                    f"SELECT * FROM {table_name} LIMIT 10;",
                    f"SELECT * FROM {table_name} ORDER BY id DESC LIMIT 5;"
                ],
                "analysis": [
                    f"SELECT column_name, COUNT(*) FROM {table_name} GROUP BY column_name;",
                    f"SELECT DATE_TRUNC('day', created_at), COUNT(*) FROM {table_name} GROUP BY 1 ORDER BY 1;",
                    f"SELECT * FROM {table_name} WHERE created_at >= NOW() - INTERVAL '7 days';"
                ],
                "quality": [
                    f"SELECT COUNT(*) as total, COUNT(DISTINCT id) as unique_ids FROM {table_name};",
                    f"SELECT * FROM {table_name} WHERE id IS NULL;",
                    f"SELECT column_name, COUNT(*) as null_count FROM {table_name} WHERE column_name IS NULL GROUP BY column_name;"
                ]
            }
            
            if analysis_type not in suggestions:
                return f"Unknown analysis type. Available types: {', '.join(suggestions.keys())}"
            
            query_list = suggestions[analysis_type]
            
            result = f"Suggested {analysis_type} queries for {table_name}:\n\n"
            for i, query in enumerate(query_list, 1):
                result += f"{i}. {query}\n"
            
            return result
    
    def is_safe_query(self, query: str) -> bool:
        """Validate that query is safe (read-only)"""
        
        dangerous_keywords = [
            'DROP', 'DELETE', 'INSERT', 'UPDATE', 'ALTER', 'CREATE',
            'TRUNCATE', 'REPLACE', 'MERGE', 'CALL', 'EXEC'
        ]
        
        query_upper = query.upper().strip()
        
        # Check for dangerous keywords
        for keyword in dangerous_keywords:
            if keyword in query_upper:
                return False
        
        # Must start with SELECT
        if not query_upper.startswith('SELECT'):
            return False
        
        return True
    
    def format_query_result(self, rows) -> str:
        """Format query results as a readable table"""
        
        if not rows:
            return "No results found"
        
        # Convert to list of dictionaries
        data = [dict(row) for row in rows]
        
        if not data:
            return "No data"
        
        # Get headers
        headers = list(data[0].keys())
        
        # Calculate column widths
        col_widths = {}
        for header in headers:
            col_widths[header] = max(
                len(header),
                max(len(str(row[header])) for row in data)
            )
        
        # Build table
        lines = []
        
        # Header
        header_line = " | ".join(header.ljust(col_widths[header]) for header in headers)
        lines.append(header_line)
        
        # Separator
        separator = " | ".join("-" * col_widths[header] for header in headers)
        lines.append(separator)
        
        # Data rows (limit to 50 rows for readability)
        display_rows = data[:50]
        for row in display_rows:
            row_line = " | ".join(str(row[header]).ljust(col_widths[header]) for header in headers)
            lines.append(row_line)
        
        if len(data) > 50:
            lines.append(f"... and {len(data) - 50} more rows")
        
        return "\n".join(lines)
    
    async def expire_cache_entry(self, cache_key: str, delay: int):
        """Remove cache entry after delay"""
        await asyncio.sleep(delay)
        self.query_cache.pop(cache_key, None)
    
    async def cleanup(self):
        """Cleanup resources"""
        if self.connection_pool:
            await self.connection_pool.close()
    
    async def run(self):
        """Run the server"""
        try:
            await self.initialize()
            await self.server.run()
        finally:
            await self.cleanup()

# Configuration and startup
if __name__ == "__main__":
    db_config = {
        "host": "localhost",
        "port": 5432,
        "user": "your_user",
        "password": "your_password",
        "database": "your_database"
    }
    
    server = DatabaseMCPServer(db_config)
    asyncio.run(server.run())
```

### API Integration Server

For connecting AI to external APIs and web services:

```python
# api_integration_server.py
import asyncio
import aiohttp
import json
import time
from typing import Dict, Any, Optional
from mcp.server import Server

class APIIntegrationServer:
    def __init__(self, api_configs: Dict[str, Dict]):
        self.server = Server("api-integration-server")
        self.api_configs = api_configs
        self.session = None
        self.rate_limiters = {}
        self.response_cache = {}
        self.setup_api_tools()
    
    async def initialize(self):
        """Initialize HTTP session and rate limiters"""
        
        # Create HTTP session with reasonable defaults
        timeout = aiohttp.ClientTimeout(total=30, connect=10)
        self.session = aiohttp.ClientSession(
            timeout=timeout,
            headers={"User-Agent": "MCP-API-Server/1.0"}
        )
        
        # Initialize rate limiters for each API
        for api_name, config in self.api_configs.items():
            if "rate_limit" in config:
                self.rate_limiters[api_name] = {
                    "requests": [],
                    "max_requests": config["rate_limit"]["requests"],
                    "window": config["rate_limit"]["window"]
                }
    
    def setup_api_tools(self):
        
        @self.server.tool("call_rest_api")
        async def call_rest_api(api_name: str, endpoint: str, method: str = "GET",
                               data: Dict = None, headers: Dict = None,
                               cache_duration: int = 0) -> str:
            """Make REST API call with caching and rate limiting"""
            
            if api_name not in self.api_configs:
                return f"Error: API '{api_name}' not configured"
            
            # Check rate limits
            if not await self.check_rate_limit(api_name):
                return "Error: Rate limit exceeded. Please try again later."
            
            # Check cache
            cache_key = f"{api_name}:{method}:{endpoint}:{str(data)}"
            if cache_duration > 0 and cache_key in self.response_cache:
                cached_response, timestamp = self.response_cache[cache_key]
                if time.time() - timestamp < cache_duration:
                    return f"(Cached) {cached_response}"
            
            config = self.api_configs[api_name]
            
            # Build URL
            base_url = config["base_url"].rstrip("/")
            full_url = f"{base_url}/{endpoint.lstrip('/')}"
            
            # Prepare headers
            request_headers = config.get("default_headers", {}).copy()
            if headers:
                request_headers.update(headers)
            
            # Add authentication
            if "auth" in config:
                auth_config = config["auth"]
                if auth_config["type"] == "bearer":
                    request_headers["Authorization"] = f"Bearer {auth_config['token']}"
                elif auth_config["type"] == "api_key":
                    request_headers[auth_config["header"]] = auth_config["key"]
            
            try:
                # Make request
                async with self.session.request(
                    method.upper(),
                    full_url,
                    json=data if data else None,
                    headers=request_headers
                ) as response:
                    
                    # Update rate limiter
                    await self.update_rate_limiter(api_name)
                    
                    # Handle response
                    content_type = response.headers.get('content-type', '')
                    
                    if response.status >= 400:
                        error_text = await response.text()
                        return f"API Error {response.status}: {error_text}"
                    
                    if 'application/json' in content_type:
                        result_data = await response.json()
                        formatted_result = json.dumps(result_data, indent=2)
                    else:
                        formatted_result = await response.text()
                    
                    # Cache successful responses
                    if cache_duration > 0 and response.status == 200:
                        self.response_cache[cache_key] = (formatted_result, time.time())
                        # Clean up cache entry after expiration
                        asyncio.create_task(self.cleanup_cache_entry(cache_key, cache_duration))
                    
                    return f"Success ({response.status}):\n{formatted_result}"
                    
            except asyncio.TimeoutError:
                return "Error: Request timed out"
            except Exception as e:
                return f"Request failed: {str(e)}"
        
        @self.server.tool("github_repository_info")
        async def github_repository_info(owner: str, repo: str) -> str:
            """Get GitHub repository information"""
            
            return await call_rest_api(
                "github",
                f"repos/{owner}/{repo}",
                cache_duration=300  # Cache for 5 minutes
            )
        
        @self.server.tool("github_list_issues")
        async def github_list_issues(owner: str, repo: str, state: str = "open") -> str:
            """List GitHub repository issues"""
            
            return await call_rest_api(
                "github",
                f"repos/{owner}/{repo}/issues?state={state}",
                cache_duration=60  # Cache for 1 minute
            )
        
        @self.server.tool("weather_forecast")
        async def weather_forecast(city: str, days: int = 5) -> str:
            """Get weather forecast for a city"""
            
            return await call_rest_api(
                "weather",
                f"forecast?q={city}&days={days}",
                cache_duration=1800  # Cache for 30 minutes
            )
        
        @self.server.tool("send_slack_notification")
        async def send_slack_notification(channel: str, message: str, 
                                        webhook_url: str) -> str:
            """Send notification to Slack channel"""
            
            payload = {
                "channel": channel,
                "text": message,
                "username": "MCP Bot",
                "icon_emoji": ":robot_face:"
            }
            
            try:
                async with self.session.post(webhook_url, json=payload) as response:
                    if response.status == 200:
                        return "Notification sent successfully"
                    else:
                        error_text = await response.text()
                        return f"Failed to send notification: {response.status} - {error_text}"
            except Exception as e:
                return f"Error sending notification: {str(e)}"
        
        @self.server.tool("search_web")
        async def search_web(query: str, num_results: int = 10) -> str:
            """Search the web using configured search API"""
            
            return await call_rest_api(
                "search",
                f"search?q={query}&num={num_results}",
                cache_duration=3600  # Cache for 1 hour
            )
    
    async def check_rate_limit(self, api_name: str) -> bool:
        """Check if API call is within rate limits"""
        
        if api_name not in self.rate_limiters:
            return True
        
        limiter = self.rate_limiters[api_name]
        current_time = time.time()
        
        # Remove old requests outside the window
        limiter["requests"] = [
            req_time for req_time in limiter["requests"]
            if current_time - req_time < limiter["window"]
        ]
        
        # Check if we can make another request
        return len(limiter["requests"]) < limiter["max_requests"]
    
    async def update_rate_limiter(self, api_name: str):
        """Update rate limiter after making a request"""
        
        if api_name in self.rate_limiters:
            self.rate_limiters[api_name]["requests"].append(time.time())
    
    async def cleanup_cache_entry(self, cache_key: str, delay: int):
        """Remove cache entry after delay"""
        await asyncio.sleep(delay)
        self.response_cache.pop(cache_key, None)
    
    async def cleanup(self):
        """Cleanup resources"""
        if self.session:
            await self.session.close()
    
    async def run(self):
        """Run the server"""
        try:
            await self.initialize()
            await self.server.run()
        finally:
            await self.cleanup()

# Configuration example
api_configs = {
    "github": {
        "base_url": "https://api.github.com",
        "default_headers": {
            "Accept": "application/vnd.github.v3+json"
        },
        "auth": {
            "type": "bearer",
            "token": "your_github_token"
        },
        "rate_limit": {
            "requests": 60,
            "window": 3600  # 60 requests per hour
        }
    },
    "weather": {
        "base_url": "http://api.weatherapi.com/v1",
        "default_headers": {
            "Accept": "application/json"
        },
        "auth": {
            "type": "api_key",
            "header": "key",
            "key": "your_weather_api_key"
        },
        "rate_limit": {
            "requests": 1000,
            "window": 86400  # 1000 requests per day
        }
    },
    "search": {
        "base_url": "https://api.serpapi.com",
        "default_headers": {
            "Accept": "application/json"
        },
        "auth": {
            "type": "api_key",
            "header": "api_key",
            "key": "your_search_api_key"
        }
    }
}

if __name__ == "__main__":
    server = APIIntegrationServer(api_configs)
    asyncio.run(server.run())
```

## Production Considerations

### Error Handling and Resilience

```python
class ResilientMCPServer:
    def __init__(self, name: str):
        self.server = Server(name)
        self.error_counts = {}
        self.circuit_breakers = {}
        self.setup_error_handling()
    
    def setup_error_handling(self):
        """Setup comprehensive error handling"""
        
        @self.server.tool("resilient_operation")
        async def resilient_operation(operation_type: str, **kwargs) -> str:
            """Execute operation with circuit breaker pattern"""
            
            # Check circuit breaker
            if self.is_circuit_open(operation_type):
                return f"Error: Circuit breaker open for {operation_type}"
            
            try:
                # Execute operation
                result = await self.execute_operation(operation_type, **kwargs)
                
                # Reset error count on success
                self.error_counts[operation_type] = 0
                
                return result
                
            except Exception as e:
                # Increment error count
                self.error_counts[operation_type] = self.error_counts.get(operation_type, 0) + 1
                
                # Open circuit breaker if too many errors
                if self.error_counts[operation_type] >= 5:
                    self.circuit_breakers[operation_type] = time.time() + 300  # 5 minute timeout
                
                return f"Error: {str(e)}"
    
    def is_circuit_open(self, operation_type: str) -> bool:
        """Check if circuit breaker is open"""
        
        if operation_type not in self.circuit_breakers:
            return False
        
        # Check if timeout has expired
        if time.time() > self.circuit_breakers[operation_type]:
            del self.circuit_breakers[operation_type]
            return False
        
        return True
```

### Monitoring and Metrics

```python
class MonitoredMCPServer:
    def __init__(self, name: str):
        self.server = Server(name)
        self.metrics = {
            "tool_calls": {},
            "errors": [],
            "performance": {},
            "uptime_start": time.time()
        }
        self.setup_monitoring()
    
    def setup_monitoring(self):
        
        @self.server.tool("get_metrics")
        async def get_metrics() -> str:
            """Get server performance metrics"""
            
            uptime = time.time() - self.metrics["uptime_start"]
            
            metrics_summary = {
                "uptime_seconds": uptime,
                "total_tool_calls": sum(self.metrics["tool_calls"].values()),
                "error_count": len(self.metrics["errors"]),
                "tools_performance": self.metrics["performance"]
            }
            
            return json.dumps(metrics_summary, indent=2)
        
        # Wrap all tools with monitoring
        original_tool = self.server.tool
        
        def monitored_tool(name: str, description: str = None):
            def decorator(func):
                async def wrapper(*args, **kwargs):
                    start_time = time.time()
                    
                    try:
                        result = await func(*args, **kwargs)
                        
                        # Record successful call
                        self.record_tool_call(name, time.time() - start_time, True)
                        
                        return result
                        
                    except Exception as e:
                        # Record error
                        self.record_tool_call(name, time.time() - start_time, False)
                        self.record_error(name, str(e))
                        raise
                
                return original_tool(name, description)(wrapper)
            return decorator
        
        self.server.tool = monitored_tool
    
    def record_tool_call(self, tool_name: str, duration: float, success: bool):
        """Record tool call metrics"""
        
        if tool_name not in self.metrics["tool_calls"]:
            self.metrics["tool_calls"][tool_name] = 0
            self.metrics["performance"][tool_name] = {
                "total_calls": 0,
                "successful_calls": 0,
                "total_duration": 0,
                "average_duration": 0
            }
        
        self.metrics["tool_calls"][tool_name] += 1
        
        perf = self.metrics["performance"][tool_name]
        perf["total_calls"] += 1
        perf["total_duration"] += duration
        perf["average_duration"] = perf["total_duration"] / perf["total_calls"]
        
        if success:
            perf["successful_calls"] += 1
    
    def record_error(self, tool_name: str, error_message: str):
        """Record error information"""
        
        self.metrics["errors"].append({
            "timestamp": time.time(),
            "tool": tool_name,
            "error": error_message
        })
        
        # Keep only last 100 errors
        if len(self.metrics["errors"]) > 100:
            self.metrics["errors"] = self.metrics["errors"][-100:]
```

## Testing MCP Servers

### Comprehensive Testing Framework

```python
# test_mcp_server.py
import asyncio
import pytest
from unittest.mock import Mock, patch
import tempfile
import os

class MCPServerTester:
    def __init__(self, server_class, server_config=None):
        self.server_class = server_class
        self.server_config = server_config or {}
        self.server = None
        self.test_results = []
    
    async def setup_test_server(self):
        """Setup server for testing"""
        self.server = self.server_class(**self.server_config)
        # Don't actually run the server, just initialize it
        if hasattr(self.server, 'initialize'):
            await self.server.initialize()
    
    async def test_tool_execution(self, tool_name: str, test_cases: List[Dict]):
        """Test tool with various inputs"""
        
        results = []
        
        for i, test_case in enumerate(test_cases):
            try:
                # Get the tool function
                tool_func = self.server.server.tools[tool_name].function
                
                # Execute with test inputs
                result = await tool_func(**test_case["input"])
                
                # Validate result
                test_result = {
                    "test_case": i + 1,
                    "input": test_case["input"],
                    "expected": test_case.get("expected"),
                    "actual": result,
                    "success": True,
                    "error": None
                }
                
                # Check if result matches expected (if provided)
                if "expected" in test_case:
                    if test_case["expected"] not in result:
                        test_result["success"] = False
                        test_result["error"] = "Result doesn't match expected output"
                
                results.append(test_result)
                
            except Exception as e:
                results.append({
                    "test_case": i + 1,
                    "input": test_case["input"],
                    "expected": test_case.get("expected"),
                    "actual": None,
                    "success": False,
                    "error": str(e)
                })
        
        return results
    
    async def test_error_handling(self, tool_name: str, error_cases: List[Dict]):
        """Test error handling with invalid inputs"""
        
        results = []
        
        for i, error_case in enumerate(error_cases):
            try:
                tool_func = self.server.server.tools[tool_name].function
                result = await tool_func(**error_case["input"])
                
                # Should have returned an error message
                if "error" in result.lower() or "failed" in result.lower():
                    results.append({
                        "test_case": i + 1,
                        "input": error_case["input"],
                        "handled_correctly": True,
                        "result": result
                    })
                else:
                    results.append({
                        "test_case": i + 1,
                        "input": error_case["input"],
                        "handled_correctly": False,
                        "result": result,
                        "issue": "Error not properly handled"
                    })
                    
            except Exception as e:
                # Exception should be caught and returned as error message
                results.append({
                    "test_case": i + 1,
                    "input": error_case["input"],
                    "handled_correctly": False,
                    "result": None,
                    "issue": f"Unhandled exception: {str(e)}"
                })
        
        return results
    
    async def run_performance_test(self, tool_name: str, test_input: Dict, 
                                 iterations: int = 100):
        """Run performance test on a tool"""
        
        import time
        
        tool_func = self.server.server.tools[tool_name].function
        durations = []
        
        for _ in range(iterations):
            start_time = time.time()
            
            try:
                await tool_func(**test_input)
                duration = time.time() - start_time
                durations.append(duration)
            except Exception:
                # Skip failed executions for performance testing
                pass
        
        if durations:
            avg_duration = sum(durations) / len(durations)
            min_duration = min(durations)
            max_duration = max(durations)
            
            return {
                "tool": tool_name,
                "iterations": len(durations),
                "average_duration": avg_duration,
                "min_duration": min_duration,
                "max_duration": max_duration,
                "success_rate": len(durations) / iterations
            }
        else:
            return {
                "tool": tool_name,
                "iterations": 0,
                "error": "All test iterations failed"
            }
    
    def generate_test_report(self, test_results: Dict):
        """Generate comprehensive test report"""
        
        report = []
        report.append("MCP Server Test Report")
        report.append("=" * 50)
        report.append(f"Server: {self.server_class.__name__}")
        report.append(f"Test Date: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")
        
        # Tool execution tests
        if "tool_tests" in test_results:
            report.append("Tool Execution Tests:")
            for tool_name, results in test_results["tool_tests"].items():
                passed = sum(1 for r in results if r["success"])
                total = len(results)
                report.append(f"  {tool_name}: {passed}/{total} passed")
        
        # Error handling tests
        if "error_tests" in test_results:
            report.append("\nError Handling Tests:")
            for tool_name, results in test_results["error_tests"].items():
                handled = sum(1 for r in results if r["handled_correctly"])
                total = len(results)
                report.append(f"  {tool_name}: {handled}/{total} handled correctly")
        
        # Performance tests
        if "performance_tests" in test_results:
            report.append("\nPerformance Tests:")
            for tool_name, result in test_results["performance_tests"].items():
                if "error" not in result:
                    report.append(f"  {tool_name}:")
                    report.append(f"    Average: {result['average_duration']*1000:.2f}ms")
                    report.append(f"    Range: {result['min_duration']*1000:.2f}ms - {result['max_duration']*1000:.2f}ms")
                    report.append(f"    Success Rate: {result['success_rate']*100:.1f}%")
        
        return "\n".join(report)

# Example test usage
async def test_filesystem_server():
    """Test the filesystem MCP server"""
    
    # Create temporary directory for testing
    with tempfile.TemporaryDirectory() as temp_dir:
        
        tester = MCPServerTester(
            FileSystemMCPServer,
            {"base_path": temp_dir}
        )
        
        await tester.setup_test_server()
        
        # Test cases for list_files tool
        list_files_tests = [
            {
                "input": {"path": "."},
                "expected": "Contents of"
            },
            {
                "input": {"path": "nonexistent"},
                "expected": "Error"
            }
        ]
        
        # Test cases for write_file tool
        write_file_tests = [
            {
                "input": {"path": "test.txt", "content": "Hello World"},
                "expected": "Successfully wrote"
            }
        ]
        
        # Run tests
        test_results = {}
        
        test_results["tool_tests"] = {
            "list_files": await tester.test_tool_execution("list_files", list_files_tests),
            "write_file": await tester.test_tool_execution("write_file", write_file_tests)
        }
        
        # Error handling tests
        error_cases = [
            {"input": {"path": "../../../etc/passwd"}},  # Path traversal attempt
            {"input": {"path": ""}},  # Empty path
        ]
        
        test_results["error_tests"] = {
            "list_files": await tester.test_error_handling("list_files", error_cases)
        }
        
        # Performance tests
        test_results["performance_tests"] = {
            "list_files": await tester.run_performance_test(
                "list_files", 
                {"path": "."}, 
                iterations=50
            )
        }
        
        # Generate report
        report = tester.generate_test_report(test_results)
        print(report)

if __name__ == "__main__":
    asyncio.run(test_filesystem_server())
```

## Deployment and Operations

### Docker Deployment

```dockerfile
# Dockerfile for MCP server
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy server code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 mcpuser && chown -R mcpuser:mcpuser /app
USER mcpuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import asyncio; from health_check import check_server_health; asyncio.run(check_server_health())"

# Run server
CMD ["python", "server.py"]
```

### Kubernetes Deployment

```yaml
# mcp-server-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-server
  labels:
    app: mcp-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mcp-server
  template:
    metadata:
      labels:
        app: mcp-server
    spec:
      containers:
      - name: mcp-server
        image: your-registry/mcp-server:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: mcp-secrets
              key: database-url
        - name: API_KEYS
          valueFrom:
            secretKeyRef:
              name: mcp-secrets
              key: api-keys
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: mcp-server-service
spec:
  selector:
    app: mcp-server
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: LoadBalancer
```

## Conclusion

Building production-ready MCP servers requires careful attention to architecture, security, performance, and reliability. The examples and patterns shown in this guide provide a solid foundation for creating robust MCP integrations that can scale with your AI applications.

Key takeaways for building successful MCP servers:

1. **Start with security**: Always validate inputs and implement proper permission controls
2. **Design for resilience**: Include error handling, circuit breakers, and retry logic
3. **Monitor everything**: Implement comprehensive metrics and logging
4. **Test thoroughly**: Use automated testing to ensure reliability
5. **Plan for scale**: Design your architecture to handle growth

As the MCP ecosystem continues to evolve, these foundational patterns will help you build servers that not only work today but can adapt and grow with the changing landscape of AI integration needs.

Whether you're building simple utility servers or complex business intelligence platforms, the principles and examples in this guide will help you create MCP servers that unlock the full potential of AI integration in your applications.