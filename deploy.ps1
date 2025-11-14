# TRUDE Automatic Deployment Script for Windows
# This script handles automated deployment to Vercel and Render

Write-Host "🚀 TRUDE Automatic Deployment Script" -ForegroundColor Blue
Write-Host "======================================" -ForegroundColor Blue
Write-Host ""

# Function to print colored output
function Write-Info {
    param($message)
    Write-Host "[INFO] $message" -ForegroundColor Cyan
}

function Write-Success {
    param($message)
    Write-Host "[SUCCESS] $message" -ForegroundColor Green
}

function Write-Warning {
    param($message)
    Write-Host "[WARNING] $message" -ForegroundColor Yellow
}

function Write-Error {
    param($message)
    Write-Host "[ERROR] $message" -ForegroundColor Red
}

# Check if required tools are installed
function Check-Dependencies {
    Write-Info "Checking dependencies..."
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Success "Node.js is installed: $nodeVersion"
    } catch {
        Write-Error "Node.js is not installed"
        exit 1
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-Success "npm is installed: $npmVersion"
    } catch {
        Write-Error "npm is not installed"
        exit 1
    }
    
    # Check Git
    try {
        $gitVersion = git --version
        Write-Success "Git is installed: $gitVersion"
    } catch {
        Write-Error "Git is not installed"
        exit 1
    }
}

# Build the project
function Build-Project {
    Write-Info "Building TRUDE project..."
    
    # Install dependencies
    Write-Info "Installing dependencies..."
    npm ci
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install dependencies"
        exit 1
    }
    
    # Run type check
    Write-Info "Running type check..."
    npm run typecheck
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Type check failed"
        exit 1
    }
    
    # Build the project
    Write-Info "Building for production..."
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build failed"
        exit 1
    }
    
    Write-Success "Project built successfully"
}

# Deploy to Vercel
function Deploy-Vercel {
    Write-Info "Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    try {
        $vercelVersion = vercel --version
        Write-Info "Vercel CLI is installed: $vercelVersion"
    } catch {
        Write-Info "Installing Vercel CLI..."
        npm i -g vercel
    }
    
    # Check if Vercel project is configured
    if (-not (Test-Path "vercel.json")) {
        Write-Error "vercel.json not found"
        exit 1
    }
    
    Write-Info "Deploying to Vercel..."
    vercel --prod --yes
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Deployed to Vercel successfully"
    } else {
        Write-Error "Vercel deployment failed"
        return $false
    }
    
    return $true
}

# Deploy to Render
function Deploy-Render {
    Write-Info "Setting up Render deployment..."
    
    if (-not (Test-Path "render.yaml")) {
        Write-Error "render.yaml not found"
        exit 1
    }
    
    Write-Info "Render deployment configured via render.yaml"
    Write-Info "Push to GitHub to trigger automatic deployment on Render"
    Write-Success "Render deployment is ready"
}

# Main deployment function
function Main {
    Write-Host ""
    Write-Info "Starting TRUDE deployment process..."
    Write-Host ""
    
    # Check dependencies
    Check-Dependencies
    
    # Build project
    Build-Project
    
    Write-Host ""
    Write-Info "Select deployment target:"
    Write-Host "1) Vercel (Recommended)"
    Write-Host "2) Render"
    Write-Host "3) Both"
    Write-Host "4) Exit"
    Write-Host ""
    
    $choice = Read-Host "Enter your choice (1-4)"
    
    switch ($choice) {
        "1" {
            Deploy-Vercel
        }
        "2" {
            Deploy-Render
        }
        "3" {
            $vercelSuccess = Deploy-Vercel
            Deploy-Render
        }
        "4" {
            Write-Info "Exiting..."
            exit 0
        }
        default {
            Write-Error "Invalid choice"
            exit 1
        }
    }
    
    Write-Host ""
    Write-Success "Deployment process completed!"
    Write-Host ""
    Write-Info "Next steps:"
    Write-Host "- Check your deployment URLs"
    Write-Host "- Monitor application performance"
    Write-Host "- Set up monitoring and alerts"
    Write-Host ""
}

# Run main function
Main