# Memefy-AI

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-9-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

AI-powered meme generator with a custom-trained sentiment and toxicity model, real-time analytics, and a full-stack cloud deployment.

**[Live Demo](https://memefy-ai.netlify.app/)**

---

## Features

- **Custom AI Meme Generation** — FastAPI backend with a fine-tuned Gemini + logistic regression pipeline for captions, sentiment, and toxicity scoring
- **Template Library** — 100+ Imgflip templates proxied securely through the backend
- **Advanced Editor** — Live preview, multiple text fields, font/effect/position controls
- **Sentiment & Toxicity Analysis** — Every meme is scored and classified (Safe / Neutral / Risky)
- **Trend Tracking** — Template usage trends tracked in-memory per session
- **User Analytics Dashboard** — Personal stats: memes created, views, shares, toxicity average
- **Secure Authentication** — Email/password and Google Sign-In via Firebase Auth
- **Cloud Storage** — Meme records persisted in Firestore; large images fall back to localStorage
- **Dark / Light Mode** — Full theme support with glassmorphism UI

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS 3, Framer Motion |
| Backend | Python 3.11, FastAPI, Uvicorn |
| AI | Google Gemini 2.0 Flash, scikit-learn (TF-IDF + LogReg) |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Media Storage | Cloudinary (Avatar Management) |
| Meme Rendering | Imgflip API (proxied via backend) |

---

## Local Development

### Prerequisites

- Node.js 18+
- Python 3.11+
- Firebase project with Firestore and Auth enabled
- Imgflip account
- Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/singhalaadi/memefy-ai.git
cd memefy-ai
```

### 2. Backend setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt

# Copy and fill in environment variables
cp .env.example .env
# Edit .env with your Imgflip credentials and Gemini API key

uvicorn main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`

### 3. Frontend setup

```bash
cd frontend
npm install

# Copy and fill in environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase config and API keys

npm run dev
```

Frontend runs at `http://localhost:5173`

---

## Environment Variables

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase project API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase Analytics measurement ID |
| `VITE_GEMINI_API_KEY` | Google Gemini API key |
| `VITE_BACKEND_API_URL` | URL of the FastAPI backend |
| `VITE_CLOUDNARY_CLOUD_NAME` | Cloudinary cloud identifier |
| `VITE_CLOUDNARY_UPLOAD_PRESET` | Cloudinary unsigned upload preset name |

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `IMGFLIP_USERNAME` | Imgflip account username |
| `IMGFLIP_PASSWORD` | Imgflip account password |
| `GEMINI_API_KEY` | Google Gemini API key |
| `ALLOWED_ORIGINS` | Comma-separated allowed frontend URLs |

---


## Deployment

### Frontend (Netlify)

1.  **Connect Repo**: Import your repo from GitHub.
2.  **Build Settings**:
    *   **Base directory**: `frontend`
    *   **Build command**: `npm run build`
    *   **Publish directory**: `dist`
3.  **Environment Variables**: Add all `VITE_*` variables from `frontend/.env.example` to the Netlify dashboard. Set `VITE_BACKEND_API_URL` to your Render URL.

### Backend (Render)

1.  **New Web Service**: Connect your repo.
2.  **Build Settings**:
    *   **Root directory**: `backend`
    *   **Runtime**: `Python 3`
    *   **Build command**: `pip install -r requirements.txt`
    *   **Start command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3.  **Environment Variables**: Add all variables from `backend/.env.example`. 
    *   **`ALLOWED_ORIGINS`**: Set this to `http://localhost:5173,https://your-app.netlify.app`.

---

## Firebase Setup

### 1. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com) → **Create a project**
2. Enable Google Analytics (optional)

### 2. Enable Authentication

1. **Authentication** → **Sign-in method**
2. Enable **Email/Password** and **Google** providers
3. Add your domain to **Authorized domains**

### 3. Create Firestore Database

1. **Firestore Database** → **Create database**
2. Start in **production mode**
3. Choose a region close to your users

### 4. Get your config

1. **Project Settings** → **Your apps** → Web app (`</>`)
2. Register the app and copy the config into `frontend/.env.local`

### 5. Firestore Security Rules

Paste these rules in **Firestore → Rules**:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /memes/{document} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null
        && request.auth.uid == resource.data.user_id;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }
  }
}
```

### Firestore Collection Schema

```
memes/
  user_id         string    Firebase Auth UID
  template_id     string
  template_name   string
  image_url       string    Generated meme URL
  template_image  string    Template source URL
  caption         string    AI-generated or manual text
  sentiment       string    "Positive / Safe" | "Neutral / Sarcastic" | "Risky / Negative"
  toxicity_score  number    0.0 – 1.0
  trendy_score    number
  top_text        string
  bottom_text     string
  views           number
  shares          number
  likes           number
  createdAt       timestamp

users/
  name            string
  username        string    Unique handle (60-day cooldown)
  email           string
  avatar          string    Cloudinary URL
  createdAt       timestamp
  provider        string    "google.com" | "password"
  deactivated     boolean
  lastUsernameChange timestamp
```

---

## Project Structure

```
memefy-ai/
├── backend/
│   ├── artifacts/          # Trained ML model files (.joblib)
│   ├── main.py             # FastAPI app, routes, Gemini integration
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React contexts (Auth, Theme)
│   │   ├── hooks/          # Custom hooks (useMemes, useAnalytics)
│   │   ├── pages/          # Route-level page components
│   │   ├── services/       # API clients (memeAPI, firebaseAI)
│   │   └── config/         # Firebase initialization
│   ├── .env.example
│   └── vite.config.js
└── README.md
```

---

## Security Notes

- All API keys are loaded from environment variables — never hardcoded
- Firebase browser keys are public by design; restrict them via authorized domains in the Firebase Console
- Backend CORS is restricted to explicit allowed origins via `ALLOWED_ORIGINS`
- Firestore rules enforce that users can only modify their own documents

---

## License

MIT — see [LICENSE](LICENSE) for details.
