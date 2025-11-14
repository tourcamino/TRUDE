#!/bin/bash

# TRUDE Deployment Cleanup and Setup Script
# This script removes old deployments and configures new ones

set -e

echo "🧹 TRUDE Deployment Cleanup and Setup"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to clean up old deployments
cleanup_deployments() {
    print_status "Cleaning up old deployments..."
    
    # Remove old build artifacts
    if [ -d ".vercel" ]; then
        print_status "Removing old Vercel artifacts..."
        rm -rf .vercel
    fi
    
    if [ -d ".vinxi" ]; then
        print_status "Removing old build files..."
        rm -rf .vinxi
    fi
    
    if [ -d "node_modules" ]; then
        print_status "Removing node_modules for clean install..."
        rm -rf node_modules
    fi
    
    print_success "Cleanup completed"
}

# Function to setup Vercel
setup_vercel() {
    print_status "Setting up Vercel deployment..."
    
    if ! command -v vercel &> /dev/null; then
        print_status "Installing Vercel CLI..."
        npm i -g vercel
    fi
    
    # Check if vercel.json exists
    if [ ! -f "vercel.json" ]; then
        print_error "vercel.json not found"
        return 1
    fi
    
    print_status "Vercel is ready for deployment"
    print_status "Run 'vercel --prod' to deploy"
    
    return 0
}

# Function to setup Render
setup_render() {
    print_status "Setting up Render deployment..."
    
    if [ ! -f "render.yaml" ]; then
        print_error "render.yaml not found"
        return 1
    fi
    
    print_status "Render configuration is ready"
    print_status "Push to GitHub to trigger automatic deployment"
    
    return 0
}

# Function to setup GitHub Actions
setup_github_actions() {
    print_status "Setting up GitHub Actions..."
    
    if [ ! -f ".github/workflows/auto-deploy.yml" ]; then
        print_error "GitHub Actions workflow not found"
        return 1
    fi
    
    print_status "GitHub Actions workflow is configured"
    print_status "Set the following secrets in your GitHub repository:"
    echo "  - VERCEL_TOKEN"
    echo "  - VERCEL_ORG_ID"
    echo "  - VERCEL_PROJECT_ID"
    echo "  - RENDER_SERVICE_ID"
    echo "  - RENDER_API_KEY"
    
    return 0
}

# Function to optimize repository
optimize_repository() {
    print_status "Optimizing repository..."
    
    # Create .gitignore entries if not present
    if [ ! -f ".gitignore" ]; then
        touch .gitignore
    fi
    
    # Add common ignore patterns
    cat >> .gitignore << EOF

# Deployment
.vercel
.vinxi/build
.vinxi/temp

# Environment
.env.local
.env.production

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port
EOF
    
    print_success "Repository optimization completed"
}

# Function to create deployment checklist
create_checklist() {
    print_status "Creating deployment checklist..."
    
    cat > DEPLOYMENT_CHECKLIST.md << 'EOF'
# TRUDE Deployment Checklist

## Pre-Deployment
- [ ] All environment variables are configured
- [ ] Database is set up (if using PostgreSQL)
- [ ] All API keys are valid
- [ ] Project builds successfully locally
- [ ] Tests pass (if applicable)

## Vercel Deployment
- [ ] Vercel account is connected to GitHub
- [ ] Project is imported to Vercel
- [ ] Environment variables are set in Vercel dashboard
- [ ] Build command is configured correctly
- [ ] Output directory is set to `.output`

## Render Deployment
- [ ] Render account is connected to GitHub
- [ ] Web service is created
- [ ] Environment variables are set in Render dashboard
- [ ] Build command is configured
- [ ] Start command is configured

## GitHub Actions (Optional)
- [ ] Repository secrets are configured
- [ ] Workflow file is in place
- [ ] Actions are enabled for the repository

## Post-Deployment
- [ ] Application loads correctly
- [ ] All routes work
- [ ] API endpoints respond
- [ ] Database connections work
- [ ] External API integrations work
- [ ] Monitoring is set up

## Environment Variables Required
- VITE_FACTORY_ADDRESS
- VITE_WALLETCONNECT_PROJECT_ID
- VITE_ALCHEMY_API_KEY
- VITE_DUNE_API_KEY
- VITE_MORALIS_API_KEY
- VITE_OPENAI_API_KEY
- VITE_COINGECKO_API_KEY
- DATABASE_URL (optional)
EOF
    
    print_success "Deployment checklist created"
}

# Main function
main() {
    echo ""
    print_status "Starting TRUDE deployment cleanup and setup..."
    echo ""
    
    # Cleanup old deployments
    cleanup_deployments
    
    echo ""
    print_status "Select setup option:"
    echo "1) Setup Vercel"
    echo "2) Setup Render"
    echo "3) Setup GitHub Actions"
    echo "4) Optimize Repository"
    echo "5) Full Setup (All)"
    echo "6) Create Checklist"
    echo "7) Exit"
    echo ""
    
    read -p "Enter your choice (1-7): " choice
    
    case $choice in
        1)
            setup_vercel
            ;;
        2)
            setup_render
            ;;
        3)
            setup_github_actions
            ;;
        4)
            optimize_repository
            ;;
        5)
            setup_vercel
            setup_render
            setup_github_actions
            optimize_repository
            ;;
        6)
            create_checklist
            ;;
        7)
            print_status "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
    
    echo ""
    print_success "Setup process completed!"
    print_status "Check DEPLOYMENT_CHECKLIST.md for next steps"
    echo ""
}

# Run main function
main "$@"