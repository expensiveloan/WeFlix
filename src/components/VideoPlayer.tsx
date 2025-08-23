import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useVideoPlayer } from '../contexts/VideoPlayerContext'
import { watchlistApi, movieApi, tvApi } from '../services/tmdb-direct'

interface VideoPlayerProps {
  src: string
  title: string
  onClose: () => void
  contentType?: 'movie' | 'tv'
  seasonNumber?: number
  episodeNumber?: number
  tmdbId?: number
}

interface Episode {
  id: number
  name: string
  episode_number: number
  season_number: number
  overview: string
  still_path: string | null
  air_date: string
  runtime: number | null
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, title, onClose, contentType = 'movie', seasonNumber = 1, episodeNumber = 1, tmdbId }) => {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [sourceIndex, setSourceIndex] = useState(0)
  const [currentSeasonNumber] = useState(seasonNumber)
  const [currentEpisodeNumber, setCurrentEpisodeNumber] = useState(episodeNumber)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loadingEpisodes, setLoadingEpisodes] = useState(false)
  
  const { setVideoPlayerActive } = useVideoPlayer()

  // Use provided TMDB ID or extract from URL as fallback
  const contentId = tmdbId ? tmdbId.toString() : (() => {
    const match = src.match(/\/(\d+)/) || src.match(/tmdb=(\d+)/)
    return match ? match[1] : '550' // fallback to Fight Club ID
  })()

  // Fetch episodes for TV shows
  useEffect(() => {
    const fetchEpisodes = async () => {
      if (contentType !== 'tv' || !tmdbId) return;
      
      setLoadingEpisodes(true);
      try {
        const seasonDetails = await tvApi.getSeasonDetails(tmdbId, currentSeasonNumber);
        setEpisodes(seasonDetails.episodes || []);
      } catch (error) {
        console.error('Failed to fetch episodes:', error);
        setEpisodes([]);
      } finally {
        setLoadingEpisodes(false);
      }
    };

    fetchEpisodes();
  }, [contentType, tmdbId, currentSeasonNumber]);

  // Add to watch history when video player opens
  useEffect(() => {
    const addToHistory = async () => {
      if (!tmdbId) return;
      
      try {
        // Use the already imported API services
        let posterPath = undefined;
        let backdropPath = undefined;
        let overview = undefined;
        let releaseDate = undefined;
        let voteAverage = 0;
        
        try {
          let details = null;
          if (contentType === 'movie') {
            details = await movieApi.getDetails(tmdbId);
          } else {
            details = await tvApi.getDetails(tmdbId);
          }
          
          if (details) {
            // Use the same posterPath format as other movie cards in the app
            posterPath = details.posterPath;
            backdropPath = details.backdropPath;
            overview = details.overview;
            releaseDate = details.releaseDate;
            voteAverage = details.voteAverage;
          }
        } catch (detailsError) {
          console.error('Failed to fetch details:', detailsError);
        }

        // Add to watch history with season/episode info for TV shows
        await watchlistApi.addToWatchHistory({
          media_id: tmdbId,
          media_type: contentType,
          title: title,
          poster_path: posterPath || undefined,
          backdrop_path: backdropPath || undefined,
          overview: overview,
          release_date: releaseDate,
          vote_average: voteAverage,
          season_number: contentType === 'tv' ? currentSeasonNumber : undefined,
          episode_number: contentType === 'tv' ? currentEpisodeNumber : undefined
        });
      } catch (error) {
        console.error('Failed to add to watch history:', error);
      }
    };

    addToHistory();
  }, [tmdbId, contentType, title, currentSeasonNumber, currentEpisodeNumber]);

  // Ad-blocked streaming sources with multiple ad-blocking parameters
  const streamingSources = React.useMemo(() => {
    if (contentType === 'tv') {
      return [
        `https://www.2embed.cc/embedtv/${contentId}&s=${currentSeasonNumber}&e=${currentEpisodeNumber}&ads=false&adblock=true&noad=1&noads=true&ad=0`,
        `https://player.smashy.stream/tv/${contentId}?s=${currentSeasonNumber}&e=${currentEpisodeNumber}&ads=0&adblock=1&noad=true&noads=1&ad=false`,
        `https://vidsrc.me/embed/tv?tmdb=${contentId}&season=${currentSeasonNumber}&episode=${currentEpisodeNumber}&ads=false&adblock=true&noad=1&noads=true`,
        `https://autoembed.cc/tv/tmdb/${contentId}?s=${currentSeasonNumber}&e=${currentEpisodeNumber}&ads=0&adblock=1&noad=true&noads=1&ad=false`,
        `https://embedder.net/e/tv?tmdb=${contentId}&s=${currentSeasonNumber}&e=${currentEpisodeNumber}&noads=1&adblock=true&noad=1&ads=false&ad=0`
      ]
    } else {
      return [
        `https://www.2embed.cc/embed/${contentId}?ads=false&adblock=true&noad=1&noads=true&ad=0`,
        `https://player.smashy.stream/movie/${contentId}?ads=0&adblock=1&noad=true&noads=1&ad=false`,
        `https://moviesapi.club/movie/${contentId}?ads=false&adblock=true&noad=1&noads=true&ad=0`,
        `https://vidsrc.me/embed/movie?tmdb=${contentId}&ads=false&adblock=true&noad=1&noads=true`,
        `https://autoembed.cc/movie/tmdb/${contentId}?ads=0&adblock=1&noad=true&noads=1&ad=false`,
        `https://embedder.net/e/movie?tmdb=${contentId}&noads=1&adblock=true&noad=1&ads=false&ad=0`
      ]
    }
  }, [contentId, contentType, currentSeasonNumber, currentEpisodeNumber])

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

  const handleEpisodeChange = async (episodeNumber: number) => {
    setCurrentEpisodeNumber(episodeNumber)
    setSourceIndex(0) // Reset to first source when changing episode
    
    // Update watch history with new episode
    if (tmdbId && contentType === 'tv') {
      try {
        await watchlistApi.addToWatchHistory({
          media_id: tmdbId,
          media_type: contentType,
          title: title,
          poster_path: undefined,
          backdrop_path: undefined,
          overview: undefined,
          release_date: undefined,
          vote_average: 0,
          season_number: currentSeasonNumber,
          episode_number: episodeNumber
        });
        
        // Dispatch event to notify Home component to refresh watch history
        window.dispatchEvent(new CustomEvent('watchHistoryUpdated'));
      } catch (error) {
        console.error('Failed to update watch history:', error);
      }
    }
  }

  // Get current episode title for display
  const getCurrentEpisodeTitle = () => {
    if (contentType === 'tv' && episodes.length > 0) {
      const currentEpisode = episodes.find(ep => ep.episode_number === currentEpisodeNumber)
      if (currentEpisode) {
        return `${title} - S${currentSeasonNumber}E${currentEpisodeNumber}: ${currentEpisode.name}`
      }
      return `${title} - S${currentSeasonNumber}E${currentEpisodeNumber}`
    }
    return title
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header with close button */}
      <div className="flex justify-between items-center p-2 sm:p-3 lg:p-4 bg-black/80">
        <h2 className="text-white text-sm sm:text-lg lg:text-xl font-semibold truncate mr-2 sm:mr-4">{getCurrentEpisodeTitle()}</h2>
        <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-shrink-0">
          {/* Episode selector for TV shows */}
          {contentType === 'tv' && episodes.length > 0 && (
            <select 
              value={currentEpisodeNumber} 
              onChange={(e) => handleEpisodeChange(parseInt(e.target.value))}
              className="bg-gray-700 text-white px-1 sm:px-2 lg:px-3 py-1 rounded text-xs lg:text-sm min-w-0 max-w-20 sm:max-w-none"
              disabled={loadingEpisodes}
            >
              {episodes.map((episode) => (
                <option key={episode.id} value={episode.episode_number}>
                  <span className="hidden sm:inline">Episode </span>E{episode.episode_number}<span className="hidden sm:inline">: {episode.name}</span>
                </option>
              ))}
            </select>
          )}
          
          {/* Source selector */}
          <select 
            value={sourceIndex} 
            onChange={(e) => handleSourceChange(parseInt(e.target.value))}
            className="bg-gray-700 text-white px-1 sm:px-2 lg:px-3 py-1 rounded text-xs lg:text-sm min-w-0 max-w-16 sm:max-w-none"
          >
            {streamingSources.map((_, index) => (
              <option key={index} value={index}>
                Source {index + 1}
              </option>
            ))}
          </select>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-300 transition-colors p-1 flex-shrink-0"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
          </button>
        </div>
      </div>

      {/* Video iframe */}
      <div className="flex-1 relative">
        <iframe
          src={currentSrc}
          className="w-full h-full border-0"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          onError={handleSourceError}
          title={title}
          style={{ 
            minHeight: '150px',
            filter: 'contrast(1.1) brightness(1.05)' // Enhance video quality
          }}
          referrerPolicy="no-referrer"
        />
        
        {/* Ad blocker overlay - blocks potential ad overlays */}
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'transparent',
            mixBlendMode: 'multiply'
          }}
        />
      </div>
    </div>
  )
}

export default VideoPlayer
