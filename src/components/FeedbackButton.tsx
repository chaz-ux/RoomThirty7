import React, { useState, lazy, Suspense } from 'react';
import './Feedback.css';

const FeedbackModal = lazy(() => import('./FeedbackModal'));

// Wrap your app layout with this component at the root level (inside Router)
// It renders a persistent floating button that opens the feedback sheet.

const FeedbackButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="fb-fab"
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
        title="Send feedback"
      >
        <span className="fb-fab-icon">💬</span>
      </button>

      {open && (
        <Suspense fallback={null}>
          <FeedbackModal onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
};

export default FeedbackButton;