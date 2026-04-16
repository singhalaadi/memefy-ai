# Magic Hour AI Integration Setup Guide

## Overview
Magic Hour AI provides complete meme generation where you input a concept and receive a fully-generated meme with text already applied. This is different from traditional template-based approaches.

## Features
- 🤖 **Complete AI Meme Generation**: Input concept → Get finished meme
- 🎭 **Smart Template Selection**: AI chooses optimal template for your concept
- 📝 **AI Text Generation**: Automatically writes funny, relevant text
- 🎨 **Professional Quality**: High-resolution memes ready for sharing
- 🔍 **Web Search**: Can incorporate recent events (optional)

## Setup Instructions

### 1. Get Magic Hour API Key
1. Visit [Magic Hour AI](https://magichour.ai/)
2. Sign up for an account
3. Go to [Developer Hub](https://magichour.ai/developer?tab=api-keys)
4. Click "Create new API Key"
5. Copy your API key

### 2. Configure Environment
Add to your `.env` file:
```bash
VITE_MAGIC_HOUR_API_KEY=your-magic-hour-api-key-here
```

### 3. Restart Development Server
```bash
npm run dev
```

## Usage

### In the Generator
1. Go to the **AI Generator** tab 🤖
2. Enter your meme concept (e.g., "When you finally understand React hooks")
3. Choose a template preference (or leave as "Random" for AI selection)
4. Click "Generate AI Meme"
5. Wait for generation (usually 10-30 seconds)
6. Download your finished meme!

### Example Concepts
- "When you finally understand a complex concept"
- "Trying to explain crypto to your parents"
- "Monday morning vs Friday afternoon energy"
- "Me pretending to be productive while procrastinating"
- "When the code works on the first try"

## Available Templates
- **Random**: Let AI choose the best template
- **Drake Hotline Bling**: Preference/comparison scenarios
- **Galaxy Brain**: Escalating ideas or intelligence levels
- **Two Buttons**: Difficult choice scenarios
- **Gru's Plan**: Plans that go wrong
- **Tuxedo Winnie the Pooh**: Sophisticated vs basic versions
- **Is This a Pigeon**: Misidentifying things
- **Panik Kalm Panik**: Emotional rollercoaster situations

## Pricing
- **Cost**: 10 credits per meme generation
- **Free Tier**: Limited credits for testing
- **Paid Plans**: Starting from ₹833/month (~$10/month)
- **Creator Plan**: 120,000 credits/year (12,000 memes)
- **Pro Plan**: 600,000 credits/year (60,000 memes)

## Technical Details

### API Integration
```javascript
// Example API call
const result = await magicHourAPI.generateMemeComplete(
  "When you finally understand React hooks", // concept
  "drake-hotline-bling",                     // template (optional)
  { 
    searchWeb: false,                        // include recent events
    name: "My React Meme"                    // meme name
  }
);
```

### Response Format
```javascript
{
  id: "unique-generation-id",
  imageUrl: "https://generated-meme-url.jpg",
  concept: "Your original concept",
  template: "drake-hotline-bling",
  credits_charged: 10,
  timestamp: "2024-01-01T00:00:00.000Z"
}
```

## Comparison with Existing Features

### Traditional Mode (Existing)
- Choose template manually
- Write text manually  
- Position text manually
- Uses Imgflip templates + Firebase AI for text suggestions

### AI Mode (New - Magic Hour)
- Describe concept only
- AI writes all text
- AI positions text perfectly
- Professional meme generation service

## Error Handling
- ❌ **API Key Missing**: Shows setup instructions
- ❌ **Invalid Concept**: Validates input (3-200 characters)
- ❌ **Generation Failed**: Shows error with fallback options
- ❌ **Credits Exhausted**: Directs to Magic Hour billing

## Best Practices
1. **Be Specific**: "When you debug for 3 hours and fix it with one character" vs "debugging"
2. **Use Relatable Scenarios**: Focus on common experiences
3. **Keep Under 200 Characters**: API has text limits
4. **Test with Free Credits**: Try different concepts before going live

## Troubleshooting

### "API key not configured"
- Check `.env` file has `VITE_MAGIC_HOUR_API_KEY`
- Restart development server after adding

### "Generation timeout"
- Magic Hour servers may be busy
- Try again after a few minutes
- Check [Magic Hour Status](https://status.magichour.ai/)

### "Credits exhausted"
- Check your Magic Hour dashboard
- Upgrade plan or purchase more credits

### "Inappropriate content"
- Magic Hour has content filters
- Use appropriate, family-friendly concepts

## Support
- **Magic Hour Support**: [support@magichour.ai](mailto:support@magichour.ai)
- **Documentation**: [docs.magichour.ai](https://docs.magichour.ai/)
- **Status Page**: [status.magichour.ai](https://status.magichour.ai/)

---

This integration adds professional AI meme generation to complement your existing template-based system!