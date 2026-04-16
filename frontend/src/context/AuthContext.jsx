import { createContext, useContext, useEffect, useState, useRef } from "react";
import { auth, db } from "../config/firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  deleteUser,
  reauthenticateWithPopup,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isEnriched = useRef(false);
  const currentUid = useRef(null);

  const buildUser = (firebaseUser, firestoreData = {}) => ({
    id: firebaseUser.uid,
    uid: firebaseUser.uid,
    name: firestoreData.name || firebaseUser.displayName || "Meme Legend",
    username: firestoreData.username || null,
    email: firebaseUser.email,
    avatar: firestoreData.avatar || firebaseUser.photoURL || null,
    createdAt: firebaseUser.metadata.creationTime,
    provider: firebaseUser.providerData[0]?.providerId || "password",
    lastUsernameChange: firestoreData.lastUsernameChange || null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (currentUid.current !== firebaseUser.uid) {
          isEnriched.current = false;
          currentUid.current = firebaseUser.uid;
        }

        if (!isEnriched.current) {
          isEnriched.current = true;
          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            const firestoreData = userDoc.exists() ? userDoc.data() : {};
            setUser(buildUser(firebaseUser, firestoreData));
          } catch (error) {
            setUser(buildUser(firebaseUser));
          } finally {
            setLoading(false);
          }
        }
      } else {
        isEnriched.current = false;
        currentUid.current = null;
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);

      const userRef = doc(db, "users", result.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const autoUsername = result.user.displayName
          ?.toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, "")
          .slice(0, 20) + "_" + Math.floor(Math.random() * 1000);

        await setDoc(userRef, {
          name: result.user.displayName,
          username: autoUsername,
          avatar: result.user.photoURL,
          createdAt: serverTimestamp(),
          provider: "google.com",
          lastUsernameChange: null,
        });
      }

      toast.success(`Welcome ${result.user.displayName?.split(" ")[0]}!`);
    } catch (error) {
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error("Authentication failed. Please try again.");
      }
    }
  };

  const signUpWithEmail = async (email, password, name, username) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });

      const cleanUsername = username
        ?.toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 20);

      await setDoc(doc(db, "users", result.user.uid), {
        name,
        username: cleanUsername || null,
        avatar: null,
        createdAt: serverTimestamp(),
        provider: "password",
        lastUsernameChange: null,
      });

      toast.success("Account created successfully!");
      return result.user;
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email already in use. Please try logging in.");
      } else {
        toast.error(error.message);
      }
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success("Successfully logged in.");
      return result.user;
    } catch (error) {
      toast.error("Invalid email or password.");
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      isEnriched.current = false;
      currentUid.current = null;
      setUser(null);
      toast.success("Successfully logged out.");
    } catch (error) {
      toast.error("Error signing out.");
    }
  };

  const updateUserProfile = async (updates) => {
    if (!user) throw new Error("Not authenticated");
    const userRef = doc(db, "users", user.uid);

    if (updates.username && updates.username !== user.username) {
      if (user.lastUsernameChange) {
        const lastChange = user.lastUsernameChange.toDate
          ? user.lastUsernameChange.toDate()
          : new Date(user.lastUsernameChange);
        const daysSince = (Date.now() - lastChange.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince < 60) {
          const daysLeft = Math.ceil(60 - daysSince);
          toast.error(`Username can be changed again in ${daysLeft} days.`);
          throw new Error("Username cooldown active");
        }
      }
      updates.lastUsernameChange = serverTimestamp();
    }

    if (updates.username) {
      updates.username = updates.username
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 20);
    }

    if (updates.name && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: updates.name });
    }

    await updateDoc(userRef, updates);

    setUser((prev) => ({
      ...prev,
      ...updates,
      lastUsernameChange: updates.lastUsernameChange ? new Date() : prev.lastUsernameChange,
    }));

    toast.success("Profile updated successfully.");
  };

  const deactivateAccount = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { deactivated: true, deactivatedAt: serverTimestamp() });
      await firebaseSignOut(auth);
      isEnriched.current = false;
      currentUid.current = null;
      setUser(null);
      toast.success("Account deactivated.");
    } catch (err) {
      toast.error("Failed to deactivate account.");
      throw err;
    }
  };

  const deleteAccount = async (password) => {
    if (!user || !auth.currentUser) throw new Error("Not authenticated");
    try {
      if (user.provider === "password") {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(auth.currentUser, credential);
      } else {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(auth.currentUser, provider);
      }

      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(auth.currentUser);

      isEnriched.current = false;
      currentUid.current = null;
      setUser(null);
      toast.success("Account permanently deleted.");
    } catch (err) {
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        toast.error("Incorrect password. Please try again.");
      } else if (err.code === "auth/too-many-requests") {
        toast.error("Too many attempts. Please try again later.");
      } else {
        toast.error("Account deletion failed.");
      }
      throw err;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    signOut,
    updateUserProfile,
    deactivateAccount,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
