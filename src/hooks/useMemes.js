import { useState, useEffect } from 'react'
import { db } from '../config/firebase'
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore'
import toast from 'react-hot-toast'
import memeApiService from '../services/memeAPI'

export const useMemes = () => {
  const [memes, setMemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState([])
  const [templatesLoading, setTemplatesLoading] = useState(true)

  useEffect(() => {
    fetchMemes()
    fetchTemplates()
  }, [])

  const fetchMemes = async () => {
    try {
      const memesRef = collection(db, 'memes')
      const q = query(memesRef, orderBy('createdAt', 'desc'))
      
      const querySnapshot = await getDocs(q)
      const memesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      setMemes(memesData)
    } catch (error) {
      console.error('Error fetching memes:', error)
      // Fallback to demo data if Firebase is not configured
      setMemes(generateDemoMemes())
    } finally {
      setLoading(false)
    }
  }

  const generateDemoMemes = () => [
    {
      id: 'demo-meme-1',
      title: 'Epic Fail Cat',
      imageUrl: 'https://images.pexels.com/photos/1472999/pexels-photo-1472999.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: 'Meme Master',
      likes: 156,
      shares: 23,
      createdAt: new Date().toISOString(),
      category: 'Popular'
    },
    {
      id: 'demo-meme-2',
      title: 'Monday Mood Vibes',
      imageUrl: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: 'Gen-Z Creator',
      likes: 234,
      shares: 45,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      category: 'Trending'
    },
    {
      id: 'demo-meme-3',
      title: 'Weekend Energy',
      imageUrl: 'https://images.pexels.com/photos/2071882/pexels-photo-2071882.jpeg?auto=compress&cs=tinysrgb&w=400',
      author: 'Meme Lord',
      likes: 89,
      shares: 12,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      category: 'Popular'
    }
  ]

  const fetchTemplates = async () => {
    try {
      setTemplatesLoading(true)
      const templates = await memeApiService.fetchTemplates()
      setTemplates(templates)
      
      // Show success message only if we got templates
      if (templates && templates.length > 0) {
        console.log(`Loaded ${templates.length} meme templates`);
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      
      // Set fallback templates directly if service fails completely
      setTemplates(memeApiService.getFallbackTemplates())
    } finally {
      setTemplatesLoading(false)
    }
  }

  const createMeme = async (memeData) => {
    try {
      const memesRef = collection(db, 'memes')
      const newMeme = {
        ...memeData,
        createdAt: serverTimestamp(),
        likes: 0,
        shares: 0,
        views: 0
      }
      
      const docRef = await addDoc(memesRef, newMeme)
      toast.success('Meme created successfully! 🎉')
      
      // Add the new meme to local state with the generated ID
      const createdMeme = { ...newMeme, id: docRef.id, createdAt: new Date().toISOString() }
      setMemes(prevMemes => [createdMeme, ...prevMemes])
      
      return createdMeme
    } catch (error) {
      console.error('Error creating meme:', error)
      
      // Fallback for demo mode
      if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) {
        const demoMeme = {
          ...memeData,
          id: `demo-${Date.now()}`,
          createdAt: new Date().toISOString(),
          likes: 0,
          shares: 0,
          views: 0
        }
        setMemes(prevMemes => [demoMeme, ...prevMemes])
        toast.success('Demo meme created! 🎮')
        return demoMeme
      }
      
      toast.error('Failed to create meme')
      throw error
    }
  }

  const deleteMeme = async (memeId) => {
    try {
      const memeRef = doc(db, 'memes', memeId)
      await deleteDoc(memeRef)
      
      toast.success('Meme deleted successfully!')
      setMemes(memes.filter(meme => meme.id !== memeId))
    } catch (error) {
      console.error('Error deleting meme:', error)
      
      // Fallback for demo mode
      if (memeId.startsWith('demo-')) {
        setMemes(memes.filter(meme => meme.id !== memeId))
        toast.success('Demo meme deleted!')
        return
      }
      
      toast.error('Failed to delete meme')
    }
  }

  return {
    memes,
    templates,
    loading,
    templatesLoading,
    createMeme,
    deleteMeme,
    refetch: fetchMemes
  }
}