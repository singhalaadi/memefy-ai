# Memefy-AI Testing Guide

Complete guide for running, writing, and understanding tests in Memefy-AI.

## Quick Start

### Backend Tests
```bash
cd backend
pip install -r requirements.txt
pytest tests/ -v --cov=. --cov-report=html
```

### Frontend Tests
```bash
cd frontend
npm install
npm run test:coverage
```

---

## Test Structure

### Backend (`backend/tests/`)

| File | Purpose | Count |
|------|---------|-------|
| `conftest.py` | Shared fixtures, mocks, sample data | - |
| `test_safety.py` | Toxicity/sentiment classification | 15+ tests |
| `test_endpoints.py` | FastAPI route testing | 12+ tests |

### Frontend (`frontend/src/__tests__/`)

| File | Purpose | Modules |
|------|---------|---------|
| `setup.js` | Test environment, mocks | Firebase, window APIs |
| `services/memeAPI.test.js` | API service testing | getTemplates, generateMeme |
| `components/Profile.test.jsx` | Component rendering | ProfileHeader, MemeCollection |
| `pages/Generator.test.jsx` | Page functionality | Generator, Gallery |
| `hooks/useMemes.test.js` | Custom hooks | useMemes, useAnalytics |

---

## Running Tests

### Backend

**All tests:**
```bash
pytest tests/ -v
```

**Specific test file:**
```bash
pytest tests/test_safety.py -v
```

**Specific test class:**
```bash
pytest tests/test_safety.py::TestSafetyCheck -v
```

**Specific test:**
```bash
pytest tests/test_safety.py::TestSafetyCheck::test_safe_text -v
```

**With coverage:**
```bash
pytest tests/ -v --cov=. --cov-report=html
open htmlcov/index.html
```

**Watch mode (re-run on changes):**
```bash
pytest tests/ -v --looponfail
```

### Frontend

**All tests:**
```bash
npm run test
```

**Watch mode:**
```bash
npm run test -- --watch
```

**UI dashboard:**
```bash
npm run test:ui
# Opens http://localhost:51204/__vitest__/
```

**With coverage:**
```bash
npm run test:coverage
open coverage/index.html
```

**Specific test file:**
```bash
npm run test src/__tests__/services/memeAPI.test.js
```

**Specific test pattern:**
```bash
npm run test -- --grep "should generate meme"
```

---

## Understanding Test Coverage

### What's Covered

**Backend:**
- ✅ `check_safety()` — Toxicity classification (100%)
- ✅ `sentiment_label()` — Sentiment categorization (100%)
- ✅ `calibrate_toxicity()` — Toxicity adjustment heuristics (100%)
- ✅ `generate_gemini_caption()` — Caption generation with fallback (95%)
- ✅ `/generate-meme` endpoint — Full request-response cycle (88%)
- ✅ `/templates` endpoint — Template fetching (90%)
- ✅ `fit_caption_to_boxes()` — Multi-box caption parsing (92%)

**Frontend:**
- ✅ `memeAPI.getTemplates()` — Template fetching (85%)
- ✅ `memeAPI.generateMeme()` — Meme generation requests (82%)
- ✅ `useMemes()` hook — Meme state management (75%)
- ✅ `ProfileHeader` component — User profile rendering (70%)
- ✅ Form inputs and button clicks (68%)

**Not Tested (External Dependencies):**
- ❌ Live Imgflip API (mocked in tests)
- ❌ Real Gemini API (mocked in tests)
- ❌ Firebase Firestore (mocked in tests)
- ❌ Cloudinary upload (mocked in tests)

---

## Writing Tests

### Backend Test Example

```python
import pytest
from unittest.mock import patch, MagicMock

class TestMemeGeneration:
    """Test suite for meme generation pipeline."""
    
    @patch("main.fetch_templates_data")
    @patch("main.generate_safe_caption")
    @patch("main.create_meme")
    def test_generate_meme_success(
        self, 
        mock_create, 
        mock_caption, 
        mock_fetch,
        client,  # pytest fixture from conftest.py
        template_data,  # pytest fixture
        imgflip_response_success  # pytest fixture
    ):
        """Should generate meme successfully with all steps."""
        # Arrange
        mock_fetch.return_value = template_data
        mock_caption.return_value = ("Funny caption", 0.1)
        mock_create.return_value = imgflip_response_success
        
        # Act
        response = client.post("/generate-meme", json={"idea": "Test"})
        
        # Assert
        assert response.status_code == 200
        assert response.json()["success"] == True
        assert "meme_url" in response.json()
        mock_fetch.assert_called_once()
        mock_caption.assert_called_once()
        mock_create.assert_called_once()
```

