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

// DOM elements
const board = document.getElementById('board');
const messageDisplay = document.getElementById('message');
const newGameBtn = document.getElementById('new-game-btn');

// Initialize the game
function initializeGame() {
    // Clear the board
    board.innerHTML = '';
    
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
        const tile = currentRowElement.children[i];
        if (!tile || !tile.textContent) {
            showMessage("Invalid guess");
            shakeRow(currentRow);
            clearCurrentRow();
            return;
        }
        guess += tile.textContent.toLowerCase();
    }
    
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
        const currentTile = currentRowElement.children[i];
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
        const tile = currentRowElement.children[i];
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

function ensureProfileImageTile(row, imgSrc) {
    if (!row) return;
    // If the first child is already a profile image tile, do nothing
    if (row.firstChild && row.firstChild.classList.contains('profile-img-tile')) return;
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

function removeProfileImageTile(row) {
    if (!row) return;
    if (row.firstChild && row.firstChild.classList.contains('profile-img-tile')) {
        row.removeChild(row.firstChild);
    }
}

function addProfileImageToRow(rowIndex) {
    const row = document.querySelector(`.row[data-row="${rowIndex}"]`);
    // Use the current profile image at the time of guess
    const savedProfile = localStorage.getItem('wordleProfileImage') || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg';
    ensureProfileImageTile(row, savedProfile);
}

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

function setCogSimulateActive() {
    const cog = document.getElementById('settings-toggle');
    if (cog) cog.classList.add('simulate-active');
}
function unsetCogSimulateActive() {
    const cog = document.getElementById('settings-toggle');
    if (cog) cog.classList.remove('simulate-active');
}

function simulateGuessesStart() {
    if (simulateGuessesInterval) return;
    simulateGuessesActive = true;
    const indicator = document.getElementById('simulate-indicator');
    if (indicator) indicator.style.display = 'block';
    setCogSimulateActive();
    simulateGuessesInterval = setInterval(() => {
        if (!simulateGuessesActive || isGameOver || simulateTyping) return;
        // Pick a random word that is NOT the target word
        const possibleWords = wordLists[wordLength].filter(w => w !== targetWord);
        if (possibleWords.length === 0) return;
        const guessWord = possibleWords[Math.floor(Math.random() * possibleWords.length)];
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
    let idx = 0;
    // Save the current profile image for this guess
    const originalProfile = localStorage.getItem('wordleProfileImage');
    localStorage.setItem('wordleProfileImage', user.photoUrl);

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
            // Restore the original profile image for the next guess
            setTimeout(() => {
                if (originalProfile) {
                    localStorage.setItem('wordleProfileImage', originalProfile);
                } else {
                    localStorage.removeItem('wordleProfileImage');
                }
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
        // Pick a random word that is NOT the target word
        const possibleWords = wordLists[wordLength].filter(w => w !== targetWord);
        if (possibleWords.length === 0) return;
        const guessWord = possibleWords[Math.floor(Math.random() * possibleWords.length)];
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
        groupGuessStacks[guessWord].push(user);
        // If stack reaches required number, enter the word and remove the stack
        if (groupGuessStacks[guessWord].length >= requiredGuesses) {
            // Use the top photo (last user added)
            enterGroupGuessWord(guessWord, groupGuessStacks[guessWord][groupGuessStacks[guessWord].length - 1]);
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

function enterGroupGuessWord(word, user) {
    // Use the same logic as simulateAudienceTyping, but with the top user's image
    simulateTyping = true;
    let idx = 0;
    const originalProfile = localStorage.getItem('wordleProfileImage');
    localStorage.setItem('wordleProfileImage', user.photoUrl);
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
                if (originalProfile) {
                    localStorage.setItem('wordleProfileImage', originalProfile);
                } else {
                    localStorage.removeItem('wordleProfileImage');
                }
                simulateTyping = false;
            }, 100);
        }
    }
    typeNextLetter();
}
