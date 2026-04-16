import { useState, useEffect } from 'react'
import { db } from '../config/firebase'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'

export const useAnalytics = (userId) => {
  const [analytics, setAnalytics] = useState({
    totalMemes: 0,
    totalViews: 0,
    totalShares: 0,
    topMemes: [],
    recentActivity: [],
    trendsData: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchAnalytics()
    } else {
      setAnalytics({
        totalMemes: 0,
        totalViews: 0,
        totalShares: 0,
        topMemes: [],
        recentActivity: [],
        trendsData: []
      })
      setLoading(false)
    }
  }, [userId])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // Fetch user's memes from Firestore
      const memesRef = collection(db, 'memes')
      const q = query(
        memesRef,
        where('user_id', '==', userId),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const memes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Calculate analytics
      const totalMemes = memes.length
      const totalViews = memes.reduce((sum, meme) => sum + (meme.views || 0), 0)
      const totalShares = memes.reduce((sum, meme) => sum + (meme.shares || 0), 0)
      const topMemes = memes.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5)

      setAnalytics({
        totalMemes,
        totalViews,
        totalShares,
        topMemes,
        recentActivity: memes.slice(0, 10),
        trendsData: generateTrendsData(memes)
      })
    } catch (error) {
      console.error("Analytics Error:", error);
      setAnalytics({
        totalMemes: 0,
        totalViews: 0,
        totalShares: 0,
        topMemes: [],
        recentActivity: [],
        trendsData: []
      })
    } finally {
      setLoading(false)
    }
  }

  const generateDemoMemes = () => [
    {
      id: 'demo-1',
      title: 'Epic Fail Cat',
      imageUrl: '🐱',
      views: 156,
      shares: 23,
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo-2', 
      title: 'Monday Mood',
      imageUrl: '😴',
      views: 89,
      shares: 12,
      createdAt: new Date().toISOString()
    }
  ]

  const generateDemoActivity = () => [
    {
      id: 'activity-1',
      title: 'New Meme Created',
      createdAt: new Date().toISOString(),
      imageUrl: '🎭'
    },
    {
      id: 'activity-2',
      title: 'Meme Shared',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      imageUrl: '🚀'
    }
  ]

  const generateTrendsData = (memes) => {
    // Generate mock trends data based on memes
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    return last7Days.map(date => ({
      date,
      views: Math.floor(Math.random() * 100) + 10,
      shares: Math.floor(Math.random() * 50) + 5
    }))
  }

  return { analytics, loading, refetch: fetchAnalytics }
}