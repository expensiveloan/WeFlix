-- Drop existing watch_history table if it exists
DROP TABLE IF EXISTS watch_history CASCADE;

-- Create watch_history table for tracking user viewing activity
CREATE TABLE watch_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    media_id INTEGER NOT NULL,
    media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('movie', 'tv')),
    title VARCHAR(500) NOT NULL,
    poster_path VARCHAR(500),
    backdrop_path VARCHAR(500),
    overview TEXT,
    release_date VARCHAR(20),
    vote_average DECIMAL(3,1) DEFAULT 0,
    season_number INTEGER,
    episode_number INTEGER,
    watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_watched_at ON watch_history(watched_at DESC);
CREATE INDEX IF NOT EXISTS idx_watch_history_media ON watch_history(media_id, media_type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_watch_history_unique_media ON watch_history(user_id, media_id, media_type);

-- Enable Row Level Security (RLS)
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own watch history" ON watch_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watch history" ON watch_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watch history" ON watch_history
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watch history" ON watch_history
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_watch_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_watch_history_updated_at_trigger
    BEFORE UPDATE ON watch_history
    FOR EACH ROW
    EXECUTE FUNCTION update_watch_history_updated_at();
