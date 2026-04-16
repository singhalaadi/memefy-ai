import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import firebaseAIService from "../services/firebaseAI";
import toast from "react-hot-toast";

const AIMemEditor = ({ template, onClose, onSave }) => {
  const { isDarkMode } = useTheme();
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  // Text elements state (supports multiple text boxes)
  const [textElements, setTextElements] = useState([
    {
      id: 1,
      text: "",
      x: 50,
      y: 20,
      fontSize: 32,
      fontWeight: "bold",
      color: "#FFFFFF",
      strokeColor: "#000000",
      strokeWidth: 2,
      textAlign: "center",
      fontFamily: "Impact, Arial Black, sans-serif",
      rotation: 0,
      opacity: 1,
    },
    {
      id: 2,
      text: "",
      x: 50,
      y: 80,
      fontSize: 32,
      fontWeight: "bold",
      color: "#FFFFFF",
      strokeColor: "#000000",
      strokeWidth: 2,
      textAlign: "center",
      fontFamily: "Impact, Arial Black, sans-serif",
      rotation: 0,
      opacity: 1,
    },
  ]);

  const [selectedElement, setSelectedElement] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [conceptInput, setConceptInput] = useState("");

  // Canvas rendering
  useEffect(() => {
    renderCanvas();
  }, [textElements, template]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !template) return;

    const ctx = canvas.getContext("2d");

    // Draw template image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Set canvas size to match the natural image size
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw text elements
      textElements.forEach((element) => {
        if (element.text.trim() === "") return;

        ctx.save();

        ctx.font = `${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`;
        ctx.fillStyle = element.color;
        ctx.strokeStyle = element.strokeColor;
        ctx.lineWidth = element.strokeWidth;
        ctx.textAlign = element.textAlign;
        ctx.globalAlpha = element.opacity;

        // Calculate position
        const x = (element.x / 100) * canvas.width;
        const y = (element.y / 100) * canvas.height;

        // Apply rotation
        ctx.translate(x, y);
        ctx.rotate((element.rotation * Math.PI) / 180);

        // Draw text with stroke
        if (element.strokeWidth > 0) {
          ctx.strokeText(element.text.toUpperCase(), 0, 0);
        }
        ctx.fillText(element.text.toUpperCase(), 0, 0);

        ctx.restore();
      });
    };
    img.src = template.image;
  };

  // AI-powered features
  const generateAISuggestions = async () => {
    if (!firebaseAIService.isAvailable()) {
      toast.error("AI service not available");
      return;
    }

    setIsLoading(true);
    try {
      const suggestions = await firebaseAIService.analyzeMemeTemplate(
        template.image,
        template.name
      );
      setAiSuggestions(suggestions);
      toast.success("AI suggestions generated! 🤖✨");
    } catch (error) {
      toast.error("Failed to generate AI suggestions");
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestion = (suggestion) => {
    const updatedElements = [...textElements];
    if (updatedElements[0]) updatedElements[0].text = suggestion.top || "";
    if (updatedElements[1]) updatedElements[1].text = suggestion.bottom || "";
    setTextElements(updatedElements);
  };

  const generateFromConcept = async () => {
    if (!conceptInput.trim()) {
      toast.error("Please enter a concept to generate a meme");
      return;
    }

    setIsLoading(true);
    try {
      const result = await firebaseAIService.generateMemeFromConcept(
        conceptInput
      );
      console.log("Generated concept result:", result);

      const updatedElements = [...textElements];
      if (updatedElements[0] && result.topText) {
        updatedElements[0].text = result.topText;
      }
      if (updatedElements[1] && result.bottomText) {
        updatedElements[1].text = result.bottomText;
      }
      setTextElements(updatedElements);

      toast.success(
        `Meme generated: "${result.topText}" / "${result.bottomText}" 🎯`
      );
    } catch (error) {
      toast.error("Failed to generate meme from concept");
    } finally {
      setIsLoading(false);
    }
  };

  const improveText = async (elementId) => {
    const element = textElements.find((el) => el.id === elementId);
    if (!element?.text.trim() || !firebaseAIService.isAvailable()) {
      toast.error("No text to improve or AI service unavailable");
      return;
    }

    setIsLoading(true);
    try {
      const improved = await firebaseAIService.improveMemeText(
        element.text,
        template.name
      );

      // Show improvement options
      toast.custom(
        (t) => (
          <div
            className={`${
              isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            } p-4 rounded-lg shadow-lg max-w-sm`}
          >
            <div className="font-bold mb-2">AI Improvements:</div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  updateTextElement(elementId, { text: improved.improved1 });
                  toast.dismiss(t.id);
                }}
                className="block w-full text-left p-2 rounded bg-blue-500 text-white hover:bg-blue-600"
              >
                {improved.improved1}
              </button>
              <button
                onClick={() => {
                  updateTextElement(elementId, { text: improved.improved2 });
                  toast.dismiss(t.id);
                }}
                className="block w-full text-left p-2 rounded bg-purple-500 text-white hover:bg-purple-600"
              >
                {improved.improved2}
              </button>
            </div>
          </div>
        ),
        { duration: 10000 }
      );
    } catch (error) {
      toast.error("Failed to improve text");
    } finally {
      setIsLoading(false);
    }
  };

  // Text element management
  const updateTextElement = (id, updates) => {
    setTextElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const addTextElement = () => {
    const newElement = {
      id: Date.now(),
      text: "New Text",
      x: 50,
      y: 50,
      fontSize: 32,
      fontWeight: "bold",
      color: "#FFFFFF",
      strokeColor: "#000000",
      strokeWidth: 2,
      textAlign: "center",
      fontFamily: "Impact, Arial Black, sans-serif",
      rotation: 0,
      opacity: 1,
    };
    setTextElements((prev) => [...prev, newElement]);
  };

  const deleteTextElement = (id) => {
    setTextElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedElement?.id === id) {
      setSelectedElement(null);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(
      (blob) => {
        const memeData = {
          template,
          textElements,
          imageBlob: blob,
          imageUrl: canvas.toDataURL("image/png"),
          generatedAt: new Date().toISOString(),
        };
        onSave(memeData);
      },
      "image/png",
      1.0
    );
  };

  if (!template) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 md:p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className={`${
          isDarkMode ? "bg-gray-900" : "bg-white"
        } rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto`}
      >
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold gradient-text">
              AI Meme Editor - {template.name}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6">
          {/* Canvas Area */}
          <div className="flex justify-center order-1 md:order-none">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 md:p-4 w-full max-w-sm md:max-w-md">
              <canvas
                ref={canvasRef}
                className="w-full h-auto border rounded shadow-lg cursor-crosshair mx-auto block"
                style={{ maxWidth: "100%" }}
              />
            </div>
          </div>

          {/* Controls Panel */}
          <div className="space-y-4 md:space-y-6 order-2 md:order-none">
            {/* AI Features */}
            <div
              className={`p-4 rounded-xl ${
                isDarkMode ? "bg-gray-800" : "bg-gray-50"
              }`}
            >
              <h3 className="font-bold text-lg mb-4 gradient-text">
                🤖 AI Assistant
              </h3>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generateAISuggestions}
                  disabled={isLoading}
                  className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {isLoading ? "Generating..." : "🎯 Get AI Suggestions"}
                </motion.button>

                <div>
                  <input
                    type="text"
                    value={conceptInput}
                    onChange={(e) => setConceptInput(e.target.value)}
                    placeholder="Describe your meme concept..."
                    className={`w-full p-2 rounded border ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600"
                        : "bg-white border-gray-300"
                    }`}
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={generateFromConcept}
                    disabled={isLoading}
                    className="w-full mt-2 py-2 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {isLoading ? "Generating..." : "✨ Generate from Concept"}
                  </motion.button>
                </div>
              </div>

              {/* AI Suggestions Display */}
              {aiSuggestions && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium">AI Suggestions:</h4>
                  {Object.values(aiSuggestions).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => applySuggestion(suggestion)}
                      className={`w-full p-2 text-left rounded text-sm ${
                        isDarkMode
                          ? "bg-gray-700 hover:bg-gray-600"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      <div className="font-medium">{suggestion.top}</div>
                      <div className="text-xs opacity-75">
                        {suggestion.bottom}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Text Elements */}
            <div
              className={`p-4 rounded-xl ${
                isDarkMode ? "bg-gray-800" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg gradient-text">
                  📝 Text Elements
                </h3>
                <button
                  onClick={addTextElement}
                  className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  + Add Text
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {textElements.map((element) => (
                  <div
                    key={element.id}
                    className={`p-3 rounded border-2 cursor-pointer ${
                      selectedElement?.id === element.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : isDarkMode
                        ? "border-gray-600 bg-gray-700"
                        : "border-gray-200 bg-white"
                    }`}
                    onClick={() => setSelectedElement(element)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        Text {element.id}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            improveText(element.id);
                          }}
                          className="p-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
                          title="Improve with AI"
                        >
                          🤖
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTextElement(element.id);
                          }}
                          className="p-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={element.text}
                      onChange={(e) =>
                        updateTextElement(element.id, { text: e.target.value })
                      }
                      className={`w-full p-2 text-sm rounded ${
                        isDarkMode ? "bg-gray-600" : "bg-gray-100"
                      }`}
                      rows="2"
                      placeholder="Enter meme text..."
                    />

                    {selectedElement?.id === element.id && (
                      <div className="mt-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <label>
                            Size:
                            <input
                              type="range"
                              min="12"
                              max="72"
                              value={element.fontSize}
                              onChange={(e) =>
                                updateTextElement(element.id, {
                                  fontSize: parseInt(e.target.value),
                                })
                              }
                              className="w-full"
                            />
                          </label>
                          <label>
                            X Position:
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={element.x}
                              onChange={(e) =>
                                updateTextElement(element.id, {
                                  x: parseInt(e.target.value),
                                })
                              }
                              className="w-full"
                            />
                          </label>
                          <label>
                            Color:
                            <input
                              type="color"
                              value={element.color}
                              onChange={(e) =>
                                updateTextElement(element.id, {
                                  color: e.target.value,
                                })
                              }
                              className="w-full h-6"
                            />
                          </label>
                          <label>
                            Y Position:
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={element.y}
                              onChange={(e) =>
                                updateTextElement(element.id, {
                                  y: parseInt(e.target.value),
                                })
                              }
                              className="w-full"
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold"
              >
                💾 Save Meme
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className={`px-6 py-3 rounded-xl font-medium ${
                  isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                Cancel
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AIMemEditor;
