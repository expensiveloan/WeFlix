import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { VideoPlayerProvider } from './contexts/VideoPlayerContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingSpinner from './components/LoadingSpinner'

// Lazy load pages for code splitting with preloading
const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/Login'))
const SignUp = lazy(() => import('./pages/SignUp'))
const Home = lazy(() => import('./pages/Home'))
const Movies = lazy(() => import('./pages/Movies'))
const TVShows = lazy(() => import('./pages/TVShows'))
const Search = lazy(() => import('./pages/Search'))
const Trending = lazy(() => import('./pages/Trending'))
const MyList = lazy(() => import('./pages/MyList'))
const Settings = lazy(() => import('./pages/Settings'))

// Preload critical routes after initial load
const preloadRoutes = () => {
  // Preload most commonly accessed routes
  import('./pages/Home')
  import('./pages/Movies')
  import('./pages/TVShows')
  import('./pages/Search')
}

// Start preloading after a short delay
setTimeout(preloadRoutes, 2000)

function App() {
  return (
    <AuthProvider>
      <VideoPlayerProvider>
        <Router>
          <Suspense fallback={<LoadingSpinner variant="minimal" size="md" text="Loading page..." />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route 
                path="/home" 
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/movies" 
                element={
                  <ProtectedRoute>
                    <Movies />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tv-shows" 
                element={
                  <ProtectedRoute>
                    <TVShows />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/search" 
                element={
                  <ProtectedRoute>
                    <Search />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/trending" 
                element={
                  <ProtectedRoute>
                    <Trending />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-list" 
                element={
                  <ProtectedRoute>
                    <MyList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </VideoPlayerProvider>
    </AuthProvider>
  )
}

export default App