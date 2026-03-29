export interface YouTubeVideo {
    id: string;
    title: string;
    thumbnailUrl: string;
    publishedAt: string;
}

// Channel ID for ROOM THIRTY7
const YOUTUBE_RSS = 'https://www.youtube.com/feeds/videos.xml?channel_id=UC7fhj_j3y6ZNMD5XDqmZ_Lg';

// Fallback placeholder videos when API fails
const PLACEHOLDER_VIDEOS: YouTubeVideo[] = [
    {
        id: 'placeholder1',
        title: '🎮 New Videos Coming Soon!',
        thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        publishedAt: new Date().toISOString()
    },
    {
        id: 'placeholder2',
        title: '🎉 Join Our Community!',
        thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        publishedAt: new Date().toISOString()
    },
    {
        id: 'placeholder3',
        title: '🔥 Support the Channel!',
        thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        publishedAt: new Date().toISOString()
    }
];

export const getRecentVideos = async (maxResults: number = 6): Promise<YouTubeVideo[]> => {
    try {
        // Try rss2json service first
        const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(YOUTUBE_RSS)}&count=${maxResults}`;
        const response = await fetch(url, { signal: AbortSignal.timeout(5000) });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        if (data.status === 'ok' && Array.isArray(data.items) && data.items.length > 0) {
            return data.items.slice(0, maxResults).map((item: {
                guid?: string;
                title?: string;
                thumbnail?: string;
                pubDate?: string;
                link?: string;
            }) => ({
                id: item.guid?.split('/').pop() || item.link?.split('/').pop() || '',
                title: item.title || 'Untitled',
                thumbnailUrl: item.thumbnail || `https://img.youtube.com/vi/${item.guid?.split('/').pop()}/hqdefault.jpg`,
                publishedAt: item.pubDate || ''
            })).filter((v: YouTubeVideo) => v.id);
        }

        // Fallback: try parsing RSS directly via allorigins proxy
        try {
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(YOUTUBE_RSS)}`;
            const proxyResponse = await fetch(proxyUrl, { signal: AbortSignal.timeout(5000) });

            if (!proxyResponse.ok) throw new Error(`Proxy failed: ${proxyResponse.status}`);

            const rssText = await proxyResponse.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(rssText, 'application/xml');

            const entries = xml.querySelectorAll('entry');
            const videos: YouTubeVideo[] = [];

            entries.forEach((entry) => {
                const id = entry.querySelector('id')?.textContent?.split('/').pop() || '';
                const title = entry.querySelector('title')?.textContent || '';
                const published = entry.querySelector('published')?.textContent || '';
                const thumbnail = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

                if (id && videos.length < maxResults) {
                    videos.push({ id, title, thumbnailUrl: thumbnail, publishedAt: published });
                }
            });

            if (videos.length > 0) return videos;
        } catch {
            console.warn('RSS proxy also failed, using placeholders');
        }

        // If both APIs fail, return placeholder videos
        return PLACEHOLDER_VIDEOS.slice(0, maxResults);
    } catch (error) {
        console.warn('YouTube feed unavailable, using placeholders:', error);
        return PLACEHOLDER_VIDEOS.slice(0, maxResults);
    }
};

export const formatVideoDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    } catch {
        return '';
    }
};
