import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMultiplayer } from '../../context/MultiplayerContext';
import './Imposter.css';

// ============================================================
// IMPOSTER GAME - ROOM 37
// Everyone gets a word, the imposter gets a different word
// Players say related words, then vote on who the imposter is
// ============================================================

// Real nouns - people, places, things - NO emotions!
const WORD_BANK = [
    // Famous People
    { word: 'Kendrick Lamar', category: 'Person', related: ['rapper', 'hip hop', 'compton', 'beats', 'album', 'DNA', 'humble', 'kung fu kenny'] },
    { word: 'Dora the Explorer', category: 'Character', related: ['boots', 'backpack', 'map', 'swiper', 'adventure', 'nickelodeon', 'swiping', 'exploring', 'bilingual'] },
    { word: 'Elon Musk', category: 'Person', related: ['tesla', 'spacex', 'billionaire', 'twitter', 'tech', 'mars', 'rocket', 'electric cars', 'paypal'] },
    { word: 'Beyonce', category: 'Person', related: ['queen bey', 'singer', 'destinys child', 'album', 'formation', 'halftime show', 'pop star', 'tINA'] },
    { word: 'Shrek', category: 'Character', related: ['ogre', 'donkey', 'fiona', 'swamp', 'onion', 'fairy tale', 'dreamworks', 'green', 'ogre'] },
    { word: 'Barack Obama', category: 'Person', related: ['president', 'usa', 'white house', 'hope', 'change', 'democrat', 'michelle', 'nobel'] },
    { word: 'Cristiano Ronaldo', category: 'Person', related: ['cr7', 'soccer', 'football', 'juventus', 'manchester', 'real madrid', 'sport', 'athlete', 'portugal'] },
    { word: 'Mickey Mouse', category: 'Character', related: ['minnie', 'disney', 'ears', 'cartoon', 'magic', 'walt', 'mouse', 'clubhouse'] },
    { word: 'Gordon Ramsay', category: 'Person', related: ['chef', 'hell kitchen', 'masterchef', 'cooking', 'restaurants', 'angry', 'british', 'food'] },
    { word: 'Willy Wonka', category: 'Character', related: ['chocolate', 'factory', 'golden ticket', 'oompa loompa', 'gene wildman', 'candy', 'river', 'factory'] },
    { word: 'Keanu Reeves', category: 'Person', related: ['matrix', 'neo', 'john wick', 'actor', 'speed', 'bill and ted', 'reliable', 'canadian'] },
    { word: 'Tom Hanks', category: 'Person', related: ['forrest gump', 'cast away', 'saving private ryan', 'baseball', 'island', 'box office', 'oscar', 'toy story'] },
    { word: 'Leonardo DiCaprio', category: 'Person', related: ['titanic', 'wolf of wall street', 'inception', 'oscars', 'actor', 'environmental', 'titanic'] },
    { word: 'Mr Bean', category: 'Character', related: ['rowan atkinson', 'teddy', 'comedy', 'silent', 'funny', 'british', 'humor', 'minions'] },
    { word: 'Spongebob', category: 'Character', related: ['patrick', 'pineapple', 'bubbles', 'krusty krab', 'gary', 'bikini bottom', 'squarepants', 'sponge'] },

    // Places
    { word: 'Nairobi', category: 'Place', related: ['kenya', 'africa', 'capital', 'safari', 'diamond heist', 'jomo kenyatta', 'travel', 'hotel', 'african'] },
    { word: 'Paris', category: 'Place', related: ['france', 'eiffel tower', 'love', 'romance', 'wine', 'art', 'fashion', 'louvre', 'croissant'] },
    { word: 'Tokyo', category: 'Place', related: ['japan', 'sushi', 'shibuya', 'akihabara', 'tech', 'neon', 'japanese', 'travel', 'harajuku'] },
    { word: 'Egypt', category: 'Place', related: ['pyramids', 'pharaoh', 'nile', 'cairo', 'sphinx', 'ancient', 'desert', 'mummy', 'tourism'] },
    { word: 'Amazon', category: 'Place', related: ['rainforest', 'river', 'jungle', 'brazil', 'fire', 'deforestation', 'trees', 'wildlife', 'eco'] },
    { word: 'Mars', category: 'Place', related: ['planet', 'red planet', 'spacex', 'nasa', 'rocket', 'elon musk', 'colonization', 'water', 'future'] },
    { word: 'Hawaii', category: 'Place', related: ['beach', 'surfing', 'aloha', 'volcano', 'hula', 'tropical', 'luau', 'mauna', ' polynesia'] },
    { word: 'Dubai', category: 'Place', related: ['luxury', 'burj khalifa', 'money', 'shopping', 'desert', 'oil', 'skyscraper', 'tourism', 'uae'] },
    { word: 'Sydney Opera House', category: 'Place', related: ['sydney', 'australia', 'concert', 'architecture', 'harbour', 'singing', 'boat', 'sydney'] },
    { word: 'Iceland', category: 'Place', related: ['northern lights', 'volcano', 'cold', 'geysir', 'blue lagoon', 'waterfall', 'vikings', 'aurora'] },
    { word: 'Maldives', category: 'Place', related: ['beach', 'island', 'tropical', 'paradise', 'luxury', 'diving', 'resort', 'ocean', 'coconut'] },
    { word: 'London', category: 'Place', related: ['big ben', 'uk', 'queen', 'thames', 'red bus', 'tower bridge', 'british', 'parliament', 'fish and chips'] },

    // Objects / Things
    { word: 'Bitcoin', category: 'Thing', related: ['crypto', 'blockchain', 'satoshi', 'money', 'digital', 'wallet', 'volatile', 'investment'] },
    { word: 'Golden Retriever', category: 'Animal', related: ['dog', 'fluffy', 'friendly', 'family dog', 'golden', 'puppy', 'fetch', 'pet', '忠誠'] },
    { word: 'Tardis', category: 'Object', related: ['doctor who', 'time machine', 'police box', 'blue box', 'time travel', 'daleks', 'bbc', 'wibbly wobbly'] },
    { word: 'Lightsaber', category: 'Object', related: ['star wars', 'jedi', 'sith', 'laser sword', 'force', 'red blue', 'anakin', 'luke', 'duel'] },
    { word: 'Infinity Gauntlet', category: 'Object', related: ['thanos', 'avengers', 'infinity stones', 'snap', 'glove', 'marvel', 'destruction', 'power', 'titan'] },
    { word: 'The One Ring', category: 'Object', related: ['lord of the rings', 'frodo', 'sauron', 'mount doom', 'gold', 'precious', 'bilbo', 'middle earth'] },
    { word: 'Excalibur', category: 'Object', related: ['king arthur', 'sword', 'camelot', 'stone', 'legend', 'merlin', 'knight', 'arthur', 'pull the sword'] },
    { word: 'Holy Grail', category: 'Object', related: ['chalice', 'indiana jones', 'quest', 'knights templar', 'monty python', 'ancient', 'religious', 'grail'] },
    { word: 'The Mona Lisa', category: 'Object', related: ['painting', 'da vinci', 'louvre', 'smile', 'france', 'museum', 'art', 'enigmatic'] },
    { word: 'The Titanic', category: 'Object', related: ['ship', 'iceberg', 'atlantic', 'sinking', 'rose', 'jack', '1912', 'disaster', 'luxury liner'] },
    { word: 'Eiffel Tower', category: 'Object', related: ['paris', 'france', 'landmark', 'tower', 'iron', 'tourist', 'lights', 'romance', 'french'] },
    { word: 'Pyramids', category: 'Object', related: ['egypt', 'giza', 'pharaoh', 'ancient', 'desert', 'tourism', 'sphinx', ' tombs'] },
    { word: 'Macbook', category: 'Object', related: ['apple', 'laptop', 'computer', 'pro', 'keyboard', 'retina', 'steve jobs', 'tech'] },
    { word: 'Nintendo Switch', category: 'Object', related: ['nintendo', 'console', 'gaming', 'joy-con', 'portable', 'zelda', 'mario', 'games'] },
    { word: 'Airplane', category: 'Object', related: ['flight', 'travel', 'pilot', 'wing', 'airport', 'sky', 'fly', 'engine', 'turbulence'] },

    // More characters / pop culture
    { word: 'Walter White', category: 'Character', related: ['heisenberg', 'breaking bad', 'chemistry', 'meth', 'jesse', 'blue sky', 'cancer', 'drugs', 'cook'] },
    { word: 'Darth Vader', category: 'Character', related: ['star wars', 'sith', 'anakin', 'dark side', 'empire', 'luke', 'lightsaber', 'breathing', 'sith lord'] },
    { word: 'Harry Potter', category: 'Character', related: ['wizard', 'hogwarts', 'magic', 'wand', 'gryffindor', 'voldemort', 'hedwig', 'platform 9 3/4'] },
    { word: 'Spider-Man', category: 'Character', related: ['peter parker', 'web', 'marvel', 'swing', 'neighbor', 'webshooters', 'mask', 'friendly'] },
    { word: 'James Bond', category: 'Character', related: ['007', 'spy', 'casino royale', 'vodka martini', 'shaken not stirred', 'm', 'villain', 'spy'] },
    { word: 'Sherlock Holmes', category: 'Character', related: ['detective', 'baker street', 'watson', 'magnifying glass', 'moriarty', '221b', 'british', ' deduction'] },
    { word: 'Marty McFly', category: 'Character', related: ['back to the future', 'delorean', 'time travel', '1955', 'skateboard', 'doc brown', 'flux capacitor', '90s'] },
    { word: 'Gandalf', category: 'Character', related: ['wizard', 'lord of the rings', 'middle earth', 'shire', 'saruman', 'magic', 'staff', 'balrog', 'grey pilgrim'] },
    { word: 'Indiana Jones', category: 'Character', related: ['archaeologist', 'whip', 'fedora', 'temple of doom', 'raiders', 'crystal skull', 'adventure', 'hat', 'bullwhip'] },
    { word: 'Batman', category: 'Character', related: ['gotham', 'bruce wayne', 'batcave', 'joker', 'gotham city', 'batmobile', 'robin', 'alfred'] },
    { word: 'Superman', category: 'Character', related: ['krypton', ' Lois Lane', 'metropolis', 'lex luthor', 'daily planet', 'flight', 'superhero', 'kryptonite'] },
    { word: 'Wonder Woman', category: 'Character', related: ['amazon', 'lasso', 'bracelets', 'greek goddess', 'dc comics', 'steve trevor', 'invisible plane'] },
    { word: 'Iron Man', category: 'Character', related: ['tony stark', 'arc reactor', 'suit', 'mark', 'jarvis', 'avengers', 'genius', 'billionaire'] },
    { word: 'Thor', category: 'Character', related: ['hammer', 'mjolnir', 'thunder', 'asgard', 'odin', 'lightning', 'norwegian', 'god'] },
    { word: 'Captain Jack Sparrow', category: 'Character', related: ['pirates', 'caribbean', 'black pearl', 'compass', 'davy jones', 'pirate', 'sailor', 'jolly roger'] },

    // More famous places
    { word: 'The White House', category: 'Place', related: ['president', 'usa', 'washington', 'politics', 'oval office', 'power', 'government', 'american'] },
    { word: 'Times Square', category: 'Place', related: ['new york', 'nyc', 'broadway', 'neon', 'times', 'square', 'manhattan', 'crowds', 'tourist'] },
    { word: 'Colosseum', category: 'Place', related: ['rome', 'italy', 'gladiators', 'ancient', 'arena', 'romeo', 'colosseum', 'roman'] },
    { word: 'Mount Everest', category: 'Place', related: ['himalayas', 'climbing', 'peak', 'snow', 'mountain', 'everest', 'base camp', 'altitude'] },
    { word: 'Great Wall of China', category: 'Place', related: ['china', 'wall', 'ancient', 'great wall', 'terracotta', 'chinese', 'emperor', 'brick'] },
    { word: 'Sahara Desert', category: 'Place', related: ['desert', 'sand', 'camel', 'africa', 'hot', 'dunes', 'sahara', ' OASIS'] },
    { word: 'Antarctica', category: 'Place', related: ['penguins', 'ice', 'cold', 'south pole', 'snow', 'arctic', 'polar', 'expedition'] },
    { word: 'Amazon River', category: 'Place', related: ['river', 'brazil', 'rainforest', 'jungle', 'water', 'boat', 'fish', 'piranha', 'dense'] },

    // More famous things
    { word: 'Iphone', category: 'Thing', related: ['apple', 'smartphone', 'touch screen', 'apps', 'steve jobs', 'ios', 'charge', 'camera'] },
    { word: 'Tesla Car', category: 'Thing', related: ['elon musk', 'electric', 'autopilot', 'model s', 'model 3', 'charging', 'future', 'cars'] },
    { word: 'Space Shuttle', category: 'Thing', related: ['nasa', 'astronauts', 'launch', 'orbit', 'rocket', 'space', 'mission', 'booster'] },
    { word: 'Hamburger', category: 'Thing', related: ['burger', 'beef', 'mcdonalds', 'fast food', 'patty', 'cheese', 'lettuce', ' bun'] },
    { word: 'Pizza', category: 'Thing', related: ['italian', 'cheese', 'pepperoni', 'pie', 'mozzarella', 'tomato', 'slice', 'italian food'] },
    { word: 'Sushi', category: 'Thing', related: ['japanese', 'fish', 'rice', 'raw', 'chopsticks', 'salmon', 'nori', 'japanese food'] },
    { word: 'Diamonds', category: 'Thing', related: ['jewelry', 'engagement', 'ring', 'expensive', 'carbon', 'sparkle', 'mining', 'diamonds'] },
    { word: 'Gold Medal', category: 'Thing', related: ['olympics', 'winner', 'first place', 'medal', 'gold', 'champion', 'award', 'prize'] },

    // More famous people
    { word: 'Michael Jackson', category: 'Person', related: ['thriller', 'moonwalk', 'king of pop', 'singer', 'mjj', 'billie jean', 'dance', 'glove'] },
    { word: 'Madonna', category: 'Person', related: ['queen of pop', 'singer', 'like a prayer', 'material girl', 'pop', 'controversy', 'music'] },
    { word: 'Taylor Swift', category: 'Person', related: ['singer', 'country', 'pop', 'albums', 'tickets', 'swifties', 'shake it off', 'love songs'] },
    { word: 'Oprah Winfrey', category: 'Person', related: ['talk show', 'tv', 'media', 'philanthropy', 'queen of talk', 'oprah', 'book club', 'tv host'] },
    { word: 'Steve Jobs', category: 'Person', related: ['apple', 'tech', 'iphone', 'mac', 'entrepreneur', 'innovation', 'ipod', 'computer'] },
    { word: 'Albert Einstein', category: 'Person', related: ['scientist', 'physics', 'relativity', 'genius', 'e=mc2', 'theory', 'nobel', 'hair'] },
    { word: 'Shakespeare', category: 'Person', related: ['playwright', 'romeo and juliet', 'hamlet', 'writer', 'british', 'theater', ' literature'] },
    { word: 'Mozart', category: 'Person', related: ['classical', 'music', 'composer', 'piano', 'austria', 'symphony', 'genius', 'classical music'] },

    // More characters
    { word: 'Patrick Star', category: 'Character', related: ['spongebob', 'starfish', 'idiot', 'friend', 'bikini bottom', 'squarepants', 'dumb', 'star'] },
    { word: 'Scooby Doo', category: 'Character', related: ['dog', 'shaggy', 'mystery', 'gang', 'velma', 'daphne', 'meddling kids', 'scooby snack'] },
    { word: 'Buzz Lightyear', category: 'Character', related: ['toy story', 'astronaut', 'to infinity', ' woody', 'disney', 'space', 'buzz', 'star command'] },
    { word: 'Chucky', category: 'Character', related: ['childs play', 'doll', 'horror', 'killer', 'good guy', 'evil', 'bride', ' horror movie'] },
    { word: 'Freddy Krueger', category: 'Character', related: ['nightmare on elm street', 'horror', 'dream', 'glove', 'blade', 'sleep', ' Freddy'] },
    { word: 'Dobby', category: 'Character', related: ['harry potter', 'elf', 'house elf', 'sock', 'freedom', 'malfoy', 'elf', 'dobby'] },
    { word: 'Gollum', category: 'Character', related: ['lord of the rings', 'my precious', 'hobbit', 'smeagol', 'ring', 'fish', 'gollum'] },
    { word: 'Yoda', category: 'Character', related: ['star wars', 'jedi', 'force', 'dagobah', 'master yoda', 'green', 'lightweight', ' teach'] },
    { word: 'Chewbacca', category: 'Character', related: ['star wars', 'wookie', 'chewie', 'han solo', 'millennium falcon', 'co-pilot', 'shyriiwook'] },
    { word: 'Pikachu', category: 'Character', related: ['pokemon', 'pika pika', 'electric', 'pokeball', 'ash', 'pikachu', 'yellow', 'mouse'] },
    { word: 'Hello Kitty', category: 'Character', related: ['sanrio', 'cute', 'cat', 'white', 'japanese', 'bow', 'character', 'kawaii'] },
    { word: 'Barbie', category: 'Character', related: ['mattel', 'doll', 'ken', 'blonde', 'dreamhouse', 'fashion', 'plastic', ' dolls'] },
    { word: 'Thomas the Tank Engine', category: 'Character', related: ['train', 'engine', 'friends', 'island of sodor', 'railway', 'cheerful', ' Percy'] },
    { word: 'Bob the Builder', category: 'Character', related: ['builder', 'can we fix it', 'tools', 'construction', 'mending', 'hammer', ' fix'] },
    { word: 'Rugrats', category: 'Character', related: ['babies', 'tommy', 'angelica', 'reptar', 'nickelodeon', 'diaper', ' babies'] },

    // More real world nouns
    { word: 'Rainbow', category: 'Thing', related: ['colors', 'rain', 'sky', 'arc', 'spectrum', 'prism', 'rainbow', 'seven colors'] },
    { word: 'Volcano', category: 'Thing', related: ['lava', 'eruption', 'mountain', 'hot', 'magma', 'hawaii', 'active', 'volcanic'] },
    { word: 'Waterfall', category: 'Thing', related: ['water', 'falling', 'niagara', 'nature', 'cascading', 'river', 'flow', 'diving'] },
    { word: 'Skateboard', category: 'Thing', related: ['skate', 'trick', 'ollie', 'ramp', 'street', 'board', 'skater', ' vert'] },
    { word: 'Guitar', category: 'Thing', related: ['music', 'strings', 'rock', 'acoustic', 'electric', 'play', 'guitarist', ' chord'] },
    { word: 'Telescope', category: 'Thing', related: ['stars', 'space', 'astronomy', 'lens', 'galaxy', 'moon', 'observe', 'nasa'] },
    { word: 'Microscope', category: 'Thing', related: ['science', 'tiny', 'cells', 'magnify', 'lens', 'bacteria', 'lab', 'microscope'] },
    { word: 'Parachute', category: 'Thing', related: ['skydiving', 'fall', 'air', 'chute', 'parachuting', 'safety', 'jump', ' canopy'] },
    { word: 'Compass', category: 'Thing', related: ['navigation', 'north', 'direction', 'magnetic', 'map', 'travel', 'needle', 'adventure'] },
    { word: 'Sandcastle', category: 'Thing', related: ['beach', 'sand', 'bucket', 'ocean', 'castle', 'summer', 'sandcastle', ' building'] },
    { word: 'Snowman', category: 'Thing', related: ['winter', 'snow', 'carrot', 'scarf', 'cold', 'frosty', 'buttons', ' outdoor'] },
    { word: 'Lantern', category: 'Thing', related: ['light', 'paper', 'chinese', 'halloween', 'glow', 'festival', ' lantern'] },
    { word: 'Wreath', category: 'Thing', related: ['christmas', 'door', 'decorations', 'holly', ' wreath', 'flowers', 'decorate'] },
    { word: 'Fireplace', category: 'Thing', related: ['fire', 'warm', 'wood', 'cozy', 'home', 'chimney', 'heating', ' crackling'] },
    { word: 'Hot Air Balloon', category: 'Thing', related: ['balloon', 'air', 'flying', 'basket', 'colors', 'festival', 'hot air', ' float'] },
];

