import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../hooks/useProfile'
import { getAvatarDisplay } from '../utils/avatarUtils'
import { supabase } from '../lib/supabase'
import { useRoutePrefetch } from '../hooks/useRoutePrefetch'
import logo from '../assets/logo.svg'
import searchIcon from '../assets/search.png'
import homeIcon from '../assets/home.png'
import moviesIcon from '../assets/movies.png'
import tvShowsIcon from '../assets/tv-shows.png'
import trendingIcon from '../assets/trending.png'
import wishlistIcon from '../assets/wishlist.png'

const Sidebar: React.FC = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut, user } = useAuth()
  const { profile } = useProfile()
  const { handleLinkHover, handleLinkFocus } = useRoutePrefetch()

  useEffect(() => {
    const loadUserAvatar = async () => {
      if (!user) {
        return
      }

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
      }
    }

    // Listen for avatar changes across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'avatar_updated' && e.newValue) {
        loadUserAvatar()
      }
    }
    
    const handleAvatarUpdate = () => {
      loadUserAvatar()
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('avatar_updated', handleAvatarUpdate)

    loadUserAvatar()

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('avatar_updated', handleAvatarUpdate)
    }
  }, [user])

  const menuItems = [
    { icon: searchIcon, label: 'Search', path: '/search' },
    { icon: homeIcon, label: 'Home', path: '/home' },
    { icon: moviesIcon, label: 'Movies', path: '/movies' },
    { icon: tvShowsIcon, label: 'TV Shows', path: '/tv-shows' },
    { icon: trendingIcon, label: 'Trending', path: '/trending' },
    { icon: wishlistIcon, label: 'My List', path: '/my-list' }
  ]

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu)
  }

  return (
    <div 
      className={`fixed left-0 top-0 h-full z-40 hidden lg:block`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className={`h-full bg-gradient-to-b from-gray-900 via-black to-gray-900 backdrop-blur-xl flex flex-col items-start py-6 transition-all duration-500 border-r border-gray-800/50 shadow-2xl ${isExpanded ? 'w-72' : 'w-24'}`}>
        {/* Enhanced Logo */}
        <div className="mb-12 px-4 w-full">
          <div className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} transition-all duration-500`}>
            <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'w-auto' : 'w-12 h-12'}`}>
              <img 
                src={isExpanded ? logo : '/logo2.png'} 
                alt="WeFlix Logo" 
                className={`transition-all duration-500 ${
                  isExpanded 
                    ? 'h-16 w-auto object-contain' 
                    : 'h-12 w-12 object-contain'
                }`}
              />
            </div>
          </div>
        </div>
        
        {/* Menu Items - Centered between logo and user */}
        <nav className="flex-1 flex flex-col justify-center w-full px-3">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path} className="w-full">
                <button
                  onClick={() => navigate(item.path)}
                  onMouseEnter={() => handleLinkHover(item.path)}
                  onFocus={() => handleLinkFocus(item.path)}
                  className={`w-full flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} px-4 py-4 rounded-2xl transition-all duration-300 ${
                    location.pathname === item.path
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <img 
                    src={item.icon} 
                    alt={item.label}
                    className="w-8 h-8 opacity-80 hover:opacity-100 transition-opacity duration-300"
                  />
                  <span className={`font-medium transition-all duration-500 ${isExpanded ? 'opacity-100 translate-x-0 w-auto ml-4' : 'opacity-0 -translate-x-4 w-0'} overflow-hidden whitespace-nowrap`}>
                    {item.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Profile Section - Footer */}
        <div className="mt-auto w-full relative px-3">
          <div className="border-t border-gray-700 pt-4">
            <button
              onClick={toggleProfileMenu}
              className={`flex items-center w-full px-3 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                showProfileMenu 
                  ? 'bg-gradient-to-r from-red-600/20 to-red-700/20 text-white border border-red-500/30 shadow-lg shadow-red-500/10' 
                  : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 hover:shadow-lg'
              }`}
            >
              <div className={`w-12 h-12 rounded-full overflow-hidden transition-all duration-300 border border-white/20 ${
                userAvatar ? (
                  showProfileMenu 
                    ? `${getAvatarDisplay(userAvatar).shadow} scale-110 ring-2 ring-white/30` 
                    : `${getAvatarDisplay(userAvatar).shadow} hover:scale-105 hover:ring-2 hover:ring-white/20`
                ) : 'bg-gray-600 animate-pulse'
              }`}>
                {userAvatar ? (
                  <img 
                    src={getAvatarDisplay(userAvatar).image} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              
              {/* User Info - shows when expanded */}
              <div className={`ml-3 transition-all duration-300 min-w-0 flex-1 ${isExpanded ? 'opacity-100 translate-x-0 w-auto' : 'opacity-0 -translate-x-4 w-0'} overflow-hidden`}>
                <div className="text-sm font-semibold text-white truncate whitespace-nowrap">
                  {profile ? `${profile.first_name} ${profile.last_name}` : user?.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap">Premium Member</div>
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && userAvatar && (
              <div className="absolute bottom-full mb-3 left-3 right-3 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl border border-gray-700/50 backdrop-blur-xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-700/30">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${getAvatarDisplay(userAvatar).shadow} rounded-full overflow-hidden border-2 border-white/20`}>
                      <img 
                        src={getAvatarDisplay(userAvatar).image} 
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
                    className="flex items-center w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/10 hover:to-blue-700/10 transition-all duration-200 group"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-600/20 to-blue-700/20 rounded-lg flex items-center justify-center mr-3 group-hover:from-blue-500/30 group-hover:to-blue-600/30 transition-all duration-200">
                      <Settings size={18} className="text-blue-400 group-hover:text-blue-300" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">Account Settings</div>
                      <div className="text-xs text-gray-500">Manage your profile</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowProfileMenu(false)
                      handleSignOut()
                    }}
                    className="flex items-center w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-red-600/10 hover:to-red-700/10 transition-all duration-200 group"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-red-600/20 to-red-700/20 rounded-lg flex items-center justify-center mr-3 group-hover:from-red-500/30 group-hover:to-red-600/30 transition-all duration-200">
                      <LogOut size={18} className="text-red-400 group-hover:text-red-300" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">Sign Out</div>
                      <div className="text-xs text-gray-500">End your session</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
