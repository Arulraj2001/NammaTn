-- Migration: Content Episodes Calendar Schema for YouTube Studio & Multi-Platform Pipeline
-- Date: 2026-10-22

CREATE TABLE IF NOT EXISTS public.content_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_number INTEGER NOT NULL UNIQUE,
  scheduled_date DATE NOT NULL,
  category TEXT NOT NULL DEFAULT 'finance',
  language TEXT NOT NULL DEFAULT 'ta-conversational',
  
  -- Topic & SEO Metadata
  topic_title TEXT NOT NULL,
  seo_description TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  hashtags TEXT[] NOT NULL DEFAULT '{}',
  
  -- Thumbnail Metadata
  thumbnail_image_url TEXT,
  thumbnail_text_overlay TEXT,
  thumbnail_custom_uploaded BOOLEAN DEFAULT false,
  
  -- Long-Form Uncut Podcast (13-15 min)
  podcast_script TEXT,
  podcast_script_source TEXT DEFAULT 'manual', -- 'manual' | 'ai_generated'
  podcast_word_count INTEGER DEFAULT 0,
  estimated_duration_sec INTEGER DEFAULT 0,
  
  -- Companion Short (50 sec, Text-First)
  short_script TEXT,
  short_hook TEXT,
  short_thumbnail_url TEXT,
  
  -- Long-Form Platform Publishing Status
  youtube_status TEXT NOT NULL DEFAULT 'draft', -- 'draft'|'script_ready'|'rendering'|'published'|'failed'
  youtube_url TEXT,
  youtube_video_id TEXT,
  
  instagram_status TEXT NOT NULL DEFAULT 'draft',
  instagram_url TEXT,
  instagram_media_id TEXT,
  
  facebook_status TEXT NOT NULL DEFAULT 'draft',
  facebook_url TEXT,
  facebook_post_id TEXT,
  
  -- Companion Short Platform Publishing Status
  shorts_youtube_status TEXT NOT NULL DEFAULT 'draft',
  shorts_youtube_url TEXT,
  shorts_youtube_video_id TEXT,
  
  shorts_instagram_status TEXT NOT NULL DEFAULT 'draft',
  shorts_instagram_url TEXT,
  shorts_instagram_media_id TEXT,
  
  shorts_facebook_status TEXT NOT NULL DEFAULT 'draft',
  shorts_facebook_url TEXT,
  shorts_facebook_post_id TEXT,
  
  -- Rendering Logs & Error Tracking
  error_log TEXT,
  last_rendered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient date and status lookups
CREATE INDEX IF NOT EXISTS idx_content_episodes_scheduled_date ON public.content_episodes(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_content_episodes_episode_number ON public.content_episodes(episode_number);
CREATE INDEX IF NOT EXISTS idx_content_episodes_youtube_status ON public.content_episodes(youtube_status);
CREATE INDEX IF NOT EXISTS idx_content_episodes_category ON public.content_episodes(category);

-- Enable RLS
ALTER TABLE public.content_episodes ENABLE ROW LEVEL SECURITY;

-- Allow read for authenticated and service_role, and public read for published metadata
CREATE POLICY "Public can view published episodes"
  ON public.content_episodes FOR SELECT
  USING (youtube_status = 'published');

CREATE POLICY "Authenticated users have full access to episodes"
  ON public.content_episodes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

GRANT ALL ON public.content_episodes TO authenticated;
GRANT ALL ON public.content_episodes TO service_role;
GRANT SELECT ON public.content_episodes TO anon;
