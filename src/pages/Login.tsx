import React, { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn, user } = useAuth()

  if (user) {
    return <Navigate to="/home" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await signIn(email, password)
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before signing in.')
        } else {
          setError(error.message)
        }
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col">
      <div
        className="flex-1 flex items-center justify-center bg-cover bg-center relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(15,23,42,0.95) 50%, rgba(0,0,0,0.85) 100%), url('https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1920&h=1080&q=80')`
        }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="absolute top-4 left-4 lg:top-8 lg:left-8 z-10">
          <Link to="/" className="flex items-center space-x-2 group">
            <img 
              src="/logo.svg" 
              alt="WeFlix" 
              className="h-12 lg:h-16 w-auto filter drop-shadow-lg group-hover:scale-105 transition-transform"
            />
          </Link>
        </div>

        <div className="relative z-10 bg-gradient-to-b from-gray-900/90 to-black/90 backdrop-blur-xl p-6 lg:p-8 xl:p-12 rounded-2xl lg:rounded-3xl shadow-2xl border border-gray-700/50 w-full max-w-md mx-4">
          <div className="text-center mb-6 lg:mb-8">
            <h1 className="text-white text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Welcome Back</h1>
            <p className="text-gray-400 text-sm lg:text-base">Sign in to continue your journey</p>
          </div>
          
          {error && (
            <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/50 text-red-300 p-4 rounded-xl mb-6 text-center backdrop-blur-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-gray-300 text-sm font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-300 hover:text-red-400 transition-colors" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 lg:pl-12 pr-4 py-3 lg:py-4 bg-gray-800/50 backdrop-blur-sm text-white rounded-xl border border-gray-600/50 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-300 text-sm lg:text-base"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-gray-300 text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-300 hover:text-red-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 lg:pl-12 pr-10 lg:pr-12 py-3 lg:py-4 bg-gray-800/50 backdrop-blur-sm text-white rounded-xl border border-gray-600/50 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-300 text-sm lg:text-base"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 lg:right-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 lg:h-5 lg:w-5" /> : <Eye className="h-4 w-4 lg:h-5 lg:w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 lg:py-4 rounded-xl font-semibold text-base lg:text-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] shadow-lg flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              {!loading && <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-6 lg:mt-8 text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-b from-gray-900/90 to-black/90 text-gray-400">New to WeFlix?</span>
              </div>
            </div>
            <Link 
              to="/signup" 
              className="block w-full bg-white/10 backdrop-blur-sm text-white py-2.5 lg:py-3 rounded-xl font-medium hover:bg-white/20 transition-all duration-300 border border-white/20 text-sm lg:text-base"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login