import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useMemes } from "../hooks/useMemes";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

const Generator = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const { templates, templatesLoading, createMeme } = useMemes();
  const memeRef = useRef(null);

  // State
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [textFields, setTextFields] = useState([]);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [fontSize, setFontSize] = useState("2rem");
  const [textEffect, setTextEffect] = useState("shadow");
  const [generatedMeme, setGeneratedMeme] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("templates");
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templatesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const categories = [
    "All",
    "Popular",
    "Trending",
    "Classic",
    "Gaming",
    "Reaction",
  ];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const textEffects = [
    { id: "shadow", name: "Shadow", style: "2px 2px 4px rgba(0,0,0,0.8)" },
    {
      id: "outline",
      name: "Outline",
      style:
        "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
    },
    { id: "glow", name: "Glow", style: "0 0 10px rgba(255,255,255,0.8)" },
    {
      id: "neon",
      name: "Neon",
      style: "0 0 5px #ff0080, 0 0 10px #ff0080, 0 0 15px #ff0080",
    },
  ];

  const aiSuggestions = [
    "When you're trying to adult but...",
    "POV: You're explaining memes to your parents",
    "Me pretending to understand crypto",
    "That friend who replies 'k'",
    "When Wi-Fi is down for 5 seconds",
  ];

  // Get all templates for selected category
  const allFilteredTemplates = selectedCategory === "All" 
    ? templates 
    : templates.filter((t) => t.category === selectedCategory);
    
  // Progressive loading - show templates in chunks
  const totalToShow = currentPage * templatesPerPage;
  const filteredTemplates = allFilteredTemplates.slice(0, totalToShow);
  
  // Template counts for display
  const totalTemplatesCount = allFilteredTemplates.length;
  const remainingTemplatesCount = Math.max(0, totalTemplatesCount - totalToShow);
  const canLoadMore = remainingTemplatesCount > 0;

  // Handle template selection
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    // Initialize text fields based on box_count
    const boxCount = template.box_count || 2;
    const initialTextFields = Array.from({ length: boxCount }, (_, index) => ({
      id: index,
      text: '',
      placeholder: `Text ${index + 1}${index === 0 ? ' (Top)' : index === boxCount - 1 ? ' (Bottom)' : ''}`
    }));
    setTextFields(initialTextFields);
    
    // Keep backward compatibility with existing topText/bottomText
    if (boxCount >= 1) setTopText('');
    if (boxCount >= 2) setBottomText('');
  };

  // Update text field
  const updateTextField = (id, text) => {
    setTextFields(prev => prev.map(field => 
      field.id === id ? { ...field, text } : field
    ));
    
    // Update topText/bottomText for backward compatibility
    if (id === 0) setTopText(text);
    if (id === 1) setBottomText(text);
  };

  // Load more templates
  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
    
    // Add a small delay for better UX, then scroll to new content
    setTimeout(() => {
      const newTemplateIndex = (currentPage - 1) * templatesPerPage;
      const templateElements = document.querySelectorAll('[data-template-index]');
      if (templateElements[newTemplateIndex]) {
        templateElements[newTemplateIndex].scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
  };

  // Reset pagination when changing categories
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page
  };

  const handleGenerateMeme = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a template first! 😅");
      return;
    }
    
    const hasText = textFields.some(field => field.text.trim() !== '') || topText.trim() !== '' || bottomText.trim() !== '';
    if (!hasText) {
      toast.error("Please add some text to your meme! 😅");
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate AI processing with fun messages
      const messages = [
        "Consulting the meme gods... 🙏",
        "Adding extra spice... 🌶️",
        "Checking viral potential... 📈",
        "Perfect! Creating masterpiece... ✨",
      ];

      for (let i = 0; i < messages.length; i++) {
        toast(messages[i], { icon: "🤖" });
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      const memeData = {
        id: uuidv4(),
        template_id: selectedTemplate.id,
        template_name: selectedTemplate.name,
        template_image: selectedTemplate.image,
        top_text: topText,
        bottom_text: bottomText,
        text_fields: textFields,
        text_color: textColor,
        font_size: fontSize,
        text_effect: textEffect,
        created_at: new Date().toISOString(),
        user_id: user?.id,
        views: 0,
        shares: 0,
      };

      setGeneratedMeme(memeData);
      setShowPreview(true);
      toast.success("Meme is ready to break the internet! 🔥");
    } catch (error) {
      toast.error("Oops! Meme machine broke 😭");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadMeme = async () => {
    if (!memeRef.current) return;

    try {
      const canvas = await html2canvas(memeRef.current, {
        backgroundColor: "transparent",
        scale: 3,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `epic-meme-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();

      toast.success("Meme downloaded! Time to go viral! 🚀");
    } catch (error) {
      toast.error("Download failed! Try again bestie 💔");
    }
  };

  const handleSaveMeme = async () => {
    if (!generatedMeme || !user) {
      toast.error("Need to be logged in to save! 🔐");
      return;
    }

    try {
      await createMeme(generatedMeme);
      setShowPreview(false);
      setGeneratedMeme(null);
      setTopText("");
      setBottomText("");
      setSelectedTemplate(null);
      toast.success("Added to your gallery! ✨");
    } catch (error) {
      toast.error("Save failed! Our servers are crying 😢");
    }
  };

  const getTextStyle = () => {
    const effect = textEffects.find((e) => e.id === textEffect);
    return {
      color: textColor,
      fontSize: fontSize,
      fontWeight: "bold",
      textTransform: "uppercase",
      textShadow: effect?.style || "2px 2px 4px rgba(0,0,0,0.8)",
      WebkitTextStroke: textEffect === "outline" ? "2px black" : "none",
    };
  };

  const getSuggestion = () => {
    const suggestion =
      aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)];
    
    if (textFields.length > 0) {
      // Randomly select one of the text fields
      const randomFieldId = Math.floor(Math.random() * textFields.length);
      updateTextField(randomFieldId, suggestion);
    } else {
      // Fallback to old behavior
      if (Math.random() > 0.5) {
        setTopText(suggestion);
      } else {
        setBottomText(suggestion);
      }
    }
    toast("AI suggestion added! 🤖✨", { icon: "💡" });
  };

  return (
    <div
      className={`min-h-screen p-6 transition-all duration-500 ease-in-out ${
        isDarkMode ? "text-white" : "text-gray-900"
      }`}
    >
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none transition-opacity duration-700">
        <div
          className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse transition-all duration-700 ${
            isDarkMode
              ? "bg-gradient-to-r from-pink-500/20 to-cyan-500/20"
              : "bg-gradient-to-r from-pink-300/30 to-blue-300/30"
          }`}
        ></div>
        <div
          className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000 transition-all duration-700 ${
            isDarkMode
              ? "bg-gradient-to-r from-yellow-500/20 to-pink-500/20"
              : "bg-gradient-to-r from-orange-300/30 to-pink-300/30"
          }`}
        ></div>
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse delay-500 transition-all duration-700 ${
            isDarkMode
              ? "bg-gradient-to-r from-cyan-500/10 to-purple-500/10"
              : "bg-gradient-to-r from-blue-200/40 to-purple-200/40"
          }`}
        ></div>
      </div>

      {/* Header */}
      <motion.div
        className="text-center mb-8 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          <span className="gradient-text transition-all duration-500">
            MEME
          </span>
          <span className="text-2xl md:text-4xl ml-2">🎨</span>
          <span className="gradient-text ml-2 transition-all duration-500">
            FACTORY
          </span>
        </h1>
        <p
          className={`text-lg transition-colors duration-300 ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Create viral content in seconds • No cap 📈
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {["templates", "customize", "effects"].map((tab) => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-500 ease-in-out transform hover:scale-105 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-pink-500 to-cyan-500 text-white shadow-lg scale-105"
                  : isDarkMode
                  ? "glass text-gray-300 hover:text-white hover:shadow-md"
                  : "bg-white/80 text-gray-700 hover:text-gray-900 hover:bg-white shadow-sm hover:shadow-md border border-gray-200"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === "templates" && " 🖼️"}
              {tab === "customize" && " ✏️"}
              {tab === "effects" && " ✨"}
            </motion.button>
          ))}
        </div>

        {
          /* Templates Tab */
          <AnimatePresence mode="wait">
            {activeTab === "templates" && (
              <motion.div
                key="templates"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-6 justify-center">
                  {categories.map((category) => {
                    const categoryCount = category === "All" 
                      ? templates.length 
                      : templates.filter(t => t.category === category).length;
                    
                    return (
                    <motion.button
                      key={category}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCategoryChange(category)}
                      className={`px-4 py-2 rounded-full font-medium transition-all duration-500 ease-in-out transform hover:scale-105 ${
                        selectedCategory === category
                          ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg scale-105"
                          : isDarkMode
                          ? "glass-dark text-gray-300 hover:text-white hover:shadow-md"
                          : "bg-white/80 text-gray-600 hover:text-gray-900 hover:bg-white shadow-sm hover:shadow-md border border-gray-200"
                      }`}
                    >
                      {category} {categoryCount > 0 && (
                        <span className="ml-1 text-xs opacity-75">
                          ({categoryCount})
                        </span>
                      )}
                    </motion.button>
                    );
                  })}
                </div>

                {/* Template Grid */}
                {templatesLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div
                        key={index}
                        className={`aspect-square rounded-2xl animate-pulse ${
                          isDarkMode ? "bg-gray-700" : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                    {filteredTemplates.length === 0 ? (
                      <div className="col-span-full text-center py-12">
                        <div className="text-6xl mb-4">😅</div>
                        <h3 className="text-xl font-bold mb-2">No Templates Found</h3>
                        <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                          Try selecting a different category or check your internet connection
                        </p>
                      </div>
                    ) : (
                      filteredTemplates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      data-template-index={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: (index % templatesPerPage) * 0.05 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        handleTemplateSelect(template);
                        setActiveTab("customize");
                      }}
                      className={`cursor-pointer rounded-2xl overflow-hidden transition-all duration-500 ease-in-out transform hover:scale-105 ${
                        selectedTemplate?.id === template.id
                          ? "ring-4 ring-pink-500 shadow-xl shadow-pink-500/25 scale-105"
                          : isDarkMode
                          ? "glass hover:shadow-xl hover:shadow-white/10"
                          : "bg-white/90 hover:bg-white shadow-lg hover:shadow-xl hover:shadow-gray-200/50 border border-gray-100"
                      }`}
                    >
                      <div className="aspect-square relative group">
                        <img
                          src={template.image}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-white text-sm font-semibold truncate">
                              {template.name}
                            </p>
                          </div>
                        </div>
                        {selectedTemplate?.id === template.id && (
                          <div className="absolute top-2 right-2 bg-pink-500 rounded-full p-1">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                      ))
                    )}
                  </div>
                )}
                
                {/* Template Count and Load More Section */}
                {!templatesLoading && totalTemplatesCount > 0 && (
                  <div className="text-center mt-6 space-y-4">
                    {/* Progress Bar */}
                    <div className="max-w-md mx-auto">
                      <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div 
                          className="bg-gradient-to-r from-pink-500 to-cyan-500 h-2 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${Math.min(100, (filteredTemplates.length / totalTemplatesCount) * 100)}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Count Display */}
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Showing <span className="font-bold text-pink-500">{filteredTemplates.length}</span> of{' '}
                      <span className="font-bold text-cyan-500">{totalTemplatesCount}</span> templates
                      {selectedCategory !== "All" && (
                        <span className="block mt-1 text-xs opacity-75">
                          in "{selectedCategory}" category
                        </span>
                      )}
                    </div>
                    
                    {/* Load More Button */}
                    {canLoadMore && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLoadMore}
                        className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg ${
                          isDarkMode
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:shadow-xl"
                            : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white hover:shadow-xl"
                        }`}
                      >
                        🚀 Load {Math.min(templatesPerPage, remainingTemplatesCount)} More Templates
                        <span className="block text-xs opacity-80 mt-1">
                          ({remainingTemplatesCount} remaining)
                        </span>
                      </motion.button>
                    )}
                    
                    {/* All Loaded Message */}
                    {!canLoadMore && totalTemplatesCount > templatesPerPage && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`inline-flex items-center px-6 py-3 rounded-full font-medium ${
                          isDarkMode
                            ? "bg-green-900/30 text-green-400 border border-green-700"
                            : "bg-green-100 text-green-700 border border-green-200"
                        }`}
                      >
                        ✅ All templates loaded!
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCurrentPage(1)}
                          className={`ml-3 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            isDarkMode
                              ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-600"
                          }`}
                        >
                          Reset to Top
                        </motion.button>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Customize Tab */}
            {activeTab === "customize" && (
              <motion.div
                key="customize"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {!selectedTemplate ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎨</div>
                    <h3 className="text-2xl font-bold gradient-text mb-4">
                      Ready to Customize?
                    </h3>
                    <p
                      className={`text-lg mb-6 transition-colors duration-300 ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      First, select a meme template from the Templates tab
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab("templates")}
                      className="bg-gradient-to-r from-pink-500 to-cyan-500 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300"
                    >
                      🖼️ Browse Templates
                    </motion.button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Text Inputs */}
                    <div className="space-y-6">
                      <div
                        className={`glass p-6 rounded-2xl transition-all duration-500 ${
                          isDarkMode
                            ? ""
                            : "bg-white/90 shadow-lg border border-gray-100"
                        }`}
                      >
                        <h3 className="text-xl font-bold mb-4 gradient-text transition-all duration-300">
                          Text Content
                        </h3>

                        <div className="space-y-4">
                          {textFields.map((field) => (
                            <div key={field.id}>
                              <label className="block text-sm font-semibold mb-2">
                                {field.placeholder}
                              </label>
                              <textarea
                                value={field.text}
                                onChange={(e) => updateTextField(field.id, e.target.value)}
                                placeholder={`Enter ${field.placeholder.toLowerCase()}...`}
                                className={`w-full p-4 rounded-xl border-2 resize-none transition-all duration-500 ease-in-out focus:scale-[1.02] ${
                                  isDarkMode
                                    ? "bg-gray-800/50 border-gray-600 focus:border-pink-500 text-white placeholder-gray-400 backdrop-blur-sm"
                                    : "bg-white/90 border-gray-300 focus:border-pink-500 text-gray-900 placeholder-gray-500 shadow-sm focus:shadow-md"
                                }`}
                                rows="2"
                              />
                            </div>
                          ))}
                          
                          {textFields.length === 0 && (
                            <div className="text-center py-8">
                              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Select a template first to see text options
                              </p>
                            </div>
                          )}

                          {/* AI Suggestion Button */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={getSuggestion}
                            className={`w-full py-3 font-semibold rounded-xl transition-all duration-500 ease-in-out shadow-lg hover:shadow-xl ${
                              isDarkMode
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                                : "bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white hover:shadow-purple-200"
                            }`}
                          >
                            🤖 AI Suggestion
                          </motion.button>
                        </div>
                      </div>

                      {/* Text Styling */}
                      <div
                        className={`glass p-6 rounded-2xl transition-all duration-500 ${
                          isDarkMode
                            ? ""
                            : "bg-white/90 shadow-lg border border-gray-100"
                        }`}
                      >
                        <h3 className="text-xl font-bold mb-4 gradient-text transition-all duration-300">
                          Styling
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold mb-2">
                              Text Color
                            </label>
                            <input
                              type="color"
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              className="w-full h-12 rounded-xl border-2 border-gray-300 cursor-pointer"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold mb-2">
                              Font Size
                            </label>
                            <select
                              value={fontSize}
                              onChange={(e) => setFontSize(e.target.value)}
                              className={`w-full p-3 rounded-xl border-2 transition-all duration-300 ${
                                isDarkMode
                                  ? "bg-gray-800 border-gray-600 text-white"
                                  : "bg-white border-gray-300 text-gray-900"
                              }`}
                            >
                              <option value="1.5rem">Small</option>
                              <option value="2rem">Medium</option>
                              <option value="2.5rem">Large</option>
                              <option value="3rem">XL</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Live Preview */}
                    <div
                      className={`glass p-6 rounded-2xl transition-all duration-500 ${
                        isDarkMode
                          ? ""
                          : "bg-white/90 shadow-lg border border-gray-100"
                      }`}
                    >
                      <h3 className="text-xl font-bold mb-4 gradient-text transition-all duration-300">
                        Live Preview
                      </h3>
                      <div
                        className={`relative rounded-xl overflow-hidden transition-all duration-500 ${
                          isDarkMode
                            ? "bg-gray-800/30"
                            : "bg-gray-50 shadow-inner"
                        }`}
                      >
                        <img
                          src={selectedTemplate.image}
                          alt={selectedTemplate.name}
                          className="w-full h-auto"
                        />
                        {textFields.map((field, index) => {
                          if (!field.text) return null;
                          
                          // Position text based on field index
                          const isTop = index === 0;
                          const isBottom = index === textFields.length - 1 && textFields.length > 1;
                          const isMiddle = !isTop && !isBottom;
                          
                          let positionClass = "absolute left-1/2 transform -translate-x-1/2 text-center px-2 max-w-full";
                          
                          if (isTop) {
                            positionClass += " top-4";
                          } else if (isBottom) {
                            positionClass += " bottom-4";
                          } else if (isMiddle) {
                            // Position middle text(s) evenly between top and bottom
                            const middlePosition = 20 + (index * 30);
                            positionClass += ` top-[${middlePosition}%]`;
                          }
                          
                          return (
                            <div
                              key={field.id}
                              className={positionClass}
                              style={getTextStyle()}
                            >
                              {field.text.toUpperCase()}
                            </div>
                          );
                        })}
                        
                        {/* Fallback for backward compatibility */}
                        {textFields.length === 0 && topText && (
                          <div
                            className="absolute top-4 left-1/2 transform -translate-x-1/2 text-center px-2 max-w-full"
                            style={getTextStyle()}
                          >
                            {topText.toUpperCase()}
                          </div>
                        )}
                        {textFields.length === 0 && bottomText && (
                          <div
                            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center px-2 max-w-full"
                            style={getTextStyle()}
                          >
                            {bottomText.toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Effects Tab */}
            {activeTab === "effects" && (
              <motion.div
                key="effects"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`glass p-6 rounded-2xl max-w-2xl mx-auto transition-all duration-500 ${
                    isDarkMode
                      ? ""
                      : "bg-white/90 shadow-lg border border-gray-100"
                  }`}
                >
                  <h3 className="text-xl font-bold mb-6 gradient-text text-center transition-all duration-300">
                    Text Effects
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {textEffects.map((effect) => (
                      <motion.button
                        key={effect.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setTextEffect(effect.id)}
                        className={`p-4 rounded-xl font-bold text-center transition-all duration-500 ease-in-out transform hover:scale-105 ${
                          textEffect === effect.id
                            ? "bg-gradient-to-r from-pink-500 to-cyan-500 text-white shadow-lg scale-105"
                            : isDarkMode
                            ? "glass-dark text-gray-300 hover:text-white hover:shadow-md"
                            : "bg-white/80 text-gray-600 hover:text-gray-900 hover:bg-white shadow-sm hover:shadow-md border border-gray-200"
                        }`}
                        style={{
                          textShadow:
                            textEffect === effect.id ? "none" : effect.style,
                        }}
                      >
                        {effect.name}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        }
        {/* Generate Button */}
        {selectedTemplate && (topText || bottomText) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-8"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerateMeme}
              disabled={isGenerating}
              className={`px-12 py-4 rounded-full font-bold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 ease-in-out transform ${
                isDarkMode
                  ? "bg-gradient-to-r from-pink-500 to-cyan-500 text-white hover:from-pink-600 hover:to-cyan-600 hover:shadow-pink-500/25"
                  : "bg-gradient-to-r from-pink-400 to-cyan-400 text-white hover:from-pink-500 hover:to-cyan-500 hover:shadow-lg hover:shadow-pink-200/50"
              }`}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Creating Magic...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  ✨ Generate Meme
                </span>
              )}
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && generatedMeme && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-500"
            style={{
              backgroundColor: isDarkMode
                ? "rgba(0,0,0,0.8)"
                : "rgba(0,0,0,0.6)",
            }}
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                duration: 0.4,
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className={`p-6 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto transition-all duration-500 ${
                isDarkMode
                  ? "glass"
                  : "bg-white/95 shadow-2xl border border-gray-100"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold gradient-text">
                  Your Meme is Fire! 🔥
                </h3>
                <p
                  className={`${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Ready to break the internet?
                </p>
              </div>

              <div
                ref={memeRef}
                className="relative bg-white rounded-xl overflow-hidden mb-6"
              >
                <img
                  src={generatedMeme.template_image}
                  alt={generatedMeme.template_name}
                  className="w-full h-auto"
                />
                {generatedMeme.text_fields?.map((field, index) => {
                  if (!field.text) return null;
                  
                  // Position text based on field index
                  const isTop = index === 0;
                  const isBottom = index === generatedMeme.text_fields.length - 1 && generatedMeme.text_fields.length > 1;
                  const isMiddle = !isTop && !isBottom;
                  
                  let positionClass = "absolute left-1/2 transform -translate-x-1/2 text-center px-2 max-w-full";
                  
                  if (isTop) {
                    positionClass += " top-4";
                  } else if (isBottom) {
                    positionClass += " bottom-4";
                  } else if (isMiddle) {
                    // Position middle text(s) evenly between top and bottom
                    const middlePosition = 20 + (index * 30);
                    positionClass += ` top-[${middlePosition}%]`;
                  }
                  
                  return (
                    <div
                      key={field.id}
                      className={positionClass}
                      style={{
                        color: generatedMeme.text_color,
                        fontSize: generatedMeme.font_size,
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        textShadow: textEffects.find(
                          (e) => e.id === generatedMeme.text_effect
                        )?.style,
                      }}
                    >
                      {field.text.toUpperCase()}
                    </div>
                  );
                })}
                
                {/* Fallback for backward compatibility */}
                {(!generatedMeme.text_fields || generatedMeme.text_fields.length === 0) && generatedMeme.top_text && (
                  <div
                    className="absolute top-4 left-1/2 transform -translate-x-1/2 text-center px-2 max-w-full"
                    style={{
                      color: generatedMeme.text_color,
                      fontSize: generatedMeme.font_size,
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      textShadow: textEffects.find(
                        (e) => e.id === generatedMeme.text_effect
                      )?.style,
                    }}
                  >
                    {generatedMeme.top_text.toUpperCase()}
                  </div>
                )}
                {(!generatedMeme.text_fields || generatedMeme.text_fields.length === 0) && generatedMeme.bottom_text && (
                  <div
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center px-2 max-w-full"
                    style={{
                      color: generatedMeme.text_color,
                      fontSize: generatedMeme.font_size,
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      textShadow: textEffects.find(
                        (e) => e.id === generatedMeme.text_effect
                      )?.style,
                    }}
                  >
                    {generatedMeme.bottom_text.toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownloadMeme}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-colors duration-300"
                >
                  📥 Download
                </motion.button>

                {user && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveMeme}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-colors duration-300"
                  >
                    💾 Save to Gallery
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPreview(false)}
                  className={`px-6 py-3 rounded-full font-semibold transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                  }`}
                >
                  ✨ Create Another
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Quick Actions */}
      {selectedTemplate && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setActiveTab("customize")}
            className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-xl flex items-center justify-center text-xl"
            title="Customize"
          >
            ✏️
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleGenerateMeme}
            disabled={!topText && !bottomText}
            className="w-14 h-14 bg-gradient-to-r from-pink-500 to-cyan-500 text-white rounded-full shadow-xl flex items-center justify-center text-xl disabled:opacity-50"
            title="Generate"
          >
            ⚡
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default Generator;
