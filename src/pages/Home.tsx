import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Home.css';

interface GameCardProps {
    title: string;
    description: string;
    link: string;
    color: string;
    icon: string;
}

const GameCard: React.FC<GameCardProps> = ({ title, description, link, color, icon }) => (
    <Link to={link} className="game-card" style={{ '--card-accent': color } as React.CSSProperties}>
        <div className="game-card-bg"></div>
        <div className="game-card-content">
            <div className="card-icon">{icon}</div>
            <h3>{title}</h3>
            <p>{description}</p>
            <span className="play-btn">START GAME &raquo;</span>
        </div>
    </Link>
);

const Home: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    // Chaotic global intro vibration on mobile
    useEffect(() => {
        if(navigator.vibrate) navigator.vibrate([30, 100, 30]);
    }, []);

    const games = [
        { title: "Mafia", description: "Deceive your friends or find the truth in the ultimate social deduction game.", link: "/lobby?game=mafia", color: "#ff3366", icon: "🎭" },
        { title: "Guess the Movie", description: "Can you decode the emojis and guess the blockbuster before time runs out?", link: "/lobby?game=movie", color: "#00d4ff", icon: "🍿" },
        { title: "Imposter", description: "Find the hidden imposter among the crew before it's too late.", link: "/lobby?game=imposter", color: "#ff0055", icon: "🕵️" },
        { title: "30 Seconds", description: "Describe 5 words in 30 seconds without saying the actual words. Fast & chaotic!", link: "/lobby?game=30seconds", color: "#ffcc00", icon: "⏱️" },
        { title: "Charades", description: "Act it out! A modern twist on the classic party game.", link: "/lobby?game=charades", color: "#8a2be2", icon: "🎬" },
        { title: "Hangman", description: "Guess the word before the hangman is complete. Classic word game fun!", link: "/lobby?game=hangman", color: "#00ff88", icon: "⚡" },
    ];

    return (
        <div className="home-container container" style={{overflowX: 'hidden'}}>
            <div className="theme-toggle-wrapper">
                <button onClick={toggleTheme} className="theme-toggle-btn">
                    {theme === 'vibrant' ? '🌌 Dark Mode' : '🌅 Vibrant Mode'}
                </button>
            </div>

            <header className="home-header">
                <div className="logo-glitch" data-text="ROOM 37">ROOM 37</div>
                <p className="subtitle">Premium chaotic party games. No boards, no pieces.</p>
            </header>

            <div className="games-grid">
                {games.map(game => (
                    <GameCard
                        key={game.title}
                        {...game}
                    />
                ))}
            </div>

            <footer style={{ marginTop: '4rem', textAlign: 'center', paddingBottom: '3rem', width: '100%' }}>
                <Link to="/support" className="support-cta-btn">
                    <span className="cta-icon">🔥</span>
                    <div className="cta-text">
                        <strong>SUPPORT THE CHAOS</strong>
                        <small>Join us on YouTube & Keep the servers alive!</small>
                    </div>
                    <span className="cta-arrow">&raquo;</span>
                </Link>
            </footer>
        </div>
    );
};

export default Home;
