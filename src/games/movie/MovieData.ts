// ─────────────────────────────────────────────────────────────
//  MOVIE DATA — ROOM 37
//  Emoji rule: minimum 2 emojis must directly reference plot,
//  character, or iconic imagery. No vibes. No color associations.
//  Each genre has 20+ entries.
// ─────────────────────────────────────────────────────────────

export interface MovieEntry {
  emojis: string;
  answer: string;
  aliases?: string[];
  strict?: boolean;
  genre: Genre;
}

export type Genre =
  | 'action'
  | 'disney'
  | 'horror'
  | 'romance'
  | 'comedy'
  | 'anime'
  | 'tv';

export const GENRE_LABELS: Record<Genre, string> = {
  action:  '🎬 Blockbusters & Action',
  disney:  '✨ Disney & Animated',
  horror:  '💀 Horror & Thriller',
  romance: '💕 Romance & Drama',
  comedy:  '😂 Comedy',
  anime:   '⚔️ Anime',
  tv:      '📺 TV Shows',
};

export const MOVIE_DATABASE: MovieEntry[] = [

  // ════════════════════════════════════════
  //  BLOCKBUSTERS & ACTION  (30 entries)
  // ════════════════════════════════════════
  { genre: 'action', emojis: '🚢🧊💔',        answer: 'titanic',                aliases: ['titanic'] },
  { genre: 'action', emojis: '🦁👑🌍',         answer: 'the lion king',          aliases: ['lion king'] },
  { genre: 'action', emojis: '🕷️🏙️🕸️',       answer: 'spider-man',             aliases: ['spiderman', 'spider man'] },
  { genre: 'action', emojis: '🦇🌃🏙️',        answer: 'batman',                 aliases: ['the dark knight', 'batman begins'] },
  { genre: 'action', emojis: '🦖🚗🏃‍♂️',      answer: 'jurassic park',          aliases: ['jurassic park', 'jurassic world'] },
  { genre: 'action', emojis: '💊🐇🕶️🖥️',     answer: 'the matrix',             aliases: ['matrix'] },
  { genre: 'action', emojis: '🚀⭐⚔️🌌',      answer: 'star wars',              aliases: ['a new hope', 'empire strikes back'] },
  { genre: 'action', emojis: '💣🕵️‍♂️🎭',     answer: 'mission impossible',     aliases: ['mission impossible'] },
  { genre: 'action', emojis: '🕶️🔫🐶💀',     answer: 'john wick',              aliases: ['john wick'] },
  { genre: 'action', emojis: '⚡🔱🌩️👑',     answer: 'thor',                   aliases: ['thor ragnarok'] },
  { genre: 'action', emojis: '🛡️⭐🇺🇸🧊',    answer: 'captain america',        aliases: ['captain america'] },
  { genre: 'action', emojis: '🤖🦾🏙️🔴',     answer: 'iron man',               aliases: ['ironman', 'iron man'] },
  { genre: 'action', emojis: '🦸‍♂️🌌🚀🎵',   answer: 'guardians of the galaxy', aliases: ['guardians of the galaxy', 'guardians'] },
  { genre: 'action', emojis: '🩺🔮🪞✨',      answer: 'doctor strange',         aliases: ['dr strange', 'doctor strange'] },
  { genre: 'action', emojis: '🏎️💥🚗🏁',     answer: 'fast and furious',       aliases: ['fast furious', 'the fast and the furious', 'f9'] },
  { genre: 'action', emojis: '🗡️⚔️🏛️🩸',    answer: 'gladiator',              aliases: ['gladiator'] },
  { genre: 'action', emojis: '🛩️✈️🕶️🎵',    answer: 'top gun',                aliases: ['top gun', 'top gun maverick'] },
  { genre: 'action', emojis: '💀☠️🗡️👢',     answer: 'kill bill',              aliases: ['kill bill'] },
  { genre: 'action', emojis: '🏴‍☠️💀⚓🌊',   answer: 'pirates of the caribbean', aliases: ['pirates of the caribbean', 'pirates'] },
  { genre: 'action', emojis: '🐼🥋🍜🐉',     answer: 'kung fu panda',          aliases: ['kung fu panda'] },
  { genre: 'action', emojis: '👦⚡🧙‍♂️🏰',   answer: 'harry potter',           aliases: ['harry potter'] },
  { genre: 'action', emojis: '🧝‍♂️💍🌋🏔️',  answer: 'lord of the rings',      aliases: ['the lord of the rings', 'lotr', 'fellowship of the ring'] },
  { genre: 'action', emojis: '👽🛸🌽👦',      answer: 'et',                     aliases: ['e.t.', 'et the extra terrestrial'] },
  { genre: 'action', emojis: '🦸‍♂️🦸‍♀️💥🌍', answer: 'avengers',              aliases: ['the avengers', 'avengers endgame', 'avengers infinity war'] },
  { genre: 'action', emojis: '🐍✈️💼😱',      answer: 'snakes on a plane',      aliases: ['snakes on a plane'] },
  { genre: 'action', emojis: '🥊🥩🏃‍♂️🏆',   answer: 'rocky',                  aliases: ['rocky', 'creed'] },
  { genre: 'action', emojis: '🕵️‍♂️💣🌍🔒',   answer: 'james bond',             aliases: ['007', 'skyfall', 'casino royale', 'no time to die'] },
  { genre: 'action', emojis: '🧟‍♂️🔫🌎🧬',   answer: 'world war z',            aliases: ['world war z'] },
  { genre: 'action', emojis: '🏔️👓🏊‍♂️🦈',  answer: 'jaws',                   aliases: ['jaws'] },
  { genre: 'action', emojis: '🤖🚗🌍💥',      answer: 'transformers',           aliases: ['transformers'] },

  // ════════════════════════════════════════
  //  DISNEY & ANIMATED  (28 entries)
  // ════════════════════════════════════════
  { genre: 'disney', emojis: '❄️👸⛄🏔️',     answer: 'frozen',                 aliases: ['frozen'] },
  { genre: 'disney', emojis: '👹🟢🧅🐴',      answer: 'shrek',                  aliases: ['shrek'] },
  { genre: 'disney', emojis: '🐠🌊🔍👴',      answer: 'finding nemo',           aliases: ['nemo', 'finding nemo'] },
  { genre: 'disney', emojis: '🧸🤠🚀🐍',      answer: 'toy story',              aliases: ['toy story'] },
  { genre: 'disney', emojis: '👧🐉🏮🛁',      answer: 'spirited away',          aliases: ['spirited away'] },
  { genre: 'disney', emojis: '🦁☀️🐗🐒',      answer: 'the lion king',          aliases: ['lion king'], strict: true },
  { genre: 'disney', emojis: '🚗⚡🏆🏁',      answer: 'cars',                   aliases: ['cars'] },
  { genre: 'disney', emojis: '🐭👨‍🍳🍲🏰',   answer: 'ratatouille',            aliases: ['ratatouille'] },
  { genre: 'disney', emojis: '👴🏠🎈🌍',      answer: 'up',                     aliases: ['up'] },
  { genre: 'disney', emojis: '💇‍♀️🦎🏰🌺',   answer: 'tangled',                aliases: ['tangled', 'rapunzel'] },
  { genre: 'disney', emojis: '🐰🦊🏙️👮',     answer: 'zootopia',               aliases: ['zootopia'] },
  { genre: 'disney', emojis: '🤖🌱💝🛸',      answer: 'wall-e',                 aliases: ['wall e', 'walle'] },
  { genre: 'disney', emojis: '🦅⚔️🏰👸',      answer: 'brave',                  aliases: ['brave'] },
  { genre: 'disney', emojis: '🎃👻🎵🏙️',      answer: 'coco',                   aliases: ['coco'] },
  { genre: 'disney', emojis: '🐡🌊🎵🌺',      answer: 'moana',                  aliases: ['moana'] },
  { genre: 'disney', emojis: '🧞‍♂️🪔🐒🏜️',   answer: 'aladdin',                aliases: ['aladdin'] },
  { genre: 'disney', emojis: '🧜‍♀️🦀🔱🐙',   answer: 'the little mermaid',     aliases: ['little mermaid'] },
  { genre: 'disney', emojis: '🐸🎺🌿👸',      answer: 'the princess and the frog', aliases: ['princess and the frog'] },
  { genre: 'disney', emojis: '🐙🌊🔍💙',      answer: 'finding dory',           aliases: ['finding dory', 'dory'], strict: true },
  { genre: 'disney', emojis: '🏰🌹🕰️🐻',     answer: 'beauty and the beast',   aliases: ['beauty and the beast'] },
  { genre: 'disney', emojis: '👸🍎🏔️🪞',      answer: 'snow white',             aliases: ['snow white', 'snow white and the seven dwarfs'] },
  { genre: 'disney', emojis: '🐉🏮🀄👧',      answer: 'mulan',                  aliases: ['mulan'] },
  { genre: 'disney', emojis: '🐘🎪🤡👂',      answer: 'dumbo',                  aliases: ['dumbo'] },
  { genre: 'disney', emojis: '🐶🐕💉😈',      answer: '101 dalmatians',         aliases: ['101 dalmatians', 'one hundred and one dalmatians'] },
  { genre: 'disney', emojis: '🦁🤝🐗🦣',      answer: 'the jungle book',        aliases: ['jungle book'] },
  { genre: 'disney', emojis: '🤖🦸‍♂️🌆💥',   answer: 'big hero 6',             aliases: ['big hero 6'] },
  { genre: 'disney', emojis: '🐉🪄🏔️🧒',     answer: 'how to train your dragon', aliases: ['how to train your dragon'] },
  { genre: 'disney', emojis: '🐞🐜🌿🏠',      answer: "a bug's life",           aliases: ['a bugs life', 'bugs life'] },

  // ════════════════════════════════════════
  //  HORROR & THRILLER  (24 entries)
  // ════════════════════════════════════════
  { genre: 'horror', emojis: '🤡🎈🕳️☔',     answer: 'it',                     aliases: ['it', 'pennywise'] },
  { genre: 'horror', emojis: '🪓🚪🏨❄️',     answer: 'the shining',            aliases: ['the shining'] },
  { genre: 'horror', emojis: '📼📺💀👧',      answer: 'the ring',               aliases: ['the ring', 'ringu'] },
  { genre: 'horror', emojis: '🦈🏖️🩸🌊',    answer: 'jaws',                   aliases: ['jaws'], strict: true },
  { genre: 'horror', emojis: '👻🔫🌿🏠',      answer: 'ghostbusters',           aliases: ['ghostbusters'] },
  { genre: 'horror', emojis: '🧟‍♂️🏫🏃‍♀️🔒', answer: '28 days later',         aliases: ['28 days later'] },
  { genre: 'horror', emojis: '🩸🛏️💉🏫',     answer: 'carrie',                 aliases: ['carrie'] },
  { genre: 'horror', emojis: '🎭🔪🏠👀',      answer: 'scream',                 aliases: ['scream'] },
  { genre: 'horror', emojis: '🎃🔪🌙👩',      answer: 'halloween',              aliases: ['halloween'] },
  { genre: 'horror', emojis: '🪆🏡🌽👶',      answer: 'children of the corn',   aliases: ['children of the corn'] },
  { genre: 'horror', emojis: '👁️🌌🚪😱',      answer: 'get out',                aliases: ['get out'] },
  { genre: 'horror', emojis: '🏠👻💍🌿',      answer: 'conjuring',              aliases: ['the conjuring', 'conjuring'] },
  { genre: 'horror', emojis: '🎭🪚⛓️🏚️',    answer: 'saw',                    aliases: ['saw'] },
  { genre: 'horror', emojis: '🧬👁️🌌🔬',     answer: 'annihilation',           aliases: ['annihilation'] },
  { genre: 'horror', emojis: '🦠🏥💀🌍',      answer: 'contagion',              aliases: ['contagion'] },
  { genre: 'horror', emojis: '🐍🧬👽🚀',      answer: 'alien',                  aliases: ['alien', 'aliens'] },
  { genre: 'horror', emojis: '🏠🌽🚗🛣️',     answer: 'us',                     aliases: ['us'] },
  { genre: 'horror', emojis: '👶😈🏥🔪',      answer: "rosemary's baby",        aliases: ["rosemary's baby", 'rosemarys baby'] },
  { genre: 'horror', emojis: '🪵🔥🤡😈',      answer: 'midsommar',              aliases: ['midsommar'] },
  { genre: 'horror', emojis: '🧩💀🔫👁️',     answer: 'silence of the lambs',   aliases: ['silence of the lambs'] },
  { genre: 'horror', emojis: '🏚️🌽🌾👨‍🌾',  answer: 'a quiet place',          aliases: ['a quiet place'] },
  { genre: 'horror', emojis: '😈🕯️🧒🏠',     answer: 'the exorcist',           aliases: ['exorcist', 'the exorcist'] },
  { genre: 'horror', emojis: '🧟‍♂️🌍🏃‍♂️🔫', answer: 'world war z',           aliases: ['world war z'], strict: true },
  { genre: 'horror', emojis: '🎬📷👻🌲',      answer: 'paranormal activity',    aliases: ['paranormal activity'] },

  // ════════════════════════════════════════
  //  ROMANCE & DRAMA  (22 entries)
  // ════════════════════════════════════════
  { genre: 'romance', emojis: '🚢💔🧊🥂',    answer: 'titanic',                aliases: ['titanic'], strict: true },
  { genre: 'romance', emojis: '📓🌧️💑🏡',    answer: 'the notebook',           aliases: ['notebook', 'the notebook'] },
  { genre: 'romance', emojis: '💃🕺🎶🌇',     answer: 'la la land',             aliases: ['la la land'] },
  { genre: 'romance', emojis: '👠💰👗🌹',     answer: 'pretty woman',           aliases: ['pretty woman'] },
  { genre: 'romance', emojis: '⭐💫🗺️🎵',    answer: 'your name',              aliases: ['kimi no na wa', 'your name'] },
  { genre: 'romance', emojis: '🎤🎶🎪🎠',     answer: 'the greatest showman',   aliases: ['greatest showman'] },
  { genre: 'romance', emojis: '🌸🏫💌📱',     answer: 'to all the boys i loved before', aliases: ['to all the boys', 'tatlbp'] },
  { genre: 'romance', emojis: '💌🏙️💼🤵',    answer: 'when harry met sally',   aliases: ['when harry met sally'] },
  { genre: 'romance', emojis: '🎄❤️🏙️✈️',   answer: 'love actually',          aliases: ['love actually'] },
  { genre: 'romance', emojis: '🩺💀⚽💑',     answer: 'me before you',          aliases: ['me before you'] },
  { genre: 'romance', emojis: '⌛💑🏥📖',     answer: 'the time travelers wife', aliases: ['time travelers wife', 'the time traveler\'s wife'] },
  { genre: 'romance', emojis: '🌹🗡️🏰🎭',    answer: 'the princess bride',     aliases: ['princess bride'] },
  { genre: 'romance', emojis: '🩰🎵🐕💃',     answer: 'dirty dancing',          aliases: ['dirty dancing'] },
  { genre: 'romance', emojis: '💍🌊🏝️🤵',    answer: 'mamma mia',              aliases: ['mamma mia'] },
  { genre: 'romance', emojis: '⭐🏥💊🎻',     answer: 'a star is born',         aliases: ['a star is born'] },
  { genre: 'romance', emojis: '📚🌹🕰️🐻',    answer: 'beauty and the beast',   aliases: ['beauty and the beast'], strict: true },
  { genre: 'romance', emojis: '🌧️💑🏫🎒',    answer: 'a walk to remember',     aliases: ['a walk to remember'] },
  { genre: 'romance', emojis: '🎭💋🏙️🌃',    answer: 'crazy rich asians',      aliases: ['crazy rich asians'] },
  { genre: 'romance', emojis: '👗🏫🎀💅',     answer: 'mean girls',             aliases: ['mean girls'] },
  { genre: 'romance', emojis: '🧛‍♂️🌲🏫💔',  answer: 'twilight',               aliases: ['twilight', 'twilight saga'] },
  { genre: 'romance', emojis: '🏖️💑🌅🩺',    answer: 'the fault in our stars', aliases: ['fault in our stars'] },
  { genre: 'romance', emojis: '🌺🎻🏝️💑',    answer: 'out of africa',          aliases: ['out of africa'] },

  // ════════════════════════════════════════
  //  COMEDY  (22 entries)
  // ════════════════════════════════════════
  { genre: 'comedy', emojis: '🏠❄️🔫👦',      answer: 'home alone',             aliases: ['home alone'] },
  { genre: 'comedy', emojis: '🎅🧝🍝🏙️',     answer: 'elf',                    aliases: ['elf'] },
  { genre: 'comedy', emojis: '🍺🎲🐯🏨',      answer: 'the hangover',           aliases: ['hangover', 'the hangover'] },
  { genre: 'comedy', emojis: '👻🔫🚫🏙️',      answer: 'ghostbusters',           aliases: ['ghostbusters'], strict: true },
  { genre: 'comedy', emojis: '😱🎬🎭🔪',      answer: 'scary movie',            aliases: ['scary movie'] },
  { genre: 'comedy', emojis: '👨‍⚖️🏖️🩲👙',  answer: 'liar liar',              aliases: ['liar liar'] },
  { genre: 'comedy', emojis: '🐕🏠🚗👶',      answer: 'beethoven',              aliases: ['beethoven'] },
  { genre: 'comedy', emojis: '👴😤🏠🔫',      answer: 'gran torino',            aliases: ['gran torino'] },
  { genre: 'comedy', emojis: '😂🤵💃🎤',      answer: 'wedding crashers',       aliases: ['wedding crashers'] },
  { genre: 'comedy', emojis: '🎤🎵🏫🎒',      answer: 'school of rock',         aliases: ['school of rock'] },
  { genre: 'comedy', emojis: '🍕🚗💨👬',      answer: 'dumb and dumber',        aliases: ['dumb and dumber'] },
  { genre: 'comedy', emojis: '🕶️🌴🏖️🚓',    answer: 'bad boys',               aliases: ['bad boys'] },
  { genre: 'comedy', emojis: '🦊🐔🏕️🥚',     answer: 'chicken run',            aliases: ['chicken run'] },
  { genre: 'comedy', emojis: '🎳🚐🏆🤜',      answer: 'bowling for soup',       aliases: ['kingpin', 'bowling'] },
  { genre: 'comedy', emojis: '👬🏖️🩲🕶️',    answer: 'step brothers',          aliases: ['step brothers'] },
  { genre: 'comedy', emojis: '🍺🏘️🎸🤘',     answer: 'superbad',               aliases: ['superbad'] },
  { genre: 'comedy', emojis: '🤱👨🏠😅',      answer: 'three men and a baby',   aliases: ['three men and a baby'] },
  { genre: 'comedy', emojis: '🐟🌊💼🏖️',     answer: 'the waterboy',           aliases: ['waterboy', 'the waterboy'] },
  { genre: 'comedy', emojis: '🎃👻🏫🧟',      answer: 'hocus pocus',            aliases: ['hocus pocus'] },
  { genre: 'comedy', emojis: '🤡🎪🐘🎡',      answer: 'the greatest showman',   aliases: ['greatest showman'], strict: true },
  { genre: 'comedy', emojis: '🧔🍔🏈📺',      answer: 'the big lebowski',       aliases: ['big lebowski'] },
  { genre: 'comedy', emojis: '👮‍♂️🕶️🏎️🎵',  answer: 'beverly hills cop',      aliases: ['beverly hills cop'] },

  // ════════════════════════════════════════
  //  ANIME  (26 entries)
  //  Rule: emojis = iconic character ability or visual
  // ════════════════════════════════════════
  { genre: 'anime', emojis: '🍥👊🐸🍜',       answer: 'naruto',                 aliases: ['naruto', 'naruto shippuden'] },
  { genre: 'anime', emojis: '⛵🍖👒☠️',       answer: 'one piece',              aliases: ['one piece'] },
  { genre: 'anime', emojis: '👁️📓🍎✏️',       answer: 'death note',             aliases: ['death note'] },
  { genre: 'anime', emojis: '⚔️🏃‍♂️🦋🔥',    answer: 'demon slayer',           aliases: ['demon slayer', 'kimetsu no yaiba'] },
  { genre: 'anime', emojis: '🏃‍♂️🔑🪖⚔️',    answer: 'attack on titan',        aliases: ['attack on titan', 'aot'] },
  { genre: 'anime', emojis: '💪🦶🏠🥊',        answer: 'one punch man',          aliases: ['one punch man', 'opm'] },
  { genre: 'anime', emojis: '🧬⚗️🔧🦾',        answer: 'fullmetal alchemist',    aliases: ['fullmetal alchemist', 'fma', 'brotherhood'] },
  { genre: 'anime', emojis: '🐉🌍💪⚡',        answer: 'dragon ball z',          aliases: ['dragon ball z', 'dbz', 'dragon ball'] },
  { genre: 'anime', emojis: '🏫🎓💥🦸',        answer: 'my hero academia',       aliases: ['my hero academia', 'mha', 'bnha'] },
  { genre: 'anime', emojis: '🗡️⚔️🕹️🌐',      answer: 'sword art online',       aliases: ['sword art online', 'sao'] },
  { genre: 'anime', emojis: '🧊🌊💧🎴',        answer: 'demon slayer mugen train', aliases: ['demon slayer mugen train', 'mugen train'], strict: true },
  { genre: 'anime', emojis: '🐾🌺👧🌊',        answer: 'spirited away',          aliases: ['spirited away'], strict: true },
  { genre: 'anime', emojis: '🚂💨🌙🏔️',        answer: 'castle in the sky',      aliases: ['castle in the sky', 'laputa'] },
  { genre: 'anime', emojis: '🐺🌕🏹🏔️',        answer: 'princess mononoke',      aliases: ['princess mononoke'] },
  { genre: 'anime', emojis: '🚁🌳🐱🏙️',        answer: 'my neighbor totoro',     aliases: ['my neighbor totoro', 'totoro'] },
  { genre: 'anime', emojis: '⚓🌊🔱💪',        answer: 'one piece film red',     aliases: ['one piece film red', 'film red'], strict: true },
  { genre: 'anime', emojis: '🐉🧙‍♂️⚔️🏰',    answer: 'dragon ball super broly', aliases: ['broly', 'dragon ball super broly'], strict: true },
  { genre: 'anime', emojis: '🧠📡🤖🌍',        answer: 'ghost in the shell',     aliases: ['ghost in the shell'] },
  { genre: 'anime', emojis: '🔴👁️🌑🕷️',       answer: 'tokyo ghoul',            aliases: ['tokyo ghoul'] },
  { genre: 'anime', emojis: '🏫🎭😈😇',         answer: 'assassination classroom', aliases: ['assassination classroom', 'ansatsu kyoushitsu'] },
  { genre: 'anime', emojis: '⚔️🛡️🌸🐉',       answer: 'fate stay night',        aliases: ['fate stay night', 'fate', 'fate zero'] },
  { genre: 'anime', emojis: '🔥🚒🏙️👨‍🚒',     answer: 'fire force',             aliases: ['fire force'] },
  { genre: 'anime', emojis: '👣📚🐣🌿',         answer: 'the promised neverland', aliases: ['promised neverland', 'the promised neverland'] },
  { genre: 'anime', emojis: '🧬🏃‍♀️🌑🔫',     answer: 'parasyte',               aliases: ['parasyte', 'kiseijuu'] },
  { genre: 'anime', emojis: '👊🏆🌊🏋️',        answer: 'hajime no ippo',         aliases: ['hajime no ippo', 'fighting spirit'] },
  { genre: 'anime', emojis: '🏐🧢🔥🏫',         answer: 'haikyuu',                aliases: ['haikyuu', 'haikyu'] },

  // ════════════════════════════════════════
  //  TV SHOWS  (24 entries)
  // ════════════════════════════════════════
  { genre: 'tv', emojis: '🐉👑❄️⚔️',           answer: 'game of thrones',        aliases: ['game of thrones', 'got'] },
  { genre: 'tv', emojis: '💊🔬🧪🌵',           answer: 'breaking bad',           aliases: ['breaking bad'] },
  { genre: 'tv', emojis: '🕵️‍♂️🎻🔍🏙️',       answer: 'sherlock',               aliases: ['sherlock', 'sherlock holmes'] },
  { genre: 'tv', emojis: '🕳️🌍👶💡',           answer: 'stranger things',        aliases: ['stranger things'] },
  { genre: 'tv', emojis: '☕🔪🏭🎩',            answer: 'peaky blinders',         aliases: ['peaky blinders'] },
  { genre: 'tv', emojis: '🧛‍♂️🌲🏫💔',         answer: 'vampire diaries',        aliases: ['vampire diaries', 'the vampire diaries'] },
  { genre: 'tv', emojis: '👬👭🏙️☕',           answer: 'friends',                aliases: ['friends'] },
  { genre: 'tv', emojis: '🏥💉👨‍⚕️🩺',         answer: 'greys anatomy',          aliases: ["grey's anatomy", 'greys anatomy'] },
  { genre: 'tv', emojis: '🦅⚔️🌊🪓',           answer: 'vikings',                aliases: ['vikings'] },
  { genre: 'tv', emojis: '🐍👨‍💼💊🏜️',         answer: 'better call saul',       aliases: ['better call saul'] },
  { genre: 'tv', emojis: '👮‍♂️🚓😂🏙️',         answer: 'brooklyn nine-nine',     aliases: ['brooklyn nine nine', 'brooklyn 99', 'b99'] },
  { genre: 'tv', emojis: '⚖️👔🏙️💼',           answer: 'suits',                  aliases: ['suits'] },
  { genre: 'tv', emojis: '🧟‍♂️🔫🏕️👨‍👧',     answer: 'the walking dead',       aliases: ['walking dead', 'the walking dead'] },
  { genre: 'tv', emojis: '🔮🌌👽🛸',            answer: 'the x files',            aliases: ['x files', 'the x-files'] },
  { genre: 'tv', emojis: '⏰🏠👨‍👩‍👧💡',       answer: 'dark',                   aliases: ['dark'] },
  { genre: 'tv', emojis: '🏰👑💍🌍',            answer: 'the crown',              aliases: ['the crown'] },
  { genre: 'tv', emojis: '🗡️🐺✨🏔️',           answer: 'the witcher',            aliases: ['witcher', 'the witcher'] },
  { genre: 'tv', emojis: '🤖🏜️🎠🎭',           answer: 'westworld',              aliases: ['westworld'] },
  { genre: 'tv', emojis: '🔴💰🎭🏦',            answer: 'money heist',            aliases: ['money heist', 'la casa de papel'] },
  { genre: 'tv', emojis: '🦁⚔️🌊🏰',            answer: 'the last kingdom',       aliases: ['last kingdom', 'the last kingdom'] },
  { genre: 'tv', emojis: '🏡👻💍😱',            answer: 'the haunting of hill house', aliases: ['haunting of hill house', 'hill house'] },
  { genre: 'tv', emojis: '🏫🍫🤏💊',            answer: 'euphoria',               aliases: ['euphoria'] },
  { genre: 'tv', emojis: '🎮💀🏆🩸',            answer: 'squid game',             aliases: ['squid game'] },
  { genre: 'tv', emojis: '🧠💡🔐🎭',            answer: 'prison break',           aliases: ['prison break'] },
];

