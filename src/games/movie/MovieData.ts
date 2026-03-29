// ============================================================
// MOVIE DATA - Guess the Movie Emoji Game
// ============================================================

export interface MovieEntry {
    emojis: string;
    answer: string;
    // For disambiguation: entries that need exact matching
    // e.g., "frozen" vs "frozen ii" would be strict matches
    strict?: boolean;
    // Alternative correct answers (aliases)
    aliases?: string[];
}

// The main database - expanded with movies, anime, TV shows
export const MOVIE_DATABASE: MovieEntry[] = [
    // ============================================================
    // BLOCKBUSTER MOVIES
    // ============================================================
    { emojis: '🦁👑', answer: 'the lion king', aliases: ['lion king'] },
    { emojis: '🚢🧊💔', answer: 'titanic', aliases: ['titanic'] },
    { emojis: '🦇👨🏙️', answer: 'batman', aliases: ['the dark knight', 'batman begins'] },
    { emojis: '🦖🚗🏃', answer: 'jurassic park', aliases: ['jurassic world', 'jurassic park'] },
    { emojis: '🕷️👨🕸️', answer: 'spider-man', aliases: ['spiderman', 'spider man', 'homecoming', 'far from home'] },
    { emojis: '🐼🥋🍜', answer: 'kung fu panda', aliases: ['kung fu panda'] },
    { emojis: '👦⚡👓', answer: 'harry potter', aliases: ['harry potter', 'philosopher stone', 'sorcerer stone'] },
    { emojis: '🐠🔍🌊', answer: 'finding nemo', aliases: ['nemo', 'finding nemo'] },
    { emojis: '🏰❄️⛄', answer: 'frozen', aliases: ['frozen'] },
    { emojis: '❄️👸', answer: 'frozen ii', aliases: ['frozen 2', 'frozen two', 'frozen ii'], strict: true },
    { emojis: '👹🟢🧅', answer: 'shrek', aliases: ['shrek'] },
    { emojis: '🏴‍☠️🚢⚔️', answer: 'pirates of the caribbean', aliases: ['pirates of the caribbean', 'pirates'] },
    { emojis: '💊🐇🕶️', answer: 'the matrix', aliases: ['matrix', 'the matrix'] },
    { emojis: '👴🎈🏠', answer: 'up', aliases: ['up'] },
    { emojis: '🦍🏙️🚁', answer: 'king kong', aliases: ['king kong'] },
    { emojis: '🚀⭐⚔️', answer: 'star wars', aliases: ['star wars', 'a new hope', 'empire strikes back', 'return of the jedi'] },
    { emojis: '🧞‍♂️🐒🪔', answer: 'aladdin', aliases: ['aladdin'] },
    { emojis: '🚗⚡🏆', answer: 'cars', aliases: ['cars'] },
    { emojis: '🧸🤠🚀', answer: 'toy story', aliases: ['toy story', 'toy story 2', 'toy story 3', 'toy story 4'] },
    { emojis: '🦈🏖️🩸', answer: 'jaws', aliases: ['jaws'] },
    { emojis: '👻🚫🔫', answer: 'ghostbusters', aliases: ['ghostbusters', 'ghost busters'] },
    { emojis: '🍫🏭🎫', answer: 'charlie and the chocolate factory', aliases: ['chocolate factory', 'charlie and the chocolate factory'] },
    { emojis: '🐭👨‍🍳🍲', answer: 'ratatouille', aliases: ['ratatouille'] },
    { emojis: '💇‍♀️🏰🦎', answer: 'tangled', aliases: ['tangled'] },
    { emojis: '👧🐉🏮', answer: 'spirited away', aliases: ['spirited away'] },
    { emojis: '🌍🐒🗽', answer: 'planet of the apes', aliases: ['planet of the apes', 'conquest of the planet'] },
    { emojis: '👨‍🚀👩‍🚀🌌', answer: 'interstellar', aliases: ['interstellar'] },
    { emojis: '🥊🥩🏃', answer: 'rocky', aliases: ['rocky', 'rocky balboa'] },
    { emojis: '🧝‍♂️🏹🛡️', answer: 'the hobbit', aliases: ['the hobbit', 'an unexpected journey', 'desolation of smaug', 'battle of five armies'] },
    { emojis: '💃🕺🎶', answer: 'la la land', aliases: ['la la land'] },
    { emojis: '👨‍💼💼👽', answer: 'men in black', aliases: ['men in black', 'mib', 'mib'] },
    { emojis: '🪓🚪🏨', answer: 'the shining', aliases: ['the shining', 'shining'] },
    { emojis: '🐶🍝💏', answer: 'lady and the tramp', aliases: ['lady and the tramp'] },
    { emojis: '👠🎃🕛', answer: 'cinderella', aliases: ['cinderella'] },
    { emojis: '🤡🎈☔', answer: 'it', aliases: ['it', 'pennywise'] },
    { emojis: '👨‍🔬🚗⏳', answer: 'back to the future', aliases: ['back to the future', 'back to the future 2', 'back to the future 3'] },
    { emojis: '🏹👧🔥', answer: 'the hunger games', aliases: ['hunger games', 'the hunger games', 'catching fire', 'mockingjay'] },
    { emojis: '🕶️🏍️🤖', answer: 'the terminator', aliases: ['terminator', 'the terminator', 'terminator 2'] },
    { emojis: '🎩🐇🫖', answer: 'alice in wonderland', aliases: ['alice in wonderland', 'alice'] },
    { emojis: '🧜‍♀️🦀🐠', answer: 'the little mermaid', aliases: ['little mermaid', 'the little mermaid'] },
    { emojis: '🎤🎶🎭', answer: 'the greatest showman', aliases: ['greatest showman', 'the greatest showman'] },
    { emojis: '🦁🐅🐻', answer: 'the wizard of oz', aliases: ['wizard of oz', 'the wizard of oz'] },

    // ============================================================
    // DISNEY / PIXAR
    // ============================================================
    { emojis: '🔱👨‍👩‍👧‍👦', answer: 'hercules', aliases: ['hercules'] },
    { emojis: '🐘🤴', answer: 'dumbo', aliases: ['dumbo'] },
    { emojis: '🦁🌍', answer: 'lion king 2', aliases: ['lion king 2', 'simba', 'lion king 2 simba'], strict: true },
    { emojis: '🐰🥕🌿', answer: 'zootopia', aliases: ['zootopia'] },
    { emojis: '🎃👻👻', answer: 'monsters inc', aliases: ['monsters inc', 'monsters university'] },
    { emojis: '🐠🌊🌊', answer: 'finding dory', aliases: ['finding dory', 'dory'], strict: true },
    { emojis: '🦋🌸', answer: 'coco', aliases: ['coco'] },
    { emojis: '⚔️🏰👸', answer: 'brave', aliases: ['brave'] },
    { emojis: '🤖💔', answer: 'wall-e', aliases: ['wall e', 'walle', 'wall-e'] },
    { emojis: '👶🌟', answer: 'bambi', aliases: ['bambi'] },
    { emojis: '🐻🍯', answer: 'winnie the pooh', aliases: ['winnie the pooh', 'pooh'] },
    { emojis: '🎭👑', answer: 'the aristocats', aliases: ['aristocats', 'the aristocats'] },
    { emojis: '🐔🏠', answer: 'chicken little', aliases: ['chicken little'] },
    { emojis: '🐻‍❄️🏔️', answer: 'frozen', aliases: ['frozen'], strict: true }, // for disambiguation
    { emojis: '🌟✨💫', answer: 'stardust', aliases: ['stardust'] },
    { emojis: '🎃👻🎃', answer: 'hotel transylvania', aliases: ['hotel transylvania'] },
    { emojis: '👽👾🌍', answer: 'space jam', aliases: ['space jam', 'space jam 2'] },
    { emojis: '🐕🦴🏠', answer: 'the secret life of pets', aliases: ['secret life of pets', 'the secret life of pets'] },
    { emojis: '🎠🏰🌙', answer: 'the little mermaid', aliases: ['little mermaid', 'the little mermaid'], strict: true },
    { emojis: '🦁🐒', answer: 'the lion king', aliases: ['lion king', 'the lion king'], strict: true },
    { emojis: '🏰⚔️🦸', answer: 'prince of persia', aliases: ['prince of persia', 'prince persia'] },

    // ============================================================
    // MARVEL / DC
    // ============================================================
    { emojis: '🕷️🕸️🏙️', answer: 'spider-man homecoming', aliases: ['spider-man homecoming', 'spiderman homecoming', 'homecoming'], strict: true },
    { emojis: '🏍️⚡🔱', answer: 'thor', aliases: ['thor', 'thor ragnarok', 'thor dark world'] },
    { emojis: '🇮🇩🔱💪', answer: 'hulk', aliases: ['hulk', 'the hulk', 'incredible hulk'] },
    { emojis: '🛡️⭐', answer: 'captain america', aliases: ['captain america', 'captain america winter soldier', 'civil war'] },
    { emojis: '🟠🔫💥', answer: 'deadpool', aliases: ['deadpool'] },
    { emojis: '🟣🤖🦾', answer: 'iron man', aliases: ['iron man', 'ironman'] },
    { emojis: '👁️‍🗨️☠️', answer: 'venom', aliases: ['venom'] },
    { emojis: '🌌👽🦸', answer: 'guardians of the galaxy', aliases: ['guardians of the galaxy', 'guardians'] },
    { emojis: '⚔️🏹💚', answer: 'black widow', aliases: ['black widow'], strict: true },
    { emojis: '🔮👁️', answer: 'doctor strange', aliases: ['doctor strange', 'dr strange'] },
    { emojis: '🦇🌃', answer: 'batman returns', aliases: ['batman returns', 'batman'], strict: true },
    { emojis: '🃏👨‍🦱', answer: 'the joker', aliases: ['joker', 'the joker', 'joker 2019'] },
    { emojis: '⚡⬇️', answer: 'superman', aliases: ['superman', 'man of steel'] },
    { emojis: '🌊🔱', answer: 'aquaman', aliases: ['aquaman'] },
    { emojis: '🦇🏙️💀', answer: 'the dark knight', aliases: ['dark knight', 'the dark knight', 'the dark knight rises'], strict: true },
    { emojis: '💍⚡', answer: 'wonder woman', aliases: ['wonder woman'] },

    // ============================================================
    // ANIME
    // ============================================================
    { emojis: '👊🔥💥', answer: 'naruto', aliases: ['naruto', 'naruto shippuden', 'boruto'] },
    { emojis: '🍥👋', answer: 'one piece', aliases: ['one piece'] },
    { emojis: '⚡🍃', answer: 'bleach', aliases: ['bleach'] },
    { emojis: '👹💀🔥', answer: 'demon slayer', aliases: ['demon slayer', 'kimetsu no yaiba', 'tanjiro'] },
    { emojis: '⚔️🛡️🌸', answer: 'sword art online', aliases: ['sword art online', 'sao'] },
    { emojis: '🎮⚔️👾', answer: 'sao', aliases: ['sao', 'sword art online'], strict: true },
    { emojis: '🔍👧', answer: 'death note', aliases: ['death note'] },
    { emojis: '🧪⚗️🔬', answer: 'fullmetal alchemist', aliases: ['fullmetal alchemist', 'fma', 'brotherhood'] },
    { emojis: '🥊⚡💪', answer: 'dragon ball z', aliases: ['dragon ball z', 'dbz', 'dragon ball', 'dragon ball super', 'dragon ball gt'] },
    { emojis: '🐉⚔️', answer: 'attack on titan', aliases: ['attack on titan', 'shingeki no kyojin', 'aot'] },
    { emojis: '🧙‍♂️🔮', answer: 'magical girl', aliases: ['magical girl', 'madoka', 'sailor moon'], strict: true },
    { emojis: '🤖⚔️🌸', answer: 'gundam', aliases: ['gundam'] },
    { emojis: '👻🔍', answer: 'ghost in the shell', aliases: ['ghost in the shell', 'git s', '攻壳机动队'] },
    { emojis: '🌸👁️', answer: 'tokyo ghoul', aliases: ['tokyo ghoul', 'tokyo ghoul re'] },
    { emojis: '⚔️🎭', answer: 'fate stay night', aliases: ['fate stay night', 'fate', 'fate zero'] },
    { emojis: '🌸⭐', answer: 'neon genesis evangelion', aliases: ['evangelion', 'neon genesis', 'eva'] },
    { emojis: '🐱👧', answer: 'sailor moon', aliases: ['sailor moon', 'sailor moon crystal'] },
    { emojis: '⚡🌸', answer: 'my hero academia', aliases: ['my hero academia', 'mha', 'bnha'] },
    { emojis: '🎭🕷️', answer: 'tokyo revengers', aliases: ['tokyo revengers'] },
    { emojis: '🔥👊', answer: 'fire force', aliases: ['fire force', 'enen no shouboutai'] },
    { emojis: '📚👻', answer: 'the promised neverland', aliases: ['promised neverland', 'the promised neverland'] },
    { emojis: '🦊🔥', answer: 'mob psycho', aliases: ['mob psycho', 'mob psycho 100'] },
    { emojis: '👁️‍🗨️🔮', answer: 'pokemon', aliases: ['pokemon', 'pokémon', 'pikachu'] },
    { emojis: '🔴⚽', answer: 'inazuma eleven', aliases: ['inazuma eleven'] },
    { emojis: '🐹🍰', answer: 'hamtaro', aliases: ['hamtaro', 'hamster'], strict: true },
    { emojis: '🎭🗼', answer: 're zero', aliases: ['re zero', 'rezero', 're:zero'] },
    { emojis: '🌸⚔️', answer: 'that time i got reincarnated as a slime', aliases: ['slime', 'tensei shitara', 'that time i got reincarnated as a slime', 'tenSura'] },
    { emojis: '👦🧬', answer: 'one punch man', aliases: ['one punch man', 'opm'] },
    { emojis: '🕵️‍♂️🐛', answer: 'jojo bizarre adventure', aliases: ['jojo', 'jojo bizarre adventure', "jojo's bizarre adventure"] },

    // ============================================================
    // TV SHOWS
    // ============================================================
    { emojis: '🏠👨‍👩‍👧‍👦❄️', answer: 'game of thrones', aliases: ['game of thrones', 'got', 'a song of ice and fire'] },
    { emojis: '💀🗡️👑', answer: 'the last kingdom', aliases: ['last kingdom', 'the last kingdom'] },
    { emojis: '🔍🕵️‍♂️', answer: 'sherlock', aliases: ['sherlock', 'sherlock holmes'] },
    { emojis: '💊🧠', answer: 'breaking bad', aliases: ['breaking bad'] },
    { emojis: '🧔⚔️🐺', answer: 'vikings', aliases: ['vikings'] },
    { emojis: '🧛‍♂️🩸🏰', answer: 'the vampire diaries', aliases: ['vampire diaries', 'the vampire diaries', 'tvd'] },
    { emojis: '🚀👽📺', answer: 'stranger things', aliases: ['stranger things'] },
    { emojis: '🦌📺', answer: 'the walking dead', aliases: ['walking dead', 'the walking dead'], strict: true },
    { emojis: '🕵️‍♂️🔍', answer: 'true detective', aliases: ['true detective'] },
    { emojis: '🏥💉🩺', answer: 'greys anatomy', aliases: ['grey anatomy', 'greys anatomy', "grey's anatomy"] },
    { emojis: '👮‍♂️🚓💨', answer: 'brooklyn nine-nine', aliases: ['brooklyn nine nine', 'brooklyn 99', 'b99'] },
    { emojis: '🧑‍⚖️⚖️', answer: 'suits', aliases: ['suits'] },
    { emojis: '🏠💰💎', answer: 'the office', aliases: ['the office', 'office'] },
    { emojis: '🍺🍻🏠', answer: 'how i met your mother', aliases: ['how i met your mother', 'himym'] },
    { emojis: '👫👫👫', answer: 'friends', aliases: ['friends'] },
    { emojis: '🧛‍♂️🧟‍♀️', answer: 'the twilight zone', aliases: ['twilight zone', 'the twilight zone'] },
    { emojis: '🔮👙', answer: 'american horror story', aliases: ['american horror story', 'ahs'] },
    { emojis: '🏴‍☠️☠️', answer: 'black sails', aliases: ['black sails'] },
    { emojis: '🗡️🔥', answer: 'the witcher', aliases: ['witcher', 'the witcher', 'wiedźmin'] },
    { emojis: '🤖👨‍👩‍👧', answer: 'westworld', aliases: ['westworld'] },
    { emojis: '🧬🔬👽', answer: 'the x files', aliases: ['x files', 'the x files', 'x-files'] },
    { emojis: '🌍⏰', answer: 'lost', aliases: ['lost'] },
    { emojis: '⏳🏠👻', answer: 'dark', aliases: ['dark', 'dark netflix'] },
    { emojis: '🏚️💀', answer: 'the haunting of hill house', aliases: ['haunting of hill house', 'hill house'] },
    { emojis: '🔪🏠👪', answer: 'american horror story', aliases: ['american horror story', 'ahs'], strict: true },
    { emojis: '🧑‍🚒🔥', answer: 'chicago fire', aliases: ['chicago fire', 'chicago pd', 'chicago med'] },
    { emojis: '👨‍⚕️🩺', answer: 'house', aliases: ['house', 'house md', 'dr house'] },
    { emojis: '🕵️‍♂️🔎', answer: 'money heist', aliases: ['money heist', 'la casa de papel', '纸钞屋'] },
    { emojis: '🦈📺', answer: 'better call saul', aliases: ['better call saul', 'breaking bad'], strict: true },
    { emojis: '🧔☕', answer: 'peaky blinders', aliases: ['peaky blinders'] },
    { emojis: '🌍🔫', answer: 'the crown', aliases: ['the crown', 'crown'], strict: true },
    { emojis: '👑🏰', answer: 'the crown', aliases: ['the crown', 'crown'], strict: true },

    // ============================================================
    // MORE MOVIES - EXPANDED
    // ============================================================
    { emojis: '🧙‍♂️⚡🧹', answer: 'harry potter and the sorcerers stone', aliases: ['harry potter sorcerer stone', 'harry potter 1', 'philosopher stone'], strict: true },
    { emojis: '🧙‍♂️🏆⚡', answer: 'harry potter and the chamber of secrets', aliases: ['chamber of secrets', 'harry potter 2'], strict: true },
    { emojis: '🧙‍♂️🦌⚡', answer: 'harry potter and the prisoner of azkaban', aliases: ['prisoner of azkaban', 'harry potter 3'], strict: true },
    { emojis: '🧙‍♂️🏆🔥', answer: 'harry potter and the goblet of fire', aliases: ['goblet of fire', 'harry potter 4'], strict: true },
    { emojis: '🧙‍♂️⚔️🌑', answer: 'harry potter and the order of the phoenix', aliases: ['order of the phoenix', 'harry potter 5'], strict: true },
    { emojis: '🧙‍♂️💀⚡', answer: 'harry potter and the half blood prince', aliases: ['half blood prince', 'harry potter 6'], strict: true },
    { emojis: '🧙‍♂️💀🏹', answer: 'harry potter and the deathly hallows', aliases: ['deathly hallows', 'harry potter 7', 'deathly hallows part 1', 'deathly hallows part 2'], strict: true },
    { emojis: '⚡🏃‍♂️🌪️', answer: 'speed', aliases: ['speed'], strict: true },
    { emojis: '🦁🌅', answer: 'the lion sleeps tonight', aliases: ['lion sleeps tonight', 'the lion sleeps tonight'] },
    { emojis: '🎭🌟', answer: 'the star', aliases: ['the star', 'star 2017'], strict: true },
    { emojis: '🎄⭐🌟', answer: 'the polar express', aliases: ['polar express', 'the polar express'] },
    { emojis: '🧝‍♂️🌳', answer: 'the legend of zelda', aliases: ['legend of zelda', 'zelda'], strict: true },
    { emojis: '🎭🤖', answer: 'big hero 6', aliases: ['big hero 6', 'bighero6'] },
    { emojis: '🐉🗡️', answer: 'how to train your dragon', aliases: ['how to train your dragon', 'train your dragon'] },
    { emojis: '🧜‍♂️🌊', answer: 'atlantis the lost empire', aliases: ['atlantis', 'atlantis the lost empire'] },
    { emojis: '🌴🏝️💎', answer: 'national treasure', aliases: ['national treasure'] },
    { emojis: '⛏️💎🇮🇸', answer: 'journey to the center of the earth', aliases: ['journey to the center of the earth', 'journey center earth'] },
    { emojis: '🌋🦖🌴', answer: 'ice age', aliases: ['ice age', 'ice age collision course', 'ice age continental drift'] },
    { emojis: '🦇🏠', answer: 'batman begins', aliases: ['batman begins', 'batman'], strict: true },
    { emojis: '🦇⚔️', answer: 'batman v superman', aliases: ['batman v superman', 'batman versus superman', 'dawn of justice'], strict: true },
    { emojis: '🃏🕷️', answer: 'spider-man into the spider verse', aliases: ['spider verse', 'spider-man into the spider-verse', 'spiderverse'], strict: true },
    { emojis: '🕷️🕸️', answer: 'spider-man across the spider verse', aliases: ['across the spider verse', 'spider-man across the spider-verse'], strict: true },
    { emojis: '⚡🦸', answer: 'shazam', aliases: ['shazam', 'shazam 2019'] },
    { emojis: '👽🚀', answer: 'the fifth element', aliases: ['fifth element', 'the fifth element'] },
    { emojis: '🌌👨‍🚀', answer: 'gravity', aliases: ['gravity', 'gravity 2013'] },
    { emojis: '📡🌕', answer: 'moon', aliases: ['moon', 'moon 2009'], strict: true },
    { emojis: '🦍🏙️', answer: 'kong godzilla', aliases: ['kong godzilla', 'godzilla vs kong'], strict: true },
    { emojis: '🐉🦖', answer: 'godzilla vs kong', aliases: ['godzilla vs kong', 'godzilla versus kong'], strict: true },
    { emojis: '🦖🌋', answer: 'godzilla king of the monsters', aliases: ['godzilla king of the monsters', 'king of the monsters'], strict: true },
    { emojis: '⚔️🛡️', answer: 'clash of the titans', aliases: ['clash of the titans', 'clash titans'] },
    { emojis: '👽🌌', answer: 'independence day', aliases: ['independence day', 'id4'] },
    { emojis: '🛸🌍', answer: 'battle los angeles', aliases: ['battle los angeles', 'battle la'], strict: true },
    { emojis: '🔥👨‍🚒', answer: 'backdraft', aliases: ['backdraft'], strict: true },
    { emojis: '⚔️🏰', answer: 'kingdom of heaven', aliases: ['kingdom of heaven', 'koh'] },
    { emojis: '🏰⚔️', answer: 'lord of the rings', aliases: ['lord of the rings', 'lords of the ring', 'lotr', 'the lord of the rings', 'fellowship of the ring', 'two towers', 'return of the king'] },
    { emojis: '🦅⚔️', answer: 'the eagle', aliases: ['the eagle', 'eagle'], strict: true },
    { emojis: '⚔️🏹', answer: 'robin hood', aliases: ['robin hood', 'robinhood'] },
    { emojis: '🏹🥊', answer: 'the archer', aliases: ['the archer', 'archer'], strict: true },
    { emojis: '🎯🏹', answer: 'the arrow', aliases: ['the arrow', 'arrow'], strict: true },
    { emojis: '🗺️⚔️', answer: 'the chronicles of narnia', aliases: ['chronicles of narnia', 'narnia', 'the chronicles of narnia', 'prince caspian', 'voyage of the dawn treader'] },
    { emojis: '🧙‍♂️🛡️', answer: 'dungeons and dragons', aliases: ['dungeons and dragons', 'd&d', 'dnd'] },
    { emojis: '🐉💎', answer: 'the hobbit an unexpected journey', aliases: ['an unexpected journey', 'the hobbit an unexpected journey'], strict: true },
    { emojis: '🏹🐉', answer: 'the hobbit the desolation of smaug', aliases: ['desolation of smaug', 'the hobbit the desolation of smaug'], strict: true },
    { emojis: '🐉🔥', answer: 'the hobbit the battle of the five armies', aliases: ['battle of the five armies', 'the hobbit battle of the five armies'], strict: true },
    { emojis: '💀🦈', answer: 'deep blue sea', aliases: ['deep blue sea'], strict: true },
    { emojis: '🌙🐺🩸', answer: 'an american werewolf in london', aliases: ['american werewolf in london', 'werewolf in london', 'an american werewolf in london'] },
    { emojis: '🗿😱', answer: 'annihilation', aliases: ['annihilation'], strict: true },
    { emojis: '🔪🩸🎭', answer: 'se7en', aliases: ['se7en', 'seven 1995'], strict: true },
    { emojis: '🧠💀', answer: 'flatliners', aliases: ['flatliners'], strict: true },
    { emojis: '🕯️👹', answer: 'candyman', aliases: ['candyman', 'candy man'] },
    { emojis: '📼🧑‍🎤', answer: 'the ring', aliases: ['the ring', 'ring', 'ring 2002', 'ringu'], strict: true },
    { emojis: '👶💀', answer: 'the bad seed', aliases: ['the bad seed', 'bad seed'], strict: true },
    { emojis: '🏠👨‍👩‍👧‍👦', answer: 'the others', aliases: ['the others', 'others'], strict: true },
    { emojis: '🩸🛏️', answer: 'carrie', aliases: ['carrie', 'carrie 2013'], strict: true },
    { emojis: '🌑🧟', answer: 'zombieland', aliases: ['zombieland', 'zombieland double tap'] },

    // ============================================================
    // ACTION / ADVENTURE
    // ============================================================
    { emojis: '💥🏍️💨', answer: 'mad max fury road', aliases: ['mad max', 'mad max fury road', 'fury road'] },
    { emojis: '🕵️‍♂️💣', answer: 'mission impossible', aliases: ['mission impossible', 'mission impossible fallout', 'mi'] },
    { emojis: '🕶️🔫🇮🇹', answer: 'john wick', aliases: ['john wick', 'john wick 2', 'john wick 3', 'john wick 4'] },
    { emojis: '🎯💣🇷🇺', answer: 'red notice', aliases: ['red notice'], strict: true },
    { emojis: '🦸‍♂️⚡🌍', answer: 'the avengers', aliases: ['avengers', 'the avengers', 'avengers endgame', 'avengers infinity war', 'avengers age of ultron'] },
    { emojis: '⚔️🏰🇫🇷', answer: 'the man from nowhere', aliases: ['the man from nowhere', 'man from nowhere'], strict: true },
    { emojis: '🪂🔫🌴', answer: 'extraction', aliases: ['extraction', 'extraction 2020'], strict: true },
    { emojis: '🦊🏎️', answer: 'the fast and the furious', aliases: ['fast and furious', 'fast furious', 'the fast and the furious', 'f9', 'furious 7', 'furious 8'] },
    { emojis: '🧗🏔️❄️', answer: 'vertical limit', aliases: ['vertical limit'], strict: true },
    { emojis: '🌋🌊⚔️', answer: '2012', aliases: ['2012', '2012 movie'], strict: true },
    { emojis: '🛩️💥🌍', answer: 'air force one', aliases: ['air force one'], strict: true },
    { emojis: '🗡️⚔️🏰', answer: 'gladiator', aliases: ['gladiator', 'gladiator 2020'] },
    { emojis: '🚁💥🏙️', answer: 'the dark knight', aliases: ['dark knight', 'the dark knight'], strict: true },
    { emojis: '🤖⚔️🔫', answer: 'transformers', aliases: ['transformers', 'transformers 1', 'transformers 2', 'transformers 3', 'transformers 4', 'transformers 5', 'bumblebee'] },
    { emojis: '🕶️🇲🇽', answer: 'sicario', aliases: ['sicario', 'sicario 2'] },
    { emojis: '🎯🐍', answer: 'snake eyes', aliases: ['snake eyes', 'snakeeyes'], strict: true },
    { emojis: '🥷🇯🇵', answer: 'the last samurai', aliases: ['last samurai', 'the last samurai'] },
    { emojis: '💀⚔️', answer: 'kill bill', aliases: ['kill bill', 'kill bill volume 1', 'kill bill volume 2'] },
    { emojis: '🔥🚗💥', answer: 'mad max', aliases: ['mad max', 'mad max 2', 'mad max thunderdome'], strict: true },
    { emojis: '🕵️‍♂️🚗💨', answer: 'the equalizer', aliases: ['equalizer', 'the equalizer', 'equalizer 2'] },

    // ============================================================
    // SCI-FI
    // ============================================================
    { emojis: '🌌🚀👽', answer: 'star trek', aliases: ['star trek', 'star trek 2009', 'star trek into darkness', 'star trek beyond'] },
    { emojis: '🦊🤖', answer: 'renegades', aliases: ['renegades', 'renegades 2017'], strict: true },
    { emojis: '🌍🤖💙', answer: 'ex machina', aliases: ['ex machina'] },
    { emojis: '⏰🕳️', answer: 'primer', aliases: ['primer'], strict: true },
    { emojis: '🦊🌍', answer: 'avatar', aliases: ['avatar', 'avatar 2009', 'avatar the way of water', 'avatar 2'] },
    { emojis: '👨‍🚀🌕👽', answer: 'apollo 13', aliases: ['apollo 13'], strict: true },
    { emojis: '📡👽🛸', answer: 'close encounters', aliases: ['close encounters', 'close encounters of the third kind'] },
    { emojis: '🌊🚀', answer: 'the martian', aliases: ['the martian', 'martian'] },
    { emojis: '🧬🔬🛸', answer: 'jurassic world', aliases: ['jurassic world', 'jurassic world fallen kingdom', 'jurassic world dominion'], strict: true },
    { emojis: '🕳️🌌', answer: 'donnie darko', aliases: ['donnie darko'], strict: true },
    { emojis: '👽💀', answer: 'signs', aliases: ['signs', 'signs 2002'], strict: true },
    { emojis: '📺🌍', answer: 'surface', aliases: ['surface', 'surface 2023'], strict: true },
    { emojis: '🦊🛸', answer: 'futurama', aliases: ['futurama'], strict: true },
    { emojis: '🤖💬', answer: 'her', aliases: ['her', 'her 2013'], strict: true },
    { emojis: '👁️‍🗨️🤖', answer: 'i robot', aliases: ['i robot', 'i, robot'], strict: true },
    { emojis: '⚫🕳️', answer: 'event horizon', aliases: ['event horizon'], strict: true },
    { emojis: '🌌🏴‍☠️', answer: 'treasure planet', aliases: ['treasure planet'], strict: true },
    { emojis: '🧬💀', answer: 'the fly', aliases: ['the fly', 'fly', 'the fly 1986'], strict: true },
    { emojis: '🔮⏳', answer: 'tenet', aliases: ['tenet'] },
    { emojis: '🦍🚀', answer: 'kong skull island', aliases: ['kong skull island', 'skull island'], strict: true },

    // ============================================================
    // ROMANCE / DRAMA
    // ============================================================
    { emojis: '💑🌹🎬', answer: 'the notebook', aliases: ['the notebook', 'notebook'] },
    { emojis: '💔🏖️💔', answer: 'a walk to remember', aliases: ['a walk to remember', 'walk to remember'] },
    { emojis: '💍👰🤵', answer: 'pretty woman', aliases: ['pretty woman'] },
    { emojis: '🍕👫', answer: 'when harry met sally', aliases: ['when harry met sally', 'when harry met sally 1989'] },
    { emojis: '🎭💕', answer: 'la la land', aliases: ['la la land'], strict: true },
    { emojis: '🌧️☂️💑', answer: 'the fault in our stars', aliases: ['fault in our stars', 'the fault in our stars'] },
    { emojis: '🎄💑', answer: 'love actually', aliases: ['love actually'] },
    { emojis: '💌💝', answer: 'to all the boys i loved before', aliases: ['to all the boys i loved before', 'tatlbp'] },
    { emojis: '🦋🌸', answer: 'your name', aliases: ['your name', 'kimi no na wa', 'kiminona'] },
    { emojis: '🍜💕', answer: 'crouching tiger hidden dragon', aliases: ['crouching tiger', 'crouching tiger hidden dragon', 'crouching tiger hidden dragon 2000'] },
    { emojis: '🎭💔', answer: 'ghost', aliases: ['ghost', 'ghost 1990'] },
    { emojis: '🥀💔', answer: 'me before you', aliases: ['me before you'], strict: true },
    { emojis: '⏳💔', answer: 'the time travelers wife', aliases: ['time travelers wife', 'the time travelers wife'] },
    { emojis: '🌹👑', answer: 'the princess bride', aliases: ['princess bride', 'the princess bride'] },
    { emojis: '🦢💔', answer: 'the swan princess', aliases: ['swan princess', 'the swan princess'] },
    { emojis: '🏜️💔', answer: 'out of africa', aliases: ['out of africa'], strict: true },
    { emojis: '🍷💕', answer: 'under the tuscan sun', aliases: ['under the tuscan sun', 'tuscan sun'] },

    // ============================================================
    // COMEDY
    // ============================================================
    { emojis: '👻🔫', answer: 'ghostbusters', aliases: ['ghostbusters', 'ghost busters'], strict: true },
    { emojis: '🦆🍔', answer: 'back to the future', aliases: ['back to the future'], strict: true },
    { emojis: '🧔💪😂', answer: 'the hangover', aliases: ['the hangover', 'hangover', 'hangover 2', 'hangover 3'] },
    { emojis: '🎬😱', answer: 'scary movie', aliases: ['scary movie', 'scary movie 2', 'scary movie 3', 'scary movie 4', 'scary movie 5'] },
    { emojis: '👽🕶️', answer: 'men in black', aliases: ['men in black', 'mib'], strict: true },
    { emojis: '🦸‍♂️😅', answer: 'thor', aliases: ['thor', 'thor ragnarok', 'thor love and thunder'], strict: true },
    { emojis: '😎🐔', answer: 'chicken run', aliases: ['chicken run'], strict: true },
    { emojis: '🏠👨‍👩‍👧', answer: 'meet the parents', aliases: ['meet the parents', 'meet the fockers'] },
    { emojis: '🎄👪', answer: 'national lampoons christmas vacation', aliases: ['national lampoons christmas vacation', 'christmas vacation', 'vacation'] },
    { emojis: '🧔🔫', answer: 'the duff', aliases: ['duff', 'the duff'], strict: true },
    { emojis: '👴🤶', answer: 'bad santa', aliases: ['bad santa'], strict: true },
    { emojis: '🏃‍♂️💨', answer: 'due date', aliases: ['due date'], strict: true },
    { emojis: '🛀👶', answer: 'the pacifier', aliases: ['the pacifier', 'pacifier'], strict: true },
    { emojis: '💰🏦', answer: 'the big lebowski', aliases: ['the big lebowski', 'big lebowski', 'big lebowski 1998'] },
    { emojis: '🍿🎭', answer: 'anchorman', aliases: ['anchorman', 'anchorman 2', 'anchorman 2 the legend continues'] },
    { emojis: '😱🎄', answer: 'home alone', aliases: ['home alone', 'home alone 2', 'home alone 3', 'home alone 4'] },
    { emojis: '🎅🎁', answer: 'elf', aliases: ['elf', 'elf 2003'] },

    // ============================================================
    // MORE MOVIES - ADDITIONAL BLOCKBUSTERS
    // ============================================================
    { emojis: '🦁🌍👑', answer: 'the lion king 2019', aliases: ['lion king 2019', 'lion king remake'], strict: true },
    { emojis: '🧛🌍', answer: 'twilight', aliases: ['twilight', 'twilight saga', 'new moon', 'eclipse', 'breaking dawn'] },
    { emojis: '🧙⚔️🌍', answer: 'the lord of the rings', aliases: ['lord of the rings', 'lotr', 'fellowship', 'two towers', 'return of the king'], strict: true },
    { emojis: '🐢🦈', answer: ' finding dory', aliases: ['finding dory', 'dory'], strict: true },
    { emojis: '🌟🦸‍♂️', answer: 'black panther', aliases: ['black panther', 'black panther wakanda forever'] },
    { emojis: '👻👻👻', answer: 'three ghosts', aliases: ['three ghosts', 'ghostship'], strict: true },
    { emojis: '🦊🐻', answer: 'zootopia', aliases: ['zootopia'], strict: true },
    { emojis: '🎮⏰🦘', answer: 'back to the future', aliases: ['back to the future'], strict: true },
    { emojis: '🌴🏄‍♀️🦈', answer: 'jaws', aliases: ['jaws'], strict: true },
    { emojis: '👗👠', answer: 'mean girls', aliases: ['mean girls'] },
    { emojis: '🏠👨‍👩‍👧‍👦❓', answer: 'the home alone', aliases: ['home alone'], strict: true },
    { emojis: '🦸‍♂️🦇', answer: 'batman', aliases: ['batman', 'the dark knight'], strict: true },
    { emojis: '🕷️🦴', answer: 'spider-man', aliases: ['spiderman', 'spider-man'], strict: true },
    { emojis: '🐝👑', answer: 'the queen bee', aliases: ['queen bee', 'mean girls'], strict: true },
    { emojis: '🌊🚢❄️', answer: 'titanic', aliases: ['titanic'], strict: true },
    { emojis: '🔮🏰🧙', answer: 'harry potter', aliases: ['harry potter'], strict: true },
    { emojis: '🧙‍♂️🗡️🌟', answer: 'the sorcerers apprentice', aliases: ['sorcerer apprentice', 'fantasia'], strict: true },
    { emojis: '🏴‍☠️☠️💀', answer: 'pirates of the caribbean', aliases: ['pirates of the caribbean', 'pirates'], strict: true },
    { emojis: '🌋🦖🌴❄️', answer: 'jurassic world', aliases: ['jurassic world', 'jurassic world fallen kingdom'], strict: true },
    { emojis: '🤖👨‍🚒🌊', answer: 'robocop', aliases: ['robocop'], strict: true },

    // ============================================================
    // EVEN MORE MOVIES
    // ============================================================
    { emojis: '🦸‍♂️🌟⚡', answer: 'doctor strange', aliases: ['doctor strange', 'dr strange'], strict: true },
    { emojis: '🕷️💜', answer: 'venom', aliases: ['venom', 'venom let there be carnage'], strict: true },
    { emojis: '🛡️🔵', answer: 'captain marvel', aliases: ['captain marvel'] },
    { emojis: '🐜👨‍🦰', answer: 'ant-man', aliases: ['ant-man', 'antman', 'ant man'] },
    { emojis: '👽🛸🇺🇸', answer: 'signs', aliases: ['signs'], strict: true },
    { emojis: '🧟‍♂️🦴', answer: 'the walking dead', aliases: ['walking dead'], strict: true },
    { emojis: '👻🎮', answer: 'ghost recon', aliases: ['ghost recon'], strict: true },
    { emojis: '🚁👨‍🚀🌕', answer: 'apollo 13', aliases: ['apollo 13'], strict: true },
    { emojis: '🦈🌊🌪️', answer: 'deep blue sea', aliases: ['deep blue sea'], strict: true },
    { emojis: '🌙🐺🩸', answer: 'an american werewolf in london', aliases: ['american werewolf', 'werewolf'], strict: true },
    { emojis: '🕯️👹', answer: 'candyman', aliases: ['candyman'], strict: true },
    { emojis: '💀🎪', answer: 'it', aliases: ['it', 'pennywise'], strict: true },
    { emojis: '👁️‍🗨️💀', answer: 'the ring', aliases: ['the ring', 'ring', 'ringu'], strict: true },
    { emojis: '🔪🩸🏠', answer: 'se7en', aliases: ['se7en', 'seven'], strict: true },
    { emojis: '🧠💀', answer: 'flatliners', aliases: ['flatliners'], strict: true },
    { emojis: '⏰🕳️', answer: 'primer', aliases: ['primer'], strict: true },
    { emojis: '🌌🏴‍☠️', answer: 'treasure planet', aliases: ['treasure planet'], strict: true },
    { emojis: '⚫🕳️', answer: 'event horizon', aliases: ['event horizon'], strict: true },
    { emojis: '🌊🚀', answer: 'the martian', aliases: ['the martian', 'mars'], strict: true },
    { emojis: '🦊🌍', answer: 'avatar', aliases: ['avatar', 'avatar 2009', 'james cameron'], strict: true },

    // ============================================================
    // POPULAR TV SHOWS - ADDITIONAL
    // ============================================================
    { emojis: '👨‍👩‍👧‍👦🏠', answer: 'modern family', aliases: ['modern family'] },
    { emojis: '🧪🔬👽', answer: 'the x-files', aliases: ['x files', 'x-files', 'the x files'], strict: true },
    { emojis: '🏠💰👑', answer: 'the office', aliases: ['the office', 'office'], strict: true },
    { emojis: '👫👫👫🏠', answer: 'friends', aliases: ['friends', 'friends tv'], strict: true },
    { emojis: '🏥💉🩺', answer: 'greys anatomy', aliases: ['greys anatomy', 'grey anatomy'], strict: true },
    { emojis: '👮‍♂️🚓💨', answer: 'brooklyn nine-nine', aliases: ['brooklyn 99', 'b99'], strict: true },
    { emojis: '🏠👨‍👩‍👧‍👦❄️', answer: 'game of thrones', aliases: ['game of thrones', 'got'], strict: true },
    { emojis: '💊🧠', answer: 'breaking bad', aliases: ['breaking bad'], strict: true },
    { emojis: '🧔☕', answer: 'peaky blinders', aliases: ['peaky blinders'], strict: true },
    { emojis: '🗡️🔥', answer: 'the witcher', aliases: ['witcher', 'the witcher'], strict: true },
    { emojis: '🚀👽📺', answer: 'stranger things', aliases: ['stranger things'], strict: true },
    { emojis: '⏳🏠👻', answer: 'dark', aliases: ['dark', 'dark netflix'], strict: true },
    { emojis: '🏚️💀', answer: 'the haunting of hill house', aliases: ['haunting of hill house', 'hill house'], strict: true },
    { emojis: '🔍🕵️‍♂️', answer: 'sherlock', aliases: ['sherlock', 'sherlock holmes'], strict: true },

    // ============================================================
    // MORE ANIME
    // ============================================================
    { emojis: '🥊⚡💪🦍', answer: 'dragon ball super', aliases: ['dragon ball super', 'dbs', 'dragon ball z'], strict: true },
    { emojis: '🔥👊🔥', answer: 'fire force', aliases: ['fire force', 'enen no shouboutai'], strict: true },
    { emojis: '👦🔪🩸', answer: 'tokyo ghoul', aliases: ['tokyo ghoul', 'tokyo ghoul re'], strict: true },
    { emojis: '⚔️🌸🦋', answer: 'sword art online', aliases: ['sword art online', 'sao', 'alicization'], strict: true },
    { emojis: '🧙‍♂️🔮⚔️', answer: 'fate stay night', aliases: ['fate', 'fate stay night', 'fate zero', 'fate grand order'], strict: true },
    { emojis: '👁️‍🗨️🔮🐉', answer: 'pokemon', aliases: ['pokemon', 'pikachu', 'pokémon'], strict: true },
    { emojis: '🦊👧', answer: 'magi', aliases: ['magi', 'magi the labyrinth of magic'], strict: true },
    { emojis: '🎭⏰', answer: 'boku no hero', aliases: ['my hero academia', 'mha', 'bnha'], strict: true },
    { emojis: '⚡🍃🌸', answer: 'bleach', aliases: ['bleach', 'bleach thousand year blood war'], strict: true },
    { emojis: '🦈👨‍🚀🌊', answer: 'one piece', aliases: ['one piece'], strict: true },
    { emojis: '👹🔥🗡️', answer: 'demon slayer', aliases: ['demon slayer', 'kimetsu no yaiba', 'tanjiro'], strict: true },
    { emojis: '🧟‍♂️🌆', answer: 'parasyte', aliases: ['parasyte', 'kiseijuu'], strict: true },
    { emojis: '🎮🤖⚔️', answer: 'sao', aliases: ['sao', 'sword art online'], strict: true },
    { emojis: '🔍👧💀', answer: 'death note', aliases: ['death note', 'light', 'ryuk'], strict: true },
    { emojis: '👦🧬💪', answer: 'one punch man', aliases: ['one punch man', 'opm', 'saitama'], strict: true },
];

