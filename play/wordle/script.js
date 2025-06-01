// script.js
// Word lists for different lengths
const wordLists = {
    4: ["book", "tree", "fish", "bird", "star", "moon", "fire", "wind", "rain", "snow"],
    5: ["apple", "beach", "cloud", "dream", "flame", "globe", "heart", "juice", "knife", "lemon"],
    6: ["bottle", "candle", "dragon", "flower", "garden", "hammer", "island", "jungle", "knight", "laptop"],
    7: ["bicycle", "chicken", "diamond", "elephant", "freedom", "giraffe", "holiday", "journey", "kitchen", "library"],
    8: ["backpack", "computer", "dolphin", "elephant", "football", "guitar", "hospital", "jewelry", "keyboard", "language"],
    9: ["beautiful", "chocolate", "dangerous", "education", "fantastic", "garden", "happiness", "important", "knowledge", "lifestyle"],
    10: ["adventures", "breakfast", "challenger", "determined", "experience", "friendship", "generation", "happiness", "imagination", "journey"]
};

// Map for auto board widths
const autoBoardWidths = {
    4: 350,
    5: 350,
    6: 350,
    7: 410,
    8: 460,
    9: 500,
    10: 560
};

// Game state
let targetWord = '';
let currentRow = 0;
let currentTile = 0;
let isGameOver = false;
let maxRows = 5; // Default number of rows
let wordLength = 5; // Default word length
let boardWidth = 350; // Default board width
let guessFlow = 'down'; // Default guess flow
let simulateGuessesInterval = null;
let simulateGuessesActive = false;
let simulateTyping = false;
let groupGuessBarActive = false;
let groupGuessStacks = {};
let groupGuessInterval = null;
let lastBarOrder = [];
let lastBarRects = {};
let requiredGuesses = 5; // Default value for required agreed guesses
let stackHeight = 220; // Default stack height in pixels
let playingUsers = [];
let currentGuessingUser = null; // Track the current user making a guess
let singlePlayerGuessCount = 0; // Track guesses in single player simulation
let groupModeGuessCount = 0; // Track guesses in group mode
let winningSoundUrl = 'https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-epic-stock-media/esm_chill_victory_sound_fx_arcade_synth_musical_chord_bling_electronic_casino_kids_mobile_positive_achievement_score.mp3'; // URL for winning sound
let winningModalDuration = 5; // Duration in seconds for winning modal
let instructionPopupActive = true; // Whether to show instruction popup at round start
let instructionPopupDuration = 3; // Duration in seconds for instruction popup
let instructionPopupText = 'Guess the word to win!\nThis is wordle with endless guesses.\nThere are single player and group modes.'; // Instruction text
let instructionPopupGif = 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHBlcWdrYjFvYW1hZWt3ZGg2eGw1YWlmZm80NHZ4ZWZ4OHpub3RxdyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/62HRHz7zZZYThhTwEI/giphy.gif'; // URL for instruction GIF

// TTS Settings
let ttsEnabled = false; // Whether TTS is enabled
let ttsVoice = ''; // Selected voice name
let ttsVolume = 50; // Volume (0-100)
let ttsRate = 10; // Speech rate (5-12, where 10 = 1.0 rate)
let ttsRoundStartEnabled = false; // Whether to announce round start
let ttsRoundStartTexts = ['Welcome to Wordle! Let\'s begin.', 'New round starting! Good luck!', 'Time to guess the word!']; // Round start messages
let ttsReadWords = false; // Whether to read every word entered
let ttsGameWonEnabled = false; // Whether to announce game won
let ttsGameWonTexts = ['Congratulations! You won!', 'Excellent work! Victory achieved!', 'Well done! You guessed it!']; // Game won messages
let ttsGameplayEnabled = false; // Whether to announce during gameplay
let ttsGameplayInterval = 30; // Interval in seconds for gameplay announcements
let ttsGameplayTexts = ['Keep going! You can do it!', 'Think carefully about your next guess.', 'You\'re doing great!']; // Gameplay messages
let ttsGameplayIntervalId = null; // Store interval ID for gameplay announcements
let availableVoices = []; // Store available voices

// TikTok Integration Settings
let tiktokPlayMode = 'individual'; // 'individual' or 'group'
let tiktokGroupStacks = {}; // Store group guesses from TikTok users

// DOM elements
const board = document.getElementById('board');
const messageDisplay = document.getElementById('message');
const newGameBtn = document.getElementById('new-game-btn');

// Initialize the game
function initializeGame() {
    // Stop any ongoing TTS announcements
    stopGameplayAnnouncements();
    
    // Clear the board
    board.innerHTML = '';
    
    // Clear the playing users array for the new game
    playingUsers = [];
    
    // Clear the current guessing user
    currentGuessingUser = null;
    
    // Reset guess counters
    singlePlayerGuessCount = 0;
    groupModeGuessCount = 0;
    
    // Update CSS variables
    document.documentElement.style.setProperty('--word-length', wordLength);
    document.getElementById('game-container').style.maxWidth = `${boardWidth}px`;
    
    // Create the game board with maxRows + 1 (for answer row)
    for (let i = 0; i < maxRows + 1; i++) {
        const row = document.createElement('div');
        row.classList.add('row');
        row.setAttribute('data-row', i);
        
        // Add letter tiles
        for (let j = 0; j < wordLength; j++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.setAttribute('data-row', i);
            tile.setAttribute('data-col', j);
            row.appendChild(tile);
        }
        board.appendChild(row);
    }

    // Set currentRow to 1 (up) or 0 (down)
    currentRow = guessFlow === 'up' ? 1 : 0;
    currentTile = 0;
    isGameOver = false;
    messageDisplay.textContent = '';
    
    // Choose a random word from the current word length list
    targetWord = wordLists[wordLength][Math.floor(Math.random() * wordLists[wordLength].length)];
    console.log('Target word:', targetWord); // For debugging
    
    // Show instruction popup if enabled
    if (instructionPopupActive) {
        setTimeout(() => {
            showInstructionPopup();
        }, 500); // Small delay to let the game board render
    }
    
    // Start TTS round announcement and gameplay announcements
    setTimeout(() => {
        speakRoundStart();
        if (ttsEnabled && ttsGameplayEnabled) {
            startGameplayAnnouncements();
        }
    }, 1000); // Delay to let instruction popup show first
    
    // Reset keyboard colors
    document.querySelectorAll('.key').forEach(key => {
        key.className = 'key';
        if (key.getAttribute('data-key') === 'enter' || key.getAttribute('data-key') === 'backspace') {
            key.classList.add('key-wide');
        }
    });
}

// Handle keyboard input
function handleKeyPress(key) {
    if (isGameOver) return;
    
    if (key === 'enter') {
        submitGuess();
    } else if (key === 'backspace') {
        deleteLetter();
    } else if (/^[a-z]$/.test(key) && currentTile < wordLength) {
        addLetter(key);
    }
}

// Add a letter to the current tile
function addLetter(letter) {
    if (currentTile < wordLength) {
        const tile = document.querySelector(`.tile[data-row="${currentRow}"][data-col="${currentTile}"]`);
        if (tile) {
            tile.textContent = letter.toUpperCase();
            // Show profile image when first letter is added
            if (currentTile === 0) {
                const row = document.querySelector(`.row[data-row="${currentRow}"]`);
                // Get the correct user image
                const userImage = getUserProfileImage(currentGuessingUser ? currentGuessingUser.username : null);
                // Ensure the profile image tile exists with the correct image
                ensureProfileImageTile(row, userImage);
                const imgTile = row.querySelector('.profile-img-tile');
                const img = imgTile ? imgTile.querySelector('.profile-img-in-tile') : null;
                if (img) {
                    img.style.display = 'block';
                }
            }
            // Ensure the letter is visible before adding animation
            requestAnimationFrame(() => {
                tile.classList.add('bounce');
                setTimeout(() => {
                    tile.classList.remove('bounce');
                }, 300);
            });
            currentTile++;
        }
    }
}

// Delete the last letter
function deleteLetter() {
    if (currentTile > 0) {
        currentTile--;
        const tile = document.querySelector(`.tile[data-row="${currentRow}"][data-col="${currentTile}"]`);
        if (tile) {
            tile.textContent = '';
            // Remove any state classes when deleting
            tile.classList.remove('correct', 'present', 'absent');
            
            // Hide profile image when all letters are deleted
            if (currentTile === 0) {
                const row = document.querySelector(`.row[data-row="${currentRow}"]`);
                const imgTile = row.querySelector('.profile-img-tile');
                const img = imgTile ? imgTile.querySelector('.profile-img-in-tile') : null;
                if (img) {
                    img.style.display = 'none';
                }
            }
        }
    }
}

