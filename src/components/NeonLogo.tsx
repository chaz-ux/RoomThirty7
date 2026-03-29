import React, { useEffect, useRef, useState } from 'react';
import './NeonLogo.css';

const TAGLINES = [
  'No boards. No pieces. Just chaos.',
  'Six games. One room. Maximum damage.',
  'Play at roomthirty7-baefb.web.app',
];

const NeonLogo: React.FC = () => {
  const [state, setState] = useState<'A' | 'B'>('A');
  const [phase, setPhase] = useState<'steady' | 'showing' | 'hiding'>('steady');
  const [tagIdx, setTagIdx] = useState(0);
  const [tagVisible, setTagVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const cycle = () => {
      // flicker out
      setPhase('hiding');
      setTimeout(() => {
        setState(s => s === 'A' ? 'B' : 'A');
        setPhase('showing');
        // rotate tagline
        setTagVisible(false);
        setTimeout(() => {
          setTagIdx(i => (i + 1) % TAGLINES.length);
          setTagVisible(true);
        }, 220);
        setTimeout(() => setPhase('steady'), 300);
      }, 180);
    };

    timerRef.current = setInterval(cycle, 2500);
    return () => clearInterval(timerRef.current);
  }, []);

  const aClass = `neon-state ${state === 'A' ? `neon-${phase}` : 'neon-hidden'}`;
  const bClass = `neon-state ${state === 'B' ? `neon-${phase}` : 'neon-hidden'}`;

  return (
    <div className="neon-hero">
      {/* ambient glow blobs */}
      <div className="neon-blob neon-blob-1" />
      <div className="neon-blob neon-blob-2" />
      <div className="neon-blob neon-blob-3" />

      <svg
        className="neon-svg"
        viewBox="0 0 640 130"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="ROOM 37 - Party Games"
      >
        <defs>
          <filter id="nr" x="-30%" y="-60%" width="160%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3"  result="b1"/>
            <feGaussianBlur in="SourceGraphic" stdDeviation="8"  result="b2"/>
            <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="b3"/>
            <feMerge><feMergeNode in="b3"/><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="no" x="-30%" y="-60%" width="160%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b1"/>
            <feGaussianBlur in="SourceGraphic" stdDeviation="7"   result="b2"/>
            <feGaussianBlur in="SourceGraphic" stdDeviation="16"  result="b3"/>
            <feMerge><feMergeNode in="b3"/><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="ny" x="-30%" y="-60%" width="160%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2"  result="b1"/>
            <feGaussianBlur in="SourceGraphic" stdDeviation="6"  result="b2"/>
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="b3"/>
            <feMerge><feMergeNode in="b3"/><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* ── STATE A: ROOM37 ── */}
        <g className={aClass}>
          <text className="nt" x="220" y="68" fontSize="88" fill="#ff1744" filter="url(#nr)" opacity="0.25">ROOM</text>
          <text className="nt" x="220" y="68" fontSize="88" fill="#ff1744" filter="url(#nr)">ROOM</text>
          <circle className="neon-dot" cx="414" cy="68" r="5" fill="#ff6d00" filter="url(#no)"/>
          <text className="nt" x="470" y="68" fontSize="88" fill="#ff6d00" filter="url(#no)" opacity="0.2">3</text>
          <text className="nt" x="470" y="68" fontSize="88" fill="#ff6d00" filter="url(#no)">3</text>
          <text className="nt" x="540" y="68" fontSize="88" fill="#ffd600" filter="url(#ny)" opacity="0.2">7</text>
          <text className="nt" x="540" y="68" fontSize="88" fill="#ffd600" filter="url(#ny)">7</text>
        </g>

        {/* ── STATE B: RoomThirty7 ── */}
        <g className={bClass}>
          <text className="nt" x="128" y="58" fontSize="52" fill="#ff1744" filter="url(#nr)" opacity="0.2">Room</text>
          <text className="nt" x="128" y="58" fontSize="52" fill="#ff1744" filter="url(#nr)">Room</text>
          <text className="nt" x="362" y="58" fontSize="52" fill="#ff6d00" filter="url(#no)" opacity="0.2">Thirty</text>
          <text className="nt" x="362" y="58" fontSize="52" fill="#ff6d00" filter="url(#no)">Thirty</text>
          <text className="nt" x="575" y="58" fontSize="52" fill="#ffd600" filter="url(#ny)" opacity="0.2">7</text>
          <text className="nt" x="575" y="58" fontSize="52" fill="#ffd600" filter="url(#ny)">7</text>
          <line x1="40" y1="84" x2="600" y2="84" stroke="#ff1744" strokeWidth="1.5" filter="url(#nr)" opacity="0.5"/>
          <text className="nt" x="320" y="108" fontSize="14" fill="#ff6d00" filter="url(#no)" letterSpacing="6" textAnchor="middle">PARTY GAMES HQ</text>
        </g>
      </svg>

      {/* tagline */}
      <p className={`neon-tagline ${tagVisible ? 'neon-tag-in' : 'neon-tag-out'}`}>
        {TAGLINES[tagIdx]}
      </p>
    </div>
  );
};

export default NeonLogo;