type Phase = 'LOBBY' | 'WORD_REVEAL' | 'WORD_ENTRY' | 'DISCUSSION' | 'VOTING' | 'RESULTS';

interface ImposterState {
    phase: Phase;
    wordData: { word: string; category: string } | null;
    imposterIndex: number;
    imposterWord: string;
    roundsCompleted: number;
    maxRounds: number;
    wordEntries: { [playerId: string]: string[] };
    votes: { [voterId: string]: string };
    finalWord: string;
}

const VOTING_TIME = 60; // seconds
const ROUND_TIME = 30; // seconds per word round
const MAX_ROUNDS = 3; // max rounds per word

const ImposterGame: React.FC = () => {
    const { players, sharedState, setSharedState, isHost, currentPlayerId, mode } = useMultiplayer();

    const [localViewing, setLocalViewing] = useState(false);
    const [currentWordEntry, setCurrentWordEntry] = useState('');
    const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
    const [votingTimeLeft, setVotingTimeLeft] = useState(VOTING_TIME);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Fallback if no players
    if (players.length === 0) {
        return (
            <div className="imposter-container">
                <div className="imposter-lobby" style={{ textAlign: 'center' }}>
                    <h2 style={{ color: 'white', marginBottom: '2rem' }}>Please enter via Lobby</h2>
                    <a href="/lobby?game=imposter" className="imposter-btn start-game" style={{ textDecoration: 'none' }}>Go to Lobby</a>
                </div>
            </div>
        );
    }

    const state: ImposterState = {
        phase: 'LOBBY',
        wordData: null,
        imposterIndex: 0,
        imposterWord: '',
        roundsCompleted: 0,
        maxRounds: MAX_ROUNDS,
        wordEntries: {},
        votes: {},
        finalWord: '',
        ...sharedState,
    };

    const {
        phase,
        wordData,
        imposterIndex,
        imposterWord,
        roundsCompleted,
        maxRounds,
        wordEntries,
        votes,
        finalWord
    } = state;

    const amIImposter = currentPlayerId === players[imposterIndex]?.id;
    const isImposter = (playerId: string) => playerId === players[imposterIndex]?.id;

    // Get my entries
    const myEntries = wordEntries[currentPlayerId || ''] || [];

    // Count votes
    const voteCounts: { [playerId: string]: number } = {};
    Object.values(votes).forEach(targetId => {
        if (targetId) voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });

    // ============================================================
    // TIMERS
    // ============================================================
    useEffect(() => {
        if (phase === 'WORD_ENTRY') {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (phase === 'VOTING') {
            timerRef.current = setInterval(() => {
                setVotingTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [phase]);

    // ============================================================
    // GAME ACTIONS
    // ============================================================
    const startGame = async () => {
        if (!isHost) return;

        const randomIndex = Math.floor(Math.random() * players.length);
        const wordEntry = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];

        // Pick a different word for the imposter
        let imposterWordEntry = wordEntry;
        while (imposterWordEntry.word === wordEntry.word) {
            imposterWordEntry = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
        }

        await setSharedState({
            phase: 'WORD_REVEAL',
            wordData: { word: wordEntry.word, category: wordEntry.category },
            imposterIndex: randomIndex,
            imposterWord: imposterWordEntry.word,
            roundsCompleted: 0,
            maxRounds: MAX_ROUNDS,
            wordEntries: {},
            votes: {},
            finalWord: wordEntry.word,
        });

        setTimeLeft(ROUND_TIME);
    };

    const handleRevealContinue = () => {
        setLocalViewing(false);
        setSharedState({ phase: 'WORD_ENTRY' });
        setTimeLeft(ROUND_TIME);
    };

    const handleWordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentWordEntry.trim() || !currentPlayerId) return;

        const newEntries = {
            ...wordEntries,
            [currentPlayerId]: [...(wordEntries[currentPlayerId] || []), currentWordEntry.trim()]
        };

        await setSharedState({ wordEntries: newEntries });
        setCurrentWordEntry('');

        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(50);

        // Check if all players have entered a word this round
        const allEntered = players.every(p => (newEntries[p.id]?.length || 0) > roundsCompleted);
        if (allEntered) {
            // Move to next round or discussion
            if (roundsCompleted + 1 >= maxRounds) {
                await setSharedState({ phase: 'DISCUSSION' });
                setVotingTimeLeft(VOTING_TIME);
            } else {
                await setSharedState({ roundsCompleted: roundsCompleted + 1 });
                setTimeLeft(ROUND_TIME);
            }
        }
    };

    const handleSkipWord = async () => {
        if (!currentPlayerId) return;

        const newEntries = {
            ...wordEntries,
            [currentPlayerId]: [...(wordEntries[currentPlayerId] || []), '']
        };

        await setSharedState({ wordEntries: newEntries });

        // Haptic feedback for skip
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);

        // Check if all players have entered
        const allEntered = players.every(p => (newEntries[p.id]?.length || 0) > roundsCompleted);
        if (allEntered) {
            if (roundsCompleted + 1 >= maxRounds) {
                await setSharedState({ phase: 'DISCUSSION' });
                setVotingTimeLeft(VOTING_TIME);
            } else {
                await setSharedState({ roundsCompleted: roundsCompleted + 1 });
                setTimeLeft(ROUND_TIME);
            }
        }
    };

    const handleVote = async (targetId: string) => {
        if (phase !== 'VOTING' || !currentPlayerId) return;

        const newVotes = { ...votes, [currentPlayerId]: targetId };
        await setSharedState({ votes: newVotes });

        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

        // Check if all have voted
        if (Object.keys(newVotes).length >= players.length) {
            await setSharedState({ phase: 'RESULTS' });
        }
    };

    const handlePlayAgain = async () => {
        if (!isHost) return;
        await setSharedState({
            phase: 'LOBBY',
            wordData: null,
            imposterIndex: 0,
            imposterWord: '',
            roundsCompleted: 0,
            wordEntries: {},
            votes: {},
            finalWord: '',
        });
    };

    // ============================================================
    // RENDER
    // ============================================================
    const renderLobby = () => (
        <div className="imposter-lobby">
            <div className="lobby-icon">🕵️</div>
            <h1 className="imposter-title">IMPOSTER</h1>
            <p className="subtitle">One person has a different word. Can you spot the fake?</p>

            <div className="players-list">
                {players.map((p, idx) => (
                    <span key={p.id} className="player-tag">
                        {p.name} {p.isHost && '👑'}
                    </span>
                ))}
            </div>

            {isHost ? (
                <button className="imposter-btn start-game" onClick={startGame}>
                    START GAME
                </button>
            ) : (
                <p className="blink waiting-msg">Waiting for host...</p>
            )}

            <a href="/" className="exit-link">Exit to Hub</a>
        </div>
    );

    const renderWordReveal = () => {
        const myWord = amIImposter ? imposterWord : (wordData?.word || '');

        return (
            <div className="word-reveal-screen">
                <h2 className="reveal-label">Your Secret Word Is</h2>
                <div className={`word-card ${amIImposter ? 'imposter-word' : 'crew-word'}`}>
                    <span className="the-word">{myWord}</span>
                    {amIImposter && <span className="imposter-badge">YOU ARE THE IMPOSTER</span>}
                </div>
                <p className="reveal-hint">
                    {amIImposter
                        ? "You have a DIFFERENT word. Try to blend in!"
                        : "Remember this word. You'll say related things."}
                </p>
                <button className="imposter-btn continue-btn" onClick={handleRevealContinue}>
                    GOT IT!
                </button>
            </div>
        );
    };

    const renderWordEntry = () => {
        const myRoundEntries = wordEntries[currentPlayerId || ''] || [];
        const hasEnteredThisRound = myRoundEntries.length > roundsCompleted;

        return (
            <div className="word-entry-screen">
                <div className="round-indicator">
                    Round {roundsCompleted + 1} of {maxRounds}
                </div>

                <div className="timer-circle" style={{
                    '--progress': `${(timeLeft / ROUND_TIME) * 100}%`
                } as React.CSSProperties}>
                    <span className="timer-number">{timeLeft}</span>
                    <span className="timer-label">seconds</span>
                </div>

                <div className="the-word-display">
                    <span className="word-category">{wordData?.category}</span>
                    <span className="main-word">{wordData?.word}</span>
                </div>

                {myRoundEntries.length > 0 && (
                    <div className="my-entries">
                        <span className="entries-label">Your words so far:</span>
                        <div className="entries-list">
                            {myRoundEntries.map((entry, i) => (
                                <span key={i} className={`entry-tag ${entry === '' ? 'skipped' : ''}`}>
                                    {entry || 'PASSED'}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {hasEnteredThisRound ? (
                    <div className="waiting-for-others">
                        <p className="blink">Waiting for others...</p>
                    </div>
                ) : (
                    <form className="word-form" onSubmit={handleWordSubmit}>
                        <input
                            type="text"
                            className="word-input"
                            placeholder="Type a related word..."
                            value={currentWordEntry}
                            onChange={e => setCurrentWordEntry(e.target.value)}
                            autoFocus
                        />
                        <div className="button-row">
                            <button type="button" className="pass-btn" onClick={handleSkipWord}>
                                PASS
                            </button>
                            <button type="submit" className="submit-btn" disabled={!currentWordEntry.trim()}>
                                SUBMIT
                            </button>
                        </div>
                    </form>
                )}

                <div className="entries-summary">
                    {players.map(p => {
                        const entries = wordEntries[p.id] || [];
                        const hasEntered = entries.length > roundsCompleted;
                        return (
                            <span key={p.id} className={`player-status ${hasEntered ? 'ready' : ''}`}>
                                {p.name} {hasEntered ? '✓' : '...'}
                            </span>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderDiscussion = () => {
        const allEntries = Object.entries(wordEntries);

        return (
            <div className="discussion-screen">
                <div className="discussion-header">
                    <h1 className="alarm-text blink"> DISCUSSION</h1>
                    <p>Share your clues. Find the imposter.</p>
                </div>

                <div className="timer-bar-container">
                    <div
                        className="timer-bar-fill voting"
                        style={{ width: `${(votingTimeLeft / VOTING_TIME) * 100}%` }}
                    />
                </div>
                <span className="timer-text">{votingTimeLeft}s</span>

                <div className="all-entries">
                    {allEntries.map(([playerId, entries]) => {
                        const player = players.find(p => p.id === playerId);
                        return entries.map((entry, i) => (
                            <div key={`${playerId}-${i}`} className="entry-row">
                                <span className="entry-player">{player?.name}:</span>
                                <span className="entry-word">{entry || '(passed)'}</span>
                            </div>
                        ));
                    })}
                </div>

                <button
                    className="imposter-btn vote-start-btn"
                    onClick={() => setSharedState({ phase: 'VOTING' })}
                    disabled={!isHost}
                >
                    START VOTING
                </button>
            </div>
        );
    };

    const renderVoting = () => {
        const myVote = votes[currentPlayerId || ''];

        return (
            <div className="voting-screen">
                <h1 className="phase-title glow-red">VOTE</h1>
                <p className="vote-instruction">
                    Who do you think is the imposter?
                </p>

                <div className="timer-circle voting" style={{
                    '--progress': `${(votingTimeLeft / VOTING_TIME) * 100}%`
                } as React.CSSProperties}>
                    <span className="timer-number">{votingTimeLeft}</span>
                    <span className="timer-label">seconds</span>
                </div>

                <div className="target-grid">
                    {players.filter(p => p.id !== currentPlayerId).map(p => (
                        <button
                            key={p.id}
                            className={`target-card ${myVote === p.id ? 'selected' : ''}`}
                            onClick={() => handleVote(p.id)}
                            disabled={!!myVote}
                        >
                            <div className="avatar">{isImposter(p.id) ? '🕵️' : '😊'}</div>
                            <span className="target-name">{p.name}</span>
                            {voteCounts[p.id] > 0 && (
                                <span className="vote-count-badge">{voteCounts[p.id]}</span>
                            )}
                        </button>
                    ))}
                </div>

                {myVote && <p className="blink waiting-msg">Vote cast! Waiting...</p>}
            </div>
        );
    };

    const renderResults = () => {
        // Find who got most votes
        let maxVotes = 0;
        let votedOutId: string | null = null;
        Object.entries(voteCounts).forEach(([id, count]) => {
            if (count > maxVotes) {
                maxVotes = count;
                votedOutId = id;
            }
        });

        const wasCorrect = votedOutId === players[imposterIndex]?.id;

        return (
            <div className="results-screen">
                <div className="result-banner">
                    {wasCorrect ? (
                        <>
                            <h1 className="result-title glow-green">VILLAGERS WIN!</h1>
                            <p>The imposter was caught!</p>
                        </>
                    ) : (
                        <>
                            <h1 className="result-title glow-red">IMPOSTER WINS!</h1>
                            <p>The imposter was not found!</p>
                        </>
                    )}
                </div>

                <div className="reveal-card final">
                    <span className="reveal-label">The Word Was</span>
                    <span className="the-word large">{finalWord}</span>
                    <div className="imposter-reveal">
                        <span>The imposter was:</span>
                        <span className="imposter-name">
                            {players[imposterIndex]?.name}
                            {isImposter(currentPlayerId || '') && ' (YOU!)'}
                        </span>
                        <span className="imposter-word-reveal">with word: {imposterWord}</span>
                    </div>
                </div>

                <div className="votes-summary">
                    <h3>Votes</h3>
                    {players.map(p => (
                        <div key={p.id} className="vote-row">
                            <span className="voter">{p.name}</span>
                            <span className="arrow">→</span>
                            <span className="voted-for">{votes[p.id] ? players.find(pl => pl.id === votes[p.id])?.name : 'did not vote'}</span>
                        </div>
                    ))}
                </div>

                {isHost && (
                    <button className="imposter-btn start-game" onClick={handlePlayAgain}>
                        PLAY AGAIN
                    </button>
                )}

                <a href="/" className="exit-link"> Exit to Hub</a>
            </div>
        );
    };

    // ============================================================
    // MAIN RENDER
    // ============================================================
    return (
        <div className={`imposter-container state-${phase.toLowerCase()}`}>
            {phase === 'LOBBY' && renderLobby()}
            {phase === 'WORD_REVEAL' && renderWordReveal()}
            {phase === 'WORD_ENTRY' && renderWordEntry()}
            {phase === 'DISCUSSION' && renderDiscussion()}
            {phase === 'VOTING' && renderVoting()}
            {phase === 'RESULTS' && renderResults()}
        </div>
    );
};

export default ImposterGame;