// Submit the current guess
function submitGuess() {
    if (currentTile < wordLength) {
        showMessage("Not enough letters");
        shakeRow(currentRow);
        clearCurrentRow();
        return;
    }
    
    // Get the current guess
    let guess = '';
    const currentRowElement = document.querySelector(`.row[data-row="${currentRow}"]`);
    if (!currentRowElement) return;

    for (let i = 0; i < wordLength; i++) {
        // Account for profile image tile - if present, skip it
        const hasProfileTile = currentRowElement.firstChild && currentRowElement.firstChild.classList.contains('profile-img-tile');
        const tileIndex = hasProfileTile ? i + 1 : i;
        const tile = currentRowElement.children[tileIndex];
        
        if (!tile || !tile.textContent) {
            showMessage("Invalid guess");
            shakeRow(currentRow);
            clearCurrentRow();
            return;
        }
        guess += tile.textContent.toLowerCase();
    }
    
    // Speak the word if TTS is enabled for reading words
    speakWord(guess);
    
    // Check the guess against the target word
    const result = checkGuess(guess);
    
    // Update the tiles with the results
    animateResults(result);
    
    // Check if the game is won
    if (guess === targetWord) {
        if (guessFlow === 'up') {
            moveToAnswerRowUp();
        } else {
            moveToAnswerRow();
        }
        showMessage("Wonderful!");
        isGameOver = true;
        
        // Stop gameplay announcements and speak victory message
        stopGameplayAnnouncements();
        setTimeout(() => {
            speakGameWon();
        }, 500); // Small delay after "Wonderful!" message
        
        showWinningModal(targetWord);
    } else {
        // Move to the next row
        if (guessFlow === 'down') {
            // Add profile image to the current row before moving to next
            addProfileImageToRow(currentRow);
            currentRow++;
            if (currentRow >= maxRows) {
                shiftRowsDown();
                currentRow = maxRows - 1;
            }
        } else {
            // For up flow, add profile image to the current row before shifting
            addProfileImageToRow(currentRow);
            shiftRowsDownUpFlowV2();
            clearCurrentRow();
        }
        currentTile = 0;
    }
}

// Clear the current row
function clearCurrentRow() {
    const currentRowElement = document.querySelector(`.row[data-row="${currentRow}"]`);
    if (!currentRowElement) return;
    removeProfileImageTile(currentRowElement);
    for (let i = 0; i < wordLength; i++) {
        const tile = currentRowElement.children[currentRowElement.children.length > wordLength ? i + 1 : i];
        if (tile) {
            tile.textContent = '';
            tile.className = 'tile';
        }
    }
    currentTile = 0;
}

// Move the correct answer to the answer row (bottom for down, top for up)
function moveToAnswerRow() {
    const answerRowIndex = guessFlow === 'up' ? 0 : maxRows;
    const answerRow = document.querySelector(`.row[data-row="${answerRowIndex}"]`);
    const currentRowElement = document.querySelector(`.row[data-row="${currentRow}"]`);
    
    for (let i = 0; i < wordLength; i++) {
        // Account for profile image tile in current row - if present, skip it
        const hasProfileTile = currentRowElement.firstChild && currentRowElement.firstChild.classList.contains('profile-img-tile');
        const currentTileIndex = hasProfileTile ? i + 1 : i;
        const currentTile = currentRowElement.children[currentTileIndex];
        
        // Answer row doesn't have profile tiles, so use direct index
        const answerTile = answerRow.children[i];
        
        answerTile.textContent = currentTile.textContent;
        answerTile.className = currentTile.className;
        answerTile.classList.add('fade-in');
    }
    currentRowElement.classList.add('fade-out');
}

// For guessFlow 'up', shift all guess rows down and fade out the bottom row (row maxRows)
function shiftRowsDownUpFlow() {
    const bottomRow = document.querySelector(`.row[data-row="${maxRows}"]`);
    if (!bottomRow) return;
    bottomRow.classList.add('fade-out');
    setTimeout(() => {
        for (let i = maxRows; i > 1; i--) {
            const aboveRow = document.querySelector(`.row[data-row="${i - 1}"]`);
            const thisRow = document.querySelector(`.row[data-row="${i}"]`);
            if (!aboveRow || !thisRow) continue;
            for (let j = 0; j < wordLength; j++) {
                const aboveTile = aboveRow.children[j];
                const thisTile = thisRow.children[j];
                thisTile.textContent = aboveTile.textContent;
                thisTile.className = 'tile';
                if (aboveTile.classList.contains('correct')) thisTile.classList.add('correct');
                if (aboveTile.classList.contains('present')) thisTile.classList.add('present');
                if (aboveTile.classList.contains('absent')) thisTile.classList.add('absent');
            }
        }
        // Clear the second row (row 1)
        const secondRow = document.querySelector(`.row[data-row="1"]`);
        if (secondRow) {
            for (let j = 0; j < wordLength; j++) {
                const tile = secondRow.children[j];
                if (tile) {
                    tile.textContent = '';
                    tile.className = 'tile';
                }
            }
        }
        bottomRow.classList.remove('fade-out');
    }, 150);
}

// Check the guess against the target word
function checkGuess(guess) {
    const result = Array(wordLength).fill('absent');
    const targetLetters = targetWord.split('');
    
    // First pass: Mark correct letters
    for (let i = 0; i < wordLength; i++) {
        if (guess[i] === targetWord[i]) {
            result[i] = 'correct';
            targetLetters[i] = null; // Mark as used
        }
    }
    
    // Second pass: Mark present letters
    for (let i = 0; i < wordLength; i++) {
        if (result[i] === 'absent') {
            const index = targetLetters.indexOf(guess[i]);
            if (index !== -1) {
                result[i] = 'present';
                targetLetters[index] = null; // Mark as used
            }
        }
    }
    
    return result;
}

// Animate the results
function animateResults(result) {
    const currentRowElement = document.querySelector(`.row[data-row="${currentRow}"]`);
    if (!currentRowElement) return;

    for (let i = 0; i < wordLength; i++) {
        // Account for profile image tile - if present, skip it
        const hasProfileTile = currentRowElement.firstChild && currentRowElement.firstChild.classList.contains('profile-img-tile');
        const tileIndex = hasProfileTile ? i + 1 : i;
        const tile = currentRowElement.children[tileIndex];
        
        if (!tile) continue;

        const letter = tile.textContent.toLowerCase();
        const key = document.querySelector(`.key[data-key="${letter}"]`);
        
        // Apply result immediately
        tile.classList.add(result[i]);
        
        // Update the keyboard
        if (key) {
            // Only upgrade the key status (absent -> present -> correct)
            if (result[i] === 'correct') {
                key.className = 'key correct';
            } else if (result[i] === 'present' && !key.classList.contains('correct')) {
                key.className = 'key present';
            } else if (!key.classList.contains('correct') && !key.classList.contains('present')) {
                key.className = 'key absent';
            }
        }
    }
}

// Show a message
function showMessage(message) {
    messageDisplay.textContent = message;
    setTimeout(() => {
        messageDisplay.textContent = '';
    }, 3000);
}

// Shake the current row
function shakeRow(row) {
    const tiles = document.querySelectorAll(`.tile[data-row="${row}"]`);
    tiles.forEach(tile => {
        tile.classList.add('shake');
        setTimeout(() => {
            tile.classList.remove('shake');
        }, 500);
    });
}

// Event listeners
document.addEventListener('keydown', (e) => {
    // Check if settings panel is open
    const settingsPanel = document.getElementById('settings-panel');
    if (settingsPanel && settingsPanel.classList.contains('open')) {
        return; // Don't process game keys when settings panel is open
    }
    
    // Check if any input field is focused
    const activeElement = document.activeElement;
    if (activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.tagName === 'SELECT' ||
        activeElement.isContentEditable
    )) {
        return; // Don't process game keys when input fields are focused
    }
    
    const key = e.key.toLowerCase();
    if (key === 'enter' || key === 'backspace' || /^[a-z]$/.test(key)) {
        handleKeyPress(key);
    }
});

document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', () => {
        const keyValue = key.getAttribute('data-key');
        handleKeyPress(keyValue);
    });
});

newGameBtn.addEventListener('click', initializeGame);

// Add event listener for winning modal
document.addEventListener('click', (e) => {
    const overlay = document.getElementById('winning-overlay');
    if (overlay && e.target === overlay) {
        overlay.classList.remove('show');
        setTimeout(() => {
            initializeGame();
        }, 300);
    }
});

// Add escape key listener for winning modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const overlay = document.getElementById('winning-overlay');
        if (overlay && overlay.classList.contains('show')) {
            overlay.classList.remove('show');
            setTimeout(() => {
                initializeGame();
            }, 300);
        }
    }
});

// Initialize the game when the page loads
initializeGame();

// Settings Panel Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Wait for settings panel to be loaded
    const checkSettingsPanel = setInterval(() => {
        const settingsPanel = document.getElementById('settings-panel');
        const settingsToggle = document.getElementById('settings-toggle');
        const closeSettings = document.getElementById('close-settings');
        const wordLengthSelect = document.getElementById('word-length');
        
        if (settingsPanel && settingsToggle && closeSettings && wordLengthSelect) {
            clearInterval(checkSettingsPanel);
            initializeSettingsPanel();
        }
    }, 100);
});

function initializeSettingsPanel() {
    const settingsPanel = document.getElementById('settings-panel');
    const settingsToggle = document.getElementById('settings-toggle');
    const closeSettings = document.getElementById('close-settings');
    const sectionHeaders = document.querySelectorAll('.settings-section-header');
    const wordLengthSelect = document.getElementById('word-length');
    const rowCountInput = document.getElementById('row-count');
    const decreaseRowsBtn = document.getElementById('decrease-rows');
    const increaseRowsBtn = document.getElementById('increase-rows');
    const boardWidthInput = document.getElementById('board-width');
    const decreaseWidthBtn = document.getElementById('decrease-width');
    const increaseWidthBtn = document.getElementById('increase-width');
    const guessFlowSelect = document.getElementById('guess-flow');
    const requiredGuessesInput = document.getElementById('required-guesses');
    const decreaseGuessesBtn = document.getElementById('decrease-guesses');
    const increaseGuessesBtn = document.getElementById('increase-guesses');
    const stackHeightInput = document.getElementById('stack-height');
    const decreaseHeightBtn = document.getElementById('decrease-height');
    const increaseHeightBtn = document.getElementById('increase-height');

    // Toggle settings panel
    settingsToggle.addEventListener('click', () => {
        let turnedOff = false;
        if (simulateGuessesActive) {
            simulateGuessesStop();
            const simulateGuessesCheckbox = document.getElementById('simulate-guesses');
            if (simulateGuessesCheckbox) simulateGuessesCheckbox.checked = false;
            turnedOff = true;
        }
        if (groupGuessBarActive) {
            stopGroupGuessBar();
            const groupGuessBarCheckbox = document.getElementById('group-guess-bar');
            if (groupGuessBarCheckbox) groupGuessBarCheckbox.checked = false;
            turnedOff = true;
        }
        if (turnedOff) unsetCogSimulateActive();
        settingsPanel.classList.toggle('open');
    });

    // Close settings panel
    closeSettings.addEventListener('click', () => {
        settingsPanel.classList.remove('open');
    });

    // Initialize all sections as collapsed
    sectionHeaders.forEach(header => {
        header.classList.add('collapsed');
        
        // Toggle section content
        header.addEventListener('click', () => {
            header.classList.toggle('collapsed');
        });
    });

    // Handle word length change
    wordLengthSelect.addEventListener('change', () => {
        wordLength = parseInt(wordLengthSelect.value);
        // Set board width automatically for 7-10 letters
        if (autoBoardWidths[wordLength]) {
            boardWidth = autoBoardWidths[wordLength];
            boardWidthInput.value = boardWidth;
            document.getElementById('game-container').style.maxWidth = `${boardWidth}px`;
        }
        initializeGame();
    });

    // Handle row count changes
    function updateRowCount(newCount) {
        if (newCount >= 3) {
            maxRows = newCount;
            rowCountInput.value = newCount;
            initializeGame();
        }
    }

    rowCountInput.addEventListener('change', () => {
        const newCount = parseInt(rowCountInput.value);
        updateRowCount(newCount);
    });

    decreaseRowsBtn.addEventListener('click', () => {
        const newCount = parseInt(rowCountInput.value) - 1;
        updateRowCount(newCount);
    });

    increaseRowsBtn.addEventListener('click', () => {
        const newCount = parseInt(rowCountInput.value) + 1;
        updateRowCount(newCount);
    });

    // Handle board width changes
    function updateBoardWidth(newWidth) {
        if (newWidth >= 250) {
            boardWidth = newWidth;
            boardWidthInput.value = newWidth;
            document.getElementById('game-container').style.maxWidth = `${newWidth}px`;
        }
    }

    boardWidthInput.addEventListener('change', () => {
        const newWidth = parseInt(boardWidthInput.value);
        updateBoardWidth(newWidth);
    });

    decreaseWidthBtn.addEventListener('click', () => {
        const newWidth = parseInt(boardWidthInput.value) - 10;
        updateBoardWidth(newWidth);
    });

    increaseWidthBtn.addEventListener('click', () => {
        const newWidth = parseInt(boardWidthInput.value) + 10;
        updateBoardWidth(newWidth);
    });

    // Handle guess flow change
    guessFlowSelect.addEventListener('change', () => {
        guessFlow = guessFlowSelect.value;
        initializeGame();
    });

    // Handle required guesses changes
    function updateRequiredGuesses(newCount) {
        if (newCount >= 3 && newCount <= 7) {
            requiredGuesses = newCount;
            requiredGuessesInput.value = newCount;
            // Automated stack height scale
            const heightScale = {3: 120, 4: 160, 5: 220, 6: 248, 7: 288};
            stackHeight = heightScale[newCount] || 220;
            stackHeightInput.value = stackHeight;
            const barChart = document.getElementById('group-guess-bar-chart');
            if (barChart) {
                barChart.style.height = `${stackHeight}px`;
                barChart.style.minHeight = `${stackHeight}px`;
            }
        }
    }

    requiredGuessesInput.addEventListener('change', () => {
        const newCount = parseInt(requiredGuessesInput.value);
        updateRequiredGuesses(newCount);
    });

    decreaseGuessesBtn.addEventListener('click', () => {
        const newCount = parseInt(requiredGuessesInput.value) - 1;
        updateRequiredGuesses(newCount);
    });

    increaseGuessesBtn.addEventListener('click', () => {
        const newCount = parseInt(requiredGuessesInput.value) + 1;
        updateRequiredGuesses(newCount);
    });

    // Disable manual editing of stack height
    stackHeightInput.readOnly = true;
    decreaseHeightBtn.disabled = true;
    increaseHeightBtn.disabled = true;

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!settingsPanel.contains(e.target) && 
            !settingsToggle.contains(e.target) && 
            settingsPanel.classList.contains('open')) {
            settingsPanel.classList.remove('open');
        }
    });

    // Initialize profile settings
    initializeProfileSettings();

    // Initialize winning popup settings
    initializeWinningPopupSettings();

    // Initialize instruction popup settings
    initializeInstructionPopupSettings();

    // Initialize TTS settings
    initializeTTSSettings();

    // Initialize TikTok settings
    initializeTikTokSettings();

    // After other settings panel logic:
    const simulateGuessesCheckbox = document.getElementById('simulate-guesses');
    if (simulateGuessesCheckbox) {
        simulateGuessesCheckbox.addEventListener('change', function() {
            if (this.checked) {
                simulateGuessesStart();
            } else {
                simulateGuessesStop();
            }
        });
    }

    // Hide/show keyboard logic
    const hideKeyboardCheckbox = document.getElementById('hide-keyboard');
    const keyboard = document.querySelector('.keyboard');
    if (hideKeyboardCheckbox && keyboard) {
        hideKeyboardCheckbox.addEventListener('change', function() {
            keyboard.style.visibility = this.checked ? 'hidden' : 'visible';
        });
        // On load, respect the checkbox state
        keyboard.style.visibility = hideKeyboardCheckbox.checked ? 'hidden' : 'visible';
    }

    // Keyboard visibility (visibility: hidden)
    const keyboardVisibilityOffCheckbox = document.getElementById('keyboard-visibility-off');
    if (keyboardVisibilityOffCheckbox && keyboard) {
        keyboardVisibilityOffCheckbox.addEventListener('change', function() {
            keyboard.style.visibility = this.checked ? 'hidden' : 'visible';
        });
        // On load, respect the checkbox state
        keyboard.style.visibility = keyboardVisibilityOffCheckbox.checked ? 'hidden' : 'visible';
    }

    // Group guess bar chart logic
    const groupGuessBarCheckbox = document.getElementById('group-guess-bar');
    if (groupGuessBarCheckbox) {
        groupGuessBarCheckbox.addEventListener('change', function() {
            if (this.checked) {
                startGroupGuessBar();
            } else {
                stopGroupGuessBar();
            }
        });
    }
}