// Module-level state
let usedIndices = new Set<number>();

// Reset the pool
export const resetMoviePool = () => {
    usedIndices.clear();
};

// Returns exactly 'count' movies, randomly selected
export const getRandomMovies = (count: number = 10): MovieEntry[] => {
    const availableIndices = MOVIE_DATABASE
        .map((_, idx) => idx)
        .filter(idx => !usedIndices.has(idx));

    if (availableIndices.length < count) {
        usedIndices.clear();
        return getRandomMovies(count);
    }

    const shuffled = [...availableIndices].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    selected.forEach(idx => usedIndices.add(idx));

    return selected.map(idx => MOVIE_DATABASE[idx]);
};

// ============================================================
// IMPROVED MATCHING LOGIC
// ============================================================

// Normalize text for comparison
const normalize = (s: string): string => {
    return s.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
};

// Levenshtein distance
const levenshtein = (a: string, b: string): number => {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
};

// Main matching function with two modes:
// - Relaxed (default): allows substring matches, similar words (lord of the rings = the lord of the rings)
//   This is the DEFAULT behavior - most movies should use this
// - Strict: requires exact or near-exact match ONLY when entry.strict is true
//   Use strict mode ONLY for disambiguation like frozen vs frozen ii
export const isCorrectGuess = (guess: string, answer: string, strict: boolean = false): boolean => {
    const g = normalize(guess);
    const a = normalize(answer);

    // Exact match (case insensitive)
    if (g === a) return true;

    // STRICT MODE: Only for entries where clarification is needed (e.g., "frozen" vs "frozen ii")
    // In strict mode: only allow Levenshtein distance of 1 for minor typos
    if (strict) {
        if (levenshtein(g, a) <= 1) return true;
        return false;
    }

    // RELAXED MODE (DEFAULT) - For most movies:
    // 1. Check if guess is a substring of answer or vice versa
    // This allows "lord of the rings" to match "the lord of the rings"
    if (a.includes(g) || g.includes(a)) return true;

    // 2. Allow fuzzy matching with Levenshtein distance of 2 for longer strings
    // This handles typos like "titanic" matching "titan" (though that's wrong anyway)
    if (g.length >= 6 && a.length >= 6) {
        if (levenshtein(g, a) <= 2) return true;
    }

    // 3. Check word overlap for multi-word answers
    // Split into words and check if most words match
    const guessWords = g.split(/\s+/).filter(w => w.length > 2);
    const answerWords = a.split(/\s+/).filter(w => w.length > 2);
    if (guessWords.length > 1 && answerWords.length > 1) {
        const matchingWords = guessWords.filter(w => answerWords.some(aw => aw.includes(w) || w.includes(aw)));
        if (matchingWords.length >= Math.min(guessWords.length, answerWords.length) * 0.7) return true;
    }

    return false;
};

// Check against an entry including aliases
export const checkAnswerWithAliases = (guess: string, entry: MovieEntry): boolean => {
    const normalizedGuess = normalize(guess);

    // Check main answer - use strict mode ONLY if entry.strict is true
    if (isCorrectGuess(guess, entry.answer, entry.strict === true)) return true;

    // Check aliases - aliases also use strict mode if the entry is strict
    if (entry.aliases) {
        for (const alias of entry.aliases) {
            if (isCorrectGuess(guess, alias, entry.strict === true)) return true;
        }
    }

    return false;
};
