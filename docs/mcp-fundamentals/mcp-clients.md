---
sidebar_position: 4
---

# MCP Clients and Integration

MCP clients enable AI applications to connect to and interact with MCP servers. This section covers building robust MCP clients, integration patterns, and best practices for connecting AI systems to external tools and resources.

## Basic Client Implementation

### Simple MCP Client

```python
# basic_client.py
import asyncio
import json
from mcp.client import ClientSession, StdioServerParameters

class BasicMCPClient:
    def __init__(self):
        self.sessions = {}
        self.available_tools = {}
    
    async def connect_to_server(self, server_name: str, server_params):
        """Connect to an MCP server"""
        
        try:
            session = ClientSession(server_params)
            await session.initialize()
            
            # Store session
            self.sessions[server_name] = session
            
            # Discover available tools
            tools_response = await session.list_tools()
            self.available_tools[server_name] = {
                tool.name: tool for tool in tools_response.tools
            }
            
            print(f"Connected to {server_name}")
            print(f"Available tools: {list(self.available_tools[server_name].keys())}")
            
            return session
            
        except Exception as e:
            print(f"Failed to connect to {server_name}: {e}")
            return None
    
    async def call_tool(self, server_name: str, tool_name: str, arguments: dict):
        """Call a tool on a specific server"""
        
        if server_name not in self.sessions:
            raise Exception(f"Not connected to server: {server_name}")
        
        if tool_name not in self.available_tools[server_name]:
            raise Exception(f"Tool '{tool_name}' not available on server '{server_name}'")
        
        session = self.sessions[server_name]
        
        try:
            result = await session.call_tool(tool_name, arguments)
            return result.content[0].text if result.content else "No result"
            
        except Exception as e:
            raise Exception(f"Tool call failed: {e}")
    
    async def list_all_tools(self):
        """List all available tools across all servers"""
        
        all_tools = {}
        
        for server_name, tools in self.available_tools.items():
            for tool_name, tool in tools.items():
                all_tools[f"{server_name}.{tool_name}"] = {
                    "server": server_name,
                    "name": tool_name,
                    "description": tool.description,
                    "schema": tool.inputSchema
                }
        
        return all_tools
    
    async def disconnect_all(self):
        """Disconnect from all servers"""
        
        for server_name, session in self.sessions.items():
            try:
                await session.close()
                print(f"Disconnected from {server_name}")
            except Exception as e:
                print(f"Error disconnecting from {server_name}: {e}")
        
        self.sessions.clear()
        self.available_tools.clear()

# Usage example
async def main():
    client = BasicMCPClient()
    
    # Connect to file system server
    fs_params = StdioServerParameters(
        command="python",
        args=["filesystem_server.py"]
    )
    await client.connect_to_server("filesystem", fs_params)
    
    # Connect to database server
    db_params = StdioServerParameters(
        command="python",
        args=["database_server.py"]
    )
    await client.connect_to_server("database", db_params)
    
    # List all available tools
    tools = await client.list_all_tools()
    print("\nAll available tools:")
    for tool_id, tool_info in tools.items():
        print(f"  {tool_id}: {tool_info['description']}")
    
    # Use tools
    try:
        # List files
        result = await client.call_tool("filesystem", "list_files", {"path": "."})
        print(f"\nFile listing:\n{result}")
        
        # Query database
        result = await client.call_tool("database", "list_tables", {})
        print(f"\nDatabase tables:\n{result}")
        
    except Exception as e:
        print(f"Error: {e}")
    
    finally:
        await client.disconnect_all()

if __name__ == "__main__":
    asyncio.run(main())
```

### Advanced Client with Connection Management