// Profile Image Functions
function initializeProfileSettings() {
    const profileUpload = document.getElementById('profile-upload');
    const profilePreview = document.getElementById('profile-preview-img');
    const removeProfile = document.getElementById('remove-profile');

    // Load saved profile image if it exists
    const savedProfile = localStorage.getItem('wordleProfileImage');
    if (savedProfile) {
        profilePreview.src = savedProfile;
    }

    // Handle file upload
    profileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check if file is an image
            if (!file.type.startsWith('image/')) {
                showMessage('Please upload an image file');
                return;
            }

            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                showMessage('Image size should be less than 2MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const imageUrl = event.target.result;
                profilePreview.src = imageUrl;
                localStorage.setItem('wordleProfileImage', imageUrl);
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle remove profile
    removeProfile.addEventListener('click', () => {
        profilePreview.src = 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg';
        localStorage.removeItem('wordleProfileImage');
    });
}

//How profile image tile is added to the row
function ensureProfileImageTile(row, imgSrc) {
    if (!row) return;
    // If the first child is already a profile image tile, update the image source
    if (row.firstChild && row.firstChild.classList.contains('profile-img-tile')) {
        const existingImg = row.firstChild.querySelector('.profile-img-in-tile');
        if (existingImg) {
            existingImg.src = imgSrc;
        }
        return;
    }
    // Otherwise, insert a new profile image tile at the start
    const imgTile = document.createElement('div');
    imgTile.className = 'tile profile-img-tile';
    const img = document.createElement('img');
    img.className = 'profile-img-in-tile';
    img.src = imgSrc;
    img.alt = 'Profile';
    imgTile.appendChild(img);
    row.insertBefore(imgTile, row.firstChild);
}

//How profile image tile is removed from the row
function removeProfileImageTile(row) {
    if (!row) return;
    if (row.firstChild && row.firstChild.classList.contains('profile-img-tile')) {
        row.removeChild(row.firstChild);
    }
}

//How profile image tile is added to the row
function addProfileImageToRow(rowIndex) {
    const row = document.querySelector(`.row[data-row="${rowIndex}"]`);
    // Use the current guessing user's image, or fallback to logged-in user's image
    const userImage = getUserProfileImage(currentGuessingUser ? currentGuessingUser.username : null);
    ensureProfileImageTile(row, userImage);
}

//How rows are moved during gameplay if flow is up
function shiftRowsDownUpFlowV2() {
    for (let i = maxRows; i > 1; i--) {
        const aboveRow = document.querySelector(`.row[data-row="${i - 1}"]`);
        const thisRow = document.querySelector(`.row[data-row="${i}"]`);
        if (!aboveRow || !thisRow) continue;

        // Remove any profile image tile from destination row
        removeProfileImageTile(thisRow);
        // If the source row has a profile image tile, add one to the destination with the same src
        if (aboveRow.firstChild && aboveRow.firstChild.classList.contains('profile-img-tile')) {
            const aboveImg = aboveRow.firstChild.querySelector('img');
            const imgSrc = aboveImg ? aboveImg.src : 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg';
            ensureProfileImageTile(thisRow, imgSrc);
        }

        // Copy letter tiles (skip image tile if present)
        for (let j = 0; j < wordLength; j++) {
            const aboveTile = aboveRow.children[aboveRow.children.length > wordLength ? j + 1 : j];
            const thisTile = thisRow.children[thisRow.children.length > wordLength ? j + 1 : j];
            thisTile.textContent = aboveTile.textContent;
            thisTile.className = 'tile';
            if (aboveTile.classList.contains('correct')) thisTile.classList.add('correct');
            if (aboveTile.classList.contains('present')) thisTile.classList.add('present');
            if (aboveTile.classList.contains('absent')) thisTile.classList.add('absent');
        }
    }

    // Clear row 1 for the next guess
    const row1 = document.querySelector(`.row[data-row="1"]`);
    if (row1) {
        removeProfileImageTile(row1);
        for (let j = 0; j < wordLength; j++) {
            const tile = row1.children[row1.children.length > wordLength ? j + 1 : j];
            if (tile) {
                tile.textContent = '';
                tile.className = 'tile';
            }
        }
    }
}

//How rows are moved during gameplay if flow is down
function shiftRowsDown() {
    const topRow = document.querySelector(`.row[data-row="0"]`);
    if (!topRow) return;
    topRow.classList.add('fade-out');
    setTimeout(() => {
        for (let i = 0; i < maxRows - 1; i++) {
            const currentRow = document.querySelector(`.row[data-row="${i + 1}"]`);
            const nextRow = document.querySelector(`.row[data-row="${i}"]`);
            if (!currentRow || !nextRow) continue;

            // Remove any profile image tile from destination row
            removeProfileImageTile(nextRow);
            // If the source row has a profile image tile, add one to the destination with the same src
            if (currentRow.firstChild && currentRow.firstChild.classList.contains('profile-img-tile')) {
                const currentImg = currentRow.firstChild.querySelector('img');
                const imgSrc = currentImg ? currentImg.src : 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg';
                ensureProfileImageTile(nextRow, imgSrc);
            }

            // Copy letter tiles (skip image tile if present)
            for (let j = 0; j < wordLength; j++) {
                const currentTile = currentRow.children[currentRow.children.length > wordLength ? j + 1 : j];
                const nextTile = nextRow.children[nextRow.children.length > wordLength ? j + 1 : j];
                nextTile.textContent = currentTile.textContent;
                nextTile.className = 'tile';
                if (currentTile.classList.contains('correct')) nextTile.classList.add('correct');
                if (currentTile.classList.contains('present')) nextTile.classList.add('present');
                if (currentTile.classList.contains('absent')) nextTile.classList.add('absent');
            }
        }

        // Clear the bottom guess row
        const bottomGuessRow = document.querySelector(`.row[data-row="${maxRows - 1}"]`);
        if (bottomGuessRow) {
            removeProfileImageTile(bottomGuessRow);
            for (let j = 0; j < wordLength; j++) {
                const tile = bottomGuessRow.children[bottomGuessRow.children.length > wordLength ? j + 1 : j];
                if (tile) {
                    tile.textContent = '';
                    tile.className = 'tile';
                }
            }
        }
        topRow.classList.remove('fade-out');
    }, 150);
}

//How cog is set to active when simulate guesses is active
function setCogSimulateActive() {
    const cog = document.getElementById('settings-toggle');
    if (cog) cog.classList.add('simulate-active');
}

//How cog is set to inactive when simulate guesses is inactive
function unsetCogSimulateActive() {
    const cog = document.getElementById('settings-toggle');
    if (cog) cog.classList.remove('simulate-active');
}

//How simulate guesses is started
function simulateGuessesStart() {
    if (simulateGuessesInterval) return;
    simulateGuessesActive = true;
    const indicator = document.getElementById('simulate-indicator');
    if (indicator) indicator.style.display = 'block';
    setCogSimulateActive();
    simulateGuessesInterval = setInterval(() => {
        if (!simulateGuessesActive || isGameOver || simulateTyping) return;
        
        // Increment guess count
        singlePlayerGuessCount++;
        
        let guessWord;
        if (singlePlayerGuessCount >= 10) {
            // After 10 guesses, always guess the winning word
            guessWord = targetWord;
        } else {
            // Pick a random word that is NOT the target word
            const possibleWords = wordLists[wordLength].filter(w => w !== targetWord);
            if (possibleWords.length === 0) return;
            guessWord = possibleWords[Math.floor(Math.random() * possibleWords.length)];
        }
        
        // Simulate a random user
        const randomNumber = Math.floor(Math.random() * 1000);
        const user = {
            username: 'user' + randomNumber,
            photoUrl: 'https://picsum.photos/40?' + Math.random(),
            gift_name: '',
            comment: 'candy'
        };
        simulateAudienceTyping(guessWord, user);
    }, 1000);
}

function simulateGuessesStop() {
    simulateGuessesActive = false;
    const indicator = document.getElementById('simulate-indicator');
    if (indicator) indicator.style.display = 'none';
    if (!groupGuessBarActive) unsetCogSimulateActive();
    if (simulateGuessesInterval) {
        clearInterval(simulateGuessesInterval);
        simulateGuessesInterval = null;
    }
}

function simulateAudienceTyping(word, user) {
    simulateTyping = true;
    
    // Store the user in the playingUsers array
    playingUsers.push(user);
    
    // Set the current guessing user
    currentGuessingUser = user;
    
    let idx = 0;

    function typeNextLetter() {
        if (idx < word.length) {
            const letter = word[idx];
            const keyBtn = document.querySelector(`.key[data-key="${letter}"]`);
            if (keyBtn) keyBtn.click();
            idx++;
            setTimeout(typeNextLetter, 80); // Fast typing
        } else {
            // Press enter
            const enterBtn = document.querySelector('.key[data-key="enter"]');
            if (enterBtn) enterBtn.click();
            // Clear the current guessing user after the guess is complete
            setTimeout(() => {
                currentGuessingUser = null;
                simulateTyping = false;
            }, 100);
        }
    }
    typeNextLetter();
}

function renderGroupGuessBarChart() {
    const barChart = document.getElementById('group-guess-bar-chart');
    if (!barChart) return;
    // Convert stacks to array and sort by stack height desc, then by word
    const stacksArr = Object.entries(groupGuessStacks)
        .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
        .slice(0, 7);
    // FLIP: measure old positions
    const prevRects = {};
    if (barChart.children.length) {
        for (let i = 0; i < barChart.children.length; i++) {
            const el = barChart.children[i];
            const word = el.getAttribute('data-word');
            if (word) prevRects[word] = el.getBoundingClientRect();
        }
    }
    // Render new order
    barChart.innerHTML = '';
    stacksArr.forEach(([word, users], idx) => {
        const stackDiv = document.createElement('div');
        stackDiv.className = 'bar-stack';
        stackDiv.setAttribute('data-word', word);
        stackDiv.style.zIndex = (stacksArr.length - idx + 1).toString();
        // Word label
        const label = document.createElement('div');
        label.className = 'bar-word-label';
        label.textContent = word.toUpperCase();
        stackDiv.appendChild(label);
        // User images (stacked)
        users.forEach(user => {
            //May need to change this for displaying winner's images #change
            const img = document.createElement('img');
            img.className = 'bar-user-img';
            img.src = user.photoUrl;
            img.title = user.username;
            stackDiv.appendChild(img);
        });
        barChart.appendChild(stackDiv);
    });
    // FLIP: animate position changes
    setTimeout(() => {
        for (let i = 0; i < barChart.children.length; i++) {
            const el = barChart.children[i];
            const word = el.getAttribute('data-word');
            if (word && prevRects[word]) {
                const newRect = el.getBoundingClientRect();
                const dx = prevRects[word].left - newRect.left;
                if (dx !== 0) {
                    el.style.transform = `translateX(${dx}px)`;
                    el.style.transition = 'none';
                    // Force reflow
                    void el.offsetWidth;
                    el.style.transition = '';
                    el.style.transform = '';
                }
            }
        }
    }, 0);
    lastBarOrder = stacksArr.map(([word]) => word);
}

//How group guess bar is started
function startGroupGuessBar() {
    groupGuessBarActive = true;
    groupGuessStacks = {};
    lastBarOrder = [];
    const barChart = document.getElementById('group-guess-bar-chart');
    if (barChart) {
        barChart.style.display = 'flex';
        barChart.style.height = `${stackHeight}px`;
        barChart.style.minHeight = `${stackHeight}px`;
    }
    const keyboard = document.querySelector('.keyboard');
    if (keyboard) keyboard.style.visibility = 'hidden';
    setCogSimulateActive();
    if (groupGuessInterval) clearInterval(groupGuessInterval);
    groupGuessInterval = setInterval(() => {
        if (!groupGuessBarActive || isGameOver) return;
        
        // Increment guess count
        groupModeGuessCount++;
        
        let guessWord;
        if (groupModeGuessCount >= 10) {
            // After 10 guesses, only add guesses for the winning word
            guessWord = targetWord;
        } else {
            // Pick a random word that is NOT the target word
            const possibleWords = wordLists[wordLength].filter(w => w !== targetWord);
            if (possibleWords.length === 0) return;
            guessWord = possibleWords[Math.floor(Math.random() * possibleWords.length)];
        }
        
        // Simulate a random user
        const randomNumber = Math.floor(Math.random() * 1000);
        const user = {
            username: 'user' + randomNumber,
            photoUrl: 'https://picsum.photos/40?' + Math.random(),
            gift_name: '',
            comment: 'candy'
        };
        // Add to stack
        if (!groupGuessStacks[guessWord]) groupGuessStacks[guessWord] = [];
        // Users are stored here, but need to be saved and referenced for entire game. #change
        groupGuessStacks[guessWord].push(user);
        
        // Store the user in the playingUsers array for the entire game
        playingUsers.push(user);
        
        // If stack reaches required number, enter the word and remove the stack
        if (groupGuessStacks[guessWord].length >= requiredGuesses) {
            // Use the top photo (last user added)
            simulateGroupAudienceTyping(guessWord, groupGuessStacks[guessWord][groupGuessStacks[guessWord].length - 1]);
            delete groupGuessStacks[guessWord];
        }
        // Only keep 7 stacks
        const stackWords = Object.keys(groupGuessStacks);
        if (stackWords.length > 7) {
            // Remove the smallest stack (rightmost)
            let minWord = stackWords[0];
            for (const w of stackWords) {
                if (groupGuessStacks[w].length < groupGuessStacks[minWord].length) minWord = w;
            }
            delete groupGuessStacks[minWord];
        }
        renderGroupGuessBarChart();
    }, 1000);
    renderGroupGuessBarChart();
}

function stopGroupGuessBar() {
    groupGuessBarActive = false;
    if (!simulateGuessesActive) unsetCogSimulateActive();
    if (groupGuessInterval) clearInterval(groupGuessInterval);
    groupGuessInterval = null;
    const barChart = document.getElementById('group-guess-bar-chart');
    if (barChart) barChart.style.display = 'none';
    const keyboard = document.querySelector('.keyboard');
    if (keyboard) keyboard.style.visibility = 'visible';
    groupGuessStacks = {};
}

//How group guess word is entered
function simulateGroupAudienceTyping(word, user) {
    // Use the same logic as simulateAudienceTyping, but with the top user's image
    simulateTyping = true;
    
    // Set the current guessing user
    currentGuessingUser = user;
    
    let idx = 0;
    
    function typeNextLetter() {
        if (idx < word.length) {
            const letter = word[idx];
            const keyBtn = document.querySelector(`.key[data-key="${letter}"]`);
            if (keyBtn) keyBtn.click();
            idx++;
            setTimeout(typeNextLetter, 80);
        } else {
            const enterBtn = document.querySelector('.key[data-key="enter"]');
            if (enterBtn) enterBtn.click();
            setTimeout(() => {
                currentGuessingUser = null;
                simulateTyping = false;
            }, 100);
        }
    }
    typeNextLetter();
}

// Helper function to get user profile image by username
function getUserProfileImage(username) {
    if (!username) {
        // No username provided, use logged-in user's image from localStorage
        return localStorage.getItem('wordleProfileImage') || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg';
    }
    
    // Find user in playingUsers array
    const user = playingUsers.find(u => u.username === username);
    if (user && user.photoUrl) {
        return user.photoUrl;
    }
    
    // Fallback to logged-in user's image from localStorage
    return localStorage.getItem('wordleProfileImage') || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg';
}

// Show winning modal when game ends
function showWinningModal(winningWord) {
    const overlay = document.getElementById('winning-overlay');
    const title = document.getElementById('winning-title');
    const wordDisplay = document.getElementById('winning-word');
    const singleWinner = document.getElementById('single-winner');
    const groupWinners = document.getElementById('group-winners');
    
    if (!overlay) return;
    
    // Play winning sound if configured
    if (winningSoundUrl) {
        try {
            const audio = new Audio(winningSoundUrl);
            audio.volume = 0.5; // Set volume to 50%
            audio.play().catch(error => {
                console.log("Could not play winning sound:", error);
            });
            
            // Stop the sound when modal duration ends
            setTimeout(() => {
                audio.pause();
                audio.currentTime = 0;
            }, winningModalDuration * 1000);
        } catch (error) {
            console.log("Invalid winning sound URL:", error);
        }
    }
    
    // Check if we're in group mode
    const isGroupMode = document.getElementById('group-guess-bar-chart').style.display !== 'none';
    
    if (isGroupMode) {
        // Group mode: Show all users who guessed the winning word
        showGroupWinners(winningWord, title, wordDisplay, singleWinner, groupWinners);
    } else {
        // Single player mode: Show the winner
        showSingleWinner(winningWord, title, wordDisplay, singleWinner, groupWinners);
    }
    
    // Show the overlay
    overlay.classList.add('show');
    
    // Auto-hide after configured duration and start new game
    setTimeout(() => {
        overlay.classList.remove('show');
        setTimeout(() => {
            initializeGame();
        }, 300); // Wait for fade out
    }, winningModalDuration * 1000);
}

function showSingleWinner(winningWord, title, wordDisplay, singleWinner, groupWinners) {
    // Find the winner from playingUsers or use logged-in user
    let winner = null;
    
    if (currentGuessingUser) {
        // If there's a current guessing user (simulated), use them
        winner = currentGuessingUser;
    } else if (playingUsers.length > 0) {
        // Use the last user who made a guess
        winner = playingUsers[playingUsers.length - 1];
    } else {
        // Manual guess by logged-in user
        winner = {
            username: 'Player',
            photoUrl: localStorage.getItem('wordleProfileImage') || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'
        };
    }
    
    // Configure for single winner
    title.textContent = `${winner.username} Wins!`;
    wordDisplay.textContent = `The winning word was "${winningWord.toUpperCase()}"`;
    
    // Show single winner, hide group winners
    singleWinner.style.display = 'flex';
    groupWinners.style.display = 'none';
    
    // Set winner details
    const winnerPhoto = document.getElementById('winner-photo');
    const winnerName = document.getElementById('winner-name');
    
    if (winnerPhoto && winnerName) {
        winnerPhoto.src = winner.photoUrl;
        winnerPhoto.alt = winner.username;
        winnerName.textContent = winner.username;
    }
}

function showGroupWinners(winningWord, title, wordDisplay, singleWinner, groupWinners) {
    // Find all users who actually guessed the winning word from playingUsers array
    const usersWhoGuessedWinningWord = playingUsers.filter(user => {
        // Check if this user guessed the winning word
        // This could be tracked through user activity or we can check if they were part of the winning word stack
        return user.guessedWord === winningWord || 
               (groupGuessStacks[winningWord] && groupGuessStacks[winningWord].some(u => u.username === user.username));
    });
    
    // If no specific users found who guessed the winning word, fall back to recent users
    const candidateUsers = usersWhoGuessedWinningWord.length > 0 ? usersWhoGuessedWinningWord : playingUsers;
    
    // Get distinct usernames in reverse order (most recent first)
    const seenUsernames = new Set();
    const distinctRecentUsers = [];
    
    // Iterate backwards through the array to get most recent distinct users
    for (let i = candidateUsers.length - 1; i >= 0 && distinctRecentUsers.length < requiredGuesses; i--) {
        const user = candidateUsers[i];
        if (!seenUsernames.has(user.username)) {
            seenUsernames.add(user.username);
            distinctRecentUsers.unshift(user); // Add to beginning to maintain chronological order
        }
    }
    
    const winners = distinctRecentUsers;
    
    // Configure for group winners
    title.textContent = 'Group Victory!';
    wordDisplay.textContent = `The winning word was "${winningWord.toUpperCase()}"`;
    
    // Hide single winner, show group winners
    singleWinner.style.display = 'none';
    groupWinners.style.display = 'flex';
    
    // Clear and populate group winners
    groupWinners.innerHTML = '';
    
    // Always show winners since we're guaranteed to have them
    winners.forEach(user => {
        const winnerDiv = document.createElement('div');
        winnerDiv.className = 'group-winner';
        
        const photoDiv = document.createElement('img');
        photoDiv.className = 'group-winner-photo';
        photoDiv.src = user.photoUrl || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg';
        photoDiv.alt = user.username;
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'group-winner-name';
        nameDiv.textContent = user.username;
        
        winnerDiv.appendChild(photoDiv);
        winnerDiv.appendChild(nameDiv);
        groupWinners.appendChild(winnerDiv);
    });
}

// Initialize winning popup settings
function initializeWinningPopupSettings() {
    const soundUrlInput = document.getElementById('winning-sound-url');
    const durationInput = document.getElementById('winning-modal-duration');
    const decreaseDurationBtn = document.getElementById('decrease-duration');
    const increaseDurationBtn = document.getElementById('increase-duration');
    const testButton = document.getElementById('test-winning-sound');

    // Load saved winning sound URL and duration if they exist
    const savedSoundUrl = localStorage.getItem('wordleWinningSoundUrl');
    const savedDuration = localStorage.getItem('wordleWinningDuration');
    if (savedSoundUrl) {
        winningSoundUrl = savedSoundUrl;
        soundUrlInput.value = savedSoundUrl;
    }
    if (savedDuration) {
        winningModalDuration = parseInt(savedDuration);
        durationInput.value = savedDuration;
    }

    // Handle sound URL change
    soundUrlInput.addEventListener('change', () => {
        winningSoundUrl = soundUrlInput.value;
        localStorage.setItem('wordleWinningSoundUrl', winningSoundUrl);
    });

    // Handle duration changes
    function updateDuration(newDuration) {
        if (newDuration >= 1 && newDuration <= 10) {
            winningModalDuration = newDuration;
            durationInput.value = newDuration;
            localStorage.setItem('wordleWinningDuration', newDuration);
        }
    }

    durationInput.addEventListener('change', () => {
        const newDuration = parseInt(durationInput.value);
        updateDuration(newDuration);
    });

    decreaseDurationBtn.addEventListener('click', () => {
        const newDuration = parseInt(durationInput.value) - 1;
        updateDuration(newDuration);
    });

    increaseDurationBtn.addEventListener('click', () => {
        const newDuration = parseInt(durationInput.value) + 1;
        updateDuration(newDuration);
    });

    // Handle test button click
    testButton.addEventListener('click', () => {
        testWinningSound(winningSoundUrl, winningModalDuration);
    });
}

// Test winning sound
function testWinningSound(soundUrl, duration) {
    if (!soundUrl) {
        showMessage("Please enter a sound URL first");
        return;
    }
    
    try {
        const audio = new Audio(soundUrl);
        audio.volume = 0.5; // Set volume to 50%
        audio.play().catch(error => {
            showMessage("Error playing sound: " + error.message);
        });
        
        // Stop the sound after the specified duration
        setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;
        }, duration * 1000);
        
        showMessage(`Testing sound for ${duration} seconds...`);
    } catch (error) {
        showMessage("Invalid sound URL");
    }
}

// Initialize instruction popup settings
function initializeInstructionPopupSettings() {
    const activeCheckbox = document.getElementById('instruction-popup-active');
    const textArea = document.getElementById('instruction-popup-text');
    const gifInput = document.getElementById('instruction-popup-gif');
    const durationInput = document.getElementById('instruction-popup-duration');
    const decreaseDurationBtn = document.getElementById('decrease-instruction-duration');
    const increaseDurationBtn = document.getElementById('increase-instruction-duration');
    const testButton = document.getElementById('test-instruction-popup');

    // Load saved settings
    const savedActive = localStorage.getItem('wordleInstructionPopupActive');
    const savedText = localStorage.getItem('wordleInstructionPopupText');
    const savedGif = localStorage.getItem('wordleInstructionPopupGif');
    const savedDuration = localStorage.getItem('wordleInstructionPopupDuration');
    
    if (savedActive !== null) {
        instructionPopupActive = savedActive === 'true';
    } else {
        // Default to true if no saved setting exists and save it
        instructionPopupActive = true;
        localStorage.setItem('wordleInstructionPopupActive', 'true');
    }
    activeCheckbox.checked = instructionPopupActive;
    
    if (savedText) {
        instructionPopupText = savedText;
        textArea.value = savedText;
    }
    if (savedGif) {
        instructionPopupGif = savedGif;
        gifInput.value = savedGif;
    }
    if (savedDuration) {
        instructionPopupDuration = parseInt(savedDuration);
        durationInput.value = instructionPopupDuration;
    }

    // Handle active checkbox change
    activeCheckbox.addEventListener('change', () => {
        instructionPopupActive = activeCheckbox.checked;
        localStorage.setItem('wordleInstructionPopupActive', instructionPopupActive);
    });

    // Handle text change
    textArea.addEventListener('change', () => {
        instructionPopupText = textArea.value;
        localStorage.setItem('wordleInstructionPopupText', instructionPopupText);
    });

    // Handle GIF change
    gifInput.addEventListener('change', () => {
        instructionPopupGif = gifInput.value;
        localStorage.setItem('wordleInstructionPopupGif', instructionPopupGif);
    });

    // Handle duration changes
    function updateDuration(newDuration) {
        if (newDuration >= 1 && newDuration <= 10) {
            instructionPopupDuration = newDuration;
            durationInput.value = instructionPopupDuration;
            localStorage.setItem('wordleInstructionPopupDuration', instructionPopupDuration);
        }
    }

    durationInput.addEventListener('change', () => {
        const newDuration = parseInt(durationInput.value);
        updateDuration(newDuration);
    });

    decreaseDurationBtn.addEventListener('click', () => {
        const newDuration = parseInt(durationInput.value) - 1;
        updateDuration(newDuration);
    });

    increaseDurationBtn.addEventListener('click', () => {
        const newDuration = parseInt(durationInput.value) + 1;
        updateDuration(newDuration);
    });

    // Handle test button click
    testButton.addEventListener('click', () => {
        showInstructionPopup();
    });
}

// Show instruction popup
function showInstructionPopup() {
    const popup = document.getElementById('instruction-popup');
    const textDisplay = document.getElementById('instruction-popup-text-display');
    const gifDisplay = document.getElementById('instruction-popup-gif-display');
    
    // Set the text content with new line support
    textDisplay.innerHTML = instructionPopupText.replace(/\n/g, '<br>');
    
    // Handle GIF display
    if (instructionPopupGif && instructionPopupGif.trim() !== '') {
        gifDisplay.src = instructionPopupGif;
        gifDisplay.style.display = 'block';
    } else {
        gifDisplay.style.display = 'none';
    }
    
    // Show the popup with slide-in animation
    popup.classList.add('show');
    
    // Auto-hide after the specified duration
    setTimeout(() => {
        popup.classList.remove('show');
    }, instructionPopupDuration * 1000);
}

// TTS Functions
function loadAvailableVoices() {
    return new Promise((resolve) => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
            availableVoices = voices;
            resolve(voices);
        } else {
            // Some browsers load voices asynchronously
            speechSynthesis.addEventListener('voiceschanged', () => {
                availableVoices = speechSynthesis.getVoices();
                resolve(availableVoices);
            }, { once: true });
        }
    });
}

function populateVoiceDropdown() {
    const voiceSelect = document.getElementById('tts-voice');
    if (!voiceSelect) return;
    
    // Clear existing options except default
    voiceSelect.innerHTML = '<option value="">Default Voice</option>';
    
    availableVoices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = `${voice.name} (${voice.lang})`;
        if (voice.default) {
            option.textContent += ' - Default';
        }
        voiceSelect.appendChild(option);
    });
}

