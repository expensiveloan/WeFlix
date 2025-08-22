import React from 'react'

interface SkeletonLoaderProps {
  type?: 'card' | 'hero' | 'row'
  count?: number
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type = 'card', count = 6 }) => {
  if (type === 'hero') {
    return (
      <div className="relative h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
        {/* Background Skeleton */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700 animate-pulse"></div>
        
        {/* Content Skeleton */}
        <div className="relative z-10 flex items-center h-full pl-20">
          <div className="max-w-lg space-y-6">
            {/* Badge Skeleton */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-600 rounded-full animate-pulse"></div>
              <div className="w-24 h-4 bg-gray-600 rounded animate-pulse"></div>
            </div>
            
            {/* Title Skeleton */}
            <div className="space-y-3">
              <div className="w-96 h-12 bg-gray-600 rounded animate-pulse"></div>
              <div className="w-80 h-12 bg-gray-600 rounded animate-pulse"></div>
            </div>
            
            {/* Rating Skeleton */}
            <div className="flex items-center space-x-4">
              <div className="w-20 h-8 bg-yellow-600 rounded-full animate-pulse"></div>
              <div className="w-32 h-6 bg-gray-600 rounded animate-pulse"></div>
            </div>
            
            {/* Buttons Skeleton */}
            <div className="flex space-x-4">
              <div className="w-32 h-12 bg-red-600 rounded-xl animate-pulse"></div>
              <div className="w-28 h-12 bg-gray-600 rounded-xl animate-pulse"></div>
              <div className="w-28 h-12 bg-gray-600 rounded-xl animate-pulse"></div>
            </div>
            
            {/* Description Skeleton */}
            <div className="space-y-2">
              <div className="w-full h-4 bg-gray-600 rounded animate-pulse"></div>
              <div className="w-5/6 h-4 bg-gray-600 rounded animate-pulse"></div>
              <div className="w-4/5 h-4 bg-gray-600 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'row') {
    return (
      <div className="mb-12">
        {/* Title Skeleton */}
        <div className="w-48 h-8 bg-gray-600 rounded mb-6 px-4 sm:px-6 lg:px-8 animate-pulse"></div>
        
        {/* Cards Row Skeleton */}
        <div className="flex space-x-3 px-4 sm:px-6 lg:px-8 pb-4">
          {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="flex-none w-52">
              <div className="relative rounded-2xl overflow-hidden bg-gray-800 animate-pulse">
                <div className="w-full h-80 bg-gray-700"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                  <div className="w-3/4 h-4 bg-gray-600 rounded"></div>
                  <div className="w-1/2 h-3 bg-gray-600 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Default card skeleton
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="relative rounded-2xl overflow-hidden bg-gray-800 animate-pulse">
          <div className="w-full h-80 bg-gray-700"></div>
          <div className="p-4 space-y-2">
            <div className="w-3/4 h-4 bg-gray-600 rounded"></div>
            <div className="w-1/2 h-3 bg-gray-600 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default SkeletonLoader
