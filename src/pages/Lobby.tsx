import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMultiplayer } from '../context/MultiplayerContext';
import './Lobby.css';

const GAME_META: Record<string, { emoji: string; label: string }> = {
  mafia:       { emoji: '🎭', label: 'Mafia' },
  movie:       { emoji: '🍿', label: 'Guess the Movie' },
  imposter:    { emoji: '🕵️', label: 'Imposter' },
  '30seconds': { emoji: '⏱️', label: '30 Seconds' },
  charades:    { emoji: '🎬', label: 'Charades' },
  hangman:     { emoji: '⚡', label: 'Hangman' },
};

type SetupState = 'MODE_SELECT' | 'LOCAL_SETUP' | 'ONLINE_SETUP' | 'ONLINE_HOST' | 'ONLINE_JOIN';

const Lobby: React.FC = () => {
  const [searchParams] = useSearchParams();
  const gameId   = searchParams.get('game') ?? '';
  const navigate = useNavigate();

  const {
    roomCode, players, setMode,
    createOnlineRoom, joinOnlineRoom,
    addLocalPlayer, removeLocalPlayer,
    setSharedState, sharedState,
  } = useMultiplayer();

  const [setupState, setSetupState] = useState<SetupState>('MODE_SELECT');
  const [errorMsg,   setErrorMsg]   = useState('');

  // ── KEY FIX: uncontrolled refs instead of controlled state ──
  // Controlled state (useState) causes re-renders from the multiplayer
  // context that reset the input every keystroke. Refs are immune.
  const localNameRef  = useRef<HTMLInputElement>(null);
  const onlineNameRef = useRef<HTMLInputElement>(null);
  const joinCodeRef   = useRef<HTMLInputElement>(null);

  const meta = GAME_META[gameId] ?? { emoji: '🎮', label: gameId.toUpperCase() };

  useEffect(() => {
    if (sharedState?.gameStarted && gameId) navigate(`/${gameId}`);
  }, [sharedState?.gameStarted, navigate, gameId]);

  // ── Local setup ────────────────────────────────────────────
  const addPlayer = () => {
    const val = localNameRef.current?.value.trim();
    if (!val) return;
    addLocalPlayer(val);
    if (localNameRef.current) localNameRef.current.value = '';
    localNameRef.current?.focus();
  };

  const handleLocalStart = () => {
    if (players.length < 1) { setErrorMsg('Need at least 1 player!'); return; }
    navigate(`/${gameId}`);
  };

  // ── Online ─────────────────────────────────────────────────
  const handleHostStart = async () => {
    if (players.length < 1) { setErrorMsg('Need at least 1 player!'); return; }
    await setSharedState({ gameStarted: true });
    navigate(`/${gameId}`);
  };

  const handleCreateRoom = async () => {
    const name = onlineNameRef.current?.value.trim();
    if (!name) { setErrorMsg('Enter your name first'); return; }
    try {
      await createOnlineRoom(name);
      setSetupState('ONLINE_HOST');
      setErrorMsg('');
    } catch (e: any) { setErrorMsg(e.message ?? 'Failed to create room'); }
  };

  const handleJoinRoom = async () => {
    const name = onlineNameRef.current?.value.trim();
    const code = joinCodeRef.current?.value.trim();
    if (!name || !code) { setErrorMsg('Enter name and room code'); return; }
    try {
      const ok = await joinOnlineRoom(code.toUpperCase(), name);
      if (ok) { setSetupState('ONLINE_JOIN'); setErrorMsg(''); }
      else setErrorMsg('Room not found!');
    } catch (e: any) { setErrorMsg(e.message ?? 'Failed to join room'); }
  };

  // ── Renders ────────────────────────────────────────────────
  const ModeSelect = () => (
    <>
      <h2>How are you playing?</h2>
      <div className="mode-cards">
        <button className="mode-card" onClick={() => { setMode('local'); setSetupState('LOCAL_SETUP'); }}>
          <span className="mode-card-icon">🎮</span>
          <div className="mode-card-text">
            <span className="mode-card-title">Local Pass & Play</span>
            <span className="mode-card-sub">One device, passed around the room</span>
          </div>
        </button>
        <button className="mode-card" onClick={() => setSetupState('ONLINE_SETUP')}>
          <span className="mode-card-icon">🌐</span>
          <div className="mode-card-text">
            <span className="mode-card-title">Online Multiplayer</span>
            <span className="mode-card-sub">Everyone on their own phone</span>
          </div>
        </button>
      </div>
      <button className="back-link" onClick={() => navigate('/')}>← Back to Hub</button>
    </>
  );

  const LocalSetup = () => (
    <>
      <h2>Add Players</h2>
      <div className="input-row">
        {/* Uncontrolled input — immune to context re-renders */}
        <input
          ref={localNameRef}
          type="text"
          placeholder="Player name..."
          defaultValue=""
          onKeyDown={e => e.key === 'Enter' && addPlayer()}
          autoFocus
          autoCapitalize="words"
          autoComplete="off"
        />
        <button className="btn-add" onClick={addPlayer}>Add</button>
      </div>
      <div className="players-list">
        {players.map(p => (
          <div key={p.id} className="player-chip">
            {p.name}
            <button className="player-chip-remove" onClick={() => removeLocalPlayer(p.id)}>×</button>
          </div>
        ))}
      </div>
      {errorMsg && <div className="error-msg">{errorMsg}</div>}
      <button className="btn btn-primary w-full" onClick={handleLocalStart}>Start Game →</button>
      <button className="back-link" onClick={() => { setMode(null); setSetupState('MODE_SELECT'); }}>← Change mode</button>
    </>
  );

  const OnlineSetup = () => (
    <>
      <h2>Online Multiplayer</h2>
      {/* Uncontrolled input for name */}
      <input
        ref={onlineNameRef}
        type="text"
        placeholder="Your name"
        defaultValue=""
        autoCapitalize="words"
        autoComplete="off"
        autoFocus
      />
      {errorMsg && <div className="error-msg">{errorMsg}</div>}
      <div className="online-split">
        <div className="online-box">
          <h3>Host</h3>
          <button className="btn btn-primary" onClick={handleCreateRoom}>Create Room</button>
        </div>
        <div className="online-box">
          <h3>Join</h3>
          <input
            ref={joinCodeRef}
            type="text"
            className="code-input"
            placeholder="CODE"
            maxLength={4}
            defaultValue=""
            autoCapitalize="characters"
            autoComplete="off"
          />
          <button className="btn btn-outline" onClick={handleJoinRoom}>Join</button>
        </div>
      </div>
      <button className="back-link" onClick={() => setSetupState('MODE_SELECT')}>← Change mode</button>
    </>
  );

  const OnlineHost = () => (
    <>
      <div className="room-code-display">
        <div className="room-code-label">Room Code</div>
        <div className="room-code">{roomCode}</div>
        <div className="room-code-hint">Share this with your friends</div>
      </div>
      <div className="players-list">
        {players.map(p => (
          <div key={p.id} className="player-chip">
            {p.isHost && <span className="player-chip-host">👑</span>}
            {p.name}
          </div>
        ))}
      </div>
      {errorMsg && <div className="error-msg">{errorMsg}</div>}
      <button className="btn btn-primary w-full" onClick={handleHostStart}>Start Game →</button>
    </>
  );

  const OnlineJoin = () => (
    <>
      <div className="room-code-display">
        <div className="room-code-label">Joined Room</div>
        <div className="room-code">{roomCode}</div>
      </div>
      <div className="waiting-pulse">
        Waiting for host
        <span className="waiting-dots"><span /><span /><span /></span>
      </div>
      <div className="players-list">
        {players.map(p => (
          <div key={p.id} className="player-chip">
            {p.isHost && <span className="player-chip-host">👑</span>}
            {p.name}
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="lobby-wrap">
      <div className="lobby-game-pill">
        <span className="lobby-game-pill-emoji">{meta.emoji}</span>
        {meta.label}
      </div>
      <div className="lobby-panel">
        {setupState === 'MODE_SELECT'  && <ModeSelect />}
        {setupState === 'LOCAL_SETUP'  && <LocalSetup />}
        {setupState === 'ONLINE_SETUP' && <OnlineSetup />}
        {setupState === 'ONLINE_HOST'  && <OnlineHost />}
        {setupState === 'ONLINE_JOIN'  && <OnlineJoin />}
      </div>
    </div>
  );
};

export default Lobby;