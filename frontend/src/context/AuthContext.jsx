import { createContext, useContext, useEffect, useState, useRef } from "react";
import { auth } from "../config/firebase";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { db } from "../config/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
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

  // Hard Session Lock to stop the 700+ fetch loop
  const isEnriched = useRef(false);
  const currentUid = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // If it's a new user or we haven't enriched yet
        if (currentUid.current !== firebaseUser.uid) {
          isEnriched.current = false;
          currentUid.current = firebaseUser.uid;
        }

        if (!isEnriched.current) {
          isEnriched.current = true; // Lock immediately
          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            const firestoreData = userDoc.exists() ? userDoc.data() : {};
            
            setUser({
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              name: firestoreData.name || firebaseUser.displayName || "Meme Legend",
              email: firebaseUser.email,
              avatar: firestoreData.avatar || firebaseUser.photoURL || "👤",
              createdAt: firebaseUser.metadata.creationTime,
              provider: firebaseUser.providerData[0]?.providerId || 'password'
            });
          } catch (error) {
            console.error("Auth Enrichment Error:", error);
            // Fallback to basic firebase info if Firestore fails
            setUser({
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || "Meme Legend",
              email: firebaseUser.email,
              avatar: firebaseUser.photoURL || "👤",
            });
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
      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);
      
      // Sync Google user to Firestore
      const userRef = doc(db, "users", result.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: result.user.displayName,
          email: result.user.email,
          avatar: result.user.photoURL,
          createdAt: serverTimestamp(),
          provider: 'google.com'
        });
      }
      
      toast.success(`Welcome ${result.user.displayName}! 🎉`);
    } catch (error) {
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error("Authentication failed. Please try again.");
      }
    }
  };

  const signUpWithEmail = async (email, password, name) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      
      // Create Firestore user profile
      await setDoc(doc(db, "users", result.user.uid), {
        name: name,
        email: email,
        avatar: "👤",
        createdAt: serverTimestamp(),
        provider: 'password'
      });
      
      toast.success("Account created successfully! 🚀");
      return result.user;
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        toast.error("Email already in use. Try logging in!");
      } else {
        toast.error(error.message);
      }
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully! 👋");
      return result.user;
    } catch (error) {
      toast.error("Invalid email or password");
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
