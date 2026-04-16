import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { demoMemes } from "../data/memeData";

const Gallery = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favorites, setFavorites] = useState(() => {
    // Load user-specific favorites from localStorage
  const userKey = `memeFavorites_${user?.id || "anonymous"}`;
  const savedFavorites = localStorage.getItem(userKey);    
  return savedFavorites ? new Set(JSON.parse(savedFavorites)) : new Set();
  });
  const [selectedMeme, setSelectedMeme] = useState(null);

  // Refresh favorites when user changes
  useEffect(() => {
    const userKey = `memeFavorites_${user?.id || "anonymous"}`;
    const savedFavorites = localStorage.getItem(userKey);
    setFavorites(
      savedFavorites ? new Set(JSON.parse(savedFavorites)) : new Set()
    );
  }, [user?.id]);

  const categories = [
    "all",
    "relatable",
    "work",
    "school",
    "money",
    "coding",
    "adulting",
  ];

  // Use only demo memes, set all authors to Anonymous
  const memesWithAnonymousAuthors = demoMemes.map((meme) => ({
    ...meme,
    author: "Anonymous",
  }));

  const filteredMemes = memesWithAnonymousAuthors.filter((meme) => {
    const matchesSearch =
      meme.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meme.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesCategory =
      selectedCategory === "all" || meme.tags.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleFavorite = (memeId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(memeId)) {
      newFavorites.delete(memeId);
      toast.success("Removed from favorites 💔");
    } else {
      newFavorites.add(memeId);
      toast.success("Added to favorites 💖");
    }
    setFavorites(newFavorites);
    // Persist to user-specific localStorage
    const userKey = `memeFavorites_${user?.id || "anonymous"}`;
    localStorage.setItem(userKey, JSON.stringify([...newFavorites]));
  };

  const handleShare = async (meme) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: meme.title,
          text: `Check out this viral meme: ${meme.title}`,
          url: window.location.href,
        });
      } catch (error) {

      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard! 📋");
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-4">
            Viral Meme Gallery
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            The freshest memes straight from the internet's finest creators 🔥
          </p>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search memes... 🔍"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass px-6 py-3 pr-12 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 w-80"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl">
                🔍
              </span>
            </div>

            <div className="flex gap-2 flex-wrap justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-pink-500 to-cyan-500 text-white"
                      : "glass text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {category === "all" ? "🌍 All" : `#${category}`}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Memes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredMemes.map((meme, index) => (
            <motion.div
              key={meme.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="glass rounded-3xl overflow-hidden group hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300"
            >
              {/* Meme Image */}
              <div
                className="aspect-square bg-gradient-to-br from-pink-500/20 to-cyan-500/20 relative cursor-pointer overflow-hidden"
                onClick={() => setSelectedMeme(meme)}
              >
                <img
                  src={meme.image}
                  alt={meme.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div className="hidden w-full h-full items-center justify-center bg-gradient-to-br from-pink-500/20 to-cyan-500/20">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎭</div>
                    <p className="text-lg font-bold">{meme.title}</p>
                  </div>
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-white font-bold text-lg bg-black/50 px-4 py-2 rounded-full backdrop-blur">
                    Click to view 👀
                  </span>
                </div>
              </div>

              {/* Meme Info */}
              <div className="p-4">
                <h3 className="font-bold text-white mb-2 line-clamp-2">
                  {meme.title}
                </h3>
                <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                  <span>@{meme.author}</span>
                  <span>{meme.createdAt}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {meme.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-white/10 text-gray-300 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      🔥 {(meme.likes / 1000).toFixed(1)}k
                    </span>
                    <span className="flex items-center gap-1">
                      👀 {(meme.views / 1000).toFixed(1)}k
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavorite(meme.id);
                      }}
                      className={`p-2 rounded-full transition-all duration-300 ${
                        favorites.has(meme.id)
                          ? "text-red-400 bg-red-500/20"
                          : "text-gray-400 hover:text-red-400 hover:bg-red-500/20"
                      }`}
                    >
                      {favorites.has(meme.id) ? "💖" : "🤍"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(meme);
                      }}
                      className="p-2 rounded-full text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/20 transition-all duration-300"
                    >
                      🚀
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredMemes.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">😅</div>
            <h3 className="text-2xl font-bold gradient-text mb-2">
              No memes found
            </h3>
            <p className="text-gray-400">
              Try adjusting your search or category filter
            </p>
          </motion.div>
        )}

        {/* Meme Detail Modal */}
        <AnimatePresence>
          {selectedMeme && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur"
              onClick={() => setSelectedMeme(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="glass max-w-2xl w-full rounded-3xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <img
                    src={selectedMeme.image}
                    alt={selectedMeme.title}
                    className="w-full h-96 object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="hidden w-full h-96 items-center justify-center bg-gradient-to-br from-pink-500/20 to-cyan-500/20">
                    <div className="text-center">
                      <div className="text-8xl mb-4">🎭</div>
                      <p className="text-2xl font-bold">{selectedMeme.title}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMeme(null)}
                    className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full backdrop-blur hover:bg-black/70 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {selectedMeme.title}
                  </h2>
                  <div className="flex items-center justify-between text-gray-400 mb-4">
                    <span className="font-medium">@{selectedMeme.author}</span>
                    <span>{selectedMeme.createdAt}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedMeme.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-sm bg-white/10 text-gray-300 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-6 text-gray-400">
                      <span className="flex items-center gap-2">
                        🔥{" "}
                        <strong>{selectedMeme.likes.toLocaleString()}</strong>{" "}
                        likes
                      </span>
                      <span className="flex items-center gap-2">
                        👀{" "}
                        <strong>{selectedMeme.views.toLocaleString()}</strong>{" "}
                        views
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleFavorite(selectedMeme.id)}
                        className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                          favorites.has(selectedMeme.id)
                            ? "bg-red-500/20 text-red-400"
                            : "bg-gray-500/20 text-gray-400 hover:bg-red-500/20 hover:text-red-400"
                        }`}
                      >
                        {favorites.has(selectedMeme.id)
                          ? "💖 Favorited"
                          : "🤍 Favorite"}
                      </button>
                      <button
                        onClick={() => handleShare(selectedMeme)}
                        className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-full font-medium hover:bg-cyan-500/30 transition-all duration-300"
                      >
                        🚀 Share
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Gallery;