```python
# advanced_client.py
import asyncio
import time
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from mcp.client import ClientSession

@dataclass
class ServerConfig:
    name: str
    transport_params: Any
    auto_reconnect: bool = True
    max_retries: int = 3
    retry_delay: float = 1.0
    health_check_interval: float = 30.0

class AdvancedMCPClient:
    def __init__(self):
        self.sessions: Dict[str, ClientSession] = {}
        self.server_configs: Dict[str, ServerConfig] = {}
        self.available_tools: Dict[str, Dict] = {}
        self.connection_status: Dict[str, str] = {}
        self.health_check_tasks: Dict[str, asyncio.Task] = {}
        self.logger = logging.getLogger(__name__)
        
    async def add_server(self, config: ServerConfig):
        """Add a server configuration"""
        
        self.server_configs[config.name] = config
        await self.connect_to_server(config.name)
    
    async def connect_to_server(self, server_name: str, retry_count: int = 0):
        """Connect to server with retry logic"""
        
        if server_name not in self.server_configs:
            raise ValueError(f"Server {server_name} not configured")
        
        config = self.server_configs[server_name]
        
        try:
            self.logger.info(f"Connecting to {server_name}...")
            
            session = ClientSession(config.transport_params)
            await session.initialize()
            
            # Store session
            self.sessions[server_name] = session
            self.connection_status[server_name] = "connected"
            
            # Discover capabilities
            await self.discover_server_capabilities(server_name)
            
            # Start health check if configured
            if config.health_check_interval > 0:
                self.health_check_tasks[server_name] = asyncio.create_task(
                    self.health_check_loop(server_name)
                )
            
            self.logger.info(f"Successfully connected to {server_name}")
            
        except Exception as e:
            self.connection_status[server_name] = "failed"
            self.logger.error(f"Failed to connect to {server_name}: {e}")
            
            # Retry if configured
            if config.auto_reconnect and retry_count < config.max_retries:
                self.logger.info(f"Retrying connection to {server_name} in {config.retry_delay}s...")
                await asyncio.sleep(config.retry_delay)
                await self.connect_to_server(server_name, retry_count + 1)
            else:
                raise e
    
    async def discover_server_capabilities(self, server_name: str):
        """Discover server tools and resources"""
        
        session = self.sessions[server_name]
        
        try:
            # Get tools
            tools_response = await session.list_tools()
            tools = {tool.name: tool for tool in tools_response.tools}
            
            # Get resources
            try:
                resources_response = await session.list_resources()
                resources = {res.uri: res for res in resources_response.resources}
            except:
                resources = {}
            
            self.available_tools[server_name] = {
                "tools": tools,
                "resources": resources,
                "last_updated": time.time()
            }
            
            self.logger.info(f"Discovered {len(tools)} tools and {len(resources)} resources on {server_name}")
            
        except Exception as e:
            self.logger.error(f"Failed to discover capabilities for {server_name}: {e}")
    
    async def health_check_loop(self, server_name: str):
        """Periodic health check for server"""
        
        config = self.server_configs[server_name]
        
        while server_name in self.sessions:
            try:
                await asyncio.sleep(config.health_check_interval)
                
                if server_name in self.sessions:
                    session = self.sessions[server_name]
                    
                    # Send ping
                    await session.ping()
                    
                    if self.connection_status[server_name] != "connected":
                        self.connection_status[server_name] = "connected"
                        self.logger.info(f"Health check passed for {server_name}")
                
            except Exception as e:
                self.logger.warning(f"Health check failed for {server_name}: {e}")
                self.connection_status[server_name] = "unhealthy"
                
                # Attempt reconnection
                if config.auto_reconnect:
                    try:
                        await self.reconnect_server(server_name)
                    except Exception as reconnect_error:
                        self.logger.error(f"Reconnection failed for {server_name}: {reconnect_error}")
    
    async def reconnect_server(self, server_name: str):
        """Reconnect to a server"""
        
        # Close existing session
        if server_name in self.sessions:
            try:
                await self.sessions[server_name].close()
            except:
                pass
            del self.sessions[server_name]
        
        # Cancel health check task
        if server_name in self.health_check_tasks:
            self.health_check_tasks[server_name].cancel()
            del self.health_check_tasks[server_name]
        
        # Reconnect
        await self.connect_to_server(server_name)
    
    async def call_tool_with_fallback(self, tool_spec: str, arguments: dict, 
                                    fallback_servers: List[str] = None):
        """Call tool with fallback to other servers"""
        
        # Parse tool specification (server.tool or just tool)
        if '.' in tool_spec:
            server_name, tool_name = tool_spec.split('.', 1)
            servers_to_try = [server_name]
        else:
            tool_name = tool_spec
            servers_to_try = list(self.sessions.keys())
        
        # Add fallback servers
        if fallback_servers:
            servers_to_try.extend(fallback_servers)
        
        last_error = None
        
        for server_name in servers_to_try:
            if server_name not in self.sessions:
                continue
            
            if server_name not in self.available_tools:
                continue
            
            if tool_name not in self.available_tools[server_name]["tools"]:
                continue
            
            try:
                session = self.sessions[server_name]
                result = await session.call_tool(tool_name, arguments)
                
                return {
                    "success": True,
                    "result": result.content[0].text if result.content else "No result",
                    "server_used": server_name
                }
                
            except Exception as e:
                last_error = e
                self.logger.warning(f"Tool call failed on {server_name}: {e}")
                continue
        
        return {
            "success": False,
            "error": str(last_error) if last_error else "No suitable server found",
            "server_used": None
        }
    
    async def batch_tool_calls(self, calls: List[Dict[str, Any]]):
        """Execute multiple tool calls concurrently"""
        
        tasks = []
        
        for call in calls:
            task = asyncio.create_task(
                self.call_tool_with_fallback(
                    call["tool"],
                    call["arguments"],
                    call.get("fallback_servers")
                )
            )
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        return [
            result if not isinstance(result, Exception) else {
                "success": False,
                "error": str(result),
                "server_used": None
            }
            for result in results
        ]
    
    async def get_server_status(self) -> Dict[str, Any]:
        """Get status of all servers"""
        
        status = {}
        
        for server_name in self.server_configs:
            server_status = {
                "configured": True,
                "connected": server_name in self.sessions,
                "status": self.connection_status.get(server_name, "unknown"),
                "tools_count": 0,
                "resources_count": 0,
                "last_health_check": None
            }
            
            if server_name in self.available_tools:
                capabilities = self.available_tools[server_name]
                server_status["tools_count"] = len(capabilities["tools"])
                server_status["resources_count"] = len(capabilities["resources"])
                server_status["last_updated"] = capabilities["last_updated"]
            
            status[server_name] = server_status
        
        return status
    
    async def shutdown(self):
        """Shutdown client and close all connections"""
        
        self.logger.info("Shutting down MCP client...")
        
        # Cancel health check tasks
        for task in self.health_check_tasks.values():
            task.cancel()
        
        # Close all sessions
        for server_name, session in self.sessions.items():
            try:
                await session.close()
                self.logger.info(f"Closed connection to {server_name}")
            except Exception as e:
                self.logger.error(f"Error closing connection to {server_name}: {e}")
        
        self.sessions.clear()
        self.available_tools.clear()
        self.connection_status.clear()
        self.health_check_tasks.clear()
        
        self.logger.info("MCP client shutdown complete")

# Usage example
async def main():
    client = AdvancedMCPClient()
    
    # Configure servers
    servers = [
        ServerConfig(
            name="filesystem",
            transport_params=StdioServerParameters(
                command="python",
                args=["filesystem_server.py"]
            ),
            auto_reconnect=True,
            health_check_interval=30.0
        ),
        ServerConfig(
            name="database",
            transport_params=StdioServerParameters(
                command="python",
                args=["database_server.py"]
            ),
            auto_reconnect=True,
            health_check_interval=60.0
        )
    ]
    
    try:
        # Add servers
        for server_config in servers:
            await client.add_server(server_config)
        
        # Wait a bit for connections to establish
        await asyncio.sleep(2)
        
        # Check status
        status = await client.get_server_status()
        print("Server Status:")
        for server, info in status.items():
            print(f"  {server}: {info['status']} ({info['tools_count']} tools)")
        
        # Execute batch tool calls
        batch_calls = [
            {"tool": "filesystem.list_files", "arguments": {"path": "."}},
            {"tool": "database.list_tables", "arguments": {}},
            {"tool": "current_time", "arguments": {}}  # Will try all servers
        ]
        
        results = await client.batch_tool_calls(batch_calls)
        
        print("\nBatch Results:")
        for i, result in enumerate(results):
            if result["success"]:
                print(f"  Call {i+1}: Success (via {result['server_used']})")
                print(f"    Result: {result['result'][:100]}...")
            else:
                print(f"  Call {i+1}: Failed - {result['error']}")
        
        # Keep running for health checks
        print("\nRunning for 60 seconds to demonstrate health checks...")
        await asyncio.sleep(60)
        
    finally:
        await client.shutdown()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
```

