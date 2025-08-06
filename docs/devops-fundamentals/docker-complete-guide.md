---
sidebar_position: 1
---

# Docker Complete Guide - Commands and Use Cases

Docker is a containerization platform that allows developers to package applications and their dependencies into lightweight, portable containers. This comprehensive guide covers Docker fundamentals, essential commands, and real-world use cases.

## What is Docker?

Docker is a platform that uses OS-level virtualization to deliver software in packages called containers. Containers are isolated from one another and bundle their own software, libraries, and configuration files.

### Key Concepts

#### Containers vs Virtual Machines
- **Containers**: Share the host OS kernel, lightweight, fast startup
- **Virtual Machines**: Include full OS, heavier, slower startup
- **Resource Usage**: Containers use fewer resources than VMs
- **Isolation**: Both provide isolation, but containers are more efficient

#### Docker Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Client                            │
│                   (docker CLI)                             │
└─────────────────────┬───────────────────────────────────────┘
                      │ Docker API
┌─────────────────────┴───────────────────────────────────────┐
│                  Docker Daemon                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Container  │  │  Container  │  │  Container  │        │
│  │     App1    │  │     App2    │  │     App3    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                     Host OS                                 │
└─────────────────────────────────────────────────────────────┘
```

## Docker Installation and Setup

### Installation Commands

#### Ubuntu/Debian
```bash
# Update package index
sudo apt-get update

# Install required packages
sudo apt-get install apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io

# Add user to docker group (optional)
sudo usermod -aG docker $USER
```

#### CentOS/RHEL
```bash
# Install required packages
sudo yum install -y yum-utils

# Add Docker repository
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Install Docker Engine
sudo yum install docker-ce docker-ce-cli containerd.io

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker
```

#### macOS
```bash
# Using Homebrew
brew install --cask docker

# Or download Docker Desktop from docker.com
```

#### Windows
```powershell
# Using Chocolatey
choco install docker-desktop

# Or download Docker Desktop from docker.com
```

### Post-Installation Setup

```bash
# Verify installation
docker --version
docker info

# Test Docker installation
docker run hello-world

# Configure Docker daemon (optional)
sudo systemctl enable docker
sudo systemctl start docker
```

## Essential Docker Commands

### Image Management Commands

#### Pulling Images
```bash
# Pull latest image
docker pull nginx

# Pull specific version
docker pull nginx:1.21

# Pull from specific registry
docker pull registry.example.com/myapp:latest

# Pull all tags of an image
docker pull --all-tags nginx
```

#### Listing Images
```bash
# List all images
docker images

# List images with specific format
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# List image IDs only
docker images -q

# List dangling images
docker images --filter "dangling=true"
```

#### Building Images
```bash
# Build image from Dockerfile
docker build -t myapp:latest .

# Build with specific Dockerfile
docker build -f Dockerfile.prod -t myapp:prod .

# Build with build arguments
docker build --build-arg NODE_ENV=production -t myapp:prod .

# Build without cache
docker build --no-cache -t myapp:latest .

# Build with target stage (multi-stage builds)
docker build --target production -t myapp:prod .
```

#### Managing Images
```bash
# Tag an image
docker tag myapp:latest myapp:v1.0

# Remove image
docker rmi myapp:latest

# Remove multiple images
docker rmi $(docker images -q)

# Remove dangling images
docker image prune

# Remove all unused images
docker image prune -a

# Save image to tar file
docker save -o myapp.tar myapp:latest

# Load image from tar file
docker load -i myapp.tar
```

### Container Management Commands

#### Running Containers
```bash
# Run container in foreground
docker run nginx

# Run container in background (detached)
docker run -d nginx

# Run with custom name
docker run --name my-nginx -d nginx

# Run with port mapping
docker run -p 8080:80 -d nginx

# Run with environment variables
docker run -e NODE_ENV=production -d myapp

# Run with volume mount
docker run -v /host/path:/container/path -d myapp

# Run with interactive terminal
docker run -it ubuntu bash

# Run with automatic removal after exit
docker run --rm -it ubuntu bash

# Run with resource limits
docker run --memory=512m --cpus=1.5 -d myapp

