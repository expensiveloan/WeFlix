import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, session } = useAuth()

  if (loading) {
    return <LoadingSpinner variant="minimal" size="md" text="Authenticating..." />
  }

  // Check both user and session validity
  if (!user || !session) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute