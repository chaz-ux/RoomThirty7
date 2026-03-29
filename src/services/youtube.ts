// ─────────────────────────────────────────────────────────────
//  src/services/youtube.ts
//  Fetches ROOM THIRTY7 videos via YouTube RSS + allorigins proxy
//  No API key. No quota. Auto-updates when you post.
// ─────────────────────────────────────────────────────────────

const CHANNEL_ID = 'UCo_ixIs_cPbMxr4y4GR4QNA';
const FEED_URL   = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const PROXY_URL  = `https://api.allorigins.win/get?url=${encodeURIComponent(FEED_URL)}`;

// How long to cache in memory (ms) — 30 minutes
const CACHE_TTL = 30 * 60 * 1000;

export interface YouTubeVideo {
  id:           string;
  title:        string;
  thumbnailUrl: string;
  publishedAt:  string;
  channelTitle: string;
}

// In-memory cache so we don't hammer the proxy on every render
let _cache: { videos: YouTubeVideo[]; fetchedAt: number } | null = null;

// ── Main fetch function ───────────────────────────────────────
export async function getRecentVideos(count = 6): Promise<YouTubeVideo[]> {
  // Return cache if still fresh
  if (_cache && Date.now() - _cache.fetchedAt < CACHE_TTL) {
    return _cache.videos.slice(0, count);
  }

  const response = await fetch(PROXY_URL);
  if (!response.ok) throw new Error(`Proxy error: ${response.status}`);

  const json = await response.json();

  // allorigins wraps the response in { contents: "..." }
  const xmlText: string = json.contents;
  if (!xmlText) throw new Error('Empty response from proxy');

  const videos = parseRSSFeed(xmlText);

  _cache = { videos, fetchedAt: Date.now() };
  return videos.slice(0, count);
}

// ── RSS XML parser ────────────────────────────────────────────
function parseRSSFeed(xml: string): YouTubeVideo[] {
  const parser  = new DOMParser();
  const doc     = parser.parseFromString(xml, 'application/xml');
  const entries = Array.from(doc.querySelectorAll('entry'));

  return entries.map(entry => {
    // Video ID lives in <yt:videoId> or the <id> tag
    const videoIdEl = entry.querySelector('videoId');
    const idEl      = entry.querySelector('id');

    let id = videoIdEl?.textContent ?? '';
    if (!id && idEl?.textContent) {
      // Format: yt:video:VIDEOID
      id = idEl.textContent.replace('yt:video:', '');
    }

    const title       = entry.querySelector('title')?.textContent ?? 'Untitled';
    const publishedAt = entry.querySelector('published')?.textContent ?? '';

    // YouTube RSS includes <media:group><media:thumbnail url="..." /></media:group>
    const thumbnail = entry.querySelector('thumbnail');
    const thumbnailUrl = thumbnail?.getAttribute('url')
      ?? `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

    const channelTitle = entry.querySelector('author name')?.textContent ?? 'ROOM THIRTY7';

    return { id, title, thumbnailUrl, publishedAt, channelTitle };
  }).filter(v => v.id); // drop any entries with no ID
}

// ── Date formatter ────────────────────────────────────────────
export function formatVideoDate(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const now   = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)  return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}