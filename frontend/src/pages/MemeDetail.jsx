import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";

const MemeDetail = () => {
  const { memeId } = useParams();
  const { isDarkMode } = useTheme();
  const [meme, setMeme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchMeme = async () => {
      try {
        const memeDoc = await getDoc(doc(db, "memes", memeId));

        if (memeDoc.exists()) {
          setMeme({ id: memeDoc.id, ...memeDoc.data() });
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Error fetching meme:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (memeId) {
      fetchMeme();
    }
  }, [memeId]);

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
            Loading meme...
          </p>
        </div>
      </div>
    );
  }

  if (notFound || !meme) {
    return <Navigate to="/gallery" replace />;
  }

  return (
    <div
      className={`min-h-screen py-8 px-4 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          {/* Meme Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold gradient-text mb-2">
              {meme.title || meme.template_name || "Awesome Meme"}
            </h1>
            {meme.isAIGenerated && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-full">
                <span className="animate-pulse">✨</span>
                AI Generated
              </div>
            )}
          </div>

          {/* Meme Image */}
          <div className="text-center mb-6">
            <img
              src={meme.image || meme.displayImageUrl || meme.image_url}
              alt={meme.title || "Meme"}
              className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
              style={{ maxHeight: "600px" }}
            />
          </div>

          {/* Meme Info */}
          {meme.isAIGenerated && meme.ai_concept && (
            <div className="mb-6 p-4 bg-purple-500/10 rounded-lg text-center">
              <p className="text-purple-600 dark:text-purple-400 font-medium">
                💭 {meme.ai_concept}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="flex justify-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text">
                {meme.views || 0}
              </div>
              <div
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Views
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text">
                {meme.shares || 0}
              </div>
              <div
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Shares
              </div>
            </div>
          </div>

          {/* Share Button */}
          <div className="text-center">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: meme.title || "Check out this meme!",
                    text: `Check out this ${
                      meme.isAIGenerated ? "AI-generated " : ""
                    }meme!`,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              📤 Share This Meme
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Created with MEMEFY AI
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MemeDetail;
