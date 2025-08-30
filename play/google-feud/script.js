let gameData = null;

let currentGame = null;
let revealedCount = 0;
let simulateCommentCount = 0;
let roundWinnersModalShown = false; // Track if modal has been shown for current game

// Google Autocomplete API function
function getGoogleSuggestions(query) {
    return new Promise((resolve, reject) => {
        const url = `https://cc-test-server-4e3612916ba4.herokuapp.com/api/suggest?q=${encodeURIComponent(query)}`;
        
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                resolve({
                    query: query,
                    suggestions: data.suggestions || data || [],
                    timestamp: new Date().toISOString()
                });
            })
            .catch(error => {
                reject(new Error(`Failed to load suggestions: ${error.message}`));
            });
    });
}

// Apply comment section visibility based on settings
function applyCommentSectionVisibility() {
    const showComments = localStorage.getItem('showCommentsSection') !== 'false'; // Default to true
    const commentsSection = document.querySelector('.comments');
    
    if (commentsSection) {
        commentsSection.style.display = showComments ? 'flex' : 'none';
    }
}

// Initialize category dropdown
async function initCategories() {
    try {
        const response = await fetch('https://www.runchatcapture.com/data/gf.json');
        gameData = await response.json();
        window.gameData = gameData;

        const select = document.getElementById('categorySelect');
        const categoryEmojis = {
            "Entertainment": "🎬",
            "Culture": "🏛️", 
            "Question of the Day": "❓",
            "Food": "🍕",
            "Questions": "🤔",
            "Names": "👤",
            "Animals": "🐾",
            "People": "👥",
            "Improv": "🎭"
        };
        
        // Add preset categories
        Object.keys(gameData).forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.className = 'preset-category';
            option.textContent = `${categoryEmojis[category] || '📋'} ${category}`;
            select.appendChild(option);
        });

        // Add improv category
        const improvOption = document.createElement('option');
        improvOption.value = 'Improv';
        improvOption.className = 'improv-category';
        improvOption.textContent = `${categoryEmojis['Improv']} Enter your own search`;
        improvOption.style.display = 'none'; // Hidden by default (preset mode)
        select.appendChild(improvOption);

        // Initialize mode handling
        initializeModeHandling();
        
        // Update game history percentage now that data is loaded
        updateGameHistoryPercent();

    } catch (error) {
        console.error('Error loading game data:', error);
        alert('Failed to load game data. Please refresh the page.');
    }
}

// Initialize game mode handling
function initializeModeHandling() {
    const gameModeToggle = document.getElementById('gameModeToggle');
    
    if (gameModeToggle) {
        // Load game mode from localStorage on page load
        const savedGameMode = localStorage.getItem('gameMode');
        if (savedGameMode === 'improv') {
            gameModeToggle.checked = true;
            // Switch to improv mode without page refresh since we're loading
            switchToImprovMode();
        } else {
            gameModeToggle.checked = false;
            // Default to preset mode
            switchToPresetMode();
        }
        
        gameModeToggle.addEventListener('change', function() {
            const isImprovMode = gameModeToggle.checked;
            
            // Save game mode to localStorage
            localStorage.setItem('gameMode', isImprovMode ? 'improv' : 'preset');
            
            if (isImprovMode) {
                // Switch to Improv mode with page refresh to clear everything
                console.log('Switching to Improv mode - refreshing page');
                window.location.reload();
            } else {
                // Switch to Preset mode
                switchToPresetMode();
            }
        });
    }
}

// Switch to Improv mode
function switchToImprovMode() {
    const categorySelect = document.getElementById('categorySelect');
    const presetOptions = categorySelect.querySelectorAll('.preset-category');
    const improvOption = categorySelect.querySelector('.improv-category');
    
    // Hide preset categories
    presetOptions.forEach(option => option.style.display = 'none');
    
    // Show and select improv category
    improvOption.style.display = 'block';
    categorySelect.value = 'Improv';
    categorySelect.disabled = true; // Make it unchangeable
    
    // Clear any existing game state
    clearGameState();
    
    // Update UI for improv mode
    updateUIForImprovMode();
    
    // Show game area and search container for improv mode
    document.getElementById('gameArea').style.display = 'block';
    
    // Disable game history and management buttons in improv mode
    disableImprovModeFeatures();
}

// Switch to Preset mode  
function switchToPresetMode() {
    const categorySelect = document.getElementById('categorySelect');
    const presetOptions = categorySelect.querySelectorAll('.preset-category');
    const improvOption = categorySelect.querySelector('.improv-category');
    
    // Show preset categories
    presetOptions.forEach(option => option.style.display = 'block');
    
    // Hide improv category
    improvOption.style.display = 'none';
    categorySelect.disabled = false; // Make it changeable
    categorySelect.value = ''; // Reset selection
    
    // Clear any existing game state
    clearGameState();
    
    // Update UI for preset mode
    updateUIForPresetMode();
    
    // Hide game area if currently showing
    document.getElementById('gameArea').style.display = 'none';
    
    // Re-enable features for preset mode
    enablePresetModeFeatures();
}

// Update UI for Improv mode
function updateUIForImprovMode() {
    const messageContainer = document.getElementById('messageContainer');
    const searchPrompt = document.getElementById('searchPrompt');
    const searchInput = document.getElementById('searchInput');
    
    // Show simple instructions in message container
    if (messageContainer) {
        messageContainer.textContent = 'Type a search and click enter to start round';
        messageContainer.style.visibility = 'visible';
        messageContainer.style.color = '#4285f4';
        messageContainer.style.height = '20px';
        messageContainer.style.padding = '';
    }
    
    // Make search prompt editable and clear it
    if (searchPrompt) {
        searchPrompt.contentEditable = true;
        searchPrompt.textContent = '';
        searchPrompt.style.cursor = 'text';
        searchPrompt.style.minWidth = '100px';
        searchPrompt.placeholder = 'Enter search prompt...';
        
        // Focus the search prompt
        searchPrompt.focus();
        
        // Add styling for editable state
        searchPrompt.style.border = '1px dashed #dadce0';
        searchPrompt.style.padding = '2px 4px';
        searchPrompt.style.borderRadius = '3px';
    }
    
    // Clear and hide the search input initially
    if (searchInput) {
        searchInput.value = '';
        searchInput.style.display = 'none';
    }
}

// Update UI for Preset mode
function updateUIForPresetMode() {
    const searchInput = document.getElementById('searchInput');
    const messageContainer = document.getElementById('messageContainer');
    const searchPrompt = document.getElementById('searchPrompt');
    
    // Reset search input placeholder and show it
    if (searchInput) {
        searchInput.placeholder = '';
        searchInput.style.display = 'block';
    }
    
    // Reset message container
    if (messageContainer) {
        messageContainer.style.visibility = 'hidden';
        messageContainer.style.height = '20px';
        messageContainer.style.padding = '';
        messageContainer.innerHTML = '';
    }
    
    // Reset search prompt to non-editable state
    if (searchPrompt) {
        searchPrompt.contentEditable = false;
        searchPrompt.textContent = '';
        searchPrompt.style.cursor = 'default';
        searchPrompt.style.minWidth = 'auto';
        searchPrompt.removeAttribute('placeholder');
        
        // Remove editable styling
        searchPrompt.style.border = 'none';
        searchPrompt.style.padding = '0';
        searchPrompt.style.borderRadius = '0';
    }
}

// Clear game state and UI
function clearGameState() {
    // Clear current game
    currentGame = null;
    revealedCount = 0;
    
    // Clear suggestions container
    const suggestionsList = document.getElementById('suggestionsList');
    if (suggestionsList) {
        suggestionsList.innerHTML = '';
    }
    
    // Clear search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Clear search prompt
    const searchPrompt = document.getElementById('searchPrompt');
    if (searchPrompt) {
        searchPrompt.textContent = '';
    }
    
    // Clear simulated comments when changing modes
    clearComments();
    
    // Hide comments and guess container sections
    const commentsSection = document.querySelector('.comments');
    const guessContainer = document.querySelector('.guess-container');
    if (commentsSection) {
        commentsSection.style.display = 'none';
    }
    if (guessContainer) {
        guessContainer.style.display = 'none';
    }
    
    // Update answers accordion to show "Not currently playing"
    updateAnswersAccordion();
}

// Clear comments
function clearComments() {
    const comments = document.getElementById('comments');
    if (comments) {
        comments.innerHTML = '';
    }
}

// Disable features that shouldn't work in improv mode
function disableImprovModeFeatures() {
    // Don't hide search bar - we want it to show for improv games
    
    // Hide game management buttons and show clear button
    const gameHistoryBtn = document.getElementById('gameHistoryManageBtn');
    const chooseGameBtn = document.getElementById('chooseGameBtn');
    const nextGameBtn = document.getElementById('nextGameBtn');
    const automationBtn = document.getElementById('automationFlowConfigureBtn');
    const clearImprovBtn = document.getElementById('clearImprovBtn');
    
    if (gameHistoryBtn) {
        gameHistoryBtn.disabled = true;
        gameHistoryBtn.style.opacity = '0.5';
        gameHistoryBtn.title = 'Not available in Improv mode';
    }
    
    // Hide these buttons in improv mode
    if (chooseGameBtn) {
        chooseGameBtn.style.display = 'none';
    }
    
    if (nextGameBtn) {
        nextGameBtn.style.display = 'none';
    }
    
    // Show clear button in improv mode
    if (clearImprovBtn) {
        clearImprovBtn.style.display = 'block';
    }
    
    if (automationBtn) {
        automationBtn.disabled = true;
        automationBtn.style.opacity = '0.5';
        automationBtn.title = 'Not available in Improv mode';
    }
}