# Run with restart policy
docker run --restart=always -d nginx
```

#### Container Lifecycle
```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Start stopped container
docker start container_name

# Stop running container
docker stop container_name

# Restart container
docker restart container_name

# Pause container
docker pause container_name

# Unpause container
docker unpause container_name

# Kill container (force stop)
docker kill container_name

# Remove container
docker rm container_name

# Remove running container (force)
docker rm -f container_name
```

#### Container Interaction
```bash
# Execute command in running container
docker exec -it container_name bash

# Execute single command
docker exec container_name ls -la

# Copy files from container to host
docker cp container_name:/path/to/file /host/path

# Copy files from host to container
docker cp /host/path container_name:/path/to/destination

# View container logs
docker logs container_name

# Follow logs in real-time
docker logs -f container_name

# View last 100 lines of logs
docker logs --tail 100 container_name

# View logs with timestamps
docker logs -t container_name
```

#### Container Information
```bash
# Inspect container details
docker inspect container_name

# View container processes
docker top container_name

# View container resource usage
docker stats container_name

# View container port mappings
docker port container_name

# View container filesystem changes
docker diff container_name
```

### Network Management

#### Network Commands
```bash
# List networks
docker network ls

# Create network
docker network create mynetwork

# Create network with specific driver
docker network create --driver bridge mynetwork

# Create network with subnet
docker network create --subnet=172.20.0.0/16 mynetwork

# Inspect network
docker network inspect mynetwork

# Connect container to network
docker network connect mynetwork container_name

# Disconnect container from network
docker network disconnect mynetwork container_name

# Remove network
docker network rm mynetwork

# Remove unused networks
docker network prune
```

#### Network Types
```bash
# Bridge network (default)
docker run --network bridge -d nginx

# Host network (use host networking)
docker run --network host -d nginx

# None network (no networking)
docker run --network none -d nginx

# Custom network
docker run --network mynetwork -d nginx
```

### Volume Management

#### Volume Commands
```bash
# List volumes
docker volume ls

# Create volume
docker volume create myvolume

# Inspect volume
docker volume inspect myvolume

# Remove volume
docker volume rm myvolume

# Remove unused volumes
docker volume prune

# Remove all volumes
docker volume prune -a
```

#### Volume Usage
```bash
# Named volume
docker run -v myvolume:/data -d nginx

# Bind mount
docker run -v /host/path:/container/path -d nginx

# Anonymous volume
docker run -v /container/path -d nginx

# Read-only volume
docker run -v myvolume:/data:ro -d nginx

