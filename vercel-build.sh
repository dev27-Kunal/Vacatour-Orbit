#!/bin/bash

# Vercel Build Script
echo "🚀 Starting build process..."

# Run the build (dependencies are installed by Vercel's installCommand)
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ -d "client/dist" ] && [ -f "client/dist/index.html" ]; then
    echo "✅ Build successful!"
    echo "📁 Build output:"
    ls -la client/dist/
    exit 0
else
    echo "❌ Build failed! Expected client/dist/index.html not found."
    echo "📁 Current directory contents:"
    ls -la
    if [ -d "client" ]; then
        echo "📁 Client directory contents:"
        ls -la client/
    fi
    exit 1
fi