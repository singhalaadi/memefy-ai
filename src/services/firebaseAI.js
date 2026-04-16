// Firebase AI Logic Service for MEMEFY AI
import { getFirebaseApp } from "../config/firebase.js";
import { GoogleGenerativeAI } from '@google/generative-ai';

// Try to import Firebase AI Logic SDK 
let getAI, getGenerativeModel, GoogleAIBackend;

async function loadFirebaseAI() {
  try {
    const firebaseAI = await import('firebase/ai');
    getAI = firebaseAI.getAI;
    getGenerativeModel = firebaseAI.getGenerativeModel;
    GoogleAIBackend = firebaseAI.GoogleAIBackend;
    return true;
  } catch (error) {
    // Firebase AI Logic SDK not available, using direct Google AI approach
    console.log('Firebase AI SDK not available, using Google AI directly');
    return false;
  }
}

class FirebaseAIService {
  constructor() {
    this.genAI = null;
    this.textModel = null;
    this.initializationError = null;
    this.initializeGemini();
  }

  async initializeGemini() {
    try {
      // First try to load Firebase AI Logic SDK
      const firebaseAILoaded = await loadFirebaseAI();
      
      if (firebaseAILoaded && getAI && getGenerativeModel && GoogleAIBackend) {
        try {
          const firebaseApp = getFirebaseApp();
          
          // Initialize Firebase AI Logic backend service
          this.ai = getAI(firebaseApp, { 
            backend: new GoogleAIBackend(),
            apiKey: import.meta.env.VITE_GEMINI_API_KEY
          });
          
          // Create GenerativeModel instance
          this.textModel = getGenerativeModel(this.ai, { model: "gemini-2.5-flash" });
          return;
        } catch (firebaseError) {
          console.warn('Firebase AI Logic initialization failed:', firebaseError.message);
        }
      }
      
      // Fallback to direct Google AI
      this.genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      this.textModel = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
    } catch (error) {
      this.initializationError = `Failed to initialize AI service: ${error.message}`;
      console.error('AI initialization error:', error);
    }
  }

  // Check if AI service is available
  isAvailable() {
    return this.textModel !== null;
  }

  async listAvailableModels() {
    try {
      // Firebase AI Logic doesn't expose listModels directly
      // Return the models supported by Firebase AI Logic
      return ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.5-pro'];
    } catch (error) {
      return ['gemini-2.5-flash'];
    }
  }

