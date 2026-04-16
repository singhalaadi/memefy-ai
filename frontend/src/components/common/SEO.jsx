import { useEffect } from 'react';

/**
 * Custom SEO Component to manage document title and meta information
 * @param {string} title - The page title
 * @param {string} description - The meta description
 * @param {string} keywords - Meta keywords
 */
const SEO = ({ title, description, keywords }) => {
  useEffect(() => {
    // Update Document Title
    const fullTitle = title ? `${title} | MEMEFY AI` : 'MEMEFY AI - Viral Meme Generator';
    document.title = fullTitle;

    // Update Meta Description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description || 'Create viral memes instantly with AI-powered suggestions and trending templates.');
    }

    // Update Meta Keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords || 'meme, ai, generator, viral, trending, memes, automation');
    }
  }, [title, description, keywords]);

  return null; // This component doesn't render anything
};

export default SEO;
