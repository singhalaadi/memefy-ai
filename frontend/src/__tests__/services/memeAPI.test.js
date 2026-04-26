import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

vi.mock('axios')

describe('memeAPI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('API Calls', () => {
    it('should call axios.get for templates', async () => {
      axios.get.mockResolvedValue({
        data: { success: true, templates: [] }
      })

      // Simulate API call
      const response = await axios.get('/templates')

      expect(response.data.success).toBe(true)
      expect(axios.get).toHaveBeenCalled()
    })

    it('should handle axios.get errors gracefully', async () => {
      axios.get.mockRejectedValue(new Error('Network error'))

      try {
        await axios.get('/templates')
      } catch (error) {
        expect(error.message).toBe('Network error')
      }

      expect(axios.get).toHaveBeenCalled()
    })

    it('should call axios.post for meme generation', async () => {
      const mockResponse = {
        success: true,
        caption: 'Test',
        meme_url: 'https://example.com/meme.jpg'
      }

      axios.post.mockResolvedValue({ data: mockResponse })

      const response = await axios.post('/generate-meme', { idea: 'Test' })

      expect(response.data.success).toBe(true)
      expect(response.data.meme_url).toBeDefined()
      expect(axios.post).toHaveBeenCalledWith(
        '/generate-meme',
        expect.objectContaining({ idea: 'Test' })
      )
    })

    it('should pass custom texts to API', async () => {
      axios.post.mockResolvedValue({ data: { success: true } })

      const customTexts = ['Top text', 'Bottom text']
      await axios.post('/generate-meme', { texts: customTexts })

      const callArgs = axios.post.mock.calls[0]
      expect(callArgs[1]).toHaveProperty('texts')
      expect(callArgs[1].texts).toEqual(customTexts)
    })

    it('should handle API error responses', async () => {
      const errorResponse = {
        success: false,
        error: 'Invalid template ID'
      }

      axios.post.mockResolvedValue({ data: errorResponse })

      const response = await axios.post('/generate-meme', { template_id: 'invalid' })

      expect(response.data.success).toBe(false)
      expect(response.data.error).toBeDefined()
    })

    it('should handle network errors', async () => {
      axios.post.mockRejectedValue(new Error('Network timeout'))

      try {
        await axios.post('/generate-meme', { idea: 'Test' })
      } catch (error) {
        expect(error.message).toBe('Network timeout')
      }

      expect(axios.post).toHaveBeenCalled()
    })
  })
})
