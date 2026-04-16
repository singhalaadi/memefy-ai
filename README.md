# 🎨 MEME FACTORY

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-9-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

Modern meme generator with AI assistance, Google auth, and real-time collaboration.

[MEMEFY-AI PREVIEW: Click Here](https://memefy-ai.netlify.app/)

## ✨ Features

- � **AI-Powered Meme Creation** - Smart text suggestions and concept generation
- �️ **Rich Template Library** - 100+ popular memes from Imgflip API
- 🎨 **Advanced Editor** - Live preview, custom fonts, text effects, positioning
- 🤖 **AI Assistant** - Generate memes from concepts, improve text, suggest templates
- 🔐 **Google Authentication** - Secure login with profile sync
- 📱 **Responsive Design** - Works on all devices with optimized layouts
- 🌙 **Dark/Light Themes** - Toggle between modern UI themes
- 📊 **User Analytics** - Track meme performance and engagement
- 💾 **Cloud Storage** - Save and manage your meme collection
- ⬇️ **Easy Export** - Download memes in high quality

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/singhalaadi/memefy-ai.git
cd memefy-ai

# Install dependencies
npm install

# Set up environment (optional for demo mode)
cp .env.example .env

# Start development server
npm run dev
```

Visit `http://localhost:5173` and start creating! �

## 🔥 Firebase Setup (Optional)

1. Create [Firebase project](https://console.firebase.google.com)
2. Enable Authentication (Google) and Firestore
3. Update `.env` with your config:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
# ... other Firebase config
```

See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed instructions.

## �️ Project Structure

```
src/
├── components/           # UI components
│   ├── AIMemeEditor.jsx # Advanced meme editor
│   └── layout/          # Navigation, layout
├── pages/               # Route components
│   ├── Generator.jsx    # Main meme creation
│   ├── Gallery.jsx      # Meme gallery
│   ├── Dashboard.jsx    # User dashboard
│   └── Profile.jsx      # User profile
├── context/             # React contexts
├── hooks/               # Custom hooks (useMemes, useAnalytics)
├── services/            # API services (Firebase AI, meme API)
└── config/              # Firebase configuration
```

## 🎯 Key Components

- **Generator**: Template selection, text customization, live preview
- **AI Meme Editor**: Advanced editor with AI assistance and smart suggestions
- **Gallery**: Browse community memes with filtering and favorites
- **Dashboard**: Analytics and user statistics
- **Profile**: Personal meme collection and account management

## 🤖 AI Features

### Firebase AI (Gemini)
- **Smart Text Generation**: Generate meme text from concepts
- **Template Suggestions**: AI recommends templates based on your idea
- **Text Improvement**: Enhance existing text for better impact
- **Concept-to-Meme**: Describe your idea, get complete meme suggestions

### Magic Hour AI Integration 🪄
- **Complete AI Meme Generation**: Input a concept, get a fully generated meme with text
- **Professional Templates**: Access to popular templates like Drake, Galaxy Brain, Two Buttons
- **Smart Template Selection**: AI chooses the best template for your concept
- **High-Quality Output**: Professional meme images ready for sharing

#### Setting up Magic Hour AI:
1. Sign up at [Magic Hour AI](https://magichour.ai/)
2. Get your API key from [Developer Hub](https://magichour.ai/developer?tab=api-keys)
3. Add to your `.env` file:
   ```env
   VITE_MAGIC_HOUR_API_KEY=your-magic-hour-api-key-here
   ```
4. Each AI meme generation costs 10 credits on Magic Hour

**Pricing**: Magic Hour offers free tier with limited credits, and paid plans starting from ₹833/month

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **Backend**: Firebase (Auth, Firestore, Functions)
- **AI**: Firebase Generative AI (Gemini), Magic Hour AI
- **APIs**: Imgflip (templates), Magic Hour AI (meme generation), HTML2Canvas (export)

## 🚀 Deployment

**Netlify:**
```bash
npm run build
# Deploy dist/ folder
```

**Firebase Hosting:**
```bash
firebase init hosting
npm run build
firebase deploy
```

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

---

**Create viral content in seconds • No cap 📈**
