import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../config/firebase";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import toast from "react-hot-toast";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const demoUser = localStorage.getItem("demoUser");
        if (demoUser) {
          try {
            const parsedDemoUser = JSON.parse(demoUser);
            setUser(parsedDemoUser);
            setLoading(false);
            return;
          } catch (error) {
            console.error('Error parsing demo user:', error);
            localStorage.removeItem("demoUser");
          }
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }
    }

    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          toast.success(`Welcome ${result.user.displayName}! 🎉`);
        }
      } catch (error) {
        console.error("Redirect result error:", error);
      }
    };

    checkRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log("Firebase user object:", firebaseUser);
        console.log("Photo URL:", firebaseUser.photoURL);
        
        const user = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || "Meme Master",
          email: firebaseUser.email,
          avatar: firebaseUser.photoURL || "👤",
          isPremium: false, 
          createdAt: firebaseUser.metadata.creationTime,
        };
        console.log("Processed user object:", user);
        setUser(user);

        localStorage.removeItem("demoUser");
      } else {
        const demoUser = localStorage.getItem("demoUser");
        if (!demoUser) {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      try {
        const result = await signInWithPopup(auth, provider);
        toast.success(`Welcome ${result.user.displayName}! 🎉`);
      } catch (popupError) {
        if (
          popupError.code === "auth/popup-blocked" ||
          popupError.code === "auth/popup-closed-by-user" ||
          popupError.message.includes("Cross-Origin-Opener-Policy")
        ) {
          toast.loading("Redirecting to Google...", { id: "google-redirect" });
          await signInWithRedirect(auth, provider);
        } else {
          throw popupError;
        }
      }
    } catch (error) {
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error("Authentication failed. Please try again.");
        console.error("Auth error:", error);
      }
    }
  };

  const signOut = async () => {

    const demoUser = localStorage.getItem("demoUser");
    if (demoUser) {
      localStorage.removeItem("demoUser");
      setUser(null);
      toast.success("Demo session ended! 👋");
      return;
    }

    try {
      await firebaseSignOut(auth);
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Error logging out");
      console.error("Sign out error:", error);
    }
  };

  const signInWithDemo = () => {
    const demoUser = {
      id: "demo-user-123",
      name: "Meme Master",
      email: "demo@memefy.ai",
      avatar: "🤖",
      isPremium: false,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("demoUser", JSON.stringify(demoUser));
    setUser(demoUser);
    toast.success("Welcome to Demo Mode! 🎮");
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithDemo,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
