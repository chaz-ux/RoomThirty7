import React, { useState, useEffect, useMemo } from 'react';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import app from '../firebase';
import { summariseFeedback, FeedbackSummary, PriorityItem } from '../services/aiSummaryService';
import { FeedbackType } from '../services/feedbackService';
import './Admin.css';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeedbackDoc {
  id: string;
  type: FeedbackType;
  rating: number | null;
  text: string;
  game: string;
  device: string;
  screenW: number;
  uid: string;
  createdAt: Timestamp | null;
  resolved: boolean;
  adminNote: string;
}

// ─── Access gate ──────────────────────────────────────────────────────────────
// Simple password stored in .env. Not cryptographic — just keeps the
// route from being stumbled upon. Change VITE_ADMIN_PASSWORD in .env.

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'r37admin';

const AccessGate: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(false);

  const attempt = () => {
    if (pw === ADMIN_PASSWORD) {
      localStorage.setItem('r37_admin_auth', '1');
      onUnlock();
    } else {
      setErr(true);
      setPw('');
      setTimeout(() => setErr(false), 1500);
    }
  };

  return (
    <div className="adm-gate">
      <div className="adm-gate-card">
        <h1 className="adm-gate-title">Room 37 Admin</h1>
        <input
          className={`adm-gate-input ${err ? 'shake' : ''}`}
          type="password"
          placeholder="Password"
          value={pw}
          autoFocus
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && attempt()}
        />
        <button className="adm-gate-btn" onClick={attempt}>Enter</button>
        {err && <p className="adm-gate-err">Wrong password</p>}
      </div>
    </div>
  );
};

// ─── Urgency badge ────────────────────────────────────────────────────────────

const UrgencyBadge: React.FC<{ urgency: PriorityItem['urgency'] }> = ({ urgency }) => (
  <span className={`adm-urgency adm-urgency-${urgency}`}>
    {urgency === 'high' ? '🔴 High' : urgency === 'medium' ? '🟡 Med' : '🟢 Low'}
  </span>
);

// ─── AI Summary panel ────────────────────────────────────────────────────────

