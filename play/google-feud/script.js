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

let currentGame = null;
let score = 0;
let revealedCount = 0;

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
        
        // Get user info from localStorage
        const userImg = localStorage.getItem('profileImage') || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg';
        const username = localStorage.getItem('profileUsername') || '';

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
function checkGuess(guess) {
    if (!guess || !currentGame) return;
    
    guess = guess.trim();
    if (currentGame.guessed.has(guess.toLowerCase())) return;
    
    currentGame.guessed.add(guess.toLowerCase());
    
    // Create answers array in the format expected by the matching function
    const answersForMatching = currentGame.answers.map((answer, index) => ({
        answer: answer,
        found: currentGame.revealed[index],
        index: index
    }));
    
    // Use the provided matching logic
    const matches = checkGuessLogic(guess, answersForMatching);
    
    let found = matches.length > 0;
    
    // Reveal all matched answers
    matches.forEach(match => {
        if (!currentGame.revealed[match.index]) {
            currentGame.revealed[match.index] = true;
            const points = (10 - match.index) * 1000;
            score += points;
            revealedCount++;
        }
    });
    
    if (!found) {
        // Show wrong animation on covered answers
        const coveredAnswers = document.querySelectorAll('.answer-covered');
        coveredAnswers.forEach(answer => {
            answer.classList.add('wrong');
            setTimeout(() => answer.classList.remove('wrong'), 300);
        });
    }
    
    renderGame();
    
    // Check if all answers are revealed
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