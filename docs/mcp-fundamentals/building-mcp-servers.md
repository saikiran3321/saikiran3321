---
sidebar_position: 3
---

# Building MCP Servers

Creating MCP servers allows you to expose tools and resources to AI applications in a standardized way. This guide covers everything from basic server setup to advanced patterns and best practices.

## Basic Server Setup

### Simple MCP Server

```python
# basic_server.py
import asyncio
from mcp.server import Server
from mcp.types import Tool, TextContent

class BasicMCPServer:
    def __init__(self):
        self.server = Server("basic-server")
        self.setup_tools()
    
    def setup_tools(self):
        """Register basic tools"""
        
        @self.server.tool("echo")
        async def echo(message: str) -> str:
            """Echo back the provided message"""
            return f"Echo: {message}"
        
        @self.server.tool("current_time")
        async def current_time() -> str:
            """Get the current time"""
            import datetime
            return f"Current time: {datetime.datetime.now().isoformat()}"
        
        @self.server.tool("calculate")
        async def calculate(expression: str) -> str:
            """Safely evaluate mathematical expressions"""
            try:
                # Only allow safe mathematical operations
                allowed_chars = set('0123456789+-*/().')
                if not all(c in allowed_chars or c.isspace() for c in expression):
                    return "Error: Invalid characters in expression"
                
                result = eval(expression)
                return f"Result: {result}"
            except Exception as e:
                return f"Error: {str(e)}"
    
    async def run(self):
        """Start the server"""
        await self.server.run()

# Run the server
if __name__ == "__main__":
    server = BasicMCPServer()
    asyncio.run(server.run())
```

### Server with Resources

```python
# resource_server.py
import asyncio
import os
from mcp.server import Server
from mcp.types import Resource, TextContent

class ResourceMCPServer:
    def __init__(self, base_path: str = "."):
        self.server = Server("resource-server")
        self.base_path = os.path.abspath(base_path)
        self.setup_tools()
        self.setup_resources()
    
    def setup_tools(self):
        """Setup file system tools"""
        
        @self.server.tool("list_files")
        async def list_files(path: str = ".") -> str:
            """List files in a directory"""
            try:
                full_path = os.path.join(self.base_path, path)
                if not self.is_safe_path(full_path):
                    return "Error: Access denied to path outside base directory"
                
                files = os.listdir(full_path)
                return f"Files in {path}:\n" + "\n".join(files)
            except Exception as e:
                return f"Error: {str(e)}"
        
        @self.server.tool("create_file")
        async def create_file(path: str, content: str) -> str:
            """Create a new file with content"""
            try:
                full_path = os.path.join(self.base_path, path)
                if not self.is_safe_path(full_path):
                    return "Error: Access denied to path outside base directory"
                
                with open(full_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                return f"File created: {path}"
            except Exception as e:
                return f"Error: {str(e)}"
    
    def setup_resources(self):
        """Setup file resources"""
        
        @self.server.resource("file://{path}")
        async def read_file(path: str) -> str:
            """Read file content as a resource"""
            try:
                full_path = os.path.join(self.base_path, path)
                if not self.is_safe_path(full_path):
                    raise PermissionError("Access denied")
                
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                return content
            except Exception as e:
                raise Exception(f"Failed to read file: {str(e)}")
    
    def is_safe_path(self, path: str) -> bool:
        """Check if path is within allowed base directory"""
        return os.path.commonpath([self.base_path, path]) == self.base_path
    
    async def run(self):
        await self.server.run()

if __name__ == "__main__":
    server = ResourceMCPServer("/safe/directory")
    asyncio.run(server.run())
```

## Advanced Server Patterns

### Database Integration Server

