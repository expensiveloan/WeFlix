import { useState, useCallback } from 'react'
import { searchApi } from '../services/tmdb-direct'
import type { Movie, TVShow } from '../services/tmdb-direct'

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<(Movie | TVShow)[]>([]);
  const [suggestions, setSuggestions] = useState<Array<{
    id: number;
    title: string;
    mediaType: string;
    posterPath: string | null;
    releaseDate: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const search = useCallback(async (searchQuery: string, page = 1, type: 'multi' | 'movie' | 'tv' = 'multi') => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotalResults(0);
      setTotalPages(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Starting search for:', searchQuery);
      
      const response = await searchApi.search(searchQuery, page, type);
      
      console.log('📊 Search response received:', response);
      
      if (page === 1) {
        setResults(response.results || []);
      } else {
        setResults(prev => [...prev, ...(response.results || [])]);
      }
      
      setTotalResults(response.totalResults || 0);
      setTotalPages(response.totalPages || 0);
      setCurrentPage(page);
      setQuery(searchQuery);
      
      console.log('✅ Search state updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      console.error('❌ Search hook error:', err);
      setError(errorMessage);
      
      // Set empty results on error to prevent white screen
      setResults([]);
      setTotalResults(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const getSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2 || searchQuery.length > 100) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await searchApi.getSuggestions(searchQuery.trim());
      setSuggestions(response.suggestions || []);
    } catch (err) {
      console.error('Suggestions error:', err);
      setSuggestions([]);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (currentPage < totalPages && !loading && query) {
      search(query, currentPage + 1);
    }
  }, [currentPage, totalPages, loading, query, search]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setSuggestions([]);
    setTotalResults(0);
    setTotalPages(0);
    setCurrentPage(1);
    setError(null);
  }, []);

  return {
    query,
    results,
    suggestions,
    loading,
    error,
    totalResults,
    currentPage,
    totalPages,
    search,
    getSuggestions,
    loadMore,
    clearSearch,
    hasMore: currentPage < totalPages
  };
};
