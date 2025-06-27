#!/bin/bash

# Deployment script for various platforms

echo "🚀 AI Real Estate Marketplace Deployment Tool"
echo "==========================================="
echo ""
echo "Select deployment platform:"
echo "1) Docker (Local/VPS)"
echo "2) Render"
echo "3) Railway"
echo "4) Fly.io"
echo "5) Netlify (Frontend only)"
echo "6) Check deployment readiness"
echo ""

read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        echo "📦 Deploying with Docker..."
        
        # Check if Docker is installed
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker is not installed. Please install Docker first."
            exit 1
        fi
        
        # Check if docker-compose is installed
        if ! command -v docker-compose &> /dev/null; then
            echo "❌ Docker Compose is not installed. Please install it first."
            exit 1
        fi
        
        # Check for .env file
        if [ ! -f .env ]; then
            echo "📝 Creating .env file from example..."
            cp .env.example .env
            echo "⚠️  Please edit .env file with your actual credentials!"
            exit 1
        fi
        
        # Build and run
        echo "🔨 Building containers..."
        docker-compose build
        
        echo "🏃 Starting services..."
        docker-compose up -d
        
        echo "✅ Deployment complete!"
        echo "Frontend: http://localhost:3000"
        echo "Backend: http://localhost:3001"
        echo ""
        echo "View logs: docker-compose logs -f"
        ;;
        
    2)
        echo "🚀 Deploying to Render..."
        echo ""
        echo "Steps to deploy on Render:"
        echo "1. Push your code to GitHub"
        echo "2. Sign up at https://render.com"
        echo "3. Create a new Web Service for backend:"
        echo "   - Connect your GitHub repo"
        echo "   - Root Directory: backend"
        echo "   - Build Command: npm install"
        echo "   - Start Command: node src/index.js"
        echo "4. Create a Static Site for frontend:"
        echo "   - Root Directory: frontend"
        echo "   - Build Command: npm install && npm run build"
        echo "   - Publish Directory: build"
        echo "5. Add environment variables in both services"
        echo ""
        echo "📄 render.yaml file has been created for automatic deployment"
        ;;
        
    3)
        echo "🚂 Deploying to Railway..."
        
        # Check if Railway CLI is installed
        if ! command -v railway &> /dev/null; then
            echo "Installing Railway CLI..."
            npm install -g @railway/cli
        fi
        
        echo "📝 Steps:"
        echo "1. Run: railway login"
        echo "2. Run: railway init"
        echo "3. Run: railway up"
        echo "4. Set environment variables:"
        echo "   railway variables set VAPI_API_KEY=your_key"
        echo "   railway variables set REACT_APP_VAPI_PUBLIC_KEY=your_key"
        ;;
        
    4)
        echo "✈️  Deploying to Fly.io..."
        
        # Check if Fly CLI is installed
        if ! command -v fly &> /dev/null; then
            echo "Please install Fly CLI first:"
            echo "curl -L https://fly.io/install.sh | sh"
            exit 1
        fi
        
        echo "📝 Steps:"
        echo "1. Run: fly auth login"
        echo "2. Run: fly apps create real-estate-voice-app"
        echo "3. Run: fly deploy"
        echo "4. Set secrets: fly secrets set VAPI_API_KEY=your_key"
        ;;
        
    5)
        echo "📐 Deploying frontend to Netlify..."
        echo ""
        echo "Steps:"
        echo "1. Build frontend locally: cd frontend && npm run build"
        echo "2. Install Netlify CLI: npm install -g netlify-cli"
        echo "3. Deploy: netlify deploy --dir=frontend/build"
        echo "4. For production: netlify deploy --prod --dir=frontend/build"
        echo ""
        echo "Or use Netlify web interface:"
        echo "1. Drag and drop frontend/build folder to Netlify"
        echo "2. Set environment variables in Netlify settings"
        ;;
        
    6)
        echo "🔍 Checking deployment readiness..."
        echo ""
        
        # Check for required files
        files=(".env" "docker-compose.yml" "backend/Dockerfile" "frontend/Dockerfile")
        missing=0
        
        for file in "${files[@]}"; do
            if [ -f "$file" ]; then
                echo "✅ $file exists"
            else
                echo "❌ $file is missing"
                missing=$((missing + 1))
            fi
        done
        
        # Check for node_modules
        if [ -d "backend/node_modules" ]; then
            echo "✅ Backend dependencies installed"
        else
            echo "⚠️  Backend dependencies not installed (run: cd backend && npm install)"
        fi
        
        if [ -d "frontend/node_modules" ]; then
            echo "✅ Frontend dependencies installed"
        else
            echo "⚠️  Frontend dependencies not installed (run: cd frontend && npm install)"
        fi
        
        # Check for environment variables
        if [ -f ".env" ]; then
            if grep -q "your_" .env; then
                echo "⚠️  .env file contains placeholder values - please update!"
            else
                echo "✅ .env file appears to be configured"
            fi
        fi
        
        echo ""
        if [ $missing -eq 0 ]; then
            echo "✅ Ready for deployment!"
        else
            echo "❌ Please fix the issues above before deploying"
        fi
        ;;
        
    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac