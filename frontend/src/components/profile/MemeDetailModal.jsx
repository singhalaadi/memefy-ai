import { motion, AnimatePresence } from "framer-motion";

const MemeDetailModal = ({ 
  meme, 
  onClose, 
  onShare, 
  onDownload, 
  isDarkMode,
  formatDate 
}) => {
  if (!meme) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
        className={`max-w-4xl w-full glass rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 ${
          isDarkMode ? "shadow-pink-500/10" : "bg-white/95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left Side: The Image */}
          <div className="lg:w-3/5 relative bg-black flex items-center justify-center p-4 lg:p-0">
            <img
              src={meme.displayImageUrl || meme.image_url || meme.image}
              alt={meme.template_name}
              className="w-full h-full object-contain max-h-[70vh] lg:max-h-screen"
            />
            {meme.isAIGenerated && (
              <div className="absolute top-6 left-6 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-2xl">
                AI GEN
              </div>
            )}
            
            <button
              onClick={onClose}
              className="absolute top-6 right-6 lg:hidden w-10 h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white text-xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Right Side: Info & Actions */}
          <div className="lg:w-2/5 p-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-3xl font-black italic gradient-text uppercase tracking-tight leading-none">
                  {meme.template_name || "Untitled"}
                </h3>
                <button
                  onClick={onClose}
                  className="hidden lg:flex w-10 h-10 glass rounded-full items-center justify-center hover:bg-white/10 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <StatItem label="Views" value={meme.views || 0} icon="👁️" />
                <StatItem label="Shares" value={meme.shares || 0} icon="📤" />
                <StatItem label="Created" value={formatDate(meme.createdAt)} icon="📅" />
                <StatItem label="Type" value={meme.isAIGenerated ? "AI Masterpiece" : "Template"} icon="✨" />
              </div>

              {meme.ai_concept && (
                <div className="mb-8 p-6 glass rounded-2xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20">
                  <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-3 ml-1">AI Prompt / Concept</p>
                  <p className="text-base font-medium italic opacity-80 leading-relaxed">
                    "{meme.ai_concept}"
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onShare(meme)}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all hover:shadow-blue-500/20"
              >
                <span>📤</span> Share Meme
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onDownload(meme)}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all hover:shadow-pink-500/20"
              >
                <span>📥</span> Download High-Res
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const StatItem = ({ label, value, icon }) => (
  <div className="glass p-3 rounded-2xl">
    <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{icon} {label}</div>
    <div className="text-sm font-bold truncate">{value}</div>
  </div>
);

export default MemeDetailModal;
