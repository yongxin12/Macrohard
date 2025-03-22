#!/bin/bash
set -e

# Default ACR server if not provided
ACR_SERVER=${ACR_SERVER:-macrohardacr.azurecr.io}

# Check if username and password are provided
if [ -z "$ACR_USERNAME" ] || [ -z "$ACR_PASSWORD" ]; then
    echo "Error: ACR_USERNAME and ACR_PASSWORD environment variables must be set."
    echo "Please run:"
    echo "export ACR_USERNAME=<your_acr_username>"
    echo "export ACR_PASSWORD=<your_acr_password>"
    exit 1
fi

echo "Logging in to ACR at $ACR_SERVER..."
docker login $ACR_SERVER -u $ACR_USERNAME -p $ACR_PASSWORD

echo "Login successful! You can now run docker-compose up -d"

# Optionally add to .env file
if [ ! -f .env ]; then
    echo "Creating .env file with ACR_SERVER..."
    echo "ACR_SERVER=$ACR_SERVER" > .env
    echo ".env file created"
else
    # Check if ACR_SERVER is already in .env
    if grep -q "ACR_SERVER" .env; then
        # Update existing ACR_SERVER
        sed -i "s|ACR_SERVER=.*|ACR_SERVER=$ACR_SERVER|g" .env
    else
        # Add ACR_SERVER if not present
        echo "ACR_SERVER=$ACR_SERVER" >> .env
    fi
    echo "Updated .env file with ACR_SERVER"
fi

# Verify Docker can access the images
echo "Verifying Docker can access the ACR images..."
docker image list | grep $ACR_SERVER || echo "No images from $ACR_SERVER found locally" 