```python
# database_server.py
import asyncio
import sqlite3
import json
from typing import List, Dict, Any
from mcp.server import Server

class DatabaseMCPServer:
    def __init__(self, db_path: str):
        self.server = Server("database-server")
        self.db_path = db_path
        self.connection_pool = []
        self.max_connections = 10
        self.setup_database_tools()
    
    async def initialize(self):
        """Initialize database connection pool"""
        for _ in range(self.max_connections):
            conn = sqlite3.connect(self.db_path, check_same_thread=False)
            conn.row_factory = sqlite3.Row  # Enable column access by name
            self.connection_pool.append(conn)
    
    def get_connection(self):
        """Get database connection from pool"""
        if self.connection_pool:
            return self.connection_pool.pop()
        else:
            # Create new connection if pool is empty
            conn = sqlite3.connect(self.db_path, check_same_thread=False)
            conn.row_factory = sqlite3.Row
            return conn
    
    def return_connection(self, conn):
        """Return connection to pool"""
        if len(self.connection_pool) < self.max_connections:
            self.connection_pool.append(conn)
        else:
            conn.close()
    
    def setup_database_tools(self):
        
        @self.server.tool("execute_select")
        async def execute_select(query: str, params: List[Any] = None) -> str:
            """Execute SELECT query safely"""
            
            # Validate query is SELECT only
            if not query.strip().upper().startswith('SELECT'):
                return "Error: Only SELECT queries are allowed"
            
            conn = self.get_connection()
            try:
                cursor = conn.cursor()
                
                if params:
                    cursor.execute(query, params)
                else:
                    cursor.execute(query)
                
                results = cursor.fetchall()
                
                if results:
                    # Convert to list of dictionaries
                    rows = [dict(row) for row in results]
                    return self.format_table_output(rows)
                else:
                    return "No results found"
                    
            except Exception as e:
                return f"Database error: {str(e)}"
            finally:
                self.return_connection(conn)
        
        @self.server.tool("get_table_schema")
        async def get_table_schema(table_name: str) -> str:
            """Get schema information for a table"""
            
            conn = self.get_connection()
            try:
                cursor = conn.cursor()
                cursor.execute(f"PRAGMA table_info({table_name})")
                schema_info = cursor.fetchall()
                
                if schema_info:
                    schema_rows = [dict(row) for row in schema_info]
                    return self.format_schema_output(table_name, schema_rows)
                else:
                    return f"Table '{table_name}' not found"
                    
            except Exception as e:
                return f"Error: {str(e)}"
            finally:
                self.return_connection(conn)
        
        @self.server.tool("list_tables")
        async def list_tables() -> str:
            """List all tables in the database"""
            
            conn = self.get_connection()
            try:
                cursor = conn.cursor()
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
                tables = cursor.fetchall()
                
                table_names = [row[0] for row in tables]
                return f"Tables in database:\n" + "\n".join(f"- {name}" for name in table_names)
                
            except Exception as e:
                return f"Error: {str(e)}"
            finally:
                self.return_connection(conn)
        
        @self.server.tool("execute_aggregation")
        async def execute_aggregation(table: str, group_by: str = None, 
                                    aggregate_func: str = "COUNT", 
                                    column: str = "*") -> str:
            """Execute aggregation queries safely"""
            
            # Validate inputs
            allowed_functions = ["COUNT", "SUM", "AVG", "MIN", "MAX"]
            if aggregate_func.upper() not in allowed_functions:
                return f"Error: Only {', '.join(allowed_functions)} functions are allowed"
            
            # Build query
            if group_by:
                query = f"SELECT {group_by}, {aggregate_func}({column}) as result FROM {table} GROUP BY {group_by}"
            else:
                query = f"SELECT {aggregate_func}({column}) as result FROM {table}"
            
            return await execute_select(query)
    
    def format_table_output(self, rows: List[Dict]) -> str:
        """Format query results as a readable table"""
        
        if not rows:
            return "No data"
        
        headers = list(rows[0].keys())
        
        # Calculate column widths
        col_widths = {}
        for header in headers:
            col_widths[header] = max(
                len(header),
                max(len(str(row[header])) for row in rows)
            )
        
        # Build table
        lines = []
        
        # Header
        header_line = " | ".join(header.ljust(col_widths[header]) for header in headers)
        lines.append(header_line)
        
        # Separator
        separator = " | ".join("-" * col_widths[header] for header in headers)
        lines.append(separator)
        
        # Data rows
        for row in rows:
            row_line = " | ".join(str(row[header]).ljust(col_widths[header]) for header in headers)
            lines.append(row_line)
        
        return "\n".join(lines)
    
    def format_schema_output(self, table_name: str, schema_rows: List[Dict]) -> str:
        """Format table schema information"""
        
        lines = [f"Schema for table '{table_name}':"]
        lines.append("-" * 40)
        
        for row in schema_rows:
            column_info = f"  {row['name']} ({row['type']})"
            if row['notnull']:
                column_info += " NOT NULL"
            if row['pk']:
                column_info += " PRIMARY KEY"
            if row['dflt_value']:
                column_info += f" DEFAULT {row['dflt_value']}"
            
            lines.append(column_info)
        
        return "\n".join(lines)
    
    async def run(self):
        await self.initialize()
        await self.server.run()

if __name__ == "__main__":
    server = DatabaseMCPServer("example.db")
    asyncio.run(server.run())
```

