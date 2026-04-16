import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useAnalytics } from '../hooks/useAnalytics'
import { useMemes } from '../hooks/useMemes'
import SEO from '../components/common/SEO'

const Dashboard = () => {
  const { user } = useAuth()
  const { isDarkMode } = useTheme()
  const { analytics, loading: analyticsLoading } = useAnalytics(user?.id)
  const { memes, loading: memesLoading } = useMemes(user)
  const loading = analyticsLoading || memesLoading
  const userMemes = memes.filter(meme => meme.user_id === user?.id)

  const userMemesCount = userMemes.length
  const totalViews = userMemes.reduce((sum, meme) => sum + (meme.views || 0), 0)
  const totalShares = userMemes.reduce((sum, meme) => sum + (meme.shares || 0), 0)
  const memesWithToxicity = userMemes.filter(meme => typeof meme.toxicity_score === 'number')
  const avgToxicityPercent = memesWithToxicity.length > 0
    ? Math.round((memesWithToxicity.reduce((sum, meme) => sum + meme.toxicity_score, 0) / memesWithToxicity.length) * 1000) / 10
    : 0
  const avgTrendyScore = userMemesCount > 0
    ? Math.round(
        userMemes.reduce((sum, meme) => {
          const memeScore = typeof meme.trendy_score === 'number'
            ? meme.trendy_score
            : Math.min(100, (meme.views || 0) + (meme.shares || 0) * 5)
          return sum + memeScore
        }, 0) / userMemesCount,
      )
    : 0
  const sentimentSummary = userMemes.reduce(
    (acc, meme) => {
      const sentiment = (meme.sentiment || '').toLowerCase()
      if (sentiment.includes('positive') || sentiment.includes('safe')) acc.safe += 1
      else if (sentiment.includes('neutral')) acc.neutral += 1
      else if (sentiment.includes('risky') || sentiment.includes('negative')) acc.risky += 1
      return acc
    },
    { safe: 0, neutral: 0, risky: 0 },
  )

  const stats = [
    {
      icon: '🎨',
      title: 'Memes Created',
      value: userMemesCount,
      color: 'from-pink-500 to-red-500',
      description: 'Total memes in your collection'
    },
    {
      icon: '👁️',
      title: 'Total Views',
      value: totalViews.toLocaleString(),
      color: 'from-cyan-500 to-blue-500',
      description: 'People who viewed your memes'
    },
    {
      icon: '📤',
      title: 'Shares',
      value: totalShares,
      color: 'from-green-500 to-emerald-500',
      description: 'Times your memes were shared'
    },
    {
      icon: '🔥',
      title: 'Trending Score',
      value: avgTrendyScore,
      color: 'from-orange-500 to-yellow-500',
      description: 'Your viral potential rating'
    },
    {
      icon: '🛡️',
      title: 'Avg Toxicity',
      value: `${avgToxicityPercent}%`,
      color: 'from-indigo-500 to-cyan-500',
      description: 'Average toxicity across your memes'
    },
    {
      icon: '💬',
      title: 'Sentiment Mix',
      value: `${sentimentSummary.safe}/${sentimentSummary.neutral}/${sentimentSummary.risky}`,
      color: 'from-emerald-500 to-lime-500',
      description: 'Safe / Neutral / Risky memes'
    }
  ]

  // Generate recent activity from actual user memes
  const getRecentActivity = () => {
    if (userMemes.length === 0) {
      return [
        { action: 'Welcome to MEMEFY AI !', meme: 'Start creating memes', time: 'Just now', icon: '🚀' },
        { action: 'Explore templates', meme: 'Generator ready', time: 'Now', icon: '🤖' },
      ];
    }

    const sortedMemes = userMemes
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);

    return sortedMemes.map(meme => {
      const createdDate = new Date(meme.createdAt);
      const now = new Date();
      const diffMs = now - createdDate;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      let timeAgo;
      if (diffDays > 0) {
        timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else if (diffHours > 0) {
        timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else {
        timeAgo = 'Just now';
      }

      return {
        action: 'Created new meme',
        meme: meme.template_name || 'Custom Meme',
        time: timeAgo,
        icon: '🎨',
        sentiment: meme.sentiment || null,
        toxicity: typeof meme.toxicity_score === 'number' ? `${(meme.toxicity_score * 100).toFixed(1)}%` : null,
        trendy: typeof meme.trendy_score === 'number' ? meme.trendy_score : null,
      };
    });
  };

  const recentActivity = getRecentActivity();

  const quickActions = [
    { title: 'Create New Meme', icon: '🎨', href: '/generator', color: 'from-pink-500 to-purple-500' },
    { title: 'Browse Gallery', icon: '🖼️', href: '/gallery', color: 'from-cyan-500 to-blue-500' },
    { title: 'View Profile', icon: '👤', href: '/profile', color: 'from-green-500 to-teal-500' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen p-6 transition-all duration-500 ${
      isDarkMode ? 'text-white' : 'text-gray-900'
    }`}>
      <SEO title="Dashboard | Memefy AI" description="Track your meme analytics, views, shares and creator stats." />
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">👋</span>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold gradient-text">
                Welcome back, {user?.name || 'Creator'}!
              </h1>
            </div>
          </div>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Ready to create some viral content today? Let's see what you've been up to! 📈
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`glass p-6 rounded-2xl hover:shadow-xl transition-all duration-500 ${
                isDarkMode ? '' : 'bg-white/90 shadow-lg border border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
                <div className={`text-2xl font-bold gradient-text`}>
                  {stat.value}
                </div>
              </div>
              <h3 className="font-semibold mb-2">{stat.title}</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-6 gradient-text">Quick Actions</h2>
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <motion.a
                  key={action.title}
                  href={action.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-4 p-4 glass rounded-xl hover:shadow-lg transition-all duration-300 ${
                    isDarkMode ? '' : 'bg-white/90 border border-gray-100'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center text-xl`}>
                    {action.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{action.title}</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Start creating amazing content
                    </p>
                  </div>
                  <div className="ml-auto text-2xl">→</div>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-6 gradient-text">Recent Activity</h2>
            <div className={`glass p-6 rounded-2xl transition-all duration-500 ${
              isDarkMode ? '' : 'bg-white/90 shadow-lg border border-gray-100'
            }`}>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200"
                    >
                      <div className="text-2xl">{activity.icon}</div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.action}</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {activity.meme} • {activity.time}
                        </p>
                        {(activity.sentiment || activity.toxicity || activity.trendy !== null) && (
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {activity.sentiment ? `Sentiment: ${activity.sentiment}` : 'Sentiment: N/A'}
                            {' • '}
                            {activity.toxicity ? `Toxicity: ${activity.toxicity}` : 'Toxicity: N/A'}
                            {' • '}
                            {activity.trendy !== null ? `Trendy: ${activity.trendy}` : 'Trendy: N/A'}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-bold mb-2 gradient-text">No Activity Yet</h3>
                  <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Start creating memes to track your activity!
                  </p>
                  <motion.a
                    href="/generator"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-block bg-gradient-to-r from-pink-500 to-cyan-500 text-white px-6 py-3 rounded-full font-semibold"
                  >
                    Create First Meme ✨
                  </motion.a>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Inspiration Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8"
        >
          <div className={`glass p-8 rounded-2xl text-center transition-all duration-500 ${
            isDarkMode ? '' : 'bg-white/90 shadow-lg border border-gray-100'
          }`}>
            <div className="text-6xl mb-4">💡</div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">Meme Tip of the Day</h3>
            <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              "The best memes capture universal experiences in unexpected ways. Think about what made you laugh today!"
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <span className="px-4 py-2 bg-pink-500/20 text-pink-400 rounded-full text-sm font-semibold">#Relatable</span>
              <span className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-semibold">#Trending</span>
              <span className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-semibold">#Viral</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard;