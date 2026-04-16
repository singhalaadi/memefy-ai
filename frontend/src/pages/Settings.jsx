import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { uploadAvatarToCloudinary } from "../services/cloudinary";
import {
    Camera, User, AtSign, Type, Lock,
    Loader2, ChevronLeft, Trash2,
    Eye, EyeOff, Sparkles,
    Mail, ShieldCheck
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const USERNAME_COOLDOWN_DAYS = 60;

const getDaysRemaining = (lastChange) => {
    if (!lastChange) return 0;
    const lastDate = lastChange.toDate ? lastChange.toDate() : new Date(lastChange);
    const elapsed = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(USERNAME_COOLDOWN_DAYS - elapsed));
};

const Settings = () => {
    const { user, updateUserProfile, deactivateAccount, deleteAccount } = useAuth();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const fileRef = useRef(null);

    const [name, setName] = useState(user?.name || "");
    const [username, setUsername] = useState(user?.username || "");
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
    const [avatarFile, setAvatarFile] = useState(null);

    // Sync local state when user context updates (fixes stale UI after signup)
    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setUsername(user.username || "");
            setAvatarPreview(user.avatar || null);
        }
    }, [user]);

    const [savingName, setSavingName] = useState(false);
    const [savingUsername, setSavingUsername] = useState(false);
    const [savingAvatar, setSavingAvatar] = useState(false);

    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [showDeletePassword, setShowDeletePassword] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const usernameDaysLeft = getDaysRemaining(user?.lastUsernameChange);
    const usernameOnCooldown = usernameDaysLeft > 0;

    const handleAvatarPick = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleSaveName = async () => {
        if (!name.trim()) { toast.error("Please enter a name."); return; }
        setSavingName(true);
        try { await updateUserProfile({ name: name.trim() }); } finally { setSavingName(false); }
    };

    const handleSaveUsername = async () => {
        setSavingUsername(true);
        try { await updateUserProfile({ username }); } catch (_) { } finally { setSavingUsername(false); }
    };

    const handleSaveAvatar = async () => {
        setSavingAvatar(true);
        try {
            const url = await uploadAvatarToCloudinary(avatarFile);
            await updateUserProfile({ avatar: url });
            setAvatarFile(null);
        } catch (err) { toast.error("Upload failed"); } finally { setSavingAvatar(false); }
    };

    const handleDeactivate = async () => {
        setActionLoading(true);
        try { await deactivateAccount(); navigate("/"); } catch (_) { } finally { setActionLoading(false); }
    };

    const handleDelete = async () => {
        if (user?.provider === "password" && !deletePassword) { toast.error("Password required"); return; }
        setActionLoading(true);
        try { await deleteAccount(deletePassword || null); navigate("/"); } catch (_) { } finally { setActionLoading(false); }
    };

    const sectionTitle = `text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2 ${isDarkMode ? "text-white/30" : "text-slate-400"}`;
    const cardCls = `glass rounded-3xl p-6 border transition-all duration-300 overflow-hidden ${isDarkMode ? "border-white/5 bg-white/[0.02]" : "border-slate-200 bg-white shadow-sm"}`;
    const inputContainer = `relative flex items-center gap-2 p-1 rounded-2xl border-2 transition-all overflow-hidden ${isDarkMode ? "border-white/5 bg-black/20 focus-within:border-pink-500/50" : "border-slate-100 bg-slate-50 focus-within:border-pink-400"}`;
    const inputCls = `min-w-0 flex-1 bg-transparent px-3 py-2 text-sm font-bold outline-none ${isDarkMode ? "text-white placeholder:text-white/20" : "text-slate-800 placeholder:text-slate-300"}`;

    return (
        <div className={`min-h-screen pt-20 pb-12 transition-colors duration-500 ${isDarkMode ? "bg-[#050508]" : "bg-slate-50"}`}>
            <div className="container mx-auto px-4 max-w-xl">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/profile" className={`p-3 rounded-2xl glass hover:scale-105 transition-all ${isDarkMode ? "text-white" : "text-slate-700 shadow-sm"}`}>
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black italic gradient-text uppercase tracking-tight">Settings</h1>
                        <p className={`text-xs font-bold opacity-40 uppercase tracking-widest`}>Manage your account preferences</p>
                    </div>
                </div>

                <div className="space-y-10">
                    <section>
                        <h2 className={sectionTitle}>
                            <User size={12} /> Public Identity
                        </h2>
                        <div className={cardCls}>
                            <div className="flex flex-col items-center mb-8">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full p-1.5 bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-500 shadow-xl group-hover:rotate-3 transition-transform duration-500">
                                        <div className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center ${isDarkMode ? "bg-slate-800" : "bg-white"}`}>
                                            {avatarPreview ? (
                                                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={48} className="opacity-20" />
                                            )}
                                        </div>
                                    </div>
                                    <button onClick={() => fileRef.current?.click()} className="absolute bottom-0 right-0 p-3 bg-pink-500 text-white rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all">
                                        <Camera size={18} />
                                    </button>
                                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarPick} />
                                </div>
                                {avatarFile && (
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        onClick={handleSaveAvatar} disabled={savingAvatar}
                                        className="mt-4 px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg"
                                    >
                                        {savingAvatar ? <Loader2 size={12} className="animate-spin" /> : "Save Photo"}
                                    </motion.button>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 ml-1 overflow-hidden">
                                        <label className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-40 truncate`}>Display Name</label>
                                        <span className="text-[10px] opacity-30 truncate">Visible to everyone</span>
                                    </div>
                                    <div className={inputContainer}>
                                        <Type size={12} className="ml-3 opacity-30 flex-shrink-0" />
                                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" className={inputCls} />
                                        <button onClick={handleSaveName} disabled={savingName || name === user?.name} className="px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-0 flex-shrink-0">
                                            {savingName ? <Loader2 size={12} className="animate-spin" /> : "Update"}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 ml-1 overflow-hidden">
                                        <label className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-40 truncate`}>Username</label>
                                        {usernameOnCooldown && (
                                            <span className="flex items-center gap-1 text-[10px] font-black text-amber-500 uppercase tracking-widest animate-pulse truncate">
                                                <Lock size={10} /> {usernameDaysLeft}d remaining
                                            </span>
                                        )}
                                    </div>
                                    <div className={`${inputContainer} ${usernameOnCooldown ? "opacity-50 grayscale cursor-not-allowed" : ""}`}>
                                        <AtSign size={16} className="ml-3 opacity-30 flex-shrink-0" />
                                        <input
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                                            placeholder="username"
                                            disabled={usernameOnCooldown}
                                            className={inputCls}
                                        />
                                        {!usernameOnCooldown && (
                                            <button onClick={handleSaveUsername} disabled={savingUsername || username === user?.username} className="px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-0 flex-shrink-0">
                                                {savingUsername ? <Loader2 size={12} className="animate-spin" /> : "Update"}
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[9px] opacity-30 font-bold ml-1">Unique handle. Changeable every 60 days.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className={sectionTitle}>
                            <ShieldCheck size={12} /> Account Management
                        </h2>
                        <div className={cardCls}>
                            <div className={`mb-8 p-4 rounded-2xl flex items-center justify-between gap-3 border ${isDarkMode ? "bg-emerald-500/5 border-emerald-500/10" : "bg-emerald-50 border-emerald-100"}`}>
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="relative flex h-3 w-3 flex-shrink-0">
                                        <div className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75"></div>
                                        <div className="relative rounded-full h-3 w-3 bg-emerald-500"></div>
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-[10px] font-black uppercase tracking-widest text-emerald-500 truncate`}>Verified Status</p>
                                        <p className={`text-[9px] font-bold opacity-60 text-emerald-500/70 truncate`}>Secured via {user?.provider?.split('.')[0] || "Authentication"}</p>
                                    </div>
                                </div>
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 flex-shrink-0">
                                    <Sparkles size={14} />
                                </div>
                            </div>

                             <div className="space-y-2 mb-8 opacity-60">
                                 <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">Email Address</label>
                                 <div className={`${inputContainer} border-transparent bg-transparent`}>
                                     <Mail size={16} className="ml-3 opacity-30 flex-shrink-0" />
                                     <input value={user?.email || ""} readOnly className={inputCls} />
                                     <span className="px-3 text-[10px] font-black text-pink-500 uppercase tracking-widest flex-shrink-0">Linked</span>
                                 </div>
                             </div>

                            <div className="pt-4 border-t border-white/5 space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 opacity-60 ml-1 mb-4">Danger Zone</p>

                                <div className="flex flex-col gap-3">
                                    <button onClick={() => setShowDeactivateModal(true)} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${isDarkMode ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"}`}>
                                        <div className="text-left">
                                            <p className="text-sm font-bold">Deactivate Account</p>
                                            <p className="text-[10px] opacity-40">Temporarily hide your profile</p>
                                        </div>
                                        <ChevronLeft size={16} className="rotate-180 opacity-20" />
                                    </button>

                                    <button onClick={() => setShowDeleteModal(true)} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border-2 border-transparent hover:border-red-500/20 ${isDarkMode ? "bg-red-500/5 hover:bg-red-500/10" : "bg-red-50 hover:bg-red-100"}`}>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-red-500">Delete Account</p>
                                            <p className="text-[10px] text-red-400 opacity-60">Permanently erase all data</p>
                                        </div>
                                        <Trash2 size={16} className="text-red-400 opacity-40" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <p className="text-center text-[9px] font-bold opacity-20 uppercase tracking-[0.3em]">
                        Memefy AI v1.1.0 — Build 2026
                    </p>
                </div>
            </div>

            <AnimatePresence>
                {showDeactivateModal && (
                    <ConfirmModal
                        onClose={() => setShowDeactivateModal(false)}
                        onConfirm={handleDeactivate}
                        loading={actionLoading}
                        title="Deactivate Account?"
                        desc="Your profile will be hidden. You can reactivate by logging back in at any time."
                        icon="⏸️"
                        confirmText="Deactivate"
                        isDarkMode={isDarkMode}
                    />
                )}

                {showDeleteModal && (
                    <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className={`w-full max-w-sm rounded-[2.5rem] p-8 border ${isDarkMode ? "bg-slate-900 border-red-500/20 shadow-red-500/10 shadow-2xl" : "bg-white border-red-100 shadow-2xl"}`} initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                            <div className="text-center mb-6">
                                <div className="text-5xl mb-4">💀</div>
                                <h3 className="text-xl font-black uppercase italic gradient-text mb-2">Delete Account?</h3>
                                <p className="text-xs font-bold opacity-50 px-4 text-balanced">This action is permanent and cannot be undone. Enter password to confirm.</p>
                            </div>

                            {user?.provider === "password" && (
                                <div className="relative mb-6">
                                    <input
                                        type={showDeletePassword ? "text" : "password"}
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        placeholder="Enter Password"
                                        className={`w-full px-5 py-4 rounded-2xl border-2 text-center text-sm font-bold transition-all ${isDarkMode ? "bg-black/40 border-red-500/20 text-white focus:border-red-500" : "bg-red-50 border-red-100 text-red-900 focus:border-red-500"}`}
                                    />
                                    <button onClick={() => setShowDeletePassword(!showDeletePassword)} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30">
                                        {showDeletePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                <button onClick={handleDelete} disabled={actionLoading} className="w-full py-4 bg-red-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-red-500/20 active:scale-95 transition-all">
                                    {actionLoading ? <Loader2 size={16} className="animate-spin m-auto" /> : "Delete Permanently"}
                                </button>
                                <button onClick={() => setShowDeleteModal(false)} className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100`}>Cancel</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ConfirmModal = ({ onClose, onConfirm, loading, title, desc, icon, confirmText, isDarkMode }) => (
    <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div className={`w-full max-w-sm rounded-[2.5rem] p-8 border ${isDarkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-100 shadow-2xl"}`} initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}>
            <div className="text-center mb-8">
                <div className="text-5xl mb-4">{icon}</div>
                <h3 className="text-xl font-black uppercase italic gradient-text mb-2">{title}</h3>
                <p className="text-xs font-bold opacity-40 px-4 leading-relaxed">{desc}</p>
            </div>
            <div className="flex flex-col gap-3">
                <button onClick={onConfirm} disabled={loading} className="w-full py-4 bg-gradient-to-r from-pink-500 to-cyan-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-pink-500/20 active:scale-95 transition-all">
                    {loading ? <Loader2 size={16} className="animate-spin m-auto" /> : confirmText}
                </button>
                <button onClick={onClose} className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100`}>Cancel</button>
            </div>
        </motion.div>
    </motion.div>
);

export default Settings;
