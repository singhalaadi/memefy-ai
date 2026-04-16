import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  const isDemoUser = user && localStorage.getItem("demoUser");

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    setIsMenuOpen(false);
  };

  const navLinks = [
    { label: "Home", path: "/", icon: "🏠" },
    { label: "Generator", path: "/generator", icon: "🤖" },
    { label: "Gallery", path: "/gallery", icon: "🎨" },
    ...(user
      ? [
          { label: "Dashboard", path: "/dashboard", icon: "📊" },
          { label: "Profile", path: "/profile", icon: "👤" },
        ]
      : []),
  ];

  // Separate main navigation links (Home, Generator, Gallery)
  const mainNavLinks = [
    { label: "Home", path: "/", icon: "🏠" },
    { label: "Generator", path: "/generator", icon: "🤖" },
    { label: "Gallery", path: "/gallery", icon: "🎨" },
  ];

  // User-specific links for mobile menu
  const userNavLinks = user
    ? [
        { label: "Dashboard", path: "/dashboard", icon: "📊" },
        { label: "Profile", path: "/profile", icon: "👤" },
      ]
    : [];

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-8 py-2">
        <div className="flex items-center h-16">
          {/* Left Side: Logo - Far Left Edge */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="text-xl lg:text-2xl"
              >
                🚀
              </motion.div>
              <span className="text-xl lg:text-xl font-bold gradient-text whitespace-nowrap">MEMEFY-AI</span>
            </Link>
          </div>

          {/* Auto Gap - Spacer */}
          <div className="flex-1"></div>

          {/* Right Side: All Navigation Icons */}
          <div className="flex items-center gap-4">
            {/* Desktop Main Navigation */}
            <div className="hidden md:flex items-center gap-4 xl:gap-2">
              {mainNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  title={link.label}
                  className={`flex items-center gap-1 xl:gap-2 px-2 xl:px-3 py-2 xl:py-2.5 rounded-full font-medium xl:font-semibold transition-all duration-300 hover:bg-white/10 text-sm xl:text-base ${
                    location.pathname === link.path
                      ? `bg-gradient-to-r from-pink-500/20 to-cyan-500/20 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`
                      : `${
                          isDarkMode
                            ? "text-gray-300 hover:text-white"
                            : "text-gray-600 hover:text-gray-900"
                        }`
                  }`}
                >
                  <span className="text-base xl:text-lg">{link.icon}</span>
                  <span className="hidden lg:inline whitespace-nowrap">{link.label}</span>
                </Link>
              ))}

              {/* Desktop User Navigation */}
              {userNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  title={link.label}
                  className={`flex items-center gap-1 xl:gap-2 px-2 xl:px-3 py-2 xl:py-2.5 rounded-full font-medium xl:font-semibold transition-all duration-300 hover:bg-white/10 text-sm xl:text-base ${
                    location.pathname === link.path
                      ? `bg-gradient-to-r from-pink-500/20 to-cyan-500/20 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`
                      : `${
                          isDarkMode
                            ? "text-gray-300 hover:text-white"
                            : "text-gray-600 hover:text-gray-900"
                        }`
                  }`}
                >
                  <span className="text-base xl:text-lg">{link.icon}</span>
                  <span className="hidden lg:inline whitespace-nowrap">{link.label}</span>
                </Link>
              ))}
            </div>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="hidden md:flex p-2 xl:p-3 glass-dark rounded-full hover:bg-white/10 transition-all duration-300"
              title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
            >
              <span className="text-base xl:text-lg">{isDarkMode ? "🌙" : "☀️"}</span>
            </motion.button>

            {/* Auth Section */}
            {user ? (
              <div className="hidden md:flex items-center gap-1 xl:gap-2 flex-shrink-0">
                {isDemoUser && (
                  <span className="hidden lg:inline px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full whitespace-nowrap">
                    DEMO
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  className="px-2 xl:px-4 py-1 xl:py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-full font-medium xl:font-semibold transition-all duration-300 flex items-center gap-1 xl:gap-2 text-sm xl:text-base"
                >
                  <span className="hidden xl:inline">Logout</span>
                  <span className="text-base xl:text-lg">👋</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex bg-gradient-to-r from-pink-500 to-cyan-500 px-4 xl:px-6 py-2 xl:py-3 rounded-full font-semibold text-white hover:from-cyan-500 hover:to-pink-500 transition-all duration-300 items-center gap-2 text-sm xl:text-base"
              >
                <span>Login</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors z-50"
            >
              <div className="flex flex-col gap-1">
                <div
                  className={`w-6 h-0.5 bg-white transition-transform ${
                    isMenuOpen ? "rotate-45 translate-y-2" : ""
                  }`}
                ></div>
                <div
                  className={`w-6 h-0.5 bg-white transition-opacity ${
                    isMenuOpen ? "opacity-0" : ""
                  }`}
                ></div>
                <div
                  className={`w-6 h-0.5 bg-white transition-transform ${
                    isMenuOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
                ></div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{
            height: isMenuOpen ? "auto" : 0,
            opacity: isMenuOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-2">
            {/* Main Navigation Links */}
            {mainNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  location.pathname === link.path
                    ? `bg-gradient-to-r from-pink-500/20 to-cyan-500/20 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`
                    : `${
                        isDarkMode
                          ? "text-gray-300 hover:text-white hover:bg-white/10"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}

            {/* User Navigation Links */}
            {userNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  location.pathname === link.path
                    ? `bg-gradient-to-r from-pink-500/20 to-cyan-500/20 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`
                    : `${
                        isDarkMode
                          ? "text-gray-300 hover:text-white hover:bg-white/10"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}

            {/* Theme Toggle in Mobile */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl font-medium transition-all duration-300 ${
                isDarkMode
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="text-xl">{isDarkMode ? "🌙" : "☀️"}</span>
              <span>{isDarkMode ? "Dark Mode" : "Light Mode"}</span>
            </button>

            {user ? (
              <div className="border-t border-white/10 pt-4 mt-4">
                <div className="flex items-center gap-3 px-4 py-3">
                  {user.photoURL || user.avatar ? (
                    <img
                      src={user.photoURL || user.avatar}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'inline';
                      }}
                    />
                  ) : null}
                  <span className="text-2xl" style={{display: user.photoURL || user.avatar ? 'none' : 'inline'}}>
                    👤
                  </span>
                  <div>
                    <p className="font-medium">{user.name || user.displayName || "User"}</p>
                    {isDemoUser && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                        Demo Mode
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/20 rounded-xl font-medium transition-all duration-300"
                >
                  <span className="text-xl">👋</span>
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="border-t border-white/10 pt-4 mt-4">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full bg-gradient-to-r from-pink-500 to-cyan-500 px-4 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                >
                  <span>Login</span>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </nav>
  );
};

export default Navbar;
