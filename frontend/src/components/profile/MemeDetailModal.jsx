import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Share2, Calendar, Sparkles, Download, X, Trash2 } from "lucide-react";

const MemeDetailModal = ({
  meme,
  onClose,
  onShare,
  onDownload,
  onDelete,
  isDarkMode,
  formatDate,
}) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (meme) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [meme]);

  return (
    <AnimatePresence>
      {meme && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md"
          />

          {/* Centered Modal Content */}
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`
                pointer-events-auto
                relative w-full max-w-sm
                rounded-[2.5rem]
                overflow-hidden shadow-2xl
                border border-white/10
                flex flex-col
                ${isDarkMode ? "bg-slate-900 shadow-pink-500/5" : "bg-white shadow-xl"}
              `}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`px-6 py-4 flex items-center justify-between border-b ${isDarkMode ? "border-white/5" : "border-gray-100"}`}>
                <h3 className="text-sm font-black italic gradient-text uppercase tracking-tight truncate pr-3 flex-1">
                  {meme.template_name || "Untitled"}
                </h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {meme.isAIGenerated && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-purple-500/20">
                      <Sparkles size={8} /> AI
                    </span>
                  )}
                  <button
                    onClick={onClose}
                    className={`p-2 rounded-full transition-colors ${isDarkMode ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-400"}`}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Scrollable Container (Safe for small devices) */}
              <div className="overflow-y-auto max-h-[70vh]">
                {/* Meme Image Area */}
                <div className="relative w-full bg-black/40 flex items-center justify-center p-3">
                  <img
                    src={meme.displayImageUrl || meme.image_url || meme.image}
                    alt={meme.template_name}
                    className="w-full h-auto max-h-[320px] object-contain rounded-2xl shadow-lg"
                  />
                </div>

                {/* Stats Section */}
                <div className={`flex items-center gap-4 px-6 py-4 border-b text-[10px] font-black uppercase tracking-widest ${isDarkMode ? "border-white/5 text-white/30" : "border-gray-100 text-slate-400"}`}>
                  <span className="flex items-center gap-1.5">
                    <Eye size={13} className="text-cyan-400" />
                    {(meme.views || 0).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1.5 border-l border-white/5 pl-3">
                    <Share2 size={13} className="text-blue-400" />
                    {(meme.shares || 0).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1.5 ml-auto opacity-60">
                    <Calendar size={13} className="text-pink-400" />
                    {formatDate ? formatDate(meme.createdAt) : ""}
                  </span>
                </div>

                {/* Description / AI Prompt (Optional) */}
                {meme.ai_concept && (
                  <div className={`px-6 py-4 border-b text-xs italic leading-relaxed ${isDarkMode ? "border-white/5 text-white/50" : "border-gray-100 text-slate-500"}`}>
                    "{meme.ai_concept}"
                  </div>
                )}
              </div>

              {/* Footer Actions - Fixed at bottom of modal */}
              <div className="p-6 flex flex-wrap gap-2">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onShare(meme)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    isDarkMode
                      ? "bg-white/5 hover:bg-white/10 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  <Share2 size={16} /> Share
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onDownload(meme)}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-pink-500 to-cyan-500 text-white transition-all shadow-lg shadow-pink-500/20"
                >
                  <Download size={16} /> Save
                </motion.button>

                {onDelete && (
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onDelete(meme)}
                    className="flex items-center justify-center gap-1 px-4 py-3.5 rounded-2xl text-xs font-black text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all border border-red-500/20"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MemeDetailModal;