# Volume with specific driver
docker volume create --driver local myvolume
```

## Dockerfile Best Practices

### Basic Dockerfile Structure

```dockerfile
# Use official base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]
```

### Multi-Stage Build Example

```dockerfile
# Multi-stage build for Node.js application
# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["node", "dist/server.js"]
```

### Python Application Dockerfile

```dockerfile
# Python application with best practices
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy requirements first (for better caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app && \
    chown -R app:app /app

USER app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python healthcheck.py

# Start application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]
```

## Docker Compose

### Basic Docker Compose File

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mongodb://mongo:27017/myapp
    depends_on:
      - mongo
      - redis
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    networks:
      - app-network

  mongo:
    image: mongo:6.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongo-data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d
    ports:
      - "27017:27017"
    restart: unless-stopped
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - web
    restart: unless-stopped
    networks:
      - app-network

volumes:
  mongo-data:
  redis-data:

networks:
  app-network:
    driver: bridge
```

### Docker Compose Commands

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Build and start
docker-compose up --build

# Start specific service
docker-compose up web

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View running services
docker-compose ps

# View logs
docker-compose logs

# Follow logs for specific service
docker-compose logs -f web

# Execute command in service
docker-compose exec web bash

# Scale service
docker-compose up --scale web=3

# Restart service
docker-compose restart web

# Pull latest images
docker-compose pull

# Validate compose file
docker-compose config
```

## Advanced Docker Commands

### Container Debugging

```bash
# Debug container startup issues
docker run --rm -it myapp:latest sh

# Debug with different entrypoint
docker run --rm -it --entrypoint sh myapp:latest

# Debug networking
docker run --rm -it --network container:target_container nicolaka/netshoot

# Debug with privileged access
docker run --rm -it --privileged myapp:latest

# Debug filesystem
docker run --rm -it -v /:/host alpine chroot /host
```

### Performance Monitoring

```bash
# Monitor container resources
docker stats

# Monitor specific container
docker stats container_name

# Get container resource usage
docker exec container_name cat /sys/fs/cgroup/memory/memory.usage_in_bytes

# Monitor container events
docker events

# Monitor specific container events
docker events --filter container=container_name

# System-wide Docker information
docker system df

# Detailed system information
docker system info
```

### Registry Operations

```bash
# Login to registry
docker login registry.example.com

# Tag image for registry
docker tag myapp:latest registry.example.com/myapp:latest

# Push image to registry
docker push registry.example.com/myapp:latest

# Pull from private registry
docker pull registry.example.com/myapp:latest

# Search Docker Hub
docker search nginx

# Logout from registry
docker logout registry.example.com
```

## Real-World Use Cases

### Development Environment Setup

```bash
# Development environment with hot reload
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    command: npm run dev

  database:
    image: postgres:14
    environment:
      POSTGRES_DB: myapp_dev
      POSTGRES_USER: developer
      POSTGRES_PASSWORD: devpass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Production Deployment

```dockerfile
# Production Dockerfile with security
FROM node:18-alpine AS base

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy package files
COPY --chown=nextjs:nodejs package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY --chown=nextjs:nodejs . .

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["node", "server.js"]
```

### Microservices Architecture

```yaml
# Microservices with Docker Compose
version: '3.8'

services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "80:3000"
    environment:
      - USER_SERVICE_URL=http://user-service:3000
      - ORDER_SERVICE_URL=http://order-service:3000
    depends_on:
      - user-service
      - order-service
    networks:
      - microservices

  user-service:
    build: ./user-service
    environment:
      - DATABASE_URL=mongodb://mongo:27017/users
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis
    networks:
      - microservices

  order-service:
    build: ./order-service
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/orders
    depends_on:
      - postgres
    networks:
      - microservices

  mongo:
    image: mongo:6.0
    volumes:
      - mongo-data:/data/db
    networks:
      - microservices

  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: orders
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - microservices

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    networks:
      - microservices

volumes:
  mongo-data:
  postgres-data:
  redis-data:

networks:
  microservices:
    driver: bridge
```

### CI/CD Pipeline Integration

```bash
# Build script for CI/CD
#!/bin/bash

# Build application
docker build -t myapp:$BUILD_NUMBER .

# Run tests in container
docker run --rm myapp:$BUILD_NUMBER npm test

# Security scan
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image myapp:$BUILD_NUMBER

# Push to registry
docker tag myapp:$BUILD_NUMBER registry.example.com/myapp:$BUILD_NUMBER
docker push registry.example.com/myapp:$BUILD_NUMBER

# Deploy to staging
docker-compose -f docker-compose.staging.yml up -d

# Run integration tests
docker run --rm --network staging_default test-runner:latest

# Deploy to production (if tests pass)
if [ $? -eq 0 ]; then
  docker-compose -f docker-compose.prod.yml up -d
fi
```

## Docker Security Best Practices

### Secure Dockerfile Practices

```dockerfile
# Security-focused Dockerfile
FROM node:18-alpine

# Install security updates
RUN apk update && apk upgrade

# Create non-root user early
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Set working directory
WORKDIR /app

# Copy and install dependencies as root
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code
COPY . .

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Remove unnecessary packages
RUN apk del --purge

# Set security labels
LABEL security.scan="enabled" \
      security.policy="restricted"

# Use specific port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start application
CMD ["node", "server.js"]
```

### Container Security Commands

```bash
# Run container with security options
docker run --security-opt=no-new-privileges:true \
           --cap-drop=ALL \
           --cap-add=NET_BIND_SERVICE \
           --read-only \
           --tmpfs /tmp \
           -d myapp

# Scan image for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image myapp:latest

# Run with AppArmor profile
docker run --security-opt apparmor:docker-default -d myapp

# Run with SELinux labels
docker run --security-opt label:type:container_runtime_t -d myapp

# Limit resources
docker run --memory=512m \
           --cpus=1.0 \
           --pids-limit=100 \
           -d myapp
```

## Docker System Management

### System Cleanup

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune

# Remove everything unused
docker system prune

# Remove everything including volumes
docker system prune -a --volumes

# Show disk usage
docker system df

# Show detailed disk usage
docker system df -v
```

### Docker Daemon Configuration

```json
// /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "storage-opts": [
    "overlay2.override_kernel_check=true"
  ],
  "default-runtime": "runc",
  "runtimes": {
    "nvidia": {
      "path": "nvidia-container-runtime",
      "runtimeArgs": []
    }
  },
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  },
  "dns": ["8.8.8.8", "8.8.4.4"],
  "registry-mirrors": ["https://mirror.example.com"],
  "insecure-registries": ["registry.local:5000"],
  "max-concurrent-downloads": 3,
  "max-concurrent-uploads": 5
}
```

## Troubleshooting Common Issues

### Container Debugging

```bash
# Debug container that won't start
docker run --rm -it --entrypoint sh myapp:latest

