import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ErrorBoundary from './components/ErrorBoundary'
import ConfigurationStatus from './components/ConfigurationStatus'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Generator from './pages/Generator'
import Gallery from './pages/Gallery'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import './index.css'

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ConfigurationStatus />
        <AuthProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route 
                  path="/generator" 
                  element={
                    <ProtectedRoute>
                      <Generator />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </Layout>
          </Router>
        </AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
            },
          }}
        />
      </ThemeProvider>
    </ErrorBoundary>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)