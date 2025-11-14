#!/bin/bash

# TRUDE Automatic Deployment Script
# This script handles automated deployment to Vercel and Render

set -e

echo "🚀 TRUDE Automatic Deployment Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Build the project
build_project() {
    print_status "Building TRUDE project..."
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm ci
    
    # Run type check
    print_status "Running type check..."
    npm run typecheck
    
    # Build the project
    print_status "Building for production..."
    npm run build
    
    print_success "Project built successfully"
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_status "Installing Vercel CLI..."
        npm i -g vercel
    fi
    
    # Check if Vercel project is configured
    if [ ! -f "vercel.json" ]; then
        print_error "vercel.json not found"
        exit 1
    fi
    
    print_status "Deploying to Vercel..."
    vercel --prod --yes
    
    if [ $? -eq 0 ]; then
        print_success "Deployed to Vercel successfully"
    else
        print_error "Vercel deployment failed"
        return 1
    fi
}

# Deploy to Render
deploy_render() {
    print_status "Setting up Render deployment..."
    
    if [ ! -f "render.yaml" ]; then
        print_error "render.yaml not found"
        exit 1
    fi
    
    print_status "Render deployment configured via render.yaml"
    print_status "Push to GitHub to trigger automatic deployment on Render"
    print_success "Render deployment is ready"
}

# Main deployment function
main() {
    echo ""
    print_status "Starting TRUDE deployment process..."
    echo ""
    
    # Check dependencies
    check_dependencies
    
    # Build project
    build_project
    
    echo ""
    print_status "Select deployment target:"
    echo "1) Vercel (Recommended)"
    echo "2) Render"
    echo "3) Both"
    echo "4) Exit"
    echo ""
    
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            deploy_vercel
            ;;
        2)
            deploy_render
            ;;
        3)
            deploy_vercel
            deploy_render
            ;;
        4)
            print_status "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
    
    echo ""
    print_success "Deployment process completed!"
    echo ""
    print_status "Next steps:"
    echo "- Check your deployment URLs"
    echo "- Monitor application performance"
    echo "- Set up monitoring and alerts"
    echo ""
}

# Run main function
main "$@"