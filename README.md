# Ghoten UI - Terraform Cloud Clone

A modern, serverless web interface for managing Terraform infrastructure using the ORAS backend in OpenTofu. No backend servers required — everything runs client-side using GitHub APIs.

## Features

- 🔐 **GitHub OAuth Authentication** - Secure login with GitHub
- 📦 **Automatic Project Detection** - Scans your organization for `.ghoten/project.yaml` configurations
- 🏗️ **Workspace Management** - View and manage Terraform workspaces
- 🚀 **Plan & Apply** - Trigger Terraform operations directly from the UI
- 📊 **Run Monitoring** - View workflow run status and logs in real-time
- 🔒 **Sensitive Data Redaction** - Automatically masks secrets and credentials in logs
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## Quick Start

### Prerequisites

- Node.js >= 20.0
- GitHub OAuth App credentials
- Organization repositories with `.ghoten/project.yaml` files

### Installation

```bash
git clone https://github.com/vmvarela/ghoten-ui.git
cd ghoten-ui
npm install
cp .env.example .env
# Edit .env with your GitHub OAuth credentials
```

### Development

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Configuration

Create `.env` with your GitHub OAuth App credentials:

```env
VITE_GITHUB_CLIENT_ID=your_oauth_app_client_id
VITE_GITHUB_ORG=your_organization_name
```

## License

Mozilla Public License 2.0