const SummaryPanel: React.FC<{ docs: FeedbackDoc[] }> = ({ docs }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [errMsg, setErrMsg]   = useState('');

  const run = async () => {
    setStatus('loading');
    try {
      const result = await summariseFeedback(docs);
      setSummary(result);
      setStatus('done');
    } catch (e: any) {
      setErrMsg(e.message ?? 'Unknown error');
      setStatus('error');
    }
  };

  const unresolvedCount = docs.filter(d => !d.resolved).length;

  return (
    <div className="adm-ai-panel">
      <div className="adm-ai-header">
        <div>
          <h2 className="adm-ai-title">✨ AI Summary</h2>
          <p className="adm-ai-sub">Summarise {unresolvedCount} unresolved items with Gemini 2.5 Flash</p>
        </div>
        <button
          className={`adm-ai-btn ${status === 'loading' ? 'loading' : ''}`}
          onClick={run}
          disabled={status === 'loading' || unresolvedCount === 0}
        >
          {status === 'loading' ? 'Thinking…' : 'Summarise & prioritise'}
        </button>
      </div>

      {status === 'error' && (
        <div className="adm-ai-error">
          <strong>Error:</strong> {errMsg}
          <br /><span className="adm-dim">Check VITE_GEMINI_KEY in your .env</span>
        </div>
      )}

      {status === 'done' && summary && (
        <div className="adm-ai-result">
          <div className="adm-ai-topaction">
            <span className="adm-ai-topaction-label">Top priority</span>
            <p>{summary.topAction}</p>
          </div>
          <p className="adm-ai-overview">{summary.overview}</p>

          {[
            { label: '🐛 Bugs', items: summary.bugs },
            { label: '💬 UX', items: summary.ux },
            { label: '💡 Ideas', items: summary.ideas },
          ].map(({ label, items }) =>
            items.length > 0 && (
              <div key={label} className="adm-ai-section">
                <h3 className="adm-ai-section-title">{label}</h3>
                {items.map((item, i) => (
                  <div key={i} className="adm-ai-item">
                    <div className="adm-ai-item-row">
                      <span className="adm-ai-item-title">{item.title}</span>
                      <UrgencyBadge urgency={item.urgency} />
                      {item.count > 1 && (
                        <span className="adm-ai-count">×{item.count}</span>
                      )}
                    </div>
                    <p className="adm-ai-item-detail">{item.detail}</p>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

// ─── Feedback card ────────────────────────────────────────────────────────────

const FeedbackCard: React.FC<{ doc: FeedbackDoc; onUpdate: (id: string, data: Partial<FeedbackDoc>) => void }> =
  ({ doc: fb, onUpdate }) => {
    const [note, setNote] = useState(fb.adminNote);
    const [noteDirty, setNoteDirty] = useState(false);

    const typeIcon = fb.type === 'bug' ? '🐛' : fb.type === 'experience' ? '💬' : '💡';
    const gameLabel = fb.game.charAt(0).toUpperCase() + fb.game.slice(1);
    const dateStr = fb.createdAt?.toDate().toLocaleString('en-GB', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    }) ?? '—';

    const saveNote = () => {
      onUpdate(fb.id, { adminNote: note });
      setNoteDirty(false);
    };

    return (
      <div className={`adm-card ${fb.resolved ? 'resolved' : ''}`}>
        <div className="adm-card-meta">
          <span className="adm-type-badge" data-type={fb.type}>{typeIcon} {fb.type}</span>
          <span className="adm-game-badge">{gameLabel}</span>
          <span className="adm-device-badge">{fb.device}</span>
          {fb.rating && (
            <span className="adm-rating">{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</span>
          )}
          <span className="adm-date">{dateStr}</span>
          <button
            className={`adm-resolve-btn ${fb.resolved ? 'done' : ''}`}
            onClick={() => onUpdate(fb.id, { resolved: !fb.resolved })}
            title={fb.resolved ? 'Mark unresolved' : 'Mark resolved'}
          >
            {fb.resolved ? '✓ Resolved' : 'Resolve'}
          </button>
        </div>

        <p className="adm-card-text">{fb.text}</p>

        <div className="adm-note-row">
          <input
            className="adm-note-input"
            placeholder="Add a note…"
            value={note}
            onChange={e => { setNote(e.target.value); setNoteDirty(true); }}
            onKeyDown={e => e.key === 'Enter' && saveNote()}
          />
          {noteDirty && (
            <button className="adm-note-save" onClick={saveNote}>Save</button>
          )}
        </div>
      </div>
    );
  };

// ─── Main Admin page ──────────────────────────────────────────────────────────

const Admin: React.FC = () => {
  const [authed, setAuthed] = useState(
    () => localStorage.getItem('r37_admin_auth') === '1'
  );
  const [docs, setDocs]     = useState<FeedbackDoc[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter]       = useState<FeedbackType | 'all'>('all');
  const [gameFilter, setGameFilter]       = useState('all');
  const [resolvedFilter, setResolvedFilter] = useState<'all' | 'open' | 'resolved'>('open');

  useEffect(() => {
    if (!authed || !app) return;

    const auth = getAuth(app);
    const db = getFirestore(app);

    // Wait for auth state before opening the Firestore listener
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
        if (!user) {
            // Sign in anonymously if no user yet
            try {
                await signInAnonymously(auth);
            } catch (e) {
                console.error('Auth failed', e);
            }
            return; // onAuthStateChanged will fire again once signed in
        }

        // User is now authenticated — safe to open Firestore listener
        const q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));
        const unsubFirestore = onSnapshot(q, snap => {
            const items: FeedbackDoc[] = snap.docs.map(d => ({
                id: d.id,
                ...(d.data() as Omit<FeedbackDoc, 'id'>),
            }));
            setDocs(items);
            setLoading(false);
        });

        // Cleanup Firestore listener when auth listener unmounts
        return () => unsubFirestore();
    });

    return () => unsubAuth();
}, [authed]);

  const handleUpdate = async (id: string, data: Partial<FeedbackDoc>) => {
    if (!app) return;
    const db = getFirestore(app);
    await updateDoc(doc(db, 'feedback', id), data);
  };

  // Unique games for filter dropdown
  const games = useMemo(() => {
    const g = new Set(docs.map(d => d.game));
    return ['all', ...Array.from(g).sort()];
  }, [docs]);

  const filtered = useMemo(() => {
    return docs.filter(d => {
      if (typeFilter !== 'all' && d.type !== typeFilter) return false;
      if (gameFilter !== 'all' && d.game !== gameFilter) return false;
      if (resolvedFilter === 'open' && d.resolved) return false;
      if (resolvedFilter === 'resolved' && !d.resolved) return false;
      return true;
    });
  }, [docs, typeFilter, gameFilter, resolvedFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: docs.length,
    open: docs.filter(d => !d.resolved).length,
    bugs: docs.filter(d => d.type === 'bug').length,
    suggestions: docs.filter(d => d.type === 'suggestion').length,
  }), [docs]);

  if (!authed) return <AccessGate onUnlock={() => setAuthed(true)} />;

  return (
    <div className="adm-root">
      <header className="adm-header">
        <h1 className="adm-logo">Room 37 <span>Admin</span></h1>
        <button className="adm-logout" onClick={() => {
          localStorage.removeItem('r37_admin_auth');
          setAuthed(false);
        }}>Log out</button>
      </header>

      {/* Stats bar */}
      <div className="adm-stats">
        <div className="adm-stat"><span className="adm-stat-n">{stats.total}</span><span>Total</span></div>
        <div className="adm-stat open"><span className="adm-stat-n">{stats.open}</span><span>Open</span></div>
        <div className="adm-stat"><span className="adm-stat-n">{stats.bugs}</span><span>Bugs</span></div>
        <div className="adm-stat"><span className="adm-stat-n">{stats.suggestions}</span><span>Ideas</span></div>
      </div>

      {/* AI Summary */}
      <SummaryPanel docs={docs.filter(d => !d.resolved)} />

      {/* Filters */}
      <div className="adm-filters">
        <select className="adm-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)}>
          <option value="all">All types</option>
          <option value="bug">🐛 Bugs</option>
          <option value="experience">💬 Experience</option>
          <option value="suggestion">💡 Ideas</option>
        </select>

        <select className="adm-select" value={gameFilter} onChange={e => setGameFilter(e.target.value)}>
          {games.map(g => (
            <option key={g} value={g}>{g === 'all' ? 'All games' : g.charAt(0).toUpperCase() + g.slice(1)}</option>
          ))}
        </select>

        <select className="adm-select" value={resolvedFilter} onChange={e => setResolvedFilter(e.target.value as any)}>
          <option value="open">Open only</option>
          <option value="all">All</option>
          <option value="resolved">Resolved</option>
        </select>

        <span className="adm-filter-count">{filtered.length} showing</span>
      </div>

      {/* Cards */}
      <div className="adm-list">
        {loading ? (
          <p className="adm-empty">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="adm-empty">No feedback matching those filters.</p>
        ) : (
          filtered.map(fb => (
            <FeedbackCard key={fb.id} doc={fb} onUpdate={handleUpdate} />
          ))
        )}
      </div>
    </div>
  );
};

export default Admin;