import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Mock the providers
vi.mock('../context/ThemeContext', () => ({
  ThemeProvider: ({ children }) => children,
  useTheme: () => ({
    isDark: false,
    toggleTheme: vi.fn(),
  }),
}))

vi.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    user: { uid: 'test-user', email: 'test@example.com' },
    loading: false,
    logout: vi.fn(),
    login: vi.fn(),
  }),
}))

export const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

export const renderWithAllProviders = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}