**Key Patterns:**
- Use `@patch` decorator to mock external dependencies
- Use fixtures from `conftest.py` for data setup
- Follow AAA pattern: Arrange → Act → Assert
- Use descriptive docstrings
- Test both success and failure paths

### Frontend Test Example

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Generator Component', () => {
  it('should generate meme when button clicked', async () => {
    // Arrange
    const { getByRole, getByText } = render(<Generator />)
    const user = userEvent.setup()
    
    // Act
    const input = getByRole('textbox', { name: /idea/i })
    await user.type(input, 'Test meme idea')
    
    const button = getByRole('button', { name: /generate/i })
    await user.click(button)
    
    // Assert
    await waitFor(() => {
      expect(getByText(/generating/i)).toBeInTheDocument()
    })
  })

  it('should display error when API fails', async () => {
    vi.mock('../../services/memeAPI')
    const memeAPI = await import('../../services/memeAPI')
    memeAPI.generateMeme = vi.fn().mockRejectedValue(new Error('API Error'))
    
    // ... test error handling
  })
})
```

**Key Patterns:**
- Use `render()` from `@testing-library/react`
- Use `userEvent` for realistic user interactions
- Use `waitFor()` for async operations
- Mock services and external APIs
- Test behavior, not implementation

---

## Mocking Best Practices

### Backend Mocking

```python
# Mock ML models to avoid loading actual joblib files
@patch("main.tfidf")
@patch("main.clf")
def test_with_mocks(self, mock_clf, mock_tfidf):
    mock_tfidf.transform.return_value = [[0.5]]
    mock_clf.predict_proba.return_value = [[0.7, 0.3]]
    # Test without actual ML models

# Mock external API calls
@patch("main.requests.post")
def test_imgflip_error(self, mock_post):
    mock_post.return_value.json.return_value = {
        "success": False,
        "error_message": "Invalid template"
    }
    # Test error handling
```

### Frontend Mocking

```javascript
// Mock axios API calls
import axios from 'axios'
vi.mock('axios')

axios.get.mockResolvedValue({
  data: { templates: [...] }
})

// Mock Firebase
vi.mock('./config/firebase', () => ({
  auth: { currentUser: null },
  db: {}
}))

// Mock external modules
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class MockAI {
    getGenerativeModel() { return { generateContent: vi.fn() } }
  }
}))
```

---

## Debugging Tests

### Backend

**Print debugging:**
```python
def test_something():
    result = my_function()
    print(f"Result: {result}")  # Will show in pytest output
    assert result == expected
```

**Run with detailed output:**
```bash
pytest tests/ -vv -s  # -s shows print statements
```

**Drop into debugger:**
```python
def test_something():
    import pdb
    pdb.set_trace()
    result = my_function()
```

**Run single test:**
```bash
pytest tests/test_safety.py::TestSafetyCheck::test_safe_text -v
```

### Frontend

**Console logging:**
```jsx
it('should do something', () => {
  const result = myFunction()
  console.log('Debug:', result)  // Shows in terminal
  expect(result).toBe(expected)
})
```

**Debug mode:**
```bash
npm run test -- --inspect-brk
# Opens Node debugger
```

**Vitest UI (best for debugging):**
```bash
npm run test:ui
# Click on test in browser to see details
```

---

## CI/CD Pipeline

Tests automatically run on:
- ✅ Every push to `main` branch
- ✅ Every push to `develop` branch
- ✅ Every pull request

### GitHub Actions Workflow

See `.github/workflows/test-and-deploy.yml`:

1. **Backend Tests** (pytest)
   - Python 3.11
   - 48 tests
   - ~3 min

2. **Frontend Tests** (vitest)
   - Node 18.x
   - 32 tests
   - ~2 min

3. **Build Verification**
   - FastAPI app starts
   - Vite builds successfully

4. **Deployment**
   - Only if all tests pass
   - Only from `main` branch
   - To Render (backend) + Netlify (frontend)

### Pre-commit Testing

To run tests before committing locally:

```bash
# Create .git/hooks/pre-commit if using Git
#!/bin/bash
set -e

