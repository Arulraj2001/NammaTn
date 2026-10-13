# VizhiTN Sound Design Assets

Place royalty-free CC0 / CC-BY audio files here to activate the full 6-track sound design layer.
All sources below are free to download with no attribution required for CC0.

## Required Files

| Filename                  | Duration | Description                          | Source (free)                              |
|---------------------------|----------|--------------------------------------|--------------------------------------------|
| `newsroom-hum.mp3`        | ≥ 60s    | Low ambient newsroom room tone (8%)  | freesound.org — search "newsroom ambience" |
| `scene-whoosh.mp3`        | 0.5–1s   | Bass/impact whoosh for transitions   | freesound.org — search "bass whoosh"       |
| `text-click.mp3`          | < 0.1s   | Subtle UI click for text elements    | freesound.org — search "ui click"          |
| `civic-outro-beat.mp3`    | 1.5–3s   | Closing drum/stinger beat            | freesound.org — search "news stinger"      |

## Volume Levels (Handled Automatically)

| Track              | Volume | Role                                      |
|--------------------|--------|-------------------------------------------|
| Voiceover          | 100%   | Primary (always present)                  |
| `newsroom-hum.mp3` | 8%     | Ambient background loop                   |
| `scene-whoosh.mp3` | 35%    | Scene open (first 1s only)                |
| `civic-outro-beat` | 50%    | Final scene only                          |

## Graceful Fallback

If no SFX files are present, the pipeline logs:
```
[AUDIO MIXER] No SFX assets found — using voiceover only.
```
Videos still render and upload correctly — sound design is additive, not required.

## Recommended Sources (all CC0)

- https://freesound.org/search/?q=newsroom+ambience
- https://freesound.org/search/?q=news+whoosh
- https://freesound.org/search/?q=news+stinger+drum
- https://mixkit.co/free-sound-effects/news/ (Mixkit Standard License — free for video)
- https://www.bensound.com/royalty-free-music/track/epic-news

## File Quality Requirements

- Format: MP3 or WAV (MP3 preferred for size)
- Sample Rate: 44100 Hz
- Bit Rate: ≥ 128 kbps
- Channels: Mono or Stereo (both work)