// Re-enable features for preset mode
function enablePresetModeFeatures() {
    // Show search bar
    const searchBox = document.querySelector('.search-box');
    if (searchBox) {
        searchBox.style.visibility = 'visible';
    }
    
    // Re-enable game history buttons
    const gameHistoryBtn = document.getElementById('gameHistoryManageBtn');
    const chooseGameBtn = document.getElementById('chooseGameBtn');
    const nextGameBtn = document.getElementById('nextGameBtn');
    const automationBtn = document.getElementById('automationFlowConfigureBtn');
    const clearImprovBtn = document.getElementById('clearImprovBtn');
    
    if (gameHistoryBtn) {
        gameHistoryBtn.disabled = false;
        gameHistoryBtn.style.opacity = '1';
        gameHistoryBtn.title = '';
    }
    
    // Show these buttons in preset mode
    if (chooseGameBtn) {
        chooseGameBtn.style.display = 'block';
    }
    
    if (nextGameBtn) {
        nextGameBtn.style.display = 'block';
    }
    
    // Hide clear button in preset mode
    if (clearImprovBtn) {
        clearImprovBtn.style.display = 'none';
    }
    
    if (automationBtn) {
        automationBtn.disabled = false;
        automationBtn.style.opacity = '1';
        automationBtn.title = '';
    }
}

// Clear improv mode and reset to initial state
function clearImprovMode() {
    // Clear game state
    clearGameState();
    
    // Show game area so the search box is visible
    document.getElementById('gameArea').style.display = 'block';
    
    // Reset to initial improv mode state
    updateUIForImprovMode();
    
    // Ensure search prompt is properly reset and focused
    const searchPrompt = document.getElementById('searchPrompt');
    if (searchPrompt) {
        searchPrompt.textContent = '';
        searchPrompt.focus();
    }
    
    // Show instruction message
    const messageContainer = document.getElementById('messageContainer');
    if (messageContainer) {
        messageContainer.textContent = 'Type a search and click enter to start round';
        messageContainer.style.visibility = 'visible';
        messageContainer.style.color = '#4285f4';
    }
}

// Start new game
function startGame(category) {
    if (!gameData) {
        alert('Game data not loaded. Please refresh the page.');
        return;
    }

    const prompts = Object.keys(gameData[category]);
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    const answers = gameData[category][randomPrompt];
    
    currentGame = {
        category: category,
        prompt: randomPrompt,
        answers: answers,
        revealed: new Array(answers.length).fill(false),
        guessed: new Set(),
        allParticipants: {}
    };
    window.currentGame = currentGame;
    
    // Update the category dropdown to reflect the selected category
    const categorySelect = document.getElementById('categorySelect');
    if (categorySelect) {
        categorySelect.value = category;
    }
    
    revealedCount = 0;
    renderGame();
    document.getElementById('gameArea').style.display = 'block';
    document.getElementById('searchInput').focus();
}

// New game with same category
function newGame() {
    if (!currentGame) return;
    
    // Don't allow new game for improv mode - user needs to enter a new query
    if (currentGame.isImprov) {
        showMessage('Enter a new search query to start another improv game', 'info');
        return;
    }
    
    startGame(currentGame.category);
}

// Render the game interface
function renderGame() {
    if (!currentGame) return;
    
    // Reset modal shown flag for new game
    roundWinnersModalShown = false;
    
    document.getElementById('searchPrompt').textContent = currentGame.prompt;
    
    const suggestionsList = document.getElementById('suggestionsList');
    suggestionsList.innerHTML = '';
    
    currentGame.answers.forEach((answer, index) => {
        const suggestion = document.createElement('div');
        suggestion.className = 'suggestion' + (currentGame.revealed[index] ? ' revealed' : '');
        
        let userImg = localStorage.getItem('profileImage') || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg';
        let username = localStorage.getItem('profileUsername') || '';
        if (currentGame.revealed[index] && currentGame.userInfo && currentGame.userInfo[index]) {
            userImg = currentGame.userInfo[index].photoUrl;
            username = currentGame.userInfo[index].username;
        }

        suggestion.innerHTML = `
            <span class="suggestion-text">
                <span class="suggestion-prompt">${currentGame.prompt}</span>
                <span class="${currentGame.revealed[index] ? 'answer-revealed' : 'answer-covered'}" 
                      data-answer="${answer}">
                    ${currentGame.revealed[index] ? answer : answer}
                </span>
            </span>
            ${currentGame.revealed[index] ? `<span class="suggestion-userinfo"><img class="suggestion-userimg" src="${userImg}" alt="User" /><span class="suggestion-username">${username}</span></span>` : ''}
        `;
        
        suggestionsList.appendChild(suggestion);
    });
    
    // Update answers accordion
    updateAnswersAccordion();
}

// Check guess against answers using the provided logic
function checkGuess(guess, userInfo) {
    if (!guess || !currentGame) return;
    guess = guess.trim();
    
    // Remove escape character if present
    guess = removeEscapeCharacter(guess);
    
    if (currentGame.guessed.has(guess.toLowerCase())) return;
    currentGame.guessed.add(guess.toLowerCase());
    const answersForMatching = currentGame.answers.map((answer, index) => ({
        answer: answer,
        found: currentGame.revealed[index],
        index: index
    }));
    const matches = checkGuessLogic(guess, answersForMatching);
    let found = matches.length > 0;
    
    // Track user scores for Round Winners modal
    if (!currentGame.userScores) currentGame.userScores = {};
    if (!currentGame.allParticipants) currentGame.allParticipants = {};
    
    // Track this user as a participant (regardless of whether they got it right)
    if (userInfo) {
        const userId = userInfo.uniqueId;
        if (!currentGame.allParticipants[userId]) {
            currentGame.allParticipants[userId] = {
                correctAnswers: 0,
                totalGuesses: 0,
                user: userInfo
            };
            
            // Add new participant to persistent leaderboard with 0 points if not already there
            const leaderboard = getLeaderboard();
            if (!leaderboard[userId]) {
                const newUserScore = {};
                newUserScore[userId] = {
                    count: 0,
                    user: userInfo
                };
                updateLeaderboard(newUserScore);
                
                // Update floating leaderboard display to show new participant
                if (typeof window.updateFloatingLeaderboard === 'function') {
                    window.updateFloatingLeaderboard();
                }
            }
        }
        currentGame.allParticipants[userId].totalGuesses++;
        
        // Log each guess
        console.log(`🎮 GUESS: ${userInfo.username} (${userId}) guessed: "${guess}"`);
    }
    
    matches.forEach(match => {
        if (!currentGame.revealed[match.index]) {
            currentGame.revealed[match.index] = true;
            revealedCount++; // Increment revealed count
            
            // Store user info if provided
            if (!currentGame.userInfo) currentGame.userInfo = {};
            if (userInfo) {
                currentGame.userInfo[match.index] = userInfo;
                
                // Track user score (for backward compatibility)
                const userId = userInfo.uniqueId;
                if (!currentGame.userScores[userId]) {
                    currentGame.userScores[userId] = {
                        count: 0,
                        user: userInfo
                    };
                }
                currentGame.userScores[userId].count++;
                
                // Track correct answer for this participant
                if (currentGame.allParticipants[userId]) {
                    currentGame.allParticipants[userId].correctAnswers++;
                    
                    // Log correct answer
                    console.log(`✅ CORRECT: ${userInfo.username} (${userId}) got "${match.answer}" correct!`);
                    
                    // Update leaderboard immediately with this point
                    const singleUserScore = {};
                    singleUserScore[userId] = {
                        count: 1,
                        user: userInfo
                    };
                    updateLeaderboard(singleUserScore);
                    
                    // Update floating leaderboard display in real-time
                    if (typeof window.updateFloatingLeaderboard === 'function') {
                        window.updateFloatingLeaderboard();
                    }
                }
            }
        }
    });
    
    if (!found) {
        const coveredAnswers = document.querySelectorAll('.answer-covered');
        coveredAnswers.forEach(answer => {
            answer.classList.add('wrong');
            setTimeout(() => answer.classList.remove('wrong'), 300);
        });
    }
    renderGame();
    
    // Check if all answers are found
    if (revealedCount === currentGame.answers.length && !roundWinnersModalShown) {
        roundWinnersModalShown = true; // Mark modal as shown
        setTimeout(() => {
            showRoundWinnersModal();
        }, 500);
    }
}

// checkGuessLogic function has been moved to helperFunctions.js

// Update guess container with latest guess
function updateGuessContainer(guess, userInfo) {
    console.log('updateGuessContainer called with:', guess, userInfo);

    // Show the guess container when updating with a new guess
    const guessContainer = document.querySelector('.guess-container');
    if (guessContainer.style.display !== 'flex') {
        guessContainer.style.display = 'flex';
    }

    document.getElementById('guessText').innerText = guess;
    document.getElementById('guessImg').src = userInfo.photoUrl || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg';
}

// Give up and reveal all answers
function giveUp() {
    if (!currentGame) return;
    
    // Check if any answers were found before giving up
    const hadAnswers = revealedCount > 0;
    
    currentGame.revealed.fill(true);
    revealedCount = currentGame.answers.length;
    renderGame();
    
    // Show winners if any answers were found
    if (hadAnswers && !roundWinnersModalShown) {
        roundWinnersModalShown = true;
        setTimeout(() => {
            showRoundWinnersModal();
        }, 500);
    }
}

// Handle typing in search input (removed auto-checking)
document.getElementById('searchInput').addEventListener('input', function(e) {
    // Just allow typing, no checking until Enter is pressed
});

// Handle Enter key in search input
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        checkGuess(e.target.value);
        e.target.value = '';
    }
});

// Handle Enter key in editable search prompt (improv mode)
document.getElementById('searchPrompt').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && e.target.contentEditable === 'true') {
        e.preventDefault(); // Prevent default behavior
        const query = e.target.textContent.trim();
        
        if (!query) {
            showMessage('Please enter a search query', 'error');
            return;
        }
        
        if (query.length < 2) {
            showMessage('Search query too short', 'error');
            return;
        }
        
        // Start the improv game with the entered query
        startImprovGameWithQuery(query);
    }
});

// Show messages in the message container
function showMessage(message, type = 'info') {
    const messageContainer = document.getElementById('messageContainer');
    if (messageContainer) {
        const color = type === 'error' ? '#ea4335' : '#4285f4';
        messageContainer.textContent = message;
        messageContainer.style.color = color;
        messageContainer.style.visibility = 'visible';
    }
}

// Start improv game with the user's query
async function startImprovGameWithQuery(query) {
    showMessage('Loading suggestions...', 'info');
    
    try {
        // Call Google Autocomplete API
        const result = await getGoogleSuggestions(query);
        
        if (!result.suggestions || result.suggestions.length === 0) {
            showMessage('No suggestions found for this query. Try a different search.', 'error');
            return;
        }
        
        // Filter suggestions to only include those that contain the search prompt
        const queryLower = query.toLowerCase().trim();
        const filteredSuggestions = result.suggestions.filter(suggestion => 
            suggestion.toLowerCase().includes(queryLower)
        );
        
        if (filteredSuggestions.length === 0) {
            showMessage('No matching suggestions found. Try a more specific search query.', 'error');
            return;
        }
        
        // Remove the shared prompt text from suggestions, keeping only the unique part
        const processedSuggestions = filteredSuggestions.map(suggestion => {
            const suggestionLower = suggestion.toLowerCase();
            const queryIndex = suggestionLower.indexOf(queryLower);
            
            if (queryIndex === 0) {
                // Prompt is at the beginning, return everything after it
                return suggestion.substring(query.length).trim();
            } else if (queryIndex > 0) {
                // Prompt is in the middle, return everything after it
                return suggestion.substring(queryIndex + query.length).trim();
            } else {
                // Fallback (shouldn't happen due to filtering above)
                return suggestion;
            }
        }).filter(suggestion => suggestion.length > 0); // Remove empty results
        
        if (processedSuggestions.length === 0) {
            showMessage('No valid suggestions after processing. Try a different search query.', 'error');
            return;
        }
        
        // Create improv game with processed suggestions
        currentGame = {
            category: 'Improv',
            prompt: query,
            answers: processedSuggestions,
            revealed: new Array(processedSuggestions.length).fill(false),
            guessed: new Set(),
            isImprov: true, // Flag to identify improv games
            allParticipants: {}
        };
        window.currentGame = currentGame;
        
        revealedCount = 0;
        
        // Set up the UI for gameplay
        const searchPrompt = document.getElementById('searchPrompt');
        const searchInput = document.getElementById('searchInput');
        const messageContainer = document.getElementById('messageContainer');
        
        if (searchPrompt) {
            searchPrompt.contentEditable = false;
            searchPrompt.textContent = query;
            searchPrompt.style.cursor = 'default';
            searchPrompt.style.border = 'none';
            searchPrompt.style.padding = '0';
            searchPrompt.style.borderRadius = '0';
        }
        
        // Show the search input for guessing
        if (searchInput) {
            searchInput.style.display = 'block';
            searchInput.focus();
        }
        
        // Hide the message container
        if (messageContainer) {
            messageContainer.style.visibility = 'hidden';
        }
        
        // Render the game with processed suggestions
        renderGame();
        
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        showMessage(`Error: ${error.message}`, 'error');
    }
}

// Handle category selection
document.getElementById('categorySelect').addEventListener('change', function(e) {
    if (e.target.value && e.target.value !== 'Improv') {
        startGame(e.target.value);
    }
    // Improv category selection doesn't start a game - user needs to enter custom query
});

// Initialize the game
initCategories();

window.registerComment = function(user) {
    const container = document.getElementById('comments');
    if (!container) return;
    
    // Check if comments section should be shown based on settings
    const showComments = localStorage.getItem('showCommentsSection') !== 'false'; // Default to true
    
    if (showComments) {
        // Show the comments section when a new comment comes through
        container.style.display = 'flex';
    }
    
    const row = document.createElement('div');
    row.className = 'comment-row';
    row.innerHTML = `
        <span class="comment-user">
            <img class="comment-img" src="${user.photoUrl}" alt="User" />
            <span class="comment-username">${user.username}</span>
        </span>
        <span class="comment-guess">${user.comment}</span>
    `;
    container.prepend(row);
    while (container.children.length > 10) {
        container.removeChild(container.lastChild);
    }
    if (typeof checkGuess === 'function') {
        checkGuess(user.comment, { username: user.username, photoUrl: user.photoUrl, uniqueId: user.uniqueId });
    }
};

window.simulateComment = function(forceAnswer) {
    let user;
    if (forceAnswer && window.currentGame && Array.isArray(window.currentGame.answers)) {
        const unrevealed = window.currentGame.answers.filter((a, i) => !window.currentGame.revealed[i]);
        if (unrevealed.length > 0) {
            const answer = unrevealed[Math.floor(Math.random() * unrevealed.length)];
            // Generate username with length between 7 and 20 characters
            const baseUsername = 'user' + Math.floor(Math.random() * 1000);
            const additionalChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
            const targetLength = Math.floor(Math.random() * 14) + 7; // 7 to 20 characters
            let username = baseUsername;
            while (username.length < targetLength) {
                username += additionalChars[Math.floor(Math.random() * additionalChars.length)];
            }
            user = {
                username: username.substring(0, targetLength),
                photoUrl: 'https://picsum.photos/40?' + Math.random(),
                comment: answer
            };
        }
    }
    if (!user) {
        const randomNumber = Math.floor(Math.random() * 1000);
        const randomComment = Math.floor(Math.random() * 10);
        const comments = [
            'This is a comment',
            'This is another comment',
            'This is a third comment',
            'This is a fourth comment',
            'This is a fifth comment',
            'This is a sixth comment',
            'This is a seventh comment',
            'This is a eighth comment',
            'This is a ninth comment',
            'This is a tenth comment'
        ];
        // Generate username with length between 7 and 20 characters
        const baseUsername = 'user' + randomNumber;
        const additionalChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const targetLength = Math.floor(Math.random() * 14) + 7; // 7 to 20 characters
        let username = baseUsername;
        while (username.length < targetLength) {
            username += additionalChars[Math.floor(Math.random() * additionalChars.length)];
        }
        user = {
            username: username.substring(0, targetLength),
            photoUrl: 'https://picsum.photos/40?' + Math.random(),
            comment: comments[randomComment]
        };
    }
    if (typeof window.handleSimulatedComment === 'function') {
        window.handleSimulatedComment(user);
    }
};

// Sidepanel functionality
document.addEventListener('DOMContentLoaded', function() {
    const settingsIcon = document.getElementById('settingsIcon');
    const sidepanel = document.getElementById('sidepanel');
    let imageUpload = document.getElementById('imageUpload');
    let profileImage = document.getElementById('profileImage');

    // Load profile image from localStorage
    const savedImage = localStorage.getItem('profileImage');
    if (profileImage) {
        profileImage.src = savedImage || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg';
    }

    // Username logic
    const usernameInput = document.getElementById('profileUsername');
    const usernameError = document.getElementById('profileUsernameError');
    if (usernameInput) {
        // Load username from localStorage
        const savedUsername = localStorage.getItem('profileUsername') || '';
        usernameInput.value = savedUsername;
        // Save on input
        usernameInput.addEventListener('input', function() {
            const value = usernameInput.value.trim();
            if (value) {
                localStorage.setItem('profileUsername', value);
            }
        });
    }

    // Escape character logic
    const escapeCharInput = document.getElementById('escapeCharacterInput');
    if (escapeCharInput) {
        // Load escape character from localStorage, default to "."
        const savedEscapeChar = localStorage.getItem('escapeCharacter') || '.';
        escapeCharInput.value = savedEscapeChar;
        // Save on input
        escapeCharInput.addEventListener('input', function() {
            const value = escapeCharInput.value.trim();
            localStorage.setItem('escapeCharacter', value);
        });
    }

    // Modal duration logic
    const modalDurationInput = document.getElementById('modalDurationInput');
    if (modalDurationInput) {
        // Load modal duration from localStorage, default to 3 seconds
        const savedModalDuration = localStorage.getItem('modalDuration') || '3';
        modalDurationInput.value = savedModalDuration;
        // Save on input
        modalDurationInput.addEventListener('input', function() {
            const value = parseFloat(modalDurationInput.value);
            if (!isNaN(value) && value >= 2 && value <= 10) {
                localStorage.setItem('modalDuration', value.toString());
            }
        });
    }

    // Show Comments Section toggle logic
    const showCommentsToggle = document.getElementById('showCommentsToggle');
    if (showCommentsToggle) {
        // Load showCommentsSection from localStorage, default to true
        const savedShowComments = localStorage.getItem('showCommentsSection');
        if (savedShowComments === null) {
            // Default to true if no setting is saved
            localStorage.setItem('showCommentsSection', 'true');
            showCommentsToggle.checked = true;
        } else {
            showCommentsToggle.checked = savedShowComments !== 'false';
        }
        
        // Save on change
        showCommentsToggle.addEventListener('change', function() {
            localStorage.setItem('showCommentsSection', showCommentsToggle.checked.toString());
            // Apply visibility immediately when toggle changes
            applyCommentSectionVisibility();
        });
    }
    
    // Apply initial comment section visibility
    applyCommentSectionVisibility();

    // Clear Leaderboard button logic
    const clearLeaderboardBtn = document.getElementById('clearLeaderboardBtn');
    if (clearLeaderboardBtn) {
        clearLeaderboardBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear the entire leaderboard? This cannot be undone.')) {
                clearLeaderboard();
            }
        });
    }

    // Simulate Comments toggle logic
    const simulateToggle = document.getElementById('simulateCommentsToggle');
    let simulateInterval = null;
    let answerInterval = null;
    if (simulateToggle) {
        simulateToggle.addEventListener('change', function() {
            const cog = document.getElementById('settingsIcon');
            if (simulateToggle.checked) {
                if (cog) cog.classList.add('active-simulate');
                startSimulateComments();
            } else {
                if (cog) cog.classList.remove('active-simulate');
                stopSimulateComments();
            }
        });
    }
    function startSimulateComments() {
        stopSimulateComments();
        simulateInterval = setInterval(() => {
            const count = Math.floor(Math.random() * 2) + 2; // 2 or 3
            for (let i = 0; i < count; i++) {
                window.simulateComment && window.simulateComment(false);
            }
        }, 1000);
        answerInterval = setInterval(() => {
            window.simulateComment && window.simulateComment(true);
        }, 3000);
    }
    function stopSimulateComments() {
        if (simulateInterval) clearInterval(simulateInterval);
        simulateInterval = null;
        if (answerInterval) clearInterval(answerInterval);
        answerInterval = null;
    }
    // Expose handler for simulation
    window.handleSimulatedComment = function(user) {
        if (typeof window.registerComment === 'function') {
            updateGuessContainer(user.comment, { username: user.username, photoUrl: user.photoUrl, uniqueId: user.username });
            window.registerComment(user);
        }
    };

    // Expose handler for real comments
    window.handleRealComment = function(userData) {
        // Map the Chrome extension data format to our expected format
        const user = {
            username: userData.nickname,
            uniqueId: userData.uniqueId,
            photoUrl: userData.photoUrl || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg',
            comment: userData.comment || '',
            followStatus: userData.followStatus,
        };
        updateGuessContainer(user.comment, { username: user.username, photoUrl: user.photoUrl, uniqueId: user.uniqueId });
        
        if (typeof window.registerComment === 'function') {
            window.registerComment(user);
        }
    };

    // Listen for custom events from Chrome extension
    window.addEventListener('handleRealCommentEvent', function(event) {
        if (event.detail && event.detail.comment) {
            window.handleRealComment(event.detail);
            console.log('Received real comment event:', event.detail);
        }
    });

    // Test form functionality
    const testForm = document.getElementById('testForm');
    const toggleTestForm = document.getElementById('toggleTestForm');
    const testFormBody = document.getElementById('testFormBody');
    const submitTestComment = document.getElementById('submitTestComment');
    const testComment = document.getElementById('testComment');

    if (toggleTestForm && testFormBody) {
        toggleTestForm.addEventListener('click', function() {
            if (testFormBody.classList.contains('collapsed')) {
                testFormBody.classList.remove('collapsed');
                toggleTestForm.textContent = '−';
            } else {
                testFormBody.classList.add('collapsed');
                toggleTestForm.textContent = '+';
            }
        });
    }

    if (submitTestComment) {
        submitTestComment.addEventListener('click', function() {
            const username = document.getElementById('testUsername').value.trim();
            const uniqueId = document.getElementById('testUniqueId').value.trim();
            const photoUrl = document.getElementById('testPhotoUrl').value.trim();
            const comment = document.getElementById('testComment').value.trim();

            if (!comment) {
                showToast('Please enter a comment to test', 2000);
                return;
            }

            // Create test userData matching the Chrome extension format
            const testUserData = {
                username: username || 'TestUser',
                nickname: username || 'TestUser',
                uniqueId: uniqueId || 'test_' + Date.now(),
                photoUrl: photoUrl || 'https://picsum.photos/40',
                comment: comment,
                eventType: 'test'
            };

            // Call handleRealComment directly
            if (typeof window.handleRealComment === 'function') {
                window.handleRealComment(testUserData);
                console.log('Sent test comment:', testUserData);
                
                // Clear the comment field for next test
                document.getElementById('testComment').value = '';
            } else {
                showToast('handleRealComment function not found', 2000);
            }
        });
    }

    // Allow Enter key in comment field to submit
    if (testComment) {
        testComment.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                submitTestComment.click();
            }
        });
    }


    // Floating Leaderboard functionality
    const floatingLeaderboard = document.getElementById('floatingLeaderboard');
    const leaderboardHeader = document.getElementById('leaderboardHeader');
    const toggleFloatingLeaderboard = document.getElementById('toggleFloatingLeaderboard');
    const floatingLeaderboardBody = document.getElementById('floatingLeaderboardBody');
    const prevLeaderboardPage = document.getElementById('prevLeaderboardPage');
    const nextLeaderboardPage = document.getElementById('nextLeaderboardPage');
    const leaderboardPageInfo = document.getElementById('leaderboardPageInfo');

    // Pagination variables
    let currentLeaderboardPage = 1;
    const leaderboardItemsPerPage = 10;

    // Make leaderboard draggable
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };

    if (leaderboardHeader) {
        leaderboardHeader.addEventListener('mousedown', function(e) {
            if (e.target === toggleFloatingLeaderboard || 
                e.target === prevLeaderboardPage || 
                e.target === nextLeaderboardPage) return;
            isDragging = true;
            const rect = floatingLeaderboard.getBoundingClientRect();
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;
            document.addEventListener('mousemove', dragLeaderboard);
            document.addEventListener('mouseup', stopDragLeaderboard);
        });
    }

    function dragLeaderboard(e) {
        if (!isDragging) return;
        const x = e.clientX - dragOffset.x;
        const y = e.clientY - dragOffset.y;
        
        // Keep within viewport bounds
        const maxX = window.innerWidth - floatingLeaderboard.offsetWidth;
        const maxY = window.innerHeight - floatingLeaderboard.offsetHeight;
        
        floatingLeaderboard.style.left = Math.min(Math.max(0, x), maxX) + 'px';
        floatingLeaderboard.style.top = Math.min(Math.max(0, y), maxY) + 'px';
        floatingLeaderboard.style.right = 'auto';
        floatingLeaderboard.style.bottom = 'auto';
    }

    function stopDragLeaderboard() {
        isDragging = false;
        document.removeEventListener('mousemove', dragLeaderboard);
        document.removeEventListener('mouseup', stopDragLeaderboard);
    }

    // Toggle minimize/maximize
    if (toggleFloatingLeaderboard && floatingLeaderboardBody) {
        toggleFloatingLeaderboard.addEventListener('click', function() {
            if (floatingLeaderboardBody.classList.contains('collapsed')) {
                floatingLeaderboardBody.classList.remove('collapsed');
                toggleFloatingLeaderboard.textContent = '−';
            } else {
                floatingLeaderboardBody.classList.add('collapsed');
                toggleFloatingLeaderboard.textContent = '+';
            }
        });
    }

    // Pagination event listeners
    if (prevLeaderboardPage) {
        prevLeaderboardPage.addEventListener('click', function() {
            if (currentLeaderboardPage > 1) {
                currentLeaderboardPage--;
                updateFloatingLeaderboard();
            }
        });
    }

    if (nextLeaderboardPage) {
        nextLeaderboardPage.addEventListener('click', function() {
            const allUsers = getTopLeaderboardUsers(1000); // Get all users
            const totalPages = Math.ceil(allUsers.length / leaderboardItemsPerPage);
            if (currentLeaderboardPage < totalPages) {
                currentLeaderboardPage++;
                updateFloatingLeaderboard();
            }
        });
    }

    // Update leaderboard content
    function updateFloatingLeaderboard() {
        const leaderboardList = document.getElementById('leaderboardList');
        if (!leaderboardList) return;

        const allUsers = getTopLeaderboardUsers(1000); // Get all users
        const totalPages = Math.ceil(allUsers.length / leaderboardItemsPerPage);
        
        // Ensure current page is valid
        if (currentLeaderboardPage > totalPages && totalPages > 0) {
            currentLeaderboardPage = totalPages;
        }
        if (currentLeaderboardPage < 1) {
            currentLeaderboardPage = 1;
        }
        
        // Update pagination info
        if (leaderboardPageInfo) {
            leaderboardPageInfo.textContent = `${currentLeaderboardPage}/${Math.max(1, totalPages)}`;
        }
        
        // Update pagination buttons
        if (prevLeaderboardPage) {
            prevLeaderboardPage.disabled = currentLeaderboardPage <= 1;
        }
        if (nextLeaderboardPage) {
            nextLeaderboardPage.disabled = currentLeaderboardPage >= totalPages || totalPages === 0;
        }
        
        if (allUsers.length === 0) {
            leaderboardList.innerHTML = '<div class="leaderboard-empty">No players yet</div>';
        } else {
            // Calculate pagination
            const startIndex = (currentLeaderboardPage - 1) * leaderboardItemsPerPage;
            const endIndex = startIndex + leaderboardItemsPerPage;
            const pageUsers = allUsers.slice(startIndex, endIndex);
            
            leaderboardList.innerHTML = '';
            pageUsers.forEach((user, index) => {
                const globalIndex = startIndex + index + 1; // Global ranking position
                const item = document.createElement('div');
                item.className = 'leaderboard-item';
                item.innerHTML = `
                    <div class="leaderboard-user">
                        <span class="leaderboard-rank">${globalIndex}.</span>
                        <img class="leaderboard-img" src="${user.photoUrl || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'}" alt="User" />
                        <span class="leaderboard-username">${user.username}</span>
                    </div>
                    <span class="leaderboard-points">${user.totalPoints}</span>
                `;
                leaderboardList.appendChild(item);
            });
        }
    }

    // Update floating leaderboard initially and after rounds
    updateFloatingLeaderboard();
    
    // Expose function globally so it can be called from other parts of the code
    window.updateFloatingLeaderboard = updateFloatingLeaderboard;

    // Automation menu functionality
    const automateCheckbox = document.getElementById('automateCheckbox');
    const automationMenu = document.getElementById('automationMenu');
    const startAutomationBtn = document.getElementById('startAutomationBtn');

    if (automateCheckbox && automationMenu) {
        automateCheckbox.addEventListener('change', function() {
            if (automateCheckbox.checked) {
                automationMenu.style.display = 'block';
            } else {
                automationMenu.style.display = 'none';
                // Stop automation if it's running
                if (automationActive) {
                    stopAutomation();
                }
            }
        });
    }

    if (startAutomationBtn) {
        startAutomationBtn.addEventListener('click', function() {
            // Get automation settings
            const timeoutSelect = document.getElementById('automationTimeout');
            let timeoutSeconds = parseInt(timeoutSelect?.value);
            
            // Validate timeoutSeconds and provide default if NaN
            if (isNaN(timeoutSeconds) || timeoutSeconds <= 0) {
                console.warn('Invalid timeout value, using default 60 seconds');
                timeoutSeconds = 60;
            }
            
            startAutomation(timeoutSeconds);
        });
    }

    // Automation state variables
    let automationActive = false;
    let automationRoundCount = 0;
    let automationTimeout = null;
    let automationCurrentCategory = null;
    let automationTimerInterval = null;
    let automationRoundStartTime = null;
    let automationTimerPaused = false;
    let automationPausedTimeElapsed = 0;
    let automationTimeoutSeconds = 60; // Store the timeout value globally

    function startAutomation(timeoutSeconds) {
        if (automationActive) {
            console.log('Automation already running');
            return;
        }

        // Validate and store timeout seconds globally
        if (isNaN(timeoutSeconds) || timeoutSeconds <= 0) {
            console.warn('Invalid timeout value in startAutomation, using default 60 seconds');
            timeoutSeconds = 60;
        }
        automationTimeoutSeconds = timeoutSeconds;

        // Comprehensive cleanup to prevent multiple timer instances
        hideAutomationTimer();
        if (automationTimeout) {
            clearTimeout(automationTimeout);
            automationTimeout = null;
        }
        
        console.log(`Starting automation with ${timeoutSeconds} second timeout`);
        automationActive = true;
        automationRoundCount = 0;
        
        // Hide the automation menu
        const automationMenu = document.getElementById('automationMenu');
        if (automationMenu) {
            automationMenu.style.display = 'none';
        }
        
        // Start the persistent timer once
        showAutomationTimer();
        
        // Call monitorRoundCompletion only once here
        monitorRoundCompletion();
        
        // Start first round
        startAutomationRound();
    }

    function startAutomationRound() {
        if (!automationActive) {
            stopAutomation();
            return;
        }

        // Clear any existing timeout but keep the timer display running
        if (automationTimeout) {
            clearTimeout(automationTimeout);
            automationTimeout = null;
        }

        automationRoundCount++;
        console.log(`Starting automation round ${automationRoundCount}`);

        // Get categories with unplayed games
        const categoriesWithUnplayed = getCategoriesWithUnplayedGames();
        if (categoriesWithUnplayed.length === 0) {
            console.log('No unplayed games in any category, clearing game history to start fresh');
            localStorage.removeItem('playedGames');
            updateGameHistoryPercent();
            setTimeout(() => startAutomationRound(), 1000);
            return;
        }

        // Select category (change every 5 rounds or if current category has no unplayed prompts)
        let needNewCategory = false;
        if (!automationCurrentCategory || automationRoundCount % 5 === 1) {
            needNewCategory = true;
        } else {
            // Check if current category has unplayed games
            const unplayedInCurrent = getUnplayedPromptsForCategory(automationCurrentCategory);
            if (unplayedInCurrent.length === 0) {
                needNewCategory = true;
                console.log(`Category '${automationCurrentCategory}' has no unplayed games, switching category`);
            }
        }

        if (needNewCategory) {
            automationCurrentCategory = categoriesWithUnplayed[Math.floor(Math.random() * categoriesWithUnplayed.length)];
            document.getElementById('categorySelect').value = automationCurrentCategory;
            console.log(`Switched to category: ${automationCurrentCategory}`);
        }

        // Get unplayed prompts for current category
        const unplayedPrompts = getUnplayedPromptsForCategory(automationCurrentCategory);
        console.log(`Unplayed prompts in ${automationCurrentCategory}:`, unplayedPrompts.length);
        
        if (unplayedPrompts.length === 0) {
            // This shouldn't happen due to our checking above, but safety fallback
            console.log('Unexpected: No unplayed prompts found, clearing game history');
            localStorage.removeItem('playedGames');
            updateGameHistoryPercent();
            setTimeout(() => startAutomationRound(), 1000);
            return;
        }

        // Start the game round
        startAutomationGame(automationCurrentCategory);
        
        // Reset timer for this round instead of creating new timer
        resetAutomationTimer();
        
        // REMOVE THIS LINE - only call once when automation starts
        // monitorRoundCompletion();
    }

    // Start game for automation with respect to automation flow configuration
    function startAutomationGame(category) {
        if (!gameData) {
            console.error('Game data not loaded for automation');
            return;
        }

        // Get unplayed prompts for this category (respects automation flow config and played games)
        const unplayedPrompts = getUnplayedPromptsForCategory(category);
        if (unplayedPrompts.length === 0) {
            console.error(`No unplayed prompts for category: ${category}`);
            return;
        }

        // Select a random prompt from unplayed prompts only
        const randomPrompt = unplayedPrompts[Math.floor(Math.random() * unplayedPrompts.length)];
        const answers = gameData[category][randomPrompt];
        
        console.log(`Automation selected: ${category} - "${randomPrompt}"`);
        
        currentGame = {
            category: category,
            prompt: randomPrompt,
            answers: answers,
            revealed: new Array(answers.length).fill(false),
            guessed: new Set(),
            allParticipants: {}
        };
        window.currentGame = currentGame;
        
        revealedCount = 0;
        renderGame();
        document.getElementById('gameArea').style.display = 'block';
        document.getElementById('searchInput').focus();
    }

    function resetAutomationTimer() {
        // Clear any existing timeout first
        if (automationTimeout) {
            clearTimeout(automationTimeout);
            automationTimeout = null;
        }
        
        // Reset timer state for new round
        automationRoundStartTime = Date.now();
        automationTimerPaused = false;
        automationPausedTimeElapsed = 0;
        
        console.log(`Resetting timer for round ${automationRoundCount}`);
        
        // Immediately update the timer display to show full time
        updateTimerDisplay();
        
        // CRITICAL FIX: Restart the timer interval if it's not running
        if (!automationTimerInterval) {
            console.log('Restarting timer interval after timeout');
            automationTimerInterval = setInterval(() => {
                updateTimerDisplay();
            }, 1000);
        }
        
        // Set up timeout for this round - NO RECURSIVE LOGIC
        automationTimeout = setTimeout(() => {
            if (automationActive) {
                // Check if Round Winners modal is showing - if so, extend timeout
                const roundWinnersModal = document.getElementById('roundWinnersModal');
                const isModalShowing = roundWinnersModal && roundWinnersModal.style.display === 'flex';
                
                if (isModalShowing) {
                    console.log(`Timer timeout reached but Round Winners modal is showing, extending timeout...`);
                    // Reschedule timeout for 1 second later to check again - NO RECURSION
                    automationTimeout = setTimeout(() => {
                        // Check again if modal is still showing
                        const modalStillShowing = document.getElementById('roundWinnersModal') && 
                                                document.getElementById('roundWinnersModal').style.display === 'flex';
                        if (modalStillShowing) {
                            // Modal still showing, extend again - FINAL EXTENSION
                            automationTimeout = setTimeout(() => {
                                handleAutomationTimeout();
                            }, 1000);
                        } else {
                            // Modal finished, proceed with timeout logic
                            handleAutomationTimeout();
                        }
                    }, 1000);
                    return;
                }
                
                // Modal not showing, proceed with timeout logic
                handleAutomationTimeout();
            }
        }, automationTimeoutSeconds * 1000);
    }

    // Separate function to handle timeout logic
    function handleAutomationTimeout() {
        console.log(`Automation round ${automationRoundCount} timed out after ${automationTimeoutSeconds} seconds`);
        
        // Clear timeout and reset timer state
        if (automationTimeout) {
            clearTimeout(automationTimeout);
            automationTimeout = null;
        }
        automationTimerPaused = false;
        automationPausedTimeElapsed = 0;
        
        // Store the completed game as played (regardless of whether answers were found)
        if (currentGame && !currentGame.isImprov) {
            storePlayedGame(currentGame.category, currentGame.prompt);
            updateGameHistoryPercent();
            console.log(`Stored as played (timeout): ${currentGame.category} - "${currentGame.prompt}"`);
        }
        
        // Show winners if any answers were found, then move to next round
        if (revealedCount > 0 && !roundWinnersModalShown) {
            roundWinnersModalShown = true;
            setTimeout(() => {
                showRoundWinnersModal();
            }, 500);
        } else {
            // No answers found, just move to next round
            setTimeout(() => startAutomationRound(), 1000);
        }
    }

    function monitorRoundCompletion() {
        // Override the showRoundWinnersModal to detect when round is complete
        const originalShowRoundWinnersModal = window.showRoundWinnersModal || showRoundWinnersModal;
        
        function automationRoundWinnersModal() {
            // Pause the timer when leaderboard is showing
            if (automationActive && !automationTimerPaused) {
                automationTimerPaused = true;
                automationPausedTimeElapsed = Math.floor((Date.now() - automationRoundStartTime) / 1000);
                console.log(`Timer paused at ${automationPausedTimeElapsed} seconds for leaderboard display`);
            }
            
            // Call original function
            if (originalShowRoundWinnersModal) {
                originalShowRoundWinnersModal();
            }
            
            // If automation is active, wait for modal duration then continue
            if (automationActive) {
                clearTimeout(automationTimeout); // Cancel timeout since round completed
                
                // Store the completed game as played
                if (currentGame && !currentGame.isImprov) {
                    storePlayedGame(currentGame.category, currentGame.prompt);
                    updateGameHistoryPercent();
                    console.log(`Stored as played: ${currentGame.category} - "${currentGame.prompt}"`);
                }
                
                // Get modal duration
                const savedDuration = localStorage.getItem('modalDuration');
                const modalDurationInput = document.getElementById('modalDurationInput');
                let duration = 3; // default
                
                if (savedDuration) {
                    duration = parseFloat(savedDuration);
                } else if (modalDurationInput) {
                    duration = parseFloat(modalDurationInput.value) || 3;
                }
                
                console.log(`Automation round ${automationRoundCount} completed. Waiting ${duration} seconds for modal.`);
                
                // Wait for modal duration + small buffer, then start next round
                setTimeout(() => {
                    if (automationActive) {
                        // Reset timer pause state before starting next round (for consistency)
                        automationTimerPaused = false;
                        automationPausedTimeElapsed = 0;
                        startAutomationRound();
                    }
                }, (duration * 1000) + 500); // Add 500ms buffer
            }
        }
        
        // Temporarily replace the function
        window.showRoundWinnersModal = automationRoundWinnersModal;
    }

    function getAvailableAutomationCategories() {
        if (!window.gameData) return [];
        
        const availableCategories = [];
        Object.keys(window.gameData).forEach(category => {
            // Skip if category is disabled in automation config
            const categoryConfig = automationConfig[category];
            if (categoryConfig && categoryConfig.disabledPrompts && 
                categoryConfig.disabledPrompts.length === Object.keys(window.gameData[category]).length) {
                return; // Category completely disabled
            }
            availableCategories.push(category);
        });
        
        return availableCategories;
    }

    function getAvailablePromptsForCategory(category) {
        if (!window.gameData || !window.gameData[category]) return [];
        
        const allPrompts = Object.keys(window.gameData[category]);
        const categoryConfig = automationConfig[category];
        
        // Filter out disabled prompts
        let availablePrompts = allPrompts;
        if (categoryConfig && categoryConfig.disabledPrompts) {
            availablePrompts = allPrompts.filter(prompt => 
                !categoryConfig.disabledPrompts.includes(prompt)
            );
        }
        
        return availablePrompts;
    }

    function getUnplayedPromptsForCategory(category) {
        if (!window.gameData || !window.gameData[category]) return [];
        
        // Get all available prompts (respects automation config)
        const availablePrompts = getAvailablePromptsForCategory(category);
        
        // Get played games
        const playedGames = getPlayedGames();
        const playedInCategory = playedGames[category] || [];
        
        // Filter out played prompts
        const unplayedPrompts = availablePrompts.filter(prompt => 
            !playedInCategory.includes(prompt)
        );
        
        return unplayedPrompts;
    }

    function getCategoriesWithUnplayedGames() {
        if (!window.gameData) return [];
        
        const availableCategories = getAvailableAutomationCategories();
        const categoriesWithUnplayed = [];
        
        availableCategories.forEach(category => {
            const unplayedPrompts = getUnplayedPromptsForCategory(category);
            if (unplayedPrompts.length > 0) {
                categoriesWithUnplayed.push(category);
            }
        });
        
        return categoriesWithUnplayed;
    }

    function showAutomationTimer() {
        const automationTimer = document.getElementById('automationTimer');
        const timerText = document.getElementById('timerText');
        
        if (!automationTimer || !timerText) return;
        
        // Clear any existing timer interval to prevent multiple timers
        if (automationTimerInterval) {
            clearInterval(automationTimerInterval);
            automationTimerInterval = null;
        }
        
        console.log('Starting automation timer');
        automationTimer.style.display = 'flex';
        automationRoundStartTime = Date.now();
        
        // Update timer immediately
        updateTimerDisplay();
        
        // Update timer every second
        automationTimerInterval = setInterval(() => {
            updateTimerDisplay();
        }, 1000);
    }

    function updateTimerDisplay() {
        const timerText = document.getElementById('timerText');
        if (!timerText || !automationRoundStartTime) return;
        
        // Validate that we have a proper timeout value
        if (isNaN(automationTimeoutSeconds) || automationTimeoutSeconds <= 0) {
            timerText.textContent = '1:00'; // Show default 1 minute if invalid
            return;
        }
        
        let elapsed;
        if (automationTimerPaused) {
            // Use the paused elapsed time when timer is paused
            elapsed = automationPausedTimeElapsed;
        } else {
            // Calculate elapsed time normally
            elapsed = Math.floor((Date.now() - automationRoundStartTime) / 1000);
        }
        
        // Ensure elapsed time is not negative
        elapsed = Math.max(0, elapsed);
        
        const remaining = Math.max(0, automationTimeoutSeconds - elapsed);
        
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        
        timerText.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Only stop timer if time is up AND not paused
        if (remaining <= 0 && automationTimerInterval && !automationTimerPaused) {
            clearInterval(automationTimerInterval);
            automationTimerInterval = null;
        }
    }

    function hideAutomationTimer() {
        const automationTimer = document.getElementById('automationTimer');
        
        if (automationTimer) {
            automationTimer.style.display = 'none';
        }
        
        if (automationTimerInterval) {
            clearInterval(automationTimerInterval);
            automationTimerInterval = null;
        }
        
        // Reset timer state
        automationRoundStartTime = null;
        automationTimerPaused = false;
        automationPausedTimeElapsed = 0;
    }

    function stopAutomation() {
        console.log(`Automation stopped after ${automationRoundCount} rounds`);
        
        // Clear all automation state
        automationActive = false;
        automationRoundCount = 0;
        automationCurrentCategory = null;
        
        // Clear timer
        hideAutomationTimer();
        
        if (automationTimeout) {
            clearTimeout(automationTimeout);
            automationTimeout = null;
        }
        
        // Restore original showRoundWinnersModal function
        if (window.showRoundWinnersModal !== showRoundWinnersModal) {
            window.showRoundWinnersModal = showRoundWinnersModal;
        }
        
        // Uncheck the automation checkbox
        const automateCheckbox = document.getElementById('automateCheckbox');
        if (automateCheckbox && automateCheckbox.checked) {
            automateCheckbox.checked = false;
            // Also hide the menu if it's showing
            const automationMenu = document.getElementById('automationMenu');
            if (automationMenu) {
                automationMenu.style.display = 'none';
            }
        }
        
        showToast('Automation completed!');
    }

    // Automation Flow modal logic
    const automationBtn = document.getElementById('automationFlowConfigureBtn');
    const automationModal = document.getElementById('automationFlowModal');
    const automationModalClose = document.getElementById('automationFlowModalClose');
    const automationModalBody = document.getElementById('automationFlowModalBody');
    const automationModalSave = document.getElementById('automationFlowModalSave');
    let automationConfig = {};
    // Load config from localStorage
    try {
        automationConfig = JSON.parse(localStorage.getItem('automationFlowConfig') || '{}');
    } catch (e) { automationConfig = {}; }
    
    // Set default exclusions if config is empty
    if (Object.keys(automationConfig).length === 0 && window.gameData) {
        // Exclude "Names" category by default
        if (window.gameData['Names']) {
            automationConfig['Names'] = {
                disabledPrompts: Object.keys(window.gameData['Names'])
            };
            localStorage.setItem('automationFlowConfig', JSON.stringify(automationConfig));
        }
    }
    function renderAutomationModal() {
        automationModalBody.innerHTML = '';
        if (!window.gameData) return;

        Object.keys(window.gameData).forEach(category => {
            const catId = `automation-cat-${category}`;
            const catDiv = document.createElement('div');
            catDiv.className = 'automation-category-flat';

            // Category row with checkbox
            const catRow = document.createElement('div');
            catRow.className = 'automation-category-row';
            const catCheckbox = document.createElement('input');
            catCheckbox.type = 'checkbox';
            catCheckbox.id = catId;
            catRow.appendChild(catCheckbox);
            catRow.appendChild(document.createTextNode(category + " ▼"));
            catDiv.appendChild(catRow);

            // Prompts container (hidden by default)
            const promptsContainer = document.createElement('div');
            promptsContainer.className = 'automation-prompts-hidden';

            // Prompts
            const categoryConfig = automationConfig[category];
            const prompts = Object.keys(window.gameData[category]);
            const promptCheckboxes = [];
            prompts.forEach(prompt => {
                const promptId = `automation-prompt-${category}-${prompt}`;
                const promptRow = document.createElement('div');
                promptRow.className = 'automation-prompt-row';
                const promptCheckbox = document.createElement('input');
                promptCheckbox.type = 'checkbox';
                promptCheckbox.id = promptId;
                promptCheckbox.checked = !(
                    categoryConfig &&
                    Array.isArray(categoryConfig.disabledPrompts) &&
                    categoryConfig.disabledPrompts.includes(prompt)
                );
                promptCheckboxes.push(promptCheckbox);
                promptRow.appendChild(promptCheckbox);
                promptRow.appendChild(document.createTextNode(prompt));
                promptsContainer.appendChild(promptRow);
            });
            catDiv.appendChild(promptsContainer);

            // Set category checkbox state based on prompts
            function updateCategoryCheckbox() {
                const anyChecked = promptCheckboxes.some(cb => cb.checked);
                catCheckbox.checked = anyChecked;
            }
            updateCategoryCheckbox();

            // Category checkbox event: check/uncheck all prompts
            catCheckbox.addEventListener('change', function() {
                promptCheckboxes.forEach(cb => {
                    cb.checked = catCheckbox.checked;
                });
            });

            // Prompt checkbox event: update category checkbox
            promptCheckboxes.forEach(cb => {
                cb.addEventListener('change', updateCategoryCheckbox);
            });

            // Toggle prompt visibility on category row click (not on checkbox click)
            catRow.addEventListener('click', function(e) {
                if (e.target.type === 'checkbox') return;
                if (promptsContainer.classList.contains('automation-prompts-hidden')) {
                    promptsContainer.classList.remove('automation-prompts-hidden');
                    promptsContainer.classList.add('automation-prompts-visible');
                } else {
                    promptsContainer.classList.remove('automation-prompts-visible');
                    promptsContainer.classList.add('automation-prompts-hidden');
                }
            });

            automationModalBody.appendChild(catDiv);
        });
    }
    if (automationBtn && automationModal && automationModalClose) {
        automationBtn.addEventListener('click', () => {
            renderAutomationModal();
            automationModal.style.display = 'flex';
        });
        automationModalClose.addEventListener('click', () => {
            automationModal.style.display = 'none';
        });
        automationModalSave.addEventListener('click', () => {
            // Read config from checkboxes
            const newConfig = {};
            Object.keys(window.gameData).forEach(category => {
                const catId = `automation-cat-${category}`;
                const catChecked = document.getElementById(catId).checked;
                if (!catChecked) {
                    // If category is unchecked, mark it as false and include all prompts as disabled
                    newConfig[category] = {
                        disabledPrompts: Object.keys(window.gameData[category])
                    };
                } else {
                    // Check prompts only if category is checked
                    const disabledPrompts = [];
                    Object.keys(window.gameData[category]).forEach(prompt => {
                        const promptId = `automation-prompt-${category}-${prompt}`;
                        if (!document.getElementById(promptId).checked) {
                            disabledPrompts.push(prompt);
                        }
                    });
                    if (disabledPrompts.length > 0) {
                        newConfig[category] = { disabledPrompts };
                    }
                }
            });
            automationConfig = newConfig;
            localStorage.setItem('automationFlowConfig', JSON.stringify(automationConfig));
            automationModal.style.display = 'none';
        });
    }

    // Initialize event listeners
    initializeEventListeners();

    function initializeEventListeners() {
        // Toggle sidepanel
        settingsIcon.addEventListener('click', () => {
            sidepanel.classList.toggle('open');
        });

        // Close button in header
        const closeBtn = document.getElementById('sidepanelClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                sidepanel.classList.remove('open');
            });
        }

        // Multiple accordions
        const accordionHeaders = sidepanel.querySelectorAll('.accordion-header');
        accordionHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const content = this.nextElementSibling;
                content.classList.toggle('open');
                const icon = this.querySelector('.accordion-icon');
                icon.textContent = content.classList.contains('open') ? '▼' : '▲';
            });
        });

        // Handle image upload
        if (imageUpload) {
            imageUpload.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const imageData = e.target.result;
                        profileImage.src = imageData;
                        localStorage.setItem('profileImage', imageData);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Close sidepanel when clicking outside
        document.addEventListener('click', (e) => {
            if (!sidepanel.contains(e.target) && !settingsIcon.contains(e.target)) {
                sidepanel.classList.remove('open');
            }
        });
    }
});

