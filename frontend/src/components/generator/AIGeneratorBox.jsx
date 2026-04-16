import { motion } from "framer-motion";

const AIGeneratorBox = ({
  backendAIConcept,
  setBackendAIConcept,
  useOwnTemplateForAI,
  setUseOwnTemplateForAI,
  generateBackendAIMeme,
  isGeneratingBackendAI,
  isDarkMode,
  selectedTemplate
}) => {
  return (
    <div
      className={`glass p-6 md:p-8 rounded-[2.5rem] max-w-2xl mx-auto mb-12 border-2 transition-all duration-500 relative overflow-hidden group ${
        isDarkMode
          ? "border-cyan-500/30 bg-gradient-to-br from-gray-900 via-gray-900 to-cyan-900/20"
          : "bg-gradient-to-br from-white via-white to-cyan-50 shadow-2xl border-cyan-100"
      }`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-pink-500/20 transition-colors duration-700"></div>
      
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="bg-gradient-to-r from-pink-500 to-cyan-500 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg">
          Exclusive Model
        </div>
        <h3 className="text-2xl font-black italic gradient-text uppercase tracking-tight">
          Trained AI Model
        </h3>
      </div>
      
      <p className={`text-sm mb-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        ✨ Our specialized model combines sentiment analysis with advanced algorithms to craft the perfect viral caption.
      </p>

      {/* Template Toggle */}
      <div
        className={`mb-4 p-3 rounded-xl border transition-all duration-300 ${
          isDarkMode
            ? "bg-gray-800/50 border-gray-700 hover:border-yellow-500/30"
            : "bg-white/70 border-gray-200 hover:border-yellow-300 shadow-sm"
        }`}
      >
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={useOwnTemplateForAI}
            onChange={(e) => setUseOwnTemplateForAI(e.target.checked)}
            className="w-5 h-5 rounded text-yellow-500 focus:ring-2 focus:ring-yellow-500 transition-all"
          />
          <div className="flex-1">
            <span className={`font-bold text-sm md:text-base ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              🎨 Use My Selected Template
            </span>
            <p className="text-xs text-gray-500 mt-0.5">
              {useOwnTemplateForAI
                ? selectedTemplate
                  ? `✓ Using: ${selectedTemplate.name}`
                  : "⚠️ Please select a template below first!"
                : "AI will intelligently pick the best viral template for you"}
            </p>
          </div>
        </label>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold mb-2">
            💡 Describe your meme idea
          </label>
          <textarea
            value={backendAIConcept}
            onChange={(e) => setBackendAIConcept(e.target.value)}
            placeholder="e.g., When you finally finish a bug but find 10 more..."
            className={`w-full p-4 rounded-xl border-2 transition-all duration-300 h-24 resize-none ${
              isDarkMode
                ? "bg-gray-800 border-yellow-500/30 text-white focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
                : "bg-white border-yellow-300 text-gray-900 focus:border-yellow-500 focus:shadow-lg"
            }`}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                generateBackendAIMeme();
              }
            }}
          />
          <p className="text-[10px] md:text-xs text-gray-500 mt-1.5 flex justify-between">
            <span>Pro tip: Press Ctrl+Enter to generate</span>
            <span>{backendAIConcept.length}/200</span>
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateBackendAIMeme}
          disabled={isGeneratingBackendAI || !backendAIConcept.trim()}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 ease-in-out flex items-center justify-center gap-2 ${
            isDarkMode
              ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600"
              : "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-yellow-200/50"
          }`}
        >
          {isGeneratingBackendAI ? (
            <>
              <div className="animate-spin w-5 h-5 border-3 border-white border-t-transparent rounded-full" />
              <span>Analyzing Trends...</span>
            </>
          ) : (
            <>
              <span>🤖 Let AI Cook</span>
              <span className="text-xl">✨</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default AIGeneratorBox;