## AI Application Integration

### Claude Integration Example

```python
# claude_mcp_integration.py
import asyncio
import json
from typing import List, Dict, Any
from anthropic import Anthropic
from advanced_client import AdvancedMCPClient, ServerConfig

class ClaudeMCPIntegration:
    def __init__(self, anthropic_api_key: str):
        self.anthropic = Anthropic(api_key=anthropic_api_key)
        self.mcp_client = AdvancedMCPClient()
        self.conversation_history = []
    
    async def initialize(self, server_configs: List[ServerConfig]):
        """Initialize MCP connections"""
        
        for config in server_configs:
            await self.mcp_client.add_server(config)
        
        # Wait for connections to establish
        await asyncio.sleep(2)
    
    async def process_user_message(self, user_message: str) -> str:
        """Process user message with MCP tool integration"""
        
        # Add user message to history
        self.conversation_history.append({
            "role": "user",
            "content": user_message
        })
        
        # Get available tools for Claude
        tools = await self.get_claude_tools()
        
        # Call Claude with tools
        response = self.anthropic.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=4000,
            messages=self.conversation_history,
            tools=tools
        )
        
        # Process response and handle tool calls
        final_response = await self.handle_claude_response(response)
        
        # Add assistant response to history
        self.conversation_history.append({
            "role": "assistant",
            "content": final_response
        })
        
        return final_response
    
    async def get_claude_tools(self) -> List[Dict]:
        """Convert MCP tools to Claude tool format"""
        
        claude_tools = []
        
        for server_name, capabilities in self.mcp_client.available_tools.items():
            for tool_name, tool in capabilities["tools"].items():
                claude_tool = {
                    "name": f"{server_name}_{tool_name}",
                    "description": tool.description or f"Tool {tool_name} from {server_name}",
                    "input_schema": tool.inputSchema or {
                        "type": "object",
                        "properties": {},
                        "required": []
                    }
                }
                claude_tools.append(claude_tool)
        
        return claude_tools
    
    async def handle_claude_response(self, response) -> str:
        """Handle Claude response and execute tool calls"""
        
        if response.stop_reason == "tool_use":
            # Claude wants to use tools
            tool_results = []
            
            for content_block in response.content:
                if content_block.type == "tool_use":
                    tool_result = await self.execute_mcp_tool(
                        content_block.name,
                        content_block.input
                    )
                    tool_results.append(tool_result)
            
            # Continue conversation with tool results
            tool_message = {
                "role": "user",
                "content": [
                    {
                        "type": "tool_result",
                        "tool_use_id": content_block.id,
                        "content": tool_result["result"]
                    }
                    for content_block, tool_result in zip(
                        [cb for cb in response.content if cb.type == "tool_use"],
                        tool_results
                    )
                ]
            }
            
            self.conversation_history.append(tool_message)
            
            # Get final response from Claude
            final_response = self.anthropic.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=4000,
                messages=self.conversation_history
            )
            
            return final_response.content[0].text
        
        else:
            # Regular text response
            return response.content[0].text
    
    async def execute_mcp_tool(self, claude_tool_name: str, arguments: Dict) -> Dict:
        """Execute MCP tool from Claude tool call"""
        
        # Parse Claude tool name (format: server_toolname)
        if '_' in claude_tool_name:
            parts = claude_tool_name.split('_', 1)
            server_name = parts[0]
            tool_name = parts[1]
        else:
            # Try to find tool across all servers
            server_name = None
            tool_name = claude_tool_name
        
        try:
            if server_name:
                tool_spec = f"{server_name}.{tool_name}"
            else:
                tool_spec = tool_name
            
            result = await self.mcp_client.call_tool_with_fallback(
                tool_spec, arguments
            )
            
            return result
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "server_used": None
            }
    
    async def shutdown(self):
        """Shutdown the integration"""
        await self.mcp_client.shutdown()

# Usage example
async def main():
    # Initialize integration
    integration = ClaudeMCPIntegration("your-anthropic-api-key")
    
    # Configure MCP servers
    servers = [
        ServerConfig(
            name="filesystem",
            transport_params=StdioServerParameters(
                command="python",
                args=["filesystem_server.py"]
            )
        ),
        ServerConfig(
            name="database",
            transport_params=StdioServerParameters(
                command="python",
                args=["database_server.py"]
            )
        )
    ]
    
    await integration.initialize(servers)
    
    try:
        # Interactive conversation
        while True:
            user_input = input("\nYou: ")
            if user_input.lower() in ['quit', 'exit']:
                break
            
            response = await integration.process_user_message(user_input)
            print(f"\nClaude: {response}")
    
    finally:
        await integration.shutdown()

if __name__ == "__main__":
    asyncio.run(main())
```

