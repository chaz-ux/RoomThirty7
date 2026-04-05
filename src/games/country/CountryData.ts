// ─────────────────────────────────────────────────────────────
//  GUESS THE COUNTRY — ROOM 37
//
//  EMOJI RULE: Every clue is a SOUND/WORDPLAY puzzle on the
//  country's name. Players should be able to sound it out.
//
//  Examples:
//    Kenya   → 🔑 + 😐 = "Key" + "nya" → Kenya
//    France  → 🍟 + 🐜 = "Fran" + "ce" (ants) → France
//    Japan   → 🃏 + 🍳 = "Ja" + "pan" → Japan
//    Turkey  → 🦃 + 🔑 = "Turk" + "ey" → Turkey
//    Iran    → 🏃 + ♂️ = "I ran" → Iran
//    Iceland → 🧊 + 🌍 = "Ice" + "land" → Iceland
//
//  No culture. No flags. Pure phonetic fun.
// ─────────────────────────────────────────────────────────────

export interface CountryEntry {
  emojis: string;
  answer: string;
  aliases?: string[];
  region: Region;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;   // optional phonetic breakdown shown on reveal
}

export type Region =
  | 'africa'
  | 'europe'
  | 'americas'
  | 'asia'
  | 'oceania'
  | 'middle_east';

export const REGION_LABELS: Record<Region, string> = {
  africa:      '🌍 Africa',
  europe:      '🏰 Europe',
  americas:    '🌎 Americas',
  asia:        '🐉 Asia',
  oceania:     '🦘 Oceania',
  middle_east: '🌙 Middle East',
};

const norm = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

export const checkCountryAnswer = (guess: string, entry: CountryEntry): boolean => {
  const g = norm(guess);
  const all = [entry.answer, ...(entry.aliases ?? [])].map(norm);
  return all.some(a => a === g || (a.includes(g) && g.length >= 4));
};

