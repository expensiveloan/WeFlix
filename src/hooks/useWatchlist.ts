import { useState, useEffect, useCallback } from 'react';
import { watchlistApi, WatchlistItem, Movie, TVShow } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchWatchlist = useCallback(async () => {
    if (!user) {
      setWatchlist([]);
      setError('Please sign in to view your watchlist');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await watchlistApi.getWatchlist();
      setWatchlist(response.watchlist);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch watchlist';
      if (errorMessage.includes('Authorization token required') || errorMessage.includes('Invalid or expired token')) {
        setError('Please sign in to view your watchlist');
      } else if (errorMessage.includes('table not found') || errorMessage.includes('database schema')) {
        setError('Watchlist database not set up. Please contact administrator.');
      } else {
        setError(errorMessage);
      }
      console.error('Error fetching watchlist:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const addToWatchlist = useCallback(async (item: Movie | TVShow) => {
    if (!user) {
      setError('Please sign in to add items to your watchlist');
      return false;
    }

    try {
      setError(null);
      const watchlistItem = {
        media_id: item.id,
        media_type: item.mediaType,
        title: item.title,
        poster_path: item.posterPath,
        backdrop_path: item.backdropPath,
        overview: item.overview,
        release_date: item.releaseDate,
        vote_average: item.voteAverage
      };

      // Optimistic update - add to local state immediately
      const optimisticItem: WatchlistItem = {
        id: `temp-${item.id}-${item.mediaType}`, // Temporary ID
        user_id: user.id,
        media_id: item.id,
        media_type: item.mediaType,
        title: item.title,
        poster_path: item.posterPath,
        backdrop_path: item.backdropPath,
        overview: item.overview,
        release_date: item.releaseDate,
        vote_average: item.voteAverage,
        added_at: new Date().toISOString()
      };

      setWatchlist(prev => [optimisticItem, ...prev]);

      // Make API call in background
      const response = await watchlistApi.addToWatchlist(watchlistItem);
      
      // Update with real data from server
      setWatchlist(prev => 
        prev.map(wItem => 
          wItem.id === optimisticItem.id ? response.item : wItem
        )
      );
      
      return true;
    } catch (err) {
      // Revert optimistic update on error
      setWatchlist(prev => 
        prev.filter(wItem => wItem.id !== `temp-${item.id}-${item.mediaType}`)
      );
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to add to watchlist';
      setError(errorMessage);
      console.error('Error adding to watchlist:', err);
      return false;
    }
  }, [user]);

  const removeFromWatchlist = useCallback(async (mediaId: number, mediaType: 'movie' | 'tv') => {
    if (!user) {
      setError('Please sign in to manage your watchlist');
      return false;
    }

    try {
      setError(null);
      await watchlistApi.removeFromWatchlist(mediaId, mediaType);
      
      // Update local state immediately for better UX
      setWatchlist(prev => prev.filter(item => 
        !(item.media_id === mediaId && item.media_type === mediaType)
      ));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove from watchlist';
      setError(errorMessage);
      console.error('Error removing from watchlist:', err);
      return false;
    }
  }, [user]);

  const isInWatchlist = useCallback((mediaId: number, mediaType: 'movie' | 'tv') => {
    return watchlist.some(item => item.media_id === mediaId && item.media_type === mediaType);
  }, [watchlist]);

  const checkInWatchlist = useCallback(async (mediaId: number, mediaType: 'movie' | 'tv') => {
    if (!user) return false;

    try {
      const response = await watchlistApi.checkInWatchlist(mediaId, mediaType);
      return response.inWatchlist;
    } catch (err) {
      console.error('Error checking watchlist:', err);
      return false;
    }
  }, [user]);

  return {
    watchlist,
    loading,
    error,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    checkInWatchlist,
    refetch: fetchWatchlist
  };
};