// --- Game History Storage ---
function storePlayedGame(category, prompt) {
    let playedGames = {};
    try {
        playedGames = JSON.parse(localStorage.getItem('playedGames') || '{}');
    } catch (e) { playedGames = {}; }
    if (!playedGames[category]) playedGames[category] = [];
    if (!playedGames[category].includes(prompt)) {
        playedGames[category].push(prompt);
        localStorage.setItem('playedGames', JSON.stringify(playedGames));
    }
}

function getPlayedGames() {
    try {
        return JSON.parse(localStorage.getItem('playedGames') || '{}');
    } catch (e) { return {}; }
}

// --- Game History UI ---
function getGameHistoryStats() {
    if (!window.gameData) return { played: 0, total: 0, percent: 0 };
    const played = getPlayedGames();
    let playedCount = 0;
    let totalCount = 0;
    Object.keys(window.gameData).forEach(category => {
        const prompts = Object.keys(window.gameData[category]);
        totalCount += prompts.length;
        if (played[category]) {
            playedCount += played[category].length;
        }
    });
    const percent = totalCount === 0 ? 0 : Math.round((playedCount / totalCount) * 100);
    return { played: playedCount, total: totalCount, percent };
}

function updateGameHistoryPercent() {
    const stats = getGameHistoryStats();
    const el = document.getElementById('gameHistoryPercent');
    if (el) {
        el.textContent = `Played: ${stats.played} / ${stats.total}`;
    }
}

// --- Game History Modal ---
function showGameHistoryModal() {
    // Remove existing modal if present
    const oldModal = document.getElementById('gameHistoryModal');
    if (oldModal) oldModal.remove();

    // Modal container
    const modal = document.createElement('div');
    modal.id = 'gameHistoryModal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.35)';
    modal.style.zIndex = '4000';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';

    // Modal content
    const content = document.createElement('div');
    content.style.background = '#fff';
    content.style.borderRadius = '12px';
    content.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
    content.style.width = '420px';
    content.style.maxWidth = '95vw';
    content.style.height = '320px';
    content.style.maxHeight = '90vh';
    content.style.overflowY = 'auto';
    content.style.padding = '0';
    content.style.display = 'flex';
    content.style.flexDirection = 'column';

    // Header
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    header.style.padding = '18px 24px 12px 24px';
    header.style.borderBottom = '1px solid #eee';
    header.innerHTML = `<span style="font-size:1.3rem;font-weight:bold;color:#222;">Game History</span><span style="font-size:2rem;cursor:pointer;color:#888;" id="gameHistoryModalClose">&times;</span>`;
    content.appendChild(header);

    // Stats and erase button
    const stats = getGameHistoryStats();
    const statsDiv = document.createElement('div');
    statsDiv.style.display = 'flex';
    statsDiv.style.alignItems = 'center';
    statsDiv.style.justifyContent = 'space-between';
    statsDiv.style.padding = '16px 24px 8px 24px';
    statsDiv.innerHTML = `<span style="color:#444;">Played: ${stats.played} / ${stats.total} (${stats.percent}%)</span><button id="eraseGameHistoryBtn" class="btn" style="margin-left:16px;">Erase History</button>`;
    content.appendChild(statsDiv);

    // Category and prompt list
    const played = getPlayedGames();
    const listDiv = document.createElement('div');
    listDiv.style.padding = '0 24px 24px 24px';
    Object.keys(window.gameData).forEach(category => {
        const catTitle = document.createElement('div');
        catTitle.style.fontWeight = 'bold';
        catTitle.style.margin = '12px 0 4px 0';
        catTitle.style.fontSize = '1.08rem';
        catTitle.textContent = category;
        listDiv.appendChild(catTitle);
        Object.keys(window.gameData[category]).forEach(prompt => {
            const playedThis = played[category] && played[category].includes(prompt);
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.gap = '8px';
            row.style.fontSize = '0.97rem';
            row.style.marginLeft = '18px';
            row.style.justifyContent = 'space-between';
            
            const leftContent = document.createElement('div');
            leftContent.style.display = 'flex';
            leftContent.style.alignItems = 'center';
            leftContent.style.gap = '8px';
            leftContent.innerHTML = playedThis ? '<span style="color:#22bb33;">✅</span>' : '<span style="color:#bbb;">⬜</span>';
            leftContent.innerHTML += `<span>${prompt}</span>`;
            
            row.appendChild(leftContent);
            
            // Only add play button for unplayed games
            if (!playedThis) {
                const playButton = document.createElement('button');
                playButton.className = 'btn';
                playButton.style.padding = '4px 12px';
                playButton.style.fontSize = '0.9rem';
                playButton.textContent = 'Play';
                playButton.onclick = () => {
                    modal.remove();
                    startGame(category);
                    // Find and select the prompt in the game data
                    const answers = window.gameData[category][prompt];
                    currentGame = {
                        category: category,
                        prompt: prompt,
                        answers: answers,
                        revealed: new Array(answers.length).fill(false),
                        guessed: new Set()
                    };
                    window.currentGame = currentGame;
                    revealedCount = 0;
                    renderGame();
                    document.getElementById('gameArea').style.display = 'block';
                    document.getElementById('searchInput').focus();
                };
                row.appendChild(playButton);
            }
            
            listDiv.appendChild(row);
        });
    });
    content.appendChild(listDiv);

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Close modal when clicking outside the content
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });

    // Close modal
    document.getElementById('gameHistoryModalClose').onclick = () => modal.remove();
    // Erase history
    document.getElementById('eraseGameHistoryBtn').onclick = () => {
        localStorage.removeItem('playedGames');
        modal.remove();
        updateGameHistoryPercent();
        showToast('Game history erased!');
    };
}