// ─────────────────────────────────────────────────────────────
//  Pool management
// ─────────────────────────────────────────────────────────────
let usedIndices = new Set<number>();

export const resetMoviePool = () => { usedIndices.clear(); };

export const getMoviesByGenres = (genres: Genre[], count: number): MovieEntry[] => {
  const pool = MOVIE_DATABASE
    .map((m, i) => ({ m, i }))
    .filter(({ m, i }) => genres.includes(m.genre) && !usedIndices.has(i));

  if (pool.length < count) {
    usedIndices.clear();
    return getMoviesByGenres(genres, count);
  }

  const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, count);
  shuffled.forEach(({ i }) => usedIndices.add(i));
  return shuffled.map(({ m }) => m);
};

// Legacy fallback (uses all genres)
export const getRandomMovies = (count = 10): MovieEntry[] =>
  getMoviesByGenres(['action', 'disney', 'horror', 'romance', 'comedy', 'anime', 'tv'], count);

export const getGenreCount = (genre: Genre): number =>
  MOVIE_DATABASE.filter(m => m.genre === genre).length;

// ─────────────────────────────────────────────────────────────
//  Matching — generous but not broken
// ─────────────────────────────────────────────────────────────
const normalize = (s: string): string =>
  s.toLowerCase()
   .replace(/^(the |a |an )/, '')   // strip leading articles
   .replace(/[^a-z0-9\s]/g, '')     // strip punctuation
   .replace(/\s+/g, ' ')
   .trim();

