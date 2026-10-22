import { supabase } from "@/api/supabaseClient";

export const youtubeContentService = {
  /**
   * Fetch all 90 content episodes ordered by episode_number ascending
   */
  async getAllEpisodes() {
    try {
      const { data, error } = await supabase
        .from('content_episodes')
        .select('*')
        .order('episode_number', { ascending: true });

      if (error) {
        console.error('Error fetching content episodes:', error);
        return { data: [], error };
      }
      return { data: data || [], error: null };
    } catch (err) {
      console.error('Unexpected error fetching content episodes:', err);
      return { data: [], error: err };
    }
  },

  /**
   * Fetch a single episode by episode number
   */
  async getEpisodeByNumber(episodeNumber) {
    try {
      const { data, error } = await supabase
        .from('content_episodes')
        .select('*')
        .eq('episode_number', episodeNumber)
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Upsert or update an episode
   */
  async upsertEpisode(episode) {
    try {
      const payload = {
        ...episode,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('content_episodes')
        .upsert(payload, { onConflict: 'episode_number' })
        .select()
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Bulk upsert 90-day calendar entries (e.g., from Excel .xlsx import)
   */
  async bulkImportEpisodes(episodesList) {
    try {
      const cleaned = episodesList.map((ep) => {
        const getVal = (candidates) => {
          for (const cand of candidates) {
            const cleanCand = cand.toLowerCase().replace(/[^a-z0-9]/g, '');
            for (const epKey of Object.keys(ep)) {
              if (epKey.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanCand) {
                return ep[epKey];
              }
            }
          }
          return null;
        };

        const rawEpisode = getVal(['episode_number', 'day', 'day#', 'episode', 'episodenumber', 'no']) || 0;
        const epMatch = String(rawEpisode).match(/\d+/);
        const dayNum = epMatch ? parseInt(epMatch[0], 10) : 0;

        let rawDate = getVal(['scheduled_date', 'date', 'scheduleddate', 'dateist']) || '';
        let cleanDate = '';
        if (typeof rawDate === 'number') {
          const excelEpoch = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
          cleanDate = excelEpoch.toISOString().slice(0, 10);
        } else if (rawDate instanceof Date) {
          cleanDate = rawDate.toISOString().slice(0, 10);
        } else {
          const str = String(rawDate).trim();
          const dmyMatch = str.match(/(\d{1,2})-([A-Za-z]{3})-(\d{4})/i);
          if (dmyMatch) {
            const months = { jan:'01', feb:'02', mar:'03', apr:'04', may:'05', jun:'06', jul:'07', aug:'08', sep:'09', oct:'10', nov:'11', dec:'12' };
            const d = dmyMatch[1].padStart(2, '0');
            const m = months[dmyMatch[2].toLowerCase()] || '01';
            const y = dmyMatch[3];
            cleanDate = `${y}-${m}-${d}`;
          } else {
            const ymdMatch = str.match(/(\d{4})-(\d{2})-(\d{2})/);
            cleanDate = ymdMatch ? ymdMatch[0] : str;
          }
        }

        const topic_title = (getVal(['podcasttitle', 'podcast_title', 'topic_title', 'title', 'episodetitle', 'topic', 'topicforscript']) || 'Untitled Episode').toString().trim();
        const seo_description = (getVal(['podcastdescription', 'podcast_description', 'seo_description', 'description', 'seodescription', 'summary', 'topicforscript']) || '').toString().trim();
        
        const rawTags = getVal(['podcasttags', 'podcast_tags', 'tags', 'keywords', 'tag']) || '';
        const tags = Array.isArray(rawTags)
          ? rawTags
          : String(rawTags)
              .split(/[\s,]+/)
              .map((t) => t.trim().replace(/^#/, ''))
              .filter(Boolean);

        const rawHashtags = getVal(['podcasthashtagstop3', 'podcasthashtags', 'podcast_hashtags', 'hashtags', 'hashtag', 'shorthashtags']) || '';
        const hashtags = Array.isArray(rawHashtags)
          ? rawHashtags
          : String(rawHashtags)
              .split(/[\s,]+/)
              .map((h) => (h.startsWith('#') ? h : `#${h}`))
              .filter((h) => h.length > 1);

        // Smart Category inference if not explicitly provided
        let category = (getVal(['category', 'topiccategory', 'genre']) || '').toString().toLowerCase().trim();
        if (!category) {
          const searchCorpus = `${topic_title} ${seo_description} ${tags.join(' ')}`.toLowerCase();
          if (searchCorpus.match(/scam|cyber|fraud|fake|otp|hacker|phish|call/)) {
            category = 'scams';
          } else if (searchCorpus.match(/police|right|law|court|rti|fir|traffic|legal|arrest|complaint/)) {
            category = 'rights';
          } else if (searchCorpus.match(/health|food|sugar|bp|medical|diet|doctor|hospital|medicine/)) {
            category = 'health';
          } else if (searchCorpus.match(/job|career|salary|interview|resume|work|skill|company/)) {
            category = 'career';
          } else if (searchCorpus.match(/school|parent|child|exam|college|student|kid|baby/)) {
            category = 'parenting';
          } else {
            category = 'finance';
          }
        }

        const thumbnail_text_overlay = (getVal(['thumbnail_text_overlay', 'thumbnailtext', 'thumbnail', 'thumbtext', 'overlaytext', 'shorttitle']) || '').toString().trim();
        const podcast_script = getVal(['podcast_script', 'full_script', 'script', 'podcastscript', 'dialogue', 'manual_script']) || null;
        const short_hook = (getVal(['shorttitle', 'short_title', 'short_hook', 'shorthook', 'hook']) || '').toString().trim();
        const short_script = (getVal(['short_script', 'shortscript', 'companionshort', 'short']) || '').toString().trim();

        const wordCount = podcast_script ? String(podcast_script).trim().split(/\s+/).filter(Boolean).length : 0;
        const estSec = wordCount > 0 ? Math.round((wordCount / 135) * 60) : 0;

        return {
          episode_number: dayNum,
          scheduled_date: cleanDate,
          category,
          language: 'ta-conversational',
          topic_title,
          seo_description,
          tags,
          hashtags,
          thumbnail_text_overlay,
          podcast_script,
          podcast_word_count: wordCount,
          estimated_duration_sec: estSec,
          short_hook: short_hook || null,
          short_script: short_script || null,
          youtube_status: 'draft',
          instagram_status: 'draft',
          facebook_status: 'draft',
          shorts_youtube_status: 'draft',
          shorts_instagram_status: 'draft',
          shorts_facebook_status: 'draft',
          updated_at: new Date().toISOString(),
        };
      });

      // Filter out invalid items without episode_number
      const valid = cleaned.filter((c) => c.episode_number > 0 && c.scheduled_date);

      const { data, error } = await supabase
        .from('content_episodes')
        .upsert(valid, { onConflict: 'episode_number' });

      return { count: valid.length, error };
    } catch (err) {
      console.error('Error during bulk import:', err);
      return { count: 0, error: err };
    }
  },

  /**
   * Bulk update podcast and companion short scripts from Excel / CSV
   * Matches by episode_number and updates script fields while preserving all other metadata.
   */
  async bulkUpdateScripts(scriptsList) {
    try {
      const updates = [];

      for (const item of scriptsList) {
        const getVal = (candidates) => {
          for (const cand of candidates) {
            const cleanCand = cand.toLowerCase().replace(/[^a-z0-9]/g, '');
            for (const epKey of Object.keys(item)) {
              if (epKey.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanCand) {
                return item[epKey];
              }
            }
          }
          return null;
        };

        const rawEpisode = getVal(['episode_number', 'day', 'day#', 'episode', 'episodenumber', 'no', 'ep']) || 0;
        const epMatch = String(rawEpisode).match(/\d+/);
        const dayNum = epMatch ? parseInt(epMatch[0], 10) : 0;
        if (!dayNum) continue;

        const rawScript = getVal([
          'podcast_script',
          'podcastscript',
          'script',
          'full_script',
          'fullscript',
          'dialogue',
          'manual_script',
          'podcastscriptdialogue',
          'podcast_script_host_expert',
          'podcastscriptdialoguehostexpert'
        ]);
        const scriptText = rawScript ? String(rawScript).trim() : '';

        const rawShort = getVal([
          'short_script',
          'shortscript',
          'companionshort',
          'short',
          'reels_script',
          'reelsscript',
          'companionshortscript'
        ]);
        const shortText = rawShort ? String(rawShort).trim() : '';

        if (!scriptText && !shortText) continue;

        const updatePayload = {
          episode_number: dayNum,
          updated_at: new Date().toISOString(),
        };

        if (scriptText) {
          const wordCount = scriptText.split(/\s+/).filter(Boolean).length;
          updatePayload.podcast_script = scriptText;
          updatePayload.podcast_script_source = 'manual';
          updatePayload.podcast_word_count = wordCount;
          updatePayload.estimated_duration_sec = Math.round((wordCount / 135) * 60);
        }

        if (shortText) {
          updatePayload.short_script = shortText;
          updatePayload.short_script_source = 'manual';
        }

        updates.push(updatePayload);
      }

      if (updates.length === 0) {
        return { count: 0, error: new Error('No valid scripts found in the uploaded file') };
      }

      let updatedCount = 0;
      for (const u of updates) {
        const { error } = await supabase
          .from('content_episodes')
          .update(u)
          .eq('episode_number', u.episode_number);

        if (!error) updatedCount++;
      }

      return { count: updatedCount, total: updates.length, error: null };
    } catch (err) {
      console.error('Error during bulk script update:', err);
      return { count: 0, error: err };
    }
  },

  /**
   * Request Gemini to generate a full podcast script
   */
  async generateScriptOnline(topic_title, category) {
    const res = await fetch('/api/admin/youtube-studio/generate-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate_podcast', topic_title, category }),
    });
    return await res.json();
  },

  /**
   * Request Gemini to extract a 50s short script from the full script
   */
  async extractShortOnline(full_script) {
    const res = await fetch('/api/admin/youtube-studio/generate-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'extract_short', full_script }),
    });
    return await res.json();
  },
};
