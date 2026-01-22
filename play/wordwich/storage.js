// storage.js
// Centralized localStorage manager for Wordwich

const STORAGE_KEYS = {
    // Game settings
    LANGUAGE: "wwLanguage",
    PLAY_MODE: "wwPlayMode",
    REQUIRED_GUESSES: "wwRequiredGuesses",
    WORD_LENGTH: "wwWordLength",
    ROW_COUNT: "wwRowCount",
    BOARD_WIDTH: "wwBoardWidth",
    KEYBOARD_VISIBILITY_OFF: "wwKeyboardVisibilityOff",
    STREAK_VISIBILITY: "wwStreakVisibility",
    VISIBLE_ROWS: "wwVisibleRows", // For Wordwich row count display

    // Simulation
    SIMULATE_GUESSES: "wwSimulateGuesses",
    SIMULATE_GROUP_GUESSES: "wwSimulateGroupGuesses",
    SIMULATE_GROUP_LOSS: "wwSimulateGroupLoss",
    STACK_HEIGHT: "wwStackHeight",

    // Winning popup
    WINNING_SOUND_URL: "wwWinningSoundUrl",
    WINNING_MODAL_DURATION: "wwWinningModalDuration",

    // Instruction popup
    INSTRUCTION_ACTIVE: "wwInstructionPopupActive",
    INSTRUCTION_DURATION: "wwInstructionPopupDuration",
    INSTRUCTION_TEXT: "wwInstructionPopupText",
    INSTRUCTION_GIF: "wwInstructionPopupGif",

    // Text-to-Speech
    TTS_ENABLED: "wwTtsEnabled",
    TTS_VOICE: "wwTtsVoice",
    TTS_VOLUME: "wwTtsVolume",
    TTS_RATE: "wwTtsRate",
    TTS_READ_WORDS: "wwTtsReadWords",
    TTS_ROUND_START_ENABLED: "wwTtsRoundStartEnabled",
    TTS_ROUND_START_TEXTS: "wwTtsRoundStartTexts",
    TTS_GAME_WON_ENABLED: "wwTtsGameWonEnabled",
    TTS_GAME_WON_TEXTS: "wwTtsGameWonTexts",
    TTS_GAMEPLAY_ENABLED: "wwTtsGameplayEnabled",
    TTS_GAMEPLAY_INTERVAL: "wwTtsGameplayInterval",
    TTS_GAMEPLAY_TEXTS: "wwTtsGameplayTexts",

    // Statistics
    GAMES_PLAYED: "wwGamesPlayed",
    GAMES_WON: "wwGamesWon",
    CURRENT_STREAK: "wwCurrentStreak",
    MAX_STREAK: "wwMaxStreak",

    // Profile
    PROFILE_IMAGE: "wwProfileImage",
    PROFILE_USERNAME: "wwProfileUsername",
    // Display
    DARK_MODE: "wwDarkMode",
    // Game integrations
    HINT_GIFT_NAME: "wwHintGiftName",
    // Leaderboard
    LEADERBOARD: "wwGameLeaderboard"
};

// --- Generic helpers ---
function saveItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getItem(key, defaultValue = null) {
    const val = localStorage.getItem(key);
    return val !== null ? JSON.parse(val) : defaultValue;
}

function removeItem(key) {
    localStorage.removeItem(key);
}

function clearAllStorage() {
    localStorage.clear();
}

// --- Settings ---
function saveLanguage(lang) { saveItem(STORAGE_KEYS.LANGUAGE, lang); }
function getLanguage() { return getItem(STORAGE_KEYS.LANGUAGE, "en"); }

function savePlayMode(mode) { saveItem(STORAGE_KEYS.PLAY_MODE, mode); }
function getPlayMode() { return getItem(STORAGE_KEYS.PLAY_MODE, "tiktok"); }

function saveWordLength(len) { saveItem(STORAGE_KEYS.WORD_LENGTH, len); }
function getWordLength() { return getItem(STORAGE_KEYS.WORD_LENGTH, 5); }

function saveRowCount(rows) { saveItem(STORAGE_KEYS.ROW_COUNT, rows); }
function getRowCount() { return getItem(STORAGE_KEYS.ROW_COUNT, 6); }

function saveBoardWidth(width) { saveItem(STORAGE_KEYS.BOARD_WIDTH, width); }
function getBoardWidth() { return getItem(STORAGE_KEYS.BOARD_WIDTH, 350); }

function saveKeyboardVisibilityOff(val) { saveItem(STORAGE_KEYS.KEYBOARD_VISIBILITY_OFF, val); }
function getKeyboardVisibilityOff() { return getItem(STORAGE_KEYS.KEYBOARD_VISIBILITY_OFF, false); }

function saveStreakVisibility(val) { saveItem(STORAGE_KEYS.STREAK_VISIBILITY, val); }
function getStreakVisibility() { return getItem(STORAGE_KEYS.STREAK_VISIBILITY, true); }

function saveVisibleRows(rows) { saveItem(STORAGE_KEYS.VISIBLE_ROWS, rows); }
function getVisibleRows() { return getItem(STORAGE_KEYS.VISIBLE_ROWS, 5); }

// --- Simulation ---
function saveSimulateGuesses(val) { saveItem(STORAGE_KEYS.SIMULATE_GUESSES, val); }
function getSimulateGuesses() { return getItem(STORAGE_KEYS.SIMULATE_GUESSES, false); }

function saveSimulateGroupGuesses(val) { saveItem(STORAGE_KEYS.SIMULATE_GROUP_GUESSES, val); }
function getSimulateGroupGuesses() { return getItem(STORAGE_KEYS.SIMULATE_GROUP_GUESSES, false); }

function saveSimulateGroupLoss(val) { saveItem(STORAGE_KEYS.SIMULATE_GROUP_LOSS, val); }
function getSimulateGroupLoss() { return getItem(STORAGE_KEYS.SIMULATE_GROUP_LOSS, false); }

function saveStackHeight(px) { saveItem(STORAGE_KEYS.STACK_HEIGHT, px); }
function getStackHeight() { return getItem(STORAGE_KEYS.STACK_HEIGHT, 220); }

// --- Winning popup ---
function saveWinningSoundUrl(url) { saveItem(STORAGE_KEYS.WINNING_SOUND_URL, url); }
function getWinningSoundUrl() { return getItem(STORAGE_KEYS.WINNING_SOUND_URL, ""); }

function saveWinningModalDuration(sec) { saveItem(STORAGE_KEYS.WINNING_MODAL_DURATION, sec); }
function getWinningModalDuration() { return getItem(STORAGE_KEYS.WINNING_MODAL_DURATION, 5); }

// --- Instruction popup ---
function saveInstructionActive(val) { saveItem(STORAGE_KEYS.INSTRUCTION_ACTIVE, val); }
function getInstructionActive() { return getItem(STORAGE_KEYS.INSTRUCTION_ACTIVE, false); }

function saveInstructionDuration(sec) { saveItem(STORAGE_KEYS.INSTRUCTION_DURATION, sec); }
function getInstructionDuration() { return getItem(STORAGE_KEYS.INSTRUCTION_DURATION, 3); }

function saveInstructionText(txt) { saveItem(STORAGE_KEYS.INSTRUCTION_TEXT, txt); }
function getInstructionText() { return getItem(STORAGE_KEYS.INSTRUCTION_TEXT, "Guess the word to win!"); }

function saveInstructionGif(url) { saveItem(STORAGE_KEYS.INSTRUCTION_GIF, url); }
function getInstructionGif() { return getItem(STORAGE_KEYS.INSTRUCTION_GIF, ""); }

// --- TTS ---
function saveTtsEnabled(val) { saveItem(STORAGE_KEYS.TTS_ENABLED, val); }
function getTtsEnabled() { return getItem(STORAGE_KEYS.TTS_ENABLED, false); }

function saveTtsVoice(voice) { saveItem(STORAGE_KEYS.TTS_VOICE, voice); }
function getTtsVoice() { return getItem(STORAGE_KEYS.TTS_VOICE, ""); }

function saveTtsVolume(vol) { saveItem(STORAGE_KEYS.TTS_VOLUME, vol); }
function getTtsVolume() { return getItem(STORAGE_KEYS.TTS_VOLUME, 50); }

function saveTtsRate(rate) { saveItem(STORAGE_KEYS.TTS_RATE, rate); }
function getTtsRate() { return getItem(STORAGE_KEYS.TTS_RATE, 10); }

function saveTtsReadWords(val) { saveItem(STORAGE_KEYS.TTS_READ_WORDS, val); }
function getTtsReadWords() { return getItem(STORAGE_KEYS.TTS_READ_WORDS, false); }

function saveTtsRoundStartEnabled(val) { saveItem(STORAGE_KEYS.TTS_ROUND_START_ENABLED, val); }
function getTtsRoundStartEnabled() { return getItem(STORAGE_KEYS.TTS_ROUND_START_ENABLED, false); }

function saveTtsRoundStartTexts(txts) { saveItem(STORAGE_KEYS.TTS_ROUND_START_TEXTS, txts); }
function getTtsRoundStartTexts() { return getItem(STORAGE_KEYS.TTS_ROUND_START_TEXTS, "Welcome to Wordle!"); }

function saveTtsGameWonEnabled(val) { saveItem(STORAGE_KEYS.TTS_GAME_WON_ENABLED, val); }
function getTtsGameWonEnabled() { return getItem(STORAGE_KEYS.TTS_GAME_WON_ENABLED, false); }

function saveTtsGameWonTexts(txts) { saveItem(STORAGE_KEYS.TTS_GAME_WON_TEXTS, txts); }
function getTtsGameWonTexts() { return getItem(STORAGE_KEYS.TTS_GAME_WON_TEXTS, "Congratulations!"); }

function saveTtsGameplayEnabled(val) { saveItem(STORAGE_KEYS.TTS_GAMEPLAY_ENABLED, val); }
function getTtsGameplayEnabled() { return getItem(STORAGE_KEYS.TTS_GAMEPLAY_ENABLED, false); }

function saveTtsGameplayInterval(sec) { saveItem(STORAGE_KEYS.TTS_GAMEPLAY_INTERVAL, sec); }
function getTtsGameplayInterval() { return getItem(STORAGE_KEYS.TTS_GAMEPLAY_INTERVAL, 30); }

function saveTtsGameplayTexts(txts) { saveItem(STORAGE_KEYS.TTS_GAMEPLAY_TEXTS, txts); }
function getTtsGameplayTexts() { return getItem(STORAGE_KEYS.TTS_GAMEPLAY_TEXTS, "Keep going!"); }

// --- Statistics ---
function saveGamesPlayed(val) { saveItem(STORAGE_KEYS.GAMES_PLAYED, val); }
function getGamesPlayed() { return getItem(STORAGE_KEYS.GAMES_PLAYED, 0); }

function saveGamesWon(val) { saveItem(STORAGE_KEYS.GAMES_WON, val); }
function getGamesWon() { return getItem(STORAGE_KEYS.GAMES_WON, 0); }

function saveCurrentStreak(val) { saveItem(STORAGE_KEYS.CURRENT_STREAK, val); }
function getCurrentStreak() { return getItem(STORAGE_KEYS.CURRENT_STREAK, 0); }

function saveMaxStreak(val) { saveItem(STORAGE_KEYS.MAX_STREAK, val); }
function getMaxStreak() { return getItem(STORAGE_KEYS.MAX_STREAK, 0); }

function clearStatistics() {
    removeItem(STORAGE_KEYS.GAMES_PLAYED);
    removeItem(STORAGE_KEYS.GAMES_WON);
    removeItem(STORAGE_KEYS.CURRENT_STREAK);
    removeItem(STORAGE_KEYS.MAX_STREAK);
}

// --- Profile ---
function saveProfileImage(url) { saveItem(STORAGE_KEYS.PROFILE_IMAGE, url); }
function getProfileImage() { return getItem(STORAGE_KEYS.PROFILE_IMAGE, ""); }

function saveProfileUsername(name) { saveItem(STORAGE_KEYS.PROFILE_USERNAME, name); }
function getProfileUsername() { return getItem(STORAGE_KEYS.PROFILE_USERNAME, "Host"); }

// --- Display ---
function saveDarkModeEnabled(val) { saveItem(STORAGE_KEYS.DARK_MODE, !!val); }
function getDarkModeEnabled() { return getItem(STORAGE_KEYS.DARK_MODE, false); }

// --- Game integrations ---
function saveHintGiftName(value) { saveItem(STORAGE_KEYS.HINT_GIFT_NAME, String(value || "")); }
function getHintGiftName() { return getItem(STORAGE_KEYS.HINT_GIFT_NAME, ""); }
