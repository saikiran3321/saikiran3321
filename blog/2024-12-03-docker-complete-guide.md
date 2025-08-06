---
slug: docker-complete-guide
title: Docker Complete Guide - From Basics to Production Deployment
authors: [saikiran]
tags: [docker, containerization, devops, deployment, microservices, kubernetes]
---

Docker has revolutionized how we develop, deploy, and manage applications. Whether you're a beginner trying to understand containerization or an experienced developer looking to optimize your Docker workflows, this comprehensive guide covers everything you need to know about Docker - from basic commands to production-ready deployments.

<!-- truncate -->

## Why Docker Matters in Modern Development

In today's fast-paced development environment, consistency across different stages of the software lifecycle is crucial. How many times have you heard "it works on my machine" only to find the application fails in production? Docker solves this fundamental problem by packaging applications with all their dependencies into portable containers.

I've been working with Docker for several years across various projects, from simple web applications to complex microservices architectures. In this guide, I'll share practical insights, real-world examples, and battle-tested patterns that will help you master Docker.

## Understanding Docker: Beyond the Basics

### What Makes Docker Different?

Docker isn't just another virtualization technology. It's a complete platform that changes how we think about application deployment:

**Traditional Deployment:**
```
Application → Server → OS → Hardware
```

**Docker Deployment:**
```
Application → Container → Docker Engine → OS → Hardware
```

The key difference? Containers share the host OS kernel, making them incredibly lightweight compared to virtual machines.

### The Docker Ecosystem

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Platform                          │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   Docker CLI    │    │  Docker Desktop │                │
│  │   (Commands)    │    │   (GUI Tool)    │                │
│  └─────────────────┘    └─────────────────┘                │
└─────────────────────────────────┬───────────────────────────┘
                                  │ Docker API
┌─────────────────────────────────┴───────────────────────────┐
│                  Docker Engine                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Container 1   │  │   Container 2   │  │ Container 3 │ │
│  │   (Web App)     │  │   (Database)    │  │   (Cache)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                     Host Operating System                   │
└─────────────────────────────────────────────────────────────┘
```

## Essential Docker Commands Every Developer Should Know

### Getting Started: Your First Container

```bash
# The classic "Hello World" of Docker
docker run hello-world

# Run an interactive Ubuntu container
docker run -it ubuntu:20.04 bash

# Run a web server in the background
docker run -d -p 8080:80 --name my-nginx nginx:alpine

# Check what's running
docker ps

# View all containers (including stopped)
docker ps -a
```

### Image Management: Building Your Toolkit

```bash
# Search for images on Docker Hub
docker search python

# Pull an image without running it
docker pull python:3.11-alpine

# List all local images
docker images

# Remove an image
docker rmi python:3.11-alpine

# Build an image from a Dockerfile
docker build -t my-python-app:1.0 .

# Tag an image for different environments
docker tag my-python-app:1.0 my-python-app:latest
docker tag my-python-app:1.0 registry.company.com/my-python-app:1.0
```

### Container Lifecycle Management

```bash
# Start a stopped container
docker start container-name

# Stop a running container gracefully
docker stop container-name

# Force stop a container
docker kill container-name

# Restart a container
docker restart container-name

# Remove a container
docker rm container-name

# Remove a running container (force)
docker rm -f container-name

# Remove all stopped containers
docker container prune
```

## Real-World Docker Implementations

### Web Application Development Stack

Let me show you how I typically set up a development environment for a full-stack application:

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  # Frontend (React/Vue/Angular)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - REACT_APP_API_URL=http://localhost:5000
    command: npm start
    depends_on:
      - backend

  # Backend API (Node.js/Python/Java)
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "5000:5000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=mongodb://mongo:27017/myapp_dev
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis
    command: npm run dev

  # Database
  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: myapp_dev
    volumes:
      - mongo_data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d

  # Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  # Database Admin Tool
  mongo-express:
    image: mongo-express:latest
    ports:
      - "8081:8081"
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: admin
      ME_CONFIG_MONGODB_ADMINPASSWORD: password
      ME_CONFIG_MONGODB_URL: mongodb://admin:password@mongo:27017/
    depends_on:
      - mongo

volumes:
  mongo_data:
  redis_data:

networks:
  default:
    name: myapp_dev_network
```

### Production-Ready Dockerfile

Here's how I structure Dockerfiles for production applications:

```dockerfile
# Multi-stage build for Node.js application
# Stage 1: Build dependencies and application
FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Run tests
RUN npm test

# Stage 2: Production runtime
FROM node:18-alpine AS production

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy additional files
COPY --chown=nextjs:nodejs ./scripts ./scripts

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/server.js"]
```

