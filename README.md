# Macrohard
AI for supported employment job coaches to improve employment for people with disabilities.

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- Git
- Node.js (v16 or later) - for local development
- Python 3.9+ - for local development

### Running the Application

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/Macrohard.git
   cd Macrohard
   ```

2. Make the run script executable:
   ```bash
   chmod +x scripts/run.sh
   ```

3. Run in demo mode (recommended for first-time users):
   ```bash
   ./scripts/run.sh -d
   ```
   This will start the application with mock data, accessible at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

4. To run with Azure services (requires Azure credentials):
   ```bash
   ./scripts/run.sh -a
   ```

### Available Run Options
- `-d, --demo`: Run in demo mode (default)
- `-a, --azure`: Run with Azure services
- `-b, --build`: Force rebuild of containers
- `-s, --stop`: Stop all containers
- `-h, --help`: Show help message

## Development Setup

### Local Development

1. Backend Setup:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. Frontend Setup:
   ```bash
   cd frontend
   npm install
   ```

3. Start Development Servers:
   - Backend: `uvicorn main:app --reload --port 8000`
   - Frontend: `npm start`

### Docker Development

1. Build and run with demo data:
   ```bash
   ./scripts/run.sh -d -b
   ```

2. Build and run with Azure services:
   ```bash
   ./scripts/run.sh -a -b
   ```

## Security and Sensitive Data

### Important Security Guidelines

- **Never commit .env files** with real credentials to the repository
- Keep credentials secure and rotate them regularly
- Use different environment files for different purposes:
  - `.env.demo` - For demo mode (safe to commit)
  - `.env.azure` - For Azure services (never commit)
- The `.gitignore` file is set up to exclude sensitive files

### Setting Up Azure Credentials Safely

1. Copy the template file:
   ```bash
   cp .env.azure.example .env.azure
   ```

2. Edit `.env.azure` with your actual credentials:
   ```bash
   nano .env.azure  # or use any text editor
   ```

3. Use the Azure-specific docker-compose file:
   ```bash
   docker compose -f docker-compose.azure.yml up -d
   ```

### Credential Management Best Practices

- **Rotate credentials regularly**: Update your Azure keys every 30-90 days
- **Use Azure Key Vault** for production environments
- **Set up Azure Managed Identities** for services where possible
- **Limit access permissions** to only what's needed

## Project Structure

```
Macrohard/
├── backend/           # FastAPI backend
│   ├── api/          # API endpoints
│   ├── models/       # Data models
│   ├── services/     # Business logic
│   └── main.py       # Application entry point
├── frontend/         # React frontend
│   ├── public/       # Static files
│   ├── src/         # Source code
│   └── package.json # Dependencies
├── docs/            # Documentation
│   ├── docker_setup.md
│   ├── azure_setup.md
│   └── other documentation files
├── scripts/         # Shell scripts
│   ├── run.sh       # Main application runner
│   └── setup_azure.sh # Azure setup helper
├── docker-compose.yml
├── docker-compose.azure.yml
├── .env.example
├── .env.azure.example
├── .env.demo
├── .gitignore
├── LICENSE
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
