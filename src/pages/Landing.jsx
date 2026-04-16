import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { memeImages } from "../data/memeData";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const Landing = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const isDemoUser = user && localStorage.getItem("demoUser");
  const features = [
    {
      emoji: "🤖",
      title: "AI Meme Master",
      description:
        "Our AI knows every meme format from the classics to the latest TikTok trends",
    },
    {
      emoji: "🔥",
      title: "Viral Potential",
      description:
        "Generate memes that are guaranteed to get those likes, shares, and reactions",
    },
    {
      emoji: "⚡",
      title: "Instant Creation",
      description: "From idea to meme in seconds. No cap. 💯",
    },
    {
      emoji: "🎯",
      title: "Trend Tracker",
      description:
        "Stay ahead with real-time meme trends from Reddit, Twitter, and TikTok",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div
      className={`min-h-screen overflow-hidden transition-all duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e] text-white"
          : "bg-gradient-to-br from-[#f0f9ff] via-[#e0e7ff] to-[#f8fafc] text-gray-900"
      }`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-yellow-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Main Headline */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-extrabold gradient-text mb-4 leading-tight">
              MEMEFY-AI
            </h1>
            <div className="flex justify-center items-center gap-3 sm:gap-4 text-2xl sm:text-4xl md:text-6xl mb-4 sm:mb-6">
              <span className="animate-bounce">🔥</span>
              <span className="animate-pulse">💯</span>
              <span className="animate-bounce delay-300">⚡</span>
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-6 sm:mb-8 font-medium leading-relaxed px-4"
          >
            The ultimate AI meme generator for Gen-Z creators. 
            <br className="hidden sm:block" />
            <span className="gradient-text font-bold ml-2">
              No cap, just pure viral content!{" "}
            </span>
            <span className="font-bold">🚀</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center items-stretch sm:items-center mb-16 px-4 max-w-md sm:max-w-none mx-auto"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/generator"
                className="block bg-gradient-to-r from-pink-500 to-cyan-500 p-4 rounded-full text-lg font-bold text-white shadow-lg hover:shadow-pink-500/25 transition-all duration-300 animate-pulse-glow text-center"
              >
                Start Creating Memes ✨
              </Link>
            </motion.div>

            {/* Only show Try Demo Mode button if user is NOT authenticated at all */}
            {!user && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Link
                  to="/login"
                  className="block border-2 border-cyan-500 px-8 py-4 rounded-full text-lg font-bold text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300 text-center"
                >
                  Try Demo Mode 🎮
                </Link>
              </motion.div>
            )}
          </motion.div>

          {/* Quick Demo Link */}
          <motion.div variants={itemVariants}>
            <p className="text-gray-400 mb-2">
              Too lazy to sign up? We feel you 😴
            </p>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-semibold transition-colors"
            >
              <span>Check out viral memes</span>
              <span className="animate-bounce">👀</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="mt-20 grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              className="glass p-6 text-center group hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300"
            >
              <div
                className="text-4xl mb-4 animate-float"
                style={{ animationDelay: `${index * 0.5}s` }}
              >
                {feature.emoji}
              </div>
              <h3 className="text-xl font-bold mb-3 gradient-text">
                {feature.title}
              </h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Demo Memes Showcase */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Fresh Memes Daily</span>
              <span className="ml-2">🔥</span>
            </h2>
            <p className="text-gray-400 text-lg">Check out these viral hits!</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {[1, 2, 3, 4, 5].map((num) => (
              <motion.div
                key={num}
                whileHover={{ scale: 1.05, rotateZ: Math.random() * 4 - 2 }}
                className="glass p-2 rounded-2xl group hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
              >
                <div className="aspect-square bg-gradient-to-br from-pink-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center overflow-hidden relative">
                  <img
                    src={memeImages[`meme${num}`]}
                    alt={`Demo meme ${num}`}
                    className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback if image doesn't load
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="hidden w-full h-full items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🎭</div>
                      <p className="text-sm font-semibold">Meme #{num}</p>
                    </div>
                  </div>

                  {/* Reaction overlay */}
                  <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-white flex items-center gap-1">
                      🔥 {Math.floor(Math.random() * 10) + 1}k
                    </span>
                  </div>
                </div>

                <div className="p-2 text-center">
                  <p className="text-xs text-gray-400 group-hover:text-gray-300">
                    {
                      [
                        "This is fire 🔥",
                        "So relatable 💯",
                        "Big mood",
                        "Facts no printer",
                        "Send this to everyone",
                      ][num - 1]
                    }
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-cyan-500 px-6 py-3 rounded-full font-bold text-white hover:from-cyan-500 hover:to-pink-500 transition-all duration-300 animate-pulse-glow"
            >
              <span>See More Viral Memes</span>
              <span className="animate-bounce">👀</span>
            </Link>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <div className="glass-dark p-8 rounded-3xl max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">
              <span className="gradient-text">Ready to go viral? </span>
              <span>📈</span>
            </h2>
            <p className="text-gray-400 mb-6">
              Join thousands of creators making bank with AI-generated memes
            </p>
            <div className="flex justify-center gap-4">
              <span className="text-2xl animate-bounce">🚀</span>
              <span className="text-2xl animate-pulse">💸</span>
              <span className="text-2xl animate-bounce delay-500">🎯</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;