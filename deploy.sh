#!/bin/bash

# Marketplace Platform - One-Click Deployment Script
# This script helps you deploy to Railway and Vercel

echo "========================================="
echo "  Marketplace Platform Deployment"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if git is configured
echo "Step 1: Checking Git Configuration..."
if [ -z "$(git config user.name)" ]; then
    print_warning "Git user name not set. Setting..."
    git config user.name "Your Name"
fi
if [ -z "$(git config user.email)" ]; then
    print_warning "Git user email not set. Setting..."
    git config user.email "you@example.com"
fi
print_status "Git configured"
echo ""

# Push to GitHub
echo "Step 2: Pushing to GitHub..."
cd /c/dev
git add -A
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M')" 2>/dev/null
git push origin main
print_status "Code pushed to GitHub"
echo ""

# Instructions for Railway
echo "========================================="
echo "  RAILWAY DEPLOYMENT (Backend)"
echo "========================================="
echo ""
echo "1. Go to: https://railway.app"
echo "2. Click 'New Project'"
echo "3. Select: 'oyaon/Marketplace-Platform-'"
echo "4. Set Root Directory: 'marketplace-backend'"
echo "5. Click 'Deploy'"
echo ""
echo "REQUIRED Environment Variables (in Railway Dashboard):"
echo "------------------------------------------------"
echo "DATABASE_URL=postgresql://..."
echo "JWT_SECRET=your-super-secret-key"
echo "PORT=5000"
echo "NODE_ENV=production"
echo "------------------------------------------------"
echo ""

# Instructions for Vercel
echo "========================================="
echo "  VERCEL DEPLOYMENT (Frontend)"
echo "========================================="
echo ""
echo "1. Go to: https://vercel.com"
echo "2. Click 'Add New...' → 'Project'"
echo "3. Select: 'oyaon/Marketplace-Platform-'"
echo "4. Set Root Directory: 'marketplace-frontend'"
echo "5. Click 'Deploy'"
echo ""
echo "REQUIRED Environment Variable (in Vercel Dashboard):"
echo "------------------------------------------------"
echo "NEXT_PUBLIC_API_URL=https://your-railway-backend.up.railway.app"
echo "------------------------------------------------"
echo ""

print_status "All done! Follow the instructions above."
echo ""
echo "========================================="

