#!/bin/bash

echo "🚀 Setting up TrackNet Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MySQL is running (basic check)
if ! pgrep mysqld &> /dev/null && ! pgrep mysql &> /dev/null; then
    echo "⚠️  MySQL doesn't appear to be running. Please start MySQL service."
    echo "   On macOS: brew services start mysql"
    echo "   On Linux: sudo systemctl start mysql"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env ]; then
    echo "📋 Setting up environment..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your database credentials."
fi

echo "🎉 Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure MySQL is running"
echo "2. Edit .env with your database credentials"
echo "3. Run: npm run db:migrate"
echo "4. Run: npm run db:seed (optional)"
echo "5. Run: npm run dev"
