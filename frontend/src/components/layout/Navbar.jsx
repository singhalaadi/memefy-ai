import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Sparkles, Image, BarChart3, User,
  LogIn, LogOut, Moon, Sun, X, Menu
} from "lucide-react";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    setIsMenuOpen(false);
  };

  const mainNavLinks = [
    { label: "Home", path: "/", icon: Home },
    { label: "Generator", path: "/generator", icon: Sparkles },
    { label: "Gallery", path: "/gallery", icon: Image },
  ];

  const userNavLinks = user
    ? [
        { label: "Dashboard", path: "/dashboard", icon: BarChart3 },
        { label: "Profile", path: "/profile", icon: User },
      ]
    : [];

  return (
    <>
      <nav className="sticky top-1 z-50 glass border-b border-white/10">
        <div className="container mx-auto px-4 md:px-8 py-2">
          <div className="flex items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="text-xl lg:text-2xl"
                >
                  🚀
                </motion.div>
                <span className="text-xl font-bold gradient-text whitespace-nowrap">
                  MEMEFY-AI
                </span>
              </Link>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 xl:gap-2">
              {mainNavLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    title={link.label}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full font-medium transition-all duration-300 hover:bg-white/10 text-sm xl:text-base ${
                      isActive
                        ? `bg-gradient-to-r from-pink-500/20 to-cyan-500/20 ${isDarkMode ? "text-white" : "text-gray-900"}`
                        : isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="hidden lg:inline whitespace-nowrap">{link.label}</span>
                  </Link>
                );
              })}

              {userNavLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    title={link.label}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full font-medium transition-all duration-300 hover:bg-white/10 text-sm xl:text-base ${
                      isActive
                        ? `bg-gradient-to-r from-pink-500/20 to-cyan-500/20 ${isDarkMode ? "text-white" : "text-gray-900"}`
                        : isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="hidden lg:inline whitespace-nowrap">{link.label}</span>
                  </Link>
                );
              })}

              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className="p-2.5 glass-dark rounded-full hover:bg-white/10 transition-all duration-300"
                title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
              >
                {isDarkMode
                  ? <Sun size={18} className="text-yellow-400" />
                  : <Moon size={18} className="text-slate-700" />
                }
              </motion.button>

              {/* Auth */}
              {user ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-full font-medium transition-all duration-300 text-sm border border-red-500/20"
                  >
                    <span className="hidden xl:inline">Logout</span>
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-cyan-500 px-4 py-2 rounded-full font-semibold text-white hover:opacity-90 transition-all duration-300 text-sm"
                >
                  <LogIn size={16} />
                  <span>Login</span>
                </Link>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className={`md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer: Backdrop ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Mobile Drawer: Panel ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className={`fixed top-0 right-0 bottom-0 w-[78%] max-w-[300px] z-[110] md:hidden flex flex-col shadow-2xl ${
              isDarkMode ? "bg-slate-900" : "bg-white"
            }`}
          >
            {/* Drawer Header */}
            <div className={`flex items-center justify-between px-5 py-4 border-b ${isDarkMode ? "border-white/10" : "border-gray-200"}`}>
              <div className="flex items-center gap-2">
                <span className="text-xl">🚀</span>
                <span className="font-black italic gradient-text text-base">MEMEFY-AI</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className={`p-1.5 rounded-full transition-colors ${
                  isDarkMode ? "hover:bg-white/10 text-white" : "hover:bg-gray-100 text-slate-800"
                }`}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Links */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              <p className={`text-[10px] font-black uppercase tracking-widest px-3 pb-2 ${isDarkMode ? "text-white/30" : "text-slate-400"}`}>
                Navigate
              </p>
              {mainNavLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-pink-500/15 to-cyan-500/15 text-cyan-400"
                        : isDarkMode
                          ? "text-gray-300 hover:text-white hover:bg-white/8"
                          : "text-slate-600 hover:text-slate-900 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={19} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {userNavLinks.length > 0 && (
                <>
                  <p className={`text-[10px] font-black uppercase tracking-widest px-3 pt-4 pb-2 ${isDarkMode ? "text-white/30" : "text-slate-400"}`}>
                    Account
                  </p>
                  {userNavLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-pink-500/15 to-cyan-500/15 text-cyan-400"
                            : isDarkMode
                              ? "text-gray-300 hover:text-white hover:bg-white/8"
                              : "text-slate-600 hover:text-slate-900 hover:bg-gray-100"
                        }`}
                      >
                        <Icon size={19} />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </>
              )}

              {/* Theme Toggle Row */}
              <div className={`mt-2 border-t pt-3 ${isDarkMode ? "border-white/10" : "border-gray-200"}`}>
                <button
                  onClick={toggleTheme}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    isDarkMode
                      ? "text-gray-300 hover:text-white hover:bg-white/8"
                      : "text-slate-600 hover:text-slate-900 hover:bg-gray-100"
                  }`}
                >
                  {isDarkMode
                    ? <Sun size={19} className="text-yellow-400" />
                    : <Moon size={19} className="text-slate-600" />
                  }
                  <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                </button>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className={`px-4 py-5 border-t ${isDarkMode ? "border-white/10 bg-white/[0.03]" : "border-gray-200 bg-gray-50"}`}>
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {user.photoURL || user.avatar ? (
                      <img
                        src={user.photoURL || user.avatar}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full object-cover border-2 border-pink-500/30"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                        <User size={20} className="text-cyan-400" />
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className={`font-bold text-sm truncate ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                        {user.name || user.displayName || "Creator"}
                      </p>
                      <p className={`text-[11px] truncate ${isDarkMode ? "text-white/40" : "text-slate-400"}`}>
                        {user.email || ""}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl font-bold transition-all duration-200 border border-red-500/20 text-sm"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-bold rounded-xl shadow-lg text-sm"
                >
                  <LogIn size={18} />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;