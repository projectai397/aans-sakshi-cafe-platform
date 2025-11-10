#!/bin/bash

###############################################################################
# Sakshi Cafe Production Deployment Script
# Complete automated deployment to production server
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_USER="deploy"
DEPLOY_HOST="${DEPLOY_HOST:-your-production-server.com}"
DEPLOY_PATH="/app/sakshi-cafe"
DOCKER_REGISTRY="your-docker-registry"
APP_NAME="sakshi-cafe"
BACKUP_DIR="/backups"

echo -e "${YELLOW}🚀 Starting Sakshi Cafe Production Deployment${NC}"
echo "=========================================="

# Step 1: Pre-deployment checks
echo -e "${YELLOW}Step 1: Pre-deployment checks${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"

# Step 2: Build Docker image
echo -e "${YELLOW}Step 2: Building Docker image${NC}"

docker build -t ${DOCKER_REGISTRY}/${APP_NAME}:latest .
docker build -t ${DOCKER_REGISTRY}/${APP_NAME}:$(date +%Y%m%d_%H%M%S) .

echo -e "${GREEN}✅ Docker image built successfully${NC}"

# Step 3: Push to registry
echo -e "${YELLOW}Step 3: Pushing image to Docker registry${NC}"

docker push ${DOCKER_REGISTRY}/${APP_NAME}:latest
docker push ${DOCKER_REGISTRY}/${APP_NAME}:$(date +%Y%m%d_%H%M%S)

echo -e "${GREEN}✅ Image pushed to registry${NC}"

# Step 4: SSH into production server and deploy
echo -e "${YELLOW}Step 4: Deploying to production server${NC}"

ssh ${DEPLOY_USER}@${DEPLOY_HOST} << 'EOF'
set -e

echo "🔄 Pulling latest code..."
cd /app/sakshi-cafe
git pull origin main

echo "🔄 Creating backup..."
mkdir -p /backups/$(date +%Y%m%d)
docker-compose exec -T db pg_dump sakshi_cafe_prod | gzip > /backups/$(date +%Y%m%d)/backup_$(date +%H%M%S).sql.gz

echo "🔄 Pulling latest Docker image..."
docker-compose pull

echo "🔄 Stopping current containers..."
docker-compose down

echo "🔄 Starting new containers..."
docker-compose up -d

echo "🔄 Running database migrations..."
docker-compose exec -T app pnpm db:push

echo "🔄 Running health checks..."
for i in {1..30}; do
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        echo "✅ Health check passed"
        exit 0
    fi
    echo "⏳ Waiting for service... ($i/30)"
    sleep 2
done

echo "❌ Health check failed"
exit 1
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful${NC}"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

# Step 5: Verify deployment
echo -e "${YELLOW}Step 5: Verifying deployment${NC}"

HEALTH_CHECK=$(curl -s https://api.sakshicafe.com/health | grep -c "ok" || true)

if [ $HEALTH_CHECK -gt 0 ]; then
    echo -e "${GREEN}✅ Production server is healthy${NC}"
else
    echo -e "${RED}❌ Production server health check failed${NC}"
    exit 1
fi

# Step 6: Notify team
echo -e "${YELLOW}Step 6: Notifying team${NC}"

curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"✅ Sakshi Cafe deployment successful!\nServer: ${DEPLOY_HOST}\nTime: $(date)\"}" \
    ${SLACK_WEBHOOK_URL}

echo -e "${GREEN}✅ Team notified${NC}"

echo ""
echo -e "${GREEN}=========================================="
echo "🎉 Deployment completed successfully!"
echo "=========================================${NC}"
echo ""
echo "Production URL: https://api.sakshicafe.com"
echo "Admin Dashboard: https://sakshicafe.com/admin"
echo "Customer Portal: https://sakshicafe.com/customer"
echo ""