# Check container logs
docker logs --details container_name

# Inspect container configuration
docker inspect container_name | jq '.[0].Config'

# Check container processes
docker exec container_name ps aux

# Check container network
docker exec container_name netstat -tulpn

# Check container filesystem
docker exec container_name df -h

# Debug networking issues
docker run --rm -it --network container:target_container nicolaka/netshoot
```

### Performance Optimization

```bash
# Monitor container performance
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

# Limit container resources
docker run --memory=1g --cpus=2 --memory-swap=2g myapp

# Use multi-stage builds to reduce image size
# Use .dockerignore to exclude unnecessary files
# Use specific base image tags, not 'latest'
# Combine RUN commands to reduce layers
```

### Image Optimization

```dockerfile
# Optimized Dockerfile example
FROM node:18-alpine

# Use .dockerignore
# .git
# node_modules
# npm-debug.log
# Dockerfile
# .dockerignore

# Combine RUN commands
RUN apk update && apk upgrade && \
    apk add --no-cache curl && \
    rm -rf /var/cache/apk/*

# Use specific versions
FROM node:18.17.0-alpine

# Multi-stage build
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
CMD ["node", "server.js"]
```

## Docker in Production

### Production Deployment Strategies

#### Blue-Green Deployment
```bash
#!/bin/bash
# Blue-green deployment script

CURRENT_COLOR=$(docker ps --filter "label=app=myapp" --filter "label=active=true" --format "{{.Label \"color\"}}")
NEW_COLOR="blue"

if [ "$CURRENT_COLOR" = "blue" ]; then
    NEW_COLOR="green"
fi

echo "Deploying to $NEW_COLOR environment"

# Deploy new version
docker-compose -f docker-compose.$NEW_COLOR.yml up -d

# Health check
sleep 30
HEALTH_CHECK=$(curl -f http://localhost:8080/health)

if [ $? -eq 0 ]; then
    echo "Health check passed, switching traffic"
    
    # Update load balancer
    docker exec nginx nginx -s reload
    
    # Stop old environment
    if [ "$CURRENT_COLOR" != "" ]; then
        docker-compose -f docker-compose.$CURRENT_COLOR.yml down
    fi
    
    echo "Deployment successful"
else
    echo "Health check failed, rolling back"
    docker-compose -f docker-compose.$NEW_COLOR.yml down
    exit 1
fi
```

#### Rolling Updates
```bash
# Rolling update script
#!/bin/bash

SERVICE_NAME="myapp_web"
NEW_IMAGE="myapp:$BUILD_NUMBER"

# Get current replicas
REPLICAS=$(docker service inspect $SERVICE_NAME --format "{{.Spec.Replicas}}")

# Update service with rolling update
docker service update \
    --image $NEW_IMAGE \
    --update-parallelism 1 \
    --update-delay 30s \
    --update-failure-action rollback \
    --rollback-parallelism 1 \
    --rollback-delay 30s \
    $SERVICE_NAME

# Monitor update progress
docker service ps $SERVICE_NAME
```

### Monitoring and Logging

```yaml
# Monitoring stack with Docker Compose
version: '3.8'

services:
  app:
    image: myapp:latest
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    labels:
      - "prometheus.io/scrape=true"
      - "prometheus.io/port=3000"

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana

  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - loki-data:/loki

  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - ./promtail.yml:/etc/promtail/config.yml

volumes:
  prometheus-data:
  grafana-data:
  loki-data:
```

## Docker Swarm (Orchestration)

### Swarm Setup

```bash
# Initialize swarm
docker swarm init

# Join worker node
docker swarm join --token SWMTKN-1-... manager-ip:2377

# List nodes
docker node ls

# Promote node to manager
docker node promote worker-node

# Remove node from swarm
docker node rm worker-node

# Leave swarm
docker swarm leave --force
```

### Service Management

```bash
# Create service
docker service create --name web --replicas 3 -p 80:80 nginx

# List services
docker service ls

# Inspect service
docker service inspect web

# Scale service
docker service scale web=5

# Update service
docker service update --image nginx:1.21 web

# Remove service
docker service rm web

# View service logs
docker service logs web

# List service tasks
docker service ps web
```

### Stack Deployment

```yaml
# docker-stack.yml
version: '3.8'

services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      placement:
        constraints:
          - node.role == worker

  api:
    image: myapp:latest
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M

networks:
  default:
    driver: overlay
    attachable: true
```

```bash
# Deploy stack
docker stack deploy -c docker-stack.yml mystack

# List stacks
docker stack ls

# List stack services
docker stack services mystack

# Remove stack
docker stack rm mystack
```

## Docker Best Practices

### Development Best Practices

1. **Use .dockerignore**
```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.nyc_output
```

2. **Multi-stage builds** for smaller production images
3. **Layer caching** by copying dependencies first
4. **Non-root users** for security
5. **Health checks** for container monitoring
6. **Specific image tags** instead of 'latest'

### Production Best Practices

1. **Resource limits** to prevent resource exhaustion
2. **Restart policies** for automatic recovery
3. **Logging configuration** for centralized logging
4. **Security scanning** for vulnerability detection
5. **Regular updates** for base images and dependencies
6. **Backup strategies** for persistent data
7. **Monitoring and alerting** for container health

### Security Best Practices

```bash
# Security checklist commands

# 1. Use official base images
FROM node:18-alpine  # Official Node.js image

# 2. Keep images updated
docker pull node:18-alpine

# 3. Scan for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image myapp:latest

# 4. Use non-root users
USER 1001

# 5. Limit capabilities
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE myapp

# 6. Use read-only filesystem
docker run --read-only --tmpfs /tmp myapp

# 7. Set resource limits
docker run --memory=512m --cpus=1.0 myapp

# 8. Use secrets management
docker secret create db_password password.txt
docker service create --secret db_password myapp
```

## Troubleshooting Guide

### Common Issues and Solutions

#### Container Won't Start
```bash
# Check container logs
docker logs container_name

# Run with interactive shell
docker run --rm -it --entrypoint sh image_name

# Check image layers
docker history image_name

# Verify Dockerfile syntax
docker build --no-cache -t test .
```

#### Networking Issues
```bash
# List networks
docker network ls

# Inspect network
docker network inspect bridge

# Test connectivity
docker run --rm -it --network container:target nicolaka/netshoot

# Check port bindings
docker port container_name

# Test DNS resolution
docker exec container_name nslookup google.com
```

#### Performance Issues
```bash
# Monitor resource usage
docker stats

# Check container limits
docker inspect container_name | grep -i memory

# Analyze image size
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Check for memory leaks
docker exec container_name cat /proc/meminfo
```

#### Storage Issues
```bash
# Check disk usage
docker system df

# Clean up unused resources
docker system prune -a

# Check volume usage
docker volume ls

# Inspect volume
docker volume inspect volume_name

# Check container filesystem
docker exec container_name df -h
```

This comprehensive Docker guide covers everything from basic commands to advanced production deployment strategies, providing practical examples and best practices for containerization in modern development workflows.