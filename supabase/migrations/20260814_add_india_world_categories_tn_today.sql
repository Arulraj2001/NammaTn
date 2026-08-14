-- ============================================================
-- Migration: Add 'india' and 'world' to tn_today_category_check
-- Run this script in your Supabase SQL Editor
-- ============================================================

ALTER TABLE public.tn_today 
  DROP CONSTRAINT IF EXISTS tn_today_category_check;

ALTER TABLE public.tn_today 
  ADD CONSTRAINT tn_today_category_check 
  CHECK (category IN (
    'infrastructure',
    'education',
    'healthcare',
    'environment',
    'economy',
    'governance',
    'transport',
    'agriculture',
    'technology',
    'social',
    'india',
    'world',
    'general'
  ));
