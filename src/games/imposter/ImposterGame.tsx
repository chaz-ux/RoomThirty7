import React, { useState, useEffect, useRef, useCallback } from 'react';
import Matter from 'matter-js';
import { useMultiplayer } from '../../context/MultiplayerContext';
import './Imposter.css';

// ─────────────────────────────────────────────────────────────
//  IMPOSTER — ROOM 37
//
//  Word reveal (pass & play):
//    Tap "Reveal" → see word → tap "I've seen it" → blurs
//    → "Pass to next" → next person taps → repeat
//
//  Starter word: after ALL reveals done, ONE vague word shown
//    to everyone to kick off clue-giving.
//
//  Imposter gets a related but different word.
//  Up to 3 clue rounds. Vote after any round.
//  If caught: imposter gets one final guess at the real word.
// ─────────────────────────────────────────────────────────────

interface WordEntry {
  civilian:  string;
  imposter:  string;
  starter:   string;   // single vague word shown to ALL after reveals
}

// 120+ word pairs. Starter = one vague word that relates to both
// civilian and imposter so neither side gets an unfair hint.
const WORDS: WordEntry[] = [
  // ── Food & Drink ─────────────────────────────────────────
  { civilian: 'Pizza',         imposter: 'Burger',          starter: 'round'       },
  { civilian: 'Sushi',         imposter: 'Spring Roll',      starter: 'wrap'        },
  { civilian: 'Nyama Choma',   imposter: 'BBQ Ribs',         starter: 'smoke'       },
  { civilian: 'Ugali',         imposter: 'Fufu',             starter: 'dough'       },
  { civilian: 'Pilau',         imposter: 'Biryani',          starter: 'spicy'       },
  { civilian: 'Mandazi',       imposter: 'Doughnut',         starter: 'fried'       },
  { civilian: 'Chai',          imposter: 'Coffee',           starter: 'morning'     },
  { civilian: 'Chocolate',     imposter: 'Candy',            starter: 'sweet'       },
  { civilian: 'Ice Cream',     imposter: 'Frozen Yoghurt',   starter: 'cold'        },
  { civilian: 'Watermelon',    imposter: 'Mango',            starter: 'summer'      },
  { civilian: 'Githeri',       imposter: 'Lentils',          starter: 'beans'       },
  { civilian: 'Sukuma Wiki',   imposter: 'Spinach',          starter: 'green'       },
  { civilian: 'Chapati',       imposter: 'Roti',             starter: 'flat'        },
  { civilian: 'Mutura',        imposter: 'Sausage',          starter: 'meat'        },
  { civilian: 'Samosa',        imposter: 'Spring Roll',      starter: 'crispy'      },
  { civilian: 'Wali',          imposter: 'Jollof',           starter: 'white'       },
  { civilian: 'Avocado',       imposter: 'Guacamole',        starter: 'creamy'      },
  { civilian: 'Porridge',      imposter: 'Oatmeal',          starter: 'warm'        },
  { civilian: 'Soda',          imposter: 'Juice',            starter: 'thirsty'     },
  { civilian: 'Beer',          imposter: 'Wine',             starter: 'cheers'      },

  // ── Animals ───────────────────────────────────────────────
  { civilian: 'Lion',          imposter: 'Tiger',            starter: 'fierce'      },
  { civilian: 'Elephant',      imposter: 'Rhino',            starter: 'heavy'       },
  { civilian: 'Crocodile',     imposter: 'Alligator',        starter: 'snap'        },
  { civilian: 'Flamingo',      imposter: 'Pelican',          starter: 'pink'        },
  { civilian: 'Gorilla',       imposter: 'Chimpanzee',       starter: 'climb'       },
  { civilian: 'Giraffe',       imposter: 'Camel',            starter: 'tall'        },
  { civilian: 'Zebra',         imposter: 'Donkey',           starter: 'stripes'     },
  { civilian: 'Cheetah',       imposter: 'Leopard',          starter: 'fast'        },
  { civilian: 'Hippo',         imposter: 'Manatee',          starter: 'water'       },
  { civilian: 'Eagle',         imposter: 'Hawk',             starter: 'sky'         },
  { civilian: 'Penguin',       imposter: 'Puffin',           starter: 'cold'        },
  { civilian: 'Shark',         imposter: 'Dolphin',          starter: 'ocean'       },
  { civilian: 'Parrot',        imposter: 'Toucan',           starter: 'colour'      },
  { civilian: 'Cat',           imposter: 'Rabbit',           starter: 'soft'        },
  { civilian: 'Dog',           imposter: 'Wolf',             starter: 'loyal'       },
  { civilian: 'Cow',           imposter: 'Goat',             starter: 'farm'        },
  { civilian: 'Snake',         imposter: 'Lizard',           starter: 'scales'      },
  { civilian: 'Monkey',        imposter: 'Baboon',           starter: 'mischief'    },

  // ── Places ────────────────────────────────────────────────
  { civilian: 'Nairobi',       imposter: 'Mombasa',          starter: 'city'        },
  { civilian: 'Maasai Mara',   imposter: 'Serengeti',        starter: 'safari'      },
  { civilian: 'Mt Kenya',      imposter: 'Kilimanjaro',      starter: 'peak'        },
  { civilian: 'Lake Victoria', imposter: 'Lake Nakuru',      starter: 'lake'        },
  { civilian: 'Kibera',        imposter: 'Mathare',          starter: 'community'   },
  { civilian: 'Westlands',     imposter: 'Kilimani',         starter: 'uptown'      },
  { civilian: 'Uhuru Park',    imposter: 'City Park',        starter: 'trees'       },
  { civilian: 'Eiffel Tower',  imposter: 'Big Ben',          starter: 'landmark'    },
  { civilian: 'Pyramids',      imposter: 'Sphinx',           starter: 'ancient'     },
  { civilian: 'Times Square',  imposter: 'Piccadilly',       starter: 'lights'      },
  { civilian: 'Dubai',         imposter: 'Abu Dhabi',        starter: 'desert'      },
  { civilian: 'Paris',         imposter: 'Rome',             starter: 'romantic'    },
  { civilian: 'Tokyo',         imposter: 'Seoul',            starter: 'neon'        },
  { civilian: 'Hollywood',     imposter: 'Bollywood',        starter: 'movies'      },
  { civilian: 'Eldoret',       imposter: 'Kisumu',           starter: 'upcountry'   },
  { civilian: 'Malindi',       imposter: 'Watamu',           starter: 'beach'       },
  { civilian: 'Naivasha',      imposter: 'Nakuru',           starter: 'rift'        },
  { civilian: 'CBD',           imposter: 'Town',             starter: 'busy'        },

  // ── People ────────────────────────────────────────────────
  { civilian: 'Eliud Kipchoge',imposter: 'David Rudisha',    starter: 'run'         },
  { civilian: 'Lupita',        imposter: 'Wanjiru Kamau',    starter: 'actress'     },
  { civilian: 'Sauti Sol',     imposter: 'Mafia Afrika',     starter: 'band'        },
  { civilian: 'Khaligraph',    imposter: 'Octopizzo',        starter: 'rap'         },
  { civilian: 'Akothee',       imposter: 'Tanasha',          starter: 'banger'      },
  { civilian: 'Eric Omondi',   imposter: 'Churchill',        starter: 'laugh'       },
  { civilian: 'Bien',          imposter: 'Bensoul',          starter: 'smooth'      },
  { civilian: 'Trio Mio',      imposter: 'Wakadinali',       starter: 'wave'        },
  { civilian: 'Cristiano',     imposter: 'Messi',            starter: 'goat'        },
  { civilian: 'Beyoncé',       imposter: 'Rihanna',          starter: 'queen'       },
  { civilian: 'Obama',         imposter: 'Mandela',          starter: 'history'     },
  { civilian: 'Elon Musk',     imposter: 'Jeff Bezos',       starter: 'rich'        },
  { civilian: 'Burna Boy',     imposter: 'Wizkid',           starter: 'afrobeats'   },
  { civilian: 'Davido',        imposter: 'Kizz Daniel',      starter: 'tune'        },
  { civilian: 'Diamond',       imposter: 'Ali Kiba',         starter: 'bongo'       },
  { civilian: 'Tiwa Savage',   imposter: 'Tems',             starter: 'vibe'        },
  { civilian: 'Gordon Ramsay', imposter: 'Jamie Oliver',     starter: 'cook'        },
  { civilian: 'Mr Bean',       imposter: 'Rowan Atkinson',   starter: 'funny'       },
  { civilian: 'Harry Potter',  imposter: 'Gandalf',          starter: 'magic'       },
  { civilian: 'Batman',        imposter: 'Superman',         starter: 'cape'        },
  { civilian: 'Spiderman',     imposter: 'Antman',           starter: 'crawl'       },
  { civilian: 'Shrek',         imposter: 'Donkey',           starter: 'swamp'       },
  { civilian: 'Spongebob',     imposter: 'Patrick',          starter: 'happy'       },
  { civilian: 'Pikachu',       imposter: 'Charmander',       starter: 'battle'      },
  { civilian: 'Mario',         imposter: 'Sonic',            starter: 'jump'        },
  { civilian: 'Dora',          imposter: 'Blues Clues',      starter: 'backpack'    },

  // ── Things & Tech ─────────────────────────────────────────
  { civilian: 'Guitar',        imposter: 'Violin',           starter: 'strings'     },
  { civilian: 'Piano',         imposter: 'Keyboard',         starter: 'keys'        },
  { civilian: 'Drum',          imposter: 'Bongo',            starter: 'beat'        },
  { civilian: 'Balloon',       imposter: 'Bubble',           starter: 'pop'         },
  { civilian: 'Telescope',     imposter: 'Binoculars',       starter: 'far'         },
  { civilian: 'Camera',        imposter: 'Binoculars',       starter: 'zoom'        },
  { civilian: 'iPhone',        imposter: 'Samsung',          starter: 'screen'      },
  { civilian: 'M-Pesa',        imposter: 'PayPal',           starter: 'send'        },
  { civilian: 'Matatu',        imposter: 'Boda Boda',        starter: 'ride'        },
  { civilian: 'Bitcoin',       imposter: 'Ethereum',         starter: 'crypto'      },
  { civilian: 'Netflix',       imposter: 'YouTube',          starter: 'binge'       },
  { civilian: 'WhatsApp',      imposter: 'Telegram',         starter: 'message'     },
  { civilian: 'Instagram',     imposter: 'TikTok',           starter: 'scroll'      },
  { civilian: 'Laptop',        imposter: 'Tablet',           starter: 'type'        },
  { civilian: 'Headphones',    imposter: 'Earbuds',          starter: 'sound'       },
  { civilian: 'Airplane',      imposter: 'Helicopter',       starter: 'fly'         },
  { civilian: 'Train',         imposter: 'Tram',             starter: 'track'       },
  { civilian: 'Bicycle',       imposter: 'Scooter',          starter: 'ride'        },
  { civilian: 'Umbrella',      imposter: 'Raincoat',         starter: 'rain'        },
  { civilian: 'Backpack',      imposter: 'Handbag',          starter: 'carry'       },
  { civilian: 'Glasses',       imposter: 'Sunglasses',       starter: 'see'         },
  { civilian: 'Watch',         imposter: 'Clock',            starter: 'time'        },
  { civilian: 'Bed',           imposter: 'Sofa',             starter: 'rest'        },
  { civilian: 'Mirror',        imposter: 'Window',           starter: 'glass'       },
  { civilian: 'Candle',        imposter: 'Torch',            starter: 'light'       },
  { civilian: 'Knife',         imposter: 'Scissors',         starter: 'cut'         },
  { civilian: 'Fridge',        imposter: 'Freezer',          starter: 'cold'        },
  { civilian: 'Microwave',     imposter: 'Oven',             starter: 'heat'        },
  { civilian: 'Broom',         imposter: 'Mop',              starter: 'clean'       },

  // ── Events & Concepts ─────────────────────────────────────
  { civilian: 'Wedding',       imposter: 'Engagement',       starter: 'ring'        },
  { civilian: 'Funeral',       imposter: 'Memorial',         starter: 'quiet'       },
  { civilian: 'Birthday',      imposter: 'Anniversary',      starter: 'celebrate'   },
  { civilian: 'Election',      imposter: 'Referendum',       starter: 'vote'        },
  { civilian: 'Hospital',      imposter: 'Clinic',           starter: 'sick'        },
  { civilian: 'School',        imposter: 'College',          starter: 'learn'       },
  { civilian: 'Church',        imposter: 'Mosque',           starter: 'pray'        },
  { civilian: 'Market',        imposter: 'Mall',             starter: 'shop'        },
  { civilian: 'Gym',           imposter: 'Stadium',          starter: 'sweat'       },
  { civilian: 'Prison',        imposter: 'Police Station',   starter: 'locked'      },
  { civilian: 'Library',       imposter: 'Bookshop',         starter: 'read'        },
  { civilian: 'Museum',        imposter: 'Art Gallery',      starter: 'old'         },
  { civilian: 'Earthquake',    imposter: 'Tsunami',          starter: 'shake'       },
  { civilian: 'Drought',       imposter: 'Famine',           starter: 'dry'         },
  { civilian: 'Flood',         imposter: 'Landslide',        starter: 'muddy'       },
  { civilian: 'Strike',        imposter: 'Protest',          starter: 'crowd'       },
  { civilian: 'Parliament',    imposter: 'Senate',           starter: 'debate'      },
  { civilian: 'Harambee',      imposter: 'Fundraiser',       starter: 'together'    },

  // ── Sports ────────────────────────────────────────────────
  { civilian: 'Football',      imposter: 'Rugby',            starter: 'kick'        },
  { civilian: 'Basketball',    imposter: 'Netball',          starter: 'hoop'        },
  { civilian: 'Swimming',      imposter: 'Diving',           starter: 'water'       },
  { civilian: 'Boxing',        imposter: 'Wrestling',        starter: 'fight'       },
  { civilian: 'Marathon',      imposter: 'Sprint',           starter: 'track'       },
  { civilian: 'Volleyball',    imposter: 'Tennis',           starter: 'net'         },
  { civilian: 'Golf',          imposter: 'Cricket',          starter: 'club'        },
  { civilian: 'Chess',         imposter: 'Draughts',         starter: 'board'       },
  { civilian: 'Afcon',         imposter: 'World Cup',        starter: 'trophy'      },
  { civilian: 'Gor Mahia',     imposter: 'AFC Leopards',     starter: 'Nairobi'     },
];