### API Integration Server

```python
# api_server.py
import asyncio
import aiohttp
import json
from typing import Dict, Any, Optional
from mcp.server import Server

class APIMCPServer:
    def __init__(self, api_configs: Dict[str, Dict]):
        self.server = Server("api-server")
        self.api_configs = api_configs
        self.session = None
        self.rate_limits = {}
        self.setup_api_tools()
    
    async def initialize(self):
        """Initialize HTTP session"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30)
        )
    
    def setup_api_tools(self):
        
        @self.server.tool("call_api")
        async def call_api(api_name: str, endpoint: str, method: str = "GET", 
                          data: Dict = None, headers: Dict = None) -> str:
            """Make API call to configured service"""
            
            if api_name not in self.api_configs:
                return f"Error: API '{api_name}' not configured"
            
            config = self.api_configs[api_name]
            
            # Check rate limits
            if not await self.check_rate_limit(api_name):
                return "Error: Rate limit exceeded for this API"
            
            # Build full URL
            base_url = config["base_url"].rstrip("/")
            full_url = f"{base_url}/{endpoint.lstrip('/')}"
            
            # Prepare headers
            request_headers = config.get("default_headers", {}).copy()
            if headers:
                request_headers.update(headers)
            
            # Add authentication if configured
            if "auth" in config:
                request_headers.update(config["auth"])
            
            try:
                async with self.session.request(
                    method.upper(),
                    full_url,
                    json=data if data else None,
                    headers=request_headers
                ) as response:
                    
                    # Update rate limit tracking
                    await self.update_rate_limit(api_name, response.headers)
                    
                    # Handle response
                    if response.status == 200:
                        content_type = response.headers.get('content-type', '')
                        
                        if 'application/json' in content_type:
                            result = await response.json()
                            return f"Success:\n{json.dumps(result, indent=2)}"
                        else:
                            text = await response.text()
                            return f"Success:\n{text}"
                    else:
                        error_text = await response.text()
                        return f"Error {response.status}: {error_text}"
                        
            except Exception as e:
                return f"Request failed: {str(e)}"
        
        @self.server.tool("github_repo_info")
        async def github_repo_info(owner: str, repo: str) -> str:
            """Get GitHub repository information"""
            
            return await call_api(
                "github",
                f"repos/{owner}/{repo}",
                method="GET"
            )
        
        @self.server.tool("weather_info")
        async def weather_info(city: str, api_key: str) -> str:
            """Get weather information for a city"""
            
            return await call_api(
                "openweather",
                f"weather?q={city}&appid={api_key}&units=metric",
                method="GET"
            )
        
        @self.server.tool("send_slack_message")
        async def send_slack_message(channel: str, message: str, webhook_url: str) -> str:
            """Send message to Slack channel"""
            
            payload = {
                "channel": channel,
                "text": message,
                "username": "MCP Bot"
            }
            
            try:
                async with self.session.post(webhook_url, json=payload) as response:
                    if response.status == 200:
                        return "Message sent successfully"
                    else:
                        return f"Failed to send message: {response.status}"
            except Exception as e:
                return f"Error: {str(e)}"
    
    async def check_rate_limit(self, api_name: str) -> bool:
        """Check if API call is within rate limits"""
        
        if api_name not in self.rate_limits:
            return True
        
        rate_limit_info = self.rate_limits[api_name]
        current_time = asyncio.get_event_loop().time()
        
        # Reset if window has passed
        if current_time >= rate_limit_info["reset_time"]:
            rate_limit_info["remaining"] = rate_limit_info["limit"]
            rate_limit_info["reset_time"] = current_time + rate_limit_info["window"]
        
        return rate_limit_info["remaining"] > 0
    
    async def update_rate_limit(self, api_name: str, headers: Dict):
        """Update rate limit information from response headers"""
        
        # GitHub-style rate limiting
        if "x-ratelimit-limit" in headers:
            self.rate_limits[api_name] = {
                "limit": int(headers["x-ratelimit-limit"]),
                "remaining": int(headers["x-ratelimit-remaining"]),
                "reset_time": int(headers["x-ratelimit-reset"]),
                "window": 3600  # 1 hour
            }
    
    async def cleanup(self):
        """Cleanup resources"""
        if self.session:
            await self.session.close()
    
    async def run(self):
        await self.initialize()
        try:
            await self.server.run()
        finally:
            await self.cleanup()

# Configuration example
api_configs = {
    "github": {
        "base_url": "https://api.github.com",
        "default_headers": {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "MCP-Server/1.0"
        }
    },
    "openweather": {
        "base_url": "http://api.openweathermap.org/data/2.5",
        "default_headers": {
            "Accept": "application/json"
        }
    }
}

if __name__ == "__main__":
    server = APIMCPServer(api_configs)
    asyncio.run(server.run())
```

