import React from "react";
import Navbar from "./Navbar";
import { useTheme } from "../../context/ThemeContext";

const Layout = ({ children }) => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e]"
          : "bg-gradient-to-br from-[#f0f9ff] via-[#e0e7ff] to-[#f8fafc]"
      }`}
    >
      <Navbar />
      <main className="pb-16">{children}</main>
      <footer className={`border-t ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-white/50'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="text-center">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              © 2025 MEMEFY AI - Creating viral content with AI
            </p>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              AI-powered meme generation services provided through third-party APIs
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default Layout;
