import { getFirestore, collection, addDoc, serverTimestamp, Firestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import app from '../firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FeedbackType = 'bug' | 'experience' | 'suggestion';

export interface FeedbackPayload {
  type: FeedbackType;
  rating: number | null;  // 1–5, null = skipped
  text: string;
  game: string;           // e.g. 'mafia', 'hangman', 'home'
  sessionId: string;
}

export interface FeedbackDoc extends FeedbackPayload {
  uid: string;
  device: 'mobile' | 'tablet' | 'desktop';
  screenW: number;
  userAgent: string;
  createdAt: any;         // Firestore ServerTimestamp
  resolved: boolean;
  adminNote: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getDevice = (): 'mobile' | 'tablet' | 'desktop' => {
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
};

// Stable session ID per browser tab (resets on new tab/refresh)
let _sessionId: string | null = null;
export const getSessionId = (): string => {
  if (!_sessionId) {
    _sessionId = Math.random().toString(36).slice(2, 10);
  }
  return _sessionId;
};

// Detect current game from URL path
export const detectGame = (): string => {
  const path = window.location.pathname;
  if (path.startsWith('/mafia'))      return 'mafia';
  if (path.startsWith('/movie'))      return 'movie';
  if (path.startsWith('/imposter'))   return 'imposter';
  if (path.startsWith('/30seconds'))  return '30seconds';
  if (path.startsWith('/hangman'))    return 'hangman';
  if (path.startsWith('/charades'))   return 'charades';
  if (path.startsWith('/lobby'))      return 'lobby';
  return 'home';
};

// ─── Submit ───────────────────────────────────────────────────────────────────

export const submitFeedback = async (payload: FeedbackPayload): Promise<void> => {
  if (!app) throw new Error('Firebase not initialized');

  const auth = getAuth(app);
  const db: Firestore = getFirestore(app);

  // Ensure the user has an anonymous UID (creates one silently if not)
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (e) {
      console.warn('Anonymous sign-in failed, proceeding without UID', e);
    }
  }

  const doc: FeedbackDoc = {
    ...payload,
    uid: auth.currentUser?.uid ?? 'unknown',
    device: getDevice(),
    screenW: window.innerWidth,
    userAgent: navigator.userAgent,
    createdAt: serverTimestamp(),
    resolved: false,
    adminNote: '',
  };

  await addDoc(collection(db, 'feedback'), doc);
};