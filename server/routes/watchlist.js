import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Middleware to extract user ID from authorization header
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.userId = user.id;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Get user's watchlist
router.get('/', authenticateUser, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Watchlist service unavailable - database not configured' });
    }

    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', req.userId)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Error fetching watchlist:', error);
      
      // Handle table not found error specifically
      if (error.code === 'PGRST205' || error.message.includes('watchlist')) {
        return res.status(503).json({ 
          error: 'Watchlist table not found - please set up the database schema',
          details: 'Run the SQL schema from server/config/supabase.js in your Supabase dashboard'
        });
      }
      
      return res.status(500).json({ error: 'Failed to fetch watchlist' });
    }

    res.json({ watchlist: data || [] });
  } catch (error) {
    console.error('Error in watchlist GET:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add item to watchlist
router.post('/', authenticateUser, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Watchlist service unavailable' });
    }

    const {
      media_id,
      media_type,
      title,
      poster_path,
      backdrop_path,
      overview,
      release_date,
      vote_average
    } = req.body;

    if (!media_id || !media_type || !title) {
      return res.status(400).json({ 
        error: 'Missing required fields: media_id, media_type, title' 
      });
    }

    if (!['movie', 'tv'].includes(media_type)) {
      return res.status(400).json({ 
        error: 'Invalid media_type. Must be "movie" or "tv"' 
      });
    }

    const watchlistItem = {
      user_id: req.userId,
      media_id: parseInt(media_id),
      media_type,
      title,
      poster_path,
      backdrop_path,
      overview,
      release_date: release_date && release_date.trim() !== '' ? release_date : null,
      vote_average: parseFloat(vote_average) || null
    };

    const { data, error } = await supabase
      .from('watchlist')
      .insert([watchlistItem])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({ error: 'Item already in watchlist' });
      }
      console.error('Error adding to watchlist:', error);
      return res.status(500).json({ error: 'Failed to add to watchlist' });
    }

    res.status(201).json({ 
      message: 'Added to watchlist successfully',
      item: data 
    });
  } catch (error) {
    console.error('Error in watchlist POST:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove item from watchlist
router.delete('/:mediaId/:mediaType', authenticateUser, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Watchlist service unavailable' });
    }

    const { mediaId, mediaType } = req.params;

    if (!['movie', 'tv'].includes(mediaType)) {
      return res.status(400).json({ 
        error: 'Invalid media_type. Must be "movie" or "tv"' 
      });
    }

    const { data, error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', req.userId)
      .eq('media_id', parseInt(mediaId))
      .eq('media_type', mediaType)
      .select();

    if (error) {
      console.error('Error removing from watchlist:', error);
      return res.status(500).json({ error: 'Failed to remove from watchlist' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Item not found in watchlist' });
    }

    res.json({ 
      message: 'Removed from watchlist successfully',
      removed: data[0]
    });
  } catch (error) {
    console.error('Error in watchlist DELETE:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if item is in watchlist
router.get('/check/:mediaId/:mediaType', authenticateUser, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Watchlist service unavailable' });
    }

    const { mediaId, mediaType } = req.params;

    if (!['movie', 'tv'].includes(mediaType)) {
      return res.status(400).json({ 
        error: 'Invalid media_type. Must be "movie" or "tv"' 
      });
    }

    const { data, error } = await supabase
      .from('watchlist')
      .select('id')
      .eq('user_id', req.userId)
      .eq('media_id', parseInt(mediaId))
      .eq('media_type', mediaType)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking watchlist:', error);
      return res.status(500).json({ error: 'Failed to check watchlist' });
    }

    res.json({ inWatchlist: !!data });
  } catch (error) {
    console.error('Error in watchlist check:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
