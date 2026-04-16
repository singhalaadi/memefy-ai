import { motion } from "framer-motion";
import AIGeneratorBox from "./AIGeneratorBox";

const MemeEditorControls = ({
  selectedTemplate,
  setActiveTab,
  textFields,
  updateTextField,
  getSuggestion,
  fontFamilies,
  setFontFamily,
  fontFamily,
  textEffects,
  setTextEffect,
  textEffect,
  setTextColor,
  textColor,
  setFontSize,
  fontSize,
  setTextAlign,
  textAlign,
  selectedTextElement,
  setSelectedTextElement,
  textPosition,
  setTextPosition,
  bottomTextPosition,
  setBottomTextPosition,
  isDarkMode,
  getTextStyle,
  handleGenerateMeme,
  isGenerating,
  // AI box props
  backendAIConcept,
  setBackendAIConcept,
  useOwnTemplateForAI,
  setUseOwnTemplateForAI,
  generateBackendAIMeme,
  isGeneratingBackendAI,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(380px,460px)_1fr] gap-6 items-start">

      {/* ── LEFT: Sticky Live Preview ────────────────── */}
      <div className="lg:sticky lg:top-20">
        <div className={`glass p-4 rounded-3xl transition-all duration-300 ${isDarkMode ? "" : "bg-white/90 shadow-lg border border-gray-100"}`}>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-bold gradient-text text-sm">Live Preview</h3>
            <span className="text-[10px] opacity-40 uppercase tracking-widest font-bold">Dynamic Edit</span>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black/20">
            <img
              src={selectedTemplate?.image}
              alt={selectedTemplate?.name}
              className="w-full h-auto object-contain max-h-[460px]"
            />
            <div className="absolute inset-0 pointer-events-none">
              {textFields.map((field, index) => {
                if (!field?.text) return null;
                const isBottom = index === textFields.length - 1 && textFields.length > 1;
                const pos = isBottom ? bottomTextPosition : textPosition;
                return (
                  <div
                    key={field.id}
                    className="meme-text-overlay"
                    style={getTextStyle(pos)}
                  >
                    {field.text.toUpperCase()}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Generate button under preview */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerateMeme}
            disabled={isGenerating || !textFields.some(f => f.text.trim())}
            className="mt-4 w-full py-4 rounded-2xl font-bold text-base shadow-xl disabled:opacity-40 transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-cyan-500 text-white hover:shadow-pink-500/30"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                <span>Rendering...</span>
              </>
            ) : (
              <>✨ Create Meme 🔥</>
            )}
          </motion.button>
        </div>
      </div>

      {/* ── RIGHT: Stacked Controls ──────────────────── */}
      <div className="space-y-5">

        {/* 1. Text Content */}
        <div className={`glass p-5 rounded-2xl transition-all duration-300 ${isDarkMode ? "" : "bg-white/90 shadow-lg border border-gray-100"}`}>
          <h3 className="text-base font-bold mb-4 gradient-text">Text Content</h3>
          <div className="space-y-3">
            {textFields.map((field) => (
              <div key={field.id} className="space-y-1">
                <label className="block text-xs font-bold opacity-60 px-1">{field.placeholder}</label>
                <textarea
                  value={field.text}
                  onChange={(e) => updateTextField(field.id, e.target.value)}
                  placeholder="Meme text here..."
                  className={`w-full p-3 rounded-xl border-2 resize-none transition-all duration-200 focus:scale-[1.005] text-sm ${
                    isDarkMode
                      ? "bg-gray-800/50 border-gray-700 focus:border-pink-500 text-white"
                      : "bg-white border-gray-200 focus:border-pink-500 text-gray-900"
                  }`}
                  rows={2}
                />
              </div>
            ))}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={getSuggestion}
              className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                isDarkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}
            >
              🎲 Magic Suggestion
            </motion.button>
          </div>
        </div>

        {/* 2. Trained AI Model */}
        <AIGeneratorBox
          backendAIConcept={backendAIConcept}
          setBackendAIConcept={setBackendAIConcept}
          useOwnTemplateForAI={useOwnTemplateForAI}
          setUseOwnTemplateForAI={setUseOwnTemplateForAI}
          generateBackendAIMeme={generateBackendAIMeme}
          isGeneratingBackendAI={isGeneratingBackendAI}
          isDarkMode={isDarkMode}
          selectedTemplate={selectedTemplate}
        />

        {/* 3. Style & Layout */}
        <div className={`glass p-5 rounded-2xl transition-all duration-300 ${isDarkMode ? "" : "bg-white/90 shadow-lg border border-gray-100"}`}>
          <h3 className="text-base font-bold mb-4 gradient-text">Style & Layout</h3>
          <div className="space-y-5">

            {/* Font Family */}
            <div>
              <label className="block text-xs font-bold opacity-60 mb-2 px-1">Font Family</label>
              <div className="grid grid-cols-4 gap-2">
                {fontFamilies.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFontFamily(f.id)}
                    className={`px-2 py-2 rounded-lg text-[10px] font-bold transition-all truncate ${
                      fontFamily === f.id
                        ? "bg-gradient-to-r from-pink-500 to-cyan-500 text-white shadow-md"
                        : isDarkMode ? "bg-white/5 hover:bg-white/10 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                    style={{ fontFamily: f.font }}
                  >
                    {f.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Effect */}
            <div>
              <label className="block text-xs font-bold opacity-60 mb-2 px-1">Text Effect</label>
              <div className="grid grid-cols-3 gap-2">
                {textEffects.map((effect) => (
                  <button
                    key={effect.id}
                    onClick={() => setTextEffect(effect.id)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      textEffect === effect.id
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md"
                        : isDarkMode ? "bg-white/5 hover:bg-white/10 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {effect.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Color & Size */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold opacity-60 mb-2 px-1">Text Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer border-none bg-transparent" />
                  <input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)}
                    className={`w-full p-2 text-xs font-mono rounded-lg uppercase ${isDarkMode ? "bg-white/5 text-white" : "bg-gray-100 text-gray-800"}`} />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold opacity-60 mb-2 px-1">Font Size</label>
                <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}
                  className={`w-full p-2 px-3 rounded-lg text-xs font-bold ${isDarkMode ? "bg-white/5 text-white border border-white/10" : "bg-gray-100 text-gray-800 border border-gray-200"}`}>
                  <option value="1rem">Small</option>
                  <option value="1.5rem">Medium</option>
                  <option value="2rem">Normal</option>
                  <option value="2.5rem">Large</option>
                  <option value="3rem">Huge</option>
                </select>
              </div>
            </div>

            {/* Position Controls */}
            {selectedTemplate && (
              <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold opacity-60">Adjust Position</label>
                  <div className={`flex rounded-lg p-1 gap-1 ${isDarkMode ? "bg-white/10" : "bg-gray-200"}`}>
                    {["top", "bottom"].map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setSelectedTextElement(pos)}
                        className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold transition-all ${
                          selectedTextElement === pos
                            ? isDarkMode ? "bg-gray-800 shadow-sm" : "bg-white shadow-sm"
                            : "opacity-40"
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  {["x", "y"].map((axis) => (
                    <div key={axis}>
                      <div className="flex justify-between text-[10px] mb-1 opacity-60">
                        <span>{axis === "x" ? "Horizontal" : "Vertical"}</span>
                        <span className="font-mono">
                          {selectedTextElement === "top"
                            ? axis === "x" ? textPosition.x : textPosition.y
                            : axis === "x" ? bottomTextPosition.x : bottomTextPosition.y}%
                        </span>
                      </div>
                      <input
                        type="range" min="0" max="100"
                        value={selectedTextElement === "top"
                          ? axis === "x" ? textPosition.x : textPosition.y
                          : axis === "x" ? bottomTextPosition.x : bottomTextPosition.y}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (selectedTextElement === "top") {
                            setTextPosition(p => ({ ...p, [axis]: val }));
                          } else {
                            setBottomTextPosition(p => ({ ...p, [axis]: val }));
                          }
                        }}
                        className={`w-full ${axis === "x" ? "accent-pink-500" : "accent-cyan-500"}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default MemeEditorControls;
