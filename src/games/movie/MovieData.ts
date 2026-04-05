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
  //  🎬 BLOCKBUSTERS & ACTION (35 entries)
  // ════════════════════════════════════════
  { genre: 'action', emojis: '🚢🚪🥶💎',       answer: 'titanic',                aliases: ['titanic'] }, // The wooden door, freezing, heart of the ocean
  { genre: 'action', emojis: '🦁👑🐗🐛',       answer: 'the lion king',          aliases: ['lion king'] }, // Timon, Pumbaa, and eating bugs (Hakuna Matata!)
  { genre: 'action', emojis: '🕷️👨📸🕸️',       answer: 'spider-man',             aliases: ['spiderman', 'spider man'] }, // Spider + Man + Peter's camera
  { genre: 'action', emojis: '🦇👨🃏🪙',       answer: 'batman',                 aliases: ['the dark knight', 'batman begins'] }, // Bat + Man + Joker + Two-Face coin
  { genre: 'action', emojis: '🦟💧🦖🚗',       answer: 'jurassic park',          aliases: ['jurassic park', 'jurassic world'] }, // Mosquito in amber + the water cup ripple!
  { genre: 'action', emojis: '🔴🔵💊🐇',       answer: 'the matrix',             aliases: ['matrix'] }, // Red pill, blue pill, white rabbit
  { genre: 'action', emojis: '⭐⚔️👨‍👦🔦',       answer: 'star wars',              aliases: ['a new hope', 'empire strikes back'] }, // "I am your father" + lightsabers
  { genre: 'action', emojis: '🧗‍♂️🏢🎭🏃‍♂️',       answer: 'mission impossible',     aliases: ['mission impossible'] }, // Climbing the Burj Khalifa, face masks, Tom Cruise running
  { genre: 'action', emojis: '🐶✏️🔫👔',       answer: 'john wick',              aliases: ['john wick'] }, // The dog, his suit, and the legendary pencil
  { genre: 'action', emojis: '🔨⚡🍺🎮',       answer: 'thor',                   aliases: ['thor ragnarok', 'avengers endgame'] }, // Hammer, lightning, and "Fat Thor" playing video games with beer
  { genre: 'action', emojis: '🛡️🦅🧊💪',       answer: 'captain america',        aliases: ['captain america'] }, // Shield, eagle, frozen in ice
  { genre: 'action', emojis: '👔👨🔴⚡',       answer: 'iron man',               aliases: ['ironman', 'iron man'] }, // A visual pun: Iron (Necktie) + Man!
  { genre: 'action', emojis: '🦝🌳📼🕺',       answer: 'guardians of the galaxy', aliases: ['guardians of the galaxy', 'guardians'] }, // Rocket, Groot, Mix Tape, Dance-off
  { genre: 'action', emojis: '🩺👁️⏳🔄',       answer: 'doctor strange',         aliases: ['dr strange', 'doctor strange'] }, // Doctor + Eye of Agamotto + Time Loop ("I've come to bargain")
  { genre: 'action', emojis: '🦲🏎️👨‍👩‍👦🍻',       answer: 'fast and furious',       aliases: ['fast furious', 'the fast and the furious', 'f9'] }, // Bald head (Dom), fast car, FAMILY, and Corona beers
  { genre: 'action', emojis: '👎🏟️🐯⚔️',       answer: 'gladiator',              aliases: ['gladiator'] }, // Thumbs down, Colosseum, fighting tigers
  { genre: 'action', emojis: '✈️😎🏐🏍️',       answer: 'top gun',                aliases: ['top gun', 'top gun maverick'] }, // Jets, aviator glasses, beach volleyball, and motorcycles
  { genre: 'action', emojis: '👱‍♀️💛🗡️🩸',       answer: 'kill bill',              aliases: ['kill bill', 'kill bill vol 1'] }, // Blonde, yellow tracksuit, katana, blood
  { genre: 'action', emojis: '🏴‍☠️🐦‍⬛🧭🏺',       answer: 'pirates of the caribbean', aliases: ['pirates of the caribbean', 'pirates'] }, // Pirate, Jack's compass, and the "Jar of Dirt!"
  { genre: 'action', emojis: '🐼🍜🥟🐉',       answer: 'kung fu panda',          aliases: ['kung fu panda'] }, // Panda, noodles, dumplings, Dragon Warrior
  { genre: 'action', emojis: '⚡👓🦉🚂',       answer: 'harry potter',           aliases: ['harry potter'] }, // Scar, glasses, Hedwig, Hogwarts Express
  { genre: 'action', emojis: '👁️🌋💍🦅',       answer: 'lord of the rings',      aliases: ['the lord of the rings', 'lotr', 'fellowship of the ring'] }, // Eye of Sauron, Mount Doom, the Ring, the Eagles saving them
  { genre: 'action', emojis: '🛸👦🚲🌕',       answer: 'et',                     aliases: ['e.t.', 'et the extra terrestrial'] }, // The iconic bike flying across the moon
  { genre: 'action', emojis: '🫰💨🦸‍♂️🦸‍♀️',       answer: 'avengers',               aliases: ['the avengers', 'avengers endgame', 'avengers infinity war'] }, // Thanos' Snap turning half the heroes to dust
  { genre: 'action', emojis: '🐍✈️🤬💥',       answer: 'snakes on a plane',      aliases: ['snakes on a plane'] }, // Snakes, plane, swearing (Samuel L. Jackson)
  { genre: 'action', emojis: '🥊🥩🏃‍♂️🏢',       answer: 'rocky',                  aliases: ['rocky', 'creed'] }, // Boxing, punching meat, running up the Philadelphia museum steps
  { genre: 'action', emojis: '🍸🔫🚗🇬🇧',       answer: 'james bond',             aliases: ['007', 'skyfall', 'casino royale', 'no time to die'] }, // Martini (shaken not stirred), gun, Aston Martin, UK
  { genre: 'action', emojis: '🧱🧟‍♂️🧟‍♂️🚁',       answer: 'world war z',            aliases: ['world war z'] }, // The iconic scene of zombies building a pyramid over the giant wall
  { genre: 'action', emojis: '🦈⛵💥🛢️',       answer: 'jaws',                   aliases: ['jaws'] }, // Shark, boat, shooting the exploding oxygen barrel
  { genre: 'action', emojis: '🚗🤖💥👧',       answer: 'transformers',           aliases: ['transformers'] }, // Car turning into robot, explosions, Megan Fox
  
  // -- Recent / Cult Additions --
  { genre: 'action', emojis: '🏜️🪱👁️🔷',       answer: 'dune',                   aliases: ['dune', 'dune part two'] }, // Desert, Sandworm, Blue eyes (Spice)
  { genre: 'action', emojis: '🎩💣🔥🤯',       answer: 'oppenheimer',            aliases: ['oppenheimer'] }, // Fedora hat, atomic bomb, fire, mind blown
  { genre: 'action', emojis: '🥯🌭🤞👁️',       answer: 'everything everywhere all at once', aliases: ['everything everywhere all at once', 'eeaao'] }, // The everything bagel, hotdog fingers, googly eyes
  { genre: 'action', emojis: '🔴⚔️🌮🤬',       answer: 'deadpool',               aliases: ['deadpool', 'deadpool and wolverine'] }, // Red suit, dual swords, chimichangas/tacos, swearing
  { genre: 'action', emojis: '🎸🔥🚗🏜️',       answer: 'mad max',                aliases: ['mad max fury road', 'mad max'] }, // The flaming guitar guy, cars, wasteland
 // ════════════════════════════════════════
  //  ✨ DISNEY & ANIMATED (52 entries)
  // ════════════════════════════════════════
  
  // -- The Golden Era & Renaissance --
  { genre: 'disney', emojis: '🪞🍎⛏️⚰️',       answer: 'snow white',             aliases: ['snow white', 'snow white and the seven dwarfs'] }, // Mirror, Poison Apple, Pickaxe, Glass Coffin
  { genre: 'disney', emojis: '🤥🪵🐋🧚‍♀️',       answer: 'pinocchio',              aliases: ['pinocchio'] }, // Lying nose, Wood block, Monstro the Whale, Blue Fairy
  { genre: 'disney', emojis: '🐘👂🪶🎪',       answer: 'dumbo',                  aliases: ['dumbo'] }, // Elephant, Ears, the Magic Feather, Circus tent
  { genre: 'disney', emojis: '🐇🕳️☕🎩',       answer: 'alice in wonderland',    aliases: ['alice in wonderland'] }, // White rabbit, Rabbit hole, Tea party, Mad Hatter
  { genre: 'disney', emojis: '🧚‍♂️🏴‍☠️🐊🕰️',       answer: 'peter pan',              aliases: ['peter pan'] }, // Tinkerbell, Captain Hook, the Crocodile that swallowed a Clock
  { genre: 'disney', emojis: '💤👸🐉🗡️',       answer: 'sleeping beauty',        aliases: ['sleeping beauty'] }, // Sleeping Princess, Maleficent Dragon, Sword of Truth
  { genre: 'disney', emojis: '🐶🐶🚗🧥',       answer: '101 dalmatians',         aliases: ['101 dalmatians', 'one hundred and one dalmatians','101'] }, // Dogs, Cruella's car, the Fur Coat!
  { genre: 'disney', emojis: '🐻🐍🐅🔥',       answer: 'the jungle book',        aliases: ['jungle book', 'the jungle book'] }, // Baloo, Kaa, Shere Khan, the "Red Flower" (fire)
  { genre: 'disney', emojis: '🍴🧜‍♀️🦀🗣️',       answer: 'the little mermaid',     aliases: ['little mermaid', 'the little mermaid'] }, // Dinglehopper (fork), Ariel, Sebastian, Stolen Voice
  { genre: 'disney', emojis: '🥀🕰️🕯️🫖',       answer: 'beauty and the beast',   aliases: ['beauty and the beast'] }, // Wilting Rose, Cogsworth, Lumiere, Mrs. Potts
  { genre: 'disney', emojis: '🪔🧞‍♂️🍞🐅',       answer: 'aladdin',                aliases: ['aladdin'] }, // Magic Lamp, Genie, the Stolen Bread, Rajah the Tiger
  { genre: 'disney', emojis: '🦁👑🐛🐗',       answer: 'the lion king',          aliases: ['lion king', 'the lion king'] }, // Lion King, eating grubs with Pumbaa (Hakuna Matata)
  { genre: 'disney', emojis: '⚡🏛️💪🐐',       answer: 'hercules',               aliases: ['hercules'] }, // Lightning bolt, Olympus, Muscles, Phil the Satyr
  { genre: 'disney', emojis: '🐉🦗💇‍♀️🗡️',       answer: 'mulan',                  aliases: ['mulan'] }, // Mushu, Cri-Kee, Cutting her hair with a Sword
  { genre: 'disney', emojis: '🦍🌴🏄‍♂️🦍',       answer: 'tarzan',                 aliases: ['tarzan'] }, // Gorilla, Jungle, Tree-surfing!
  { genre: 'disney', emojis: '🦙🧪⛰️👑',       answer: 'the emperors new groove', aliases: ['emperors new groove', 'the emperors new groove'] }, // Kuzco llama, Yzma's potion, Pacha's mountain, Crown

  // -- The 2000s, Pixar Classics & Modern Disney --
  { genre: 'disney', emojis: '🤠🚀👢🐍',       answer: 'toy story',              aliases: ['toy story'] }, // "There's a snake in my boot!" + Buzz & Woody
  { genre: 'disney', emojis: '🐜🎪🐦🔍',       answer: 'a bugs life',            aliases: ['a bugs life', 'bugs life'] }, // Ant, Circus bugs, the Bird, getting burned by a Magnifying Glass
  { genre: 'disney', emojis: '🚪👁️🐻👧',       answer: 'monsters inc',           aliases: ['monsters inc', 'monsters university'] }, // The Door, Mike (One Eye), Sulley (Bear), Boo
  { genre: 'disney', emojis: '🤡🐟🤿🪥',       answer: 'finding nemo',           aliases: ['nemo', 'finding nemo'] }, // Clownfish, Scuba diver mask, and cleaning the tank with a toothbrush!
  { genre: 'disney', emojis: '🦸‍♂️🦸‍♀️👶🏃‍♂️',       answer: 'the incredibles',        aliases: ['incredibles', 'the incredibles'] }, // Mr. Incredible, Elastigirl, Jack-Jack, Dash
  { genre: 'disney', emojis: '⚡🏎️👅🏆',       answer: 'cars',                   aliases: ['cars'] }, // Lightning McQueen tying the race with his tongue!
  { genre: 'disney', emojis: '🐀👨‍🍳🍲🥖',       answer: 'ratatouille',            aliases: ['ratatouille'] }, // Rat pulling the chef's hair, Soup, Baguette
  { genre: 'disney', emojis: '🤖🌱🥾🪳',       answer: 'wall-e',                 aliases: ['wall e', 'walle', 'wall-e'] }, // Robot, the Plant in the Boot, his pet Cockroach
  { genre: 'disney', emojis: '🎈🏠👴🐕',       answer: 'up',                     aliases: ['up'] }, // Balloons carrying a house, Carl, and Dug the dog
  { genre: 'disney', emojis: '🐸🎺🐊🍳',       answer: 'the princess and the frog', aliases: ['princess and the frog'] }, // Frog, Louis' Trumpet, Gator, Tiana's Gumbo pot!
  { genre: 'disney', emojis: '🍳🦎💇‍♀️🗼',       answer: 'tangled',                aliases: ['tangled', 'rapunzel'] }, // Frying Pan weapon, Pascal, Haircut, the Tower
  { genre: 'disney', emojis: '🏹👩‍🦰🐻🐻',       answer: 'brave',                  aliases: ['brave'] }, // Bow & arrow, Merida, Mom and Brothers turning into bears
  { genre: 'disney', emojis: '🧊👑⛄🚪',       answer: 'frozen',                 aliases: ['frozen'] }, // Ice, Queen, Olaf, "Do you want to build a snowman" door
  { genre: 'disney', emojis: '🎈🤖🤛🍭',       answer: 'big hero 6',             aliases: ['big hero 6', 'bh6'] }, // Inflatable Baymax, Fist Bump ("Balalala"), Hiro's lollipop trick
  { genre: 'disney', emojis: '😡😢😨🤢',       answer: 'inside out',             aliases: ['inside out'] }, // The literal emotions: Anger, Sadness, Fear, Disgust
  { genre: 'disney', emojis: '🐰🦊🦥🖨️',       answer: 'zootopia',               aliases: ['zootopia'] }, // Judy, Nick, and Flash the Sloth at the DMV printer
  { genre: 'disney', emojis: '🌊⛵🐔🌀',       answer: 'moana',                  aliases: ['moana'] }, // Ocean, Canoe, Hei Hei the chicken, Heart of Te Fiti
  { genre: 'disney', emojis: '🐙☕🐚🐟',       answer: 'finding dory',           aliases: ['finding dory', 'dory'] }, // Hank the Octopus, the Coffee Pot she gets carried in, Shell path
  { genre: 'disney', emojis: '🎸💀🏵️👵',       answer: 'coco',                   aliases: ['coco'] }, // Hector's guitar, Skull, Marigold petals, Mama Coco
  { genre: 'disney', emojis: '🕯️🦋💪👂',       answer: 'encanto',                aliases: ['encanto'] }, // The Miracle Candle, Butterfly, Luisa's muscles, Dolores listening

  // -- DreamWorks, Illumination & Other Animation Greats --
  { genre: 'disney', emojis: '🧅🍰🐴🏰',       answer: 'shrek',                  aliases: ['shrek'] }, // "Ogres are like onions/cakes!", Donkey, rescuing the Princess
  { genre: 'disney', emojis: '🟢🐴🗡️🐱',       answer: 'shrek 2',                aliases: ['shrek 2'] }, // Shrek, Donkey, and the introduction of Puss in Boots!
  { genre: 'disney', emojis: '🐉🦿🐟🛡️',       answer: 'how to train your dragon', aliases: ['how to train your dragon', 'httyd'] }, // Toothless, Hiccup's prosthetic leg, feeding fish, Viking shield
  { genre: 'disney', emojis: '🐼🍜🥋🐉',       answer: 'kung fu panda',          aliases: ['kung fu panda'] }, // Po, his dad's noodles, Karate, the Dragon Scroll
  { genre: 'disney', emojis: '🌕👓🦄👨‍👧‍👧',       answer: 'despicable me',          aliases: ['despicable me'] }, // Stealing the moon, Minion goggles, "It's so fluffy!", Gru and the girls
  { genre: 'disney', emojis: '🐱👢⚔️🐺',       answer: 'puss in boots the last wish', aliases: ['puss in boots the last wish', 'puss in boots'] }, // Cat, Boots, Sword fighting the literal Wolf of Death

  // -- Spider-Verse --
  { genre: 'disney', emojis: '🕷️🎧👟🏙️',       answer: 'spider-man into the spider-verse', aliases: ['into the spider verse', 'into the spider-verse', 'spider verse'] }, // Miles' headphones and iconic unlaced sneakers!
  { genre: 'disney', emojis: '🕷️🌀🎸🤰',       answer: 'spider-man across the spider-verse', aliases: ['across the spider verse', 'across the spider-verse'] }, // Multiverse portals, Spider-Punk's guitar, Pregnant Spider-Woman

  // -- The "Recent / Upcoming" Modern Box Office --
  { genre: 'disney', emojis: '😬🧡😭🧠',       answer: 'inside out 2',           aliases: ['inside out 2'] }, // Anxiety (Orange), tearing up, inside the brain!
  { genre: 'disney', emojis: '🛶🌊🐙⚡',       answer: 'moana 2',                aliases: ['moana 2'] }, // The canoe, the ocean, the giant octopus, lightning storms
  { genre: 'disney', emojis: '🐐🏀⛹️‍♂️🦒',       answer: 'goat',                   aliases: ['goat'] }, // Ty Burrell's 2026 film! A goat, playing Roarball (basketball), with Lenny the Giraffe
  { genre: 'disney', emojis: '🦫🤖🌳🧠',       answer: 'hoppers',                aliases: ['hoppers'] }, // Pixar's 2026 film! The Beaver, the Robot body, the Glade, Mind-transfer!
  { genre: 'disney', emojis: '👦👽🛸👁️',       answer: 'elio',                   aliases: ['elio'] }, // Pixar's 2026 film! The boy, aliens, being abducted, his injured eye!
