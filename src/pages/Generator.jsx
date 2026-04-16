import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useMemes } from "../hooks/useMemes";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import AIMemeEditor from "../components/AIMemeEditor";
import firebaseAIService from "../services/firebaseAI";
import magicHourAPI from "../services/magicHourAPI";

const Generator = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const { templates, templatesLoading, createMeme } = useMemes(user);
  const memeRef = useRef(null);

  // State
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [textFields, setTextFields] = useState([]);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [fontSize, setFontSize] = useState("2rem");
  const [textEffect, setTextEffect] = useState("shadow");
  const [fontFamily, setFontFamily] = useState("Impact");
  const [textAlign, setTextAlign] = useState("center");
  const [textPosition, setTextPosition] = useState({ x: 50, y: 10 });
  const [bottomTextPosition, setBottomTextPosition] = useState({
    x: 50,
    y: 90,
  });
  const [selectedTextElement, setSelectedTextElement] = useState("top");
  const [generatedMeme, setGeneratedMeme] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("templates");
  const [templatesPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAIEditor, setShowAIEditor] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiConcept, setAiConcept] = useState("");
  const [isGeneratingFromConcept, setIsGeneratingFromConcept] = useState(false);

  // Magic Hour AI states
  const [isGeneratingMagicHour, setIsGeneratingMagicHour] = useState(false);
  const [magicHourTemplate, setMagicHourTemplate] = useState("Random");
  const [generatedAIMeme, setGeneratedAIMeme] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const categories = [
    "All",
    "Popular",
    "Trending",
    "Classic",
    "Gaming",
    "Reaction",
  ];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fontFamilies = [
    {
      id: "Impact",
      name: "Impact (Classic)",
      font: "Impact, 'Arial Black', sans-serif",
    },
    {
      id: "Arial",
      name: "Arial Bold",
      font: "'Arial Black', Arial, sans-serif",
    },
    { id: "Comic", name: "Comic Sans", font: "'Comic Sans MS', cursive" },
    { id: "Times", name: "Times New Roman", font: "'Times New Roman', serif" },
    {
      id: "Helvetica",
      name: "Helvetica",
      font: "Helvetica, Arial, sans-serif",
    },
  ];

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

  const allFilteredTemplates =
    selectedCategory === "All"
      ? templates || []
      : (templates || []).filter((t) => t.category === selectedCategory);

  // Progressive loading - show templates in chunks
  const totalToShow = currentPage * templatesPerPage;
  const filteredTemplates = allFilteredTemplates.slice(0, totalToShow);

  const totalTemplatesCount = allFilteredTemplates.length || 0;
  const remainingTemplatesCount = Math.max(
    0,
    totalTemplatesCount - totalToShow
  );
  const canLoadMore = remainingTemplatesCount > 0;

  const handleTemplateSelect = (template) => {
    try {
      setSelectedTemplate(template);
      // Initialize text fields based on box_count
      const boxCount = template?.box_count || 2;
      const initialTextFields = Array.from(
        { length: boxCount },
        (_, index) => ({
          id: index,
          text: "",
          placeholder: `Text ${index + 1}${
            index === 0 ? " (Top)" : index === boxCount - 1 ? " (Bottom)" : ""
          }`,
        })
      );
      setTextFields(initialTextFields);

      // Keep backward compatibility with existing topText/bottomText
      if (boxCount >= 1) setTopText("");
      if (boxCount >= 2) setBottomText("");
    } catch (error) {
      toast.error("Failed to select template");
    }
  };

  const updateTextField = (id, text) => {
    setTextFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, text } : field))
    );

    if (id === 0) setTopText(text);
    if (id === 1) setBottomText(text);
  };

  // Load more templates
  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);

    setTimeout(() => {
      const newTemplateIndex = (currentPage - 1) * templatesPerPage;
      const templateElements = document.querySelectorAll(
        "[data-template-index]"
      );
      if (templateElements[newTemplateIndex]) {
        templateElements[newTemplateIndex].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  };

  // Reset pagination when changing categories
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); 
  };

  // Generate from AI concept
  const generateFromConcept = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a template first! 😅");
      return;
    }
    if (!aiConcept.trim()) {
      toast.error("Please describe your meme concept! 💭");
      return;
    }

    setIsGeneratingFromConcept(true);
    try {
      toast("Creating your meme with smart patterns... 🧠", { icon: "✨" });

      const result = await firebaseAIService.generateCompleteMeme(
        selectedTemplate.name,
        aiConcept
      );

      if (result && result.topText) setTopText(result.topText);
      if (result && result.bottomText) setBottomText(result.bottomText);

      toast.success("Smart meme generated! 🎨✨");

      if (result && (result.topText || result.bottomText)) {
        setTimeout(() => {
          handleGenerateMeme();
        }, 1000);
      }
    } catch (error) {
      toast.error("AI failed, but you can still create manually! 😅");
    } finally {
      setIsGeneratingFromConcept(false);
    }
  };

  // Generate complete AI meme using Magic Hour API
  const generateMagicHourMeme = async (isRetry = false) => {
    if (!aiConcept.trim()) {
      toast.error("Please describe your meme concept! 💭");
      return;
    }

    // Validate concept
    const validation = magicHourAPI.validateConcept(aiConcept);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    if (!magicHourAPI.isConfigured()) {
      toast.error(
        "AI service not configured. Please check your environment variables."
      );
      return;
    }

    // Update retry count
    if (!isRetry) {
      setRetryCount(0);
    }

    setIsGeneratingMagicHour(true);
    setGeneratedAIMeme(null);

    try {
      toast.loading("🚀 Starting AI meme generation...", { id: "magic-hour" });

      // Get suggested template if random is selected
      let templateToUse = magicHourTemplate;
      if (templateToUse === "Random") {
        templateToUse = magicHourAPI.getSuggestedTemplate(aiConcept);
        toast.loading(`🎯 AI selected "${templateToUse}" template...`, {
          id: "magic-hour",
        });
      }

      // Show different loading messages
      setTimeout(() => {
        if (isGeneratingMagicHour) {
          toast.loading("🎨 AI is creating your meme...", { id: "magic-hour" });
        }
      }, 5000);

      setTimeout(() => {
        if (isGeneratingMagicHour) {
          toast.loading("⏳ Almost done, adding finishing touches...", {
            id: "magic-hour",
          });
        }
      }, 15000);

      // Generate the meme
      const result = await magicHourAPI.generateMemeComplete(
        aiConcept,
        templateToUse,
        {
          searchWeb: false, // Can be made configurable
          name: `Memefy AI - ${aiConcept.substring(0, 30)}`,
        }
      );

      // Success!
      const aiMemeData = {
        imageUrl: result.imageUrl,
        concept: aiConcept,
        template: templateToUse,
        id: result.id,
        credits_charged: result.credits_charged,
        timestamp: new Date().toISOString(),
      };

      setGeneratedAIMeme(aiMemeData);

      // Save AI meme to user's collection
      if (user) {
        try {
          const memeForSaving = {
            template_id: `magic-hour-${templateToUse
              .toLowerCase()
              .replace(/\s+/g, "-")}`,
            template_name: `AI Generated - ${templateToUse}`,
            template_image: result.imageUrl,
            top_text: `AI Concept: ${aiConcept}`,
            bottom_text: `Generated with Magic Hour AI`,
            text_color: "#FFFFFF",
            font_size: "2rem",
            font_family: "Impact",
            text_effect: "shadow",
            text_align: "center",
            image_url: result.imageUrl,
            isLocalImage: false,
            isAIGenerated: true,
            ai_concept: aiConcept,
            ai_template: templateToUse,
            magic_hour_id: result.id,
            credits_used: result.credits_charged,
          };

          const savedMeme = await createMeme(memeForSaving);
        } catch (saveError) {}
      }

      toast.success(`🎉 AI meme created and saved!`, { id: "magic-hour" });
    } catch (error) {
      // Provide more helpful error messages
      let errorMessage = error.message;
      let showFallback = false;

      if (error.message.includes("timeout")) {
        errorMessage = "Generation took too long. AI servers might be busy.";
        showFallback = true;
      } else if (error.message.includes("credits")) {
        errorMessage = "AI service unavailable. Please try again later.";
      } else if (error.message.includes("400")) {
        errorMessage =
          "Invalid request. Please try a different concept or template.";
      } else if (
        error.message.includes("unauthorized") ||
        error.message.includes("401")
      ) {
        errorMessage =
          "API key issue. Please check your Magic Hour API key configuration.";
      }

      if (showFallback && retryCount < 2) {
        toast.error(`⏰ ${errorMessage}`, {
          id: "magic-hour",
          duration: 6000,
          action: {
            label: `Retry (${retryCount + 1}/2)`,
            onClick: () => {
              setRetryCount((prev) => prev + 1);
              generateMagicHourMeme(true);
            },
          },
        });
      } else if (showFallback) {
        toast.error(`⏰ ${errorMessage} Try manual templates instead!`, {
          id: "magic-hour",
          duration: 6000,
          action: {
            label: "Templates",
            onClick: () => setActiveTab("templates"),
          },
        });
      } else {
        toast.error(`❌ ${errorMessage}`, { id: "magic-hour" });
      }
    } finally {
      setIsGeneratingMagicHour(false);
    }
  };

  // Test Firebase AI connection
  const testFirebaseAI = async () => {
    setIsGeneratingAI(true);
    try {
      const result = await firebaseAIService.testConnection();
      toast.success(`Firebase AI Connected! ${result}`);
    } catch (error) {
      toast.error(`Firebase AI test failed: ${error?.message || error}`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // AI-powered functions
  const generateAISuggestion = async () => {
    if (!selectedTemplate) {
      toast.error("Select a template first");
      return;
    }

    if (!firebaseAIService.isAvailable()) {
      toast.error("AI service unavailable");
      return;
    }

    setIsGeneratingAI(true);
    try {
      const suggestions = await firebaseAIService.analyzeMemeTemplate(
        selectedTemplate.image,
        selectedTemplate.name
      );

      // Apply first suggestion
      if (suggestions && suggestions.suggestion1) {
        updateTextField(0, suggestions.suggestion1.top || "");
        updateTextField(1, suggestions.suggestion1.bottom || "");
        toast.success("AI suggestion applied! 🤖✨");
      }
    } catch (error) {
      toast.error("Failed to generate AI suggestion");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const openAIEditor = () => {
    if (!selectedTemplate) {
      toast.error("Please select a template first");
      return;
    }
    setShowAIEditor(true);
  };

  const handleAIEditorSave = (memeData) => {
    try {
      const convertedMeme = {
        id: uuidv4(),
        template_id: memeData.template.id,
        template_name: memeData.template.name,
        template_image: memeData.template.image,
        image_url: memeData.imageUrl,
        text_elements: memeData.textElements,
        created_at: new Date().toISOString(),
        user_id: user?.id,
        views: 0,
        shares: 0,
      };

      setGeneratedMeme(convertedMeme);
      setShowAIEditor(false);
      setShowPreview(true);
      toast.success("AI-powered meme created! 🎨🤖");
    } catch (error) {
      toast.error("Failed to save AI meme");
    }
  };

  const handleGenerateMeme = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a template first! 😅");
      return;
    }

    const hasText =
      (textFields && textFields.some((field) => field.text?.trim() !== "")) ||
      topText.trim() !== "" ||
      bottomText.trim() !== "";
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
        // small delay to simulate generation
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      const memeData = {
        id: uuidv4(),
        template_id: selectedTemplate.id,
        template_name: selectedTemplate.name,
        template_image: selectedTemplate.image,
        font_family: fontFamily,
        text_align: textAlign,
        text_positions: {
          top: textPosition,
          bottom: bottomTextPosition,
        },
        top_text: topText,
        bottom_text: bottomText,
        text_fields: textFields,
        text_color: textColor,
        font_size: fontSize,
        text_effect: textEffect,
        createdAt: new Date().toISOString(),
        user_id: user?.id,
        views: 0,
        shares: 0,
      };

      setGeneratedMeme(memeData);
      setShowPreview(true);
      toast.success("Meme is ready to break the internet! 🔥");
    } catch (error) {
      toast.error("Oops! Meme machine broke 😭");
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

  // Robust text style generator: receives a position {x,y} and returns style object
  const getTextStyle = (position = { x: 50, y: 50 }, options = {}) => {
    const effect = textEffects.find(
      (e) => e.id === (options.textEffect || textEffect)
    );
    const selectedFont = fontFamilies.find(
      (f) => f.id === (options.fontFamily || fontFamily)
    );

    return {
      top: `${position.y}%`,
      left: `${position.x}%`,
      color: options.textColor || textColor,
      fontSize: options.fontSize || fontSize,
      fontFamily: selectedFont?.font || "Impact, Arial Black, sans-serif",
      textAlign: options.textAlign || textAlign,
      textShadow: effect?.style || "2px 2px 4px rgba(0,0,0,0.8)",
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
      className={`min-h-screen p-4 md:p-6 transition-all duration-500 ease-in-out ${
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
        />
        <div
          className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000 transition-all duration-700 ${
            isDarkMode
              ? "bg-gradient-to-r from-yellow-500/20 to-pink-500/20"
              : "bg-gradient-to-r from-orange-300/30 to-pink-300/30"
          }`}
        />
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse delay-500 transition-all duration-700 ${
            isDarkMode
              ? "bg-gradient-to-r from-cyan-500/10 to-purple-500/10"
              : "bg-gradient-to-r from-blue-200/40 to-purple-200/40"
          }`}
        />
      </div>

      {/* Header */}
      <motion.div
        className="text-center mb-6 md:mb-8 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          <span className="gradient-text transition-all duration-500">
            MEME
          </span>
          <span className="text-2xl md:text-3xl mx-2">🎨</span>
          <span className="gradient-text transition-all duration-500">
            FACTORY
          </span>
        </h1>
        <p
          className={`text-base md:text-lg transition-colors duration-300 ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Create viral content in seconds • No cap 📈
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center px-2">
          {["templates", "ai-generator", "customize", "effects"].map((tab) => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-0 sm:flex-none px-3 md:px-4 py-2 rounded-full font-semibold transition-all duration-300 text-xs sm:text-sm ${
                activeTab === tab
                  ? "bg-gradient-to-r from-pink-500 to-cyan-500 text-white shadow-lg scale-105"
                  : isDarkMode
                  ? "glass text-gray-300 hover:text-white hover:shadow-md"
                  : "bg-white/80 text-gray-700 hover:text-gray-900 hover:bg-white shadow-sm hover:shadow-md border border-gray-200"
              }`}
            >
              <span className="truncate">
                {tab === "ai-generator"
                  ? "AI Generator"
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === "templates" && " 🖼️"}
                {tab === "ai-generator" && " 🤖"}
                {tab === "customize" && " ✏️"}
                {tab === "effects" && " ✨"}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Templates Tab */}
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
              <div className="flex flex-wrap gap-3 mb-8 justify-center px-2">
                {categories.map((category) => {
                  const categoryCount =
                    category === "All"
                      ? (templates || []).length
                      : (templates || []).filter((t) => t.category === category)
                          .length;

                  return (
                    <motion.button
                      key={category}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCategoryChange(category)}
                      className={`px-3 md:px-4 py-2 rounded-full font-medium transition-all duration-500 ease-in-out transform hover:scale-105 text-sm md:text-base ${
                        selectedCategory === category
                          ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg scale-105"
                          : isDarkMode
                          ? "glass-dark text-gray-300 hover:text-white hover:shadow-md"
                          : "bg-white/80 text-gray-600 hover:text-gray-900 hover:bg-white shadow-sm hover:shadow-md border border-gray-200"
                      }`}
                    >
                      {category}{" "}
                      {categoryCount > 0 && (
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 mb-6">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      className={`aspect-square rounded-lg animate-pulse ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 mb-6">
                  {filteredTemplates.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <div className="text-6xl mb-4">😅</div>
                      <h3 className="text-xl font-bold mb-2">
                        No Templates Found
                      </h3>
                      <p
                        className={
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }
                      >
                        Try selecting a different category or check your
                        internet connection
                      </p>
                    </div>
                  ) : (
                    filteredTemplates.map((template, index) => (
                      <motion.div
                        key={template?.id || index}
                        data-template-index={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 0.4,
                          delay: (index % templatesPerPage) * 0.05,
                        }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          handleTemplateSelect(template);
                          setActiveTab("customize");
                        }}
                        className={`cursor-pointer rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                          selectedTemplate?.id === template?.id
                            ? "ring-2 ring-pink-500 shadow-lg shadow-pink-500/25 scale-105"
                            : isDarkMode
                            ? "glass hover:shadow-lg hover:shadow-white/10"
                            : "bg-white/90 hover:bg-white shadow-md hover:shadow-lg hover:shadow-gray-200/50 border border-gray-100"
                        }`}
                      >
                        <div className="aspect-square relative group">
                          <img
                            src={template?.image}
                            alt={template?.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-2 left-2 right-2">
                              <p className="text-white text-sm font-semibold truncate">
                                {template?.name}
                              </p>
                            </div>
                          </div>
                          {selectedTemplate?.id === template?.id && (
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
                    <div
                      className={`w-full rounded-full h-2 ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    >
                      <div
                        className="bg-gradient-to-r from-pink-500 to-cyan-500 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.min(
                            100,
                            (filteredTemplates.length / totalTemplatesCount) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Count Display */}
                  <div
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Showing{" "}
                    <span className="font-bold text-pink-500">
                      {filteredTemplates.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-cyan-500">
                      {totalTemplatesCount}
                    </span>{" "}
                    templates
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
                      🚀 Load{" "}
                      {Math.min(templatesPerPage, remainingTemplatesCount)} More
                      Templates
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

          {/* AI Generator Tab */}
          {activeTab === "ai-generator" && (
            <motion.div
              key="ai-generator"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h3
                  className={`text-2xl font-bold mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  AI Meme Generator 🤖
                </h3>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  } mb-6`}
                >
                  Describe your meme concept and let AI create a complete meme
                  for you!
                </p>
              </div>

              {/* AI Status */}
              {!magicHourAPI.isConfigured() && (
                <div
                  className={`p-4 rounded-xl ${
                    isDarkMode ? "bg-gray-800/50" : "bg-gray-50"
                  } border-l-4 border-yellow-500`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span
                      className={`font-semibold ${
                        isDarkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      AI Generator Status
                    </span>
                  </div>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    ⚠️ AI service not configured. Please check environment
                    configuration.
                  </p>
                </div>
              )}

              {/* Concept Input */}
              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Meme Concept 💭
                  </label>
                  <textarea
                    value={aiConcept}
                    onChange={(e) => setAiConcept(e.target.value)}
                    placeholder="Describe your meme idea... (e.g., 'When you finally understand a complex concept', 'Trying to explain crypto to your parents')"
                    className={`w-full p-4 rounded-xl border resize-none transition-all duration-300 ${
                      isDarkMode
                        ? "bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-pink-400"
                    } focus:ring-2 focus:ring-opacity-50 ${
                      isDarkMode ? "focus:ring-cyan-400" : "focus:ring-pink-400"
                    }`}
                    rows={3}
                    maxLength={200}
                  />
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    } mt-1`}
                  >
                    {aiConcept.length}/200 characters
                  </p>
                </div>

                {/* Template Selection */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Template Preference 🎭
                  </label>

                  {/* Quick Template Filter */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {["All", "Popular", "Classic"].map((category) => (
                      <button
                        key={category}
                        className={`px-3 py-1 text-xs rounded-full transition-all duration-300 ${
                          isDarkMode
                            ? "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                        } border ${
                          isDarkMode ? "border-gray-600" : "border-gray-200"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  {/* Visual Template Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {/* Random Option */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setMagicHourTemplate("Random")}
                      className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                        magicHourTemplate === "Random"
                          ? "border-purple-500 bg-gradient-to-r from-purple-500/10 to-pink-500/10"
                          : isDarkMode
                          ? "border-gray-600 bg-gray-800/50 hover:border-gray-500"
                          : "border-gray-300 bg-gray-50 hover:border-gray-400"
                      }`}
                    >
                      <div
                        className={`w-full aspect-square rounded-lg flex items-center justify-center text-2xl ${
                          isDarkMode ? "bg-gray-700/50" : "bg-gray-200"
                        }`}
                      >
                        🎲
                      </div>
                      <p
                        className={`text-xs text-center mt-2 font-medium ${
                          magicHourTemplate === "Random"
                            ? "text-purple-500"
                            : isDarkMode
                            ? "text-gray-300"
                            : "text-gray-700"
                        }`}
                      >
                        Random
                      </p>
                      <p
                        className={`text-xs text-center ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        AI Choice
                      </p>
                    </motion.div>

                    {/* Template Options */}
                    {(() => {
                      // Helper function to find matching template image from Imgflip templates
                      const findMatchingTemplate = (magicHourTemplateName) => {
                        if (!templates || templates.length === 0) {
                          return null; // Will use emoji fallback
                        }

                        // Map Magic Hour template names to Imgflip template search terms
                        const nameMapping = {
                          "Drake Hotline Bling": [
                            "drake",
                            "hotline",
                            "pointing",
                          ],
                          "Galaxy Brain": ["galaxy", "brain", "expanding"],
                          "Two Buttons": [
                            "two buttons",
                            "button",
                            "choice",
                            "daily struggle",
                          ],
                          "Gru's Plan": ["gru", "plan", "despicable"],
                          "Tuxedo Winnie The Pooh": [
                            "winnie",
                            "pooh",
                            "tuxedo",
                            "fancy",
                          ],
                          "Is This a Pigeon": [
                            "pigeon",
                            "butterfly",
                            "is this",
                          ],
                          "Panik Kalm Panik": [
                            "panik",
                            "kalm",
                            "stonks",
                            "meme man",
                          ],
                          "Disappointed Guy": [
                            "disappointed",
                            "unsatisfied",
                            "displeased",
                          ],
                          "Waiting Skeleton": [
                            "waiting",
                            "skeleton",
                            "still waiting",
                          ],
                          "Bike Fall": ["bike", "fall", "stick", "blame"],
                          "Change My Mind": [
                            "change my mind",
                            "crowder",
                            "steven",
                          ],
                          "Side Eyeing Chloe": [
                            "side eye",
                            "chloe",
                            "suspicious",
                          ],
                        };

                        const searchTerms = nameMapping[
                          magicHourTemplateName
                        ] || [magicHourTemplateName.toLowerCase()];

                        // Try to find matching template from Imgflip
                        const foundTemplate = templates.find((template) =>
                          searchTerms.some((term) =>
                            template.name
                              .toLowerCase()
                              .includes(term.toLowerCase())
                          )
                        );

                        return foundTemplate;
                      };

                      return magicHourAPI
                        .getAvailableTemplates()
                        .filter((template) => template.id !== "Random")
                        .map((magicTemplate) => {
                          const matchingTemplate = findMatchingTemplate(
                            magicTemplate.id
                          );

                          return (
                            <motion.div
                              key={magicTemplate.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() =>
                                setMagicHourTemplate(magicTemplate.id)
                              }
                              className={`relative p-2 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                                magicHourTemplate === magicTemplate.id
                                  ? "border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/20"
                                  : isDarkMode
                                  ? "border-gray-600 bg-gray-800/50 hover:border-gray-500"
                                  : "border-gray-300 bg-gray-50 hover:border-gray-400"
                              }`}
                            >
                              {/* Template Image */}
                              <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                                {matchingTemplate ? (
                                  <img
                                    src={matchingTemplate.image}
                                    alt={magicTemplate.name}
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    loading="lazy"
                                    onError={(e) => {
                                      // Fallback to placeholder icon if image fails to load
                                      e.target.style.display = "none";
                                      e.target.nextSibling.style.display =
                                        "flex";
                                    }}
                                  />
                                ) : null}

                                {/* Fallback placeholder */}
                                <div
                                  className="w-full h-full flex items-center justify-center text-2xl"
                                  style={{
                                    display: matchingTemplate ? "none" : "flex",
                                  }}
                                >
                                  {magicTemplate.id === "Drake Hotline Bling"
                                    ? "👈"
                                    : magicTemplate.id === "Galaxy Brain"
                                    ? "🧠"
                                    : magicTemplate.id === "Two Buttons"
                                    ? "🔴"
                                    : magicTemplate.id === "Gru's Plan"
                                    ? "📋"
                                    : magicTemplate.id ===
                                      "tuxedo-winnie-the-pooh"
                                    ? "�"
                                    : magicTemplate.id === "is-this-a-pigeon"
                                    ? "🦋"
                                    : magicTemplate.id === "panik-kalm-panik"
                                    ? "😰"
                                    : "🖼️"}
                                </div>
                              </div>

                              {/* Template Name */}
                              <p
                                className={`text-xs text-center mt-2 font-medium truncate ${
                                  magicHourTemplate === magicTemplate.id
                                    ? "text-purple-500"
                                    : isDarkMode
                                    ? "text-gray-300"
                                    : "text-gray-700"
                                }`}
                              >
                                {magicTemplate.name}
                              </p>

                              {/* Selected Indicator */}
                              {magicHourTemplate === magicTemplate.id && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                                >
                                  <span className="text-white text-xs">✓</span>
                                </motion.div>
                              )}
                            </motion.div>
                          );
                        });
                    })()}
                  </div>

                  {/* Selected Template Info */}
                  {magicHourTemplate !== "Random" && (
                    <div
                      className={`mt-3 p-3 rounded-lg ${
                        isDarkMode ? "bg-gray-800/30" : "bg-gray-100/50"
                      }`}
                    >
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        <strong>Selected:</strong>{" "}
                        {
                          magicHourAPI
                            .getAvailableTemplates()
                            .find((t) => t.id === magicHourTemplate)?.name
                        }
                      </p>
                      <p
                        className={`text-xs ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {
                          magicHourAPI
                            .getAvailableTemplates()
                            .find((t) => t.id === magicHourTemplate)
                            ?.description
                        }
                      </p>
                    </div>
                  )}
                </div>

                {/* Example Concepts */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Need Inspiration? 💡
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {magicHourAPI
                      .getExampleConcepts()
                      .slice(0, 4)
                      .map((example, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setAiConcept(example)}
                          className={`px-3 py-1 text-xs rounded-full transition-all duration-300 ${
                            isDarkMode
                              ? "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                          } border ${
                            isDarkMode ? "border-gray-600" : "border-gray-200"
                          }`}
                        >
                          {example.length > 40
                            ? example.substring(0, 40) + "..."
                            : example}
                        </motion.button>
                      ))}
                  </div>
                </div>

                {/* Generate Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generateMagicHourMeme}
                  disabled={
                    isGeneratingMagicHour ||
                    !aiConcept.trim() ||
                    !magicHourAPI.isConfigured()
                  }
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                    isGeneratingMagicHour ||
                    !aiConcept.trim() ||
                    !magicHourAPI.isConfigured()
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {isGeneratingMagicHour ? (
                    <div className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Creating AI Meme...
                    </div>
                  ) : (
                    <>🤖 Generate AI Meme</>
                  )}
                </motion.button>
              </div>

              {/* Generated AI Meme Preview */}
              {generatedAIMeme && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-xl ${
                    isDarkMode ? "bg-gray-800/50" : "bg-gray-50"
                  } border-2 border-green-500/30`}
                >
                  <div className="text-center space-y-4">
                    <h4
                      className={`text-xl font-bold ${
                        isDarkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      🎉 Your AI Meme is Ready!
                    </h4>

                    <div className="max-w-md mx-auto">
                      <img
                        src={generatedAIMeme.imageUrl}
                        alt="Generated AI Meme"
                        className="w-full rounded-xl shadow-lg"
                        onLoad={() => {}}
                        onError={() =>
                          toast.error("Failed to load AI meme image")
                        }
                      />
                    </div>

                    <div
                      className={`text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      } space-y-1`}
                    >
                      <p>
                        <strong>Concept:</strong> {generatedAIMeme.concept}
                      </p>
                      <p>
                        <strong>Template:</strong> {generatedAIMeme.template}
                      </p>
                    </div>

                    <div className="flex gap-2 justify-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = generatedAIMeme.imageUrl;
                          link.download = `ai-meme-${Date.now()}.jpg`;
                          link.click();
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                      >
                        📥 Download
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setAiConcept("");
                          setGeneratedAIMeme(null);
                        }}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                          isDarkMode
                            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        🔄 Create Another
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
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
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🎨</div>
                  <h3 className="text-xl font-bold gradient-text mb-3">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* Text Controls Section */}
                  <div className="space-y-4 order-2 md:order-1">
                    <div
                      className={`glass p-2 lg:p-3 rounded-lg transition-all duration-300 ${
                        isDarkMode
                          ? ""
                          : "bg-white/90 shadow-lg border border-gray-100"
                      }`}
                    >
                      <h3 className="text-base font-bold mb-2 gradient-text transition-all duration-300">
                        Text Content
                      </h3>

                      <div className="space-y-2">
                        {textFields.map((field) => (
                          <div key={field.id}>
                            <label className="block text-xs font-semibold mb-1">
                              {field.placeholder}
                            </label>
                            <textarea
                              value={field.text}
                              onChange={(e) =>
                                updateTextField(field.id, e.target.value)
                              }
                              placeholder={`Enter ${field.placeholder.toLowerCase()}...`}
                              className={`w-full p-2 rounded-md border-2 resize-none transition-all duration-300 focus:scale-[1.01] ${
                                isDarkMode
                                  ? "bg-gray-800/50 border-gray-600 focus:border-pink-500 text-white placeholder-gray-400 backdrop-blur-sm"
                                  : "bg-white/90 border-gray-300 focus:border-pink-500 text-gray-900 placeholder-gray-500 shadow-sm focus:shadow-md"
                              }`}
                              rows={2}
                            />
                          </div>
                        ))}

                        {textFields.length === 0 && (
                          <div className="text-center py-6">
                            <p
                              className={`text-base ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              Select a template first to see text options
                            </p>
                          </div>
                        )}

                        {/* AI Features */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={testFirebaseAI}
                          disabled={isGeneratingAI}
                          className={`w-full mb-3 py-2 px-4 font-medium rounded-lg transition-all duration-300 ${
                            isDarkMode
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-green-500 hover:bg-green-600 text-white"
                          } disabled:opacity-50`}
                        >
                          {isGeneratingAI
                            ? "Testing..."
                            : "🧪 Test AI Connection"}
                        </motion.button>

                        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={generateAISuggestion}
                            disabled={isGeneratingAI}
                            className={`py-2 text-sm font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg ${
                              isDarkMode
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                                : "bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white hover:shadow-purple-200"
                            } disabled:opacity-50`}
                          >
                            {isGeneratingAI ? "🤖..." : "🤖 AI Text"}
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={openAIEditor}
                            className={`py-2 text-sm font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg ${
                              isDarkMode
                                ? "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                                : "bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white hover:shadow-blue-200"
                            }`}
                          >
                            🎨 AI Editor
                          </motion.button>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={getSuggestion}
                          className={`w-full py-1.5 text-sm font-medium rounded-md transition-all duration-300 ${
                            isDarkMode
                              ? "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800"
                          }`}
                        >
                          🎲 Random Suggestion
                        </motion.button>
                      </div>
                    </div>

                    {/* AI Concept Generator */}
                    <div
                      className={`glass p-3 rounded-lg transition-all duration-300 mb-3 ${
                        isDarkMode
                          ? ""
                          : "bg-white/90 shadow-lg border border-gray-100"
                      }`}
                    >
                      <h3 className="text-base font-bold mb-2 gradient-text transition-all duration-300">
                        🤖 AI Meme Generator
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs font-semibold mb-1">
                            Describe your meme concept
                          </label>
                          <textarea
                            value={aiConcept}
                            onChange={(e) => setAiConcept(e.target.value)}
                            placeholder="e.g., When you're trying to explain a complex problem to your friend..."
                            className={`w-full p-2 rounded-md border-2 transition-all duration-300 h-16 resize-none text-sm ${
                              isDarkMode
                                ? "bg-gray-800 border-gray-600 text-white"
                                : "bg-white border-gray-300 text-gray-900"
                            }`}
                          />
                        </div>
                        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={async () => {
                              if (!aiConcept.trim()) {
                                toast.error(
                                  "Please describe your concept first! 💭"
                                );
                                return;
                              }
                              try {
                                const suggestion =
                                  await firebaseAIService.generateMemeTemplate(
                                    aiConcept
                                  );
                                toast.success(
                                  `AI suggests: ${
                                    suggestion?.template || "unknown"
                                  }! ${suggestion?.reason || ""}`,
                                  {
                                    duration: 5000,
                                  }
                                );
                              } catch (error) {
                                toast.error(
                                  "Failed to get template suggestion 😅"
                                );
                              }
                            }}
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm"
                          >
                            🎯 Get Template Suggestion
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={generateFromConcept}
                            disabled={
                              isGeneratingFromConcept || !selectedTemplate
                            }
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                          >
                            {isGeneratingFromConcept ? (
                              <>
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                Creating...
                              </>
                            ) : (
                              <>✨ Generate with AI</>
                            )}
                          </motion.button>
                        </div>

                        {/* AI Image Generation */}
                        <div className="mt-4 pt-4 border-t border-gray-600">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={async () => {
                              if (!aiConcept.trim()) {
                                toast.error(
                                  "Please describe your meme concept first! 💭"
                                );
                                return;
                              }

                              try {
                                toast("Testing AI image generation... 🎨", {
                                  icon: "⚡",
                                });
                                const testResult =
                                  await firebaseAIService.testImageGeneration();

                                if (testResult?.success) {
                                  toast.success(
                                    "AI Image generation is available! 🖼️✨"
                                  );
                                  toast(
                                    "Feature coming soon - generating custom meme images! 🚀",
                                    {
                                      duration: 4000,
                                      icon: "🎭",
                                    }
                                  );
                                } else {
                                  toast.error(
                                    `Image generation unavailable: ${
                                      testResult?.error || "Unknown"
                                    }`
                                  );
                                }
                              } catch (error) {
                                console.error(
                                  "Image generation test error:",
                                  error
                                );
                                toast.error(
                                  "Image generation test failed 🖼️❌"
                                );
                              }
                            }}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2"
                          >
                            🎨 Test AI Image (Coming Soon)
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Text Styling */}
                    <div
                      className={`glass p-3 lg:p-6 rounded-2xl transition-all duration-500 ${
                        isDarkMode
                          ? ""
                          : "bg-white/90 shadow-lg border border-gray-100"
                      }`}
                    >
                      <h3 className="text-base lg:text-xl font-bold mb-4 gradient-text transition-all duration-300">
                        🎨 Advanced Styling
                      </h3>

                      {/* Text Element Selector */}
                      <div className="mb-4">
                        <label className="block text-sm font-semibold mb-3">
                          Customize Text
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => setSelectedTextElement("top")}
                            className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                              selectedTextElement === "top"
                                ? "bg-gradient-to-r from-pink-500 to-cyan-500 text-white"
                                : "glass text-gray-300 hover:text-white"
                            }`}
                          >
                            Top Text
                          </button>
                          <button
                            onClick={() => setSelectedTextElement("bottom")}
                            className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                              selectedTextElement === "bottom"
                                ? "bg-gradient-to-r from-pink-500 to-cyan-500 text-white"
                                : "glass text-gray-300 hover:text-white"
                            }`}
                          >
                            Bottom Text
                          </button>
                        </div>
                      </div>

                      <div className="space-y-5">
                        {/* Font Family */}
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Font Family
                          </label>
                          <select
                            value={fontFamily}
                            onChange={(e) => setFontFamily(e.target.value)}
                            className={`w-full p-3 rounded-xl border-2 transition-all duration-300 ${
                              isDarkMode
                                ? "bg-gray-800 border-gray-600 text-white"
                                : "bg-white border-gray-300 text-gray-900"
                            }`}
                          >
                            {fontFamilies.map((font) => (
                              <option key={font.id} value={font.id}>
                                {font.name}
                              </option>
                            ))}
                          </select>
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
                            <option value="3.5rem">Huge</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Text Color
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              className="w-12 h-12 rounded-xl border-2 border-gray-300 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              className={`flex-1 p-3 rounded-xl border-2 transition-all duration-300 ${
                                isDarkMode
                                  ? "bg-gray-800 border-gray-600 text-white"
                                  : "bg-white border-gray-300 text-gray-900"
                              }`}
                              placeholder="#FFFFFF"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Text Alignment */}
                      <div className="mt-4">
                        <label className="block text-sm font-semibold mb-2">
                          Text Alignment
                        </label>
                        <select
                          value={textAlign}
                          onChange={(e) => setTextAlign(e.target.value)}
                          className={`w-full p-3 rounded-xl border-2 transition-all duration-300 ${
                            isDarkMode
                              ? "bg-gray-800 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          }`}
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>

                      {/* Text Position */}
                      <div className="bg-gray-800/30 p-4 rounded-xl mt-4">
                        <label className="block text-sm font-semibold mb-4">
                          {selectedTextElement === "top"
                            ? "Top Text"
                            : "Bottom Text"}{" "}
                          Position
                        </label>
                        <div className="space-y-6">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-medium text-gray-400">
                                Horizontal
                              </label>
                              <span className="text-xs text-gray-300 bg-gray-700 px-3 py-1 rounded-lg font-mono">
                                {selectedTextElement === "top"
                                  ? textPosition.x
                                  : bottomTextPosition.x}
                                %
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={
                                selectedTextElement === "top"
                                  ? textPosition.x
                                  : bottomTextPosition.x
                              }
                              onChange={(e) => {
                                const newX = parseInt(e.target.value, 10);
                                if (selectedTextElement === "top") {
                                  setTextPosition((prev) => ({
                                    ...prev,
                                    x: newX,
                                  }));
                                } else {
                                  setBottomTextPosition((prev) => ({
                                    ...prev,
                                    x: newX,
                                  }));
                                }
                              }}
                              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-medium text-gray-400">
                                Vertical
                              </label>
                              <span className="text-xs text-gray-300 bg-gray-700 px-3 py-1 rounded-lg font-mono">
                                {selectedTextElement === "top"
                                  ? textPosition.y
                                  : bottomTextPosition.y}
                                %
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={
                                selectedTextElement === "top"
                                  ? textPosition.y
                                  : bottomTextPosition.y
                              }
                              onChange={(e) => {
                                const newY = parseInt(e.target.value, 10);
                                if (selectedTextElement === "top") {
                                  setTextPosition((prev) => ({
                                    ...prev,
                                    y: newY,
                                  }));
                                } else {
                                  setBottomTextPosition((prev) => ({
                                    ...prev,
                                    y: newY,
                                  }));
                                }
                              }}
                              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Text Effects */}
                      <div className="mt-4">
                        <label className="block text-sm font-semibold mb-2">
                          Text Effect
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {textEffects.map((effect) => (
                            <button
                              key={effect.id}
                              onClick={() => setTextEffect(effect.id)}
                              className={`p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                                textEffect === effect.id
                                  ? "bg-gradient-to-r from-pink-500 to-cyan-500 text-white"
                                  : "glass text-gray-300 hover:text-white"
                              }`}
                            >
                              {effect.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div
                    className={`glass p-2 md:p-3 rounded-lg transition-all duration-300 order-1 md:order-2 ${
                      isDarkMode
                        ? ""
                        : "bg-white/90 shadow-lg border border-gray-100"
                    }`}
                  >
                    <h3 className="text-base font-bold mb-2 gradient-text transition-all duration-300">
                      Live Preview
                    </h3>
                    <div
                      className={`relative rounded-lg overflow-hidden transition-all duration-300 max-w-xs md:max-w-sm lg:max-w-md mx-auto ${
                        isDarkMode
                          ? "bg-gray-800/30"
                          : "bg-gray-50 shadow-inner"
                      }`}
                    >
                      {/* Image container with natural aspect ratio */}
                      <div className="relative">
                        <img
                          src={selectedTemplate?.image}
                          alt={selectedTemplate?.name}
                          className="w-full h-auto"
                        />
                      </div>

                      {/* Text overlay container */}
                      <div className="absolute inset-0 top-0 left-0 w-full h-full">
                        {/* Render text fields on top of the image; compute positions */}
                        {textFields.map((field, index) => {
                          if (!field?.text) return null;

                          const isTop = index === 0;
                          const isBottom =
                            index === textFields.length - 1 &&
                            textFields.length > 1;
                          const isMiddle = !isTop && !isBottom;

                          let pos = { x: 50, y: 50 };
                          if (isTop) pos = textPosition;
                          else if (isBottom) pos = bottomTextPosition;
                          else if (isMiddle) {
                            // Space middle texts between top (10%) and bottom (90%)
                            const middleBase = 20;
                            const step = Math.min(
                              60 / Math.max(1, textFields.length),
                              20
                            );
                            pos = { x: 50, y: middleBase + index * step };
                          }

                          return (
                            <div
                              key={field.id}
                              className="meme-text-overlay"
                              style={getTextStyle(pos, {
                                textColor,
                                fontSize,
                                fontFamily,
                                textAlign,
                                textEffect,
                              })}
                            >
                              {field.text.toUpperCase()}
                            </div>
                          );
                        })}

                        {/* Enhanced text rendering with custom positioning */}
                        {textFields.length === 0 && topText && (
                          <div
                            className="meme-text-overlay px-2"
                            style={getTextStyle(textPosition, {
                              textColor,
                              fontSize,
                              fontFamily,
                              textAlign,
                              textEffect,
                            })}
                          >
                            {topText.toUpperCase()}
                          </div>
                        )}
                        {textFields.length === 0 && bottomText && (
                          <div
                            className="meme-text-overlay px-2"
                            style={getTextStyle(bottomTextPosition, {
                              textColor,
                              fontSize,
                              fontFamily,
                              textAlign,
                              textEffect,
                            })}
                          >
                            {bottomText.toUpperCase()}
                          </div>
                        )}
                      </div>
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

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                  {textEffects.map((effect) => (
                    <motion.button
                      key={effect.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setTextEffect(effect.id)}
                      className={`p-3 md:p-4 rounded-xl font-bold text-center transition-all duration-500 ease-in-out transform hover:scale-105 text-sm md:text-base ${
                        textEffect === effect.id
                          ? "bg-gradient-to-r from-pink-500 to-cyan-500 text-white shadow-lg scale-105"
                          : isDarkMode
                          ? "glass-dark text-gray-300 hover:text-white hover:shadow-md"
                          : "bg-white/80 text-gray-600 hover:text-gray-900 hover:bg-white shadow-sm hover:shadow-md border border-gray-200"
                      }`}
                      style={{
                        textShadow: effect.style,
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

        {/* Generate Button */}
        {selectedTemplate &&
          (topText ||
            bottomText ||
            (textFields && textFields.some((f) => f.text))) && (
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
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
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
                className="relative bg-white rounded-xl overflow-hidden mb-6 max-w-lg mx-auto"
              >
                <img
                  src={generatedMeme.template_image}
                  alt={generatedMeme.template_name}
                  className="w-full h-auto"
                />

                {/* Text overlay container */}
                <div className="absolute inset-0">
                  {generatedMeme.text_fields?.map((field, index) => {
                    if (!field?.text) return null;

                    const isTop = index === 0;
                    const isBottom =
                      index === generatedMeme.text_fields.length - 1 &&
                      generatedMeme.text_fields.length > 1;
                    const isMiddle = !isTop && !isBottom;

                    let pos = { x: 50, y: 50 };
                    if (isTop)
                      pos = generatedMeme.text_positions?.top || textPosition;
                    else if (isBottom)
                      pos =
                        generatedMeme.text_positions?.bottom ||
                        bottomTextPosition;
                    else if (isMiddle) {
                      const middlePosition = 20 + index * 30;
                      pos = { x: 50, y: middlePosition };
                    }

                    return (
                      <div
                        key={field.id}
                        className="meme-text-overlay"
                        style={getTextStyle(pos, {
                          textColor: generatedMeme.text_color,
                          fontSize: generatedMeme.font_size,
                          fontFamily: generatedMeme.font_family,
                          textAlign: generatedMeme.text_align,
                          textEffect: generatedMeme.text_effect,
                        })}
                      >
                        {field.text.toUpperCase()}
                      </div>
                    );
                  })}

                  {/* Fallback for backward compatibility */}
                  {(!generatedMeme.text_fields ||
                    generatedMeme.text_fields.length === 0) &&
                    generatedMeme.top_text && (
                      <div
                        className="meme-text-overlay"
                        style={{
                          top: "15%",
                          left: "50%",
                          color: generatedMeme.text_color,
                          fontSize: generatedMeme.font_size,
                          fontFamily:
                            fontFamilies.find(
                              (f) => f.id === generatedMeme.font_family
                            )?.font || "Impact, Arial Black, sans-serif",
                          textAlign: generatedMeme.text_align,
                          textShadow: textEffects.find(
                            (e) => e.id === generatedMeme.text_effect
                          )?.style,
                        }}
                      >
                        {generatedMeme.top_text.toUpperCase()}
                      </div>
                    )}
                  {(!generatedMeme.text_fields ||
                    generatedMeme.text_fields.length === 0) &&
                    generatedMeme.bottom_text && (
                      <div
                        className="meme-text-overlay"
                        style={{
                          top: "85%",
                          left: "50%",
                          color: generatedMeme.text_color,
                          fontSize: generatedMeme.font_size,
                          fontFamily:
                            fontFamilies.find(
                              (f) => f.id === generatedMeme.font_family
                            )?.font || "Impact, Arial Black, sans-serif",
                          textAlign: generatedMeme.text_align,
                          textShadow: textEffects.find(
                            (e) => e.id === generatedMeme.text_effect
                          )?.style,
                        }}
                      >
                        {generatedMeme.bottom_text.toUpperCase()}
                      </div>
                    )}
                </div>
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
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 flex flex-col gap-2 md:gap-3 z-40">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setActiveTab("customize")}
            className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-xl flex items-center justify-center text-lg md:text-xl"
            title="Customize"
          >
            ✏️
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleGenerateMeme}
            disabled={
              !topText &&
              !bottomText &&
              !(textFields && textFields.some((f) => f.text))
            }
            className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-pink-500 to-cyan-500 text-white rounded-full shadow-xl flex items-center justify-center text-lg md:text-xl disabled:opacity-50"
            title="Generate"
          >
            ⚡
          </motion.button>
        </div>
      )}

      {/* AI Meme Editor Modal */}
      <AnimatePresence>
        {showAIEditor && (
          <AIMemeEditor
            template={selectedTemplate}
            onClose={() => setShowAIEditor(false)}
            onSave={handleAIEditorSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Generator;