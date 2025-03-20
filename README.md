# Macrohard
AI for supported employment job coaches Improve employment for people with disabilities

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
   docker-compose -f docker-compose.azure.yml up -d
   ```

### Credential Management Best Practices

- **Rotate credentials regularly**: Update your Azure keys every 30-90 days
- **Use Azure Key Vault** for production environments
- **Set up Azure Managed Identities** for services where possible
- **Limit access permissions** to only what's needed