  // Generate meme captions based on image analysis or context
  async generateMemeCaption(context) {
    if (!this.textModel) {
      return this.getFallbackCaptions(context);
    }

    try {
      const prompt = `3 meme captions for: "${context}"
      
      Format: {"caption1": "text", "caption2": "text", "caption3": "text"}`;

      const response = await this.textModel.generateContent(prompt);
      let text = response.response.text().trim();

      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '')
        .replace(/^[^{]*/, '').replace(/[^}]*$/, '')
        .trim();

      try {
        const captions = JSON.parse(text);
        return captions;
      } catch (parseError) {
        return this.getFallbackCaptions(context);
      }
    } catch (error) {
      return this.getFallbackCaptions(context);
    }
  }

  getFallbackCaptions(context) {
    return {
      caption1: `When you ${context.toLowerCase()}`,
      caption2: `POV: ${context}`,
      caption3: `Me trying to ${context.toLowerCase()}`
    };
  }

  // Generate meme text based on template and user input
  async generateMemeText(templateName, userPrompt, position = 'top') {
    if (!this.textModel) {

      return this.getFallbackText(userPrompt, position);
    }

    try {
      // Simplified prompt
      const prompt = `${position} text for "${templateName}" meme about: "${userPrompt}"
      
      Make it funny and short (max 10 words). Just return the text:`;

      const response = await this.textModel.generateContent(prompt);
      let text = response.response.text().trim();

      // Clean the response
      text = text.replace(/["""'''`]/g, '').trim();

      return text || this.getFallbackText(userPrompt, position);
    } catch (error) {

      return this.getFallbackText(userPrompt, position);
    }
  }

  getFallbackText(concept, position) {
    if (position === 'top') {
      const topTexts = [
        "When you try to",
        "Me trying to",
        "POV: You're",
        "Everyone:",
        "Nobody:"
      ];
      return topTexts[Math.floor(Math.random() * topTexts.length)];
    } else {
      const bottomTexts = [
        concept.toLowerCase(),
        "It's not that simple",
        "Why is this so hard?",
        "Task failed successfully",
        "This is fine"
      ];
      return bottomTexts[Math.floor(Math.random() * bottomTexts.length)];
    }
  }

  // Generate complete meme concept from user input
  async generateCompleteMeme(templateName, userConcept) {
    return this.generateFallbackMeme(userConcept);
  }

  generateFallbackMeme(userConcept) {
    const concept = userConcept.toLowerCase().trim();

    // Pattern-based meme generation
    if (concept.includes('when ') || concept.startsWith('when ')) {
      return {
        topText: concept.charAt(0).toUpperCase() + concept.slice(1),
        bottomText: 'Life hits different'
      };
    }

    if (concept.includes('trying to') || concept.includes('try to')) {
      return {
        topText: `Me ${concept}`,
        bottomText: 'Why is everything so hard?'
      };
    }

    if (concept.includes('choose') || concept.includes('decision')) {
      return {
        topText: 'Having to choose',
        bottomText: concept
      };
    }

    if (concept.includes('explain') || concept.includes('understand')) {
      return {
        topText: `Me trying to explain`,
        bottomText: concept
      };
    }

    if (concept.includes('vs') || concept.includes('between')) {
      return {
        topText: 'The eternal struggle:',
        bottomText: concept
      };
    }

    // Default patterns
    if (concept.length > 30) {
      // Long concepts - split them
      const words = concept.split(' ');
      const midpoint = Math.floor(words.length / 2);
      return {
        topText: words.slice(0, midpoint).join(' '),
        bottomText: words.slice(midpoint).join(' ')
      };
    }

    // Short concepts - use reaction format
    return {
      topText: 'Me:',
      bottomText: concept
    };
  }

  // Generate meme template suggestions based on concept
  async generateMemeTemplate(concept) {
    // Return template suggestion without AI for now
    return this.getFallbackTemplate(concept);
  }


  getFallbackTemplate(concept) {
    const conceptLower = concept.toLowerCase();

    if (conceptLower.includes('choose') || conceptLower.includes('decision') || conceptLower.includes('option')) {
      return {
        template: "Two Buttons",
        reason: "Perfect for difficult choices and decisions",
        alternatives: ["Drake Pointing", "Distracted Boyfriend"]
      };
    } else if (conceptLower.includes('prefer') || conceptLower.includes('like') || conceptLower.includes('better')) {
      return {
        template: "Drake Pointing",
        reason: "Great for showing preferences and comparisons",
        alternatives: ["Expanding Brain", "Two Buttons"]
      };
    } else if (conceptLower.includes('fine') || conceptLower.includes('okay') || conceptLower.includes('deal')) {
      return {
        template: "This Is Fine",
        reason: "Perfect for situations where you're pretending everything is okay",
        alternatives: ["Drake Pointing", "Distracted Boyfriend"]
      };
    } else if (conceptLower.includes('smart') || conceptLower.includes('brain') || conceptLower.includes('idea')) {
      return {
        template: "Expanding Brain",
        reason: "Excellent for showing escalating ideas or intelligence levels",
        alternatives: ["Drake Pointing", "Galaxy Brain"]
      };
    } else {
      return {
        template: "Drake Pointing",
        reason: "Most versatile template that works for almost any concept",
        alternatives: ["Distracted Boyfriend", "Two Buttons"]
      };
    }
  }

  // Generate meme image using AI
  async generateMemeImage(concept, style = 'meme') {
    if (!this.imageModel) {
      throw new Error('Image generation model not initialized');
    }

    try {
      const prompt = `Create a meme-style image based on: "${concept}"
      
      Style requirements:
      - High contrast, bold colors suitable for meme text overlay
      - Clear, simple composition that works with text
      - Expressive characters or situations
      - Classic meme aesthetic (cartoon, realistic, or photographic)
      - Leave space at top and bottom for text
      - Make it funny and relatable
      
      Generate an image that would work perfectly as a meme template.`;

      const response = await this.imageModel.generateContent(prompt);

      return response;
    } catch (error) {

      throw error;
    }
  }

  // Generate image description for AI image generation (fallback)
  async generateImagePrompt(memeText, style = 'meme') {
    if (!this.textModel) {
      throw new Error('Firebase AI not initialized');
    }

    try {
      const prompt = `Create an image generation prompt for a meme with text: "${memeText}"
      
      Style: ${style}
      
      Rules:
      - Create a detailed visual description
      - Focus on meme-worthy scenarios and expressions
      - Include relevant background, characters, and emotions
      - Make it suitable for text overlay
      - Keep it appropriate and funny
      
      Generate a detailed image prompt for AI image generation:`;

      const response = await this.textModel.generateContent(prompt);
      return response.response.text().trim();
    } catch (error) {

      throw error;
    }
  }

  // Improve existing meme text
  async improveMemeText(originalText, templateName) {
    if (!this.textModel) {
      throw new Error('Firebase AI not initialized');
    }

    try {
      const prompt = `Improve this meme text to make it funnier and more viral: "${originalText}"
      
      Template: ${templateName}
      
      Rules:
      - Keep the same general meaning/context
      - Make it more punchy and memorable
      - Use better meme language
      - Make it more relatable to Gen-Z audience
      - Keep it short and impactful
      - IMPORTANT: Respond ONLY with valid JSON: {"improved1": "text", "improved2": "text"}
      - No additional text, explanations, or formatting`;

      const response = await this.textModel.generateContent(prompt);
      let text = response.response.text().trim();

      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      try {
        return JSON.parse(text);
      } catch (parseError) {
        return { improved1: originalText, improved2: originalText };
      }
    } catch (error) {
      throw error;
    }
  }

  // Analyze image and suggest meme text
  async analyzeMemeTemplate(imageUrl, templateName) {
    if (!this.textModel) {
      throw new Error('Firebase AI not initialized');
    }

    try {

      const prompt = `Generate 3 meme text suggestions for "${templateName}" template.
      
Rules:
      - Create viral, funny combinations
      - Use Gen-Z slang and current trends
      - Each suggestion needs top and bottom text
      - CRITICAL: Respond ONLY with valid JSON, no explanations
      
JSON format:
      {"suggestion1": {"top": "When you", "bottom": "But actually"}, "suggestion2": {"top": "Me trying", "bottom": "Also me"}, "suggestion3": {"top": "POV", "bottom": "Reality"}}`;

      const response = await this.textModel.generateContent(prompt);
      let text = response.response.text().trim();

      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').replace(/^[^{]*/, '').replace(/[^}]*$/, '');

      try {
        const parsed = JSON.parse(text);
        return parsed;
      } catch (parseError) {
        return this.getFallbackSuggestions(templateName);
      }
    } catch (error) {
      throw error;
    }
  }

  // Generate meme from text description (concept to meme)
  async generateMemeFromConcept(concept) {
    try {
      // Try AI first if available
      if (this.textModel) {
        const prompt = `Convert this concept into a meme: "${concept}"
        
        Tasks:
        1. Suggest the best meme template for this concept
        2. Generate top and bottom text
        3. Explain why this template works
        
        Format as JSON:
        {
          "recommendedTemplate": "template name",
          "topText": "text",
          "bottomText": "text",
          "reasoning": "why this works"
        }`;

        const response = await this.textModel.generateContent(prompt);
        const text = response.response.text();

        try {
          const result = JSON.parse(text);
          return result;
        } catch (parseError) {

        }
      }
    } catch (error) {

    }
    return this.generateSmartFallbackMeme(concept);
  }

  // Helper methods
  extractCaptionsFromText(text) {
    const lines = text.split('\n').filter(line => line.trim());
    return {
      caption1: lines[0] || "When you're trying to be funny",
      caption2: lines[1] || "But AI is doing the work",
      caption3: lines[2] || "Modern problems require modern solutions"
    };
  }

  getFallbackSuggestions(templateName) {
    const fallbacks = {
      "Drake Pointing": {
        suggestion1: { top: "Using old memes", bottom: "Using AI-generated memes" },
        suggestion2: { top: "Manual meme creation", bottom: "Automated meme generation" },
        suggestion3: { top: "Basic templates", bottom: "Smart AI suggestions" }
      },
      "Distracted Boyfriend": {
        suggestion1: { top: "Me", bottom: "New AI features" },
        suggestion2: { top: "Old meme tools", bottom: "Firebase AI Logic" },
        suggestion3: { top: "Manual work", bottom: "AI automation" }
      }
    };

    return fallbacks[templateName] || fallbacks["Drake Pointing"];
  }

  // Smart fallback that creates good memes based on concept patterns
  generateSmartFallbackMeme(concept) {
    const conceptLower = concept.toLowerCase();

    // "Me trying to..." pattern
    if (conceptLower.includes('me trying') || conceptLower.includes('trying to')) {
      return {
        recommendedTemplate: "Drake Pointing",
        topText: conceptLower.includes('trying to') ? concept : `Me trying to ${concept}`,
        bottomText: "Reality hitting me",
        reasoning: "Perfect for showing the gap between expectations and reality"
      };
    }

    // "Choose between" pattern
    if (conceptLower.includes('choose') || conceptLower.includes('decision') || conceptLower.includes('between')) {
      return {
        recommendedTemplate: "Two Buttons",
        topText: "Me trying to decide",
        bottomText: concept,
        reasoning: "Great for difficult decisions and choices"
      };
    }

    // "When..." pattern
    if (conceptLower.startsWith('when ')) {
      return {
        recommendedTemplate: "Distracted Boyfriend",
        topText: concept,
        bottomText: "My brain: 'This is fine'",
        reasoning: "Perfect for relatable situations and reactions"
      };
    }

    // "POV" or point of view pattern
    if (conceptLower.includes('pov') || conceptLower.includes('point of view')) {
      return {
        recommendedTemplate: "This Is Fine",
        topText: concept,
        bottomText: "Everything is totally fine",
        reasoning: "Great for perspective-based humor"
      };
    }

    // Subject/topic pattern
    if (conceptLower.includes('math') || conceptLower.includes('physics') || conceptLower.includes('science') || conceptLower.includes('chemistry')) {
      return {
        recommendedTemplate: "Drake Pointing",
        topText: "Easy subjects",
        bottomText: concept,
        reasoning: "Perfect for showing the difficulty of academic subjects"
      };
    }

    // Default fallback - works for most concepts
    return {
      recommendedTemplate: "Drake Pointing",
      topText: "Normal things",
      bottomText: concept,
      reasoning: "This template works well for showing preference and comparison scenarios"
    };
  }

  getFallbackConceptMeme(concept) {
    return this.generateSmartFallbackMeme(concept);
  }

  // Check if service is available (always true since we have smart fallbacks)
  isAvailable() {
    return true;
  }


  async testConnection() {
    try {
      // First try Firebase AI Logic if available
      if (getAI && getGenerativeModel && GoogleAIBackend) {
        try {
          const app = getFirebaseApp();
          const ai = getAI(app, {
            backend: new GoogleAIBackend(),
            apiKey: import.meta.env.VITE_GEMINI_API_KEY
          });
          
          const model = getGenerativeModel(ai, {
            model: 'gemini-2.5-flash'
          });
          
          const result = await model.generateContent("Say 'Firebase AI Logic is working for MEMEFY!' in a fun way");
          const response = result.response;
          const text = response.text();
          
          return {
            success: true,
            method: 'Firebase AI Logic',
            message: text
          };
        } catch (firebaseError) {
          // Firebase AI Logic failed, trying direct Google AI
        }
      }
      
      // Fallback to direct Google AI API
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      
      // Try the available model
      let model;
      try {
        model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      } catch (modelError) {
        model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      }
      
      const result = await model.generateContent("Say 'Direct Google AI is working for MEMEFY!' in a fun way");
      const response = result.response;
      const text = response.text();
      return {
        success: true,
        method: 'Direct Google AI',
        message: text
      };
      
    } catch (error) {
      console.error('All AI connection methods failed:', error);
      const fallbackMessage = `🤖 AI connection failed: ${error.message}. Smart fallbacks are working! ✨`;
      return {
        success: false,
        message: fallbackMessage,
        error: error.message
      };
    }
  }

  // Generate complete AI meme (image + text)
  async generateCompleteMemeWithImage(concept) {
    try {
      // Generate both image and text concurrently
      const [imageResult, textResult] = await Promise.all([
        this.generateMemeImage(concept).catch(err => {

          return null;
        }),
        this.generateCompleteMeme('AI Generated', concept)
      ]);

      return {
        image: imageResult,
        topText: textResult.topText,
        bottomText: textResult.bottomText,
        concept: concept
      };
    } catch (error) {

      throw error;
    }
  }


  async testImageGeneration() {
    // Image generation not available in current Firebase AI setup
    return {
      success: false,
      error: 'Image generation requires different Firebase AI configuration. Coming soon!'
    };
  }
}

export default new FirebaseAIService();