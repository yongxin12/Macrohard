#!/bin/bash
# Job Coach AI Assistant - Backend Startup Script

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Check for .env file
if [ ! -f ".env" ]; then
    echo "Creating default .env file..."
    cat > .env << EOF
# Job Coach AI Assistant - Environment Variables (Demo Mode)

# Backend settings
BACKEND_PORT=8000

# Security
SECRET_KEY=demo-secret-key-for-testing-only

# Demo mode flag
DEMO_MODE=true
EOF
fi

# Create temp directory for uploads if it doesn't exist
if [ ! -d "temp" ]; then
    echo "Creating temp directory..."
    mkdir -p temp
fi

# Start the server
echo "Starting backend server..."
python main.py 