### Custom AI Assistant Integration

```python
# custom_ai_integration.py
import asyncio
import json
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

@dataclass
class ToolCall:
    tool_name: str
    arguments: Dict[str, Any]
    call_id: str

class CustomAIAssistant:
    def __init__(self, mcp_client: AdvancedMCPClient):
        self.mcp_client = mcp_client
        self.conversation_context = []
        self.tool_call_history = []
    
    async def process_request(self, user_request: str) -> str:
        """Process user request and determine tool usage"""
        
        # Analyze request to determine needed tools
        tool_plan = await self.analyze_request(user_request)
        
        if not tool_plan:
            return await self.generate_direct_response(user_request)
        
        # Execute tool plan
        tool_results = await self.execute_tool_plan(tool_plan)
        
        # Generate response based on tool results
        response = await self.synthesize_response(user_request, tool_results)
        
        return response
    
    async def analyze_request(self, request: str) -> List[ToolCall]:
        """Analyze request to determine which tools to use"""
        
        # Simple keyword-based analysis (in practice, use more sophisticated NLP)
        tool_plan = []
        
        # File operations
        if any(keyword in request.lower() for keyword in ['file', 'directory', 'folder', 'read', 'write']):
            if 'list' in request.lower() or 'show' in request.lower():
                tool_plan.append(ToolCall(
                    tool_name="filesystem.list_files",
                    arguments={"path": "."},
                    call_id="file_list_1"
                ))
        
        # Database operations
        if any(keyword in request.lower() for keyword in ['database', 'table', 'query', 'data']):
            if 'tables' in request.lower():
                tool_plan.append(ToolCall(
                    tool_name="database.list_tables",
                    arguments={},
                    call_id="db_tables_1"
                ))
        
        # Git operations
        if any(keyword in request.lower() for keyword in ['git', 'commit', 'repository', 'status']):
            tool_plan.append(ToolCall(
                tool_name="git.git_status",
                arguments={},
                call_id="git_status_1"
            ))
        
        # Time/date requests
        if any(keyword in request.lower() for keyword in ['time', 'date', 'when']):
            tool_plan.append(ToolCall(
                tool_name="current_time",
                arguments={},
                call_id="time_1"
            ))
        
        return tool_plan
    
    async def execute_tool_plan(self, tool_plan: List[ToolCall]) -> Dict[str, Any]:
        """Execute the planned tool calls"""
        
        results = {}
        
        for tool_call in tool_plan:
            try:
                result = await self.mcp_client.call_tool_with_fallback(
                    tool_call.tool_name,
                    tool_call.arguments
                )
                
                results[tool_call.call_id] = {
                    "tool_name": tool_call.tool_name,
                    "success": result["success"],
                    "result": result.get("result", ""),
                    "error": result.get("error"),
                    "server_used": result.get("server_used")
                }
                
                # Store in history
                self.tool_call_history.append({
                    "timestamp": time.time(),
                    "tool_call": tool_call,
                    "result": results[tool_call.call_id]
                })
                
            except Exception as e:
                results[tool_call.call_id] = {
                    "tool_name": tool_call.tool_name,
                    "success": False,
                    "result": "",
                    "error": str(e),
                    "server_used": None
                }
        
        return results
    
    async def synthesize_response(self, user_request: str, tool_results: Dict[str, Any]) -> str:
        """Synthesize response based on tool results"""
        
        response_parts = []
        
        # Process each tool result
        for call_id, result in tool_results.items():
            if result["success"]:
                tool_name = result["tool_name"]
                tool_result = result["result"]
                
                if "list_files" in tool_name:
                    response_parts.append(f"Here are the files in the directory:\n{tool_result}")
                
                elif "list_tables" in tool_name:
                    response_parts.append(f"Database tables:\n{tool_result}")
                
                elif "git_status" in tool_name:
                    response_parts.append(f"Git repository status:\n{tool_result}")
                
                elif "current_time" in tool_name:
                    response_parts.append(f"Current time: {tool_result}")
                
                else:
                    response_parts.append(f"Result from {tool_name}:\n{tool_result}")
            
            else:
                response_parts.append(f"Error executing {result['tool_name']}: {result['error']}")
        
        if response_parts:
            return "\n\n".join(response_parts)
        else:
            return "I wasn't able to execute any tools for your request."
    
    async def generate_direct_response(self, request: str) -> str:
        """Generate direct response without tools"""
        
        # Simple responses for common queries
        if "hello" in request.lower():
            return "Hello! I'm an AI assistant with access to various tools. I can help you with file operations, database queries, git commands, and more."
        
        elif "help" in request.lower():
            # List available tools
            status = await self.mcp_client.get_server_status()
            
            response = "I have access to the following tools:\n\n"
            
            for server_name, server_info in status.items():
                if server_info["connected"]:
                    response += f"**{server_name}** ({server_info['tools_count']} tools)\n"
                    
                    if server_name in self.mcp_client.available_tools:
                        tools = self.mcp_client.available_tools[server_name]["tools"]
                        for tool_name, tool in tools.items():
                            response += f"  - {tool_name}: {tool.description}\n"
                    
                    response += "\n"
            
            return response
        
        else:
            return "I'm not sure how to help with that. Try asking me to list files, check git status, query the database, or get the current time."

# Interactive CLI
class InteractiveCLI:
    def __init__(self, ai_assistant: CustomAIAssistant):
        self.ai_assistant = ai_assistant
    
    async def run(self):
        """Run interactive CLI"""
        
        print("AI Assistant with MCP Integration")
        print("Type 'help' for available commands, 'quit' to exit")
        print("-" * 50)
        
        while True:
            try:
                user_input = input("\nYou: ").strip()
                
                if user_input.lower() in ['quit', 'exit', 'q']:
                    break
                
                if not user_input:
                    continue
                
                # Special commands
                if user_input.lower() == 'status':
                    await self.show_status()
                    continue
                
                elif user_input.lower() == 'history':
                    await self.show_history()
                    continue
                
                # Process with AI assistant
                response = await self.ai_assistant.process_request(user_input)
                print(f"\nAssistant: {response}")
                
            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"\nError: {e}")
        
        print("\nGoodbye!")
    
    async def show_status(self):
        """Show MCP server status"""
        
        status = await self.ai_assistant.mcp_client.get_server_status()
        
        print("\nMCP Server Status:")
        for server_name, info in status.items():
            status_emoji = "✅" if info["connected"] else "❌"
            print(f"  {status_emoji} {server_name}: {info['status']} ({info['tools_count']} tools)")
    
    async def show_history(self):
        """Show tool call history"""
        
        history = self.ai_assistant.tool_call_history[-10:]  # Last 10 calls
        
        if not history:
            print("\nNo tool calls in history")
            return
        
        print("\nRecent Tool Calls:")
        for entry in history:
            timestamp = time.strftime("%H:%M:%S", time.localtime(entry["timestamp"]))
            tool_name = entry["tool_call"].tool_name
            success = "✅" if entry["result"]["success"] else "❌"
            print(f"  {timestamp} {success} {tool_name}")

# Main application
async def main():
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    
    # Initialize MCP client
    mcp_client = AdvancedMCPClient()
    
    # Configure servers
    servers = [
        ServerConfig(
            name="filesystem",
            transport_params=StdioServerParameters(
                command="python",
                args=["filesystem_server.py"]
            ),
            auto_reconnect=True
        ),
        ServerConfig(
            name="database",
            transport_params=StdioServerParameters(
                command="python",
                args=["database_server.py"]
            ),
            auto_reconnect=True
        ),
        ServerConfig(
            name="git",
            transport_params=StdioServerParameters(
                command="python",
                args=["git_server.py"]
            ),
            auto_reconnect=True
        )
    ]
    
    try:
        # Initialize servers
        for config in servers:
            await mcp_client.add_server(config)
        
        # Create AI assistant
        ai_assistant = CustomAIAssistant(mcp_client)
        
        # Run interactive CLI
        cli = InteractiveCLI(ai_assistant)
        await cli.run()
        
    finally:
        await mcp_client.shutdown()

if __name__ == "__main__":
    asyncio.run(main())
```

