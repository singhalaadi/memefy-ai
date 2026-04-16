import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Settings, User } from "lucide-react";

const ProfileHeader = ({ user, analytics, userMemesCount, isDarkMode }) => {
  const displayName = user?.name || "Meme Master";
  const username = user?.username;
  const avatarUrl = user?.avatar && user.avatar.startsWith("http") ? user.avatar : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`glass p-8 rounded-3xl mb-8 transition-all duration-500 ${
        isDarkMode ? "" : "bg-white/90 shadow-xl border border-gray-100"
      }`}
    >
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 p-1.5 shadow-lg">
            <div
              className={`w-full h-full rounded-full flex items-center justify-center overflow-hidden ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User
                  size={48}
                  className={isDarkMode ? "text-gray-500" : "text-gray-400"}
                />
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left min-w-0">
          {/* Name — single line, truncated */}
          <h1 className="text-2xl md:text-3xl font-black gradient-text truncate leading-tight mb-0.5">
            {displayName}
          </h1>

          {/* Username OR fallback tagline */}
          <p className={`text-sm font-semibold mb-5 ${isDarkMode ? "text-white/50" : "text-slate-400"}`}>
            {username ? `@${username}` : "Meme Creator"}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 justify-center md:justify-start mb-5">
            {[
              { label: "Memes", value: userMemesCount ?? 0, icon: "🎨" },
              { label: "Views", value: analytics?.total_views ?? 0, icon: "👁️" },
              { label: "Shares", value: analytics?.total_shares ?? 0, icon: "📤" },
            ].map((stat) => (
              <div key={stat.label} className="group cursor-default text-center md:text-left">
                <div className="text-3xl font-black gradient-text group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div
                  className={`text-xs font-bold uppercase tracking-widest opacity-50 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {stat.icon} {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Edit Profile Button */}
          <Link
            to="/settings"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 border ${
              isDarkMode
                ? "border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                : "border-gray-200 text-slate-500 hover:text-slate-900 hover:bg-gray-50"
            }`}
          >
            <Settings size={15} />
            Edit Profile
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;
