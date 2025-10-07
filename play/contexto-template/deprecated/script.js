// Game state
let gameData = null;
let guesses = [];
let targetWord = "";
let mostRecentGuessLemma = null;
let dictionary = null;
let spellcheckEnabled = true;
let allowDuplicates = true;

// DOM elements
const wordInput = document.getElementById('wordInput');
const guessesContainer = document.getElementById('guessesContainer');
const lastGuessContainer = document.getElementById('lastGuess');
const menuButton = document.getElementById('menuButton');
const menuOverlay = document.getElementById('menuOverlay');
const selectGameOverlay = document.getElementById('selectGameOverlay');
const howToPlayOverlay = document.getElementById('howToPlayOverlay');
const congratsOverlay = document.getElementById('congratsOverlay');
const selectGameOption = document.getElementById('selectGame');
const playAgain = document.getElementById('playAgain');
const closeSelectGame = document.getElementById('closeSelectGame');
const closeHowToPlay = document.getElementById('closeHowToPlay');
const guessCountDisplay = document.getElementById('guessCount');
const loadingElement = document.getElementById('loading');
const errorMessageElement = document.getElementById('errorMessage');
const customWordInput = document.getElementById('customWordInput');
const createCustomGameButton = document.getElementById('createCustomGame');
const eyeToggle = document.getElementById('eyeToggle');
const gameCreationUI = document.getElementById('gameCreationUI');
const wordCheckUI = document.getElementById('wordCheckUI');
const successMessageUI = document.getElementById('successMessageUI');
const loadingGame = document.getElementById('loadingGame');
const backToInput = document.getElementById('backToInput');
const acceptSimilarWord = document.getElementById('acceptSimilarWord');
const continueToGame = document.getElementById('continueToGame');
const spellcheckToggle = document.getElementById('spellcheckToggle');
const numberOfGames = 300;

// Set initial state to password
customWordInput.type = 'password';
eyeToggle.textContent = '🚫';

// Add a variable to store suggested word when vocabulary check fails
let suggestedWord = "";

// API endpoint base URL
const API_BASE_URL = 'https://ccbackend.com';
        
// Generate a random game index between 0 and 300
const randomGameIndex = Math.floor(Math.random() * (numberOfGames + 1));
initGame(randomGameIndex);
initDictionary(); // Initialize the dictionary
        
// Initialize dictionary
async function initDictionary() {
    try {
        const response = await fetch('https://cdn.jsdelivr.net/npm/word-list-json@2.0.0/words.json');
        const words = await response.json();
        dictionary = new Set(words.map(word => word.toLowerCase()));
        console.log(dictionary)
    } catch (error) {
        console.error('Failed to load dictionary:', error);
        dictionary = null;
    }
}

// Initialize the game
async function initGame(gameIndex = null) {
    // Clear previous state
    guesses = [];
    mostRecentGuessLemma = null;
    guessesContainer.innerHTML = '';
    lastGuessContainer.style.display = 'none';
    loadingElement.style.display = 'block';
    errorMessageElement.style.display = 'none';
            
    // If no game index provided, use the random one
    if (gameIndex === null) {
        gameIndex = randomGameIndex;
    }
            
    try {
        // Update the game number display immediately
        document.getElementById('gameNumber').textContent = `#${gameIndex}`;
        // Fetch game data from the API
        const response = await fetch(`${API_BASE_URL}/game?index=${gameIndex}`);
                
                
        if (!response.ok) {
            throw new Error('Failed to fetch game data from game endpoint');
        }
                
        gameData = await response.json();
                
        // Set target word as the word with rank 1
        const targetWordObj = gameData.results.find(item => parseInt(item.rank) === 1);
        targetWord = targetWordObj ? targetWordObj.lemma : "unknown";
                
        // Hide loading indicator
        loadingElement.style.display = 'none';
                
        // Update UI
        updateGuessCount();
    } catch (error) {
        console.error('Error fetching game data:', error);
        errorMessageElement.textContent = 'Failed to load game data. Please check your connection.';
        errorMessageElement.style.display = 'block';
        loadingElement.style.display = 'none';
    }
}
        
// Initialize a custom game with a specific word
async function initCustomGame(word) {
    // Clear previous state
    guesses = [];
    mostRecentGuessLemma = null;
    guessesContainer.innerHTML = '';
    lastGuessContainer.style.display = 'none';
    loadingElement.style.display = 'block';
    errorMessageElement.style.display = 'none';
            
    try {
        // Update the game number display to show it's a custom game
        document.getElementById('gameNumber').textContent = 'Custom';
                
        // If we already have gameData (from the success flow), use it
        if (gameData && targetWord === word) {
            // We already have the data, no need to fetch again
            loadingElement.style.display = 'none';
            updateGuessCount();
            return true;
        }
                
        // Otherwise fetch game data from the API
        const response = await fetch(`${API_BASE_URL}/rank?word=${word}`);
                
        if (!response.ok) {
            throw new Error('Failed to generate custom game');
        }
                
        gameData = await response.json();
                
        // Set target word
        targetWord = word;
                
        // Hide loading indicator
        loadingElement.style.display = 'none';
                
        // Update UI
        updateGuessCount();
                
        return true;
    } catch (error) {
        console.error('Error creating custom game:', error);
        errorMessageElement.textContent = 'Failed to create custom game. Please try another word.';
        errorMessageElement.style.display = 'block';
        loadingElement.style.display = 'none';
        return false;
    }
}

// Find rank for a word
function findWordRank(word) {
    word = word.toLowerCase().trim();
            
    if (!gameData || !gameData.results) {
        return {
            lemma: word,
            rank: 10000 + Math.floor(Math.random() * 1000),
            word: word
        };
    }
            
    // First try to find exact match
    const matchedItem = gameData.results.find(item => 
        item.word?.toLowerCase() === word || 
        item.lemma?.toLowerCase() === word
    );
            
    if (matchedItem) {
        return {
            lemma: matchedItem.lemma,
            rank: parseInt(matchedItem.rank),
            word: word
        };
    }
            
    // If no match found, return a high rank number to indicate it's far
    return {
        lemma: word,
        rank: 10000 + Math.floor(Math.random() * 1000), // Random high number
        word: word
    };
}

// Spellcheck using local dictionary first, then API as fallback
async function checkSpelling(word) {
    if (!spellcheckEnabled) return true;
            
    word = word.toLowerCase();
            
    // Check local dictionary first if available
    if (dictionary) {
        const isInDictionary = dictionary.has(word);
        if (isInDictionary) return true;
    }
            
    // If word not found in local dictionary or dictionary not loaded, try API
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        console.log(response)
        return response.ok;
    } catch (error) {
        console.error('Spellcheck failed:', error);
        return true; // If API fails, allow the word
    }
}

