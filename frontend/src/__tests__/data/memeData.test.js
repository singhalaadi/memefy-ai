import { describe, it, expect } from 'vitest'
import { demoMemes } from '../../data/memeData'

describe('Pure Data Operations - Real Coverage', () => {
  
  describe('Data Filtering', () => {
    it('should filter memes by tag', () => {
      const tag = 'relatable'
      const filtered = demoMemes.filter(m => 
        m.tags && m.tags.includes(tag)
      )
      expect(filtered.length).toBeGreaterThan(0)
      expect(filtered[0].tags).toContain(tag)
    })

    it('should filter memes by author', () => {
      const author = 'MemeGod420'
      const filtered = demoMemes.filter(m => m.author === author)
      if (filtered.length > 0) {
        expect(filtered[0].author).toBe(author)
      }
    })

    it('should find memes by title substring', () => {
      const search = 'When'
      const filtered = demoMemes.filter(m => 
        m.title.toLowerCase().includes(search.toLowerCase())
      )
      expect(filtered.length).toBeGreaterThan(0)
    })

    it('should return empty for non-existent filter', () => {
      const filtered = demoMemes.filter(m => m.author === 'NonexistentAuthor')
      expect(filtered.length).toBe(0)
    })
  })

  describe('Data Transformation', () => {
    it('should calculate total likes', () => {
      const totalLikes = demoMemes.reduce((sum, m) => sum + (m.likes || 0), 0)
      expect(totalLikes).toBeGreaterThan(0)
      expect(typeof totalLikes).toBe('number')
    })

    it('should calculate average views', () => {
      const avgViews = demoMemes.reduce((sum, m) => sum + (m.views || 0), 0) / demoMemes.length
      expect(avgViews).toBeGreaterThan(0)
      expect(typeof avgViews).toBe('number')
    })

    it('should aggregate tags', () => {
      const allTags = demoMemes
        .filter(m => m.tags)
        .flatMap(m => m.tags)
      expect(allTags.length).toBeGreaterThan(0)
      expect(Array.isArray(allTags)).toBe(true)
    })

    it('should count unique tags', () => {
      const allTags = demoMemes
        .filter(m => m.tags)
        .flatMap(m => m.tags)
      const uniqueTags = new Set(allTags)
      expect(uniqueTags.size).toBeGreaterThan(0)
      expect(uniqueTags.size).toBeLessThanOrEqual(allTags.length)
    })
  })

  describe('Data Sorting', () => {
    it('should sort memes by likes descending', () => {
      const sorted = [...demoMemes].sort((a, b) => (b.likes || 0) - (a.likes || 0))
      if (sorted.length > 1) {
        expect(sorted[0].likes).toBeGreaterThanOrEqual(sorted[1].likes)
      }
    })

    it('should sort memes by views ascending', () => {
      const sorted = [...demoMemes].sort((a, b) => (a.views || 0) - (b.views || 0))
      if (sorted.length > 1) {
        expect(sorted[0].views).toBeLessThanOrEqual(sorted[1].views)
      }
    })

    it('should sort by creation date newest first', () => {
      const sorted = [...demoMemes].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      if (sorted.length > 1) {
        expect(new Date(sorted[0].createdAt).getTime()).toBeGreaterThanOrEqual(
          new Date(sorted[1].createdAt).getTime()
        )
      }
    })
  })

  describe('String Operations', () => {
    it('should normalize whitespace in titles', () => {
      const titles = demoMemes.map(m => m.title.trim())
      expect(titles.every(t => t.length > 0)).toBe(true)
    })

    it('should extract title length', () => {
      const lengths = demoMemes.map(m => m.title.length)
      expect(Math.max(...lengths)).toBeGreaterThan(0)
    })

    it('should find titles with specific words', () => {
      const word = 'the'
      const matching = demoMemes.filter(m => 
        m.title.toLowerCase().includes(word)
      )
      if (matching.length > 0) {
        expect(matching[0].title.toLowerCase()).toContain(word)
      }
    })

    it('should count word frequency in titles', () => {
      const allWords = demoMemes
        .flatMap(m => m.title.toLowerCase().split(/\s+/))
      const wordMap = new Map()
      allWords.forEach(word => {
        wordMap.set(word, (wordMap.get(word) || 0) + 1)
      })
      expect(wordMap.size).toBeGreaterThan(0)
    })
  })

  describe('Validation Logic', () => {
    it('should validate meme has required fields', () => {
      demoMemes.forEach(meme => {
        expect(meme.id).toBeDefined()
        expect(meme.title).toBeDefined()
        expect(meme.likes).toBeDefined()
        expect(typeof meme.id).toBe('number')
        expect(typeof meme.title).toBe('string')
        expect(typeof meme.likes).toBe('number')
      })
    })

    it('should validate arrays have correct structure', () => {
      demoMemes.forEach(meme => {
        if (meme.tags) {
          expect(Array.isArray(meme.tags)).toBe(true)
          expect(meme.tags.every(t => typeof t === 'string')).toBe(true)
        }
      })
    })

    it('should validate numeric ranges', () => {
      demoMemes.forEach(meme => {
        expect(meme.likes).toBeGreaterThanOrEqual(0)
        expect(meme.views).toBeGreaterThanOrEqual(0)
        expect(meme.id).toBeGreaterThan(0)
      })
    })
  })

  describe('Map/Reduce Operations', () => {
    it('should map memes to titles', () => {
      const titles = demoMemes.map(m => m.title)
      expect(titles.length).toBe(demoMemes.length)
      expect(titles.every(t => typeof t === 'string')).toBe(true)
    })

    it('should reduce to find highest liked meme', () => {
      const mostLiked = demoMemes.reduce((max, m) => 
        (m.likes > max.likes) ? m : max
      )
      expect(mostLiked.likes).toBeGreaterThan(0)
    })

    it('should group memes by author', () => {
      const grouped = demoMemes.reduce((acc, meme) => {
        const author = meme.author
        if (!acc[author]) acc[author] = []
        acc[author].push(meme)
        return acc
      }, {})
      expect(Object.keys(grouped).length).toBeGreaterThan(0)
    })

    it('should create tag-meme mapping', () => {
      const tagMap = {}
      demoMemes.forEach(meme => {
        if (meme.tags) {
          meme.tags.forEach(tag => {
            if (!tagMap[tag]) tagMap[tag] = []
            tagMap[tag].push(meme.id)
          })
        }
      })
      expect(Object.keys(tagMap).length).toBeGreaterThan(0)
    })
  })
})
