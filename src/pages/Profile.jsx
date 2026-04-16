import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useMemes } from "../hooks/useMemes";
import { useAnalytics } from "../hooks/useAnalytics";
import { demoMemes } from "../data/memeData";
import toast from "react-hot-toast";

const Profile = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const { memes, deleteMeme, refetch } = useMemes(user);
  const { analytics } = useAnalytics(user?.id);
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedMeme, setSelectedMeme] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    if (user?.id && !isDeleting) {
      refetch(user.id);
    }
  }, [user?.id]);

  const isDemoUser = user && localStorage.getItem("demoUser");
  const userMemes = memes.filter((meme) => {
    if (isDemoUser) {
      return meme.user_id === user?.id || meme.id?.startsWith("demo-");
    }
    return meme.user_id === user?.id;
  });

  const handleRefresh = () => {
    if (!isDeleting && user?.id) {
      refetch(user.id); // Fetch only user's memes
      toast.success("Memes refreshed!");
    }
  };

  const handleCleanupMemes = async () => {
    try {
      const { collection, query, getDocsFromServer } = await import(
        "firebase/firestore"
      );
      const { db } = await import("../config/firebase");

      const memesRef = collection(db, "memes");
      const allMemesQuery = query(memesRef);
      const snapshot = await getDocsFromServer(allMemesQuery);

      let yourMemes = [];
      let otherUserMemes = [];

      snapshot.docs.forEach((doc) => {
        const memeData = { id: doc.id, ...doc.data() };
        if (memeData.user_id === user?.id) {
          yourMemes.push(memeData);
        } else {
          otherUserMemes.push(memeData);
        }
      });

      // Check for potential duplicates by template name and creation time
      const duplicates = yourMemes.filter(
        (meme, index, arr) =>
          arr.findIndex(
            (m) =>
              m.template_name === meme.template_name &&
              Math.abs(
                new Date(m.createdAt?.toDate?.() || m.createdAt) -
                  new Date(meme.createdAt?.toDate?.() || meme.createdAt)
              ) < 5000
          ) !== index
      );

      if (duplicates.length > 0) {
      }

      if (otherUserMemes.length > 0) {
      }

      toast.success(
        `Found ${yourMemes.length} of your memes, ${otherUserMemes.length} from other users`
      );
    } catch (error) {
      toast.error("Cleanup failed: " + error.message);
    }
  };

  const getFavorites = () => {
    const userKey = `memeFavorites_${user?.id || "anonymous"}`;
    const savedFavorites = localStorage.getItem(userKey);
    return savedFavorites ? new Set(JSON.parse(savedFavorites)) : new Set();
  };

  const favoriteIds = getFavorites();
  const favoriteMemes = [
    ...demoMemes
      .filter((meme) => favoriteIds.has(meme.id))
      .map((meme) => ({
        ...meme,
        author: "Anonymous",
      })),
    ...userMemes.filter((meme) => favoriteIds.has(meme.id)),
  ];

  const tabs = [
    { label: "My Memes", icon: "🎨", count: userMemes.length },
    { label: "Favorites", icon: "❤️", count: favoriteMemes.length },
    { label: "Settings", icon: "⚙️", count: null },
  ];

  const handleShare = async (meme) => {
    // Create a unique shareable URL for this specific meme
    const memeUrl = `${window.location.origin}/meme/${meme.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: meme.title || meme.template_name || "Check out this meme!",
          text: `Check out this ${
            meme.isAIGenerated ? "AI-generated " : ""
          }meme I created!`,
          url: memeUrl,
        });
      } catch (error) {}
    } else {
      navigator.clipboard.writeText(memeUrl);
      toast.success("Meme link copied to clipboard! 📋");
    }
  };

  const handleDownload = (meme) => {
    const link = document.createElement("a");
    link.href = meme.image || meme.displayImageUrl || meme.image_url;
    link.download = `${meme.title || meme.template_name || "meme"}.jpg`;
    link.click();
    toast.success("Meme downloaded! 📥");
  };

  const handleDelete = async (meme) => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete "${
          meme.title || meme.template_name || "this meme"
        }"?`
      )
    ) {
      setIsDeleting(true);
      try {
        // Call delete function and wait for completion
        await deleteMeme(meme.id);
        // Also remove from localStorage if it's stored there
        if (meme.isLocalImage) {
          localStorage.removeItem(`meme-image-${meme.image_url}`);
        }
        // Close any open modal
        setSelectedMeme(null);
        toast.success("Meme permanently deleted!");
      } catch (error) {
        toast.error("Failed to delete meme permanently");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Helper function to safely format dates
  const formatDate = (dateValue) => {
    if (!dateValue) return "Unknown";

    try {
      if (dateValue && typeof dateValue === "object" && dateValue.seconds) {
        return new Date(dateValue.seconds * 1000).toLocaleDateString();
      }
      if (dateValue instanceof Date) {
        return dateValue.toLocaleDateString();
      }
      if (typeof dateValue === "string") {
        return new Date(dateValue).toLocaleDateString();
      }
      return "Unknown";
    } catch (error) {
      return "Unknown";
    }
  };

  return (
    <div
      className={`min-h-screen p-6 transition-all duration-500 ${
        isDarkMode ? "text-white" : "text-gray-900"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`glass p-8 rounded-2xl mb-8 transition-all duration-500 ${
            isDarkMode ? "" : "bg-white/90 shadow-xl border border-gray-100"
          }`}
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-pink-500 to-cyan-500 p-1">
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center ${
                    isDarkMode ? "bg-gray-800" : "bg-white"
                  } overflow-hidden`}
                >
                  {user?.avatar && user.avatar.startsWith("http") ? (
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = "none";
                        e.target.nextElementSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full flex items-center justify-center text-4xl"
                    style={{
                      display: user?.avatar?.startsWith("http")
                        ? "none"
                        : "flex",
                    }}
                  >
                    {user?.avatar && !user.avatar.startsWith("http")
                      ? user.avatar
                      : "👤"}
                  </div>
                </div>
              </div>
              {isDemoUser && (
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                  DEMO
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                <h1 className="text-3xl font-bold gradient-text">
                  {user?.name || "Meme Master"}
                </h1>
              </div>

              <p
                className={`text-lg mb-4 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {user?.email || "demo@memefy.ai"}
              </p>

              <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                <div className="text-center">
                  <div className="text-2xl font-bold gradient-text">
                    {userMemes.length}
                  </div>
                  <div
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Memes Created
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold gradient-text">
                    {analytics?.total_views || 0}
                  </div>
                  <div
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Total Views
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold gradient-text">
                    {analytics?.total_shares || 0}
                  </div>
                  <div
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Shares
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentTab(index)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-500 ease-in-out ${
                currentTab === index
                  ? "bg-gradient-to-r from-pink-500 to-cyan-500 text-white shadow-lg"
                  : isDarkMode
                  ? "glass text-gray-300 hover:text-white"
                  : "bg-white/80 text-gray-700 hover:text-gray-900 shadow-sm hover:shadow-md border border-gray-200"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
              {tab.count !== null && (
                <span className="ml-2 bg-black/20 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {currentTab === 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold gradient-text">
                  My Memes Collection
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-full font-medium transition-all duration-300 flex items-center gap-2"
                >
                  <span>🔄</span>
                  <span className="hidden sm:inline">Refresh</span>
                </motion.button>
              </div>
              {userMemes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userMemes.map((meme, index) => (
                    <motion.div
                      key={meme.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className={`glass rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 cursor-pointer group ${
                        isDarkMode
                          ? ""
                          : "bg-white/90 shadow-lg border border-gray-100"
                      }`}
                      onClick={() => setSelectedMeme(meme)}
                    >
                      <div className="relative aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                        {/* AI Generated Badge */}
                        {meme.isAIGenerated && (
                          <div className="absolute top-2 left-2 z-10">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                              🤖 AI
                            </div>
                          </div>
                        )}

                        {meme.displayImageUrl || meme.image_url ? (
                          <img
                            src={meme.displayImageUrl || meme.image_url}
                            alt={meme.template_name || "Meme"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="w-full h-full flex items-center justify-center text-4xl"
                          style={{
                            display:
                              meme.displayImageUrl || meme.image_url
                                ? "none"
                                : "flex",
                          }}
                        >
                          🎭
                        </div>

                        {/* Hover overlay with actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(meme);
                            }}
                            className="bg-blue-500 text-white p-2.5 rounded-full hover:bg-blue-600 transition-colors"
                            title="Share"
                          >
                            📤
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(meme);
                            }}
                            className="bg-green-500 text-white p-2.5 rounded-full hover:bg-green-600 transition-colors"
                            title="Download"
                          >
                            📥
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(meme);
                            }}
                            className="bg-red-500 text-white p-2.5 rounded-full hover:bg-red-600 transition-colors"
                            title="Delete"
                          >
                            🗑️
                          </motion.button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 truncate">
                          {meme.template_name}
                        </h3>

                        {/* AI-specific info */}
                        {meme.isAIGenerated && meme.ai_concept && (
                          <div className="mb-2 p-2 bg-purple-500/10 rounded-lg">
                            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                              💭 {meme.ai_concept}
                            </p>
                          </div>
                        )}

                        <div className="flex justify-between text-sm opacity-70">
                          <span>👁️ {meme.views || 0}</span>
                          <span>📤 {meme.shares || 0}</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          {formatDate(meme.createdAt)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🎨</div>
                  <h3 className="text-xl font-bold mb-4 gradient-text">
                    No Memes Yet
                  </h3>
                  <p
                    className={`mb-6 ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Start creating some epic memes to build your collection!
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
          )}

          {currentTab === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-6 gradient-text">
                Favorite Memes
              </h2>
              {favoriteMemes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteMemes.map((meme, index) => (
                    <motion.div
                      key={meme.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className={`glass rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 cursor-pointer group ${
                        isDarkMode
                          ? ""
                          : "bg-white/90 shadow-lg border border-gray-100"
                      }`}
                      onClick={() => setSelectedMeme(meme)}
                    >
                      <div className="relative aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                        <img
                          src={meme.image}
                          alt={meme.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                        <div
                          className="w-full h-full flex items-center justify-center text-4xl"
                          style={{ display: "none" }}
                        >
                          🎭
                        </div>

                        {/* Hover overlay with actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(meme);
                            }}
                            className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors"
                            title="Share"
                          >
                            📤
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Remove from favorites
                              const savedFavorites =
                                localStorage.getItem("memeFavorites");
                              const favoriteIds = savedFavorites
                                ? new Set(JSON.parse(savedFavorites))
                                : new Set();
                              favoriteIds.delete(meme.id);
                              localStorage.setItem(
                                "memeFavorites",
                                JSON.stringify([...favoriteIds])
                              );
                              toast.success("Removed from favorites 💔");
                              // Force re-render by updating component state
                              window.location.reload();
                            }}
                            className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-colors"
                            title="Remove from Favorites"
                          >
                            💔
                          </motion.button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 truncate">
                          {meme.title}
                        </h3>
                        <div className="flex justify-between text-sm opacity-70">
                          <span>👁️ {(meme.views / 1000).toFixed(1)}k</span>
                          <span>🔥 {(meme.likes / 1000).toFixed(1)}k</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          @{meme.author} • {meme.createdAt}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">❤️</div>
                  <h3 className="text-xl font-bold mb-4 gradient-text">
                    No Favorites Yet
                  </h3>
                  <p
                    className={`${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Explore the gallery and save your favorite memes here!
                  </p>
                </div>
              )}
            </div>
          )}

          {currentTab === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-6 gradient-text">
                Account Settings
              </h2>
              <div
                className={`glass p-6 rounded-2xl transition-all duration-500 ${
                  isDarkMode
                    ? ""
                    : "bg-white/90 shadow-lg border border-gray-100"
                }`}
              >
                <div className="space-y-6">
                  {/* Avatar Upload Section */}
                  <div>
                    <label className="block font-semibold mb-3">
                      Profile Picture
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-cyan-500 p-0.5">
                        <div
                          className={`w-full h-full rounded-full flex items-center justify-center ${
                            isDarkMode ? "bg-gray-800" : "bg-white"
                          } overflow-hidden`}
                        >
                          {user?.avatar && user.avatar.startsWith("http") ? (
                            <img
                              src={user.avatar}
                              alt="Profile"
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg">
                              {user?.avatar || "👤"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {isDemoUser
                            ? "🔒 Sign in with Google for custom avatar"
                            : "🎆 Using your Google profile picture"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={user?.name || ""}
                      readOnly
                      className={`w-full p-3 rounded-xl border-2 transition-all duration-300 ${
                        isDarkMode
                          ? "bg-gray-800/50 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } opacity-75 cursor-default`}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      readOnly
                      className={`w-full p-3 rounded-xl border-2 transition-all duration-300 ${
                        isDarkMode
                          ? "bg-gray-800/50 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } opacity-75 cursor-default`}
                    />
                  </div>
                  {isDemoUser && (
                    <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4">
                      <p className="text-yellow-400 font-semibold">
                        ⚠️ Demo Mode: Settings are read-only. Sign in with
                        Google for full features!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Meme Modal */}
      <AnimatePresence>
        {selectedMeme && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedMeme(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`max-w-2xl w-full glass rounded-2xl overflow-hidden ${
                isDarkMode ? "" : "bg-white/95"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={selectedMeme.displayImageUrl || selectedMeme.image_url}
                  alt={selectedMeme.template_name}
                  className="w-full h-auto max-h-96 object-contain"
                />
                <button
                  onClick={() => setSelectedMeme(null)}
                  className="absolute top-4 right-4 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-4 gradient-text">
                  {selectedMeme.template_name}
                </h3>
                <div className="flex items-center gap-6 mb-4 text-sm opacity-70">
                  <span>👁️ {selectedMeme.views || 0} views</span>
                  <span>📤 {selectedMeme.shares || 0} shares</span>
                  <span>📅 {formatDate(selectedMeme.createdAt)}</span>
                </div>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleShare(selectedMeme)}
                    className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    📤 Share
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDownload(selectedMeme)}
                    className="flex-1 bg-green-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    📥 Download
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
