import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Search, Tv, Heart, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../hooks/useProfile'
import { getAvatarDisplay } from '../utils/avatarUtils'
import { supabase } from '../lib/supabase'
import { useRoutePrefetch } from '../hooks/useRoutePrefetch'
import moviesIcon from '../assets/movies.png'

const MobileNavbar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut, user } = useAuth()
  const { profile } = useProfile()
  const { handleLinkHover, handleLinkFocus } = useRoutePrefetch()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [avatarLoaded, setAvatarLoaded] = useState(false)

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
        } else {
          setUserAvatar('default')
        }
      } catch {
        // Use default avatar if no settings found
        setUserAvatar('default')
      } finally {
        setAvatarLoaded(true)
      }
    }

    loadUserAvatar()

    // Listen for avatar changes across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'avatar_updated' && e.newValue) {
        loadUserAvatar()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom events within the same tab
    const handleAvatarUpdate = () => {
      loadUserAvatar()
    }
    
    window.addEventListener('avatar_updated', handleAvatarUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('avatar_updated', handleAvatarUpdate)
    }
  }, [user])

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: 'custom', label: 'Movies', path: '/movies', customIcon: moviesIcon },
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
              <div className={`w-10 h-10 ${getAvatarDisplay(userAvatar || 'default').shadow} rounded-full overflow-hidden border-2 border-white/20`}>
                <img 
                  src={getAvatarDisplay(userAvatar || 'default').image} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
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

      {/* Bottom Navigation - Enhanced Design */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black via-gray-900/98 to-gray-900/95 backdrop-blur-xl border-t border-gray-700/50 shadow-2xl">
        {/* Subtle top glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        
        {/* Navigation Content */}
        <div className="flex items-center justify-around px-2 py-3 pb-safe relative">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            
            return (
              <button
                key={index}
                onClick={() => handleNavigation(item.path)}
                onMouseEnter={() => handleLinkHover(item.path)}
                onFocus={() => handleLinkFocus(item.path)}
                className={`relative flex flex-col items-center justify-center py-3 px-2 min-w-0 flex-1 rounded-2xl transition-all duration-300 group ${
                  isActive ? 'bg-white/10 backdrop-blur-sm' : 'hover:bg-white/5'
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-1 w-1 h-1 bg-red-500 rounded-full shadow-lg shadow-red-500/50 animate-pulse"></div>
                )}
                
                {/* Icon container with glow effect */}
                <div className={`relative mb-1 transition-all duration-300 ${
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                }`}>
                  {/* Glow effect for active state */}
                  {isActive && (
                    <div className="absolute inset-0 bg-white/20 rounded-lg blur-md"></div>
                  )}
                  
                  {item.icon === 'custom' && item.customIcon ? (
                    <img 
                      src={item.customIcon} 
                      alt={item.label}
                      className={`relative w-6 h-6 transition-all duration-300 ${
                        isActive 
                          ? 'brightness-0 invert drop-shadow-lg' 
                          : 'opacity-60 group-hover:opacity-80'
                      }`}
                    />
                  ) : (
                    <Icon 
                      className={`relative w-6 h-6 transition-all duration-300 ${
                        isActive 
                          ? 'text-white drop-shadow-lg' 
                          : 'text-gray-400 group-hover:text-gray-300'
                      }`} 
                    />
                  )}
                </div>
                
                <span className={`text-xs font-medium transition-all duration-300 ${
                  isActive 
                    ? 'text-white drop-shadow-sm' 
                    : 'text-gray-400 group-hover:text-gray-300'
                }`}>
                  {item.label}
                </span>
              </button>
            )
          })}
          
          {/* Profile Button */}
          <button
            onClick={toggleProfileMenu}
            className={`relative flex flex-col items-center justify-center py-3 px-2 min-w-0 flex-1 rounded-2xl transition-all duration-300 group ${
              showProfileMenu ? 'bg-white/10 backdrop-blur-sm' : 'hover:bg-white/5'
            }`}
          >
            {/* Active indicator */}
            {showProfileMenu && (
              <div className="absolute -top-1 w-1 h-1 bg-red-500 rounded-full shadow-lg shadow-red-500/50 animate-pulse"></div>
            )}
            
            {/* Avatar container with glow effect */}
            <div className={`relative mb-1 transition-all duration-300 ${
              showProfileMenu ? 'scale-110' : 'group-hover:scale-105'
            }`}>
              {/* Glow effect for active state */}
              {showProfileMenu && (
                <div className="absolute inset-0 bg-white/20 rounded-full blur-md"></div>
              )}
              
              {!avatarLoaded ? (
                <div className="relative w-6 h-6 bg-gray-600 rounded-full animate-pulse"></div>
              ) : (
                <div className={`relative w-6 h-6 ${getAvatarDisplay(userAvatar || 'default').shadow} rounded-full overflow-hidden transition-all duration-300 ring-2 border border-white/20 ${
                  showProfileMenu 
                    ? 'ring-white/40 scale-110' 
                    : 'ring-transparent group-hover:ring-white/30 group-hover:scale-105'
                }`}>
                  <img 
                    src={getAvatarDisplay(userAvatar || 'default').image} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            
            <span className={`text-xs font-medium transition-all duration-300 ${
              showProfileMenu 
                ? 'text-white drop-shadow-sm' 
                : 'text-gray-400 group-hover:text-gray-300'
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
