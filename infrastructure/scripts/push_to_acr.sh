#!/bin/bash

# Define variables
ACR_NAME="macrohardacr"
ACR_LOGIN_SERVER="${ACR_NAME}.azurecr.io"
TAG="latest"

# Define services to build (add more as needed)
SERVICES=("frontend" "backend")

# Log in to Azure
# az login

# Log in to Azure Container Registry
az acr login --name $ACR_NAME

# Loop through each service and build/push
for SERVICE in "${SERVICES[@]}"; do
  echo "Building image for ${SERVICE}..."
  
  # Build the Docker image
  # docker build -f Dockerfile --build-arg API_URL=http://localhost/api -t ${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${TAG} .
  docker build -f ./${SERVICE}/Dockerfile -t ${ACR_LOGIN_SERVER}/assistant-${SERVICE}:${TAG} ./${SERVICE}/.
  
  # Push the Docker image to ACR
  echo "Pushing image for ${SERVICE} to ACR..."
  docker push ${ACR_LOGIN_SERVER}/assistant-${SERVICE}:${TAG}
  
  echo "${SERVICE} image pushed successfully"
done

echo "All images built and pushed to ACR"

