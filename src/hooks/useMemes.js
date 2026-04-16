import { useState, useEffect } from 'react'
import { db } from '../config/firebase'
import {
  collection,
  query,
  orderBy,
  where,
  getDoc,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDocsFromServer
} from 'firebase/firestore'
import toast from 'react-hot-toast'
import memeApiService from '../services/memeAPI'

export const useMemes = (currentUser = null) => {
  const [memes, setMemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState([])
  const [templatesLoading, setTemplatesLoading] = useState(true)

  // Check if we're in demo mode (only for actual demo users)
  const isDemoMode = currentUser?.id === 'demo-user-123' ||
    localStorage.getItem('demoUser') === 'true';

  // Load demo memes from localStorage
  const getDemoMemes = () => {
    if (!isDemoMode) return [];
    const stored = localStorage.getItem('demo-memes');
    return stored ? JSON.parse(stored) : [];
  };

  const saveDemoMemes = (memes) => {
    if (isDemoMode) {
      localStorage.setItem('demo-memes', JSON.stringify(memes));
    }
  };

  useEffect(() => {
    // Initialize with demo memes if in demo mode
    if (isDemoMode) {
      const demoMemes = getDemoMemes();
      if (demoMemes.length > 0) {
        setMemes(demoMemes);
      }
    }
    fetchMemes()
    fetchTemplates()
  }, [isDemoMode])

  // Helper function to resolve image URLs (including locally stored ones)
  const resolveImageUrl = (meme) => {
    if (meme.isLocalImage && meme.image_url) {
      // Retrieve from localStorage
      const storedImage = localStorage.getItem(`meme-image-${meme.image_url}`);
      return storedImage || meme.template_url || meme.image_url;
    }
    return meme.image_url || meme.template_url;
  };

  const fetchMemes = async (userId = null) => {
    try {
      // In demo mode, prioritize local storage
      if (isDemoMode && userId) {
        const demoMemes = getDemoMemes();
        const userDemoMemes = demoMemes.filter(meme => meme.user_id === userId);
        setMemes(userDemoMemes);
        setLoading(false);
        return;
      }

      const memesRef = collection(db, 'memes')
      let q;

      // Use your existing indexes
      if (userId) {
        q = query(memesRef, where('user_id', '==', userId), orderBy('createdAt', 'desc'))
      } else {
        q = query(memesRef, orderBy('createdAt', 'desc'))
      }

      const querySnapshot = await getDocsFromServer(q)

      let memesData = querySnapshot.docs.map(doc => {
        const memeData = { id: doc.id, ...doc.data() };
        memeData.displayImageUrl = resolveImageUrl(memeData);
        return memeData;
      })

      // Add demo memes for gallery view
      if (!userId && isDemoMode) {
        const demoMemes = getDemoMemes();
        memesData = [...demoMemes, ...memesData];
      }

      setMemes(memesData)
    } catch (error) {
      // Only handle specific Firebase permission errors
      if (error?.code === 'permission-denied') {
        if (userId) {
          setMemes([]);
          toast.error('Unable to load your memes. Please check permissions.');
        } else {
          setMemes(generateDemoMemes());
          toast.error('Unable to load gallery. Using demo content.');
        }
      } else {
        // For other errors, show error and use empty state
        toast.error('Error loading memes: ' + (error?.message || 'Unknown error'));
        setMemes([]);
      }
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

      // Successfully loaded templates
    } catch (error) {
      // Use fallback templates if API fails
      setTemplates(memeApiService.getFallbackTemplates())
    } finally {
      setTemplatesLoading(false)
    }
  }

  const createMeme = async (memeData, currentUser = null) => {
    // If in demo mode, create demo meme directly
    if (isDemoMode) {
      const demoMeme = {
        ...memeData,
        id: `demo-${Date.now()}`,
        user_id: currentUser?.id || 'demo-user-123',
        user_email: currentUser?.email || 'demo@example.com',
        createdAt: new Date().toISOString(),
        likes: 0,
        shares: 0,
        views: 0,
        displayImageUrl: resolveImageUrl(memeData)
      }

      // Update local state
      setMemes(prevMemes => [demoMeme, ...prevMemes])

      // Save to localStorage
      const existingDemoMemes = getDemoMemes();
      saveDemoMemes([demoMeme, ...existingDemoMemes]);

      toast.success('Demo meme created successfully! 🎮')
      return demoMeme
    }
    try {
      const memesRef = collection(db, 'memes')
      let processedMemeData = { ...memeData };
      // If image_url is too large (base64), create a reference instead
      if (processedMemeData.image_url && processedMemeData.image_url.length > 500000) {
        // Store large images in browser storage or create a smaller reference
        const imageId = `meme-${Date.now()}`;
        localStorage.setItem(`meme-image-${imageId}`, processedMemeData.image_url);
        processedMemeData.image_url = imageId;
        processedMemeData.isLocalImage = true;
      }
      // Ensure we have a valid user for Firebase
      if (!currentUser?.id && !currentUser?.uid) {
        toast.error('Please sign in to create memes');
        return null;
      }
      // Clean the meme data to prevent Firestore issues
      const cleanMemeData = {
        template_id: processedMemeData.template_id || null,
        template_name: processedMemeData.template_name || '',
        template_image: processedMemeData.template_image || '',
        top_text: processedMemeData.top_text || '',
        bottom_text: processedMemeData.bottom_text || '',
        text_color: processedMemeData.text_color || '#FFFFFF',
        font_size: processedMemeData.font_size || '2rem',
        font_family: processedMemeData.font_family || 'Impact',
        text_effect: processedMemeData.text_effect || 'shadow',
        text_align: processedMemeData.text_align || 'center',
        image_url: processedMemeData.image_url || null,
        isLocalImage: processedMemeData.isLocalImage || false,
        // Include AI-generated fields
        isAIGenerated: processedMemeData.isAIGenerated || false,
        ai_concept: processedMemeData.ai_concept || null,
        ai_template: processedMemeData.ai_template || null,
        magic_hour_id: processedMemeData.magic_hour_id || null,
        credits_used: processedMemeData.credits_used || null
      };

      const newMeme = {
        ...cleanMemeData,
        user_id: currentUser.uid || currentUser.id,
        user_email: currentUser.email || '',
        createdAt: serverTimestamp(),
        likes: 0,
        shares: 0,
        views: 0
      }
      const docRef = await addDoc(memesRef, newMeme)
      toast.success('Meme created successfully! 🎉')
      const createdMeme = {
        ...newMeme,
        id: docRef.id,
        createdAt: new Date().toISOString(),
        displayImageUrl: resolveImageUrl({ ...newMeme, id: docRef.id })
      }
      setMemes(prevMemes => [createdMeme, ...prevMemes])

      return createdMeme
    } catch (error) {
      // Handle specific Firebase permission errors
      if (error?.code === 'permission-denied' ||
        error?.message?.includes('Missing or insufficient permissions')) {
        toast.error('Permission denied. Please sign in to create memes.');
        return null;
      }

      // For demo users only, provide fallback
      if (isDemoMode) {
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
    // First check what meme we're trying to delete from local state
    const memeToDelete = memes.find(meme => meme.id === memeId);

    if (!memeToDelete) {
      toast.error('Meme not found');
      return;
    }

    // More flexible user ID checking - prioritize uid which matches Firestore rules
    const userMatches = currentUser && (
      memeToDelete.user_id === currentUser.uid ||
      memeToDelete.user_id === currentUser.id ||
      memeToDelete.user_email === currentUser.email
    );

    if (!currentUser || !userMatches) {
      toast.error('You can only delete your own memes');
      return;
    }

    // Handle demo memes deletion
    if (isDemoMode || memeId.startsWith('demo-')) {
      setMemes(prevMemes => prevMemes.filter(meme => meme.id !== memeId));
      const existingDemoMemes = getDemoMemes();
      const updatedDemoMemes = existingDemoMemes.filter(meme => meme.id !== memeId);
      saveDemoMemes(updatedDemoMemes);
      toast.success('Demo meme deleted!');
      return;
    }
    try {
      // Use getDocFromServer to force fresh data check
      const memeRef = doc(db, 'memes', memeId)
      // Try deletion directly - if it fails, we'll handle the error
      await deleteDoc(memeRef)
      // Wait a moment for Firestore to process
      await new Promise(resolve => setTimeout(resolve, 100));
      try {
        const verifyDoc = await getDoc(memeRef)
        if (verifyDoc.exists()) {
          toast.error('Deletion failed - please try again');
          return;
        } else {

        }
      } catch (verifyError) {
        // If we get "not found" error during verification, that's good - means it's deleted
      }
      setMemes(prevMemes => {
        const filteredMemes = prevMemes.filter(meme => meme.id !== memeId);
        return filteredMemes;
      });
      toast.success('Meme permanently deleted!')
    } catch (error) {
      if (error.code === 'permission-denied') {
        toast.error('Permission denied - you can only delete your own memes');
        return;
      }
      if (error.code === 'not-found') {
        setMemes(prevMemes => prevMemes.filter(meme => meme.id !== memeId));
        toast.success('Meme removed!');
        return;
      }
      toast.error('Failed to delete meme: ' + error.message);
      throw error;
    }
  }

  return {
    memes,
    templates,
    loading,
    templatesLoading,
    createMeme: (memeData) => createMeme(memeData, currentUser), 
    deleteMeme,
    refetch: fetchMemes,
    resolveImageUrl
  }
}