## Client Libraries and SDKs

### Python SDK Wrapper

```python
# mcp_sdk.py
import asyncio
from typing import Dict, List, Any, Optional, Callable
from contextlib import asynccontextmanager

class MCPToolkit:
    """High-level toolkit for MCP integration"""
    
    def __init__(self):
        self.client = AdvancedMCPClient()
        self.tool_registry = {}
        self.middleware = []
    
    def add_middleware(self, middleware_func: Callable):
        """Add middleware for tool calls"""
        self.middleware.append(middleware_func)
    
    async def setup(self, server_configs: List[ServerConfig]):
        """Setup MCP connections"""
        
        for config in server_configs:
            await self.client.add_server(config)
        
        # Build tool registry
        await self.build_tool_registry()
    
    async def build_tool_registry(self):
        """Build unified tool registry"""
        
        self.tool_registry = {}
        
        for server_name, capabilities in self.client.available_tools.items():
            for tool_name, tool in capabilities["tools"].items():
                full_name = f"{server_name}.{tool_name}"
                
                self.tool_registry[full_name] = {
                    "server": server_name,
                    "name": tool_name,
                    "description": tool.description,
                    "schema": tool.inputSchema,
                    "callable": self.create_tool_callable(server_name, tool_name)
                }
    
    def create_tool_callable(self, server_name: str, tool_name: str):
        """Create callable function for tool"""
        
        async def tool_callable(**kwargs):
            # Apply middleware
            for middleware in self.middleware:
                kwargs = await middleware(server_name, tool_name, kwargs)
            
            # Call tool
            result = await self.client.call_tool_with_fallback(
                f"{server_name}.{tool_name}",
                kwargs
            )
            
            if result["success"]:
                return result["result"]
            else:
                raise Exception(result["error"])
        
        return tool_callable
    
    def get_tool(self, tool_name: str):
        """Get tool callable by name"""
        
        if tool_name in self.tool_registry:
            return self.tool_registry[tool_name]["callable"]
        
        # Try partial match
        matches = [name for name in self.tool_registry if name.endswith(f".{tool_name}")]
        
        if len(matches) == 1:
            return self.tool_registry[matches[0]]["callable"]
        elif len(matches) > 1:
            raise ValueError(f"Ambiguous tool name '{tool_name}'. Matches: {matches}")
        else:
            raise ValueError(f"Tool '{tool_name}' not found")
    
    def list_tools(self, server: str = None) -> List[Dict]:
        """List available tools"""
        
        tools = []
        
        for tool_name, tool_info in self.tool_registry.items():
            if server is None or tool_info["server"] == server:
                tools.append({
                    "name": tool_name,
                    "server": tool_info["server"],
                    "description": tool_info["description"]
                })
        
        return tools
    
    @asynccontextmanager
    async def session(self, server_configs: List[ServerConfig]):
        """Context manager for MCP session"""
        
        try:
            await self.setup(server_configs)
            yield self
        finally:
            await self.client.shutdown()

# Usage examples
async def example_usage():
    """Example of using the MCP toolkit"""
    
    # Server configurations
    servers = [
        ServerConfig(
            name="fs",
            transport_params=StdioServerParameters(
                command="python",
                args=["filesystem_server.py"]
            )
        ),
        ServerConfig(
            name="db",
            transport_params=StdioServerParameters(
                command="python",
                args=["database_server.py"]
            )
        )
    ]
    
    # Use context manager
    async with MCPToolkit().session(servers) as toolkit:
        
        # Add logging middleware
        async def logging_middleware(server, tool, kwargs):
            print(f"Calling {server}.{tool} with {kwargs}")
            return kwargs
        
        toolkit.add_middleware(logging_middleware)
        
        # List available tools
        tools = toolkit.list_tools()
        print("Available tools:")
        for tool in tools:
            print(f"  - {tool['name']}: {tool['description']}")
        
        # Use tools directly
        list_files = toolkit.get_tool("list_files")
        files = await list_files(path=".")
        print(f"\nFiles: {files}")
        
        list_tables = toolkit.get_tool("list_tables")
        tables = await list_tables()
        print(f"\nTables: {tables}")

if __name__ == "__main__":
    asyncio.run(example_usage())
```

