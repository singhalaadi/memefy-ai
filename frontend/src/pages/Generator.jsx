import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

// Context & Hooks
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useMemes } from "../hooks/useMemes";
import { useNavigate } from "react-router-dom";
import memeAPI from "../services/memeAPI";

// Modular Components
import TemplateSelector from "../components/generator/TemplateSelector";
import AIGeneratorBox from "../components/generator/AIGeneratorBox";
import MemeEditorControls from "../components/generator/MemeEditorControls";
import MemePreviewModal from "../components/generator/MemePreviewModal";
import SEO from "../components/common/SEO";

const Generator = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const { templates, templatesLoading, createMeme } = useMemes(user);
  const navigate = useNavigate();
  
  // Tab State - restored to original 3-tab layout
  const [activeTab, setActiveTab] = useState("templates");

  // State
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [textFields, setTextFields] = useState([]);
  const [fontFamily, setFontFamily] = useState("Impact");
  const [fontSize, setFontSize] = useState("2rem");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [textAlign, setTextAlign] = useState("center");
  const [textEffect, setTextEffect] = useState("shadow");
  
  const [textPosition, setTextPosition] = useState({ x: 50, y: 10 });
  const [bottomTextPosition, setBottomTextPosition] = useState({ x: 50, y: 90 });
  const [selectedTextElement, setSelectedTextElement] = useState("top");

  const [generatedMeme, setGeneratedMeme] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [templatesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [backendAIConcept, setBackendAIConcept] = useState("");
  const [isGeneratingBackendAI, setIsGeneratingBackendAI] = useState(false);
  const [useOwnTemplateForAI, setUseOwnTemplateForAI] = useState(false);

  // Constants
  const categories = ["All", "Popular", "Trending", "Classic", "Gaming", "Reaction"];
  
  const fontFamilies = [
    { id: "Impact", name: "Impact (Classic)", font: "Impact, 'Arial Black', sans-serif" },
    { id: "Arial", name: "Arial Bold", font: "'Arial Black', Arial, sans-serif" },
    { id: "Comic", name: "Comic Sans", font: "'Comic Sans MS', cursive" },
    { id: "Helvetica", name: "Helvetica", font: "Helvetica, Arial, sans-serif" }
  ];

  const textEffects = [
    { id: "shadow", name: "Shadow", style: "2px 2px 4px rgba(0,0,0,0.8)" },
    { id: "outline", name: "Outline", style: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000" },
    { id: "glow", name: "Glow", style: "0 0 10px rgba(255,255,255,0.8)" }
  ];

  // Memoized Template Filtering
  const allFilteredTemplates = useMemo(() => 
    selectedCategory === "All" ? (templates || []) : (templates || []).filter(t => t.category === selectedCategory),
    [templates, selectedCategory]
  );

  const filteredTemplates = useMemo(() => 
    allFilteredTemplates.slice(0, currentPage * templatesPerPage),
    [allFilteredTemplates, currentPage, templatesPerPage]
  );

  const canLoadMore = allFilteredTemplates.length > filteredTemplates.length;

  // Handlers
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    const boxCount = template?.box_count || 2;
    const initialTextFields = Array.from({ length: boxCount }, (_, index) => ({
      id: index,
      text: "",
      placeholder: `Text ${index + 1}${index === 0 ? " (Top)" : index === boxCount - 1 ? " (Bottom)" : ""}`
    }));
    setTextFields(initialTextFields);
    setActiveTab("customize");
    toast.success(`${template.name} selected! 🎨`);
  };

  const updateTextField = (id, text) => {
    setTextFields(prev => prev.map(field => field.id === id ? { ...field, text } : field));
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const generateBackendAIMeme = async () => {
    if (!backendAIConcept.trim()) return toast.error("Please enter a meme idea! 💭");
    if (useOwnTemplateForAI && !selectedTemplate) return toast.error("Please select a template first! 🎨");

    setIsGeneratingBackendAI(true);
    const toastId = toast.loading("🤖 AI model is analyzing...");

    try {
      const isBackendHealthy = await memeAPI.checkBackendHealth();
      if (!isBackendHealthy) throw new Error("Backend server is not running!");

      const templateId = useOwnTemplateForAI ? selectedTemplate.id : null;
      const result = await memeAPI.generateAIMeme(backendAIConcept, null, templateId);

      if (result.success) {
        setGeneratedMeme({
          ...result,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          user_id: user?.id,
          views: 0,
          shares: 0,
          // Map image URL
          image_url: result.memeUrl,
          template_image: result.memeUrl || selectedTemplate?.image,
          template_name: result.template?.name || selectedTemplate?.name || 'AI Generated',
          template_id: result.template?.id || selectedTemplate?.id || null,
          // Map AI analysis fields (camelCase → snake_case)
          toxicity_score: typeof result.toxicityScore === 'number' ? result.toxicityScore : null,
          trendy_score: typeof result.templateTrending === 'number' ? result.templateTrending : null,
          template_trending: result.templateTrending || false,
          template_usage: result.templateRecentUsage || 0,
        });
        setShowPreview(true);
        toast.success("AI Meme Generated! ✨", { id: toastId });
      }
    } catch (error) {
      toast.error(`Backend AI failed: ${error.message}`, { id: toastId });
    } finally {
      setIsGeneratingBackendAI(false);
    }
  };

  const handleGenerateMeme = async () => {
    if (!selectedTemplate) return toast.error("Please select a template first! 😅");
    
    const manualTexts = textFields.map(f => f.text?.trim() || "");
    if (manualTexts.every(t => t === "")) return toast.error("Please add some text! 😅");

    setIsGenerating(true);
    const toastId = toast.loading("🎨 Rendering your masterpiece...");

    try {
      const result = await memeAPI.generateAIMeme(null, null, selectedTemplate.id, manualTexts);
      if (result.success) {
        setGeneratedMeme({
          ...result,
          id: uuidv4(),
          template_id: selectedTemplate.id,
          template_name: selectedTemplate.name,
          // Use the generated meme URL as the primary image
          image_url: result.memeUrl,
          template_image: result.memeUrl || selectedTemplate.image,
          styling: { fontFamily, fontSize, textColor, textAlign, textEffect },
          user_id: user?.id,
          createdAt: new Date().toISOString(),
          views: 0,
          shares: 0,
          // Map AI analysis fields (camelCase → snake_case)
          toxicity_score: typeof result.toxicityScore === 'number' ? result.toxicityScore : null,
          sentiment: result.sentiment || null,
          trendy_score: typeof result.templateTrending === 'number' ? result.templateTrending : null,
          template_trending: result.templateTrending || false,
          template_usage: result.templateRecentUsage || 0,
        });
        setShowPreview(true);
        toast.success("Meme rendered! 🚀", { id: toastId });
      }
    } catch (error) {
      toast.error("Rendering failed! 💔", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadMeme = async () => {
    if (!generatedMeme?.memeUrl && !generatedMeme?.image_url) return;
    try {
      const url = generatedMeme.memeUrl || generatedMeme.image_url;
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `memefy-${Date.now()}.jpg`;
      link.href = blobUrl;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Downloaded! 📈");
    } catch (error) {
      toast.error("Download failed! 😢");
    }
  };

  const handleSaveMeme = async () => {
    if (!generatedMeme || !user) return toast.error("Login to save your memes! 🔐");
    try {
      await createMeme(generatedMeme);
      setShowPreview(false);
      toast.success("Meme saved! Redirecting to Dashboard... 🚀");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (error) {
      toast.error("Save failed! 😢");
    }
  };

  const getSuggestion = () => {
    const suggestions = [
      "When the code finally works but you don't know why",
      "Me waiting for my crush to reply",
      "That look when you realize it's Monday tomorrow"
    ];
    const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    if (textFields.length > 0) updateTextField(0, suggestion);
    toast("AI thought of this for you! 💡");
  };

  const getTextStyle = (pos, stylingOverride = null) => {
    const currentFont = stylingOverride?.fontFamily || fontFamily;
    const currentSize = stylingOverride?.fontSize || fontSize;
    const currentTextColor = stylingOverride?.textColor || textColor;
    const currentAlign = stylingOverride?.textAlign || textAlign;
    const currentEffect = stylingOverride?.textEffect || textEffect;

    const selectedFont = fontFamilies.find(f => f.id === currentFont);
    const effect = textEffects.find(e => e.id === currentEffect);

    return {
      top: `${pos.y}%`,
      left: `${pos.x}%`,
      color: currentTextColor,
      fontSize: currentSize,
      fontFamily: selectedFont?.font,
      textAlign: currentAlign,
      textShadow: effect?.style,
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      pointerEvents: 'none',
      fontWeight: 'bold',
      zIndex: 10
    };
  };

  // Tabs definition (original 3-tab layout from second screenshot)
  const tabs = [
    { id: "templates", label: "Templates", icon: "🎭" },
    { id: "customize", label: "Customize", icon: "🖊️" },
    { id: "effects", label: "Effects", icon: "✨" },
  ];

  return (
    <div className={`min-h-screen p-4 md:p-8 transition-colors duration-500 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
      <SEO title="Meme Factory | Memefy AI" description="Create viral memes using our trained AI model." />

      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-black mb-3 tracking-tight">
          <span className="gradient-text">MEME</span>{" "}
          <span>🎨</span>{" "}
          <span className="gradient-text">FACTORY</span>
        </h1>
        <p className={`text-base md:text-lg ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          Create viral content in seconds • No cap 🧢
        </p>
      </motion.div>

      {/* Original 3-Tab Navigation */}
      <div className="flex justify-center gap-3 mb-8">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30"
                : isDarkMode
                  ? "glass text-gray-400 hover:text-white border border-white/10"
                  : "bg-white text-gray-500 hover:text-gray-900 shadow-sm border border-gray-200"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* ── TAB 1: TEMPLATES ── */}
          {activeTab === "templates" && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <TemplateSelector
                templates={templates}
                templatesLoading={templatesLoading}
                categories={categories}
                selectedCategory={selectedCategory}
                handleCategoryChange={handleCategoryChange}
                filteredTemplates={filteredTemplates}
                canLoadMore={canLoadMore}
                handleLoadMore={handleLoadMore}
                handleTemplateSelect={handleTemplateSelect}
                setActiveTab={setActiveTab}
                isDarkMode={isDarkMode}
                templatesPerPage={templatesPerPage}
              />
            </motion.div>
          )}

          {/* ── TAB 2: CUSTOMIZE ── */}
          {activeTab === "customize" && (
            <motion.div
              key="customize"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {!selectedTemplate ? (
                <div className="text-center py-16 space-y-4">
                  <div className="text-7xl">🎭</div>
                  <h3 className="text-2xl font-black italic">No template selected!</h3>
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Go to the Templates tab first and pick a canvas.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab("templates")}
                    className="mt-4 px-8 py-3 bg-gradient-to-r from-pink-500 to-cyan-500 text-white rounded-full font-bold shadow-lg"
                  >
                    Pick a Template 🎭
                  </motion.button>
                </div>
              ) : (
                <MemeEditorControls
                  selectedTemplate={selectedTemplate}
                  setActiveTab={setActiveTab}
                  textFields={textFields}
                  updateTextField={updateTextField}
                  getSuggestion={getSuggestion}
                  fontFamilies={fontFamilies}
                  fontFamily={fontFamily}
                  setFontFamily={setFontFamily}
                  textEffects={textEffects}
                  textEffect={textEffect}
                  setTextEffect={setTextEffect}
                  textColor={textColor}
                  setTextColor={setTextColor}
                  fontSize={fontSize}
                  setFontSize={setFontSize}
                  textAlign={textAlign}
                  setTextAlign={setTextAlign}
                  selectedTextElement={selectedTextElement}
                  setSelectedTextElement={setSelectedTextElement}
                  textPosition={textPosition}
                  setTextPosition={setTextPosition}
                  bottomTextPosition={bottomTextPosition}
                  setBottomTextPosition={setBottomTextPosition}
                  isDarkMode={isDarkMode}
                  getTextStyle={getTextStyle}
                  handleGenerateMeme={handleGenerateMeme}
                  isGenerating={isGenerating}
                  backendAIConcept={backendAIConcept}
                  setBackendAIConcept={setBackendAIConcept}
                  useOwnTemplateForAI={useOwnTemplateForAI}
                  setUseOwnTemplateForAI={setUseOwnTemplateForAI}
                  generateBackendAIMeme={generateBackendAIMeme}
                  isGeneratingBackendAI={isGeneratingBackendAI}
                />
              )}
            </motion.div>
          )}

          {/* ── TAB 3: EFFECTS ── */}
          {activeTab === "effects" && (
            <motion.div
              key="effects"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="max-w-2xl mx-auto space-y-6"
            >
              <div className={`glass p-6 rounded-2xl space-y-6 ${isDarkMode ? "" : "bg-white/90 shadow-lg border border-gray-100"}`}>
                <h3 className="text-lg font-black gradient-text">🎨 Text Effects</h3>
                <div className="grid grid-cols-3 gap-3">
                  {textEffects.map((effect) => (
                    <motion.button
                      key={effect.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setTextEffect(effect.id)}
                      className={`p-4 rounded-xl font-black text-sm transition-all border ${
                        textEffect === effect.id
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-transparent shadow-lg shadow-pink-500/20"
                          : isDarkMode
                            ? "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                            : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                      }`}
                      style={{ textShadow: textEffect === effect.id ? effect.style : "none" }}
                    >
                      {effect.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className={`glass p-6 rounded-2xl space-y-6 ${isDarkMode ? "" : "bg-white/90 shadow-lg border border-gray-100"}`}>
                <h3 className="text-lg font-black gradient-text">🔠 Font Presets</h3>
                <div className="grid grid-cols-2 gap-3">
                  {fontFamilies.map((f) => (
                    <motion.button
                      key={f.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFontFamily(f.id)}
                      className={`p-4 rounded-xl font-bold text-sm text-left transition-all border ${
                        fontFamily === f.id
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent shadow-lg shadow-cyan-500/20"
                          : isDarkMode
                            ? "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                            : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                      }`}
                      style={{ fontFamily: f.font }}
                    >
                      {f.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className={`glass p-6 rounded-2xl space-y-4 ${isDarkMode ? "" : "bg-white/90 shadow-lg border border-gray-100"}`}>
                <h3 className="text-lg font-black gradient-text">⚙️ Text Size & Color</h3>
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <label className="block text-xs font-bold opacity-60 mb-2">Text Color</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
                        className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent" />
                      <input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)}
                        className={`flex-1 p-2 text-xs font-mono rounded-lg uppercase ${
                          isDarkMode ? "bg-white/5 text-white" : "bg-gray-100 text-gray-900"
                        }`} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold opacity-60 mb-2">Font Size</label>
                    <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}
                      className={`w-full p-3 rounded-xl font-bold text-sm ${
                        isDarkMode ? "bg-white/5 text-white border border-white/10" : "bg-gray-100 text-gray-900 border border-gray-200"
                      }`}>
                      <option value="1rem">Small</option>
                      <option value="1.5rem">Medium</option>
                      <option value="2rem">Normal</option>
                      <option value="2.5rem">Large</option>
                      <option value="3rem">Huge</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <MemePreviewModal
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        generatedMeme={generatedMeme}
        handleDownloadMeme={handleDownloadMeme}
        handleSaveMeme={handleSaveMeme}
        user={user}
        isDarkMode={isDarkMode}
        getTextStyle={getTextStyle}
        fontFamilies={fontFamilies}
        textEffects={textEffects}
      />

      {/* AI Generation Overlay */}
      <AnimatePresence>
        {isGeneratingBackendAI && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-3xl">🎯</div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Memefying your idea...</h2>
              <p className="text-gray-400">Our custom model is cooking up something viral</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Generator;