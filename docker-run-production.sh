#!/bin/bash

# Production Docker run script with proper environment variables
docker run -d \
  --name dynamic-ui-container \
  -p 3500:3000 \
  --restart unless-stopped \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_API_BASE_URL=https://supervisory-dev.mifix.io \
  -e NEXT_PUBLIC_UPLOAD_API_URL=https://supervisory-dev.mifix.io/upload \
  newstreet/buddhi-ai:mifix-ai-ui-v1.0.2
