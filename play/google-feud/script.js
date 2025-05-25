const gameData = {
    "Entertainment": {
        "movies where the main character is": [
            "the villain", "a badass", "depressed", "an animal", "secretly the villain",
            "a genius", "alone", "betrayed", "a ghost", "crazy"
        ],
        "tv shows about": [
            "witches", "lawyers", "cults", "time travel", "magic",
            "vikings", "family", "aliens", "ghosts", "alaska"
        ]
    },
    "Culture": {
        "does santa have a": [
            "brother", "birthday", "phone number", "dog", "pilot's license",
            "wife", "phone", "pipe", "son", "middle name"
        ],
        "new yorkers are": [
            "kind but not nice", "known for", "unfriendly", "nice", "born all over the world",
            "terrible", "ruining florida", "tough", "self absorbed", "direct"
        ]
    },
    "Question of the Day": {
        "can you drink expired": [
            "beer", "milk after 1 day", "milk", "coffee", "orange juice",
            "tea", "protein powder", "gatorade", "coke", "kombucha"
        ],
        "they call me": [
            "magic", "trinity", "laquifa", "stacy", "mr tibbs",
            "the breeze", "mellow yellow", "bruce", "magic release date", "jeeg"
        ]
    },
    "Food": {
        "are there seeds in": [
            "bananas", "blueberries", "pineapple", "limes", "raspberries",
            "oranges", "warts", "grapes", "mangoes", "pine cones"
        ],
        "beef jerky is": [
            "too expensive", "it healthy", "made from what", "bad for you", "jerked beef",
            "good for you", "wet", "too dry", "what part of the cow", "so good"
        ]
    },
    "Questions": {
        "how to get rid of": [
            "ants", "gnats", "hiccups", "bed bugs", "dandruff",
            "fruit flies", "carpenter bees", "flies", "acne scars", "hickeys"
        ],
        "how to build a": [
            "deck", "sex room netflix series", "house", "website", "retaining wall",
            "raised garden bed", "chicken coop", "shed", "pc", "fence"
        ]
    },
    "Names": {
        "aaron": [
            "judge", "rodgers", "rodgers tattoo", "carter", "rodgers girlfriend",
            "donald", "judge stats", "paul", "rodgers new tattoo", "taylor johnson"
        ],
        "adam": [
            "sandler wife", "sandler", "and eve", "sandler movies", "driver",
            "neumann", "demos", "sandler net worth", "project", "west"
        ]
    },
    "Animals": {
        "can you milk a": [
            "horse", "cat", "pig", "sheep", "male cow",
            "chicken", "whale", "bull", "dog", "snake"
        ],
        "best way to pet a": [
            "cat", "dog", "bunny", "guinea pig", "bearded dragon",
            "horse", "kitten", "chihuahua", "chicken", "puppy"
        ]
    },
    "People": {
        "can you die from too much": [
            "sex", "oxygen", "sleep", "pleasure", "coffee",
            "stress", "vitamin c", "exercise", "protein", "spice"
        ],
        "why is my son so": [
            "angry", "angry with me", "mean to me", "clingy", "attached to me",
            "skinny", "annoying", "emotional", "hyper", "sensitive"
        ]
    }
};
window.gameData = gameData;

let currentGame = null;
let score = 0;
let revealedCount = 0;
let simulateCommentCount = 0;

// Initialize category dropdown
function initCategories() {
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
        option.textContent = `${categoryEmojis[category]} ${category}`;
        select.appendChild(option);
    });
}

// Start new game
function startGame(category) {
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
            catDiv.className = 'automation-category';
            // Category checkbox
            const catLabel = document.createElement('label');
            catLabel.className = 'automation-category-label';
            const catCheckbox = document.createElement('input');
            catCheckbox.type = 'checkbox';
            catCheckbox.id = catId;
            
            // Check if category should be checked based on its prompts
            const categoryConfig = automationConfig[category];
            const allPromptsDisabled = categoryConfig && 
                Array.isArray(categoryConfig.disabledPrompts) && 
                categoryConfig.disabledPrompts.length === Object.keys(window.gameData[category]).length;
            catCheckbox.checked = !allPromptsDisabled;

            // Add change event listener to category checkbox
            catCheckbox.addEventListener('change', function() {
                const promptCheckboxes = catDiv.querySelectorAll('.automation-prompt-label input[type="checkbox"]');
                promptCheckboxes.forEach(promptCheckbox => {
                    promptCheckbox.checked = this.checked;
                });
            });
            catLabel.appendChild(catCheckbox);
            catLabel.appendChild(document.createTextNode(category));
            catDiv.appendChild(catLabel);
            // Prompts
            const promptsDiv = document.createElement('div');
            promptsDiv.className = 'automation-prompts';
            Object.keys(window.gameData[category]).forEach(prompt => {
                const promptId = `automation-prompt-${category}-${prompt}`;
                const promptLabel = document.createElement('label');
                promptLabel.className = 'automation-prompt-label';
                const promptCheckbox = document.createElement('input');
                promptCheckbox.type = 'checkbox';
                promptCheckbox.id = promptId;
                promptCheckbox.checked = !(
                    categoryConfig &&
                    Array.isArray(categoryConfig.disabledPrompts) &&
                    categoryConfig.disabledPrompts.includes(prompt)
                );
                // Add change event listener to prompt checkbox
                promptCheckbox.addEventListener('change', function() {
                    const categoryCheckbox = document.getElementById(catId);
                    if (this.checked) {
                        // If any prompt is checked, ensure the category is checked
                        categoryCheckbox.checked = true;
                    } else {
                        // If all prompts are unchecked, uncheck the category
                        const allPromptsUnchecked = Array.from(promptsDiv.querySelectorAll('input[type="checkbox"]'))
                            .every(cb => !cb.checked);
                        categoryCheckbox.checked = !allPromptsUnchecked;
                    }
                });
                promptLabel.appendChild(promptCheckbox);
                promptLabel.appendChild(document.createTextNode(prompt));
                promptsDiv.appendChild(promptLabel);
            });
            catDiv.appendChild(promptsDiv);
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