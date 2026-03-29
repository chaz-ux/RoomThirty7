import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Home.css';

interface Game {
  title: string;
  desc: string;
  link: string;
  emoji: string;
  c1: string;
  c2: string;
}

const GAMES: Game[] = [
  { title: 'Mafia',          desc: 'Deceive your friends or find the truth. Trust no one.',      link: '/lobby?game=mafia',      emoji: '🎭', c1: '#ff1744', c2: '#d500f9' },
  { title: 'Guess the Movie',desc: 'Decode the emoji clues before the clock runs out.',           link: '/lobby?game=movie',      emoji: '🍿', c1: '#2979ff', c2: '#00e5ff' },
  { title: 'Imposter',       desc: 'Hunt the imposter or survive as one. Chaos guaranteed.',     link: '/lobby?game=imposter',   emoji: '🕵️', c1: '#ff6d00', c2: '#ffd600' },
  { title: '30 Seconds',     desc: '5 words. 30 seconds. Talk fast or lose everything.',         link: '/lobby?game=30seconds',  emoji: '⏱️', c1: '#00c853', c2: '#00e5ff' },
  { title: 'Charades',       desc: 'Act it out — no sounds, no words, just pure chaos.',        link: '/lobby?game=charades',   emoji: '🎬', c1: '#aa00ff', c2: '#ff1744' },
  { title: 'Hangman',        desc: 'One letter at a time. Don\'t let the stick figure die.',    link: '/lobby?game=hangman',    emoji: '⚡', c1: '#ffd600', c2: '#ff6d00' },
];

const GameCard: React.FC<Game> = ({ title, desc, link, emoji, c1, c2 }) => (
  <Link
    to={link}
    className="game-card"
    style={{ '--c1': c1, '--c2': c2 } as React.CSSProperties}
  >
    <div className="game-card-pattern" />
    <div className="game-card-stripe" />
    <div className="game-card-emoji">{emoji}</div>
    <div className="game-card-body">
      <div className="game-card-title">{title}</div>
      <p className="game-card-desc">{desc}</p>
      <span className="game-card-cta">Play</span>
    </div>
  </Link>
);

const Home: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (navigator.vibrate) navigator.vibrate([30, 80, 30]);
  }, []);

  return (
    <div className="home-wrap">
      {/* Ambient blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* Top bar */}
      <div className="home-topbar">
        <button className="theme-btn" onClick={toggleTheme}>
          {theme === 'vibrant' ? '🌑 Dark' : '☀️ Light'}
        </button>
      </div>

      {/* Hero */}
      <header className="home-hero">
        <div className="home-logo">
          <span className="logo-r37">ROOM 37</span>
          <span className="logo-tag">Party Games HQ</span>
        </div>
        <p className="home-tagline">
          No boards. No pieces. Just your friends, your phone, and maximum chaos.
        </p>
      </header>

      {/* Games */}
      <p className="home-section-label">Pick a game</p>
      <div className="games-grid">
        {GAMES.map(g => <GameCard key={g.title} {...g} />)}
      </div>

      {/* Support CTA */}
      <footer className="home-footer">
        <Link to="/support" className="support-cta">
          <span className="support-cta-icon">🔥</span>
          <div className="support-cta-text">
            <span className="support-cta-title">Support the Chaos</span>
            <span className="support-cta-sub">YouTube · M-Pesa · Keep us alive</span>
          </div>
          <span className="support-cta-arrow">→</span>
        </Link>
      </footer>
    </div>
  );
};

export default Home;