// Avatars
const AVATARS = ['🦁','🐯','🦊','🐺','🦝','🐸','🦋','🦄','🐲','🦅','🦜','🐙','🦈','🐬','🦩'];

type Phase =
  | 'LOBBY'
  | 'REVEALING'       // sequential word reveal (pass & play)
  | 'STARTER'         // show starter word to everyone before clues
  | 'GIVING_CLUES'    // turn-based
  | 'VOTE_CHOICE'     // vote now or another round?
  | 'VOTING'
  | 'IMPOSTER_GUESS'  // caught imposter gets one guess
  | 'RESULTS';

interface SharedState {
  phase: Phase;
  wordIdx: number;
  imposterId: string;
  revealIdx: number;         // which player is currently up for reveal
  clueRound: number;
  turnIdx: number;
  clues: Record<string, string[]>;
  votes: Record<string, string>;
  eliminatedId: string;
  imposterGuess: string;
  result: 'crew_wins' | 'imposter_wins' | null;
}

const DEFAULT: SharedState = {
  phase: 'LOBBY', wordIdx: 0, imposterId: '', revealIdx: 0,
  clueRound: 1, turnIdx: 0, clues: {}, votes: {},
  eliminatedId: '', imposterGuess: '', result: null,
};

// ── Matter.js vote canvas ──────────────────────────────────────
const VoteCanvas: React.FC<{
  players: { id: string; name: string }[];
  votes: Record<string, string>;
  myVote: string;
  onVote: (id: string) => void;
  canVote: boolean;
  currentPlayerId: string;
}> = ({ players, votes, myVote, onVote, canVote, currentPlayerId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const chipsRef  = useRef<Matter.Body[]>([]);
  const rafRef    = useRef<number>(0);
  const prevRef   = useRef<Record<string, string>>({});

  const targets = players.filter(p => p.id !== currentPlayerId);
  const W = Math.min(360, window.innerWidth - 40);
  const H = 200;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = W; canvas.height = H;

    const engine = Matter.Engine.create({ gravity: { y: 1.5 } });
    engineRef.current = engine;

    const ground = Matter.Bodies.rectangle(W/2, H+10, W+40, 20, { isStatic: true });
    const wL = Matter.Bodies.rectangle(-10, H/2, 20, H*2, { isStatic: true });
    const wR = Matter.Bodies.rectangle(W+10, H/2, 20, H*2, { isStatic: true });
    Matter.Composite.add(engine.world, [ground, wL, wR]);

    const COLORS = ['#a29bfe','#fd79a8','#ffd600','#00b894','#ff7675','#74b9ff','#e17055'];

    const tick = () => {
      Matter.Engine.update(engine, 1000/60);
      ctx.clearRect(0, 0, W, H);
      chipsRef.current.forEach((b, bi) => {
        const { x, y } = b.position;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(b.angle);
        ctx.beginPath();
        ctx.roundRect(-32, -13, 64, 26, 13);
        ctx.fillStyle = (b as any)._color ?? COLORS[bi % COLORS.length];
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px "DM Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((b as any)._label ?? '', 0, 0);
        ctx.restore();
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(rafRef.current);
      Matter.Engine.clear(engine);
    };
  }, [W]);

  useEffect(() => {
    if (!engineRef.current) return;
    const COLORS = ['#a29bfe','#fd79a8','#ffd600','#00b894','#ff7675','#74b9ff','#e17055'];
    Object.entries(votes).forEach(([voterId, targetId]) => {
      if (prevRef.current[voterId] === targetId) return;
      prevRef.current[voterId] = targetId;

      const tIdx = targets.findIndex(p => p.id === targetId);
      if (tIdx < 0) return;
      const colW = W / targets.length;
      const tx = colW * tIdx + colW / 2;
      const voterIdx = players.findIndex(p => p.id === voterId);
      const chip = Matter.Bodies.rectangle(
        tx + (Math.random() - 0.5) * 50, -15, 64, 26,
        { restitution: 0.5, friction: 0.4, frictionAir: 0.01 }
      );
      (chip as any)._color = COLORS[voterIdx % COLORS.length];
      (chip as any)._label = players.find(p => p.id === voterId)?.name ?? '?';
      Matter.Composite.add(engineRef.current!.world, chip);
      chipsRef.current.push(chip);
    });
  }, [votes]);

  return (
    <div className="imp-vc-wrap">
      <canvas ref={canvasRef} className="imp-vc-canvas" />
      <div className="imp-vc-row" style={{ gridTemplateColumns: `repeat(${targets.length}, 1fr)` }}>
        {targets.map((p, i) => {
          const vc = Object.values(votes).filter(v => v === p.id).length;
          return (
            <button key={p.id}
              className={`imp-target ${myVote === p.id ? 'voted' : ''} ${!canVote ? 'done' : ''}`}
              onClick={() => canVote && onVote(p.id)}
              disabled={!canVote}
            >
              <span className="imp-ta">{AVATARS[i % AVATARS.length]}</span>
              <span className="imp-tn">{p.name}</span>
              <span className="imp-tv">{vc} vote{vc !== 1 ? 's' : ''}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── Confetti ───────────────────────────────────────────────────
const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  return (
    <div className="imp-confetti" aria-hidden>
      {Array.from({ length: 30 }, (_, i) => (
        <div key={i} className={`imp-cp imp-cp-${i % 7}`}
          style={{ '--i': i, '--r': Math.random().toFixed(2) } as React.CSSProperties} />
      ))}
    </div>
  );
};

// ── Main ───────────────────────────────────────────────────────
const ImposterGame: React.FC = () => {
  const { players, sharedState, setSharedState, isHost, currentPlayerId, mode } = useMultiplayer();
  const isPassPlay = mode === 'local';

  // 3-step reveal state: waiting → revealed → done
  // 'waiting' = blank card, tap to reveal
  // 'revealed' = word visible, tap "I've seen it"
  // 'done'    = blurred again, show pass button
  const [revealStep, setRevealStep] = useState<'waiting' | 'revealed' | 'done'>('waiting');
  const [clueStep, setClueStep] = useState<'typing' | 'passing'>('typing');
  const [voteStep, setVoteStep] = useState<'passing' | 'voting'>('passing');
  const [clueInput,   setClueInput]   = useState('');
  const [guessInput,  setGuessInput]  = useState('');
  const [confetti,    setConfetti]    = useState(false);

  const gs          = ({ ...DEFAULT, ...sharedState }) as SharedState;
  const phase       = gs.phase;
  const entry       = WORDS[gs.wordIdx] ?? WORDS[0];
  const imposterId  = gs.imposterId;
  const revealIdx   = gs.revealIdx;
  const clueRound   = gs.clueRound;
  const turnIdx     = gs.turnIdx;
  const clues       = gs.clues;
  const votes       = gs.votes;

  const amIImposter = currentPlayerId === imposterId;
  const myWord      = amIImposter ? entry.imposter : entry.civilian;
  const isMyClueTurn = players[turnIdx]?.id === currentPlayerId;
  const myVote      = votes[currentPlayerId ?? ''] ?? '';

  // Reset reveal step when player changes
  useEffect(() => { setRevealStep('waiting'); }, [revealIdx, gs.wordIdx]);

  useEffect(() => {
    if (phase === 'RESULTS') {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 3000);
    }
  }, [phase]);

  // ── Start ────────────────────────────────────────────────
  const startGame = async () => {
    if (!isHost || players.length < 3) return;
    const wordIdx = Math.floor(Math.random() * WORDS.length);
    const impIdx  = Math.floor(Math.random() * players.length);
    const initClues: Record<string, string[]> = {};
    players.forEach(p => { initClues[p.id] = []; });
    await setSharedState({
      ...DEFAULT, phase: 'REVEALING',
      wordIdx, imposterId: players[impIdx].id,
      revealIdx: 0, clues: initClues,
    });
  };

  // ── "I've seen it" — blur word, show pass button ─────────
  const seenIt = () => setRevealStep('done');

  // ── "Pass to next" — advance revealIdx ──────────────────
  const passToNext = async () => {
    const next = revealIdx + 1;
    if (next >= players.length) {
      // All revealed → show starter word
      await setSharedState({ phase: 'STARTER' });
    } else {
      await setSharedState({ revealIdx: next });
    }
  };

  // ── Starter acknowledged → start clues ──────────────────
  const startClues = async () => {
    await setSharedState({ phase: 'GIVING_CLUES', clueRound: 1, turnIdx: 0 });
  };

  // ── Submit clue ──────────────────────────────────────────
 const submitClue = async (skip = false) => {
    // FIX: In local mode, the acting player is whoever's turn it is. 
    const activeId = isPassPlay ? players[turnIdx].id : currentPlayerId;
    if (!activeId) return;

    const word = skip ? '(passed)' : clueInput.trim();
    if (!skip && !word) return;
    
    const newClues = { ...clues };
    newClues[activeId] = [...(newClues[activeId] ?? []), word];
    setClueInput('');
    
    const next = turnIdx + 1;
    if (next >= players.length) {
      await setSharedState({ clues: newClues, phase: 'VOTE_CHOICE', turnIdx: next });
    } else {
      await setSharedState({ clues: newClues, turnIdx: next });
      // FIX: Trigger the "pass the phone" screen for the next player
      if (isPassPlay) setClueStep('passing'); 
    }
  };

  // ── Vote ─────────────────────────────────────────────────
  const castVote = async (targetId: string) => {
    // FIX: Get the ID of the person holding the phone
    const voterId = isPassPlay ? players[turnIdx]?.id : currentPlayerId;
    if (!voterId) return;
    
    // Prevent double voting in online mode
    if (!isPassPlay && votes[currentPlayerId ?? '']) return;

    const newVotes = { ...votes, [voterId]: targetId };
    
    if (Object.keys(newVotes).length >= players.length) {
      // Everyone voted, tally the results
      const counts: Record<string, number> = {};
      Object.values(newVotes).forEach(v => { counts[v] = (counts[v] ?? 0) + 1; });
      const eliminated = Object.entries(counts).sort((a,b) => b[1]-a[1])[0]?.[0] ?? '';
      
      if (eliminated === imposterId) {
        await setSharedState({ votes: newVotes, eliminatedId: eliminated, phase: 'IMPOSTER_GUESS' });
      } else {
        await setSharedState({ votes: newVotes, eliminatedId: eliminated, result: 'imposter_wins', phase: 'RESULTS' });
      }
    } else {
      // Not everyone has voted, go to the next person
      await setSharedState({ votes: newVotes, turnIdx: turnIdx + 1 });
      if (isPassPlay) setVoteStep('passing');
    }
  };

  // ── Imposter guess ───────────────────────────────────────
  const submitGuess = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!guessInput.trim()) return;
    const correct = guessInput.trim().toLowerCase() === entry.civilian.toLowerCase();
    await setSharedState({
      imposterGuess: guessInput.trim(),
      result: correct ? 'imposter_wins' : 'crew_wins',
      phase: 'RESULTS',
    });
    setGuessInput('');
  };

  const continueRound = async () => {
    if (!isHost || clueRound >= 3) return;
    if (isPassPlay) setClueStep('passing'); 
    await setSharedState({ phase: 'GIVING_CLUES', clueRound: clueRound + 1, turnIdx: 0 });
  };

  const goVote = async () => {
    if (!isHost) return;
    if (isPassPlay) setVoteStep('passing'); // Trigger the passing screen
    await setSharedState({ phase: 'VOTING', votes: {}, turnIdx: 0 }); // Reset turns to 0
  };

  const restart = async () => {
    if (!isHost) return;
    await setSharedState({ ...DEFAULT });
  };

  if (!players.length) return (
    <div className="imp-container">
      <div className="imp-center">
        <h1 className="imp-title">🕵️ IMPOSTER</h1>
        <a href="/lobby?game=imposter" className="imp-btn imp-btn-start">Go to Lobby</a>
      </div>
    </div>
  );

  // ── All clues flattened for display ─────────────────────
  const allClues = players.flatMap(p =>
    (clues[p.id] ?? []).map((c, ri) => ({ name: p.name, clue: c, round: ri + 1 }))
  );

  // ─────────────────────── RENDERS ─────────────────────────

  const renderLobby = () => (
    <div className="imp-center imp-lobby fade-up">
      <div className="imp-lobby-icon">🕵️</div>
      <h1 className="imp-title">IMPOSTER</h1>
      <p className="imp-sub">One player has a different word. Find them — or survive undetected.</p>
      <div className="imp-players">
        {players.map((p, i) => (
          <div key={p.id} className="imp-player-chip">
            {AVATARS[i % AVATARS.length]} {p.isHost ? '👑 ' : ''}{p.name}
          </div>
        ))}
      </div>
      <div className="imp-rules">
        <div className="imp-rule"><span>🔤</span>Everyone gets the word. Imposter gets a similar but different one.</div>
        <div className="imp-rule"><span>💬</span>Take turns giving one-word clues (up to 3 rounds).</div>
        <div className="imp-rule"><span>🗳️</span>Vote out the imposter — but they get one last guess!</div>
        {isPassPlay && <div className="imp-rule"><span>📱</span>One device — each player reveals privately then passes.</div>}
      </div>
      {isHost
        ? players.length >= 3
          ? <button className="imp-btn imp-btn-start" onClick={startGame}>START GAME →</button>
          : <p className="imp-waiting">Need at least 3 players</p>
        : <p className="imp-waiting">Waiting for host…</p>}
      <a href="/" className="imp-exit">← Exit to Hub</a>
    </div>
  );

  // Pass-and-play reveal: sequential, one device
  // Flow: waiting → tap card → revealed → tap "I've seen it" → done → tap "Pass" → next player
  const renderRevealing = () => {
    const player = players[revealIdx];
    if (!player) return null;
    const thisWord = player.id === imposterId ? entry.imposter : entry.civilian;
    const isImp    = player.id === imposterId;
    const isLast   = revealIdx + 1 >= players.length;
    const nextName = !isLast ? players[revealIdx + 1]?.name : '';

    return (
      <div className="imp-word-reveal fade-up">

        {/* Who's turn + progress */}
        <div className="imp-reveal-header">
          <div className="imp-reveal-who">
            {AVATARS[revealIdx % AVATARS.length]} {player.name}
          </div>
          <div className="imp-reveal-progress">
            {players.map((_, i) => (
              <div key={i} className={`imp-rdot ${i < revealIdx ? 'done' : i === revealIdx ? 'current' : ''}`} />
            ))}
          </div>
        </div>

        {/* Step hint */}
        <p className="imp-reveal-hint">
          {revealStep === 'waiting'  && `${player.name} — tap the card to see your word`}
          {revealStep === 'revealed' && 'Memorise your word, then tap below'}
          {revealStep === 'done'     && `Pass the phone to ${isLast ? 'everyone to gather' : nextName}`}
        </p>

        {/* Word card — only clickable in 'waiting' state */}
        <div
          className={`imp-word-card ${isImp ? 'imposter' : 'crew'} ${revealStep === 'revealed' ? 'visible' : 'hidden'}`}
          onClick={() => revealStep === 'waiting' && setRevealStep('revealed')}
        >
          {revealStep === 'revealed' ? (
            <>
              <div className="imp-word-category">{isImp ? '😈 YOU ARE THE IMPOSTER' : '✅ CREW MEMBER'}</div>
              <div className="imp-word-main">{thisWord}</div>
              {isImp && <div className="imp-imposter-badge">You have a different word. Blend in!</div>}
            </>
          ) : (
            <div className="imp-word-tap-hint">
              {revealStep === 'waiting' ? '👆 Tap to reveal' : '🔒 Word hidden'}
            </div>
          )}
        </div>

        {/* Step 2: seen it */}
        {revealStep === 'revealed' && (
          <button className="imp-btn imp-btn-seen" onClick={seenIt}>
            ✓ I've seen it — hide word
          </button>
        )}

        {/* Step 3: pass to next */}
        {revealStep === 'done' && (
          <button className="imp-btn imp-btn-pass" onClick={passToNext}>
            {isLast
              ? 'Everyone has seen — continue →'
              : `Pass to ${nextName} →`}
          </button>
        )}

      </div>
    );
  };

  // After all reveals: show starter word to everyone
  const renderStarter = () => (
    <div className="imp-center fade-up">
      <p className="imp-starter-eyebrow">Everyone gather round</p>
      <h2 className="imp-starter-heading">The starter word is:</h2>
      <div className="imp-starter-big">
        <span>{entry.starter}</span>
      </div>
      <p className="imp-starter-sub">
        First player gives a clue related to their word — without saying it.<br/>
        Then go round the group. Good luck.
      </p>
      {isHost && (
        <button className="imp-btn imp-btn-start" onClick={startClues}>
          Start Clues →
        </button>
      )}
      {!isHost && <p className="imp-waiting">Waiting for host…</p>}
    </div>
  );

  const renderGivingClues = () => {
    const curr = players[turnIdx];
    
    // FIX: In Pass & Play, it's ALWAYS your turn because you're holding the device
    const isMyTurn = isPassPlay || curr?.id === currentPlayerId;
    
    // FIX: Get the correct secret word for whoever is holding the phone
    const activePlayerId = isPassPlay ? curr?.id : currentPlayerId;
    const activeWord = activePlayerId === imposterId ? entry.imposter : entry.civilian;

    // FIX: Show the interstitial passing screen between turns
    if (isPassPlay && clueStep === 'passing') {
      return (
        <div className="imp-center fade-up">
          <div className="imp-vc-icon">📱</div>
          <h2 className="imp-vc-title">Pass the device</h2>
          <p className="imp-vc-sub">Hand the phone to <strong>{curr?.name}</strong></p>
          <button className="imp-btn imp-btn-start" onClick={() => setClueStep('typing')}>
            I'm {curr?.name} →
          </button>
        </div>
      );
    }

    return (
      <div className="imp-clues fade-up">
        <div className="imp-clues-header">
          <div className="imp-round-badge">Round {clueRound} / 3</div>
          <div className="imp-turn-indicator">
            {isMyTurn ? '🎯 YOUR TURN' : `${curr?.name ?? '?'}'s turn`}
          </div>
        </div>

        <div className="imp-starter-reminder">
          <span>💡</span>
          <em>Starter word: <strong>{entry.starter}</strong></em>
        </div>

        {allClues.length > 0 && (
          <div className="imp-clues-list">
            {allClues.map((l, i) => (
              <div key={i} className={`imp-clue-row r${l.round}`}>
                <span className="imp-clue-player">{l.name}</span>
                <span className="imp-clue-sep">→</span>
                <span className="imp-clue-word">{l.clue}</span>
                <span className="imp-clue-round">R{l.round}</span>
              </div>
            ))}
          </div>
        )}

        {isMyTurn ? (
          <div className="imp-clue-form">
            <p className="imp-clue-prompt">
              Your word: <strong>{activeWord}</strong> — give one word without saying it
            </p>
            <div className="imp-clue-input-row">
              <input
                className="imp-input"
                type="text"
                placeholder="One word…"
                value={clueInput}
                onChange={e => setClueInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && clueInput.trim() && submitClue()}
                maxLength={25}
                autoFocus
                autoComplete="off"
              />
              <button className="imp-btn imp-btn-say" onClick={() => submitClue()}
                disabled={!clueInput.trim()}>SAY IT</button>
            </div>
            <button className="imp-skip-btn" onClick={() => submitClue(true)}>PASS →</button>
          </div>
        ) : (
          <p className="imp-waiting">Waiting for {curr?.name}…</p>
        )}

        <div className="imp-player-status-row">
          {players.map((p, i) => {
            const done = (clues[p.id]?.length ?? 0) >= clueRound;
            return (
              <div key={p.id} className={`imp-ps-chip ${i === turnIdx ? 'current' : done ? 'done' : ''}`}>
                {AVATARS[i % AVATARS.length]} {p.name}{done ? ' ✓' : ''}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderVoteChoice = () => (
    <div className="imp-center fade-up">
      <div className="imp-vc-icon">🤔</div>
      <h2 className="imp-vc-title">Round {clueRound} done</h2>
      <p className="imp-vc-sub">Ready to vote or need another round?</p>
      <div className="imp-clues-list" style={{ width: '100%', maxHeight: 220, overflowY: 'auto' }}>
        {allClues.map((l, i) => (
          <div key={i} className={`imp-clue-row r${l.round}`}>
            <span className="imp-clue-player">{l.name}</span>
            <span className="imp-clue-sep">→</span>
            <span className="imp-clue-word">{l.clue}</span>
            <span className="imp-clue-round">R{l.round}</span>
          </div>
        ))}
      </div>
      {isHost ? (
        <div className="imp-vc-actions">
          <button className="imp-btn imp-btn-vote" onClick={goVote}>🗳️ Vote Now</button>
          {clueRound < 3 && (
            <button className="imp-btn imp-btn-continue" onClick={continueRound}>🔁 Another Round</button>
          )}
        </div>
      ) : <p className="imp-waiting">Waiting for host…</p>}
    </div>
  );

  const renderVoting = () => {
    const curr = players[turnIdx];
    
    // Determine who is actually looking at the screen right now
    const activeVoterId = isPassPlay ? curr?.id : currentPlayerId;
    const hasVotedOnline = !isPassPlay && !!myVote;

    // Show the pass screen in local mode
    if (isPassPlay && voteStep === 'passing' && curr) {
      return (
        <div className="imp-center fade-up">
          <div className="imp-vc-icon">📱</div>
          <h2 className="imp-vc-title">Time to Vote</h2>
          <p className="imp-vc-sub">Pass the device to <strong>{curr.name}</strong></p>
          <button className="imp-btn imp-btn-start" onClick={() => setVoteStep('voting')}>
            I'm {curr.name} →
          </button>
        </div>
      );
    }

    return (
      <div className="imp-voting fade-up">
        <h2 className="imp-voting-title">🗳️ WHO'S THE IMPOSTER?</h2>
        
        {isPassPlay ? (
          <p className="imp-voting-sub"><strong>{curr?.name}</strong>, tap to cast your vote!</p>
        ) : (
          <p className="imp-voting-sub">
            {hasVotedOnline ? 'Vote cast — watch the chips!' : 'Tap to vote'}
          </p>
        )}
        
        <VoteCanvas
          players={players}
          votes={votes}
          // In local, we pass empty string so the UI doesn't lock up for the next player
          myVote={isPassPlay ? '' : myVote} 
          onVote={castVote}
          canVote={isPassPlay ? true : !myVote}
          currentPlayerId={activeVoterId ?? ''} 
        />
        
        <p className="imp-vote-count">{Object.keys(votes).length}/{players.length} voted</p>
        
        {isPassPlay && (
          <p className="imp-voting-warning" style={{marginTop: 10, fontSize: '0.9rem', opacity: 0.7}}>
            (Keep your vote secret!)
          </p>
        )}
      </div>
    );
  };

  const renderImposterGuess = () => (
    <div className="imp-center fade-up">
      <div className="imp-guess-icon">😈</div>
      <h2 className="imp-guess-title">IMPOSTER CAUGHT!</h2>
      <p className="imp-guess-sub">
        {players.find(p => p.id === gs.eliminatedId)?.name} — you were the imposter!<br/>
        But guess the real word and you still win.
      </p>
      {currentPlayerId === imposterId ? (
        <form className="imp-guess-form" onSubmit={submitGuess}>
          <input className="imp-input imp-guess-input" type="text"
            placeholder="What was the real word?"
            value={guessInput}
            onChange={e => setGuessInput(e.target.value)}
            autoFocus />
          <button type="submit" className="imp-btn imp-btn-guess" disabled={!guessInput.trim()}>
            FINAL ANSWER →
          </button>
        </form>
      ) : (
        <p className="imp-waiting">{players.find(p => p.id === imposterId)?.name} is guessing…</p>
      )}
    </div>
  );

  const renderResults = () => {
    const crewWin = gs.result === 'crew_wins';
    const imp = players.find(p => p.id === imposterId);
    return (
      <div className="imp-results fade-up">
        <Confetti active={confetti} />
        <div className={`imp-result-banner ${crewWin ? 'crew' : 'imposter'}`}>
          <div className="imp-result-icon">{crewWin ? '🎉' : '😈'}</div>
          <h1 className="imp-result-title">{crewWin ? 'IMPOSTER CAUGHT!' : 'IMPOSTER WINS!'}</h1>
          <p className="imp-result-sub">{crewWin ? `${imp?.name} was exposed!` : `${imp?.name} got away!`}</p>
        </div>
        <div className="imp-reveal-card">
          <div className="imp-reveal-row">
            <span className="imp-reveal-label-sm">Crew's word</span>
            <span className="imp-reveal-word">{entry.civilian}</span>
          </div>
          <div className="imp-reveal-row">
            <span className="imp-reveal-label-sm">Imposter's word</span>
            <span className="imp-reveal-word imp-imposter-color">{entry.imposter}</span>
          </div>
          <div className="imp-reveal-row">
            <span className="imp-reveal-label-sm">Starter word</span>
            <span className="imp-reveal-word">{entry.starter}</span>
          </div>
          {gs.imposterGuess && (
            <div className="imp-reveal-row">
              <span className="imp-reveal-label-sm">Imposter guessed</span>
              <span className="imp-reveal-word">
                "{gs.imposterGuess}" — {gs.result === 'imposter_wins' ? '✓ Correct!' : '✗ Wrong'}
              </span>
            </div>
          )}
        </div>
        <div className="imp-results-clues">
          <h3>All Clues</h3>
          {players.map((p, pi) => (
            <div key={p.id} className="imp-results-player-clues">
              <span className="imp-rpc-name">{AVATARS[pi % AVATARS.length]} {p.name}{p.id === imposterId ? ' 😈' : ''}</span>
              <span className="imp-rpc-clues">{(clues[p.id] ?? []).join(' → ') || '(no clues)'}</span>
            </div>
          ))}
        </div>
        {isHost && <button className="imp-btn imp-btn-start" onClick={restart}>PLAY AGAIN</button>}
        <a href="/" className="imp-exit">← Exit to Hub</a>
      </div>
    );
  };

  return (
    <div className={`imp-container imp-phase-${phase.toLowerCase()}`}>
      <div className="imp-bg-blob imp-blob-1" />
      <div className="imp-bg-blob imp-blob-2" />
      <div className="imp-bg-blob imp-blob-3" />

      {phase === 'LOBBY'          && renderLobby()}
      {phase === 'REVEALING'      && renderRevealing()}
      {phase === 'STARTER'        && renderStarter()}
      {phase === 'GIVING_CLUES'   && renderGivingClues()}
      {phase === 'VOTE_CHOICE'    && renderVoteChoice()}
      {phase === 'VOTING'         && renderVoting()}
      {phase === 'IMPOSTER_GUESS' && renderImposterGuess()}
      {phase === 'RESULTS'        && renderResults()}
    </div>
  );
};

export default ImposterGame;