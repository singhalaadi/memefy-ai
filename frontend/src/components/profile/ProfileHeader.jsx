import { motion } from "framer-motion";

const ProfileHeader = ({ user, analytics, userMemesCount, isDarkMode }) => {
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
        <div className="relative group">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 p-1.5 shadow-lg group-hover:rotate-6 transition-transform duration-500">
            <div className={`w-full h-full rounded-full flex items-center justify-center ${isDarkMode ? "bg-gray-800" : "bg-white"} overflow-hidden`}>
              {user?.avatar && user.avatar.startsWith("http") ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="text-4xl">{user?.avatar || "👤"}</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl font-black mb-1 italic tracking-tight underline-offset-8 decoration-pink-500">
            <span className="gradient-text">{user?.name || "MEME MASTER"}</span>
          </h1>
          <p className={`text-lg mb-6 opacity-70 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            {user?.email || "Lord of the Memes"}
          </p>

          <div className="flex flex-wrap gap-8 justify-center md:justify-start">
            {[
              { label: "Memes", value: userMemesCount, icon: "🎨" },
              { label: "Views", value: analytics?.total_views || 0, icon: "👁️" },
              { label: "Shares", value: analytics?.total_shares || 0, icon: "📤" },
            ].map((stat) => (
              <div key={stat.label} className="group cursor-default">
                <div className="text-3xl font-black gradient-text group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className={`text-xs font-bold uppercase tracking-widest opacity-50 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {stat.icon} {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;