export const shuffleCountries = (arr: CountryEntry[]): CountryEntry[] => {
  const b = [...arr];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

let _pool: CountryEntry[] = [];
export const resetCountryPool = () => { _pool = []; };

export const getCountriesByRegion = (regions: Region[], count: number): CountryEntry[] => {
  const filtered = COUNTRY_DATABASE.filter(c => regions.includes(c.region));
  const remaining = filtered.filter(c => !_pool.includes(c));
  const source = remaining.length >= count ? remaining : filtered;
  const picked = shuffleCountries(source).slice(0, count);
  _pool.push(...picked);
  return picked;
};

export const getCountryCount = (region: Region) =>
  COUNTRY_DATABASE.filter(c => c.region === region).length;

// ─────────────────────────────────────────────────────────────
//  THE DATABASE — NAME WORDPLAY ONLY
// ─────────────────────────────────────────────────────────────
export const COUNTRY_DATABASE: CountryEntry[] = [

 // ════════════════════════════════════════════════════════════
  //  🌍 AFRICA (All 54 Countries - Pure Phonetic Wordplay)
  // ════════════════════════════════════════════════════════════

  // -- North Africa --
  { region: 'africa', difficulty: 'easy',   emojis: '📧 + 🚙',           answer: 'egypt',         hint: 'E + Jeep(t)',          aliases: ['egypt'] },
  { region: 'africa', difficulty: 'easy',   emojis: '➕ + 🪨 + 🅾️',       answer: 'morocco',       hint: 'More + Rock + O',      aliases: ['morocco'] },
  { region: 'africa', difficulty: 'medium', emojis: '🦉 + ⚙️ + 🗣️',       answer: 'algeria',       hint: 'Owl + Gear + Ya',      aliases: ['algeria'] },
  { region: 'africa', difficulty: 'medium', emojis: '2️⃣ + 🦵 + 🗣️',       answer: 'tunisia',       hint: 'Two + Knees + Ya',     aliases: ['tunisia'] },
  { region: 'africa', difficulty: 'medium', emojis: '👄 + 🗣️',           answer: 'libya',         hint: 'Lip + Ya',             aliases: ['libya'] },
  { region: 'africa', difficulty: 'easy',   emojis: '👩 + 👨',           answer: 'sudan',         hint: 'Sue + Dan',            aliases: ['sudan'] },

  // -- East Africa --
  { region: 'africa', difficulty: 'easy',   emojis: '🥫 + 🫵',           answer: 'kenya',         hint: 'Can + You (Kenya)',    aliases: ['kenya'] }, // A classic!
  { region: 'africa', difficulty: 'easy',   emojis: '🫵 + 🔫 + 🚪',       answer: 'uganda',        hint: 'You + Gun + Door(Da)', aliases: ['uganda'] },
  { region: 'africa', difficulty: 'medium', emojis: '🔟 + 🏜️ + 🦵 + 🅰️', answer: 'tanzania',      hint: 'Ten + Sand + Knee + A',aliases: ['tanzania'] },
  { region: 'africa', difficulty: 'easy',   emojis: '🚣 + 🐜 + 🚪',       answer: 'rwanda',        hint: 'Row + Ant + Door(Da)', aliases: ['rwanda'] },
  { region: 'africa', difficulty: 'medium', emojis: '👻 + 🏃‍♂️ + 🇩',       answer: 'burundi',       hint: 'Boo + Run + D',        aliases: ['burundi'] },
  { region: 'africa', difficulty: 'hard',   emojis: '📧 + 🍵 + 🅾️ + 🥧',  answer: 'ethiopia',      hint: 'E + Tea + O + Pie',    aliases: ['ethiopia'] },
  { region: 'africa', difficulty: 'medium', emojis: '🧵 + 🛍️ + 🗣️',       answer: 'somalia',       hint: 'Sew + Mall + Ya',      aliases: ['somalia'] },
  { region: 'africa', difficulty: 'hard',   emojis: '👖 + 👻 + 🍵',       answer: 'djibouti',      hint: 'Jean(Ji) + Boo + Tea', aliases: ['djibouti'] },
  { region: 'africa', difficulty: 'hard',   emojis: '🌬️ + 🅰️ + 🌳 + 🅰️',   answer: 'eritrea',       hint: 'Air + A + Tree + A',   aliases: ['eritrea'] },
  { region: 'africa', difficulty: 'medium', emojis: '⬇️ + 👩 + 👨',       answer: 'south sudan',   hint: 'South + Sue + Dan',    aliases: ['south sudan'] },

  // -- West Africa --
  { region: 'africa', difficulty: 'easy',   emojis: '🌃 + 🏺 + 🗣️',       answer: 'nigeria',       hint: 'Nigh + Jar + Ya',      aliases: ['nigeria'] },
  { region: 'africa', difficulty: 'easy',   emojis: '🔫 + 🅰️',           answer: 'ghana',         hint: 'Gun + A',              aliases: ['ghana'] },
  { region: 'africa', difficulty: 'easy',   emojis: '🛍️ + 📧',           answer: 'mali',          hint: 'Mall + E',             aliases: ['mali'] },
  { region: 'africa', difficulty: 'medium', emojis: '🪙 + 🅰️ + 🦅',       answer: 'senegal',       hint: 'Cent + A + Gull',      aliases: ['senegal'] },
  { region: 'africa', difficulty: 'easy',   emojis: '🦶 + 🟢',           answer: 'togo',          hint: 'Toe + Go',             aliases: ['togo'] },
  { region: 'africa', difficulty: 'medium', emojis: '🗑️ + 📥',           answer: 'benin',         hint: 'Bin + In',             aliases: ['benin'] },
  { region: 'africa', difficulty: 'easy',   emojis: '🌃 + 🏺',           answer: 'niger',         hint: 'Nigh + Jar',           aliases: ['niger'] },
  { region: 'africa', difficulty: 'hard',   emojis: '🍔 + 🔑 + 🙅‍♂️ + 💨', answer: 'burkina faso',  hint: 'Bur(ger) + Key + Nah + Fast(o)', aliases: ['burkina faso'] },
  { region: 'africa', difficulty: 'easy',   emojis: '🐘 + 🏖️',           answer: 'ivory coast',   hint: 'Ivory(Elephant) + Coast', aliases: ["cote d'ivoire", 'ivory coast', 'cote divoire'] },
  { region: 'africa', difficulty: 'medium', emojis: '🤥 + 🐻 + 🗣️',       answer: 'liberia',       hint: 'Lie + Bear + Ya',      aliases: ['liberia'] },
  { region: 'africa', difficulty: 'medium', emojis: '👁️ + 🌬️ + 🅰️ + 🦁', answer: 'sierra leone',  hint: 'See + Air + A + Lion', aliases: ['sierra leone'] },
  { region: 'africa', difficulty: 'medium', emojis: '🐷',                answer: 'guinea',        hint: 'Guinea (Pig)',         aliases: ['guinea'] },
  { region: 'africa', difficulty: 'hard',   emojis: '🐷 + 🐝 + 🐖',       answer: 'guinea bissau', hint: 'Guinea + Bee + Sow',   aliases: ['guinea bissau'] },
  { region: 'africa', difficulty: 'medium', emojis: '🎮 + 🐝 + 🅰️',       answer: 'gambia',        hint: 'Game + Bee + A',       aliases: ['gambia', 'the gambia'] },
  { region: 'africa', difficulty: 'medium', emojis: '🚕 + 🅾️ + 🟢',       answer: 'cape verde',    hint: 'Cab + O + Verde(Green)', aliases: ['cape verde', 'cabo verde'] },
  { region: 'africa', difficulty: 'hard',   emojis: '➕ + ⛺ + 🦵 + 🅰️',   answer: 'mauritania',    hint: 'More + Tent + Knee + A', aliases: ['mauritania'] },

  // -- Central Africa --
  { region: 'africa', difficulty: 'easy',   emojis: '🍦 + 🟢',           answer: 'congo',         hint: 'Cone + Go',            aliases: ['congo', 'republic of the congo'] },
  { region: 'africa', difficulty: 'medium', emojis: '👨‍⚕️ + 🍦 + 🟢',       answer: 'dr congo',      hint: 'Doc(tor) + Cone + Go', aliases: ['dr congo', 'drc', 'democratic republic of the congo'] },
  { region: 'africa', difficulty: 'medium', emojis: '📷 + 👂 + 🌙',       answer: 'cameroon',      hint: 'Cam + Ear + Moon',     aliases: ['cameroon'] },
  { region: 'africa', difficulty: 'medium', emojis: '🗣️ + 🔛',           answer: 'gabon',         hint: 'Gab(Chat) + On',       aliases: ['gabon'] },
  { region: 'africa', difficulty: 'easy',   emojis: '💬',                answer: 'chad',          hint: 'Chat (Chad)',          aliases: ['chad'] },
  { region: 'africa', difficulty: 'hard',   emojis: '🪙 + 🥐 + 🌍 + 🔁',  answer: 'central african republic', hint: 'Cent + Roll + Africa + Rep', aliases: ['central african republic', 'car'] },
  { region: 'africa', difficulty: 'hard',   emojis: '🟰 + 🐂 + 🐷',       answer: 'equatorial guinea', hint: 'Equal + Toro(Bull) + Guinea', aliases: ['equatorial guinea'] },
  { region: 'africa', difficulty: 'hard',   emojis: '🐖 + 🦶 + 🗓️ + 👑',   answer: 'sao tome and principe', hint: 'Sow + Toe + May + Prince', aliases: ['sao tome', 'sao tome and principe'] },

  // -- Southern Africa --
  { region: 'africa', difficulty: 'easy',   emojis: '⬇️ + 🌍',           answer: 'south africa',  hint: 'South + Africa',       aliases: ['south africa', 'rsa'] },
  { region: 'africa', difficulty: 'easy',   emojis: '😡 + 🅰️ + ⛽ + 🚗', answer: 'madagascar',    hint: 'Mad + A + Gas + Car',  aliases: ['madagascar'] },
  { region: 'africa', difficulty: 'medium', emojis: '🤖 + 🦢 + 🅰️',       answer: 'botswana',      hint: 'Bot + Swan + A',       aliases: ['botswana'] },
  { region: 'africa', difficulty: 'medium', emojis: '⚡ + 🐝 + 🗣️',       answer: 'zambia',        hint: 'Zap + Bee + Ya',       aliases: ['zambia'] },
  { region: 'africa', difficulty: 'medium', emojis: '💤 + 👶 + 🛣️',       answer: 'zimbabwe',      hint: 'Zzz + Bab(y) + Way',   aliases: ['zimbabwe'] },
  { region: 'africa', difficulty: 'medium', emojis: '📛 + 🐝 + 🗣️',       answer: 'namibia',       hint: 'Name + Bee + Ya',      aliases: ['namibia'] },
  { region: 'africa', difficulty: 'medium', emojis: '🐜 + 🟢 + 🗣️',       answer: 'angola',        hint: 'Ant + Go + La',        aliases: ['angola'] },
  { region: 'africa', difficulty: 'medium', emojis: '🧔🏻‍♂️ + ⚡ + 🦅',       answer: 'mozambique',    hint: 'Moe(Mustache) + Zap + Beak', aliases: ['mozambique'] },
  { region: 'africa', difficulty: 'medium', emojis: '🛍️ + 🅰️ + 🎮',       answer: 'malawi',        hint: 'Mall + A + Wii',       aliases: ['malawi'] },
  { region: 'africa', difficulty: 'hard',   emojis: '➖ + 🅾️ + 🦶',       answer: 'lesotho',       hint: 'Less + O + Toe',       aliases: ['lesotho'] },
  { region: 'africa', difficulty: 'hard',   emojis: '🐍 + 🪄 + 🍵 + 🦵',  answer: 'eswatini',      hint: 'S + Wand + Tea + Knee',aliases: ['eswatini', 'swaziland'] },
  { region: 'africa', difficulty: 'medium', emojis: '🗣️ + 🐚',           answer: 'seychelles',    hint: 'Say + Shells',         aliases: ['seychelles'] },
  { region: 'africa', difficulty: 'medium', emojis: '➕ + 🐟',           answer: 'mauritius',     hint: 'More + Fishes(ishes)', aliases: ['mauritius'] },
  { region: 'africa', difficulty: 'hard',   emojis: '🪮 + 🚣 + 🐍',       answer: 'comoros',       hint: 'Comb + Row + S',       aliases: ['comoros'] },
  // ════════════════════════════════════════════════════════════
  //  🏰 EUROPE (45 entries - Pure Phonetic Wordplay)
  // ════════════════════════════════════════════════════════════

  // -- The Big Hitters --
  { region: 'europe', difficulty: 'easy',   emojis: '🍟 + 🐜 + 🐍',       answer: 'france',        hint: 'Fry + Ant + S (France)', aliases: ['france'] },
  { region: 'europe', difficulty: 'easy',   emojis: '🎯 + 🅰️ + 🍃',       answer: 'italy',         hint: 'It + A + Leaf (Lee)',    aliases: ['italy'] },
  { region: 'europe', difficulty: 'easy',   emojis: '🐍 + 🥖',           answer: 'spain',         hint: 'S + Pain (Bread)',       aliases: ['spain'] },
  { region: 'europe', difficulty: 'easy',   emojis: '🦠 + 🦵',           answer: 'germany',       hint: 'Germ + Knee',            aliases: ['germany'] },
  { region: 'europe', difficulty: 'easy',   emojis: '🫵 + 🔑',           answer: 'united kingdom', hint: 'U + Key',              aliases: ['uk', 'england', 'britain', 'great britain', 'united kingdom'] },
  { region: 'europe', difficulty: 'easy',   emojis: '🍳',                answer: 'greece',        hint: 'Grease (Pan)',           aliases: ['greece'] },

  // -- The "Lands" --
  { region: 'europe', difficulty: 'easy',   emojis: '🧊 + 🏝️',           answer: 'iceland',       hint: 'Ice + Land',             aliases: ['iceland'] },
  { region: 'europe', difficulty: 'easy',   emojis: '👁️ + 🏝️',           answer: 'ireland',       hint: 'Eye + Land',             aliases: ['ireland'] },
  { region: 'europe', difficulty: 'easy',   emojis: '💈 + 🏝️',           answer: 'poland',        hint: 'Pole + Land',            aliases: ['poland'] },
  { region: 'europe', difficulty: 'easy',   emojis: '🦈 + 🏝️',           answer: 'finland',       hint: 'Fin + Land',             aliases: ['finland'] },
  { region: 'europe', difficulty: 'medium', emojis: '🥅 + 👱‍♀️ + 🏝️',      answer: 'netherlands',   hint: 'Net + Her + Land',       aliases: ['netherlands', 'holland'] },
  { region: 'europe', difficulty: 'medium', emojis: '💦 + ⚙️ + 🏝️',       answer: 'switzerland',   hint: 'Sweat + Sir + Land',     aliases: ['switzerland'] },

  // -- Western & Northern Europe --
  { region: 'europe', difficulty: 'easy',   emojis: '⚓ + 🫵 + 👧',       answer: 'portugal',      hint: 'Port + You + Gal',       aliases: ['portugal'] },
  { region: 'europe', difficulty: 'medium', emojis: '🙅‍♂️ + ⚖️',           answer: 'norway',        hint: 'No + Weigh',             aliases: ['norway'] },
  { region: 'europe', difficulty: 'medium', emojis: '💦 + 🦁',           answer: 'sweden',        hint: 'Sweat + Den',            aliases: ['sweden'] },
  { region: 'europe', difficulty: 'medium', emojis: '🦁 + ✒️',           answer: 'denmark',       hint: 'Den + Mark',             aliases: ['denmark'] },
  { region: 'europe', difficulty: 'medium', emojis: '🔔 + 🏋️‍♂️',           answer: 'belgium',       hint: 'Bell + Gym',             aliases: ['belgium'] },
  { region: 'europe', difficulty: 'medium', emojis: '🦉 + 🌳 + 🗣️',       answer: 'austria',       hint: 'Owl + Tree + Ya',        aliases: ['austria'] },

  // -- Eastern Europe & Balkans --
  { region: 'europe', difficulty: 'easy',   emojis: '🫵 + 🏗️',           answer: 'ukraine',       hint: 'You + Crane',            aliases: ['ukraine'] },
  { region: 'europe', difficulty: 'easy',   emojis: '🇷 + 🇺 + 🤫 + 🗣️',  answer: 'russia',        hint: 'R + U + Shh + Ya',       aliases: ['russia'] },
  { region: 'europe', difficulty: 'medium', emojis: '✅ + 🔁',           answer: 'czech republic', hint: 'Check + Rep(eat)',       aliases: ['czech republic', 'czechia'] },
  { region: 'europe', difficulty: 'medium', emojis: '🤤 + 🌳',           answer: 'hungary',       hint: 'Hunger + Tree (Gree)',   aliases: ['hungary'] },
  { region: 'europe', difficulty: 'medium', emojis: '🚣 + 👨 + 🗣️',       answer: 'romania',       hint: 'Row + Man + Ya',         aliases: ['romania'] },
  { region: 'europe', difficulty: 'medium', emojis: '🐂 + ⚙️ + 🗣️',       answer: 'bulgaria',      hint: 'Bull + Gear + Ya',       aliases: ['bulgaria'] },
  { region: 'europe', difficulty: 'medium', emojis: '👨‍💼 + 🐝 + 🗣️',       answer: 'serbia',        hint: 'Sir + Bee + Ya',         aliases: ['serbia'] },
  { region: 'europe', difficulty: 'medium', emojis: '🐦‍⬛ + 🎱 + 🗣️',       answer: 'croatia',       hint: 'Crow + Eight + Ya',      aliases: ['croatia'] },
  { region: 'europe', difficulty: 'medium', emojis: '🐌 + 🚐 + 🗣️',       answer: 'slovenia',      hint: 'Slow + Van + Ya',        aliases: ['slovenia'] },
  { region: 'europe', difficulty: 'medium', emojis: '🐌 + 🗣️ + 🔑 + 🗣️',  answer: 'slovakia',      hint: 'Slow + V(ac) + Key + A', aliases: ['slovakia'] },
  { region: 'europe', difficulty: 'hard',   emojis: '🪜 + ✌️ + 🗣️',       answer: 'latvia',        hint: 'Ladder(Lat) + V + Ya',   aliases: ['latvia'] },
  { region: 'europe', difficulty: 'hard',   emojis: '👄 + 🫵 + 🌧️ + 🗣️',  answer: 'lithuania',     hint: 'Lip(Lith) + You + Rain + Ya', aliases: ['lithuania'] },
  { region: 'europe', difficulty: 'hard',   emojis: '🐍 + 🦶 + 🦵 + 🗣️',  answer: 'estonia',       hint: 'S + Toe + Knee + Ya',    aliases: ['estonia'] },
  { region: 'europe', difficulty: 'hard',   emojis: '🔔 + 🅰️ + 🇷 + 🇺 + 🐍', answer: 'belarus',    hint: 'Bell + A + R + U + S',   aliases: ['belarus'] },
  { region: 'europe', difficulty: 'hard',   emojis: '🛍️ + 🦌 + 🚐',       answer: 'moldova',       hint: 'Mall + Doe + Van',       aliases: ['moldova'] },
  { region: 'europe', difficulty: 'hard',   emojis: '⛰️ + 🔟 + 🦵 + 🚣',  answer: 'montenegro',    hint: 'Mount + Ten + Knee + Grow(Row)', aliases: ['montenegro'] },
  { region: 'europe', difficulty: 'medium', emojis: '🦉 + 🚫 + 🗣️',       answer: 'albania',       hint: 'Owl + Ban + Ya',         aliases: ['albania'] },
  { region: 'europe', difficulty: 'hard',   emojis: '⬆️ + 🔨 + 🍩 + 🗣️',  answer: 'north macedonia', hint: 'North + Mace + Donut + Ya', aliases: ['north macedonia', 'macedonia'] },
  { region: 'europe', difficulty: 'hard',   emojis: '👨‍💼 + 🦵 + 🗣️',       answer: 'bosnia',        hint: 'Boss + Knee + Ya',       aliases: ['bosnia', 'bosnia and herzegovina'] },
  { region: 'europe', difficulty: 'hard',   emojis: '💋 + 🅾️ + ✌️ + 🅾️',  answer: 'kosovo',        hint: 'Kiss(Kos) + O + V + O',  aliases: ['kosovo'] },

  // -- Microstates --
  { region: 'europe', difficulty: 'hard',   emojis: '🐜 + 🚪 + 🅰️',       answer: 'andorra',       hint: 'Ant + Door + A',         aliases: ['andorra'] },
  { region: 'europe', difficulty: 'hard',   emojis: '🍀 + 🪵 + 🍔',       answer: 'luxembourg',    hint: 'Luck(Lux) + Log(em) + Burger', aliases: ['luxembourg'] },
  { region: 'europe', difficulty: 'hard',   emojis: '👨 + 🅰️ + 🧥',       answer: 'monaco',        hint: 'Man + A + Coat',         aliases: ['monaco'] },
  { region: 'europe', difficulty: 'hard',   emojis: '👅 + 🔟 + 🍺',       answer: 'liechtenstein', hint: 'Lick + Ten + Stein',     aliases: ['liechtenstein'] },
  { region: 'europe', difficulty: 'hard',   emojis: '🏖️ + 🐎 + 🦵 + 🅾️',  answer: 'san marino',    hint: 'Sand + Mare + Knee + O', aliases: ['san marino'] },
  { region: 'europe', difficulty: 'hard',   emojis: '🦇 + 👁️ + 🥫',       answer: 'vatican',       hint: 'Bat(Vat) + I + Can',     aliases: ['vatican', 'vatican city', 'holy see'] },
  { region: 'europe', difficulty: 'medium', emojis: '🛍️ + 🫖 + 🅰️',       answer: 'malta',         hint: 'Mall + Tea + A',         aliases: ['malta'] },
 // ════════════════════════════════════════════════════════════
  //  🌎 AMERICAS (35 entries - Pure Phonetic Wordplay)
  // ════════════════════════════════════════════════════════════

  // -- North America --
  { region: 'americas', difficulty: 'easy',   emojis: '🫵 + 🇸 + 🅰️',       answer: 'usa',           hint: 'U + S + A',              aliases: ['usa', 'united states', 'america'] },
  { region: 'americas', difficulty: 'easy',   emojis: '🥫 + 🅰️ + 🚪',       answer: 'canada',        hint: 'Can + A + Door(Da)',     aliases: ['canada'] },
  { region: 'americas', difficulty: 'easy',   emojis: '🇲 + ✖️ + 👁️ + 🧥',   answer: 'mexico',        hint: 'M + X(Ex) + I + Coat(Co)', aliases: ['mexico'] },

  // -- Central America --
  { region: 'americas', difficulty: 'easy',   emojis: '🍳 + 🅰️ + 👩',       answer: 'panama',        hint: 'Pan + A + Ma',           aliases: ['panama'] },
  { region: 'americas', difficulty: 'medium', emojis: '👻 + 🍵 + 🛍️ + 🅰️', answer: 'guatemala',     hint: 'Gua(Boo) + Tea + Mall + A', aliases: ['guatemala'] },
  { region: 'americas', difficulty: 'medium', emojis: '🔔 + 🧊',           answer: 'belize',        hint: 'Bell + Ice(Eze)',        aliases: ['belize'] },
  { region: 'americas', difficulty: 'medium', emojis: '💲 + 🍵 + 🇷 + 👁️ + 🚗', answer: 'costa rica',hint: 'Cost + Tea + R + I + Car', aliases: ['costa rica'] },
  { region: 'americas', difficulty: 'hard',   emojis: '🍯 + 🚪 + 🍑',       answer: 'honduras',      hint: 'Hon(ey) + Door + Ass(As)', aliases: ['honduras'] },
  { region: 'americas', difficulty: 'hard',   emojis: '🧝‍♂️ + 🧂 + ✌️ + 🚪', answer: 'el salvador',   hint: 'El(f) + Salt + V + Door',aliases: ['el salvador'] },
  { region: 'americas', difficulty: 'hard',   emojis: '🦵 + 🚗 + 📻 + 🅰️', answer: 'nicaragua',     hint: 'Knee + Car + Rad(Rag) + A',aliases: ['nicaragua'] },

  // -- South America --
  { region: 'americas', difficulty: 'easy',   emojis: '👙 + 🦭',           answer: 'brazil',        hint: 'Bra + Seal(Zil)',        aliases: ['brazil'] },
  { region: 'americas', difficulty: 'easy',   emojis: '🌶️',                answer: 'chile',         hint: 'Chili Pepper',           aliases: ['chile'] },
  { region: 'americas', difficulty: 'easy',   emojis: '🍐 + 🦘',           answer: 'peru',          hint: 'Pear + Roo',             aliases: ['peru'] },
  { region: 'americas', difficulty: 'medium', emojis: '🇦 + 🧔🏻‍♂️ + 🍵 + 🙅‍♂️', answer: 'argentina',     hint: 'Ar + Gen(t) + Tea + Nah',aliases: ['argentina'] },
  { region: 'americas', difficulty: 'medium', emojis: '☎️ + 🪷 + 🐝 + 🗣️', answer: 'colombia',      hint: 'Call + Lotus(Om) + Bee + Ya', aliases: ['colombia'] },
  { region: 'americas', difficulty: 'medium', emojis: '🟰 + 🚪',           answer: 'ecuador',       hint: 'Equal + Door',           aliases: ['ecuador'] },
  { region: 'americas', difficulty: 'medium', emojis: '🎳 + 🍃 + ✌️ + 🗣️', answer: 'bolivia',       hint: 'Bowl + Leaf(Iv) + V + Ya', aliases: ['bolivia'] },
  { region: 'americas', difficulty: 'hard',   emojis: '🚐 + 🅰️ + 🐳 + 🅰️', answer: 'venezuela',     hint: 'Van + A + Whale + A',    aliases: ['venezuela'] },
  { region: 'americas', difficulty: 'hard',   emojis: '🍐 + 🅰️ + 🇬 + 🇾', answer: 'paraguay',      hint: 'Pear + A + G + Y',       aliases: ['paraguay'] },
  { region: 'americas', difficulty: 'hard',   emojis: '🫵 + 🚣 + 🇬 + 🇾', answer: 'uruguay',       hint: 'You + Row + G + Y',      aliases: ['uruguay'] },
  { region: 'americas', difficulty: 'hard',   emojis: '👨 + 👁️ + 📛',       answer: 'suriname',      hint: 'Sir + I + Name',         aliases: ['suriname'] },
  { region: 'americas', difficulty: 'hard',   emojis: '👦 + 🅰️ + 🙅‍♂️',       answer: 'guyana',        hint: 'Guy + A + Nah',          aliases: ['guyana'] },

  // -- The Caribbean --
  { region: 'americas', difficulty: 'easy',   emojis: '🧊 + 🐑',           answer: 'cuba',          hint: 'Cube + Baa',             aliases: ['cuba'] },
  { region: 'americas', difficulty: 'easy',   emojis: '🌾 + 🍵',           answer: 'haiti',         hint: 'Hay + Tea',              aliases: ['haiti'] },
  { region: 'americas', difficulty: 'medium', emojis: '🃏 + 🛠️ + 🚗',       answer: 'jamaica',       hint: 'Ja + Make + Car',        aliases: ['jamaica'] },
  { region: 'americas', difficulty: 'medium', emojis: '🐑 + 😂 + 👩',       answer: 'bahamas',       hint: 'Baa + Ha + Ma',          aliases: ['bahamas', 'the bahamas'] },
  { region: 'americas', difficulty: 'medium', emojis: '🍫 + 🐝 + 🚪',       answer: 'barbados',      hint: 'Bar + Bee + Door(Dos)',  aliases: ['barbados'] },
  { region: 'americas', difficulty: 'medium', emojis: '🇩 + 👨 + 👁️ + 🦵', answer: 'dominican republic', hint: 'D + O(Man) + I + Knee', aliases: ['dominican republic'] },
  { region: 'americas', difficulty: 'medium', emojis: '🌳 + 🦵 + 👨‍👧',       answer: 'trinidad',      hint: 'Tree + Knee + Dad',      aliases: ['trinidad', 'trinidad and tobago'] },
  { region: 'americas', difficulty: 'hard',   emojis: '😇 + 🚽 + 🗣️',       answer: 'saint lucia',   hint: 'Saint + Loo + Cia',      aliases: ['saint lucia', 'st lucia'] },
  { region: 'americas', difficulty: 'hard',   emojis: '🟢 + 🅰️ + 🚪',       answer: 'grenada',       hint: 'Green + A + Door(Da)',   aliases: ['grenada'] },
  { region: 'americas', difficulty: 'hard',   emojis: '🐜 + 🍵 + 👻',       answer: 'antigua',       hint: 'Ant + Tea + Gua(Boo)',   aliases: ['antigua', 'antigua and barbuda'] },
  { region: 'americas', difficulty: 'hard',   emojis: '😇 + 🐱 + 🐍',       answer: 'saint kitts',   hint: 'Saint + Kit(ten) + S',   aliases: ['saint kitts', 'st kitts'] },
  { region: 'americas', difficulty: 'hard',   emojis: '😇 + 🚐 + 🪙',       answer: 'saint vincent', hint: 'Saint + Van + Cent',     aliases: ['saint vincent', 'st vincent'] },
  { region: 'americas', difficulty: 'hard',   emojis: '🇩 + 👨 + 👁️ + 🗣️', answer: 'dominica',      hint: 'D + O(Man) + I + Ca(Ya)',aliases: ['dominica'] },
 // ════════════════════════════════════════════════════════════
  //  🐉 ASIA & MIDDLE EAST (40 entries - Pure Phonetic Wordplay)
  // ════════════════════════════════════════════════════════════

  // -- East & Southeast Asia --
  { region: 'asia', difficulty: 'easy',   emojis: '🃏 + 🍳',           answer: 'japan',         hint: 'Ja + Pan',               aliases: ['japan'] },
  { region: 'asia', difficulty: 'easy',   emojis: '☕ + 🙅‍♂️',           answer: 'china',         hint: 'Chai + Nah',             aliases: ['china'] },
  { region: 'asia', difficulty: 'medium', emojis: '👔 + 🪄',           answer: 'taiwan',        hint: 'Tie + Wand',             aliases: ['taiwan'] },
  { region: 'asia', difficulty: 'easy',   emojis: '🌽 + 🗣️',           answer: 'south korea',   hint: 'Cor(n) + E + Ya',        aliases: ['south korea', 'korea'] },
  { region: 'asia', difficulty: 'medium', emojis: '🔔 + ✝️ + 💥',       answer: 'vietnam',       hint: 'V(bell) + Et(cross) + Nam', aliases: ['vietnam'] },
  { region: 'asia', difficulty: 'easy',   emojis: '👔 + 🏝️',           answer: 'thailand',      hint: 'Tie + Land',             aliases: ['thailand'] },
  { region: 'asia', difficulty: 'medium', emojis: '🎤 + 🅰️ + ⛳',       answer: 'singapore',     hint: 'Sing + A + Pour(Putt)',  aliases: ['singapore'] },
  { region: 'asia', difficulty: 'medium', emojis: '🔨 + 🎭 + 🗣️',       answer: 'malaysia',      hint: 'Mallet(Ma) + Lay + Ya',  aliases: ['malaysia'] },
  { region: 'asia', difficulty: 'medium', emojis: '📥 + 🍩 + 🦵 + 🗣️',  answer: 'indonesia',     hint: 'In + Dough + Knee + Ya', aliases: ['indonesia'] },
  { region: 'asia', difficulty: 'hard',   emojis: '💊 + 💋 + 📍 + 🐍',  answer: 'philippines',   hint: 'Pill + Lip + Pin + S',   aliases: ['philippines'] },
  { region: 'asia', difficulty: 'hard',   emojis: '📷 + 🏹 + 🇩 + 🗣️',   answer: 'cambodia',      hint: 'Cam + Bow + D + Ya',     aliases: ['cambodia'] },
  { region: 'asia', difficulty: 'hard',   emojis: '🪰 + 🐍',           answer: 'laos',          hint: 'Louse(Bug) + S',         aliases: ['laos'] },
  { region: 'asia', difficulty: 'hard',   emojis: '🍺 + 🌃',           answer: 'brunei',        hint: 'Brew + Nigh(t)',         aliases: ['brunei'] },
  { region: 'asia', difficulty: 'hard',   emojis: '🍵 + ➕ + ⬇️',       answer: 'timor leste',   hint: 'Tea + More + Less(t)',   aliases: ['timor leste', 'east timor'] },
  { region: 'asia', difficulty: 'hard',   emojis: '👁️ + 🅰️ + 🗺️',       answer: 'myanmar',       hint: 'My + An + Map(Mar)',     aliases: ['myanmar', 'burma'] },

  // -- South Asia --
  { region: 'asia', difficulty: 'easy',   emojis: '📥 + 🦌 + 🗣️',       answer: 'india',         hint: 'In + Deer + Ya',         aliases: ['india'] },
  { region: 'asia', difficulty: 'medium', emojis: '📦 + 👁️ + 🧍‍♂️',       answer: 'pakistan',      hint: 'Pack + I + Stand',       aliases: ['pakistan'] },
  { region: 'asia', difficulty: 'medium', emojis: '💥 + ⚖️ + 🍽️',       answer: 'bangladesh',    hint: 'Bang + Law + Dish',      aliases: ['bangladesh'] },
  { region: 'asia', difficulty: 'medium', emojis: '🦵 + 🐾',           answer: 'nepal',         hint: 'Knee + Paw',             aliases: ['nepal'] },
  { region: 'asia', difficulty: 'hard',   emojis: '👻 + 🔟',           answer: 'bhutan',        hint: 'Boo + Ten',              aliases: ['bhutan'] },
  { region: 'asia', difficulty: 'hard',   emojis: '3️⃣ + 🏃‍♂️ + 🚗',       answer: 'sri lanka',     hint: 'Three(Sri) + Run + Car', aliases: ['sri lanka'] },
  { region: 'asia', difficulty: 'hard',   emojis: '🛍️ + 🤿',           answer: 'maldives',      hint: 'Mall + Dives',           aliases: ['maldives'] },

  // -- Central Asia (The "Stans") --
  { region: 'asia', difficulty: 'hard',   emojis: '🏎️ + 🪓 + 🧍‍♂️',       answer: 'kazakhstan',    hint: 'Cars + Ax + Stand',      aliases: ['kazakhstan'] },
  { region: 'asia', difficulty: 'hard',   emojis: '🫵 + 🔤 + 🧍‍♂️',       answer: 'uzbekistan',    hint: 'U + Z(Zeb) + Stand',     aliases: ['uzbekistan'] },
  { region: 'asia', difficulty: 'hard',   emojis: '🦃 + 👨 + 🧍‍♂️',       answer: 'turkmenistan',  hint: 'Turkey + Men + Stand',   aliases: ['turkmenistan'] },
  { region: 'asia', difficulty: 'hard',   emojis: '🎯 + 🤢 + 🧍‍♂️',       answer: 'tajikistan',    hint: 'Target(Ta) + Sick(Jik) + Stand', aliases: ['tajikistan'] },
  { region: 'asia', difficulty: 'hard',   emojis: '🔑 + ⚙️ + 🧍‍♂️',       answer: 'kyrgyzstan',    hint: 'Key + Gear + Stand',     aliases: ['kyrgyzstan'] },
  { region: 'asia', difficulty: 'hard',   emojis: '➕ + 🚐 + 🧍‍♂️',       answer: 'afghanistan',   hint: 'Add(Af) + Van + Stand',  aliases: ['afghanistan'] },
  { region: 'asia', difficulty: 'hard',   emojis: '🐒 + 🟢 + 🗣️',       answer: 'mongolia',      hint: 'Monkey(Mon) + Go + Ya',  aliases: ['mongolia'] },

  // -- Middle East --
  { region: 'middle_east', difficulty: 'easy', emojis: '🦃 + 🔑',      answer: 'turkey',        hint: 'Turkey + Key',           aliases: ['turkey', 'turkiye'] },
  { region: 'middle_east', difficulty: 'easy', emojis: '👁️ + 🏃‍♂️',      answer: 'iran',          hint: 'I + Ran',                aliases: ['iran'] },
  { region: 'middle_east', difficulty: 'easy', emojis: '👁️ + 🪨',      answer: 'iraq',          hint: 'I + Rock',               aliases: ['iraq'] },
  { region: 'middle_east', difficulty: 'medium', emojis: '🅾️ + 👨',      answer: 'oman',          hint: 'O + Man',                aliases: ['oman'] },
  { region: 'middle_east', difficulty: 'medium', emojis: '👍 + 👨',      answer: 'yemen',         hint: 'Yeah + Men',             aliases: ['yemen'] },
  { region: 'middle_east', difficulty: 'medium', emojis: '🐦 + ⏳',      answer: 'kuwait',        hint: 'Coo + Wait',             aliases: ['kuwait'] },
  { region: 'middle_east', difficulty: 'medium', emojis: '🐑 + 🌧️',      answer: 'bahrain',       hint: 'Baa + Rain',             aliases: ['bahrain'] },
  { region: 'middle_east', difficulty: 'medium', emojis: '🎸 + 👨',      answer: 'jordan',        hint: 'Chord(Jor) + Dan',       aliases: ['jordan'] },
  { region: 'middle_east', difficulty: 'hard', emojis: '👁️ + 🐍 + 🔔',    answer: 'israel',        hint: 'I + S + Bell(Rael)',     aliases: ['israel'] },
  { region: 'middle_east', difficulty: 'hard', emojis: '🧪 + 🅰️ + 🙅‍♂️',    answer: 'lebanon',       hint: 'Lab + A + None',         aliases: ['lebanon'] },
  { region: 'middle_east', difficulty: 'hard', emojis: '👂 + 🗣️',        answer: 'syria',         hint: 'Hear(Sear) + Ya',        aliases: ['syria'] },
 // ════════════════════════════════════════════════════════════
  //  🌙 MIDDLE EAST (The Final Additions)
  // ════════════════════════════════════════════════════════════
  { region: 'middle_east', difficulty: 'easy',   emojis: '🫵 + 🅰️ + 📧',       answer: 'uae',           hint: 'U + A + E',              aliases: ['uae', 'united arab emirates', 'dubai'] },
  { region: 'middle_east', difficulty: 'medium', emojis: '✂️ + 🛢️',           answer: 'qatar',         hint: 'Cut + Tar',              aliases: ['qatar'] },
  { region: 'middle_east', difficulty: 'medium', emojis: '🪚 + 🇩 + 🅰️ + ☀️ + 🐝 + 🗣️', answer: 'saudi arabia', hint: 'Saw + D + A + Ray + Bee + Ya', aliases: ['saudi arabia'] },
  { region: 'middle_east', difficulty: 'hard',   emojis: '🐾 + ⬇️ + 🔟',       answer: 'palestine',     hint: 'Paw + Less + Ten',       aliases: ['palestine'] },
// ════════════════════════════════════════════════════════════
  //  🌊 OCEANIA (14 entries - Pure Phonetic Wordplay)
  // ════════════════════════════════════════════════════════════
  { region: 'oceania', difficulty: 'easy',   emojis: '😮 + 🥤 + 🍃 + 🗣️',  answer: 'australia',     hint: 'Aw + Straw + Leaf(Lee) + Ya', aliases: ['australia'] },
  { region: 'oceania', difficulty: 'easy',   emojis: '🆕 + 🌊 + 🏝️',       answer: 'new zealand',   hint: 'New + Sea + Land',       aliases: ['new zealand', 'nz'] },
  { region: 'oceania', difficulty: 'easy',   emojis: '💸 + 🔤',           answer: 'fiji',          hint: 'Fee + G',                aliases: ['fiji'] },
  { region: 'oceania', difficulty: 'medium', emojis: '🐾 + 💩 + 🆕 + 🐷',  answer: 'papua new guinea', hint: 'Paw + Poo + New + Guinea(Pig)', aliases: ['papua new guinea', 'png'] },
  { region: 'oceania', difficulty: 'medium', emojis: '👅 + 🅰️',           answer: 'tonga',         hint: 'Tongue + A',             aliases: ['tonga'] },
  { region: 'oceania', difficulty: 'medium', emojis: '➕ + 🅾️ + 🅰️',       answer: 'samoa',         hint: 'Sum + O + A',            aliases: ['samoa'] },
  { region: 'oceania', difficulty: 'hard',   emojis: '🦶 + 🅾️ + 👨 + 🏝️',  answer: 'solomon islands', hint: 'Sole + O + Man + Islands', aliases: ['solomon islands'] },
  { region: 'oceania', difficulty: 'hard',   emojis: '🚐 + 🫵 + 🅰️ + 2️⃣', answer: 'vanuatu',       hint: 'Van + You + A + Two',    aliases: ['vanuatu'] },
  { region: 'oceania', difficulty: 'hard',   emojis: '🎤 + 🚣 + 🦵 + 🗣️',  answer: 'micronesia',    hint: 'Mic + Row + Knee + Ya',  aliases: ['micronesia'] },
  { region: 'oceania', difficulty: 'hard',   emojis: '🪐 + 🐚 + 🏝️',       answer: 'marshall islands', hint: 'Mars + Shell + Islands', aliases: ['marshall islands'] },
  { region: 'oceania', difficulty: 'hard',   emojis: '2️⃣ + ✌️ + 🅰️ + 🚽', answer: 'tuvalu',        hint: 'Two + V + A + Loo',      aliases: ['tuvalu'] },
  { region: 'oceania', difficulty: 'hard',   emojis: '🔑 + 🥩 + 🅰️ + 🍵',  answer: 'kiribati',      hint: 'Key + Rib + A + Tea',    aliases: ['kiribati'] },
  { region: 'oceania', difficulty: 'hard',   emojis: '🙅‍♂️ + 🚣',           answer: 'nauru',         hint: 'Nah + Row',              aliases: ['nauru'] },
  { region: 'oceania', difficulty: 'hard',   emojis: '🐾 + 🤕',           answer: 'palau',         hint: 'Paw + Ow',               aliases: ['palau'] }
];