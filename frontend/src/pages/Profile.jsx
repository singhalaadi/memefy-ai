import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// Context & Hooks
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useMemes } from "../hooks/useMemes";
import { useAnalytics } from "../hooks/useAnalytics";

// Modular Components
import SEO from "../components/common/SEO";
import ProfileHeader from "../components/profile/ProfileHeader";
import MemeCollection from "../components/profile/MemeCollection";
import ProfileSettings from "../components/profile/ProfileSettings";
import MemeDetailModal from "../components/profile/MemeDetailModal";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const { memes, deleteMeme, refetch } = useMemes(user);
  const { analytics } = useAnalytics(user?.id);
  
  // State
  const [currentTab, setCurrentTab] = useState("my-memes");
  const [selectedMeme, setSelectedMeme] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user?.id && !isDeleting) {
      refetch(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isDeleting]);

  // Memoized Data
  const userMemes = useMemo(() => 
    memes.filter((meme) => meme.user_id === user?.id),
    [memes, user?.id]
  );

  const favoriteMemes = useMemo(() => {
    const userKey = `memeFavorites_${user?.id || "anonymous"}`;
    const savedFavorites = localStorage.getItem(userKey);
    const favoriteIds = savedFavorites ? new Set(JSON.parse(savedFavorites)) : new Set();
    return userMemes.filter((meme) => favoriteIds.has(meme.id));
  }, [userMemes, user?.id]);

  // Handlers
  const handleRefresh = () => {
    if (!user?.id) return;
    refetch(user.id);
    toast.success("Collections updated! 🔄", { icon: "📈" });
  };

  const handleShare = async (meme) => {
    const memeUrl = `${window.location.origin}/meme/${meme.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: meme.template_name || "Check this out!",
          text: `I created this ${meme.isAIGenerated ? "AI " : ""}meme on Memefy AI!`,
          url: memeUrl,
        });
      } catch (e) { /* user cancelled */ }
    } else {
      navigator.clipboard.writeText(memeUrl);
      toast.success("Link copied! 📋");
    }
  };

  const handleDownload = (meme) => {
    const link = document.createElement("a");
    link.href = meme.displayImageUrl || meme.image_url || meme.image;
    link.download = `memefy-${meme.id}.jpg`;
    link.click();
    toast.success("Downloaded! 📥");
  };

  const handleDelete = async (meme) => {
    if (!window.confirm("Delete this masterpiece? This cannot be undone! 😱")) return;
    
    setIsDeleting(true);
    const toastId = toast.loading("Purging the cringe...");
    try {
      await deleteMeme(meme.id);
      setSelectedMeme(null);
      toast.success("Deleted! Onto the next one. ✨", { id: toastId });
    } catch (error) {
      toast.error("Deletion failed! 😢", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "A long time ago...";
    try {
      const d = dateValue.seconds ? new Date(dateValue.seconds * 1000) : new Date(dateValue);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return "Unknown"; }
  };

  const tabs = [
    { id: "my-memes", label: "My Memes", icon: "🎨", count: userMemes.length },
    { id: "favorites", label: "Favorites", icon: "❤️", count: favoriteMemes.length },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className={`min-h-screen p-4 md:p-8 transition-colors duration-500 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
      <SEO title="My Profile" description="Manage your meme collection and favorites." />
      
      <div className="max-w-6xl mx-auto space-y-8">
        <ProfileHeader 
          user={user} 
          analytics={analytics} 
          userMemesCount={userMemes.length} 
          isDarkMode={isDarkMode} 
        />

        {/* Tab Navigation */}
        <div className="flex justify-center gap-3">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentTab(tab.id)}
              className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 ${
                currentTab === tab.id 
                  ? "bg-gradient-to-r from-pink-500 to-cyan-500 text-white shadow-xl scale-105" 
                  : "glass opacity-60 hover:opacity-100"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count !== undefined && (
                <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs font-black">{tab.count}</span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[40vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {currentTab === "my-memes" && (
                <MemeCollection 
                  title="My Masterpieces"
                  memes={userMemes}
                  onRefresh={handleRefresh}
                  onSelect={setSelectedMeme}
                  onShare={handleShare}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                  isDarkMode={isDarkMode}
                  emptyMessage="Your gallery is empty... cringe! 🤡"
                  emptyAction={
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/generator")}
                      className="px-8 py-3 bg-gradient-to-r from-pink-500 to-cyan-500 text-white rounded-xl font-bold shadow-lg"
                    >
                      Create First Meme ✨
                    </motion.button>
                  }
                />
              )}

              {currentTab === "favorites" && (
                <MemeCollection 
                  title="Legendary Favorites"
                  memes={favoriteMemes}
                  onSelect={setSelectedMeme}
                  onShare={handleShare}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                  isDarkMode={isDarkMode}
                  emptyMessage="No favorites? You have no taste. 💅"
                />
              )}

              {currentTab === "settings" && (
                <ProfileSettings user={user} isDarkMode={isDarkMode} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <MemeDetailModal 
        meme={selectedMeme}
        onClose={() => setSelectedMeme(null)}
        onShare={handleShare}
        onDownload={handleDownload}
        isDarkMode={isDarkMode}
        formatDate={formatDate}
      />
    </div>
  );
};

export default Profile;