// Handle word submission
async function submitWord(word) {
    if (!word || word.trim() === '' || !gameData) return;
            
    word = word.toLowerCase().trim();
            
    try {
        // Check spelling
        const isValidWord = await checkSpelling(word);
        if (!isValidWord) {
            errorMessageElement.textContent = 'Not a valid English word';
            errorMessageElement.style.display = 'block';
            return;
        }
                
        const result = findWordRank(word);
                
        // Clear any error messages
        errorMessageElement.style.display = 'none';
                
        // Check if already guessed
        const alreadyGuessed = guesses.some(g => g.lemma.toLowerCase() === result.lemma.toLowerCase());
                
        // If duplicates are not allowed and word was already guessed, show error
        if (!allowDuplicates && alreadyGuessed) {
            errorMessageElement.textContent = 'Word already guessed';
            errorMessageElement.style.display = 'block';
            return;
        }
                
        // Set as most recent guess regardless of whether it's already been guessed
        mostRecentGuessLemma = result.lemma;
        updateLastGuess(result);
                
        if (!alreadyGuessed) {
            // Only add to guesses list if it's a new word
            guesses.push(result);
                        
            // Sort guesses by rank (lowest first)
            guesses.sort((a, b) => a.rank - b.rank);
                        
            // Limit to 50 guesses in the list - keep the closest ones
            if (guesses.length > 50) {
                guesses = guesses.slice(0, 50);
            }
                        
            // Update the guess count
            updateGuessCount();
        }
                
        // Always render the guesses list to update the highlighting
        renderPreviousGuesses();
                
        // Clear input
        wordInput.value = '';
                
        // Check if solved
        if (result.rank === 1) {
            // Set text in congrats modal
            document.getElementById('winningWordText').textContent = result.lemma;
            document.getElementById('finalGuessCount').textContent = guesses.length;
                        
            // Show congrats modal
            congratsOverlay.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error submitting word:', error);
        errorMessageElement.textContent = 'An error occurred. Please try again later.';
        errorMessageElement.style.display = 'block';
    }
}
        
// Update the last guess display
function updateLastGuess(guess) {
    if (!guess) {
        lastGuessContainer.style.display = 'none';
        return;
    }
            
    lastGuessContainer.style.display = 'flex';
            
    // Determine background color class based on rank
    let bgClass = '';
    if (guess.rank < 300) {
        bgClass = 'blue-bg';
    } else if (guess.rank <= 1500) {
        bgClass = 'yellow-bg';
    } else {
        bgClass = 'red-bg';
    }
            
    // Calculate progress width percentage (inverse relationship with rank)
    // Rank 1 = 100%, Rank 3000+ = 5%
    const progressWidth = Math.max(1, 100 - (guess.rank / 30));
            
    lastGuessContainer.className = 'last-guess ' + bgClass;
    lastGuessContainer.innerHTML = `
        <div class="progress-bar" style="width: ${progressWidth}%"></div>
        <span>${guess.lemma}</span>
        <span>${guess.rank}</span>
    `;
}

// Render previous guesses
function renderPreviousGuesses() {
    guessesContainer.innerHTML = '';
            
    guesses.forEach(guess => {
        const guessElement = document.createElement('div');
        guessElement.classList.add('guess-item');
                
        // Mark the guess that matches the most recent guess
        if (guess.lemma.toLowerCase() === mostRecentGuessLemma.toLowerCase()) {
            guessElement.classList.add('guess-recent');
        }
                
        // Determine background color class based on rank
        if (guess.rank < 300) {
            guessElement.classList.add('blue-bg');
        } else if (guess.rank <= 1500) {
            guessElement.classList.add('yellow-bg');
        } else {
            guessElement.classList.add('red-bg');
        }
                
        // Calculate progress width percentage (inverse relationship with rank)
        // Rank 1 = 100%, Rank 3000+ = 5%
        const progressWidth = Math.max(1, 100 - (guess.rank / 30));
                
        guessElement.innerHTML = `
            <div class="progress-bar" style="width: ${progressWidth}%"></div>
            <span>${guess.lemma}</span>
            <span>${guess.rank}</span>
        `;
                
        guessesContainer.appendChild(guessElement);
    });
}

// Update guess count display
function updateGuessCount() {
    guessCountDisplay.textContent = guesses.length;
}

// Event listeners
wordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitWord(wordInput.value);
    }
});

menuButton.addEventListener('click', () => {
    menuOverlay.style.display = 'flex';
});

menuOverlay.addEventListener('click', (e) => {
    if (e.target === menuOverlay) {
        menuOverlay.style.display = 'none';
    }
});

selectGameOption.addEventListener('click', () => {
    menuOverlay.style.display = 'none';
    selectGameOverlay.style.display = 'flex';
});

playAgain.addEventListener('click', () => {
    congratsOverlay.style.display = 'none';
    selectGameOverlay.style.display = 'flex';
});

