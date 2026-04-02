import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Lobby from './pages/Lobby';

import MafiaGame from './games/mafia/MafiaGame';
import MovieGame from './games/movie/MovieGame';
import ImposterGame from './games/imposter/ImposterGame';
import ThirtySecondsGame from './games/30seconds/ThirtySecondsGame';
// import CharadesGame from './games/charades/CharadesGame';
import HangmanGame from './games/hangman/HangmanGame';

import Support from './pages/Support';

import { ThemeProvider } from './context/ThemeContext';
import { MultiplayerProvider } from './context/MultiplayerContext';

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <MultiplayerProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/lobby" element={<Lobby />} />
                        <Route path="/support" element={<Support />} />
                        <Route path="/mafia/*" element={<MafiaGame />} />
                        <Route path="/movie/*" element={<MovieGame />} />
                        <Route path="/imposter/*" element={<ImposterGame />} />
                        <Route path="/30seconds/*" element={<ThirtySecondsGame />} />
                        {/* <Route path="/charades/*" element={<CharadesGame />} /> */}
                        <Route path="/hangman/*" element={<HangmanGame />} />
                    </Routes>
                </Router>
            </MultiplayerProvider>
        </ThemeProvider>
    );
};

export default App;
