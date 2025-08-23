import { useCallback } from 'react'
import React from 'react'

// Route prefetch cache to avoid duplicate prefetches
const prefetchCache = new Set<string>()

// Route import map for prefetching
const routeImports: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  '/home': () => import('../pages/Home'),
  '/movies': () => import('../pages/Movies'),
  '/tv-shows': () => import('../pages/TVShows'),
  '/search': () => import('../pages/Search'),
  '/trending': () => import('../pages/Trending'),
  '/my-list': () => import('../pages/MyList'),
  '/settings': () => import('../pages/Settings'),
  '/login': () => import('../pages/Login'),
  '/signup': () => import('../pages/SignUp'),
}

export const useRoutePrefetch = () => {
  const prefetchRoute = useCallback((path: string) => {
    // Don't prefetch if already cached or no import function exists
    if (prefetchCache.has(path) || !routeImports[path]) return

    // Add to cache immediately to prevent duplicate requests
    prefetchCache.add(path)

    // Prefetch the route with a small delay to avoid blocking main thread
    setTimeout(() => {
      routeImports[path]().catch(() => {
        // Remove from cache if prefetch fails so it can be retried
        prefetchCache.delete(path)
      })
    }, 100)
  }, [])

  const handleLinkHover = useCallback((path: string) => {
    prefetchRoute(path)
  }, [prefetchRoute])

  const handleLinkFocus = useCallback((path: string) => {
    prefetchRoute(path)
  }, [prefetchRoute])

  return {
    prefetchRoute,
    handleLinkHover,
    handleLinkFocus,
  }
}
