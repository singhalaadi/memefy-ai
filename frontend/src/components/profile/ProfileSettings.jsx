import { motion } from "framer-motion";

const ProfileSettings = ({ user, isDarkMode }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black italic gradient-text uppercase tracking-tight">
        Account Settings
      </h2>
      
      <div className={`glass p-8 rounded-3xl transition-all duration-500 ${
        isDarkMode ? "" : "bg-white/90 shadow-xl border border-gray-100"
      }`}>
        <div className="space-y-8">
          {/* Status Badge */}
          <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl w-fit">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-green-500">Account Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest opacity-50 ml-1">Username</label>
              <div className={`p-4 rounded-2xl border-2 transition-all duration-300 font-bold ${
                isDarkMode ? "bg-gray-800/50 border-gray-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
              }`}>
                {user?.name || "Meme Lord"}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest opacity-50 ml-1">Email Address</label>
              <div className={`p-4 rounded-2xl border-2 transition-all duration-300 font-bold ${
                isDarkMode ? "bg-gray-800/50 border-gray-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
              }`}>
                {user?.email || "Connect your email"}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <div className={`p-6 rounded-2xl border border-dashed text-center ${
              isDarkMode ? "border-gray-700 bg-gray-800/20" : "border-gray-200 bg-gray-50"
            }`}>
              <p className="text-sm opacity-60 font-medium">Looking for more settings? Advanced controls coming soon in the v2.0 update! 🚀</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
