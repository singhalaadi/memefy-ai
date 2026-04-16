class MemeApiService {
  constructor() {
    this.backendUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';
  }

  /**
   * Fetch templates via backend proxy
   */
  async fetchTemplates() {
    try {
      const response = await fetch(`${this.backendUrl}/templates`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error('Backend returned error during template fetch');
      }

      // Transform the Imgflip API response to match our expected format
      return this.transformTemplates(data.templates);
    } catch (error) {
      console.error('Template fetch failed, using fallbacks:', error);
      return this.getFallbackTemplates();
    }
  }

  transformTemplates(memes) {
    return memes.map(meme => ({
      id: meme.id,
      name: meme.name,
      image: meme.url,
      category: this.categorizeTemplate(meme.name),
      box_count: meme.box_count || 2,
      width: meme.width,
      height: meme.height
    }));
  }

  categorizeTemplate(name) {
    if (!name) return 'All';
    const lowerName = name.toLowerCase();
    if (lowerName.includes('drake') || lowerName.includes('boyfriend') || lowerName.includes('woman yelling') || lowerName.includes('buttons')) return 'Popular';
    if (lowerName.includes('brain') || lowerName.includes('change my mind') || lowerName.includes('is fine') || lowerName.includes('ancient aliens')) return 'Classic';
    if (lowerName.includes('mario') || lowerName.includes('pokemon') || lowerName.includes('gaming') || lowerName.includes('minecraft')) return 'Gaming';
    if (lowerName.includes('reaction') || lowerName.includes('pikachu') || lowerName.includes('hide the pain')) return 'Reaction';
    if (lowerName.includes('stonks') || lowerName.includes('panik') || lowerName.includes('chad') || lowerName.includes('pepe')) return 'Trending';
    return 'Popular';
  }

  getFallbackTemplates() {
    return [
      { id: '181913649', name: 'Drake Hotline Bling', image: 'https://i.imgflip.com/30b1gx.jpg', category: 'Popular', box_count: 2 },
      { id: '112126428', name: 'Distracted Boyfriend', image: 'https://i.imgflip.com/1ur9b0.jpg', category: 'Popular', box_count: 3 },
      { id: '87743020', name: 'Two Buttons', image: 'https://i.imgflip.com/1g8my4.jpg', category: 'Popular', box_count: 2 }
    ];
  }

  /**
   * Generate AI-powered meme using your trained backend model
   */
  async generateAIMeme(idea = null, caption = null, templateId = null, texts = null) {
    try {
      const response = await fetch(`${this.backendUrl}/generate-meme`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idea: idea,
          caption: caption,
          template_id: templateId,
          texts: texts
        })
      });

      if (!response.ok) {
        throw new Error(`Backend API error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Generation failed');
      }
      
      return {
        success: true,
        caption: data.caption,
        sentiment: data.sentiment,
        toxicityScore: data.toxicity_score,
        template: data.template,
        templateTrending: data.template_trending,
        templateRecentUsage: data.template_recent_usage,
        memeUrl: data.meme_url
      };
    } catch (error) {
      throw new Error(`Failed to generate AI meme: ${error.message}`);
    }
  }

  async checkBackendHealth() {
    try {
      const response = await fetch(`${this.backendUrl}/`);
      const data = await response.json();
      return data.status === 'healthy';
    } catch (error) {
      return false;
    }
  }
}

export default new MemeApiService();