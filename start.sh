#!/bin/bash
# Job Coach AI Assistant - Master Startup Script

# Print welcome message
echo "========================================================"
echo "   Job Coach AI Assistant - Starting Demo Application   "
echo "========================================================"
echo

# Start backend server in a new terminal window
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'/backend && ./startup.sh"'
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd $(pwd)/backend && ./startup.sh; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "cd $(pwd)/backend && ./startup.sh; exec bash" &
    else
        echo "Could not find a suitable terminal emulator. Please run the backend manually."
    fi
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    start cmd /k "cd /d $(pwd)/backend && startup.sh"
else
    echo "Unsupported OS for automatic terminal opening. Please run the backend manually."
fi

echo "Started backend server in a new terminal window."
echo "Waiting for backend to initialize..."
sleep 5

# Start frontend server in a new terminal window
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'/frontend && ./startup.sh"'
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd $(pwd)/frontend && ./startup.sh; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "cd $(pwd)/frontend && ./startup.sh; exec bash" &
    else
        echo "Could not find a suitable terminal emulator. Please run the frontend manually."
    fi
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    start cmd /k "cd /d $(pwd)/frontend && startup.sh"
else
    echo "Unsupported OS for automatic terminal opening. Please run the frontend manually."
fi

echo "Started frontend server in a new terminal window."
echo 
echo "The Job Coach AI Assistant is now running!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000/demo.html"
echo
echo "You can access the demo application at: http://localhost:3000/demo.html"
echo
echo "To stop the servers, close the terminal windows or press Ctrl+C in each window."
echo
echo "For more information, see:"
echo "- DEMO_TUTORIAL.md for a guided tutorial"
echo "- DEVELOPMENT.md for development setup instructions"
echo "- BACKEND_IMPLEMENTATION.md for backend implementation details"