### Microservices Architecture with Docker

Here's a real-world microservices setup I've implemented:

```yaml
# docker-compose.microservices.yml
version: '3.8'

services:
  # API Gateway
  api-gateway:
    build: ./services/api-gateway
    ports:
      - "80:3000"
      - "443:3443"
    environment:
      - NODE_ENV=production
      - USER_SERVICE_URL=http://user-service:3000
      - ORDER_SERVICE_URL=http://order-service:3000
      - PRODUCT_SERVICE_URL=http://product-service:3000
    depends_on:
      - user-service
      - order-service
      - product-service
    networks:
      - microservices
    deploy:
      replicas: 2
      restart_policy:
        condition: on-failure

  # User Service
  user-service:
    build: ./services/user-service
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mongodb://mongo-users:27017/users
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo-users
      - redis
    networks:
      - microservices
    deploy:
      replicas: 3

  # Order Service
  order-service:
    build: ./services/order-service
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@postgres-orders:5432/orders
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on:
      - postgres-orders
      - rabbitmq
    networks:
      - microservices
    deploy:
      replicas: 2

  # Product Service
  product-service:
    build: ./services/product-service
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mongodb://mongo-products:27017/products
      - ELASTICSEARCH_URL=http://elasticsearch:9200
    depends_on:
      - mongo-products
      - elasticsearch
    networks:
      - microservices

  # Databases
  mongo-users:
    image: mongo:6.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongo_users_data:/data/db
    networks:
      - microservices

  mongo-products:
    image: mongo:6.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongo_products_data:/data/db
    networks:
      - microservices

  postgres-orders:
    image: postgres:14
    environment:
      POSTGRES_DB: orders
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_orders_data:/var/lib/postgresql/data
    networks:
      - microservices

  # Infrastructure Services
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - microservices

  rabbitmq:
    image: rabbitmq:3-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    networks:
      - microservices

  elasticsearch:
    image: elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - microservices

volumes:
  mongo_users_data:
  mongo_products_data:
  postgres_orders_data:
  redis_data:
  rabbitmq_data:
  elasticsearch_data:

networks:
  microservices:
    driver: bridge
```

## Advanced Docker Patterns and Techniques

### Multi-Stage Builds for Optimization

One of the most powerful Docker features is multi-stage builds. Here's how I use them to create optimized production images:

```dockerfile
# Advanced multi-stage build for Python application
# Stage 1: Build environment
FROM python:3.11-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    make \
    libffi-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Create virtual environment and install dependencies
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Test environment
FROM builder AS tester

# Copy source code
COPY . .

# Run tests
RUN python -m pytest tests/ -v

# Run security checks
RUN bandit -r src/

# Run linting
RUN flake8 src/

# Stage 3: Production environment
FROM python:3.11-slim AS production

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv

# Copy application code
WORKDIR /app
COPY --from=tester /app/src ./src
COPY --from=tester /app/config ./config

# Create non-root user
RUN useradd --create-home --shell /bin/bash app && \
    chown -R app:app /app

USER app

# Set environment
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONPATH="/app"

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "src.app:app"]
```

### Docker Networking in Practice

Understanding Docker networking is crucial for building complex applications:

```bash
# Create custom networks for different environments
docker network create --driver bridge frontend-network
docker network create --driver bridge backend-network
docker network create --driver bridge database-network

# Run containers in specific networks
docker run -d --name web-app --network frontend-network nginx
docker run -d --name api-server --network backend-network my-api:latest
docker run -d --name database --network database-network postgres:14

# Connect containers to multiple networks
docker network connect backend-network web-app
docker network connect database-network api-server

# Inspect network configuration
docker network inspect backend-network
```

### Advanced Volume Patterns

```bash
# Named volumes for persistent data
docker volume create postgres-data
docker volume create redis-data
docker volume create uploads

# Bind mounts for development
docker run -v $(pwd):/app -v /app/node_modules my-dev-app

# tmpfs mounts for temporary data
docker run --tmpfs /tmp my-app

# Volume drivers for cloud storage
docker volume create --driver rexray/ebs my-ebs-volume
```

## Production Deployment Strategies

### Blue-Green Deployment with Docker

Here's how I implement blue-green deployments using Docker:

```bash
#!/bin/bash
# blue-green-deploy.sh

set -e

APP_NAME="myapp"
NEW_VERSION=$1
HEALTH_CHECK_URL="http://localhost:8080/health"

if [ -z "$NEW_VERSION" ]; then
    echo "Usage: $0 <version>"
    exit 1
fi

# Determine current and new environments
CURRENT_ENV=$(docker ps --filter "label=app=$APP_NAME" --filter "label=active=true" --format "{{.Label \"env\"}}")

if [ "$CURRENT_ENV" = "blue" ]; then
    NEW_ENV="green"
    NEW_PORT="8081"
    CURRENT_PORT="8080"
else
    NEW_ENV="blue"
    NEW_PORT="8080"
    CURRENT_PORT="8081"
fi

echo "Deploying $APP_NAME:$NEW_VERSION to $NEW_ENV environment"

# Build new image
docker build -t $APP_NAME:$NEW_VERSION .

# Start new environment
docker run -d \
    --name ${APP_NAME}-${NEW_ENV} \
    --label app=$APP_NAME \
    --label env=$NEW_ENV \
    --label version=$NEW_VERSION \
    --label active=false \
    -p $NEW_PORT:3000 \
    $APP_NAME:$NEW_VERSION

# Wait for application to start
echo "Waiting for application to start..."
sleep 30

# Health check
for i in {1..10}; do
    if curl -f $HEALTH_CHECK_URL:$NEW_PORT/health; then
        echo "Health check passed"
        break
    fi
    
    if [ $i -eq 10 ]; then
        echo "Health check failed, rolling back"
        docker stop ${APP_NAME}-${NEW_ENV}
        docker rm ${APP_NAME}-${NEW_ENV}
        exit 1
    fi
    
    echo "Health check attempt $i failed, retrying..."
    sleep 10
done

# Switch traffic (update load balancer or reverse proxy)
echo "Switching traffic to $NEW_ENV environment"

# Update nginx configuration or load balancer
# This would typically involve updating a configuration file
# and reloading the load balancer

# Mark new environment as active
docker update --label-add active=true ${APP_NAME}-${NEW_ENV}

# Stop old environment
if [ "$CURRENT_ENV" != "" ]; then
    echo "Stopping $CURRENT_ENV environment"
    docker update --label-add active=false ${APP_NAME}-${CURRENT_ENV}
    docker stop ${APP_NAME}-${CURRENT_ENV}
    docker rm ${APP_NAME}-${CURRENT_ENV}
fi

echo "Deployment completed successfully"
```

### Container Orchestration with Docker Swarm

For production deployments, I often use Docker Swarm for orchestration:

```bash
# Initialize Docker Swarm
docker swarm init --advertise-addr $(hostname -i)

# Join worker nodes
docker swarm join --token SWMTKN-1-... manager-ip:2377

# Deploy a stack
docker stack deploy -c docker-stack.yml myapp

# Monitor deployment
docker service ls
docker service ps myapp_web
```

```yaml
# docker-stack.yml for production
version: '3.8'

services:
  web:
    image: myapp:${VERSION:-latest}
    ports:
      - "80:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL_FILE=/run/secrets/db_url
    secrets:
      - db_url
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      placement:
        constraints:
          - node.role == worker
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - app-network

  database:
    image: postgres:14
    environment:
      POSTGRES_DB_FILE: /run/secrets/db_name
      POSTGRES_USER_FILE: /run/secrets/db_user
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_name
      - db_user
      - db_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    deploy:
      placement:
        constraints:
          - node.role == manager
    networks:
      - app-network

secrets:
  db_url:
    external: true
  db_name:
    external: true
  db_user:
    external: true
  db_password:
    external: true

volumes:
  postgres_data:

networks:
  app-network:
    driver: overlay
    attachable: true
```

## Docker Security Best Practices

### Secure Container Configuration

Security should be built into every layer of your Docker implementation:

```dockerfile
# Security-hardened Dockerfile
FROM node:18-alpine

# Install security updates
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Create non-root user early
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# Copy and install dependencies as root
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code
COPY . .

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

# Remove unnecessary packages and files
RUN apk del --purge && \
    rm -rf /tmp/* /var/tmp/* /root/.npm

# Switch to non-root user
USER appuser

# Set security labels
LABEL security.scan="enabled" \
      security.policy="restricted" \
      maintainer="your-email@example.com"

# Expose specific port only
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "server.js"]
```

### Runtime Security

```bash
# Run container with security options
docker run -d \
  --name secure-app \
  --security-opt=no-new-privileges:true \
  --cap-drop=ALL \
  --cap-add=NET_BIND_SERVICE \
  --read-only \
  --tmpfs /tmp \
  --tmpfs /var/run \
  --user 1001:1001 \
  --memory=512m \
  --cpus=1.0 \
  --pids-limit=100 \
  myapp:latest

# Scan image for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image myapp:latest

# Run with AppArmor profile
docker run --security-opt apparmor:docker-default myapp:latest

# Run with custom seccomp profile
docker run --security-opt seccomp:./seccomp-profile.json myapp:latest
```

