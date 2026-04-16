import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const FirebaseStatus = () => {
  const { isDarkMode } = useTheme();
  const [status, setStatus] = useState('checking');
  
  useEffect(() => {
    // Check Firebase configuration
    const hasFirebaseConfig = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    const isDemoUser = localStorage.getItem('demoUser') === 'true';
    
    if (!hasFirebaseConfig || isDemoUser) {
      setStatus('demo');
    } else {
      setStatus('connected');
    }
  }, []);

  if (status === 'checking') {
    return null; // Don't show anything while checking
  }

  if (status === 'demo') {
    return (
      <div className={`fixed bottom-4 right-4 px-3 py-2 rounded-lg text-xs font-medium border ${
        isDarkMode 
          ? 'bg-yellow-900/50 border-yellow-600/50 text-yellow-300' 
          : 'bg-yellow-100 border-yellow-400 text-yellow-800'
      }`}>
        🎮 Demo Mode
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 px-3 py-2 rounded-lg text-xs font-medium border ${
      isDarkMode 
        ? 'bg-green-900/50 border-green-600/50 text-green-300' 
        : 'bg-green-100 border-green-400 text-green-800'
    }`}>
      ✅ Connected
    </div>
  );
};

export default FirebaseStatus;