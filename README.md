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

## Testing

Memefy-AI includes comprehensive test coverage for both frontend and backend. All tests run automatically via GitHub Actions on every push to `main` and `develop` branches.

### Backend Testing (Python / pytest)

Tests verify:
- **Toxicity & Sentiment Classification** — SafetyCheck function, calibration heuristics
- **API Endpoints** — /generate-meme, /templates, health checks
- **Caption Generation** — Gemini integration, fallback behavior
- **Error Handling** — Graceful degradation, invalid inputs
- **Template Trending** — Trend detection, usage tracking

#### Running Backend Tests Locally

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install test dependencies
pip install pytest pytest-cov pytest-asyncio httpx

# Run all tests
pytest tests/ -v

# Run with coverage report
pytest tests/ -v --cov=. --cov-report=html
# Open htmlcov/index.html to view coverage

# Run specific test file
pytest tests/test_safety.py -v

# Run tests matching a pattern
pytest tests/ -k "safe" -v
```

**Test Files:**
- `tests/test_safety.py` — Safety/sentiment functions (unit tests)
- `tests/test_endpoints.py` — FastAPI routes (integration tests)
- `tests/conftest.py` — Shared fixtures (mocks, sample data)

**Coverage Target:** 70%+ on core functions

---

### Frontend Testing (React / Vitest)

Tests verify:
- **Component Rendering** — Generator, Gallery, Profile pages
- **API Integration** — memeAPI service calls, error handling
- **Custom Hooks** — useMemes, useAnalytics state management
- **User Interactions** — Button clicks, form submissions
- **Firebase Auth Flow** — Login, logout, protected routes

#### Running Frontend Tests Locally

```bash
cd frontend

# Install test dependencies (already in package.json)
npm install

# Run all tests
npm run test

# Run tests in watch mode (re-run on file changes)
npm run test -- --watch

# Run with UI dashboard
npm run test:ui

# Generate coverage report
npm run test:coverage
# Open coverage/index.html to view HTML report
```

**Test Files:**
- `src/__tests__/services/memeAPI.test.js` — API service mocking
- `src/__tests__/components/Profile.test.jsx` — Component rendering
- `src/__tests__/pages/Generator.test.jsx` — Page-level tests
- `src/__tests__/hooks/useMemes.test.js` — Custom hooks
- `src/__tests__/setup.js` — Test environment configuration

**Coverage Target:** 60%+ on components and utilities

---

### Continuous Integration (GitHub Actions)

Tests run automatically on every push with the workflow defined in `.github/workflows/test-and-deploy.yml`.

**Workflow Steps:**
1. **Backend Tests** — Pytest with coverage reporting
2. **Frontend Tests** — Vitest with coverage reporting
3. **Coverage Upload** — Send results to Codecov
4. **Build Verification** — Ensure no build errors before deploy
5. **Deployment Check** — Ready-to-deploy notification

**Example GitHub Actions Run:**
```
test-backend          [3m 12s]  — 48 tests passed, 72% coverage
test-frontend         [2m 45s]  — 32 tests passed, 65% coverage
⏭ build-backend         [skipped if tests fail]
⏭ build-frontend        [skipped if tests fail]
deploy-notification   All tests passed! Ready for deployment.
```

**Deploy Triggers:**
- Tests must **all pass** before code can be deployed
- Only `main` branch auto-deploys to Render (backend) & Netlify (frontend)
- `develop` branch runs tests but doesn't deploy

---

### Writing New Tests

#### Backend Test Template (pytest)

```python
import pytest
from unittest.mock import patch
from main import check_safety, sentiment_label

class TestSafetyFeatures:
    def test_safe_text(self):
        """Test that safe text returns correct label."""
        safe, prob = check_safety("I love this movie!")
        assert safe == True
        assert prob < 0.5

    @patch("main.tfidf")
    @patch("main.clf")
    def test_with_mocked_models(self, mock_clf, mock_tfidf):
        """Test with mocked ML models to speed up tests."""
        mock_tfidf.transform.return_value = [[0.2]]
        mock_clf.predict_proba.return_value = [[0.9, 0.1]]
        
        safe, prob = check_safety("Test text")
        assert safe == True
```

#### Frontend Test Template (Vitest)

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should handle user interactions', () => {
    const { getByRole } = render(<MyComponent />)
    fireEvent.click(getByRole('button'))
    // Assert expected behavior
  })
})
```

**Best Practices:**
- Mock external APIs (Firebase, Gemini, Imgflip)
- Test behavior, not implementation details
- Keep tests focused and isolated
- Use descriptive test names
- Aim for high coverage on critical paths

---

### Troubleshooting Tests

**Backend: "ModuleNotFoundError: No module named 'main'"**
```bash
cd backend
python -c "import sys; sys.path.insert(0, '.'); from main import app"
```

**Frontend: "Cannot find module '@testing-library/react'"**
```bash
cd frontend
npm install
npm run test
```

**Coverage Reports Not Generating**
```bash
# Backend
pytest tests/ --cov=. --cov-report=html

# Frontend
npm run test:coverage
```

**Tests Timeout**
- Increase timeout in `pytest.ini` or `vitest.config.js`
- Mock slow API calls
- Run with `--timeout=10000` (vitest in milliseconds)

---

## Project Structure

```
memefy-ai/
├── .github/
│   └── workflows/
│       └── test-and-deploy.yml    # CI/CD workflow
├── backend/
│   ├── artifacts/                  # Trained ML model files (.joblib)
│   ├── tests/                      # Pytest test files
│   │   ├── conftest.py             # Shared fixtures
│   │   ├── test_safety.py          # Unit tests for ML functions
│   │   └── test_endpoints.py       # API endpoint tests
│   ├── main.py                     # FastAPI app, routes, Gemini integration
│   ├── requirements.txt            # Python dependencies (includes pytest)
│   ├── pytest.ini                  # Pytest configuration
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── __tests__/              # Vitest test files
│   │   │   ├── setup.js            # Test environment setup
│   │   │   ├── components/         # Component tests
│   │   │   ├── hooks/              # Hook tests
│   │   │   ├── pages/              # Page tests
│   │   │   └── services/           # Service tests
│   │   ├── components/             # Reusable UI components
│   │   ├── context/                # React contexts (Auth, Theme)
│   │   ├── hooks/                  # Custom hooks (useMemes, useAnalytics)
│   │   ├── pages/                  # Route-level page components
│   │   ├── services/               # API clients (memeAPI, firebaseAI)
│   │   └── config/                 # Firebase initialization
│   ├── vitest.config.js            # Vitest configuration
│   ├── package.json                # Dependencies (includes vitest)
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
