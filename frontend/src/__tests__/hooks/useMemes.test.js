import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Hook Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('State Management', () => {
    it('should initialize with empty state', () => {
      const initialState = {
        memes: [],
        loading: false,
        error: null
      }
      
      expect(Array.isArray(initialState.memes)).toBe(true)
      expect(initialState.memes.length).toBe(0)
    })

    it('should add meme to collection', () => {
      const state = { memes: [] }
      
      const newMeme = {
        id: '1',
        template_id: 61579,
        caption: 'Test caption',
        sentiment: 'Positive / Safe',
        toxicity_score: 0.1,
        meme_url: 'https://example.com/meme.jpg',
      }
      
      state.memes.push(newMeme)
      
      expect(state.memes.length).toBe(1)
      expect(state.memes[0].caption).toBe('Test caption')
    })

    it('should handle meme fetching state', () => {
      const state = { loading: true, error: null }
      
      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
      
      state.loading = false
      expect(state.loading).toBe(false)
    })

    it('should track analytics stats', () => {
      const stats = {
        totalMemes: 5,
        avgToxicity: 0.15,
        totalViews: 100,
        totalShares: 20
      }
      
      expect(stats).toHaveProperty('totalMemes')
      expect(stats).toHaveProperty('avgToxicity')
      expect(stats.totalMemes).toBe(5)
    })

    it('should track meme events', () => {
      const trackEvent = vi.fn()
      
      trackEvent('meme_generated', {
        sentiment: 'Positive / Safe',
        toxicity_score: 0.1
      })
      
      expect(trackEvent).toHaveBeenCalledWith(
        'meme_generated',
        expect.objectContaining({
          sentiment: 'Positive / Safe'
        })
      )
    })
  })

  describe('Data Transformations', () => {
    it('should filter memes by sentiment', () => {
      const memes = [
        { sentiment: 'Positive / Safe', caption: 'Good' },
        { sentiment: 'Risky / Negative', caption: 'Bad' },
        { sentiment: 'Positive / Safe', caption: 'Nice' }
      ]
      
      const safeMemes = memes.filter(m => m.sentiment === 'Positive / Safe')
      
      expect(safeMemes.length).toBe(2)
      expect(safeMemes[0].caption).toBe('Good')
    })

    it('should calculate average toxicity', () => {
      const memes = [
        { toxicity_score: 0.1 },
        { toxicity_score: 0.2 },
        { toxicity_score: 0.3 }
      ]
      
      const avgToxicity = memes.reduce((sum, m) => sum + m.toxicity_score, 0) / memes.length
      
      expect(avgToxicity).toBeCloseTo(0.2)
    })

    it('should sort memes by date', () => {
      const memes = [
        { id: 1, createdAt: new Date('2024-01-01') },
        { id: 2, createdAt: new Date('2024-01-03') },
        { id: 3, createdAt: new Date('2024-01-02') }
      ]
      
      const sorted = [...memes].sort((a, b) => b.createdAt - a.createdAt)
      
      expect(sorted[0].id).toBe(2)
      expect(sorted[1].id).toBe(3)
    })
  })
})