### JavaScript/TypeScript SDK

```typescript
// mcp-client.ts
import { Client, StdioServerParameters, Tool, Resource } from '@modelcontextprotocol/sdk/client';

interface ServerConfig {
  name: string;
  command: string;
  args: string[];
  autoReconnect?: boolean;
  maxRetries?: number;
}

interface ToolCall {
  server: string;
  tool: string;
  arguments: Record<string, any>;
}

class MCPClientManager {
  private clients: Map<string, Client> = new Map();
  private availableTools: Map<string, Tool[]> = new Map();
  private connectionStatus: Map<string, string> = new Map();

  async addServer(config: ServerConfig): Promise<void> {
    try {
      const serverParams = new StdioServerParameters({
        command: config.command,
        args: config.args
      });

      const client = new Client(serverParams);
      await client.connect();

      // Store client
      this.clients.set(config.name, client);
      this.connectionStatus.set(config.name, 'connected');

      // Discover tools
      const tools = await client.listTools();
      this.availableTools.set(config.name, tools);

      console.log(`Connected to ${config.name} with ${tools.length} tools`);

    } catch (error) {
      console.error(`Failed to connect to ${config.name}:`, error);
      this.connectionStatus.set(config.name, 'failed');
      throw error;
    }
  }

  async callTool(serverName: string, toolName: string, arguments: Record<string, any>): Promise<string> {
    const client = this.clients.get(serverName);
    if (!client) {
      throw new Error(`Not connected to server: ${serverName}`);
    }

    try {
      const result = await client.callTool(toolName, arguments);
      return result.content[0]?.text || 'No result';
    } catch (error) {
      throw new Error(`Tool call failed: ${error}`);
    }
  }

  async batchToolCalls(calls: ToolCall[]): Promise<Array<{success: boolean, result?: string, error?: string}>> {
    const promises = calls.map(async (call) => {
      try {
        const result = await this.callTool(call.server, call.tool, call.arguments);
        return { success: true, result };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    return Promise.all(promises);
  }

  getAvailableTools(): Record<string, string[]> {
    const tools: Record<string, string[]> = {};
    
    for (const [serverName, serverTools] of this.availableTools) {
      tools[serverName] = serverTools.map(tool => tool.name);
    }
    
    return tools;
  }

  async disconnect(): Promise<void> {
    for (const [serverName, client] of this.clients) {
      try {
        await client.close();
        console.log(`Disconnected from ${serverName}`);
      } catch (error) {
        console.error(`Error disconnecting from ${serverName}:`, error);
      }
    }

    this.clients.clear();
    this.availableTools.clear();
    this.connectionStatus.clear();
  }
}

// Usage example
async function main() {
  const mcpClient = new MCPClientManager();

  const servers: ServerConfig[] = [
    {
      name: 'filesystem',
      command: 'python',
      args: ['filesystem_server.py']
    },
    {
      name: 'database',
      command: 'python',
      args: ['database_server.py']
    }
  ];

  try {
    // Connect to servers
    for (const server of servers) {
      await mcpClient.addServer(server);
    }

    // List available tools
    const tools = mcpClient.getAvailableTools();
    console.log('Available tools:', tools);

    // Execute batch calls
    const calls: ToolCall[] = [
      { server: 'filesystem', tool: 'list_files', arguments: { path: '.' } },
      { server: 'database', tool: 'list_tables', arguments: {} }
    ];

    const results = await mcpClient.batchToolCalls(calls);
    console.log('Results:', results);

  } finally {
    await mcpClient.disconnect();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { MCPClientManager, ServerConfig, ToolCall };
```

