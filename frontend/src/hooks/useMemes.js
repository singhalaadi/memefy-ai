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

  useEffect(() => {
    fetchMemes()
    fetchTemplates()
  }, [])

  // Helper function to resolve image URLs (including locally stored ones)
  const resolveImageUrl = (meme) => {
    if (meme.isLocalImage && meme.image_url) {
      const storedImage = localStorage.getItem(`meme-image-${meme.image_url}`);
      return storedImage || meme.template_image || meme.template_url || meme.image_url;
    }
    return meme.image_url || meme.memeUrl || meme.template_image || meme.template_url;
  };

  const fetchMemes = async (userId = null) => {
    try {

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

      setMemes(memesData)
    } finally {
      setLoading(false)
    }
  }


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
    // Real database creation only
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
      
      if (!currentUser?.id && !currentUser?.uid) {
        toast.error('Please sign in to create memes');
        return null;
      }
      
      const cleanMemeData = {
        template_id: processedMemeData.template_id || null,
        template_name: processedMemeData.template_name || '',
        template_image: processedMemeData.template_image || '',
        template_trending: processedMemeData.template_trending || false,
        template_usage: processedMemeData.template_usage || 0,
        top_text: processedMemeData.top_text || '',
        bottom_text: processedMemeData.bottom_text || '',
        caption: processedMemeData.caption || '',
        sentiment: processedMemeData.sentiment || null,
        toxicity_score: typeof processedMemeData.toxicity_score === 'number'
          ? processedMemeData.toxicity_score
          : null,
        trendy_score: typeof processedMemeData.trendy_score === 'number'
          ? processedMemeData.trendy_score
          : null,
        text_color: processedMemeData.text_color || '#FFFFFF',
        font_size: processedMemeData.font_size || '2rem',
        font_family: processedMemeData.font_family || 'Impact',
        text_effect: processedMemeData.text_effect || 'shadow',
        text_align: processedMemeData.text_align || 'center',
        image_url: processedMemeData.image_url || null,
        isLocalImage: processedMemeData.isLocalImage || false
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
    createMeme: (memeData) => createMeme(memeData, currentUser), // Pass current user
    deleteMeme,
    refetch: fetchMemes,
    resolveImageUrl
  }
}