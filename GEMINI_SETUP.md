# Gemini AI Setup for MEMEFY AI

## 1. Install Google Generative AI SDK

Run this command to install the Gemini SDK:

```bash
npm install @google/generative-ai
```

## 2. Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key

## 3. Add Environment Variable

Add this to your `.env` file:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Replace `your_gemini_api_key_here` with your actual Gemini API key from step 2.

## 4. Restart Development Server

After adding the environment variable, restart your dev server:

```bash
npm run dev
```

## 5. Test AI Features

- Click "Test AI Connection" in the Generator
- Try "AI Text" button
- Use "AI Editor" for advanced features

## Features Available with Gemini:

✅ **AI Text Generation** - Smart meme text suggestions  
✅ **Template Recommendations** - AI suggests best templates  
✅ **Meme Concept Generation** - Turn ideas into memes  
✅ **Text Improvements** - Enhance existing meme text  
✅ **Creative Suggestions** - Multiple variations for any concept  

## Troubleshooting:

**"Gemini AI not available"**: Check that VITE_GEMINI_API_KEY is set in your .env file  
**"Connection failed"**: Verify your API key is correct and has not expired  
**"Quota exceeded"**: You've hit the free tier limit, wait or upgrade your plan  

## API Usage:

- Free tier: 15 requests per minute
- Paid tier: Higher limits available
- Text generation only (no image generation in current setup)

Your Gemini integration is now ready! 🚀