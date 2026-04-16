// Magic Hour AI Meme Generator API Service
class MagicHourAPIService {
    constructor() {
        this.baseURL = 'https://api.magichour.ai/v1';
        this.apiKey = import.meta.env.VITE_MAGIC_HOUR_API_KEY;
    }

    // Check if API key is configured
    isConfigured() {
        return !!this.apiKey;
    }

    // Get available meme templates from Magic Hour
    getAvailableTemplates() {
        return [
            {
                id: 'Random',
                name: 'Random',
                description: 'Let AI choose the best template for your concept',
                category: 'AI'
            },
            {
                id: 'Drake Hotline Bling',
                name: 'Drake Hotline Bling',
                description: 'Classic preference/comparison meme',
                category: 'Popular'
            },
            {
                id: 'Galaxy Brain',
                name: 'Galaxy Brain',
                description: 'Expanding brain meme for escalating ideas',
                category: 'Popular'
            },
            {
                id: 'Two Buttons',
                name: 'Two Buttons',
                description: 'Difficult choice scenarios',
                category: 'Popular'
            },
            {
                id: 'Gru\'s Plan',
                name: 'Gru\'s Plan',
                description: 'Plans that go wrong',
                category: 'Popular'
            },
            {
                id: 'Tuxedo Winnie The Pooh',
                name: 'Tuxedo Winnie The Pooh',
                description: 'Sophisticated vs basic versions',
                category: 'Classic'
            },
            {
                id: 'Is This a Pigeon',
                name: 'Is This a Pigeon',
                description: 'Misidentifying things',
                category: 'Classic'
            },
            {
                id: 'Panik Kalm Panik',
                name: 'Panik Kalm Panik',
                description: 'Emotional rollercoaster situations',
                category: 'Trending'
            },
            {
                id: 'Disappointed Guy',
                name: 'Disappointed Guy',
                description: 'Disappointment and frustration scenarios',
                category: 'Trending'
            },
            {
                id: 'Waiting Skeleton',
                name: 'Waiting Skeleton',
                description: 'Long waiting and patience scenarios',
                category: 'Classic'
            },
            {
                id: 'Bike Fall',
                name: 'Bike Fall',
                description: 'Self-sabotage and blame scenarios',
                category: 'Trending'
            },
            {
                id: 'Change My Mind',
                name: 'Change My Mind',
                description: 'Strong opinions and debate starters',
                category: 'Classic'
            },
            {
                id: 'Side Eyeing Chloe',
                name: 'Side Eyeing Chloe',
                description: 'Suspicious and judgmental looks',
                category: 'Trending'
            }
        ];
    }

