#!/bin/bash

# Deployment script for PlacementPal
echo "🚀 Starting PlacementPal deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the PlacementPal directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build output is in the 'dist' directory"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Set up your database (Neon or Railway PostgreSQL)"
    echo "2. Configure environment variables"
    echo "3. Deploy to your chosen platform:"
    echo "   - Railway: railway up"
    echo "   - Render: Connect your repository"
    echo "   - Vercel: Import your repository"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed instructions"
else
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi 