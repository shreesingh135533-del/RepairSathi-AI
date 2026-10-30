/**
 * RepairSathi Semantic Text & Problem Description Validator
 * Detects:
 * - Keyboard mashing (e.g. xdfgjkm, asdfgh, qwerty, zxcvbn)
 * - Single / low information words (e.g. X, XYZ, 12345, ABC, hello, test, problem, fix)
 * - Repeated characters (e.g. aaaaaa, 111111)
 * - Consonant clusters without vowels or pronounceable phonemes
 * - Genuine device symptoms in natural English and Hinglish
 */

// Known keyboard row walk patterns and test inputs
const KNOWN_GIBBERISH_PATTERNS = [
  'qwerty', 'asdfgh', 'zxcvbn', 'qwert', 'asdf', 'zxcv', 'dfghjk', 'fghjkl',
  'xdfgjkm', 'ghjkl', 'poiuy', 'lkjhg', 'mnbvc', '12345', '123456', '09876'
];

const KNOWN_JUNK_WORDS = new Set([
  'x', 'y', 'z', 'xyz', 'abc', 'test', 'testing', 'hello', 'hi', 'hey', 'okay',
  'ok', 'none', 'nothing', 'na', 'null', 'undefined', 'foo', 'bar', 'baz',
  'check', 'sample', 'demo', 'problem', 'help', 'issue', 'repair', 'broke', 'broken'
]);

// Hardware & technical symptom keywords (English + Hinglish)
const SYMPTOM_KEYWORDS = [
  // Power & Battery
  'charge', 'charging', 'battery', 'drain', 'discharg', 'power', 'turn on', 'boot',
  'restart', 'shutdown', 'shut down', 'dead', 'backup', 'slow charge', 'trickle',
  'heating', 'heat', 'hot', 'overheat', 'warm', 'temperature', 'adapter', 'cable',
  'charger', 'port', 'plug', 'switch', 'cord', 'socket', 'fuse', 'mcb',

  // Display & Screen
  'screen', 'display', 'touch', 'touchscreen', 'flicker', 'black', 'blank', 'glass',
  'crack', 'cracked', 'line', 'lines', 'green line', 'pink line', 'dim', 'dark',
  'brightness', 'glitch', 'bleed', 'pixel', 'ghost', 'unresponsive', 'lag', 'frozen',

  // Audio & Communication
  'sound', 'audio', 'speaker', 'mic', 'microphone', 'earpiece', 'volume', 'loud',
  'hum', 'humming', 'buzz', 'buzzing', 'rattle', 'noise', 'vibrat', 'shaking',
  'calling', 'voice', 'mute', 'wifi', 'wi-fi', 'internet', 'network', 'signal',
  'bluetooth', 'los', 'pon', 'optical', 'fiber', 'connect', 'disconnect',

  // Physical, Mechanical, Fluid & Thermal
  'leak', 'leaking', 'water', 'spill', 'moist', 'submerge', 'wet', 'frost', 'ice',
  'cool', 'cooling', 'fan', 'blade', 'motor', 'drum', 'spin', 'spinning', 'drain',
  'draining', 'pump', 'pipe', 'valve', 'compressor', 'gas', 'smell', 'odor',
  'smoke', 'smoking', 'spark', 'sparking', 'fire', 'burn', 'burnt', 'flame',
  'jammed', 'stuck', 'door', 'latch', 'hinge', 'wobbl', 'button', 'key', 'keyboard',

  // Hinglish common repair terms
  'nahi chal', 'band ho', 'chalu nahi', 'kharab', 'tut gaya', 'tut gaya', 'tut gaya',
  'garam', 'awaz', 'dhua', 'pani', 'gir gaya', 'aawaz', 'ruk gaya', 'khatam',
  'jaldi', 'chal nahi', 'kam nahi', 'kaam nahi', 'chal raha'
];

/**
 * Calculates vowel ratio and checks for impossible consonant sequences
 */
function isConsonantMash(text) {
  const letters = text.toLowerCase().replace(/[^a-z]/g, '');
  if (letters.length < 4) return false;

  const vowels = letters.match(/[aeiou]/g);
  const vowelCount = vowels ? vowels.length : 0;
  const vowelRatio = vowelCount / letters.length;

  // If a word has 5+ letters and zero vowels (e.g. "xdfgjkm") -> gibberish
  if (letters.length >= 5 && vowelCount === 0) {
    // Exception for very rare valid English abbreviations
    const validAcronyms = ['rhythm', 'crypt', 'lynch', 'sync'];
    if (!validAcronyms.includes(letters)) {
      return true;
    }
  }

  // Extreme consonant cluster: 5 or more consecutive consonants
  if (/[bcdfghjklmnpqrstvwxyz]{5,}/.test(letters)) {
    return true;
  }

  // Very low vowel ratio in longer words
  if (letters.length >= 7 && vowelRatio < 0.15) {
    return true;
  }

  return false;
}

/**
 * Checks character repetition (e.g. "aaaaa", "11111", "abcabcabc")
 */