function getRandomMessage(messages) {
    if (!messages || messages.length === 0) return '';
    return messages[Math.floor(Math.random() * messages.length)];
}

function speakText(text) {
    if (!ttsEnabled || !text || text.trim() === '') return;
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice if specified
    if (ttsVoice) {
        const selectedVoice = availableVoices.find(voice => voice.name === ttsVoice);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
    }
    
    // Set volume (0-1)
    utterance.volume = ttsVolume / 100;
    
    // Set rate (0.1-10, where 1 is normal)
    utterance.rate = ttsRate / 10;
    
    // Speak the text
    speechSynthesis.speak(utterance);
}

function speakRoundStart() {
    if (!ttsRoundStartEnabled) return;
    const message = getRandomMessage(ttsRoundStartTexts);
    speakText(message);
}

function speakGameWon() {
    if (!ttsGameWonEnabled) return;
    const message = getRandomMessage(ttsGameWonTexts);
    speakText(message);
}

function speakGameplay() {
    if (!ttsGameplayEnabled) return;
    const message = getRandomMessage(ttsGameplayTexts);
    speakText(message);
}

function speakWord(word) {
    if (!ttsReadWords || !word) return;
    
    // Check if speech synthesis is currently speaking
    // If it is, don't interrupt with word reading
    if (speechSynthesis.speaking) {
        return;
    }
    
    speakText(word);
}

function startGameplayAnnouncements() {
    stopGameplayAnnouncements(); // Clear any existing interval
    
    if (!ttsGameplayEnabled || ttsGameplayInterval <= 0) return;
    
    ttsGameplayIntervalId = setInterval(() => {
        if (!isGameOver && ttsGameplayEnabled) {
            speakGameplay();
        }
    }, ttsGameplayInterval * 1000);
}

function stopGameplayAnnouncements() {
    if (ttsGameplayIntervalId) {
        clearInterval(ttsGameplayIntervalId);
        ttsGameplayIntervalId = null;
    }
}

// Initialize info button
document.addEventListener('DOMContentLoaded', () => {
    const infoButton = document.getElementById('info-toggle');
    if (infoButton) {
        infoButton.addEventListener('click', () => {
            showInstructionPopup();
        });
    }
});

// Initialize TTS settings
async function initializeTTSSettings() {
    // Load available voices
    await loadAvailableVoices();
    populateVoiceDropdown();
    
    // Get all TTS elements
    const ttsEnabledCheckbox = document.getElementById('tts-enabled');
    const ttsVoiceSelect = document.getElementById('tts-voice');
    const ttsVolumeInput = document.getElementById('tts-volume');
    const decreaseVolumeBtn = document.getElementById('decrease-tts-volume');
    const increaseVolumeBtn = document.getElementById('increase-tts-volume');
    const ttsRateInput = document.getElementById('tts-rate');
    const decreaseRateBtn = document.getElementById('decrease-tts-rate');
    const increaseRateBtn = document.getElementById('increase-tts-rate');
    
    const ttsRoundStartEnabledCheckbox = document.getElementById('tts-round-start-enabled');
    const ttsRoundStartTextsTextarea = document.getElementById('tts-round-start-texts');
    
    const ttsReadWordsCheckbox = document.getElementById('tts-read-words');
    
    const ttsGameWonEnabledCheckbox = document.getElementById('tts-game-won-enabled');
    const ttsGameWonTextsTextarea = document.getElementById('tts-game-won-texts');
    
    const ttsGameplayEnabledCheckbox = document.getElementById('tts-gameplay-enabled');
    const ttsGameplayIntervalInput = document.getElementById('tts-gameplay-interval');
    const decreaseIntervalBtn = document.getElementById('decrease-tts-interval');
    const increaseIntervalBtn = document.getElementById('increase-tts-interval');
    const ttsGameplayTextsTextarea = document.getElementById('tts-gameplay-texts');
    
    const testTTSBtn = document.getElementById('test-tts');

    // Load saved settings
    const savedEnabled = localStorage.getItem('wordleTTSEnabled');
    const savedVoice = localStorage.getItem('wordleTTSVoice');
    const savedVolume = localStorage.getItem('wordleTTSVolume');
    const savedRate = localStorage.getItem('wordleTTSRate');
    const savedRoundStartEnabled = localStorage.getItem('wordleTTSRoundStartEnabled');
    const savedRoundStartTexts = localStorage.getItem('wordleTTSRoundStartTexts');
    const savedReadWords = localStorage.getItem('wordleTTSReadWords');
    const savedGameWonEnabled = localStorage.getItem('wordleTTSGameWonEnabled');
    const savedGameWonTexts = localStorage.getItem('wordleTTSGameWonTexts');
    const savedGameplayEnabled = localStorage.getItem('wordleTTSGameplayEnabled');
    const savedGameplayInterval = localStorage.getItem('wordleTTSGameplayInterval');
    const savedGameplayTexts = localStorage.getItem('wordleTTSGameplayTexts');

    // Apply saved settings
    if (savedEnabled !== null) {
        ttsEnabled = savedEnabled === 'true';
        ttsEnabledCheckbox.checked = ttsEnabled;
    }
    if (savedVoice) {
        ttsVoice = savedVoice;
        ttsVoiceSelect.value = savedVoice;
    }
    if (savedVolume) {
        ttsVolume = parseInt(savedVolume);
        ttsVolumeInput.value = ttsVolume;
    }
    if (savedRate) {
        ttsRate = parseInt(savedRate);
        ttsRateInput.value = ttsRate;
    }
    if (savedRoundStartEnabled !== null) {
        ttsRoundStartEnabled = savedRoundStartEnabled === 'true';
        ttsRoundStartEnabledCheckbox.checked = ttsRoundStartEnabled;
    }
    if (savedRoundStartTexts) {
        ttsRoundStartTexts = savedRoundStartTexts.split(';').filter(text => text.trim() !== '').map(text => text.trim());
        ttsRoundStartTextsTextarea.value = savedRoundStartTexts;
    }
    if (savedReadWords !== null) {
        ttsReadWords = savedReadWords === 'true';
        ttsReadWordsCheckbox.checked = ttsReadWords;
    }
    if (savedGameWonEnabled !== null) {
        ttsGameWonEnabled = savedGameWonEnabled === 'true';
        ttsGameWonEnabledCheckbox.checked = ttsGameWonEnabled;
    }
    if (savedGameWonTexts) {
        ttsGameWonTexts = savedGameWonTexts.split(';').filter(text => text.trim() !== '').map(text => text.trim());
        ttsGameWonTextsTextarea.value = savedGameWonTexts;
    }
    if (savedGameplayEnabled !== null) {
        ttsGameplayEnabled = savedGameplayEnabled === 'true';
        ttsGameplayEnabledCheckbox.checked = ttsGameplayEnabled;
    }
    if (savedGameplayInterval) {
        ttsGameplayInterval = parseInt(savedGameplayInterval);
        ttsGameplayIntervalInput.value = ttsGameplayInterval;
    }
    if (savedGameplayTexts) {
        ttsGameplayTexts = savedGameplayTexts.split(';').filter(text => text.trim() !== '').map(text => text.trim());
        ttsGameplayTextsTextarea.value = savedGameplayTexts;
    }

    // Event listeners
    ttsEnabledCheckbox.addEventListener('change', () => {
        ttsEnabled = ttsEnabledCheckbox.checked;
        localStorage.setItem('wordleTTSEnabled', ttsEnabled);
        
        // Stop gameplay announcements if TTS is disabled
        if (!ttsEnabled) {
            stopGameplayAnnouncements();
        } else if (ttsGameplayEnabled && !isGameOver) {
            startGameplayAnnouncements();
        }
    });

    ttsVoiceSelect.addEventListener('change', () => {
        ttsVoice = ttsVoiceSelect.value;
        localStorage.setItem('wordleTTSVoice', ttsVoice);
    });

    // Volume controls
    function updateVolume(newVolume) {
        if (newVolume >= 0 && newVolume <= 100) {
            ttsVolume = newVolume;
            ttsVolumeInput.value = newVolume;
            localStorage.setItem('wordleTTSVolume', newVolume);
        }
    }

    ttsVolumeInput.addEventListener('change', () => {
        const newVolume = parseInt(ttsVolumeInput.value);
        updateVolume(newVolume);
    });

    decreaseVolumeBtn.addEventListener('click', () => {
        const newVolume = parseInt(ttsVolumeInput.value) - 10;
        updateVolume(newVolume);
    });

    increaseVolumeBtn.addEventListener('click', () => {
        const newVolume = parseInt(ttsVolumeInput.value) + 10;
        updateVolume(newVolume);
    });

    // Rate controls
    function updateRate(newRate) {
        if (newRate >= 5 && newRate <= 12) {
            ttsRate = newRate;
            ttsRateInput.value = newRate;
            localStorage.setItem('wordleTTSRate', newRate);
        }
    }

    ttsRateInput.addEventListener('change', () => {
        const newRate = parseInt(ttsRateInput.value);
        updateRate(newRate);
    });

    decreaseRateBtn.addEventListener('click', () => {
        const newRate = parseInt(ttsRateInput.value) - 1;
        updateRate(newRate);
    });

    increaseRateBtn.addEventListener('click', () => {
        const newRate = parseInt(ttsRateInput.value) + 1;
        updateRate(newRate);
    });

    // Round start settings
    ttsRoundStartEnabledCheckbox.addEventListener('change', () => {
        ttsRoundStartEnabled = ttsRoundStartEnabledCheckbox.checked;
        localStorage.setItem('wordleTTSRoundStartEnabled', ttsRoundStartEnabled);
    });

    ttsRoundStartTextsTextarea.addEventListener('change', () => {
        const texts = ttsRoundStartTextsTextarea.value.split(';').filter(text => text.trim() !== '').map(text => text.trim());
        ttsRoundStartTexts = texts;
        localStorage.setItem('wordleTTSRoundStartTexts', ttsRoundStartTextsTextarea.value);
    });

    // Read words settings
    ttsReadWordsCheckbox.addEventListener('change', () => {
        ttsReadWords = ttsReadWordsCheckbox.checked;
        localStorage.setItem('wordleTTSReadWords', ttsReadWords);
    });

    // Game won settings
    ttsGameWonEnabledCheckbox.addEventListener('change', () => {
        ttsGameWonEnabled = ttsGameWonEnabledCheckbox.checked;
        localStorage.setItem('wordleTTSGameWonEnabled', ttsGameWonEnabled);
    });

    ttsGameWonTextsTextarea.addEventListener('change', () => {
        const texts = ttsGameWonTextsTextarea.value.split(';').filter(text => text.trim() !== '').map(text => text.trim());
        ttsGameWonTexts = texts;
        localStorage.setItem('wordleTTSGameWonTexts', ttsGameWonTextsTextarea.value);
    });

    // Gameplay settings
    ttsGameplayEnabledCheckbox.addEventListener('change', () => {
        ttsGameplayEnabled = ttsGameplayEnabledCheckbox.checked;
        localStorage.setItem('wordleTTSGameplayEnabled', ttsGameplayEnabled);
        
        // Start or stop gameplay announcements
        if (ttsEnabled && ttsGameplayEnabled && !isGameOver) {
            startGameplayAnnouncements();
        } else {
            stopGameplayAnnouncements();
        }
    });

    // Interval controls
    function updateInterval(newInterval) {
        if (newInterval >= 10 && newInterval <= 300) {
            ttsGameplayInterval = newInterval;
            ttsGameplayIntervalInput.value = newInterval;
            localStorage.setItem('wordleTTSGameplayInterval', newInterval);
            
            // Restart gameplay announcements with new interval
            if (ttsEnabled && ttsGameplayEnabled && !isGameOver) {
                startGameplayAnnouncements();
            }
        }
    }

    ttsGameplayIntervalInput.addEventListener('change', () => {
        const newInterval = parseInt(ttsGameplayIntervalInput.value);
        updateInterval(newInterval);
    });

    decreaseIntervalBtn.addEventListener('click', () => {
        const newInterval = parseInt(ttsGameplayIntervalInput.value) - 10;
        updateInterval(newInterval);
    });

    increaseIntervalBtn.addEventListener('click', () => {
        const newInterval = parseInt(ttsGameplayIntervalInput.value) + 10;
        updateInterval(newInterval);
    });

    ttsGameplayTextsTextarea.addEventListener('change', () => {
        const texts = ttsGameplayTextsTextarea.value.split(';').filter(text => text.trim() !== '').map(text => text.trim());
        ttsGameplayTexts = texts;
        localStorage.setItem('wordleTTSGameplayTexts', ttsGameplayTextsTextarea.value);
    });

    // Test button
    testTTSBtn.addEventListener('click', () => {
        const testMessage = "This is a test of the text to speech system. Hello from Wordle!";
        speakText(testMessage);
    });
}

