import { useState, useEffect } from 'react'
import { db } from '../config/firebase'
import { 
  collection, 
  query, 
  orderBy, 
  where,
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
      const templatesList = await memeApiService.fetchTemplates()
      setTemplates(templatesList)
    } catch (error) {
      setTemplates(memeApiService.getFallbackTemplates())
    } finally {
      setTemplatesLoading(false)
    }
  }

  const createMeme = async (memeData, user = null) => {
    try {
      const memesRef = collection(db, 'memes')
      let processedMemeData = { ...memeData };
      
      if (processedMemeData.image_url && processedMemeData.image_url.length > 500000) {
        const imageId = `meme-${Date.now()}`;
        localStorage.setItem(`meme-image-${imageId}`, processedMemeData.image_url);
        processedMemeData.image_url = imageId;
        processedMemeData.isLocalImage = true;
      }
      
      if (!user?.id && !user?.uid) {
        toast.error('Authentication required to create memes');
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
        user_id: user.uid || user.id,
        user_email: user.email || '',
        createdAt: serverTimestamp(),
        likes: 0,
        shares: 0,
        views: 0
      }
      const docRef = await addDoc(memesRef, newMeme)
      toast.success('Meme created successfully!')
      
      const createdMeme = { 
        ...newMeme, 
        id: docRef.id, 
        createdAt: new Date().toISOString(),
        displayImageUrl: resolveImageUrl({ ...newMeme, id: docRef.id })
      }
      setMemes(prevMemes => [createdMeme, ...prevMemes])
      
      return createdMeme
    } catch (error) {
      if (error?.code === 'permission-denied' || error?.message?.includes('permissions')) {
        toast.error('Permission denied. Please sign in again.');
      } else {
        toast.error('Failed to create meme.');
      }
      return null;
    }
  }

  const deleteMeme = async (memeId) => {
    const memeToDelete = memes.find(meme => meme.id === memeId);
    if (!memeToDelete) {
      toast.error('Meme not found.');
      return;
    }
    
    const userMatches = currentUser && (
      memeToDelete.user_id === currentUser.uid ||
      memeToDelete.user_id === currentUser.id
    );
    
    if (!currentUser || !userMatches) {
      toast.error('Unauthorized action.');
      return;
    }
    
    try {
      const memeRef = doc(db, 'memes', memeId)
      await deleteDoc(memeRef)
      
      setMemes(prevMemes => prevMemes.filter(meme => meme.id !== memeId));
      toast.success('Meme deleted.')
    } catch (error) {
      toast.error('Deletion failed.');
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