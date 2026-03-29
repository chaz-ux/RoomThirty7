import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecentVideos, formatVideoDate, YouTubeVideo } from '../services/youtube';
import './Support.css';

const Support: React.FC = () => {
    const [videos, setVideos] = React.useState<YouTubeVideo[]>([]);
    const [loadingVideos, setLoadingVideos] = React.useState(true);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const recentVideos = await getRecentVideos(6);
                setVideos(recentVideos);
            } catch {
                setVideos([]);
            } finally {
                setLoadingVideos(false);
            }
        };
        fetchVideos();
    }, []);

    return (
        <div className="support-container">
            <div className="support-card glow-magenta">

                <h1 className="support-title">Welcome to ROOM THIRTY7! 🎲</h1>

                <p className="support-text">
                    Your ultimate hub for chaotic party games, hilarious challenges, and top-tier group banter.
                    We built this app so you can play the exact games we do, but <strong>the real madness happens on camera</strong>.
                </p>

                <p className="support-text">
                    Whether we're exposing each other in Personality Tests or fighting for our lives in 30-Second Categories,
                    you don't want to miss it. Grab your friends, play along, and come watch the chaos unfold! 🚀
                </p>

                {/* Support Till Number - More Visible */}
                <div className="till-section">
                    <div className="till-icon">💝</div>
                    <h2 className="till-heading">Support Us</h2>
                    <p className="till-label">Till Number</p>
                    <div className="till-number">4249130</div>
                    <p className="till-description">Send us a tip or contribution to keep the chaos alive!</p>
                </div>

                <div className="action-box">
                    <a
                        href="https://www.youtube.com/@ROOMTHIRTY7"
                        target="_blank"
                        rel="noreferrer"
                        className="yt-link"
                    >
                        ▶ Subscribe on YouTube
                    </a>
                    <p className="subtext">Subscribe and hit the bell!</p>
                </div>

                {/* YouTube Latest Videos */}
                <div className="youtube-section">
                    <h2 className="section-heading">Latest Videos</h2>
                    {loadingVideos ? (
                        <div className="video-grid">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="video-card skeleton-card">
                                    <div className="skeleton-thumb skeleton"></div>
                                    <div className="skeleton-title skeleton"></div>
                                </div>
                            ))}
                        </div>
                    ) : videos.length > 0 ? (
                        <div className="video-grid">
                            {videos.map(video => (
                                <a
                                    key={video.id}
                                    href={`https://youtube.com/watch?v=${video.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="video-card"
                                >
                                    <div className="thumbnail-wrapper">
                                        <img
                                            src={video.thumbnailUrl}
                                            alt={video.title}
                                            loading="lazy"
                                        />
                                        <div className="play-overlay">▶</div>
                                    </div>
                                    <h4 className="video-title">{video.title}</h4>
                                    <span className="video-date">{formatVideoDate(video.publishedAt)}</span>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="no-videos-wrapper">
                            <p className="no-videos">No videos found.</p>
                            <a
                                href="https://www.youtube.com/@ROOMTHIRTY7"
                                target="_blank"
                                rel="noreferrer"
                                className="visit-channel-btn"
                            >
                                ▶ Visit Our Channel
                            </a>
                        </div>
                    )}
                </div>

                <a href="/" className="back-link">&laquo; Back to Hub</a>
            </div>
        </div>
    );
};

export default Support;
