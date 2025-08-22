import React from 'react'
import Sidebar from '../components/Sidebar'
import MobileNavbar from '../components/MobileNavbar'
import LoadingSpinner from '../components/LoadingSpinner'
import { useWatchlist } from '../hooks/useWatchlist'
import { useVideoPlayer } from '../contexts/VideoPlayerContext'
import { Trash2, Play, Info } from 'lucide-react'

const MyList: React.FC = () => {
  const { watchlist, loading, error, removeFromWatchlist } = useWatchlist()
  const { isVideoPlayerActive } = useVideoPlayer()

  if (loading) {
    return (
      <div className="bg-black min-h-screen">
        {!isVideoPlayerActive && <Sidebar />}
        <div className={`${isVideoPlayerActive ? '' : 'lg:ml-24'} flex items-center justify-center min-h-screen`}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black min-h-screen">
        {!isVideoPlayerActive && <Sidebar />}
        <div className={`${isVideoPlayerActive ? '' : 'lg:ml-24'} flex items-center justify-center min-h-screen`}>
          <div className="text-white text-center px-4">
            <h2 className="text-xl lg:text-2xl font-bold mb-4">Watchlist Unavailable</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            {error.includes('sign in') && (
              <button 
                onClick={() => window.location.href = '/auth'}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleRemoveFromWatchlist = async (itemId: number, mediaType: 'movie' | 'tv') => {
    try {
      await removeFromWatchlist(itemId, mediaType)
    } catch (err) {
      console.error('Failed to remove from watchlist:', err)
    }
  }

  return (
    <div className="bg-black min-h-screen">
      {!isVideoPlayerActive && <Sidebar />}
      <div className={`${isVideoPlayerActive ? '' : 'lg:ml-24'} p-4 lg:p-8 pb-20 lg:pb-8`}>
        <h1 className="text-white text-2xl lg:text-4xl font-bold mb-6 lg:mb-8">My List</h1>
        <div className="text-white/80 mb-6 lg:mb-8">
          <p className="text-sm lg:text-base">Your personal watchlist and favorites.</p>
        </div>

        {watchlist.length === 0 ? (
          <div className="text-center py-12 lg:py-16 px-4">
            <div className="text-gray-400 text-lg lg:text-xl mb-4">Your watchlist is empty</div>
            <div className="text-gray-500 mb-6 lg:mb-8 text-sm lg:text-base">Add movies and TV shows to your list to watch them later</div>
            <div className="text-gray-600 text-sm lg:text-base">Browse content and click the "+" button to add items to your list</div>
          </div>
        ) : (
          <>
            <div className="text-white mb-4 lg:mb-6">
              <span className="text-lg lg:text-xl">Your Watchlist</span>
              <span className="text-gray-400 ml-2 text-sm lg:text-base">({watchlist.length} items)</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-6">
              {watchlist.map((item) => (
                <div
                  key={`${item.media_id}-${item.media_type}`}
                  className="group relative cursor-pointer transition-transform hover:scale-105"
                >
                  <div className="relative overflow-hidden rounded-lg">
                    {item.poster_path ? (
                      <img
                        src={item.poster_path}
                        alt={item.title}
                        className="w-full h-60 sm:h-72 lg:h-80 object-cover"
                      />
                    ) : (
                      <div className="w-full h-60 sm:h-72 lg:h-80 bg-gray-700 flex items-center justify-center">
                        <Play className="h-8 w-8 lg:h-12 lg:w-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-80 transition-all duration-300 flex flex-col justify-between">
                      {/* Top actions */}
                      <div className="p-2 lg:p-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => handleRemoveFromWatchlist(item.media_id, item.media_type)}
                          className="bg-red-600 hover:bg-red-700 text-white p-1.5 lg:p-2 rounded-full transition-colors"
                          title="Remove from watchlist"
                        >
                          <Trash2 className="h-3 w-3 lg:h-4 lg:w-4" />
                        </button>
                      </div>
                      
                      {/* Bottom info */}
                      <div className="p-2 lg:p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="font-semibold text-xs lg:text-sm mb-1 lg:mb-2 line-clamp-2">{item.title}</div>
                        <div className="text-xs text-gray-300 mb-2 lg:mb-3 capitalize">
                          {item.media_type} • ⭐ {item.vote_average?.toFixed(1) || 'N/A'}
                        </div>
                        <div className="flex space-x-1 lg:space-x-2">
                          <button className="bg-white text-black px-2 lg:px-3 py-1 rounded text-xs font-medium hover:bg-gray-200 transition-colors flex items-center">
                            <Play className="h-2 w-2 lg:h-3 lg:w-3 mr-1" />
                            <span className="hidden sm:inline">Play</span>
                          </button>
                          <button className="bg-gray-600 text-white px-2 lg:px-3 py-1 rounded text-xs font-medium hover:bg-gray-500 transition-colors flex items-center">
                            <Info className="h-2 w-2 lg:h-3 lg:w-3 mr-1" />
                            <span className="hidden sm:inline">Info</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      <MobileNavbar />
    </div>
  )
}

export default MyList
