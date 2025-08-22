import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useVideoPlayer } from '../contexts/VideoPlayerContext'

interface VideoPlayerProps {
  src: string
  title: string
  onClose: () => void
  contentType?: 'movie' | 'tv'
  seasonNumber?: number
  episodeNumber?: number
  tmdbId?: number
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, title, onClose, contentType = 'movie', seasonNumber = 1, episodeNumber = 1, tmdbId }) => {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [sourceIndex, setSourceIndex] = useState(0)
  
  const { setVideoPlayerActive } = useVideoPlayer()

  // Use provided TMDB ID or extract from URL as fallback
  const contentId = tmdbId ? tmdbId.toString() : (() => {
    const match = src.match(/\/(\d+)/) || src.match(/tmdb=(\d+)/)
    return match ? match[1] : '550' // fallback to Fight Club ID
  })()

  // Optimized streaming sources - Ad-free parameters added where possible
  const streamingSources = React.useMemo(() => {
    if (contentType === 'tv') {
      return [
        `https://www.2embed.cc/embedtv/${contentId}&s=${seasonNumber}&e=${episodeNumber}&ads=false`,
        `https://player.smashy.stream/tv/${contentId}?s=${seasonNumber}&e=${episodeNumber}&ads=0`,
        `https://vidsrc.me/embed/tv?tmdb=${contentId}&season=${seasonNumber}&episode=${episodeNumber}&ads=false`,
        `https://autoembed.cc/tv/tmdb/${contentId}?s=${seasonNumber}&e=${episodeNumber}&ads=0`,
        `https://embedder.net/e/tv?tmdb=${contentId}&s=${seasonNumber}&e=${episodeNumber}&noads=1`
      ]
    } else {
      return [
        `https://www.2embed.cc/embed/${contentId}?ads=false`,
        `https://player.smashy.stream/movie/${contentId}?ads=0`,
        `https://moviesapi.club/movie/${contentId}?ads=false`,
        `https://vidsrc.me/embed/movie?tmdb=${contentId}&ads=false`,
        `https://autoembed.cc/movie/tmdb/${contentId}?ads=0`,
        `https://embedder.net/e/movie?tmdb=${contentId}&noads=1`
      ]
    }
  }, [contentId, contentType, seasonNumber, episodeNumber])

  useEffect(() => {
    setCurrentSrc(streamingSources[sourceIndex])
  }, [streamingSources, sourceIndex])

  useEffect(() => {
    setVideoPlayerActive(true)
    return () => setVideoPlayerActive(false)
  }, [setVideoPlayerActive])

  const handleClose = () => {
    setVideoPlayerActive(false)
    onClose()
  }

  const handleSourceError = () => {
    if (sourceIndex < streamingSources.length - 1) {
      setSourceIndex(sourceIndex + 1)
    }
  }

  const handleSourceChange = (index: number) => {
    setSourceIndex(index)
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header with close button */}
      <div className="flex justify-between items-center p-4 bg-black/80">
        <h2 className="text-white text-xl font-semibold">{title}</h2>
        <div className="flex items-center space-x-4">
          {/* Source selector */}
          <select 
            value={sourceIndex} 
            onChange={(e) => handleSourceChange(parseInt(e.target.value))}
            className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
          >
            {streamingSources.map((_, index) => (
              <option key={index} value={index}>
                Source {index + 1}
              </option>
            ))}
          </select>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Video iframe */}
      <div className="flex-1">
        <iframe
          src={currentSrc}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
          onError={handleSourceError}
          title={title}
        />
      </div>
    </div>
  )
}

export default VideoPlayer
