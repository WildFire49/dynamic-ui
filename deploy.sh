#!/bin/bash

set -e

SSH_KEY="$HOME/Downloads/LLM-Keypair.pem"
EC2_HOST="13.204.31.131"
EC2_USER="ec2-user"
DOCKER_IMAGE_NAME="buddhi-ai"
DOCKER_REGISTRY="newstreet"
DOCKER_TAG_PREFIX="mifix-ai-ui-v"
PROJECT_DIR="/Users/vaishakh/Code/dynamic-ui"

echo "🚀 Starting deployment process..."

cd "$PROJECT_DIR"

echo "📦 Fetching latest git tags..."
git fetch --tags 2>/dev/null || true

LATEST_TAG=$(git tag --sort=-v:refname | head -1)

if [ -z "$LATEST_TAG" ]; then
  echo "⚠️  No existing tags found. Starting with version 2.3.7"
  NEW_VERSION="2.3.7"
else
  echo "📌 Latest tag: $LATEST_TAG"
  
  IFS='.' read -r -a VERSION_PARTS <<< "$LATEST_TAG"
  MAJOR="${VERSION_PARTS[0]}"
  MINOR="${VERSION_PARTS[1]}"
  PATCH="${VERSION_PARTS[2]}"
  
  NEW_PATCH=$((PATCH + 1))
  NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"
fi

echo "🔖 New version: $NEW_VERSION"

DOCKER_TAG="${DOCKER_TAG_PREFIX}${NEW_VERSION}"

echo "🏷️  Creating new git tag: $NEW_VERSION"
git tag "$NEW_VERSION"
git push azure "$NEW_VERSION" 2>/dev/null || echo "⚠️  Could not push tag to Azure DevOps (continuing anyway)"

echo "🐳 Building multi-platform Docker image: $DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:$DOCKER_TAG"
echo "   Platforms: linux/amd64, linux/arm64"
docker buildx build --platform linux/amd64,linux/arm64 \
  -t "$DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:$DOCKER_TAG" \
  -t "$DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:latest" \
  --push \
  .

echo "🔐 Connecting to EC2 instance: $EC2_USER@$EC2_HOST"

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" << EOF
  set -e
  
  echo "🛑 Stopping existing container..."
  docker stop dynamic-ui-container 2>/dev/null || true
  docker rm dynamic-ui-container 2>/dev/null || true
  
  echo "🗑️  Cleaning up old images..."
  docker image prune -f
  
  echo "📥 Pulling new Docker image: $DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:$DOCKER_TAG"
  docker pull "$DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:$DOCKER_TAG"
  
  echo "🚀 Starting new container..."
  docker run -d \
    --name dynamic-ui-container \
    -p 3500:3000 \
    --restart unless-stopped \
    -e NODE_ENV=production \
    -e NEXT_PUBLIC_API_BASE_URL=https://supervisory-dev.mifix.io \
    -e NEXT_PUBLIC_UPLOAD_API_URL=https://supervisory-dev.mifix.io/upload \
    -e NEXT_PUBLIC_EVENT_API_URL=http://15.207.209.61:8400/executor/events \
    -e NEXT_PUBLIC_CONNECTION_ID=c132d635-7392-4856-a2ce-077f5482e88b \
    -e NEXT_PUBLIC_WORKFLOW_API_BASE_URL=http://15.207.209.61:5000 \
    -e NEXT_PUBLIC_SSO_BASE_URL=https://ams-uat.mifix.io/idp/sso \
    -e "NEXT_PUBLIC_PRODUCT_CODES=MIFIX-AI|MiFiX AI|cli-1a1abfd3-05c8-4e28-b2aa-6c597b77163c|Zn6WlZiewaBMJCydrqm8TdlgKOX/+MoAXP+D/gG8mTo=,FED-JLG|FED JLG|cli-af6e3d1b-586e-4aa6-9786-c0d78a2cade8|D7KJ5beFnb5WxmgHk9Pb/9bEr/f9vOmK5O1BKH4kI6s=" \
    -e NEXT_PUBLIC_CHROMA_HOST=3.6.132.24 \
    -e NEXT_PUBLIC_CHROMA_PORT=8000 \
    "$DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:$DOCKER_TAG"
  
  echo "✅ Container started successfully!"
  
  echo "📊 Container status:"
  docker ps | grep dynamic-ui-container
  
  echo "📝 Container logs (last 20 lines):"
  docker logs --tail 20 dynamic-ui-container
EOF

echo ""
echo "✅ Deployment completed successfully!"
echo "🔖 Version: $NEW_VERSION"
echo "🐳 Docker Tag: $DOCKER_TAG"
echo "🌐 Application URL: http://$EC2_HOST:3500"
echo ""
echo "📋 Useful commands:"
echo "  - View logs: ssh -i $SSH_KEY $EC2_USER@$EC2_HOST 'docker logs -f dynamic-ui-container'"
echo "  - Check status: ssh -i $SSH_KEY $EC2_USER@$EC2_HOST 'docker ps'"
echo "  - Restart: ssh -i $SSH_KEY $EC2_USER@$EC2_HOST 'docker restart dynamic-ui-container'"