// --- Update percent on load and after game actions ---
document.addEventListener('DOMContentLoaded', function() {
    updateGameHistoryPercent();
    // ... existing code ...
    const gameHistoryManageBtn = document.getElementById('gameHistoryManageBtn');
    if (gameHistoryManageBtn) {
        gameHistoryManageBtn.addEventListener('click', function() {
            showGameHistoryModal();
        });
    }
    const chooseGameBtn = document.getElementById('chooseGameBtn');
    if (chooseGameBtn) {
        chooseGameBtn.addEventListener('click', function() {
            showGameHistoryModal();
        });
    }
});

// --- Next Game Logic ---
function nextGame() {
    if (!currentGame || !gameData) return;
    
    // Next game not supported for improv mode
    if (currentGame.isImprov) {
        showMessage('Next game not available in improv mode', 'error');
        return;
    }
    
    // Store the current game as played
    storePlayedGame(currentGame.category, currentGame.prompt);
    updateGameHistoryPercent();
    // Find next unplayed prompt in the same category
    const played = getPlayedGames();
    const prompts = Object.keys(gameData[currentGame.category]);
    const unplayed = prompts.filter(p => !(played[currentGame.category] || []).includes(p));
    if (unplayed.length === 0) {
        showToast('All prompts in this category have been played! Starting over.');
        // Optionally, clear played for this category
        localStorage.setItem('playedGames', JSON.stringify({ ...played, [currentGame.category]: [] }));
        startGame(currentGame.category);
    } else {
        // Pick a random unplayed prompt
        const nextPrompt = unplayed[Math.floor(Math.random() * unplayed.length)];
        const answers = gameData[currentGame.category][nextPrompt];
        currentGame = {
            category: currentGame.category,
            prompt: nextPrompt,
            answers: answers,
            revealed: new Array(answers.length).fill(false),
            guessed: new Set()
        };
        window.currentGame = currentGame;
        revealedCount = 0;
        renderGame();
        document.getElementById('gameArea').style.display = 'block';
        document.getElementById('searchInput').focus();
    }
}

