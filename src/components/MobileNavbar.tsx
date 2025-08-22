import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Search, Film, Tv, Heart, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../hooks/useProfile'
import { getAvatarDisplay } from '../utils/avatarUtils'
import { supabase } from '../lib/supabase'

const MobileNavbar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut, user } = useAuth()
  const { profile } = useProfile()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [userAvatar, setUserAvatar] = useState('default')

  useEffect(() => {
    const loadUserAvatar = async () => {
      if (!user) return

      try {
        const { data } = await supabase
          .from('user_settings')
          .select('settings')
          .eq('user_id', user.id)
          .single()

        if (data?.settings?.avatar) {
          setUserAvatar(data.settings.avatar)
        }
      } catch {
        // Use default avatar if no settings found
      }
    }

    loadUserAvatar()
  }, [user])

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Film, label: 'Movies', path: '/movies' },
    { icon: Tv, label: 'TV', path: '/tv-shows' },
    { icon: Heart, label: 'List', path: '/my-list' }
  ]

  const handleNavigation = (path: string) => {
    setShowProfileMenu(false)
    navigate(path)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu)
  }

  return (
    <>
      {/* Profile Menu Overlay */}
      {showProfileMenu && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}

      {/* Profile Menu */}
      {showProfileMenu && (
        <div className="lg:hidden fixed bottom-20 left-4 right-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl border border-gray-700/50 backdrop-blur-xl z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-700/30">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 ${getAvatarDisplay(userAvatar).bg} rounded-full flex items-center justify-center`}>
                <span className="text-white font-bold">
                  {getAvatarDisplay(userAvatar).content}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {profile ? `${profile.first_name} ${profile.last_name}` : user?.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-xs text-gray-400">Premium Member</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                setShowProfileMenu(false)
                navigate('/settings')
              }}
              className="flex items-center w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-blue-700/10 transition-all duration-200"
            >
              <Settings className="w-5 h-5 text-blue-400 mr-3" />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">Settings</div>
                <div className="text-xs text-gray-500">Manage your account</div>
              </div>
            </button>
            
            <button
              onClick={() => {
                setShowProfileMenu(false)
                handleSignOut()
              }}
              className="flex items-center w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-red-600/10 hover:to-red-700/10 transition-all duration-200"
            >
              <LogOut className="w-5 h-5 text-red-400 mr-3" />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">Sign Out</div>
                <div className="text-xs text-gray-500">End your session</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-gray-900 to-gray-900/95 backdrop-blur-xl border-t border-gray-800/50 z-30">
        <div className="flex items-center justify-around px-2 py-3 pb-safe">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            
            return (
              <button
                key={index}
                onClick={() => handleNavigation(item.path)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 min-w-0 flex-1 ${
                  isActive 
                    ? 'text-red-400 bg-red-500/10 scale-105' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon 
                  className={`w-5 h-5 mb-1 transition-all duration-300 ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`} 
                />
                <span className={`text-xs font-medium transition-all duration-300 truncate ${
                  isActive ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {item.label}
                </span>
              </button>
            )
          })}
          
          {/* Profile Button */}
          <button
            onClick={toggleProfileMenu}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 min-w-0 flex-1 ${
              showProfileMenu 
                ? 'text-red-400 bg-red-500/10 scale-105' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className={`w-5 h-5 mb-1 ${getAvatarDisplay(userAvatar).bg} rounded-full flex items-center justify-center transition-all duration-300 ${
              showProfileMenu ? 'scale-110' : 'group-hover:scale-105'
            }`}>
              <span className="text-white text-xs font-bold">
                {getAvatarDisplay(userAvatar).content}
              </span>
            </div>
            <span className={`text-xs font-medium transition-all duration-300 truncate ${
              showProfileMenu ? 'text-red-400' : 'text-gray-400'
            }`}>
              Profile
            </span>
          </button>
        </div>
      </div>
    </>
  )
}

export default MobileNavbar