### Development Tools Server

```python
# dev_tools_server.py
import asyncio
import subprocess
import os
import json
from pathlib import Path
from mcp.server import Server

class DevToolsMCPServer:
    def __init__(self, project_root: str = "."):
        self.server = Server("dev-tools-server")
        self.project_root = Path(project_root).resolve()
        self.setup_dev_tools()
    
    def setup_dev_tools(self):
        
        @self.server.tool("git_status")
        async def git_status() -> str:
            """Get git repository status"""
            try:
                result = await self.run_command(["git", "status", "--porcelain"])
                if result["returncode"] == 0:
                    if result["stdout"]:
                        return f"Git status:\n{result['stdout']}"
                    else:
                        return "Working directory clean"
                else:
                    return f"Git error: {result['stderr']}"
            except Exception as e:
                return f"Error: {str(e)}"
        
        @self.server.tool("git_log")
        async def git_log(count: int = 10) -> str:
            """Get recent git commits"""
            try:
                result = await self.run_command([
                    "git", "log", f"-{count}", "--oneline", "--decorate"
                ])
                if result["returncode"] == 0:
                    return f"Recent commits:\n{result['stdout']}"
                else:
                    return f"Git error: {result['stderr']}"
            except Exception as e:
                return f"Error: {str(e)}"
        
        @self.server.tool("run_tests")
        async def run_tests(test_path: str = ".", framework: str = "pytest") -> str:
            """Run tests using specified framework"""
            
            commands = {
                "pytest": ["python", "-m", "pytest", test_path, "-v"],
                "unittest": ["python", "-m", "unittest", "discover", test_path],
                "npm": ["npm", "test"],
                "jest": ["npx", "jest", test_path]
            }
            
            if framework not in commands:
                return f"Error: Unsupported test framework '{framework}'"
            
            try:
                result = await self.run_command(commands[framework])
                
                output = f"Test Results ({framework}):\n"
                output += f"Exit code: {result['returncode']}\n"
                output += f"Output:\n{result['stdout']}"
                
                if result["stderr"]:
                    output += f"\nErrors:\n{result['stderr']}"
                
                return output
                
            except Exception as e:
                return f"Error running tests: {str(e)}"
        
        @self.server.tool("lint_code")
        async def lint_code(file_path: str = ".", linter: str = "flake8") -> str:
            """Run code linting"""
            
            linters = {
                "flake8": ["flake8", file_path],
                "pylint": ["pylint", file_path],
                "eslint": ["npx", "eslint", file_path],
                "black": ["black", "--check", file_path]
            }
            
            if linter not in linters:
                return f"Error: Unsupported linter '{linter}'"
            
            try:
                result = await self.run_command(linters[linter])
                
                if result["returncode"] == 0:
                    return f"Linting passed: No issues found"
                else:
                    return f"Linting issues found:\n{result['stdout']}\n{result['stderr']}"
                    
            except Exception as e:
                return f"Error running linter: {str(e)}"
        
        @self.server.tool("build_project")
        async def build_project(build_command: str = None) -> str:
            """Build the project"""
            
            # Auto-detect build system if not specified
            if not build_command:
                if (self.project_root / "package.json").exists():
                    build_command = "npm run build"
                elif (self.project_root / "setup.py").exists():
                    build_command = "python setup.py build"
                elif (self.project_root / "Makefile").exists():
                    build_command = "make"
                else:
                    return "Error: Could not detect build system"
            
            try:
                command_parts = build_command.split()
                result = await self.run_command(command_parts)
                
                output = f"Build Results:\n"
                output += f"Exit code: {result['returncode']}\n"
                output += f"Output:\n{result['stdout']}"
                
                if result["stderr"]:
                    output += f"\nErrors:\n{result['stderr']}"
                
                return output
                
            except Exception as e:
                return f"Error building project: {str(e)}"
        
        @self.server.tool("analyze_dependencies")
        async def analyze_dependencies() -> str:
            """Analyze project dependencies"""
            
            analysis = []
            
            # Python dependencies
            if (self.project_root / "requirements.txt").exists():
                try:
                    result = await self.run_command(["pip", "list", "--outdated"])
                    analysis.append(f"Python Dependencies (Outdated):\n{result['stdout']}")
                except:
                    pass
            
            # Node.js dependencies
            if (self.project_root / "package.json").exists():
                try:
                    result = await self.run_command(["npm", "outdated"])
                    analysis.append(f"Node.js Dependencies (Outdated):\n{result['stdout']}")
                except:
                    pass
            
            # Security audit
            try:
                result = await self.run_command(["npm", "audit"])
                if result["returncode"] != 0:
                    analysis.append(f"Security Issues:\n{result['stdout']}")
            except:
                pass
            
            return "\n\n".join(analysis) if analysis else "No dependency issues found"
        
        @self.server.tool("project_stats")
        async def project_stats() -> str:
            """Get project statistics"""
            
            stats = {}
            
            # Count files by extension
            file_counts = {}
            total_lines = 0
            
            for file_path in self.project_root.rglob("*"):
                if file_path.is_file() and not any(part.startswith('.') for part in file_path.parts):
                    ext = file_path.suffix.lower()
                    file_counts[ext] = file_counts.get(ext, 0) + 1
                    
                    # Count lines for code files
                    if ext in ['.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.cpp', '.c', '.h']:
                        try:
                            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                                lines = len(f.readlines())
                                total_lines += lines
                        except:
                            pass
            
            # Format output
            output = f"Project Statistics:\n"
            output += f"Total code lines: {total_lines}\n"
            output += f"File breakdown:\n"
            
            for ext, count in sorted(file_counts.items(), key=lambda x: x[1], reverse=True):
                if ext:
                    output += f"  {ext}: {count} files\n"
            
            return output
    
    async def run_command(self, command: list, timeout: int = 30) -> dict:
        """Run shell command safely"""
        
        try:
            process = await asyncio.create_subprocess_exec(
                *command,
                cwd=self.project_root,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await asyncio.wait_for(
                process.communicate(),
                timeout=timeout
            )
            
            return {
                "returncode": process.returncode,
                "stdout": stdout.decode('utf-8', errors='ignore'),
                "stderr": stderr.decode('utf-8', errors='ignore')
            }
            
        except asyncio.TimeoutError:
            return {
                "returncode": -1,
                "stdout": "",
                "stderr": f"Command timed out after {timeout} seconds"
            }
        except Exception as e:
            return {
                "returncode": -1,
                "stdout": "",
                "stderr": str(e)
            }
    
    async def run(self):
        await self.server.run()

if __name__ == "__main__":
    server = DevToolsMCPServer()
    asyncio.run(server.run())
```

## Server Configuration and Deployment

### Configuration Management

```python
# config.py
import json
import os
from typing import Dict, Any
from pathlib import Path

class MCPServerConfig:
    def __init__(self, config_file: str = "mcp_config.json"):
        self.config_file = Path(config_file)
        self.config = self.load_config()
    
    def load_config(self) -> Dict[str, Any]:
        """Load configuration from file"""
        
        if self.config_file.exists():
            with open(self.config_file, 'r') as f:
                return json.load(f)
        else:
            # Create default configuration
            default_config = {
                "server": {
                    "name": "mcp-server",
                    "version": "1.0.0",
                    "description": "MCP Server",
                    "max_connections": 10,
                    "timeout": 30
                },
                "security": {
                    "allowed_origins": ["*"],
                    "require_auth": False,
                    "rate_limit": {
                        "enabled": True,
                        "requests_per_minute": 60
                    }
                },
                "logging": {
                    "level": "INFO",
                    "file": "mcp_server.log",
                    "max_size": "10MB",
                    "backup_count": 5
                },
                "tools": {
                    "enabled": [],
                    "disabled": []
                }
            }
            
            self.save_config(default_config)
            return default_config
    
    def save_config(self, config: Dict[str, Any] = None):
        """Save configuration to file"""
        
        config_to_save = config or self.config
        
        with open(self.config_file, 'w') as f:
            json.dump(config_to_save, f, indent=2)
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value"""
        
        keys = key.split('.')
        value = self.config
        
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        
        return value
    
    def set(self, key: str, value: Any):
        """Set configuration value"""
        
        keys = key.split('.')
        config = self.config
        
        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]
        
        config[keys[-1]] = value
        self.save_config()
```

### Production Server Template

```python
# production_server.py
import asyncio
import logging
import signal
import sys
from typing import Dict, Any
from mcp.server import Server
from config import MCPServerConfig

class ProductionMCPServer:
    def __init__(self, config_file: str = "mcp_config.json"):
        self.config = MCPServerConfig(config_file)
        self.server = Server(self.config.get("server.name", "production-server"))
        self.running = False
        self.setup_logging()
        self.setup_signal_handlers()
        self.setup_tools()
    
    def setup_logging(self):
        """Setup logging configuration"""
        
        log_level = getattr(logging, self.config.get("logging.level", "INFO"))
        log_file = self.config.get("logging.file", "mcp_server.log")
        
        logging.basicConfig(
            level=log_level,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler(sys.stdout)
            ]
        )
        
        self.logger = logging.getLogger(__name__)
    
    def setup_signal_handlers(self):
        """Setup signal handlers for graceful shutdown"""
        
        def signal_handler(signum, frame):
            self.logger.info(f"Received signal {signum}, shutting down...")
            self.running = False
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
    
    def setup_tools(self):
        """Setup server tools based on configuration"""
        
        enabled_tools = self.config.get("tools.enabled", [])
        disabled_tools = self.config.get("tools.disabled", [])
        
        # Health check tool (always enabled)
        @self.server.tool("health_check")
        async def health_check() -> str:
            """Check server health status"""
            
            status = {
                "status": "healthy",
                "uptime": self.get_uptime(),
                "memory_usage": self.get_memory_usage(),
                "active_connections": len(self.server.active_connections) if hasattr(self.server, 'active_connections') else 0
            }
            
            return f"Server Health:\n{json.dumps(status, indent=2)}"
        
        # Configuration tool
        if "config" not in disabled_tools:
            @self.server.tool("get_config")
            async def get_config(key: str = None) -> str:
                """Get server configuration"""
                
                if key:
                    value = self.config.get(key)
                    return f"{key}: {value}"
                else:
                    # Return non-sensitive configuration
                    safe_config = {
                        "server": self.config.get("server"),
                        "tools": self.config.get("tools")
                    }
                    return json.dumps(safe_config, indent=2)
        
        # System information tool
        if "system_info" in enabled_tools:
            @self.server.tool("system_info")
            async def system_info() -> str:
                """Get system information"""
                
                import platform
                import psutil
                
                info = {
                    "platform": platform.platform(),
                    "python_version": platform.python_version(),
                    "cpu_count": psutil.cpu_count(),
                    "memory_total": f"{psutil.virtual_memory().total / (1024**3):.2f} GB",
                    "disk_usage": f"{psutil.disk_usage('/').percent}%"
                }
                
                return f"System Information:\n{json.dumps(info, indent=2)}"
    
    def get_uptime(self) -> str:
        """Get server uptime"""
        
        if hasattr(self, 'start_time'):
            uptime_seconds = time.time() - self.start_time
            hours, remainder = divmod(uptime_seconds, 3600)
            minutes, seconds = divmod(remainder, 60)
            return f"{int(hours)}h {int(minutes)}m {int(seconds)}s"
        
        return "Unknown"
    
    def get_memory_usage(self) -> str:
        """Get current memory usage"""
        
        import psutil
        process = psutil.Process()
        memory_mb = process.memory_info().rss / (1024 * 1024)
        return f"{memory_mb:.2f} MB"
    
    async def startup(self):
        """Server startup tasks"""
        
        self.start_time = time.time()
        self.logger.info("Starting MCP server...")
        
        # Perform any initialization tasks
        await self.initialize_resources()
        
        self.logger.info("MCP server started successfully")
    
    async def shutdown(self):
        """Server shutdown tasks"""
        
        self.logger.info("Shutting down MCP server...")
        
        # Cleanup resources
        await self.cleanup_resources()
        
        self.logger.info("MCP server shutdown complete")
    
    async def initialize_resources(self):
        """Initialize server resources"""
        
        # Override in subclasses for specific initialization
        pass
    
    async def cleanup_resources(self):
        """Cleanup server resources"""
        
        # Override in subclasses for specific cleanup
        pass
    
    async def run(self):
        """Run the server"""
        
        try:
            await self.startup()
            self.running = True
            
            # Run server
            await self.server.run()
            
        except Exception as e:
            self.logger.error(f"Server error: {e}")
            raise
        finally:
            await self.shutdown()

if __name__ == "__main__":
    server = ProductionMCPServer()
    asyncio.run(server.run())
```

## Testing MCP Servers

### Unit Testing Framework

```python
# test_mcp_server.py
import asyncio
import pytest
from unittest.mock import Mock, patch
from mcp.client import ClientSession
from mcp.server import Server

class TestMCPServer:
    def __init__(self):
        self.server = None
        self.client = None
    
    async def setup_test_server(self):
        """Setup test server"""
        
        self.server = Server("test-server")
        
        @self.server.tool("test_tool")
        async def test_tool(input_value: str) -> str:
            return f"Processed: {input_value}"
        
        @self.server.tool("error_tool")
        async def error_tool() -> str:
            raise Exception("Test error")
        
        return self.server
    
    async def setup_test_client(self):
        """Setup test client"""
        
        # In a real test, you'd connect to the actual server
        # This is a simplified mock for demonstration
        self.client = Mock()
        self.client.call_tool = Mock()
        
        return self.client
    
    @pytest.mark.asyncio
    async def test_tool_execution(self):
        """Test successful tool execution"""
        
        server = await self.setup_test_server()
        
        # Mock tool execution
        result = await server.tools["test_tool"].function("test input")
        
        assert result == "Processed: test input"
    
    @pytest.mark.asyncio
    async def test_error_handling(self):
        """Test error handling"""
        
        server = await self.setup_test_server()
        
        # Test error tool
        with pytest.raises(Exception) as exc_info:
            await server.tools["error_tool"].function()
        
        assert str(exc_info.value) == "Test error"
    
    @pytest.mark.asyncio
    async def test_client_server_integration(self):
        """Test client-server integration"""
        
        # This would be a full integration test
        # connecting a real client to a real server
        pass

# Run tests
if __name__ == "__main__":
    pytest.main([__file__])
```

### Load Testing

```python
# load_test.py
import asyncio
import time
import statistics
from concurrent.futures import ThreadPoolExecutor
from mcp.client import ClientSession

class MCPLoadTester:
    def __init__(self, server_params, num_clients=10, requests_per_client=100):
        self.server_params = server_params
        self.num_clients = num_clients
        self.requests_per_client = requests_per_client
        self.results = []
    
    async def single_client_test(self, client_id: int):
        """Run test for a single client"""
        
        client_results = []
        
        async with ClientSession(self.server_params) as session:
            await session.initialize()
            
            for i in range(self.requests_per_client):
                start_time = time.time()
                
                try:
                    # Make test request
                    result = await session.call_tool("test_tool", {"input": f"client_{client_id}_request_{i}"})
                    
                    end_time = time.time()
                    duration = end_time - start_time
                    
                    client_results.append({
                        "client_id": client_id,
                        "request_id": i,
                        "duration": duration,
                        "success": True,
                        "error": None
                    })
                    
                except Exception as e:
                    end_time = time.time()
                    duration = end_time - start_time
                    
                    client_results.append({
                        "client_id": client_id,
                        "request_id": i,
                        "duration": duration,
                        "success": False,
                        "error": str(e)
                    })
        
        return client_results
    
    async def run_load_test(self):
        """Run load test with multiple clients"""
        
        print(f"Starting load test: {self.num_clients} clients, {self.requests_per_client} requests each")
        
        start_time = time.time()
        
        # Run clients concurrently
        tasks = []
        for client_id in range(self.num_clients):
            task = asyncio.create_task(self.single_client_test(client_id))
            tasks.append(task)
        
        # Wait for all clients to complete
        all_results = await asyncio.gather(*tasks)
        
        end_time = time.time()
        total_duration = end_time - start_time
        
        # Flatten results
        self.results = []
        for client_results in all_results:
            self.results.extend(client_results)
        
        # Generate report
        self.generate_report(total_duration)
    
    def generate_report(self, total_duration: float):
        """Generate load test report"""
        
        successful_requests = [r for r in self.results if r["success"]]
        failed_requests = [r for r in self.results if not r["success"]]
        
        if successful_requests:
            durations = [r["duration"] for r in successful_requests]
            
            avg_duration = statistics.mean(durations)
            median_duration = statistics.median(durations)
            min_duration = min(durations)
            max_duration = max(durations)
            
            if len(durations) > 1:
                std_duration = statistics.stdev(durations)
            else:
                std_duration = 0
        else:
            avg_duration = median_duration = min_duration = max_duration = std_duration = 0
        
        total_requests = len(self.results)
        success_rate = len(successful_requests) / total_requests * 100
        requests_per_second = total_requests / total_duration
        
        print("\n" + "="*50)
        print("LOAD TEST RESULTS")
        print("="*50)
        print(f"Total requests: {total_requests}")
        print(f"Successful requests: {len(successful_requests)}")
        print(f"Failed requests: {len(failed_requests)}")
        print(f"Success rate: {success_rate:.2f}%")
        print(f"Total duration: {total_duration:.2f} seconds")
        print(f"Requests per second: {requests_per_second:.2f}")
        print("\nResponse Time Statistics:")
        print(f"  Average: {avg_duration*1000:.2f} ms")
        print(f"  Median: {median_duration*1000:.2f} ms")
        print(f"  Min: {min_duration*1000:.2f} ms")
        print(f"  Max: {max_duration*1000:.2f} ms")
        print(f"  Std Dev: {std_duration*1000:.2f} ms")
        
        if failed_requests:
            print("\nError Summary:")
            error_counts = {}
            for req in failed_requests:
                error = req["error"]
                error_counts[error] = error_counts.get(error, 0) + 1
            
            for error, count in error_counts.items():
                print(f"  {error}: {count} occurrences")

# Usage
async def main():
    from mcp.client import StdioServerParameters
    
    server_params = StdioServerParameters(
        command="python",
        args=["basic_server.py"]
    )
    
    tester = MCPLoadTester(server_params, num_clients=5, requests_per_client=20)
    await tester.run_load_test()

if __name__ == "__main__":
    asyncio.run(main())
```

Building robust MCP servers requires careful attention to architecture, error handling, security, and testing. These patterns and examples provide a solid foundation for creating production-ready MCP integrations.