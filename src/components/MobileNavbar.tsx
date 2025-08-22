import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Search, Film, Tv, TrendingUp, Heart } from 'lucide-react'

const MobileNavbar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Film, label: 'Movies', path: '/movies' },
    { icon: Tv, label: 'TV Shows', path: '/tv-shows' },
    { icon: TrendingUp, label: 'Trending', path: '/trending' },
    { icon: Heart, label: 'My List', path: '/my-list' }
  ]

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-gray-900 to-gray-900/95 backdrop-blur-xl border-t border-gray-800/50 z-50">
      <div className="flex items-center justify-around px-2 py-3 safe-area-pb">
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
      </div>
    </div>
  )
}

export default MobileNavbar
