#!/bin/bash

# Setup script for English designers
echo "🇬🇧 Setting up Vacature-ORBIT for English designers..."

# Create .env.development from example if it doesn't exist
if [ ! -f .env.development ]; then
    echo "📝 Creating .env.development with English defaults..."
    cp .env.development.example .env.development
    echo "✅ Environment configured for English"
else
    echo "⚠️  .env.development already exists, skipping..."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Set localStorage to English
echo "🌍 Setting default language to English..."
cat > set-english.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Set Language to English</title>
</head>
<body>
    <h1>Setting language to English...</h1>
    <script>
        localStorage.setItem('i18nextLng', 'en');
        document.write('<p>✅ Language set to English!</p>');
        document.write('<p>You can close this window.</p>');
    </script>
</body>
</html>
EOF

echo "
✅ Setup complete!

📋 Next steps:
1. Run: npm run dev
2. Open: http://localhost:5174
3. The app will be in ENGLISH!

If you still see Dutch text:
1. Open browser console (F12)
2. Run: localStorage.setItem('i18nextLng', 'en');
3. Refresh the page

📖 Read README-DESIGNERS.md for full documentation

Happy designing! 🎨
"