import { motion } from "framer-motion";

const MemeCollection = ({ 
  title, 
  memes, 
  onRefresh, 
  onSelect, 
  onShare, 
  onDownload, 
  onDelete, 
  isDarkMode,
  emptyMessage = "No memes found... yet! 🧐",
  emptyAction = null
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black italic gradient-text uppercase tracking-tight">
          {title}
        </h2>
        {onRefresh && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRefresh}
            className="p-3 glass rounded-2xl hover:bg-blue-500/10 transition-colors"
          >
            🔄
          </motion.button>
        )}
      </div>

      {memes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {memes.map((meme, index) => (
            <motion.div
              key={meme.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              onClick={() => onSelect(meme)}
              className={`group relative glass rounded-3xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 ${
                isDarkMode ? "" : "bg-white/90 shadow-lg border border-gray-100"
              }`}
            >
              {/* Image Container */}
              <div className="aspect-square relative overflow-hidden bg-gray-900/10">
                <img
                  src={meme.displayImageUrl || meme.image_url || meme.image}
                  alt={meme.template_name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* AI Badge */}
                {meme.isAIGenerated && (
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                    AI POWERED
                  </div>
                )}

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                  <ActionButton icon="📤" onClick={(e) => { e.stopPropagation(); onShare(meme); }} label="Share" />
                  <ActionButton icon="📥" onClick={(e) => { e.stopPropagation(); onDownload(meme); }} label="Save" />
                  <ActionButton icon="🗑️" onClick={(e) => { e.stopPropagation(); onDelete(meme); }} label="Delete" color="hover:bg-red-500" />
                </div>
              </div>

              {/* Info section */}
              <div className="p-5">
                <h3 className="font-bold truncate text-lg mb-2">
                  {meme.template_name || "Untitled Masterpiece"}
                </h3>
                
                <div className="flex justify-between items-center opacity-60 text-xs font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1.5">
                    <span className="text-blue-500">👁️</span> {meme.views || 0}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-pink-500">📤</span> {meme.shares || 0}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 glass rounded-3xl border-2 border-dashed border-gray-500/20">
          <div className="text-6xl mb-6">🎭</div>
          <h3 className="text-2xl font-bold mb-4 italic">{emptyMessage}</h3>
          {emptyAction}
        </div>
      )}
    </div>
  );
};

const ActionButton = ({ icon, onClick, label, color = "hover:bg-blue-500" }) => (
  <motion.button
    whileHover={{ scale: 1.1, translateY: -2 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`w-12 h-12 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center text-xl transition-all ${color}`}
    title={label}
  >
    {icon}
  </motion.button>
);

export default MemeCollection;
