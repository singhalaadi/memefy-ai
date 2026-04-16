import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";

const BottomNav = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navLinks = [
    { label: "Home", path: "/", icon: "🏠" },
    { label: "Generator", path: "/generator", icon: "🤖" },
    { label: "Gallery", path: "/gallery", icon: "🎨" },
    ...(user
      ? [
          { label: "Dashboard", path: "/dashboard", icon: "📊" },
          { label: "Profile", path: "/profile", icon: "👤" },
        ]
      : [{ label: "Login", path: "/login", icon: "🔑" }]),
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] px-4 pb-6 pt-2 h-20">
      <div className="glass h-full rounded-[1.5rem] flex items-center justify-around shadow-2xl border border-white/10 px-2 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className="relative flex flex-col items-center justify-center p-2 group"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0 bg-white/5 rounded-2xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className={`text-2xl transition-transform duration-300 ${isActive ? 'scale-110 -translate-y-1' : 'opacity-60 group-hover:scale-110'}`}>
                {link.icon}
              </span>
              <span className={`text-[10px] font-black uppercase tracking-widest mt-1 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 scale-75'}`}>
                {link.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full shadow-[0_0_8px_rgba(255,107,157,0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
