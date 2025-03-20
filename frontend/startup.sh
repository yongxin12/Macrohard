#!/bin/bash
# Job Coach AI Assistant - Frontend Startup Script

echo "Starting frontend server using Python HTTP server..."
echo "For React development, use 'npm start' instead if working with the React app."
echo "Opening http://localhost:3000/demo.html in your default browser..."

# Start HTTP server in the background
python -m http.server 3000 &

# Wait a moment for the server to start
sleep 2

# Open browser (works on macOS, Linux with xdg-open, or Windows with start)
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3000/demo.html
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:3000/demo.html
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    start http://localhost:3000/demo.html
else
    echo "Please open http://localhost:3000/demo.html in your browser."
fi

echo "HTTP server running at http://localhost:3000"
echo "Press Ctrl+C to stop the server"

# Keep the script running until interrupted
wait 