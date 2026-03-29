import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRecentVideos, formatVideoDate, YouTubeVideo } from '../services/youtube';
import './Support.css';

const Support: React.FC = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentVideos(6)
      .then(v => setVideos(v))
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="support-wrap">
      {/* Back */}
      <Link to="/" className="support-back">Back to Hub</Link>

      {/* Header */}
      <header className="support-header">
        <span className="support-eyebrow">Room Thirty7</span>
        <h1 className="support-title">
          Keep the <span>chaos</span> alive. 🎲
        </h1>
        <p className="support-intro">
          Your hub for chaotic party games, ridiculous challenges, and top-tier group banter.
          We built this so you can play the exact games we play — but{' '}
          <strong>the real madness happens on camera.</strong> Come watch.
        </p>
      </header>

      {/* M-Pesa Till */}
      <div className="till-card">
        <span className="till-icon">💝</span>
        <div className="till-body">
          <div className="till-label">M-Pesa Till Number</div>
          <div className="till-number">4942130</div>
          <div className="till-sub">Send a tip to keep the servers alive. Every shilling counts!</div>
        </div>
      </div>

      {/* YouTube CTA */}
      <a
        href="https://www.youtube.com/@ROOMTHIRTY7"
        target="_blank"
        rel="noreferrer"
        className="yt-cta"
      >
        <span className="yt-cta-icon">▶</span>
        <div className="yt-cta-text">
          <div className="yt-cta-title">Subscribe on YouTube</div>
          <div className="yt-cta-sub">Hit the bell. Watch the chaos unfold.</div>
        </div>
        <span className="yt-cta-arrow">→</span>
      </a>

      {/* Latest videos */}
      <h2 className="support-section-title">Latest Videos</h2>

      <div className="video-grid">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-thumb skeleton" />
              <div className="skeleton-text skeleton" />
            </div>
          ))
        ) : videos.length > 0 ? (
          videos.map(v => (
            <a
              key={v.id}
              href={`https://youtube.com/watch?v=${v.id}`}
              target="_blank"
              rel="noreferrer"
              className="video-card"
            >
              <div className="video-thumb">
                <img src={v.thumbnailUrl} alt={v.title} loading="lazy" />
                <div className="video-play">▶</div>
              </div>
              <div className="video-info">
                <h4 className="video-title">{v.title}</h4>
                <span className="video-date">{formatVideoDate(v.publishedAt)}</span>
              </div>
            </a>
          ))
        ) : (
          <div className="no-videos">
            <p>No videos found.</p>
            <a
              href="https://www.youtube.com/@ROOMTHIRTY7"
              target="_blank"
              rel="noreferrer"
              className="btn btn-accent"
            >
              ▶ Visit Channel
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Support;