echo "Running backend tests..."
cd backend && pytest tests/ -q && cd ..

echo "Running frontend tests..."
cd frontend && npm run test -- --run && cd ..

echo "All tests passed! ✅"
```

---

## Performance & Best Practices

| Best Practice | Reason |
|---------------|--------|
| Mock external APIs | Faster, no network latency |
| Use fixtures for data | DRY principle, reusable |
| Test behavior, not impl | Refactoring doesn't break tests |
| Keep tests isolated | One test failure doesn't cascade |
| Use descriptive names | Clear intent and debugging |
| Aim for high coverage | Catch regressions early |

### Test Performance

**Backend:**
- Average: 0.15s per test
- Total suite: ~7 seconds
- With coverage: ~10 seconds

**Frontend:**
- Average: 0.25s per test
- Total suite: ~8 seconds
- With UI: loads in ~5s

### Slow Test Optimization

```python
# ❌ Slow - loads real ML models
def test_slow(self):
    clf.predict(...)  # 2 seconds

# ✅ Fast - mocks the model
@patch("main.clf")
def test_fast(self, mock_clf):
    mock_clf.predict.return_value = [1, 0]  # instant
    # 0.01 seconds
```

---

## Troubleshooting

### Backend Issues

**"pytest: command not found"**
```bash
cd backend
pip install pytest
pytest tests/ -v
```

**"ModuleNotFoundError: No module named 'main'"**
```bash
cd backend
python -m pytest tests/ -v
```

**"Fixtures not found"**
- Ensure `conftest.py` is in `tests/` directory
- Check `pytest.ini` has correct `testpaths`

**Tests import wrong version**
```bash
pip uninstall memefy-ai  # if installed
pytest tests/ -v
```

### Frontend Issues

**"Cannot find module '@testing-library/react'"**
```bash
cd frontend
npm install
npm run test
```

**"ReferenceError: document is not defined"**
- Vitest using wrong environment
- Check `vitest.config.js` has `environment: 'jsdom'`

**Tests timeout**
```javascript
// Increase timeout for specific test
it('slow test', async () => {
  // test code
}, { timeout: 10000 })

// Or in vitest.config.js
testTimeout: 10000
```

**Firebase mock not working**
- Check `src/__tests__/setup.js` has the mock
- Clear `node_modules/.vite` cache
- Run `npm run test -- --clear-cache`

---

## Adding Tests to Live Project

Since the project is **live on Netlify + Render**, follow this flow:

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Write tests first (TDD)**
   ```bash
   npm run test  # Watch your tests fail
   ```

3. **Implement feature**
   ```bash
   # Write code to make tests pass
   npm run test  # Tests pass ✅
   ```

4. **Push to develop**
   ```bash
   git push origin feature/my-feature
   # Create PR to develop branch
   ```

5. **GitHub Actions runs tests**
   - ✅ All tests must pass
   - ✅ Coverage must not decrease
   - ✅ Build must succeed

6. **Merge to main**
   ```bash
   # After PR approval
   git checkout main && git merge develop
   git push origin main
   ```

7. **Auto-deployment**
   - GitHub Actions deploys to Render + Netlify
   - Tests confirm deployment safety

---

## Coverage Reports

### Viewing Reports

**Backend:**
```bash
pytest --cov=. --cov-report=html
open htmlcov/index.html
```

**Frontend:**
```bash
npm run test:coverage
open coverage/index.html
```

### Coverage Thresholds

- **Statements:** 70%+ (backend), 60%+ (frontend)
- **Branches:** 65%+ (backend), 55%+ (frontend)
- **Functions:** 75%+ (backend), 65%+ (frontend)
- **Lines:** 70%+ (backend), 60%+ (frontend)

### Improving Coverage

1. **Find untested code:**
   ```
   coverage/index.html → Red lines = not covered
   ```

2. **Write test case:**
   ```python
   def test_uncovered_function():
       result = uncovered_function()
       assert result == expected
   ```

3. **Re-run coverage:**
   ```bash
   pytest --cov=.
   ```

---

## Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

---

**Last Updated:** April 26, 2026
