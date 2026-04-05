// ─── AI Summary Service ───────────────────────────────────────────────────────
// Uses Gemini 2.5 Flash (free tier) to summarise and prioritise feedback.
// Called only from the Admin page when you click "Summarise".
//
// FREE TIER LIMITS (as of April 2026):
//   • 10 requests/min, 250 requests/day
//   • For admin-only manual use this is more than enough.
//
// SETUP: Get a free API key at https://aistudio.google.com/
//   Then add to your .env:  VITE_GEMINI_KEY=your_key_here
// ─────────────────────────────────────────────────────────────────────────────

export interface FeedbackSummary {
  overview: string;
  bugs: PriorityItem[];
  ux: PriorityItem[];
  ideas: PriorityItem[];
  topAction: string;
}

export interface PriorityItem {
  title: string;
  detail: string;
  count: number;   // how many similar reports
  urgency: 'high' | 'medium' | 'low';
}

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const buildPrompt = (feedback: any[]): string => `
You are a game developer's assistant reviewing beta feedback for Room 37 — a party game PWA 
with games like Mafia, Hangman, Imposter, 30 Seconds, and Movie.

Here are ${feedback.length} feedback submissions from players:

${JSON.stringify(feedback, null, 2)}

Analyse this feedback and respond ONLY with a valid JSON object (no markdown, no backticks, 
no explanation before or after — just the raw JSON) matching this exact shape:

{
  "overview": "2-3 sentence summary of the overall beta health",
  "bugs": [
    {
      "title": "Short bug title",
      "detail": "What exactly is broken and in which game",
      "count": 1,
      "urgency": "high"
    }
  ],
  "ux": [
    {
      "title": "Short UX issue title",
      "detail": "What feels confusing or frustrating",
      "count": 1,
      "urgency": "medium"
    }
  ],
  "ideas": [
    {
      "title": "Suggested game or feature",
      "detail": "What the player described",
      "count": 1,
      "urgency": "low"
    }
  ],
  "topAction": "The single most important thing to fix or do next, in one sentence"
}

Rules:
- Group similar reports together and set count accordingly
- urgency: "high" = prevents play or crashes, "medium" = friction but playable, "low" = nice-to-have
- Prioritise bugs first, then UX, then ideas
- Keep each title under 8 words
- Keep each detail under 25 words
- If a category has no items, return an empty array []
`.trim();

export const summariseFeedback = async (feedback: any[]): Promise<FeedbackSummary> => {
  const apiKey = import.meta.env.VITE_GEMINI_KEY;
  if (!apiKey) {
    throw new Error('VITE_GEMINI_KEY not set. Add it to your .env file.');
  }
  if (feedback.length === 0) {
    throw new Error('No feedback to summarise.');
  }

  // Strip sensitive fields before sending to Gemini
  const sanitised = feedback.map(({ text, type, rating, game, device, createdAt }) => ({
    text, type, rating, game, device,
    date: createdAt?.toDate?.()?.toLocaleDateString() ?? 'unknown',
  }));

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(sanitised) }] }],
      generationConfig: {
        temperature: 0.3,        // Low temp = structured, consistent output
        maxOutputTokens: 1500,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Gemini API error ${res.status}`);
  }

  const data = await res.json();
  const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  // Strip any accidental markdown fences
  const clean = raw.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(clean) as FeedbackSummary;
  } catch {
    throw new Error('Gemini returned invalid JSON. Try again.');
  }
};