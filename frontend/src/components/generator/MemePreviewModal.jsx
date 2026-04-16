import { motion } from "framer-motion";

const MemePreviewModal = ({
  showPreview,
  setShowPreview,
  generatedMeme,
  isDarkMode,
  handleDownloadMeme,
  handleSaveMeme,
  memeRef,
  getTextStyle
}) => {
  if (!showPreview || !generatedMeme) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-500"
      style={{
        backgroundColor: isDarkMode
          ? "rgba(0,0,0,0.8)"
          : "rgba(0,0,0,0.6)",
      }}
      onClick={() => setShowPreview(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className={`relative max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ${
          isDarkMode ? "glass-dark shadow-pink-500/10" : "bg-white shadow-xl"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 md:p-6 flex items-center justify-between border-b border-white/10">
          <h2 className="text-xl md:text-2xl font-bold gradient-text">
            Your Masterpiece ✨
          </h2>
          <button
            onClick={() => setShowPreview(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-4 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Meme Preview Image */}
          <div className="flex-1">
            <div
              ref={memeRef}
              className="relative rounded-xl overflow-hidden shadow-lg mx-auto"
              style={{
                aspectRatio: "1/1",
                maxWidth: "400px",
              }}
            >
              <img
                src={
                  generatedMeme.image_url || generatedMeme.template_image
                }
                alt="Generated Meme"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />

              {/* Text overlays if no image_url */}
              {!generatedMeme.image_url && (
                <div className="absolute inset-0">
                  {generatedMeme.texts?.map((text, idx) => (
                    <div
                      key={idx}
                      className="meme-text-overlay"
                      style={getTextStyle(
                        idx === 0
                          ? { x: 50, y: 10 }
                          : { x: 50, y: 90 },
                        generatedMeme.styling,
                      )}
                    >
                      {text.toUpperCase()}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Analytics Badges */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {generatedMeme.sentiment && (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  generatedMeme.sentiment.toLowerCase().includes('positive') ? 'bg-green-500/20 text-green-400' : 
                  generatedMeme.sentiment.toLowerCase().includes('neutral') ? 'bg-blue-500/20 text-blue-400' : 
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  🎭 {generatedMeme.sentiment}
                </span>
              )}
              {typeof generatedMeme.toxicity_score === 'number' && (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  generatedMeme.toxicity_score < 0.1 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  🛡️ Toxicity: {(generatedMeme.toxicity_score * 100).toFixed(1)}%
                </span>
              )}
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="w-full md:w-48 lg:w-56 space-y-4">
            <div className={`p-4 rounded-2xl border transition-all duration-300 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <span>📈</span> Insights
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="opacity-60">Template</span>
                  <span className="font-semibold truncate max-w-[100px]">{generatedMeme.template_name || 'Custom'}</span>
                </div>
                {generatedMeme.template_trending && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="opacity-60">Status</span>
                    <span className="text-orange-400 font-bold">🔥 Trending</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownloadMeme}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
              >
                <span>💾 Download</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveMeme}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
              >
                <span>✨ Save to Profile</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPreview(false)}
                className={`w-full py-3 rounded-xl font-bold transition-all duration-300 border ${
                  isDarkMode 
                    ? "bg-transparent border-white/10 text-white hover:bg-white/5" 
                    : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Create More
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MemePreviewModal;