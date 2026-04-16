import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { Home, Sparkles, Image, BarChart3, User, LogIn } from "lucide-react";

const BottomNav = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navLinks = [
    { label: "Home", path: "/", icon: Home },
    { label: "Create", path: "/generator", icon: Sparkles },
    { label: "Gallery", path: "/gallery", icon: Image },
    ...(user
      ? [
          { label: "Stats", path: "/dashboard", icon: BarChart3 },
          { label: "Profile", path: "/profile", icon: User },
        ]
      : [{ label: "Login", path: "/login", icon: LogIn }]),
  ];

  return (
    <nav className="md:hidden fixed bottom-2 left-0 right-0 z-[100] flex justify-center px-2">
      <div className="glass h-16 rounded-full flex items-center justify-between shadow-2xl border border-white/10 px-1 relative max-w-sm w-full gap-0.5">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          const Icon = link.icon;
          
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`relative flex items-center justify-center transition-all duration-300 rounded-full px-3 py-2 ${
                isActive 
                  ? "bg-gradient-to-r from-pink-500/20 to-cyan-500/20 text-white flex-[1.5]" 
                  : "text-gray-400 hover:text-white flex-1"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon size={isActive ? 20 : 22} className={isActive ? "text-cyan-400" : ""} />
                {isActive && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs font-bold whitespace-nowrap"
                  >
                    {link.label}
                  </motion.span>
                )}
              </div>
              
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0 border border-white/10 rounded-full -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;