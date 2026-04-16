// Meme Template API Service using Imgflip API
const IMGFLIP_API_BASE_URL = 'https://api.imgflip.com';
class MemeApiService {
  constructor() {

  }
  async fetchTemplates() {
    try {
      const url = `${IMGFLIP_API_BASE_URL}/get_memes`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error('Imgflip API returned error: ' + data.error_message);
      }

      // Transform the Imgflip API response to match our expected format
      return this.transformImgflipTemplates(data.data.memes);
    } catch (error) {

      // Return fallback templates if API fails
      return this.getFallbackTemplates();
    }
  }

  transformImgflipTemplates(memes) {
    return memes.map(meme => ({
      id: meme.id,
      name: meme.name,
      image: meme.url,
      category: this.categorizeTemplate(meme.name),
      box_count: meme.box_count,
      width: meme.width,
      height: meme.height
    }));
  }

  transformTemplates(apiData) {
    // Transform API response to our expected format
    if (Array.isArray(apiData)) {
      return apiData.map((template, index) => ({
        id: template.id || `template-${index}`,
        name: template.name || `Template ${index + 1}`,
        image: template.url || template.image || template.blank,
        category: this.categorizeTemplate(template.name),
        box_count: template.box_count || 2,
        width: template.width || 500,
        height: template.height || 500
      }));
    }

    // If data has templates property
    if (apiData.templates) {
      return apiData.templates.map((template, index) => ({
        id: template.id || `template-${index}`,
        name: template.name || `Template ${index + 1}`,
        image: template.url || template.image || template.blank,
        category: this.categorizeTemplate(template.name),
        box_count: template.box_count || 2,
        width: template.width || 500,
        height: template.height || 500
      }));
    }

    return this.getFallbackTemplates();
  }

  categorizeTemplate(name) {
    if (!name) return 'All';

    const lowerName = name.toLowerCase();

    // Popular memes
    if (lowerName.includes('drake') || lowerName.includes('distracted boyfriend') ||
      lowerName.includes('woman yelling at cat') || lowerName.includes('two buttons') ||
      lowerName.includes('success kid') || lowerName.includes('bad luck brian') ||
      lowerName.includes('overly attached girlfriend')) {
      return 'Popular';
    }

    // Classic memes
    if (lowerName.includes('expanding brain') || lowerName.includes('change my mind') ||
      lowerName.includes('this is fine') || lowerName.includes('philosoraptor') ||
      lowerName.includes('ancient aliens') || lowerName.includes('y u no') ||
      lowerName.includes('first world problems')) {
      return 'Classic';
    }

    // Gaming memes
    if (lowerName.includes('mario') || lowerName.includes('pokemon') ||
      lowerName.includes('gaming') || lowerName.includes('minecraft') ||
      lowerName.includes('gamer')) {
      return 'Gaming';
    }

    // Reaction memes
    if (lowerName.includes('reaction') || lowerName.includes('face you make') ||
      lowerName.includes('surprised pikachu') || lowerName.includes('hide the pain') ||
      lowerName.includes('awkward') || lowerName.includes('facepalm')) {
      return 'Reaction';
    }

    // Trending (newer/popular templates)
    if (lowerName.includes('stonks') || lowerName.includes('panik') ||
      lowerName.includes('kalm') || lowerName.includes('chad') ||
      lowerName.includes('wojak') || lowerName.includes('pepe')) {
      return 'Trending';
    }

    return 'Popular';
  }

  getFallbackTemplates() {
    return [
      {
        id: 'fallback-1',
        name: 'Drake Pointing',
        image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop',
        category: 'Popular',
        box_count: 2,
        width: 400,
        height: 400
      },
      {
        id: 'fallback-2',
        name: 'Distracted Boyfriend',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        category: 'Popular',
        box_count: 3,
        width: 400,
        height: 400
      },
      {
        id: 'fallback-3',
        name: 'Woman Yelling at Cat',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
        category: 'Trending',
        box_count: 2,
        width: 400,
        height: 400
      },
      {
        id: 'fallback-4',
        name: 'Expanding Brain',
        image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&h=400&fit=crop',
        category: 'Classic',
        box_count: 4,
        width: 400,
        height: 400
      },
      {
        id: 'fallback-5',
        name: 'Change My Mind',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
        category: 'Classic',
        box_count: 1,
        width: 400,
        height: 400
      },
      {
        id: 'fallback-6',
        name: 'This Is Fine',
        image: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=400&h=400&fit=crop',
        category: 'Reaction',
        box_count: 1,
        width: 400,
        height: 400
      },
      {
        id: 'fallback-7',
        name: 'Success Kid',
        image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=400&fit=crop',
        category: 'Classic',
        box_count: 1,
        width: 400,
        height: 400
      },
      {
        id: 'fallback-8',
        name: 'Surprised Pikachu',
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop',
        category: 'Gaming',
        box_count: 1,
        width: 400,
        height: 400
      }
    ];
  }

  async generateMeme(templateId, texts) {
    try {
      const url = `${API_BASE_URL}/generate`;
      const options = {
        method: 'POST',
        headers: {
          ...this.baseHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template_id: templateId,
          texts: texts
        })
      };

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {

      throw error;
    }
  }
}

export default new MemeApiService();