    // Generate AI meme using Magic Hour API
    async generateAIMeme(concept, template = 'random', options = {}) {
        if (!this.isConfigured()) {
            throw new Error('Magic Hour API key not configured. Please add VITE_MAGIC_HOUR_API_KEY to your environment variables.');
        }

        try {
            const requestBody = {
                name: options.name || `AI Meme - ${concept.substring(0, 30)}`,
                style: {
                    template: template,
                    topic: concept,
                    search_web: options.searchWeb || false
                }
            };

            const response = await fetch(`${this.baseURL}/ai-meme-generator`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Magic Hour API error: ${response.status} - ${errorData.message || response.statusText}`);
            }

            const result = await response.json();
            return {
                id: result.id,
                credits_charged: result.credits_charged,
                status: 'generating',
                concept: concept,
                template: template,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            throw error;
        }
    }

    // Get meme generation status and result
    async getMemeStatus(memeId) {
        if (!this.isConfigured()) {
            throw new Error('Magic Hour API key not configured');
        }

        try {
            const response = await fetch(`${this.baseURL}/image-projects/${memeId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to get meme status: ${response.status}`);
            }

            const result = await response.json();

            // Extract image URL from downloads array (Magic Hour API format)
            const imageUrl = result.downloads?.[0]?.url ||
                result.outputs?.[0]?.url ||
                result.output_url ||
                result.image_url;

            return {
                id: result.id,
                status: result.status,
                imageUrl: imageUrl,
                progress: result.progress,
                error: result.error || result.error_message,
                expiresAt: result.downloads?.[0]?.expires_at
            };

        } catch (error) {
            throw error;
        }
    }

    // Poll for meme completion
    async waitForMemeCompletion(memeId, maxWaitTime = 120000, onProgress = null) {
        const startTime = Date.now();
        let pollInterval = 3000; // Start with 3 seconds
        let attemptCount = 0;

        return new Promise((resolve, reject) => {
            const poll = async () => {
                try {
                    attemptCount++;

                    const status = await this.getMemeStatus(memeId);

                    // Call progress callback if provided
                    if (onProgress) {
                        onProgress(status);
                    }

                    // Check for completion (Magic Hour uses 'complete' status)
                    if (status.status === 'complete' || status.status === 'completed' || status.status === 'success') {
                        if (status.imageUrl) {
                            resolve(status);
                            return;
                        } else {

                            // If status is complete but no imageURL, it might be an error
                            if (attemptCount > 3) {
                                try {
                                    const rawResponse = await this.getRawStatus(memeId);

                                    if (rawResponse.downloads && rawResponse.downloads.length === 0) {
                                        reject(new Error('Generation completed but no downloads available. This might be due to content policy violations or API processing issues.'));
                                    } else {
                                        reject(new Error('Generation completed but image URL extraction failed.'));
                                    }
                                } catch (debugError) {
                                    reject(new Error('Generation completed but no image was produced.'));
                                }
                                return;
                            }
                        }
                    }

                    // Check for failure
                    if (status.status === 'failed' || status.status === 'error') {
                        reject(new Error(status.error || 'Meme generation failed'));
                        return;
                    }

                    // Check timeout
                    const elapsed = Date.now() - startTime;
                    if (elapsed > maxWaitTime) {
                        reject(new Error(`Meme generation timeout after ${Math.round(elapsed / 1000)}s. Status: ${status.status}`));
                        return;
                    }

                    // Adaptive polling - increase interval over time
                    if (attemptCount > 10) {
                        pollInterval = 5000; // 5 seconds after 10 attempts
                    }
                    if (attemptCount > 20) {
                        pollInterval = 8000; // 8 seconds after 20 attempts
                    }

                    // Continue polling
                    setTimeout(poll, pollInterval);

                } catch (error) {
                    // If it's a network error, retry a few times
                    if (attemptCount < 5 && (error.message.includes('fetch') || error.message.includes('network'))) {
                        setTimeout(poll, 5000);
                        return;
                    }

                    reject(error);
                }
            };

            // Start polling immediately
            poll();
        });
    }

    // Generate meme and wait for completion (convenience method)
    async generateMemeComplete(concept, template = 'Random', options = {}) {
        try {
            console.log(`Starting meme generation for concept: "${concept}" with template: "${template}"`);

            // Start generation
            const generation = await this.generateAIMeme(concept, template, options);

            // Wait for completion
            const completed = await this.waitForMemeCompletion(
                generation.id,
                120000 // 2 minutes timeout
            );

            return {
                ...completed,
                concept: concept,
                template: template,
                credits_charged: generation.credits_charged
            };

        } catch (error) {
            throw error;
        }
    }

    // Get suggested templates for a concept
    getSuggestedTemplate(concept) {
        const conceptLower = concept.toLowerCase();

        if (conceptLower.includes('choose') || conceptLower.includes('decision') || conceptLower.includes('vs')) {
            return 'Two Buttons';
        }

        if (conceptLower.includes('prefer') || conceptLower.includes('like') || conceptLower.includes('better')) {
            return 'Drake Hotline Bling';
        }

        if (conceptLower.includes('smart') || conceptLower.includes('brain') || conceptLower.includes('upgrade')) {
            return 'Galaxy Brain';
        }

        if (conceptLower.includes('plan') || conceptLower.includes('strategy') || conceptLower.includes('backfire')) {
            return 'Gru\'s Plan';
        }

        if (conceptLower.includes('panic') || conceptLower.includes('calm') || conceptLower.includes('stress')) {
            return 'Panik Kalm Panik';
        }

        if (conceptLower.includes('fancy') || conceptLower.includes('sophisticated') || conceptLower.includes('classy')) {
            return 'Tuxedo Winnie The Pooh';
        }

        if (conceptLower.includes('wait') || conceptLower.includes('patience') || conceptLower.includes('slow')) {
            return 'Waiting Skeleton';
        }

        if (conceptLower.includes('disappoint') || conceptLower.includes('unsatisfied') || conceptLower.includes('meh')) {
            return 'Disappointed Guy';
        }

        if (conceptLower.includes('blame') || conceptLower.includes('fault') || conceptLower.includes('sabotage')) {
            return 'Bike Fall';
        }

        if (conceptLower.includes('opinion') || conceptLower.includes('debate') || conceptLower.includes('convince')) {
            return 'Change My Mind';
        }

        if (conceptLower.includes('suspicious') || conceptLower.includes('doubt') || conceptLower.includes('judge')) {
            return 'Side Eyeing Chloe';
        }

        // Default to random for best AI selection
        return 'Random';
    }

    // Validate concept for meme generation
    validateConcept(concept) {
        if (!concept || typeof concept !== 'string') {
            return { valid: false, error: 'Concept is required and must be a string' };
        }

        if (concept.trim().length < 3) {
            return { valid: false, error: 'Concept must be at least 3 characters long' };
        }

        if (concept.length > 200) {
            return { valid: false, error: 'Concept must be less than 200 characters' };
        }

        // Check for inappropriate content (basic)
        const inappropriate = ['nsfw', 'explicit', 'hate', 'violence'];
        if (inappropriate.some(word => concept.toLowerCase().includes(word))) {
            return { valid: false, error: 'Concept contains inappropriate content' };
        }

        return { valid: true };
    }

    // Get example concepts for inspiration
    getExampleConcepts() {
        return [
            "When you finally understand a complex concept",
            "Trying to explain crypto to your parents",
            "Monday morning vs Friday afternoon energy",
            "Me pretending to be productive while procrastinating",
            "When the code works on the first try",
            "Choosing between sleep and one more episode",
            "When AI does your homework better than you",
            "The evolution of my weekend plans",
            "When someone says 'it's not that complicated'",
            "Me trying to adult in 2024"
        ];
    }

    // Get raw API response
    async getRawStatus(memeId) {
        if (!this.isConfigured()) {
            throw new Error('Magic Hour API key not configured');
        }

        try {
            const response = await fetch(`${this.baseURL}/image-projects/${memeId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to get meme status: ${response.status}`);
            }

            const result = await response.json();
            return result;

        } catch (error) {
            throw error;
        }
    }


}

const magicHourAPIInstance = new MagicHourAPIService();
export default magicHourAPIInstance;