## Best Practices for MCP Clients

### Error Handling and Resilience

```python
# resilient_client.py
import asyncio
import logging
from typing import Dict, Any, Optional
from dataclasses import dataclass, field
from enum import Enum

class ConnectionState(Enum):
    DISCONNECTED = "disconnected"
    CONNECTING = "connecting"
    CONNECTED = "connected"
    RECONNECTING = "reconnecting"
    FAILED = "failed"

@dataclass
class RetryConfig:
    max_retries: int = 3
    base_delay: float = 1.0
    max_delay: float = 60.0
    exponential_base: float = 2.0
    jitter: bool = True

class ResilientMCPClient:
    def __init__(self, retry_config: RetryConfig = None):
        self.retry_config = retry_config or RetryConfig()
        self.clients: Dict[str, ClientSession] = {}
        self.connection_states: Dict[str, ConnectionState] = {}
        self.retry_counts: Dict[str, int] = {}
        self.circuit_breakers: Dict[str, bool] = {}
        self.logger = logging.getLogger(__name__)
    
    async def connect_with_retry(self, server_name: str, server_params) -> bool:
        """Connect to server with exponential backoff retry"""
        
        self.connection_states[server_name] = ConnectionState.CONNECTING
        retry_count = 0
        
        while retry_count <= self.retry_config.max_retries:
            try:
                session = ClientSession(server_params)
                await session.initialize()
                
                self.clients[server_name] = session
                self.connection_states[server_name] = ConnectionState.CONNECTED
                self.retry_counts[server_name] = 0
                self.circuit_breakers[server_name] = False
                
                self.logger.info(f"Successfully connected to {server_name}")
                return True
                
            except Exception as e:
                retry_count += 1
                self.retry_counts[server_name] = retry_count
                
                if retry_count <= self.retry_config.max_retries:
                    delay = self.calculate_retry_delay(retry_count)
                    self.logger.warning(
                        f"Connection to {server_name} failed (attempt {retry_count}), "
                        f"retrying in {delay:.2f}s: {e}"
                    )
                    
                    self.connection_states[server_name] = ConnectionState.RECONNECTING
                    await asyncio.sleep(delay)
                else:
                    self.logger.error(f"Failed to connect to {server_name} after {retry_count} attempts: {e}")
                    self.connection_states[server_name] = ConnectionState.FAILED
                    self.circuit_breakers[server_name] = True
        
        return False
    
    def calculate_retry_delay(self, retry_count: int) -> float:
        """Calculate retry delay with exponential backoff and jitter"""
        
        delay = min(
            self.retry_config.base_delay * (self.retry_config.exponential_base ** (retry_count - 1)),
            self.retry_config.max_delay
        )
        
        if self.retry_config.jitter:
            import random
            delay *= (0.5 + random.random() * 0.5)  # Add 0-50% jitter
        
        return delay
    
    async def call_tool_with_circuit_breaker(self, server_name: str, tool_name: str, 
                                           arguments: Dict) -> Dict[str, Any]:
        """Call tool with circuit breaker pattern"""
        
        # Check circuit breaker
        if self.circuit_breakers.get(server_name, False):
            return {
                "success": False,
                "error": f"Circuit breaker open for {server_name}",
                "server_used": server_name
            }
        
        # Check connection state
        if self.connection_states.get(server_name) != ConnectionState.CONNECTED:
            return {
                "success": False,
                "error": f"Server {server_name} not connected",
                "server_used": server_name
            }
        
        try:
            session = self.clients[server_name]
            result = await session.call_tool(tool_name, arguments)
            
            # Reset circuit breaker on success
            self.circuit_breakers[server_name] = False
            
            return {
                "success": True,
                "result": result.content[0].text if result.content else "No result",
                "server_used": server_name
            }
            
        except Exception as e:
            self.logger.error(f"Tool call failed for {server_name}.{tool_name}: {e}")
            
            # Open circuit breaker on repeated failures
            failure_count = self.retry_counts.get(server_name, 0) + 1
            self.retry_counts[server_name] = failure_count
            
            if failure_count >= 3:  # Open circuit after 3 failures
                self.circuit_breakers[server_name] = True
                self.logger.warning(f"Circuit breaker opened for {server_name}")
            
            return {
                "success": False,
                "error": str(e),
                "server_used": server_name
            }
    
    async def health_check_and_recover(self):
        """Perform health checks and attempt recovery"""
        
        for server_name in list(self.clients.keys()):
            try:
                # Skip if circuit breaker is open
                if self.circuit_breakers.get(server_name, False):
                    continue
                
                session = self.clients[server_name]
                await session.ping()
                
                # Reset failure count on successful ping
                self.retry_counts[server_name] = 0
                
            except Exception as e:
                self.logger.warning(f"Health check failed for {server_name}: {e}")
                
                # Attempt reconnection
                await self.attempt_reconnection(server_name)
    
    async def attempt_reconnection(self, server_name: str):
        """Attempt to reconnect to a failed server"""
        
        if server_name not in self.server_configs:
            return
        
        self.logger.info(f"Attempting to reconnect to {server_name}")
        
        # Close existing connection
        if server_name in self.clients:
            try:
                await self.clients[server_name].close()
            except:
                pass
            del self.clients[server_name]
        
        # Attempt reconnection
        config = self.server_configs[server_name]
        success = await self.connect_with_retry(server_name, config.transport_params)
        
        if success:
            self.logger.info(f"Successfully reconnected to {server_name}")
        else:
            self.logger.error(f"Failed to reconnect to {server_name}")
```

Building robust MCP clients requires careful attention to connection management, error handling, and resilience patterns. These examples provide a solid foundation for integrating MCP into AI applications and building reliable tool ecosystems.