const levenshtein = (a: string, b: string): number => {
  const dp: number[][] = Array.from({ length: b.length + 1 }, (_, i) =>
    Array.from({ length: a.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= b.length; i++)
    for (let j = 1; j <= a.length; j++)
      dp[i][j] = b[i-1] === a[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j-1], dp[i][j-1], dp[i-1][j]);
  return dp[b.length][a.length];
};

export const isCorrectGuess = (guess: string, answer: string, strict = false): boolean => {
  const g = normalize(guess);
  const a = normalize(answer);

  if (g === a) return true;
  if (strict) return levenshtein(g, a) <= 1;

  // Article-stripped exact match
  if (g === a) return true;

  // Substring match — "lion king" matches "the lion king"
  if (a.includes(g) || g.includes(a)) return true;

  // Levenshtein for typos — 1 per 6 chars
  const maxDist = Math.floor(Math.max(g.length, a.length) / 6);
  if (maxDist >= 1 && levenshtein(g, a) <= maxDist) return true;

  return false;
};

export const checkAnswerWithAliases = (guess: string, entry: MovieEntry): boolean => {
  if (isCorrectGuess(guess, entry.answer, entry.strict)) return true;
  return (entry.aliases ?? []).some(a => isCorrectGuess(guess, a, entry.strict));
};

// Re-export type for MovieGame
export type { MovieEntry as default };