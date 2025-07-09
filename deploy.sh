#!/bin/bash

# Member Matcher - GitHub Pages Deployment Script
echo "🚀 Member Matcher - GitHub Pages Deployment"
echo "=========================================="

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "📁 Initializing Git repository..."
    git init
fi

# Add all files
echo "📝 Adding files to Git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Initial commit - Member Matcher app v1.0.0"

# Check if remote exists
if ! git remote get-url origin &> /dev/null; then
    echo "🌐 No remote repository found."
    echo ""
    echo "📋 Next steps:"
    echo "1. Create a new repository on GitHub.com"
    echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/member-matcher.git"
    echo "3. Run: git push -u origin main"
    echo "4. Go to Settings → Pages → Deploy from branch → main → / (root)"
    echo ""
    echo "🎉 Your app will be live at: https://YOUR_USERNAME.github.io/member-matcher"
else
    echo "🚀 Pushing to GitHub..."
    git push origin main
    echo ""
    echo "✅ Deployment complete!"
    echo "🌐 Your app should be live in 2-5 minutes at your GitHub Pages URL"
fi

echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md" 