## Performance Optimization and Monitoring

### Container Performance Monitoring

```bash
# Real-time container statistics
docker stats

# Detailed container information
docker inspect container_name | jq '.[0].State'

# Container resource usage
docker exec container_name cat /sys/fs/cgroup/memory/memory.usage_in_bytes

# Network statistics
docker exec container_name cat /proc/net/dev

# Process information
docker exec container_name ps aux

# Disk usage
docker exec container_name df -h
```

### Performance Optimization Techniques

```dockerfile
# Optimized Dockerfile for performance
FROM node:18-alpine

# Use package manager cache
RUN apk add --no-cache --virtual .build-deps \
    python3 \
    make \
    g++ \
    && npm install -g npm@latest

WORKDIR /app

# Copy package files first (better layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Remove build dependencies
RUN apk del .build-deps

# Optimize for production
ENV NODE_ENV=production

# Use specific user
USER node

# Start with optimized settings
CMD ["node", "--max-old-space-size=512", "server.js"]
```

### Monitoring Stack with Docker

```yaml
# monitoring-stack.yml
version: '3.8'

services:
  # Application
  app:
    image: myapp:latest
    labels:
      - "prometheus.io/scrape=true"
      - "prometheus.io/port=3000"
      - "prometheus.io/path=/metrics"
    networks:
      - monitoring

  # Prometheus (metrics collection)
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    networks:
      - monitoring

  # Grafana (visualization)
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./grafana/datasources:/etc/grafana/provisioning/datasources
    networks:
      - monitoring

  # Loki (log aggregation)
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - loki_data:/loki
      - ./loki.yml:/etc/loki/local-config.yaml
    command: -config.file=/etc/loki/local-config.yaml
    networks:
      - monitoring

  # Promtail (log collection)
  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - ./promtail.yml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml
    networks:
      - monitoring

  # Node Exporter (system metrics)
  node-exporter:
    image: prom/node-exporter:latest
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    networks:
      - monitoring

  # cAdvisor (container metrics)
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    privileged: true
    devices:
      - /dev/kmsg
    networks:
      - monitoring

volumes:
  prometheus_data:
  grafana_data:
  loki_data:

networks:
  monitoring:
    driver: bridge
```

## Troubleshooting and Debugging

### Common Issues and Solutions

#### Container Won't Start
```bash
# Check container logs
docker logs container_name

# Run container interactively to debug
docker run --rm -it --entrypoint sh image_name

# Check if port is already in use
netstat -tulpn | grep :8080

# Verify image exists
docker images | grep myapp

# Check Dockerfile syntax
docker build --no-cache -t test-build .
```

#### Performance Issues
```bash
# Monitor resource usage
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

# Check container limits
docker inspect container_name | jq '.[0].HostConfig.Memory'

# Analyze image layers
docker history --no-trunc image_name

# Check for memory leaks
docker exec container_name cat /proc/meminfo
```

#### Networking Problems
```bash
# Test container connectivity
docker exec container1 ping container2

# Check DNS resolution
docker exec container_name nslookup google.com

# Inspect network configuration
docker network inspect bridge

# Test port connectivity
docker exec container_name telnet target_host 80

# Check iptables rules
sudo iptables -L DOCKER
```

### Debugging Tools and Techniques

```bash
# Use debugging containers
docker run --rm -it --pid container:target_container nicolaka/netshoot

# Debug with privileged access
docker run --rm -it --privileged --pid host alpine

# Attach to running container
docker attach container_name

# Copy files for analysis
docker cp container_name:/var/log/app.log ./debug/

# Export container filesystem
docker export container_name > container_filesystem.tar

# Analyze container changes
docker diff container_name
```

## Docker in CI/CD Pipelines

### GitLab CI/CD with Docker

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - security
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"

services:
  - docker:20.10.16-dind

before_script:
  - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY

build:
  stage: build
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

test:
  stage: test
  script:
    - docker run --rm $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA npm test
    - docker run --rm $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA npm run lint

security_scan:
  stage: security
  script:
    - docker run --rm -v /var/run/docker.sock:/var/run/docker.sock 
      aquasec/trivy image $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

deploy_staging:
  stage: deploy
  script:
    - docker tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE:staging
    - docker push $CI_REGISTRY_IMAGE:staging
    - ssh staging-server "docker-compose pull && docker-compose up -d"
  only:
    - develop

deploy_production:
  stage: deploy
  script:
    - docker tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE:latest
    - docker push $CI_REGISTRY_IMAGE:latest
    - ssh production-server "docker-compose pull && docker-compose up -d"
  only:
    - main
  when: manual
```

### GitHub Actions with Docker

```yaml
# .github/workflows/docker.yml
name: Docker Build and Deploy

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
    - name: Checkout repository
      uses: actions/checkout@v3

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Log in to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha

    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: .
        platforms: linux/amd64,linux/arm64
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

    - name: Run tests
      run: |
        docker run --rm ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} npm test

    - name: Security scan
      run: |
        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
          aquasec/trivy image ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}

  deploy:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to production
      run: |
        # Deploy using your preferred method
        # SSH, Kubernetes, Docker Swarm, etc.
        echo "Deploying to production..."
```

## Advanced Docker Patterns

### Health Checks and Self-Healing

```dockerfile
# Advanced health check implementation
FROM nginx:alpine

# Copy custom health check script
COPY healthcheck.sh /usr/local/bin/healthcheck.sh
RUN chmod +x /usr/local/bin/healthcheck.sh

# Comprehensive health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD /usr/local/bin/healthcheck.sh
```

```bash
#!/bin/bash
# healthcheck.sh

# Check if main process is running
if ! pgrep nginx > /dev/null; then
    echo "Nginx process not found"
    exit 1
fi

# Check if port is listening
if ! netstat -tuln | grep :80 > /dev/null; then
    echo "Port 80 not listening"
    exit 1
fi

# Check HTTP response
if ! curl -f http://localhost:80/health > /dev/null 2>&1; then
    echo "Health endpoint not responding"
    exit 1
fi

# Check disk space
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    echo "Disk usage too high: ${DISK_USAGE}%"
    exit 1
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ $MEMORY_USAGE -gt 90 ]; then
    echo "Memory usage too high: ${MEMORY_USAGE}%"
    exit 1
fi

echo "All health checks passed"
exit 0
```

### Container Lifecycle Hooks

```yaml
# docker-compose with lifecycle hooks
version: '3.8'

services:
  app:
    image: myapp:latest
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
        window: 120s
    depends_on:
      database:
        condition: service_healthy

  database:
    image: postgres:14
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
```

## Docker Ecosystem Tools

### Essential Docker Tools

#### Docker Compose Extensions
```bash
# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.12.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Useful Compose commands
docker-compose config --services
docker-compose top
docker-compose port web 3000
docker-compose exec web env
```

#### Container Management Tools
```bash
# Portainer (Docker GUI)
docker run -d -p 9000:9000 --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce

# Watchtower (automatic updates)
docker run -d \
  --name watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower

# Dive (image analysis)
docker run --rm -it \
  -v /var/run/docker.sock:/var/run/docker.sock \
  wagoodman/dive:latest myapp:latest
```

## Migration to Kubernetes

### From Docker Compose to Kubernetes

```yaml
# Kubernetes deployment equivalent
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
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
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
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  selector:
    app: myapp
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

## Conclusion

Docker has fundamentally changed how we build, ship, and run applications. From simple development environments to complex production deployments, Docker provides the tools and patterns needed for modern software delivery.

**Key Takeaways:**

1. **Start Simple**: Begin with basic containers and gradually adopt advanced patterns
2. **Security First**: Implement security best practices from day one
3. **Optimize for Production**: Use multi-stage builds, health checks, and proper resource limits
4. **Monitor Everything**: Implement comprehensive monitoring and logging
5. **Automate Deployment**: Use CI/CD pipelines for consistent deployments
6. **Plan for Scale**: Design your Docker architecture to handle growth

**Next Steps:**

- Practice with the examples provided
- Implement Docker in your current projects
- Explore container orchestration with Kubernetes
- Learn about service mesh technologies
- Contribute to open-source Docker projects

Docker is more than just a tool—it's a paradigm shift that enables modern DevOps practices. Master these concepts and commands, and you'll be well-equipped to build and deploy applications that are portable, scalable, and maintainable.

Whether you're containerizing your first application or optimizing a complex microservices architecture, Docker provides the foundation for reliable, efficient software delivery. The investment in learning Docker pays dividends in improved development velocity, deployment consistency, and operational reliability.

Remember: the best Docker implementation is one that solves your specific problems while maintaining simplicity and security. Start with your requirements, apply these patterns thoughtfully, and iterate based on real-world feedback.