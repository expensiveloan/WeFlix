import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, Menu, X, Search, User, Settings } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const Navbar: React.FC = () => {
  const { signOut, user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <nav className="fixed top-0 w-full bg-gradient-to-r from-black via-gray-900 to-black backdrop-blur-md z-50 border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-xl">W</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-black text-xl tracking-tight">WeFlix</span>
                <span className="text-red-400 text-xs tracking-wider uppercase">Premium</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link to="/home" className={`hover:text-red-400 transition-all duration-200 font-medium relative group ${
              location.pathname === '/home' ? 'text-white' : 'text-white/80'
            }`}>
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link to="/tv-shows" className={`hover:text-red-400 transition-all duration-200 font-medium relative group ${
              location.pathname === '/tv-shows' ? 'text-white' : 'text-white/80'
            }`}>
              TV Shows
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link to="/movies" className={`hover:text-red-400 transition-all duration-200 font-medium relative group ${
              location.pathname === '/movies' ? 'text-white' : 'text-white/80'
            }`}>
              Movies
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link to="/my-list" className={`hover:text-red-400 transition-all duration-200 font-medium relative group ${
              location.pathname === '/my-list' ? 'text-white' : 'text-white/80'
            }`}>
              My List
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all duration-200 group-hover:w-full"></span>
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <Link to="/search" className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
              <Search className="h-5 w-5" />
            </Link>
            
            {/* Settings Button */}
            <Link to="/settings" className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
              <Settings className="h-5 w-5" />
            </Link>

            {/* User Profile */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-full px-3 py-2 border border-white/10">
                <User className="h-4 w-4 text-white/80" />
                <span className="text-white text-sm font-medium truncate max-w-32">
                  {user?.email?.split('@')[0] || 'User'}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-white/80 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 group"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-gray-800">
            <div className="px-4 py-6 space-y-4">
              <Link to="/home" className="block text-white hover:text-red-400 transition-colors py-2 font-medium">
                Home
              </Link>
              <Link to="/tv-shows" className="block text-white/80 hover:text-red-400 transition-colors py-2 font-medium">
                TV Shows
              </Link>
              <Link to="/movies" className="block text-white/80 hover:text-red-400 transition-colors py-2 font-medium">
                Movies
              </Link>
              <Link to="/my-list" className="block text-white/80 hover:text-red-400 transition-colors py-2 font-medium">
                My List
              </Link>
              <Link to="/settings" className="block text-white/80 hover:text-red-400 transition-colors py-2 font-medium">
                Settings
              </Link>
              
              <div className="border-t border-gray-800 pt-4 mt-4">
                <div className="flex items-center space-x-3 mb-4">
                  <User className="h-5 w-5 text-white/80" />
                  <span className="text-white text-sm">{user?.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-3 text-red-400 hover:text-red-300 transition-colors py-2"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar