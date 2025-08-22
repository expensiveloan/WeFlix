import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
  variant?: 'default' | 'minimal' | 'dots' | 'pulse'
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  fullScreen = true,
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  }

  const containerClass = fullScreen 
    ? "min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 flex items-center justify-center backdrop-blur-sm"
    : "flex items-center justify-center p-6"

  const renderSpinner = () => {
    switch (variant) {
      case 'minimal':
        return (
          <div className="relative">
            <div className={`${sizeClasses[size]} border-2 border-gray-800 border-t-red-500 rounded-full animate-spin`}
                 style={{ animationDuration: '1s' }}></div>
          </div>
        )

      case 'dots':
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse"
                style={{ 
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.4s'
                }}
              ></div>
            ))}
          </div>
        )

      case 'pulse':
        return (
          <div className="relative">
            <div className={`${sizeClasses[size]} bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse opacity-75`}></div>
            <div className={`absolute inset-2 bg-gradient-to-r from-red-400 to-red-500 rounded-full animate-pulse`}
                 style={{ animationDelay: '0.5s' }}></div>
          </div>
        )

      default:
        return (
          <div className="relative">
            {/* Outer glow ring */}
            <div className={`absolute -inset-2 bg-gradient-to-r from-red-600/20 to-red-400/20 rounded-full blur-md animate-pulse`}></div>
            
            {/* Main spinner */}
            <div className={`relative ${sizeClasses[size]} rounded-full bg-gradient-to-r from-gray-900 to-black border border-gray-800/50 flex items-center justify-center overflow-hidden`}>
              {/* Rotating gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/30 to-transparent animate-spin"
                   style={{ animationDuration: '1.5s' }}></div>
              
              {/* Inner circle */}
              <div className="relative w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            
            {/* Orbiting dots */}
            <div className={`absolute inset-0 ${sizeClasses[size]} animate-spin`} style={{ animationDuration: '3s' }}>
              <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-red-400 rounded-full transform -translate-x-1/2 shadow-sm shadow-red-400/50"></div>
              <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-red-300 rounded-full transform -translate-x-1/2 shadow-sm shadow-red-300/50"></div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center space-y-8">
        {/* Modern Spinner */}
        <div className="relative flex items-center justify-center">
          {renderSpinner()}
        </div>

        {/* Loading Text with Typewriter Effect */}
        {text && (
          <div className="text-center space-y-3">
            <div className={`text-white font-medium ${textSizes[size]} tracking-wide`}>
              <span className="inline-block">
                {text}
                <span className="inline-block w-0.5 h-5 bg-red-500 ml-1 animate-pulse"></span>
              </span>
            </div>
            
            {/* Progress indicator */}
            <div className="w-32 h-0.5 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        )}

        {/* WeFlix Branding - Enhanced */}
        {fullScreen && (
          <div className="absolute bottom-8 flex items-center space-x-3 opacity-60 hover:opacity-80 transition-opacity duration-300">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-xl">W</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-red-400/20 rounded-xl blur-sm -z-10"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg tracking-tight">WeFlix</span>
              <span className="text-red-400 text-xs tracking-wider uppercase">Premium</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoadingSpinner