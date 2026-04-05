import React, { useState, useEffect, useRef } from 'react';
import { submitFeedback, detectGame, getSessionId, FeedbackType } from '../services/feedbackService';
import './Feedback.css';

interface FeedbackModalProps {
  onClose: () => void;
}

const TYPES: { value: FeedbackType; label: string; icon: string; hint: string }[] = [
  { value: 'bug',        icon: '🐛', label: 'Bug',        hint: 'Something broke or behaved wrong' },
  { value: 'experience', icon: '💬', label: 'Experience',  hint: 'How did it feel to play?' },
  { value: 'suggestion', icon: '💡', label: 'Idea',        hint: 'A new game or feature you want' },
];

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
  const [type, setType]       = useState<FeedbackType | null>(null);
  const [rating, setRating]   = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [text, setText]       = useState('');
  const [status, setStatus]   = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const textRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when a type is selected
  useEffect(() => {
    if (type && textRef.current) {
      setTimeout(() => textRef.current?.focus(), 50);
    }
  }, [type]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async () => {
    if (!type || text.trim().length < 3) return;
    setStatus('sending');
    try {
      await submitFeedback({
        type,
        rating,
        text: text.trim(),
        game: detectGame(),
        sessionId: getSessionId(),
      });
      setStatus('done');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  const canSubmit = type && text.trim().length >= 3 && status === 'idle';

  return (
    <div className="fb-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="fb-sheet" role="dialog" aria-modal aria-label="Send feedback">

        {/* ── Header ── */}
        <div className="fb-header">
          <span className="fb-header-title">Send feedback</span>
          <button className="fb-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {status === 'done' ? (
          /* ── Success state ── */
          <div className="fb-done">
            <span className="fb-done-icon">✓</span>
            <p className="fb-done-msg">Got it — thanks for helping make Room 37 better.</p>
            <button className="fb-btn-primary" onClick={onClose}>Close</button>
          </div>

        ) : status === 'error' ? (
          /* ── Error state ── */
          <div className="fb-done">
            <span className="fb-done-icon fb-error-icon">!</span>
            <p className="fb-done-msg">Couldn't send right now. Try again in a sec.</p>
            <button className="fb-btn-secondary" onClick={() => setStatus('idle')}>Retry</button>
          </div>

        ) : (
          <>
            {/* ── Type selector ── */}
            <div className="fb-type-row">
              {TYPES.map(t => (
                <button
                  key={t.value}
                  className={`fb-type-btn ${type === t.value ? 'active' : ''}`}
                  onClick={() => setType(t.value)}
                  title={t.hint}
                >
                  <span className="fb-type-icon">{t.icon}</span>
                  <span className="fb-type-label">{t.label}</span>
                </button>
              ))}
            </div>

            {/* ── Hint line ── */}
            {type && (
              <p className="fb-hint">
                {TYPES.find(t => t.value === type)?.hint}
              </p>
            )}

            {/* ── Star rating (optional) ── */}
            <div className="fb-stars" role="group" aria-label="Rating (optional)">
              <span className="fb-stars-label">Rating</span>
              <div className="fb-star-row">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    className={`fb-star ${(hovered ?? rating ?? 0) >= n ? 'lit' : ''}`}
                    onClick={() => setRating(rating === n ? null : n)}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(null)}
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  >★</button>
                ))}
                {rating && (
                  <button className="fb-star-clear" onClick={() => setRating(null)} title="Clear rating">✕</button>
                )}
              </div>
            </div>

            {/* ── Text area ── */}
            <textarea
              ref={textRef}
              className="fb-textarea"
              placeholder={
                type === 'bug'        ? 'Describe what happened and what you expected…' :
                type === 'experience' ? 'Tell us what felt good, bad, or confusing…' :
                type === 'suggestion' ? 'What game or feature would you love to see?' :
                'Select a category above, then describe your feedback…'
              }
              value={text}
              onChange={e => setText(e.target.value)}
              maxLength={1000}
              rows={4}
            />
            <div className="fb-char-count">{text.length}/1000</div>

            {/* ── Submit ── */}
            <button
              className={`fb-btn-primary ${!canSubmit ? 'disabled' : ''} ${status === 'sending' ? 'loading' : ''}`}
              onClick={handleSubmit}
              disabled={!canSubmit || status === 'sending'}
            >
              {status === 'sending' ? 'Sending…' : 'Send feedback'}
            </button>

            <p className="fb-footer-note">Just you and the dev — no public posts.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;