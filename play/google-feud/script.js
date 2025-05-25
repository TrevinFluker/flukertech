let gameData = null;

let currentGame = null;
let score = 0;
let revealedCount = 0;
let simulateCommentCount = 0;

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
            "People": "👥"
        };
        
        Object.keys(gameData).forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = `${categoryEmojis[category] || '📋'} ${category}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading game data:', error);
        alert('Failed to load game data. Please refresh the page.');
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
        guessed: new Set()
    };
    window.currentGame = currentGame;
    
    revealedCount = 0;
    score = 0;
    renderGame();
    document.getElementById('gameArea').style.display = 'block';
    document.getElementById('searchInput').focus();
}

// New game with same category
function newGame() {
    if (!currentGame) return;
    startGame(currentGame.category);
}

// Render the game interface
function renderGame() {
    if (!currentGame) return;
    
    document.getElementById('searchPrompt').textContent = currentGame.prompt;
    document.getElementById('scoreBottom').textContent = score;
    
    const suggestionsList = document.getElementById('suggestionsList');
    suggestionsList.innerHTML = '';
    
    currentGame.answers.forEach((answer, index) => {
        const suggestion = document.createElement('div');
        suggestion.className = 'suggestion' + (currentGame.revealed[index] ? ' revealed' : '');
        
        const points = (10 - index) * 1000;
        
        let userImg = localStorage.getItem('profileImage') || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg';
        let username = localStorage.getItem('profileUsername') || '';
        if (currentGame.revealed[index] && currentGame.userInfo && currentGame.userInfo[index]) {
            userImg = currentGame.userInfo[index].photoUrl;
            username = currentGame.userInfo[index].username;
        }

        suggestion.innerHTML = `
            <span class="suggestion-icon">🔍</span>
            ${!currentGame.revealed[index] ? `<span class="suggestion-text">
                ${currentGame.prompt}
                <span class="${currentGame.revealed[index] ? 'answer-revealed' : 'answer-covered'}" 
                      data-answer="${answer}">
                    ${currentGame.revealed[index] ? answer : answer}
                </span>
            </span>` : `<span class="${currentGame.revealed[index] ? 'answer-revealed' : 'answer-covered'}" data-answer="${answer}">${currentGame.revealed[index] ? answer : answer}</span>`}
            ${currentGame.revealed[index] ? `<span class="suggestion-userinfo"><img class="suggestion-userimg" src="${userImg}" alt="User" /><span class="suggestion-username">${username}</span></span>` : ''}
            <span class="suggestion-score ${currentGame.revealed[index] ? 'revealed' : ''}">
                ${points.toLocaleString()}
            </span>
        `;
        
        suggestionsList.appendChild(suggestion);
    });
}

// Check guess against answers using the provided logic
function checkGuess(guess, userInfo) {
    if (!guess || !currentGame) return;
    guess = guess.trim();
    if (currentGame.guessed.has(guess.toLowerCase())) return;
    currentGame.guessed.add(guess.toLowerCase());
    const answersForMatching = currentGame.answers.map((answer, index) => ({
        answer: answer,
        found: currentGame.revealed[index],
        index: index
    }));
    const matches = checkGuessLogic(guess, answersForMatching);
    let found = matches.length > 0;
    matches.forEach(match => {
        if (!currentGame.revealed[match.index]) {
            currentGame.revealed[match.index] = true;
            const points = (10 - match.index) * 1000;
            score += points;
            revealedCount++;
            // Store user info if provided
            if (!currentGame.userInfo) currentGame.userInfo = {};
            if (userInfo) {
                currentGame.userInfo[match.index] = userInfo;
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
    if (revealedCount === currentGame.answers.length) {
        setTimeout(() => {
            alert(`Congratulations! You found all answers! Final Score: ${score.toLocaleString()}`);
        }, 500);
    }
}

// The provided matching logic
function checkGuessLogic(guess, answers) {
    guess = guess.trim()
    // Helper function to remove apostrophes and handle plural forms for each word
    function normalizePhrase(phrase) {
        return phrase
            .replace(/'/g, "")  // Remove all apostrophes
            .split(' ')         // Split phrase into words
            .map(word => {
                if (word.endsWith('es')) {
                    return word.slice(0, -2);  // Remove 'es'
                } else if (word.endsWith('s')) {
                    return word.slice(0, -1);  // Remove 's'
                }
                return word;
            })
            .join(' ');  // Join words back into a normalized phrase
    }
    
    // Normalize guess by removing apostrophes and plurals
    let normalizedGuess = normalizePhrase(guess.toLowerCase());
    
    // Array to hold all matching results
    const matches = [];
    
    // Iterate through the answers that are not found and check for all matches
    for (let answerObj of answers.filter(answer => !answer.found)) {
        // Normalize each answer by removing apostrophes and plurals
        let normalizedAnswer = normalizePhrase(answerObj.answer.toLowerCase());
        
        // Split the normalized answer into words for exact word matching
        let answerWords = normalizedAnswer.split(' ');
        
        // 1. Check for an exact match (for entire phrases)
        if (normalizedGuess === normalizedAnswer) {
            matches.push(answerObj);  // Exact match found, add to results
            continue;  // Skip further checks for this answer
        }
        
        if (normalizedAnswer.includes(normalizedGuess) && normalizedGuess.includes(' ')) {
            matches.push(answerObj);  // Substring match found, add to results
            continue;
        }
        
        if (normalizedAnswer.split('-').includes(normalizedGuess) && normalizedGuess.length > 3) {
            matches.push(answerObj);  // Hyphenated word match found, add to results
            continue;
        }
                
        if (normalizedAnswer === normalizedGuess.replaceAll(" ", "-")) {
            matches.push(answerObj);  // Hyphenated word match found, add to results
            continue;
        }
        
        if (normalizedGuess.endsWith('e')) {
            // Remove the last 'e' and compare to normalizedAnswer
            normalizedGuessWoE = normalizedGuess.slice(0, -1);
            if (normalizedGuessWoE === normalizedAnswer) {
                matches.push(answerObj);  // Exact match after modification
                continue;
            }
        }
        
        // 2. Check if the guess matches any individual word in the answer (word-on-word matching)
        if (answerWords.includes(normalizedGuess) && normalizedGuess.length > 3) {
            matches.push(answerObj);  // Exact word match found, add to results
            continue;  // Skip further checks for this answer
        }
        
        // 3. If the guess is longer than 3 characters, check for phrase matches
        if (normalizedGuess.length > 3) {
            // Check if the guess is a **prefix** of the normalized answer (not just anywhere)
            if (normalizedAnswer.startsWith(normalizedGuess)) {
                matches.push(answerObj);  // Partial phrase match found, add to results
                continue;  // Skip further checks for this answer
            }
        }
    }
    
    // Return all matches found (or empty array if none)
    return matches;
}

// Give up and reveal all answers
function giveUp() {
    if (!currentGame) return;
    
    currentGame.revealed.fill(true);
    revealedCount = currentGame.answers.length;
    renderGame();
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

// Handle category selection
document.getElementById('categorySelect').addEventListener('change', function(e) {
    if (e.target.value) {
        startGame(e.target.value);
    }
});

// Initialize the game
initCategories();

window.registerSimulatedComment = function(user) {
    const container = document.getElementById('simulatedComments');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'simulated-comment-row';
    row.innerHTML = `
        <span class="simulated-comment-user">
            <img class="simulated-comment-img" src="${user.photoUrl}" alt="User" />
            <span class="simulated-comment-username">${user.username}</span>
        </span>
        <span class="simulated-comment-guess">${user.comment}</span>
    `;
    container.prepend(row);
    while (container.children.length > 10) {
        container.removeChild(container.lastChild);
    }
    if (typeof checkGuess === 'function') {
        checkGuess(user.comment, { username: user.username, photoUrl: user.photoUrl });
    }
};

window.simulateComment = function(forceAnswer) {
    let user;
    if (forceAnswer && window.currentGame && Array.isArray(window.currentGame.answers)) {
        const unrevealed = window.currentGame.answers.filter((a, i) => !window.currentGame.revealed[i]);
        if (unrevealed.length > 0) {
            const answer = unrevealed[Math.floor(Math.random() * unrevealed.length)];
            user = {
                username: 'user' + Math.floor(Math.random() * 1000),
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
        user = {
            username: 'user' + randomNumber,
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
        if (typeof window.registerSimulatedComment === 'function') {
            window.registerSimulatedComment(user);
        }
    };

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
            row.innerHTML = playedThis ? '<span style="color:#22bb33;">✅</span>' : '<span style="color:#bbb;">⬜</span>';
            row.innerHTML += `<span>${prompt}</span>`;
            listDiv.appendChild(row);
        });
    });
    content.appendChild(listDiv);

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Close modal
    document.getElementById('gameHistoryModalClose').onclick = () => modal.remove();
    // Erase history
    document.getElementById('eraseGameHistoryBtn').onclick = () => {
        localStorage.removeItem('playedGames');
        modal.remove();
        updateGameHistoryPercent();
        alert('Game history erased!');
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
});

// --- Next Game Logic ---
function nextGame() {
    if (!currentGame || !gameData) return;
    // Store the current game as played
    storePlayedGame(currentGame.category, currentGame.prompt);
    updateGameHistoryPercent();
    // Find next unplayed prompt in the same category
    const played = getPlayedGames();
    const prompts = Object.keys(gameData[currentGame.category]);
    const unplayed = prompts.filter(p => !(played[currentGame.category] || []).includes(p));
    if (unplayed.length === 0) {
        alert('All prompts in this category have been played! Starting over.');
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
        score = 0;
        renderGame();
        document.getElementById('gameArea').style.display = 'block';
        document.getElementById('searchInput').focus();
    }
}

// --- Patch Give Up to store played game ---
const originalGiveUp = giveUp;
giveUp = function() {
    if (currentGame) {
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
    // Stub for Game History Manage button
    const gameHistoryManageBtn = document.getElementById('gameHistoryManageBtn');
    if (gameHistoryManageBtn) {
        gameHistoryManageBtn.addEventListener('click', function() {
            showGameHistoryModal();
        });
    }
});