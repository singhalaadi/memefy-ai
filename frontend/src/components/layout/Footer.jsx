import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";

const Footer = () => {
  const { isDarkMode } = useTheme();

  const links = [
    { label: "Home", path: "/" },
    { label: "Generator", path: "/generator" },
    { label: "Gallery", path: "/gallery" },
  ];

  return (
    <footer className={`border-t py-10 px-6 transition-all duration-300 ${
      isDarkMode 
        ? "bg-[#0d0d1a]/80 border-white/5 text-white" 
        : "bg-white border-gray-100 text-gray-900"
    } backdrop-blur-xl`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.span whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }} className="text-2xl">
            🚀
          </motion.span>
          <span className="text-lg font-black gradient-text italic tracking-tight">MEMEFY-AI</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className={`text-sm font-semibold transition-all duration-200 hover:scale-105 ${
                isDarkMode 
                  ? "text-gray-500 hover:text-white" 
                  : "text-gray-400 hover:text-gray-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <p className={`text-xs font-medium ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}>
          © {new Date().getFullYear()}{" "}
          <span className="text-pink-500 font-bold">MEMEFY-AI</span>
          {" "}· Made for the Culture 🔥
        </p>
      </div>
    </footer>
  );
};

export default Footer;
