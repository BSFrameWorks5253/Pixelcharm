import { CanvasDimensionsPreset } from '../types';

export const CANVAS_PRESETS: CanvasDimensionsPreset[] = [
  { id: 'insta-sq', name: 'Instagram Post', category: 'Social', width: 1080, height: 1080 },
  { id: 'insta-story', name: 'Instagram Story / Reel', category: 'Social', width: 1080, height: 1920 },
  { id: 'yt-thumb', name: 'YouTube Thumbnail', category: 'Video', width: 1280, height: 720 },
  { id: 'twitter-hdr', name: 'Twitter / X Header', category: 'Social', width: 1500, height: 500 },
  { id: 'fb-post', name: 'Facebook Banner', category: 'Social', width: 1200, height: 630 },
  { id: 'fhd-pres', name: 'Presentation (16:9)', category: 'Screen', width: 1920, height: 1080 },
  { id: 'poster-a4', name: 'A4 Print Poster', category: 'Print', width: 1240, height: 1754 },
  { id: 'wallpaper-4k', name: '4K Ultra HD', category: 'Screen', width: 3840, height: 2160 }
];

export const FONT_FAMILIES = [
  { name: 'Inter', label: 'Inter (Clean Sans)' },
  { name: 'Space Grotesk', label: 'Space Grotesk (Tech Modern)' },
  { name: 'Playfair Display', label: 'Playfair Display (Editorial Serif)' },
  { name: 'Outfit', label: 'Outfit (Geometric Display)' },
  { name: 'JetBrains Mono', label: 'JetBrains Mono (Code/Mono)' },
  { name: 'Impact', label: 'Impact (Heavy Poster)' },
  { name: 'Georgia', label: 'Georgia (Classic)' },
  { name: 'Arial', label: 'Arial (Neutral)' }
];