function isRepetitive(text) {
  const cleaned = text.toLowerCase().replace(/\s+/g, '');
  if (cleaned.length < 4) return false;

  // Single character repeated
  if (/^(.)\1+$/.test(cleaned)) return true;

  // 2-character pattern repeated 3+ times (e.g. "abababab")
  if (/^(.{2})\1{2,}$/.test(cleaned)) return true;

  // 3-character pattern repeated 2+ times (e.g. "xyzxyzxyz")
  if (/^(.{3})\1{2,}$/.test(cleaned)) return true;

  return false;
}

/**
 * Shannon Entropy to measure randomness / keyboard mash
 */
function calculateEntropy(str) {
  const len = str.length;
  if (len === 0) return 0;
  const frequencies = {};
  for (let i = 0; i < len; i++) {
    const char = str[i];
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  let entropy = 0;
  for (const char in frequencies) {
    const p = frequencies[char] / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

/**
 * Main problem description validation function
 */
function validateProblemDescription(text) {
  if (!text || typeof text !== 'string') {
    return {
      status: 'INVALID',
      isValid: false,
      confidence: 1.0,
      message: 'Please enter a description of the problem with your device.',
      detectedSymptom: null
    };
  }

  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // 1. Length checks
  if (trimmed.length < 3) {
    return {
      status: 'INVALID',
      isValid: false,
      confidence: 1.0,
      message: 'Problem description is too short. Please describe what is happening with your device.',
      detectedSymptom: null
    };
  }

  // 2. Junk single words / exact matches
  if (KNOWN_JUNK_WORDS.has(lower)) {
    return {
      status: 'INVALID',
      isValid: false,
      confidence: 0.95,
      message: 'Invalid problem description. Please describe a real problem with your device.',
      detectedSymptom: null
    };
  }

  // 3. Known keyboard mash walk patterns (e.g. "xdfgjkm", "asdfgh", "qwerty")
  for (const pattern of KNOWN_GIBBERISH_PATTERNS) {
    if (lower === pattern || lower.includes(pattern)) {
      return {
        status: 'INVALID',
        isValid: false,
        confidence: 0.99,
        message: 'Invalid problem description. Please describe a real problem with your device.',
        detectedSymptom: null
      };
    }
  }

  // 4. Pure numbers or non-alphabetic
  if (/^\d+$/.test(lower) || /^[^a-zA-Z0-9]+$/.test(lower)) {
    return {
      status: 'INVALID',
      isValid: false,
      confidence: 0.98,
      message: 'Invalid problem description. Please describe a real problem with your device in words.',
      detectedSymptom: null
    };
  }

  // 5. Repetitive characters
  if (isRepetitive(lower)) {
    return {
      status: 'INVALID',
      isValid: false,
      confidence: 0.95,
      message: 'Invalid problem description. Repetitive characters detected. Please describe your actual issue.',
      detectedSymptom: null
    };
  }

  // 6. Word by word analysis for consonant mashing (like "xdfgjkm")
  const words = lower.split(/[\s,.-]+/).filter(w => w.length > 0);
  let gibberishWords = 0;
  for (const w of words) {
    if (isConsonantMash(w) || KNOWN_GIBBERISH_PATTERNS.some(p => w.includes(p))) {
      gibberishWords++;
    }
  }

  // If all words or primary word is gibberish
  if (words.length > 0 && gibberishWords === words.length) {
    return {
      status: 'INVALID',
      isValid: false,
      confidence: 0.98,
      message: 'Invalid problem description. Please describe a real problem with your device.',
      detectedSymptom: null
    };
  }

  // 7. Check for presence of genuine hardware symptom concepts
  let matchedSymptoms = [];
  for (const kw of SYMPTOM_KEYWORDS) {
    if (lower.includes(kw)) {
      matchedSymptoms.push(kw);
    }
  }

  // 8. If symptom matches are found -> VALID
  if (matchedSymptoms.length > 0) {
    return {
      status: 'VALID',
      isValid: true,
      confidence: 0.95,
      message: 'Valid problem description.',
      detectedSymptom: matchedSymptoms.join(', ')
    };
  }

  // 9. If text has multiple coherent natural language words (>= 3 words) with normal vowels
  // Even if not matching exact keywords, if structure is grammatical and not gibberish
  if (words.length >= 3 && gibberishWords === 0) {
    const totalChars = words.join('').length;
    const totalVowels = (words.join('').match(/[aeiou]/g) || []).length;
    const overallVowelRatio = totalVowels / (totalChars || 1);

    if (overallVowelRatio >= 0.25) {
      return {
        status: 'VALID',
        isValid: true,
        confidence: 0.85,
        message: 'Valid problem description.',
        detectedSymptom: 'Custom natural language symptom'
      };
    }
  }

  // 10. Needs Clarification (e.g., user wrote just 1 or 2 vague words without clear symptom)
  return {
    status: 'NEEDS_CLARIFICATION',
    isValid: false,
    confidence: 0.75,
    message: 'Could you provide a little more detail? Explain what your device is doing (e.g. screen dark, battery draining, not charging).',
    detectedSymptom: null
  };
}

module.exports = {
  validateProblemDescription,
  isConsonantMash,
  isRepetitive
};
