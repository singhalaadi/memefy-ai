import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const FirebaseStatus = () => {
  const { isDarkMode } = useTheme();
  const [status, setStatus] = useState('checking');
  
  useEffect(() => {
    // Check Firebase configuration
    const hasFirebaseConfig = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    
    if (hasFirebaseConfig) {
      setStatus('connected');
    } else {
      setStatus('error');
    }
  }, []);

  if (status === 'checking' || status === 'error') {
    return null; // Don't show status if checking or config missing
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