closeSelectGame.addEventListener('click', () => {
    selectGameOverlay.style.display = 'none';
});

if (closeHowToPlay) {
    closeHowToPlay.addEventListener('click', () => {
        howToPlayOverlay.style.display = 'none';
    });
}

howToPlayOverlay.addEventListener('click', (e) => {
    if (e.target === howToPlayOverlay) {
        howToPlayOverlay.style.display = 'none';
    }
});
        
congratsOverlay.addEventListener('click', (e) => {
    if (e.target === congratsOverlay) {
        congratsOverlay.style.display = 'none';
    }
});

selectGameOverlay.addEventListener('click', (e) => {
    if (e.target === selectGameOverlay) {
        selectGameOverlay.style.display = 'none';
    }
});

// When Play Again is clicked, show custom game creation dialog
playAgain.addEventListener('click', () => {
    congratsOverlay.style.display = 'none';
    selectGameOverlay.style.display = 'flex';
});
        
// Add event listener for random game button
document.getElementById('randomGame').addEventListener('click', () => {
    selectGameOverlay.style.display = 'none';
    // Generate a new random game index
    const newRandomIndex = Math.floor(Math.random() * (numberOfGames + 1));
    initGame(newRandomIndex);
});
        
// Toggle password visibility
eyeToggle.addEventListener('click', () => {
    if (customWordInput.type === 'password') {
        customWordInput.type = 'text';
        eyeToggle.textContent = '👁️';
    } else {
        customWordInput.type = 'password';
        eyeToggle.textContent = '🚫';
    }
});


createCustomGameButton.addEventListener('click', () => {
    const customWord = customWordInput.value.trim();
    if (customWord) {
        // Show loading spinner
        gameCreationUI.style.display = 'block';
        wordCheckUI.style.display = 'none';
        successMessageUI.style.display = 'none';
        loadingGame.style.display = 'flex';
                
        // Start the game creation process
        checkCustomWordValidity(customWord);
    }
});
        
customWordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const customWord = customWordInput.value.trim();
        if (customWord) {
            // Show loading spinner
            gameCreationUI.style.display = 'block';
            wordCheckUI.style.display = 'none';
            successMessageUI.style.display = 'none';
            loadingGame.style.display = 'flex';
                    
            // Start the game creation process
            checkCustomWordValidity(customWord);
        }
    }
});

//Function to handle game creation process
async function checkCustomWordValidity(word) {
    try {
            
        // Fetch game data from the API using the word
        const response = await fetch(`${API_BASE_URL}/rank?word=${word}`);
                
        if (!response.ok) {
            throw new Error('Failed to generate custom game');
        }
                
        const data = await response.json();
                
        // Check if the word is in the vocabulary
        const rank1Word = data.results.find(item => parseInt(item.rank) === 1);
                
        if (!rank1Word || rank1Word.lemma.toLowerCase() !== word.toLowerCase()) {
            // Word not found exactly, store the suggested word
            suggestedWord = rank1Word ? rank1Word.lemma : data.results[0]?.lemma || word;
                    
            // Store the fetched data to avoid another API call
            gameData = data;
                    
            // Hide loading spinner and show word check UI
            loadingGame.style.display = 'none';
            gameCreationUI.style.display = 'none';
            wordCheckUI.style.display = 'block';
        } else {
            // Word found, show success message
            loadingGame.style.display = 'none';
            gameCreationUI.style.display = 'none';
            successMessageUI.style.display = 'block';
                    
            // Store game data for later use
            gameData = data;
            targetWord = word;
        }
    } catch (error) {
        console.error('Error creating custom game:', error);
        loadingGame.style.display = 'none';
        errorMessageElement.textContent = 'Failed to create custom game. Please try another word.';
        errorMessageElement.style.display = 'block';
    }
}