// ════════════════════════════════════════
  //  💀 HORROR & THRILLER (37 entries)
  // ════════════════════════════════════════
  
  // -- The Classics & Slashers --
  { genre: 'horror', emojis: '🚿🔪🩸🏨',       answer: 'psycho',                 aliases: ['psycho'] }, // The shower scene, knife, Bates motel
  { genre: 'horror', emojis: '🤮⛪🛏️👧',       answer: 'the exorcist',           aliases: ['exorcist', 'the exorcist'] }, // Pea soup vomit, church, possessed girl in bed
  { genre: 'horror', emojis: '🎃🔪🧥👧',       answer: 'halloween',              aliases: ['halloween'] }, // Pumpkin, Michael's coveralls, knife, babysitter
  { genre: 'horror', emojis: '🛌🔪🧤🔥',       answer: 'a nightmare on elm street', aliases: ['nightmare on elm street', 'freddy krueger'] }, // Sleeping, Freddy's knife glove, fire
  { genre: 'horror', emojis: '🪚🍖🚐🎭',       answer: 'the texas chainsaw massacre', aliases: ['texas chainsaw massacre', 'texas chainsaw'] }, // Chainsaw, meat hook, the van, Leatherface's skin mask
  { genre: 'horror', emojis: '🦈⛵🛢️💥',       answer: 'jaws',                   aliases: ['jaws'], strict: true }, // Shark, boat, shooting the oxygen barrel!
  { genre: 'horror', emojis: '👽🥚🦀🚀',       answer: 'alien',                  aliases: ['alien', 'aliens'] }, // Xenomorph, egg, facehugger (crab), spaceship
  { genre: 'horror', emojis: '❄️🚁🐕👽',       answer: 'the thing',              aliases: ['the thing'] }, // Antarctica, chopper, the infected dog, alien
  { genre: 'horror', emojis: '🩸👗👑🔥',       answer: 'carrie',                 aliases: ['carrie'] }, // Pig's blood, prom dress, prom queen crown, fire
  { genre: 'horror', emojis: '✂️💇‍♀️👶😈',       answer: 'rosemarys baby',         aliases: ["rosemary's baby", 'rosemarys baby'] }, // Pixie haircut, baby carriage, the devil
  
  // -- The 90s, 2000s & Paranormal --
  { genre: 'horror', emojis: '😱📞🔪🍿',       answer: 'scream',                 aliases: ['scream'] }, // Ghostface, phone call, knife, stove popcorn
  { genre: 'horror', emojis: '🦋🍷🥩🐑',       answer: 'silence of the lambs',   aliases: ['silence of the lambs', 'the silence of the lambs'] }, // Moth, Chianti wine, liver (meat), Lambs
  { genre: 'horror', emojis: '🎥🌲⛺🪵',       answer: 'the blair witch project', aliases: ['blair witch project', 'blair witch'] }, // Handheld camera, woods, tent, stick figure (wood)
  { genre: 'horror', emojis: '📺📼☎️👧',       answer: 'the ring',               aliases: ['the ring', 'ringu'] }, // Static TV, VHS tape, the 7-days phone call, Samara
  { genre: 'horror', emojis: '🧩🚲🪚🩸',       answer: 'saw',                    aliases: ['saw'] }, // Jigsaw puzzle, Billy's tricycle, the hacksaw
  { genre: 'horror', emojis: '🇬🇧🧟‍♂️🩸🏃‍♂️',       answer: '28 days later',          aliases: ['28 days later'] }, // UK, rage zombies, blood, running
  { genre: 'horror', emojis: '✈️🪵🎢💀',       answer: 'final destination',      aliases: ['final destination'] }, // Flight 180, log truck, rollercoaster, death
  { genre: 'horror', emojis: '🎥🛏️🕒👻',       answer: 'paranormal activity',    aliases: ['paranormal activity'] }, // Night vision camera, bed, time passing, demon
  { genre: 'horror', emojis: '👏👻🎵👗',       answer: 'the conjuring',          aliases: ['the conjuring', 'conjuring'] }, // The "clap clap" hide & seek, ghost, music box, Annabelle's dress
  { genre: 'horror', emojis: '🧱🧟‍♂️🧟‍♂️🚁',       answer: 'world war z',            aliases: ['world war z'], strict: true }, // The giant wall pyramid of zombies, helicopter

  // -- A24, Peele & Modern Masterpieces --
  { genre: 'horror', emojis: '☕🥄🦌🧠',       answer: 'get out',                aliases: ['get out'] }, // The teacup, spoon, the stag, the sunken place (brain)
  { genre: 'horror', emojis: '✂️🐇👯‍♀️🔴',       answer: 'us',                     aliases: ['us'] }, // Golden scissors, rabbits, doppelgängers, red jumpsuits
  { genre: 'horror', emojis: '☁️🛸🐒🐎',       answer: 'nope',                   aliases: ['nope'] }, // The unmoving cloud, UFO, Gordy the chimp, horses
  { genre: 'horror', emojis: '👑🕊️🚗🥜',       answer: 'hereditary',             aliases: ['hereditary'] }, // Paimon's crown, the dead pigeon, car window, peanut allergy
  { genre: 'horror', emojis: '☀️🐻🌺🔥',       answer: 'midsommar',              aliases: ['midsommar'] }, // The midnight sun, bear suit, May Queen flower crown, fire
  { genre: 'horror', emojis: '🤡🎈⛵🌧️',       answer: 'it',                     aliases: ['it', 'pennywise'] }, // Pennywise, red balloon, Georgie's paper boat, rain
  { genre: 'horror', emojis: '🤫🦶👂🌽',       answer: 'a quiet place',          aliases: ['a quiet place'] }, // Shush, bare feet (no shoes), super hearing, cornfield
  { genre: 'horror', emojis: '🎩🧥📖🕷️',       answer: 'the babadook',           aliases: ['babadook', 'the babadook'] }, // Top hat, long coat, the pop-up book, spiders
  { genre: 'horror', emojis: '🐻🗣️🌺👽',       answer: 'annihilation',           aliases: ['annihilation'] }, // The screaming mutant bear, the shimmer flowers, alien

  // -- The Recent Viral Hits (2022 - 2024) --
  { genre: 'horror', emojis: '🤚🕯️🤝👻',       answer: 'talk to me',             aliases: ['talk to me'] }, // The embalmed hand, candle, shaking hands to let them in!
  { genre: 'horror', emojis: '🏠🍼🔦👹',       answer: 'barbarian',              aliases: ['barbarian'] }, // The Airbnb house, baby bottle, flashlight, the Mother
  { genre: 'horror', emojis: '🤖👧💃🔪',       answer: 'm3gan',                  aliases: ['m3gan', 'megan'] }, // Robot girl, dancing in the hallway, paper cutter blade!
  { genre: 'horror', emojis: '😁🔪🩸😨',       answer: 'smile',                  aliases: ['smile'] }, // The creepy smile, knife, blood, trauma
  { genre: 'horror', emojis: '🕷️🦵🪆🎂',       answer: 'longlegs',               aliases: ['longlegs'] }, // Spider, Long Legs, the cursed doll, the birthday cake
  { genre: 'horror', emojis: '🐻🐰🍕🔦',       answer: 'five nights at freddys', aliases: ['five nights at freddys', 'fnaf'] }, // Freddy, Bonnie, Pizza place, security flashlight
  { genre: 'horror', emojis: '🤡🔪🩸🗑️',       answer: 'terrifier',              aliases: ['terrifier', 'terrifier 2', 'terrifier 3'] }, // Art the Clown, knife, heavy gore, trash bag
 // ════════════════════════════════════════
  //  💕 ROMANCE & DRAMA (32 entries)
  // ════════════════════════════════════════
  
  // -- The Absolute Tearjerkers --
  { genre: 'romance', emojis: '🌧️🚣‍♂️💌🦢',       answer: 'the notebook',           aliases: ['notebook', 'the notebook'] }, // Kissing in the rain, the rowboat, love letters, swans
  { genre: 'romance', emojis: '🚢🎨💎🚪',       answer: 'titanic',                aliases: ['titanic'], strict: true }, // The ship, drawing her like a French girl, Heart of the Ocean, the wooden door
  { genre: 'romance', emojis: '🚬☁️🇳🇱♾️',       answer: 'the fault in our stars', aliases: ['fault in our stars', 'tfios'] }, // Unlit cigarette, "Okay" clouds, Amsterdam, infinity
  { genre: 'romance', emojis: '🐝🦽🏰😢',       answer: 'me before you',          aliases: ['me before you'] }, // Bumblebee tights, wheelchair, his castle, crying
  { genre: 'romance', emojis: '🔭🎭📝⛪',       answer: 'a walk to remember',     aliases: ['a walk to remember'] }, // Building the telescope, the school play, bucket list, getting married in the church
  { genre: 'romance', emojis: '🏺🪙👻🚇',       answer: 'ghost',                  aliases: ['ghost'] }, // The pottery wheel scene, the sliding penny, ghost, subway train
  
  // -- Rom-Com Royalty --
  { genre: 'romance', emojis: '🍉💃🕺⬆️',       answer: 'dirty dancing',          aliases: ['dirty dancing'] }, // "I carried a watermelon", dancing, the iconic Lift!
  { genre: 'romance', emojis: '🍓🛁🛍️👠',       answer: 'pretty woman',           aliases: ['pretty woman'] }, // Strawberries & champagne, singing in the tub, shopping bags ("Big mistake. Huge.")
  { genre: 'romance', emojis: '🥪🗣️😳🗽',       answer: 'when harry met sally',   aliases: ['when harry met sally'] }, // Deli sandwich, the fake climax scene, embarrassed diners, New York
  { genre: 'romance', emojis: '📚🎥🍊🚪',       answer: 'notting hill',           aliases: ['notting hill'] }, // Travel bookshop, movie star, spilled orange juice, the blue door
  { genre: 'romance', emojis: '🎤🏟️🎸🔟',       answer: '10 things i hate about you', aliases: ['10 things i hate about you', 'ten things i hate about you'] }, // Singing on the stadium bleachers, guitar, the 10-line poem
  { genre: 'romance', emojis: '🎄🪧🚪🇬🇧',       answer: 'love actually',          aliases: ['love actually'] }, // Christmas, the cue cards at the front door, UK
  { genre: 'romance', emojis: '💍🥟👗🇸🇬',       answer: 'crazy rich asians',      aliases: ['crazy rich asians'] }, // The emerald ring, making dumplings, makeover, Singapore
  { genre: 'romance', emojis: '🇬🇷👰‍♂️👨‍👧‍👧🎤',       answer: 'mamma mia',              aliases: ['mamma mia'] }, // Greece, bride, 3 possible dads, ABBA singing
  { genre: 'romance', emojis: '🏃‍♂️🗑️💃🕺',       answer: 'silver linings playbook', aliases: ['silver linings playbook'] }, // Running in a trash bag, the dance competition
  { genre: 'romance', emojis: '☀️📅🎧🏢',       answer: '500 days of summer',     aliases: ['500 days of summer', 'five hundred days of summer'] }, // Summer, the day counter, listening to the Smiths in the elevator, architecture
  
  // -- Drama, Period Pieces & Musicals --
  { genre: 'romance', emojis: '🌧️✋🏰😒',       answer: 'pride and prejudice',    aliases: ['pride and prejudice'] }, // The rain proposal, the hand flex, Pemberley estate, grumpy Mr. Darcy
  { genre: 'romance', emojis: '📝💇‍♀️🎹🔥',       answer: 'little women',           aliases: ['little women'] }, // Jo writing, cutting her hair, Beth's piano, burning the manuscript
  { genre: 'romance', emojis: '💃🕺🎷🔭',       answer: 'la la land',             aliases: ['la la land'] }, // Tap dancing, jazz saxophone, floating in the observatory
  { genre: 'romance', emojis: '⭐🎸🎤👃',       answer: 'a star is born',         aliases: ['a star is born'] }, // Star, playing guitar, singing, touching her nose
  { genre: 'romance', emojis: '🎪🎩🧔‍♀️🎶',       answer: 'the greatest showman',   aliases: ['greatest showman', 'the greatest showman'] }, // Circus tent, PT Barnum's hat, the bearded lady, singing
  { genre: 'romance', emojis: '⚔️🐀☠️💋',       answer: 'the princess bride',     aliases: ['princess bride', 'the princess bride'] }, // Sword fight, Rodents of Unusual Size, Iocane powder (poison), true love's kiss
  { genre: 'romance', emojis: '🐠🔫🪽☠️',       answer: 'romeo and juliet',       aliases: ['romeo + juliet', 'romeo and juliet', 'romeo & juliet'] }, // Meeting through the fish tank, guns (swords), angel wings costume, poison
  { genre: 'romance', emojis: '🤠🤠⛺🐑',       answer: 'brokeback mountain',     aliases: ['brokeback mountain'] }, // Two cowboys, the tent, herding sheep
  { genre: 'romance', emojis: '🍑🚲☀️🇮🇹',       answer: 'call me by your name',   aliases: ['call me by your name', 'cmbyn'] }, // The peach, riding bikes, summer sun, Italy
  
  // -- Modern Hits & Teen Romance --
  { genre: 'romance', emojis: '🧛‍♂️🌲🏫🍎',       answer: 'twilight',               aliases: ['twilight', 'twilight saga'] }, // Vampire, Forks forest, high school, the iconic book cover apple
  { genre: 'romance', emojis: '💌✉️📦🏃‍♂️',       answer: 'to all the boys ive loved before', aliases: ['to all the boys i loved before', 'to all the boys ive loved before', 'to all the boys'] }, // The letters, the teal hat box, fake dating / running track
  { genre: 'romance', emojis: '🇰🇷🗽💻🎠',       answer: 'past lives',             aliases: ['past lives'] }, // Childhood in Korea, meeting in NY, Skype calls, the carousel
  { genre: 'romance', emojis: '🕷️🚁🇦🇺🪧',       answer: 'anyone but you',         aliases: ['anyone but you'] }, // The spider in his pants, helicopter rescue, Australia, fake dating
  { genre: 'romance', emojis: '☄️✍️✋🌌',       answer: 'your name',              aliases: ['kimi no na wa', 'your name'] }, // The comet, writing "I love you" on her hand, the twilight sky
  { genre: 'romance', emojis: '⌛💑🏥📖',       answer: 'the time travelers wife', aliases: ['time travelers wife', 'the time traveler\'s wife'] }, // Time passing, lovers, meeting in the hospital, his journal
  { genre: 'romance', emojis: '🌺🛩️🦁☕',       answer: 'out of africa',          aliases: ['out of africa'] }, // Africa, flying the biplane, shooting the lion, coffee plantation
 // ════════════════════════════════════════
  //  😂 COMEDY (36 entries)
  // ════════════════════════════════════════

  // -- Slapstick & 90s Legends --
  { genre: 'comedy', emojis: '👦😱🧴🪤',       answer: 'home alone',             aliases: ['home alone'] }, // Kevin screaming with aftershave, and the booby traps!
  { genre: 'comedy', emojis: '🚐🐶⛷️🚽',       answer: 'dumb and dumber',        aliases: ['dumb and dumber', 'dumb & dumber'] }, // The Mutt Cutts dog van, skiing, and the broken toilet
  { genre: 'comedy', emojis: '👨‍⚖️👖🔥🤥',       answer: 'liar liar',              aliases: ['liar liar'] }, // Lawyer + "Liar Liar Pants on Fire"
  { genre: 'comedy', emojis: '🕵️‍♂️🐬🌺🦜',       answer: 'ace ventura',            aliases: ['ace ventura pet detective', 'ace ventura'] }, // Pet detective, Snowflake the dolphin, Hawaiian shirt, parrot
  { genre: 'comedy', emojis: '⛳🏒🐊👊',       answer: 'happy gilmore',          aliases: ['happy gilmore'] }, // Golf, hockey stick, the alligator, punching Bob Barker
  { genre: 'comedy', emojis: '💧🏈😡🚜',       answer: 'the waterboy',           aliases: ['waterboy', 'the waterboy'] }, // Water, football, angry tackles, lawnmower
  { genre: 'comedy', emojis: '⏰🔁❄️🐹',       answer: 'groundhog day',          aliases: ['groundhog day'] }, // Alarm clock looping, winter snow, the literal groundhog
  { genre: 'comedy', emojis: '👻🚫🔫🚒',       answer: 'ghostbusters',           aliases: ['ghostbusters'], strict: true }, // Ghost symbol, proton pack, Ecto-1 siren
  { genre: 'comedy', emojis: '🧙‍♀️🧙‍♀️🧙‍♀️🐈‍⬛🕯️',   answer: 'hocus pocus',            aliases: ['hocus pocus'] }, // The 3 Sanderson sisters, Thackery Binx (cat), Black Flame Candle
  { genre: 'comedy', emojis: '🎳🪝💇‍♂️⛪',       answer: 'kingpin',                aliases: ['kingpin'] }, // Bowling, hook hand, bad comb-over, Amish church

  // -- The Frat Pack, Will Ferrell & 2000s Hits --
  { genre: 'comedy', emojis: '🎅🧝🍝🍁',       answer: 'elf',                    aliases: ['elf'] }, // Santa, Elf, eating spaghetti with maple syrup!
  { genre: 'comedy', emojis: '🎤📺🔱🐻',       answer: 'anchorman',              aliases: ['anchorman', 'anchorman the legend of ron burgundy'] }, // News mic, TV, Brick's trident, the bear pit
  { genre: 'comedy', emojis: '🥁🛥️🛏️🛏️',       answer: 'step brothers',          aliases: ['step brothers'] }, // Drum set, Boats 'N Hoes, making bunk beds!
  { genre: 'comedy', emojis: '🐯🦷👶🎰',       answer: 'the hangover',           aliases: ['hangover', 'the hangover'] }, // Mike Tyson's tiger, Stu's missing tooth, Carlos the baby, Vegas casino
  { genre: 'comedy', emojis: '🚔🆔🍻👓',       answer: 'superbad',               aliases: ['superbad'] }, // Cops, McLovin's Fake ID, beer, Fogell's glasses
  { genre: 'comedy', emojis: '👔🎩⛵🍖',       answer: 'wedding crashers',       aliases: ['wedding crashers'] }, // Suits, weddings, sailing, "MA THE MEATLOAF!"
  { genre: 'comedy', emojis: '🍍🚂💨🔫',       answer: 'pineapple express',      aliases: ['pineapple express'] }, // Pineapple + Train (Express) + smoke/guns
  { genre: 'comedy', emojis: '🎬🚁🐼💣',       answer: 'tropic thunder',         aliases: ['tropic thunder'] }, // Making a movie, helicopter, the panda, explosions
  { genre: 'comedy', emojis: '🧔🍔🎳🥛',       answer: 'the big lebowski',       aliases: ['big lebowski', 'the big lebowski'] }, // The Dude, In-N-Out burger, bowling, White Russian milk
  { genre: 'comedy', emojis: '👨‍🎤📸🚫↩️',       answer: 'zoolander',              aliases: ['zoolander'] }, // Male model, photoshoot, "I can't turn left"
  
  // -- Teen, Spoofs & Cult Classics --
  { genre: 'comedy', emojis: '🤓🥔🦙🕺',       answer: 'napoleon dynamite',      aliases: ['napoleon dynamite'] }, // Glasses, tater tots in pocket, Tina the llama, the dance routine
  { genre: 'comedy', emojis: '🏫🎒🚔💊',       answer: '21 jump street',         aliases: ['21 jump street'] }, // High school, undercover cops, the drug bust
  { genre: 'comedy', emojis: '👱‍♀️👛🐕⚖️',       answer: 'legally blonde',         aliases: ['legally blonde'] }, // Blonde, pink purse, Bruiser the dog, lawyer scales
  { genre: 'comedy', emojis: '👗🤢✈️🎤',       answer: 'bridesmaids',            aliases: ['bridesmaids'] }, // Dress fitting, food poisoning, the airplane scene, Wilson Phillips singing
  { genre: 'comedy', emojis: '😱🍿🔪🎭',       answer: 'scary movie',            aliases: ['scary movie'] }, // Spoofing Scream, popcorn, stabbing
  { genre: 'comedy', emojis: '🥥🐰🏰🗡️',       answer: 'monty python and the holy grail', aliases: ['monty python', 'holy grail', 'monty python and the holy grail'] }, // Coconut horse hooves, killer rabbit, castles
  { genre: 'comedy', emojis: '🎸🤘🏫👨‍🏫',       answer: 'school of rock',         aliases: ['school of rock'] }, // Guitars, rock n roll, school, Jack Black teaching
  { genre: 'comedy', emojis: '🇬🇧👓☮️🐈',       answer: 'austin powers',          aliases: ['austin powers'] }, // UK flag, glasses, peace sign, Mr. Bigglesworth the hairless cat
  { genre: 'comedy', emojis: '🇰🇿👨🏻👙🎤',       answer: 'borat',                  aliases: ['borat'] }, // Kazakhstan, mustache, the green mankini, microphone
  { genre: 'comedy', emojis: '👱‍♀️👱‍♀️👧👦👗',   answer: 'white chicks',           aliases: ['white chicks'] }, // Two blonde women who are actually two men in dresses
  
  // -- Action-Comedy & Buddy Cops --
  { genre: 'comedy', emojis: '🏏🧟‍♂️🍺🔴',       answer: 'shaun of the dead',      aliases: ['shaun of the dead'] }, // Cricket bat weapon, zombies, waiting at the pub, red tie
  { genre: 'comedy', emojis: '👮‍♂️🌴🍌🚗',       answer: 'beverly hills cop',      aliases: ['beverly hills cop'] }, // Cop, Beverly Hills palm trees, the banana in the tailpipe!
  { genre: 'comedy', emojis: '🕶️👽🔫🐶',       answer: 'men in black',           aliases: ['men in black', 'mib'] }, // Suits/sunglasses, aliens, memory eraser (gun), Frank the pug
  { genre: 'comedy', emojis: '👮‍♂️👮‍♂️🍁🥞',       answer: 'super troopers',         aliases: ['super troopers'] }, // Cops, maple syrup chugging, pancakes
  { genre: 'comedy', emojis: '🎸🤘📺🚗',       answer: 'waynes world',           aliases: ['waynes world'] }, // Guitars, public access TV, headbanging in the car
  { genre: 'comedy', emojis: '👨👨👨👶🍼',       answer: 'three men and a baby',   aliases: ['three men and a baby'] }, // Three men, one baby, bottle
 
  
 // ════════════════════════════════════════
  //  ⚔️ ANIME (30 Entries)
  // ════════════════════════════════════════
  { genre: 'anime', emojis: '👦🗡️🏢🛒', answer: 'kotaro lives alone', aliases: ['kotaro lives alone'] },
  { genre: 'anime', emojis: '⚔️🌊🐗🎋', answer: 'demon slayer', aliases: ['demon slayer', 'kimetsu no yaiba'] },
  { genre: 'anime', emojis: '🎹🎻🌸😭', answer: 'your lie in april', aliases: ['your lie in april', 'shigatsu wa kimi no uso'] },
  { genre: 'anime', emojis: '🗡️🛸🍓👓', answer: 'gintama', aliases: ['gintama'] },
  { genre: 'anime', emojis: '🏸🏀📦❤️', answer: 'blue box', aliases: ['blue box', 'ao no hako'] },
  { genre: 'anime', emojis: '🍥🦊🍜🏃‍♂️', answer: 'naruto', aliases: ['naruto', 'naruto shippuden'] },
  { genre: 'anime', emojis: '🐉🌕🐒⚡', answer: 'dragon ball z', aliases: ['dragon ball', 'dragon ball z', 'dbz'] },
  { genre: 'anime', emojis: '♣️📖⚔️🗣️', answer: 'black clover', aliases: ['black clover'] },
  { genre: 'anime', emojis: '🍖👒🏴‍☠️⛵', answer: 'one piece', aliases: ['one piece'] },
  { genre: 'anime', emojis: '🤞👁️👹🏫', answer: 'jujutsu kaisen', aliases: ['jujutsu kaisen', 'jjk'] },
  
  { genre: 'anime', emojis: '🧱🪖🥩🧣', answer: 'attack on titan', aliases: ['attack on titan', 'aot', 'shingeki no kyojin'] }, // The wall, military, titan meat, Mikasa's scarf
  { genre: 'anime', emojis: '🥦🦸‍♂️💥📓', answer: 'my hero academia', aliases: ['my hero academia', 'mha', 'bnha'] }, // Deku's broccoli hair & notebook, Bakugo's explosion
  { genre: 'anime', emojis: '🎣🕷️🃏👊', answer: 'hunter x hunter', aliases: ['hunter x hunter', 'hxh'] }, // Fishing rod, phantom troupe spider, Hisoka's joker card, Jajanken
  { genre: 'anime', emojis: '🦾🧬🐶⚗️', answer: 'fullmetal alchemist', aliases: ['fullmetal alchemist', 'fma', 'brotherhood', 'fmab'] },
  { genre: 'anime', emojis: '🍎📓✒️⏱️', answer: 'death note', aliases: ['death note'] }, // Ryuk's apple, the note, the pen, the 40 seconds
  { genre: 'anime', emojis: '🗡️💀🍓🦋', answer: 'bleach', aliases: ['bleach'] }, // Sword, hollow skull, strawberry (Ichigo), hell butterfly
  { genre: 'anime', emojis: '🦲🥚👊🦸‍♂️', answer: 'one punch man', aliases: ['one punch man', 'opm'] }, // Bald head, egg, one punch
  { genre: 'anime', emojis: '🧛‍♂️🛑🌟🤜', answer: 'jojos bizarre adventure', aliases: ["jojo's bizarre adventure", 'jojo', 'jojos'] }, // Vampire (Dio), Time Stop, Joestar birthmark, punching rush
  { genre: 'anime', emojis: '🐉🛁🐷👻', answer: 'spirited away', aliases: ['spirited away'] }, // Haku dragon, bathhouse, pig parents, No Face
  { genre: 'anime', emojis: '☔🐱🚌👧', answer: 'my neighbor totoro', aliases: ['my neighbor totoro', 'totoro'] },
  
  { genre: 'anime', emojis: '🏐👑🦅🗑️', answer: 'haikyuu', aliases: ['haikyuu', 'haikyu'] }, // Volleyball, Grand King, Karasuno Crow, Battle at the Garbage Dump
  { genre: 'anime', emojis: '☕👁️🐛🤍', answer: 'tokyo ghoul', aliases: ['tokyo ghoul'] }, // Anteiku coffee, one red eye, Yamori's centipede, Kaneki's white hair
  { genre: 'anime', emojis: '⚔️🌐🎧👩‍❤️‍👨', answer: 'sword art online', aliases: ['sword art online', 'sao'] },
  { genre: 'anime', emojis: '🍌🕰️📱👨‍🔬', answer: 'steins gate', aliases: ['steins gate', 'steins;gate'] }, // Gelbana, time, phone microwave, mad scientist
  { genre: 'anime', emojis: '🪚🐶😈🩸', answer: 'chainsaw man', aliases: ['chainsaw man', 'csm'] }, // Chainsaw, Pochita, Devil, Blood
  { genre: 'anime', emojis: '🕵️‍♂️🥜🐶🔫', answer: 'spy x family', aliases: ['spy x family', 'spy family'] }, // Loid, Anya's peanuts, Bond, Yor
  { genre: 'anime', emojis: '🥣🥄👻💯', answer: 'mob psycho 100', aliases: ['mob psycho 100', 'mob psycho'] }, // Bowl cut, bent spoon, spirits, 100%
  { genre: 'anime', emojis: '🤠🚀🎷🐕', answer: 'cowboy bebop', aliases: ['cowboy bebop'] }, // Cowboy, spaceship, jazz, Ein the corgi
  { genre: 'anime', emojis: '🤖👼🩸🎧', answer: 'evangelion', aliases: ['neon genesis evangelion', 'evangelion'] }, // Eva, Angel, Blood, Shinji's cassette player
  { genre: 'anime', emojis: '🦾🌙🏃‍♂️🌃', answer: 'cyberpunk edgerunners', aliases: ['cyberpunk edgerunners', 'edgerunners', 'cyberpunk'] }, // Cyberware, David's moon, Sandevistan running, Night City
  { genre: 'anime', emojis: '⚽🔵🔒🧩', answer: 'blue lock', aliases: ['blue lock', 'bluelock'] },
 // ════════════════════════════════════════
  //  📺 TV SHOWS (41 entries)
  // ════════════════════════════════════════

  // -- The HBO/Prestige Drama Titans --
  { genre: 'tv', emojis: '🐉❄️🍷🪑',       answer: 'game of thrones',        aliases: ['game of thrones', 'got'] }, // Dragons, Winter, Cersei's Wine, the Iron Throne
  { genre: 'tv', emojis: '🦆🤌🚬🔫',       answer: 'the sopranos',           aliases: ['the sopranos', 'sopranos'] }, // The ducks in the pool, Italian hand, cigars, mob hits
  { genre: 'tv', emojis: '🚁🛥️🏢🤬',       answer: 'succession',             aliases: ['succession'] }, // Helicopters, yachts, skyscrapers, and Logan Roy's favorite swear words
  { genre: 'tv', emojis: '⚗️🩲🚐🍗',       answer: 'breaking bad',           aliases: ['breaking bad', 'bb'] }, // Chemistry, Walt's tighty-whities, the RV, Los Pollos Hermanos
  { genre: 'tv', emojis: '⚖️📞🐍🧁',       answer: 'better call saul',       aliases: ['better call saul', 'bcs'] }, // Lawyer scales, burner phones, Slippin' Jimmy snake, Cinnabon
  { genre: 'tv', emojis: '🦌👑🌀🍺',       answer: 'true detective',         aliases: ['true detective'] }, // Antlers (S1), Yellow King, the spiral, Rust's Lone Star beer cans
  { genre: 'tv', emojis: '🚬🥃👔🏙️',       answer: 'mad men',                aliases: ['mad men'] }, // Cigarettes, whiskey, sharp suits, NYC advertising
  { genre: 'tv', emojis: '👑🐶🍵🇬🇧',       answer: 'the crown',              aliases: ['the crown'] }, // The Crown, the Queen's Corgis, English Tea, UK
  { genre: 'tv', emojis: '🤠🐎🏔️🚁',       answer: 'yellowstone',            aliases: ['yellowstone'] }, // Cowboys, horses, Montana mountains, the Dutton helicopter

  // -- Classic Sitcoms & Comedy --
  { genre: 'tv', emojis: '🍮📎🏆🏢',       answer: 'the office',             aliases: ['the office', 'office us', 'the office us'] }, // Jello stapler, paperclip, Dundie Award, Dunder Mifflin
  { genre: 'tv', emojis: '🛋️☕🦞🖼️',       answer: 'friends',                aliases: ['friends'] }, // The orange couch, Central Perk, "He's her lobster!", the yellow door frame
  { genre: 'tv', emojis: '🥨🥣👕🏙️',       answer: 'seinfeld',               aliases: ['seinfeld'] }, // "These pretzels are making me thirsty", Soup Nazi, the Puffy Shirt
  { genre: 'tv', emojis: '🌳🥓🧇🎷',       answer: 'parks and recreation',   aliases: ['parks and rec', 'parks and recreation'] }, // Parks, Ron's bacon, Leslie's waffles, Duke Silver's sax
  { genre: 'tv', emojis: '👮‍♂️🚓🎃🥣',       answer: 'brooklyn nine-nine',     aliases: ['brooklyn nine nine', 'brooklyn 99', 'b99'] }, // Cops, the Halloween Heist, Terry loves Yogurt!
  { genre: 'tv', emojis: '⚽🍪👨🏻🇬🇧',       answer: 'ted lasso',              aliases: ['ted lasso'] }, // Soccer, pink box of biscuits, the mustache, UK
  { genre: 'tv', emojis: '🍻🧥🏙️👩‍🏫',       answer: 'how i met your mother',  aliases: ['how i met your mother', 'himym'] }, // MacLaren's Pub, the yellow umbrella, NYC, Ted teaching

  // -- Sci-Fi, Fantasy & Thriller --
  { genre: 'tv', emojis: '🚲🧇🔦👾',       answer: 'stranger things',        aliases: ['stranger things'] }, // Riding bikes, Eleven's Eggos, flashlight, the Demogorgon
  { genre: 'tv', emojis: '✈️🏝️🔢💨',       answer: 'lost',                   aliases: ['lost'] }, // Plane crash, island, the Hurley numbers, the Smoke Monster
  { genre: 'tv', emojis: '👽🛸🔦🌻',       answer: 'the x files',            aliases: ['x files', 'the x-files', 'x-files'] }, // Aliens, UFO, flashlights in the dark, Mulder's sunflower seeds
  { genre: 'tv', emojis: '☢️🟨☔🔄',       answer: 'dark',                   aliases: ['dark'] }, // Nuclear plant, the yellow raincoat, the rain, the time loop
  { genre: 'tv', emojis: '📱📺🐷💔',       answer: 'black mirror',           aliases: ['black mirror'] }, // Phone screen, TV, the Episode 1 Pig, shattered glass/heart
  { genre: 'tv', emojis: '🏢🧠🐐🧇',       answer: 'severance',              aliases: ['severance'] }, // Lumon office, severed brains, the baby goats, the Waffle Party!
  { genre: 'tv', emojis: '🤠🤖🏜️🎹',       answer: 'westworld',              aliases: ['westworld'] }, // Cowboy, robot host, desert, the player piano
  { genre: 'tv', emojis: '🐺⚔️🛁🪙',       answer: 'the witcher',            aliases: ['witcher', 'the witcher'] }, // The White Wolf, silver sword, the iconic bathtub scene, "Toss a coin"
  { genre: 'tv', emojis: '🍄👧🎸🧟‍♂️',       answer: 'the last of us',         aliases: ['the last of us', 'tlou'] }, // Cordyceps mushroom, Ellie, Joel's guitar, Infected
  { genre: 'tv', emojis: '🦸‍♂️🦅🇺🇸🍼',       answer: 'the boys',               aliases: ['the boys'] }, // Superheroes, Homelander's eagle/flag, drinking milk!

  // -- Network Hits, Procedurals & Dramas --
  { genre: 'tv', emojis: '🏥👩‍⚕️💔✈️',       answer: 'greys anatomy',          aliases: ["grey's anatomy", 'greys anatomy'] }, // Hospital, doctors, heartbreak, the infamous plane crash
  { genre: 'tv', emojis: '👨‍⚕️🦯💊🏍️',       answer: 'house',                  aliases: ['house', 'house md'] }, // Doctor, the cane, Vicodin pills, his motorcycle
  { genre: 'tv', emojis: '👔💼📚🥫',       answer: 'suits',                  aliases: ['suits'] }, // Suits, briefcase, Mike's law books, Harvey & Donna's can opener
  { genre: 'tv', emojis: '🕵️‍♂️🎻🧣🇬🇧',       answer: 'sherlock',               aliases: ['sherlock', 'sherlock holmes'] }, // Detective, playing violin, his scarf, London
  { genre: 'tv', emojis: '🩸🔪🛥️🍩',       answer: 'dexter',                 aliases: ['dexter'] }, // Blood slides, knife, his boat "Slice of Life", bringing donuts to Miami Metro
  { genre: 'tv', emojis: '🧟‍♂️🤠🏏⚾',       answer: 'the walking dead',       aliases: ['walking dead', 'the walking dead', 'twd'] }, // Zombies, Rick's hat, Negan's baseball bat (Lucille)
  { genre: 'tv', emojis: '⛓️🏗️🦢🗺️',       answer: 'prison break',           aliases: ['prison break'] }, // Chains, jail bars, Michael's origami swan, the blueprint tattoos
  { genre: 'tv', emojis: '🧢🪒🚬🐎',       answer: 'peaky blinders',         aliases: ['peaky blinders'] }, // Flat cap, hidden razor blades, smoking, Thomas Shelby's horses
  { genre: 'tv', emojis: '🧛‍♂️🩸📓🐦‍⬛',       answer: 'the vampire diaries',    aliases: ['vampire diaries', 'the vampire diaries', 'tvd'] }, // Vampires, blood, Elena's diary, Damon's crow
  { genre: 'tv', emojis: '🏚️👻🍵🚪',       answer: 'the haunting of hill house', aliases: ['haunting of hill house', 'hill house'] }, // Old house, ghosts, the "Cup of Stars", the Red Room door
  { genre: 'tv', emojis: '✨💄💊🚲',       answer: 'euphoria',               aliases: ['euphoria'] }, // Glitter makeup, pills, Fez's bicycle
  { genre: 'tv', emojis: '🐻👨‍🍳🥫🔪',       answer: 'the bear',               aliases: ['the bear'] }, // The Original Beef (Bear), Chef, the tomato cans with money, chopping knives
  { genre: 'tv', emojis: '🛶🪓🛡️🩸',       answer: 'vikings',                aliases: ['vikings'] }, // Longboats, axes, shield walls, blood
  
  // -- International Hits --
  { genre: 'tv', emojis: '🦑🟢🔴☂️',       answer: 'squid game',             aliases: ['squid game'] }, // Squid, Red Light Green Light, the Dalgona umbrella shape
  { genre: 'tv', emojis: '👺🔴🏦💸',       answer: 'money heist',            aliases: ['money heist', 'la casa de papel'] }, // The Dali mask, red jumpsuits, the Royal Mint/Bank, stealing cash
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