// --- Patch Give Up to store played game ---
const originalGiveUp = giveUp;
giveUp = function() {
    if (currentGame && !currentGame.isImprov) {
        // Only store preset games in history, not improv games
        storePlayedGame(currentGame.category, currentGame.prompt);
        updateGameHistoryPercent();
    }
    originalGiveUp();
}

// --- Next Game Button Event ---
document.addEventListener('DOMContentLoaded', function() {
    const nextGameBtn = document.getElementById('nextGameBtn');
    if (nextGameBtn) {
        nextGameBtn.addEventListener('click', nextGame);
    }
    
    // Clear Improv Button Event
    const clearImprovBtn = document.getElementById('clearImprovBtn');
    if (clearImprovBtn) {
        clearImprovBtn.addEventListener('click', clearImprovMode);
    }
    
    // Stub for Game History Manage button
    const gameHistoryManageBtn = document.getElementById('gameHistoryManageBtn');
    if (gameHistoryManageBtn) {
        gameHistoryManageBtn.addEventListener('click', function() {
            showGameHistoryModal();
        });
    }
});

// Remove escape character from beginning of guess if it matches the host's setting
function removeEscapeCharacter(guess) {
    const escapeCharInput = document.getElementById('escapeCharacterInput');
    const escapeChar = escapeCharInput ? escapeCharInput.value.trim() : '';
    
    // If no escape character is set, return the guess unchanged
    if (!escapeChar) {
        return guess;
    }
    
    // If guess starts with the escape character, remove it
    if (guess.startsWith(escapeChar)) {
        return guess.substring(escapeChar.length);
    }
    
    return guess;
}

// Show Round Winners modal
function showRoundWinnersModal() {
    const modal = document.getElementById('roundWinnersModal');
    const modalBody = document.getElementById('roundWinnersModalBody');
    
    if (!modal || !modalBody) return;
    
    // Clear previous content
    modalBody.innerHTML = '';
    
    // Get all participants (not just those who got answers correct)
    const allParticipants = currentGame.allParticipants || {};
    // FILTER: Only include participants with at least 1 correct answer
    const participantsWithCorrectAnswers = Object.values(allParticipants).filter(participant => participant.correctAnswers > 0);
    const sortedParticipants = participantsWithCorrectAnswers.sort((a, b) => b.correctAnswers - a.correctAnswers);
    
    // Log round summary
    console.log('🏆 ROUND COMPLETE');
    console.log('📊 Round Participants (with correct answers):');
    sortedParticipants.forEach((participant, index) => {
        const user = participant.user;
        console.log(`  ${index + 1}. ${user.username} (${user.uniqueId}): ${participant.correctAnswers} correct, ${participant.totalGuesses} total guesses`);
    });
    
    if (sortedParticipants.length === 0) {
        // No participants with correct answers found, show default message
        modalBody.innerHTML = '<div style="text-align: center; color: #666; font-size: 1.1rem;">No correct answers in this round!</div>';
    } else {
        // Update leaderboard with points from this round (only for users who got answers correct)
        const userScores = currentGame.userScores || {};
        const leaderboard = updateLeaderboard(userScores);
        
        // Display participants with correct answers
        sortedParticipants.forEach(participant => {
            const user = participant.user;
            const correctAnswers = participant.correctAnswers;
            const totalGuesses = participant.totalGuesses;
            const userId = user.uniqueId;
            const totalPoints = leaderboard[userId] ? leaderboard[userId].totalPoints : correctAnswers;
            const userImg = user.photoUrl || localStorage.getItem('profileImage') || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg';
            const username = user.username || user.nickname || 'Anonymous';
            
            const participantItem = document.createElement('div');
            participantItem.className = 'round-winner-item';
            participantItem.innerHTML = `
                <div class="round-winner-user">
                    <img class="round-winner-img" src="${userImg}" alt="User" />
                    <span class="round-winner-username">${username}</span>
                </div>
                <div class="round-winner-score">
                    <span>${correctAnswers}</span>
                </div>
            `;
            modalBody.appendChild(participantItem);
        });
    }
    
    // Log complete leaderboard
    const completeLeaderboard = getLeaderboard();
    const topUsers = getTopLeaderboardUsers(20); // Get top 20 for logging
    console.log('🥇 COMPLETE LEADERBOARD:');
    if (topUsers.length === 0) {
        console.log('  No users in leaderboard yet');
    } else {
        topUsers.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.username} (${user.userId}): ${user.totalPoints} total points, ${user.gamesPlayed} games played`);
        });
    }
    console.log('---');
    
    // Update floating leaderboard
    if (typeof window.updateFloatingLeaderboard === 'function') {
        window.updateFloatingLeaderboard();
    }
    
    // Show the modal
    modal.style.display = 'flex';
    
    // Get modal duration from settings (localStorage first, then input field, default 3 seconds)
    const savedDuration = localStorage.getItem('modalDuration');
    const modalDurationInput = document.getElementById('modalDurationInput');
    let duration = 3; // default
    
    if (savedDuration) {
        duration = parseFloat(savedDuration);
    } else if (modalDurationInput) {
        duration = parseFloat(modalDurationInput.value) || 3;
    }
    
    // Hide modal after specified duration
    setTimeout(() => {
        modal.style.display = 'none';
    }, duration * 1000);
}

// Update answers accordion content
function updateAnswersAccordion() {
    const answersContent = document.getElementById('answersContent');
    if (!answersContent) return;
    
    if (!currentGame || !currentGame.answers) {
        answersContent.innerHTML = '<div style="color: #999; font-style: italic; text-align: center; padding: 16px;">Not currently playing</div>';
        return;
    }
    
    // Clear existing content
    answersContent.innerHTML = '';
    
    // Add each answer with its status
    currentGame.answers.forEach((answer, index) => {
        const isRevealed = currentGame.revealed[index];
        const answerItem = document.createElement('div');
        answerItem.className = `answer-item ${isRevealed ? 'revealed' : ''}`;
        
        answerItem.innerHTML = `
            <div class="answer-text">${answer}</div>
            <div class="answer-status ${isRevealed ? 'revealed' : 'hidden'}">
                ${isRevealed ? 'Found' : 'Hidden'}
            </div>
        `;
        
        answersContent.appendChild(answerItem);
    });
}

// Show toast notification
function showToast(message, duration = 4000) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Show toast with animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Hide and remove toast after duration
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300); // Wait for hide animation
    }, duration);
}

// Leaderboard management functions
function getLeaderboard() {
    try {
        return JSON.parse(localStorage.getItem('gameLeaderboard') || '{}');
    } catch (e) {
        return {};
    }
}

function updateLeaderboard(userScores) {
    const leaderboard = getLeaderboard();
    
    // Add points from this round to the leaderboard
    Object.values(userScores).forEach(userScore => {
        const user = userScore.user;
        const points = userScore.count;
        const userId = user.uniqueId;
        const username = user.username;
        
        if (!leaderboard[userId]) {
            leaderboard[userId] = {
                totalPoints: 0,
                username: username,
                photoUrl: user.photoUrl,
                gamesPlayed: 0
            };
        }
        
        leaderboard[userId].totalPoints += points;
        leaderboard[userId].gamesPlayed++;
        leaderboard[userId].username = username; // Update username in case it changed
        leaderboard[userId].photoUrl = user.photoUrl; // Update photo in case it changed
    });
    
    localStorage.setItem('gameLeaderboard', JSON.stringify(leaderboard));
    return leaderboard;
}

function getTopLeaderboardUsers(limit = 10) {
    const leaderboard = getLeaderboard();
    return Object.entries(leaderboard)
        .map(([userId, data]) => ({ userId, ...data }))
        .filter(user => user.totalPoints > 0) // FILTER: Only include users with points
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, limit);
}

function clearLeaderboard() {
    localStorage.removeItem('gameLeaderboard');
    showToast('Leaderboard cleared!');
    
    // Update floating leaderboard immediately
    if (typeof window.updateFloatingLeaderboard === 'function') {
        window.updateFloatingLeaderboard();
    }
}

// Dark mode toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        // Load dark mode setting from localStorage, default to false (light mode)
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode === null) {
            // Default to light mode if no setting is saved
            localStorage.setItem('darkMode', 'false');
        }
        
        // Apply initial dark mode state
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        }
        
        // Toggle dark mode on click
        darkModeToggle.addEventListener('click', function() {
            const isCurrentlyDark = document.body.classList.contains('dark-mode');
            if (isCurrentlyDark) {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'false');
            } else {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'true');
            }
        });
    }
});