// Handle button clicks for word check UI
backToInput.addEventListener('click', () => {
    // Go back to input screen
    wordCheckUI.style.display = 'none';
    gameCreationUI.style.display = 'block';
});

acceptSimilarWord.addEventListener('click', () => {
    // Accept the suggested word
    wordCheckUI.style.display = 'none';
            
    // Clear previous state
    guesses = [];
    mostRecentGuessLemma = null;
    guessesContainer.innerHTML = '';
    lastGuessContainer.style.display = 'none';

    // Set the target word to the suggested word
    targetWord = suggestedWord;
            
    // Update UI
    document.getElementById('gameNumber').textContent = 'Custom';
    updateGuessCount();
            
    // Close the modal and reset UI
    selectGameOverlay.style.display = 'none';
    gameCreationUI.style.display = 'block';
    customWordInput.value = '';
            
    // Hide loading indicator on main screen
    loadingElement.style.display = 'none';
});

// Handle continue button in success message
continueToGame.addEventListener('click', () => {
    // Clear previous state
    guesses = [];
    mostRecentGuessLemma = null;
    guessesContainer.innerHTML = '';
    lastGuessContainer.style.display = 'none';
            
    // Update UI
    document.getElementById('gameNumber').textContent = 'Custom';
    updateGuessCount();
            
    // Close the modal and reset UI
    selectGameOverlay.style.display = 'none';
    loadingGame.style.display = 'none';
    gameCreationUI.style.display = 'block';
    successMessageUI.style.display = 'none';
    customWordInput.value = '';
            
    // Hide loading indicator on main screen
    loadingElement.style.display = 'none';
});

// Menu options
document.getElementById('howToPlay').addEventListener('click', () => {
    menuOverlay.style.display = 'none';
    howToPlayOverlay.style.display = 'flex';
});

document.getElementById('hintOption').addEventListener('click', () => {
    menuOverlay.style.display = 'none';
            
    // Enter the next lemma above the current one
    if (guesses.length > 0) {
        // Get the current best guess (lowest rank)
        const bestGuessRank = guesses[0].rank;
                
        // Find a hint word with better rank than our current best
        if (gameData && gameData.results) {
            // Find the next best word in the results
            for (let i = bestGuessRank - 2; i >= 0; i--) {
                const nextBestWord = gameData.results.find(item => parseInt(item.rank) === i + 1);
                if (nextBestWord) {
                    // Enter this word as a hint
                    submitWord(nextBestWord.lemma);
                    return;
                }
            }
        }
    }
            
    // If we can't provide a hint or no guesses yet, give a generic hint
    alert('Hint: No better hint available. Try common words.');
});

document.getElementById('giveUp').addEventListener('click', () => {
    menuOverlay.style.display = 'none';
            
    // Automatically enter the winning word (rank 1)
    if (gameData && gameData.results) {
        const winningWord = gameData.results.find(item => parseInt(item.rank) === 1);
        if (winningWord) {
            submitWord(winningWord.lemma);
        } else {
            // Fallback if for some reason we can't find the winning word
            alert('The target word was: ' + targetWord);
        }
    } else {
        alert('The target word was: ' + targetWord);
    }
});

// Initialize spellcheck toggle
spellcheckToggle.addEventListener('click', () => {
    spellcheckEnabled = !spellcheckEnabled;
    spellcheckToggle.src = spellcheckEnabled 
        ? 'https://www.runchatcapture.com/assets/imgs/spellcheck.png'
        : 'https://www.runchatcapture.com/assets/imgs/nospellcheck.png';
});

// Initialize duplicate guesses toggle
const dupesToggle = document.getElementById('dupesToggle');
dupesToggle.addEventListener('click', () => {
    allowDuplicates = !allowDuplicates;
    dupesToggle.src = allowDuplicates 
        ? 'https://www.runchatcapture.com/assets/imgs/acceptdupes.png'
        : 'https://www.runchatcapture.com/assets/imgs/blockdupes.png';
});


