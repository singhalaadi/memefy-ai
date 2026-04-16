import React, { useState } from "react";

const ConfigurationStatus = () => {
  const [isVisible, setIsVisible] = useState(true);
  const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const firebaseProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const firebaseAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;


  const isConfigured =
    firebaseApiKey &&
    firebaseProjectId &&
    firebaseAuthDomain &&
    firebaseApiKey !== "your-api-key-here" &&
    firebaseProjectId !== "your-project-id" &&
    firebaseApiKey.startsWith("AIza") &&
    firebaseAuthDomain.includes(".firebaseapp.com") &&
    firebaseProjectId.length > 5;

  if (isConfigured || !isVisible) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-40 md:left-1/4 md:right-1/4">
      <div className="glass border border-yellow-500/30 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="text-2xl animate-bounce">🔥</div>
          <div className="flex-1">
            <h3 className="text-yellow-100 font-semibold">
              Firebase Configuration Required
            </h3>
            <p className="text-yellow-200/80 text-sm mt-1">
              Running in demo mode. Configure Firebase for full features.
            </p>
            <details className="mt-2">
              <summary className="text-yellow-200 text-sm cursor-pointer hover:text-yellow-100 select-none">
                Show setup instructions
              </summary>
              <div className="mt-2 text-xs text-yellow-200/70 glass-dark rounded-lg p-3 space-y-2">
                <p>
                  1. Create a Firebase project at{" "}
                  <a
                    href="https://console.firebase.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-yellow-100"
                  >
                    console.firebase.google.com
                  </a>
                </p>
                <p>2. Enable Authentication and Firestore Database</p>
                <p>
                  3. Update your{" "}
                  <code className="bg-black/30 px-1 rounded font-mono">
                    .env
                  </code>{" "}
                  file with your Firebase config:
                </p>
                <pre className="text-xs bg-black/30 p-2 rounded font-mono overflow-x-auto">
                  {`VITE_FIREBASE_API_KEY=your-api-key
                    VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
                    VITE_FIREBASE_PROJECT_ID=your-project-id
                    VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
                    VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
                    VITE_FIREBASE_APP_ID=your-app-id`}
                </pre>
                <p>4. Restart the development server</p>
              </div>
            </details>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors text-yellow-200 hover:text-yellow-100"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationStatus;
