import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'

const Login = () => {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, loading } = useAuth()
  const { isDarkMode } = useTheme()
  const navigate = useNavigate()
  
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      // Error handled in AuthContext
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    
    try {
      if (isSignUp) {
        if (!formData.name) {
          toast.error("Please enter your name")
          setFormLoading(false)
          return
        }
        await signUpWithEmail(formData.email, formData.password, formData.name)
      } else {
        await signInWithEmail(formData.email, formData.password)
      }
    } catch (error) {
      // Error handled in AuthContext
    } finally {
      setFormLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-300 ${
        isDarkMode 
          ? 'bg-[#0a0a0f]' 
          : 'bg-[#f0f9ff]'
      }`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          ⚡
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e]' 
        : 'bg-gradient-to-br from-[#f0f9ff] via-[#e0e7ff] to-[#f8fafc]'
    }`}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-pink-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-yellow-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <motion.div 
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="glass p-8 rounded-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-4 inline-block"
            >
              <div className="text-6xl animate-bounce">🚀</div>
            </motion.div>
            <h1 className="text-3xl font-bold gradient-text mb-2">
              {isSignUp ? "Create Account" : "Welcome Back!"}
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {isSignUp ? "Join the meme revolution today!" : "Ready to create some viral content?"}
            </p>
          </div>

          {/* Form Toggle */}
          <div className="flex bg-black/10 dark:bg-white/5 p-1 rounded-2xl mb-8">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                !isSignUp 
                  ? "bg-white dark:bg-white/10 shadow-lg text-pink-500" 
                  : "text-gray-500 hover:text-gray-400"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                isSignUp 
                  ? "bg-white dark:bg-white/10 shadow-lg text-pink-500" 
                  : "text-gray-500 hover:text-gray-400"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Login/Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1"
                >
                  <label className="text-xs font-semibold ml-1 text-gray-500 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required={isSignUp}
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className={`w-full p-4 rounded-2xl border-2 bg-transparent transition-all outline-none ${
                      isDarkMode 
                        ? 'border-white/10 focus:border-pink-500/50 text-white' 
                        : 'border-black/5 focus:border-pink-500/50 text-gray-900'
                    }`}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <label className="text-xs font-semibold ml-1 text-gray-500 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@example.com"
                className={`w-full p-4 rounded-2xl border-2 bg-transparent transition-all outline-none ${
                  isDarkMode 
                    ? 'border-white/10 focus:border-pink-500/50 text-white' 
                    : 'border-black/5 focus:border-pink-500/50 text-gray-900'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold ml-1 text-gray-500 uppercase tracking-wider">Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={`w-full p-4 rounded-2xl border-2 bg-transparent transition-all outline-none ${
                  isDarkMode 
                    ? 'border-white/10 focus:border-pink-500/50 text-white' 
                    : 'border-black/5 focus:border-pink-500/50 text-gray-900'
                }`}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={formLoading}
              className={`w-full bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all duration-300 disabled:opacity-50 mt-4 flex items-center justify-center gap-2`}
            >
              {formLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isSignUp ? "Create My Account 🚀" : "Login Now 👋"}
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">or continue with</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Social Auth */}
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              className="w-full bg-white text-gray-800 font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-all duration-300 shadow-md border border-black/5"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google Account
            </motion.button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-gray-500 text-xs">
            <p className="mb-1">By continuing, you agree that memes are life 🔥</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login