// Initialize TikTok settings
function initializeTikTokSettings() {
    const tiktokPlayModeSelect = document.getElementById('tiktok-play-mode');
    
    // Load saved settings
    const savedPlayMode = localStorage.getItem('wordleTiktokPlayMode');
    
    if (savedPlayMode) {
        tiktokPlayMode = savedPlayMode;
        tiktokPlayModeSelect.value = tiktokPlayMode;
    }
    
    // Event listeners
    tiktokPlayModeSelect.addEventListener('change', () => {
        tiktokPlayMode = tiktokPlayModeSelect.value;
        localStorage.setItem('wordleTiktokPlayMode', tiktokPlayMode);
    });
}

// TikTok Integration Functions
function handleRealComment(user) {
    if (isGameOver) return;
    
    // Extract the first word from comment and clean it
    const comment = user.comment.trim();
    const firstWord = comment.split(' ')[0]; // Take first word before any space
    const cleanWord = firstWord.replace(/[^a-zA-Z]/g, '').toLowerCase(); // Remove non-alphabetic characters
    
    // Check if the cleaned word matches the current word length
    if (cleanWord.length !== wordLength) {
        return; // Invalid word length
    }
    
    // Create user object for tracking
    const tiktokUser = {
        username: user.username,
        photoUrl: user.photoUrl,
        gift_name: user.gift_name || '',
        comment: user.comment,
        guessedWord: cleanWord
    };
    
    if (tiktokPlayMode === 'individual') {
        // Individual mode: immediately process the guess
        handleTikTokIndividualGuess(cleanWord, tiktokUser);
    } else {
        // Group mode: add to stacks and process when threshold is reached
        handleTikTokGroupGuess(cleanWord, tiktokUser);
    }
}

function handleTikTokIndividualGuess(guessWord, user) {
    // Store the user in the playingUsers array
    playingUsers.push(user);
    
    // Set the current guessing user
    currentGuessingUser = user;
    
    // Simulate typing the word
    simulateTypingWord(guessWord, () => {
        // Clear the current guessing user after the guess is complete
        currentGuessingUser = null;
    });
}

function handleTikTokGroupGuess(guessWord, user) {
    // Add to TikTok group stacks
    if (!tiktokGroupStacks[guessWord]) {
        tiktokGroupStacks[guessWord] = [];
    }
    tiktokGroupStacks[guessWord].push(user);
    
    // Store the user in the playingUsers array for the entire game
    playingUsers.push(user);
    
    // If stack reaches required number, enter the word
    if (tiktokGroupStacks[guessWord].length >= requiredGuesses) {
        // Use the most recent user's profile for the guess
        const topUser = tiktokGroupStacks[guessWord][tiktokGroupStacks[guessWord].length - 1];
        
        // Set the current guessing user
        currentGuessingUser = topUser;
        
        // Simulate typing the word
        simulateTypingWord(guessWord, () => {
            // Clear the current guessing user after the guess is complete
            currentGuessingUser = null;
        });
        
        // Remove the stack after processing
        delete tiktokGroupStacks[guessWord];
    }
    
    // Update group guess bar if it's active
    if (groupGuessBarActive) {
        // Merge TikTok stacks with regular group stacks for display
        const combinedStacks = { ...groupGuessStacks, ...tiktokGroupStacks };
        const originalStacks = groupGuessStacks;
        groupGuessStacks = combinedStacks;
        renderGroupGuessBarChart();
        groupGuessStacks = originalStacks; // Restore original stacks
    }
}

function simulateTypingWord(word, callback) {
    let idx = 0;
    
    function typeNextLetter() {
        if (idx < word.length) {
            const letter = word[idx];
            const keyBtn = document.querySelector(`.key[data-key="${letter}"]`);
            if (keyBtn) keyBtn.click();
            idx++;
            setTimeout(typeNextLetter, 80); // Fast typing
        } else {
            // Press enter
            const enterBtn = document.querySelector('.key[data-key="enter"]');
            if (enterBtn) enterBtn.click();
            // Execute callback after the guess is complete
            setTimeout(() => {
                if (callback) callback();
            }, 100);
        }
    }
    typeNextLetter();
}

// Initialize TikTok event listener
window.addEventListener('handleRealCommmentEvent', function(event) {
    const user = {
        username: event.detail.username,
        photoUrl: event.detail.photoUrl,
        gift_name: event.detail.gift_name || '',
        comment: event.detail.comment
    };
    handleRealComment(user);
});

window.addEventListener('handleRealGiftEvent', function(event) {
    const user = {
        username: event.detail.username,
        photoUrl: event.detail.photoUrl,
        gift_name: event.detail.gift_name,
        comment: event.detail.comment || ''
    };
    handleRealGift(user);
});

function handleRealGift(user) {
    console.log('TikTok Gift Received:', {
        username: user.username,
        photoUrl: user.photoUrl,
        gift_name: user.gift_name,
        comment: user.comment || ''
    });
}

// Expose function to get current target word
window.getCurrentTargetWord = function() {
    return targetWord;
};
