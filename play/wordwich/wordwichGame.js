// wordwichGame.js
// Wordwich gameplay logic - Alphaguess-style word guessing game

(function () {
    // ============================================================
    // 🧠 GAME STATE
    // ============================================================
    let wordsList = []; // Full word list from JSON
    let guesses = [];
    let targetWord = "";
    let mostRecentGuess = null;
    let spellcheckEnabled = true;
    let allowDuplicates = true;
    let suggestedWord = "";
    let winnerDeclared = false; // prevent multiple winners per round
    
    // Boundary words with attribution
    let closestBefore = { word: "aardvark", photo: null };
    let closestAfter = { word: "zulu", photo: null };
    
    // Reference common words from a.js (loaded globally)
    const COMMON_WORDS = window.COMMON_WORDS || [];
    const WORDS_JSON_URL = "https://www.runchatcapture.com/wordwich.json";
    
    // Placeholder toggle state
    let showHintPlaceholder = false;
    let placeholderInterval = null;

    // ============================================================
    // 🎨 DOM ELEMENTS
    // ============================================================
    const wordInput = document.getElementById("wordInput");
    const guessesContainer = document.getElementById("guessesContainer");
    const recentGuessBar = document.getElementById("recentGuessBar");
    const menuButton = document.getElementById("menuButton");
    const menuOverlay = document.getElementById("menuOverlay");
    const selectGameOverlay = document.getElementById("selectGameOverlay");
    const howToPlayOverlay = document.getElementById("howToPlayOverlay");
    const congratsOverlay = document.getElementById("congratsOverlay");
    const selectGameOption = document.getElementById("selectGame");
    const playAgain = document.getElementById("playAgain");
    const closeSelectGame = document.getElementById("closeSelectGame");
    const closeHowToPlay = document.getElementById("closeHowToPlay");
    const guessCountDisplay = document.getElementById("guessCount");
    const loadingElement = document.getElementById("loading");
    const errorMessageElement = document.getElementById("errorMessage");
    const customWordInput = document.getElementById("customWordInput");
    const createCustomGameButton = document.getElementById("createCustomGame");
    
    const gameCreationUI = document.getElementById("gameCreationUI");
    const wordCheckUI = document.getElementById("wordCheckUI");
    const suggestedWordDisplay = document.getElementById("suggestedWordDisplay");
    const successMessageUI = document.getElementById("successMessageUI");
    const loadingGame = document.getElementById("loadingGame");
    const backToInput = document.getElementById("backToInput");
    const acceptSimilarWord = document.getElementById("acceptSimilarWord");
    const continueToGame = document.getElementById("continueToGame");
    const spellcheckToggle = document.getElementById("spellcheckToggle");
    const dupesToggle = document.getElementById("dupesToggle");
    const darkToggle = document.getElementById("contextoDarkToggle");
    const lastWord = document.getElementById("lastWord");

    // Secret word input is not shown to audience, keep as text

    // ============================================================
    // ⚙️ INITIALIZATION
    // ============================================================
    async function loadWordsList() {
        console.log("loadWordsList() function called");
        try {
            console.log("Fetching words from:", WORDS_JSON_URL);
            const response = await fetch(WORDS_JSON_URL);
            console.log("Fetch response received:", response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch words list: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log("JSON parsed, data structure:", Object.keys(data));
            
            wordsList = data.words || [];
            console.log(`Loaded ${wordsList.length} words`);
            
            if (wordsList.length === 0) {
                console.warn("Warning: Word list is empty!");
            } else {
                console.log("First 5 words:", wordsList.slice(0, 5));
                console.log("Last 5 words:", wordsList.slice(-5));
            }
            
            return true;
        } catch (error) {
            console.error("Failed to load words list:", error);
            console.error("Error details:", {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            wordsList = [];
            return false;
        }
    }

    async function wordwichInitGame(customWord = null) {
        console.log("wordwichInitGame called with:", customWord);
        guesses = [];
        mostRecentGuess = null;
        winnerDeclared = false;
        closestBefore = { word: "aardvark", photo: null };
        closestAfter = { word: "zulu", photo: null };
        guessesContainer.innerHTML = "";
        if (recentGuessBar) recentGuessBar.style.display = 'none';
        updateBoundaryDisplay();
        loadingElement.style.display = "block";
        errorMessageElement.style.display = "none";
        updateInputPlaceholder();
        
        // Restart placeholder toggle for new game
        startPlaceholderToggle();

        try {
            // Ensure words list is loaded
            if (wordsList.length === 0) {
                console.log("Loading words list...");
                await loadWordsList();
            }

            if (customWord) {
                // Custom word provided
                targetWord = customWord.toUpperCase();
            } else {
                // Random word from common words subset
                targetWord = COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)].toUpperCase();
            }

            console.log("Target word set to:", targetWord);
            if (window.SettingsPanel) window.SettingsPanel.setCurrentAnswer(targetWord);

            loadingElement.style.display = "none";
            updateGuessCount(0);
            console.log("Game initialized successfully");
            return true;
        } catch (error) {
            console.error("Error initializing game:", error);
            errorMessageElement.textContent = "Failed to initialize game. Please try again.";
            errorMessageElement.style.display = "block";
            loadingElement.style.display = "none";
            return false;
        }
    }

    async function initCustomGame(word) {
        guesses = [];
        mostRecentGuess = null;
        closestBefore = { word: "aardvark", photo: null };
        closestAfter = { word: "zulu", photo: null };
        guessesContainer.innerHTML = "";
        if (recentGuessBar) recentGuessBar.style.display = 'none';
        updateBoundaryDisplay();
        errorMessageElement.style.display = "none";
        updateInputPlaceholder();
        
        // Restart placeholder toggle for custom game
        startPlaceholderToggle();

        const upperWord = word.toUpperCase();
        
        // Check if word exists in the words list
        if (!wordsList.includes(upperWord)) {
            return false;
        }

        targetWord = upperWord;
        winnerDeclared = false;
        if (window.SettingsPanel) window.SettingsPanel.setCurrentAnswer(targetWord);
        updateGuessCount(0);
        return true;
    }

    // ============================================================
    // 🔤 GAME LOGIC
    // ============================================================
    function compareWord(guess) {
        const guessUpper = guess.toUpperCase().trim();
        
        if (guessUpper === targetWord) {
            return { word: guessUpper, comparison: "correct" };
        } else if (guessUpper < targetWord) {
            return { word: guessUpper, comparison: "higher" }; // Need to guess higher alphabetically
        } else {
            return { word: guessUpper, comparison: "lower" }; // Need to guess lower alphabetically
        }
    }

    function getClosenessScore(guess) {
        const guessUpper = guess.toUpperCase();
        const targetUpper = targetWord.toUpperCase();
        
        // Calculate first-letter distance
        const firstLetterDistance = Math.abs(guessUpper.charCodeAt(0) - targetUpper.charCodeAt(0));
        
        // If first letters match, count matching letters (in same position)
        if (firstLetterDistance === 0) {
            let matchingLetters = 0;
            const minLength = Math.min(guessUpper.length, targetUpper.length);
            for (let i = 0; i < minLength; i++) {
                if (guessUpper[i] === targetUpper[i]) {
                    matchingLetters++;
                }
            }
            // Return negative score (closer is more negative for sorting)
            // 3+ letters = -3, 2 letters = -2, 1 letter = -1
            return -matchingLetters;
        }
        
        // Return first letter distance (lower is closer)
        return firstLetterDistance;
    }
    
    function getTotalAlphabeticalDistance(guess) {
        const guessUpper = guess.toUpperCase();
        const targetUpper = targetWord.toUpperCase();
        
        let totalDistance = 0;
        const maxLength = Math.max(guessUpper.length, targetUpper.length);
        
        for (let i = 0; i < maxLength; i++) {
            const guessChar = i < guessUpper.length ? guessUpper.charCodeAt(i) : 0;
            const targetChar = i < targetUpper.length ? targetUpper.charCodeAt(i) : 0;
            totalDistance += Math.abs(guessChar - targetChar);
        }
        
        return totalDistance;
    }

    function getClosenessColor(guess) {
        const guessUpper = guess.toUpperCase();
        const targetUpper = targetWord.toUpperCase();
        
        // Calculate first-letter distance
        const firstLetterDistance = Math.abs(guessUpper.charCodeAt(0) - targetUpper.charCodeAt(0));
        
        // First check first-letter distance buckets (7 down to 1)
        if (firstLetterDistance >= 7) return "#E4A0A8"; // 7+ letters away
        if (firstLetterDistance === 6) return "#E09099"; // 6 away
        if (firstLetterDistance === 5) return "#DB808A"; // 5 away
        if (firstLetterDistance === 4) return "#D7707C"; // 4 away
        if (firstLetterDistance === 3) return "#D2606D"; // 3 away
        if (firstLetterDistance === 2) return "#CE505F"; // 2 away
        if (firstLetterDistance === 1) return "#C94050"; // 1 away
        
        // If first letters match (distance === 0), use matching letters logic
        // Count matching letters (in same position)
        let matchingLetters = 0;
        const minLength = Math.min(guessUpper.length, targetUpper.length);
        for (let i = 0; i < minLength; i++) {
            if (guessUpper[i] === targetUpper[i]) {
                matchingLetters++;
            }
        }
        
        // Apply final 3 buckets based on matching letters
        if (matchingLetters >= 3) return "#9F2D3A"; // 3+ letters match
        if (matchingLetters === 2) return "#AF3140"; // 2 letters match
        if (matchingLetters === 1) return "#BF3646"; // 1 letter matches
        
        return "#E4A0A8"; // default
    }

    function updateInputPlaceholder() {
        if (wordInput) {
            if (showHintPlaceholder) {
                wordInput.placeholder = "Green letters match the secret word position";
            } else {
                wordInput.placeholder = `The word is alphabetically between ${closestBefore.word} and ${closestAfter.word}`;
            }
        }
    }
    
    function getLetterMatches(guess) {
        const guessUpper = guess.toUpperCase();
        const targetUpper = targetWord.toUpperCase();
        const matches = [];
        let stillMatching = true;
        
        for (let i = 0; i < guessUpper.length; i++) {
            if (stillMatching && i < targetUpper.length && guessUpper[i] === targetUpper[i]) {
                matches.push({ letter: guessUpper[i], match: true });
            } else {
                matches.push({ letter: guessUpper[i], match: false });
                stillMatching = false; // Stop matching after first non-match
            }
        }
        
        return matches;
    }
    
    function countCorrectLetters(guess) {
        const guessUpper = guess.toUpperCase();
        const targetUpper = targetWord.toUpperCase();
        let count = 0;
        
        // Only count consecutive matches from the beginning
        for (let i = 0; i < Math.min(guessUpper.length, targetUpper.length); i++) {
            if (guessUpper[i] === targetUpper[i]) {
                count++;
            } else {
                break; // Stop counting after first non-match
            }
        }
        
        return count;
    }
    
    function getFirstLetterDistance(guess) {
        const guessUpper = guess.toUpperCase();
        const targetUpper = targetWord.toUpperCase();
        
        if (!guessUpper.length || !targetUpper.length) return 0;
        
        // Calculate alphabetical distance (target - guess)
        // Negative means guess is after target, positive means guess is before target
        const distance = targetUpper.charCodeAt(0) - guessUpper.charCodeAt(0);
        return distance;
    }
    
    function updateBoundaryDisplay() {
        // Get elements dynamically to ensure DOM is ready
        const boundaryBeforeElement = document.querySelector('.boundary-word-inline:first-child');
        const boundaryAfterElement = document.querySelector('.boundary-word-inline:last-child');
        
        if (boundaryBeforeElement) {
            const photoHtml = closestBefore.photo ? 
                `<img class="boundary-photo" src="${closestBefore.photo}" alt=""/>` : '';
            boundaryBeforeElement.innerHTML = `
                ${photoHtml}
                <span class="boundary-label">${closestBefore.word}</span>
            `;
        }
        if (boundaryAfterElement) {
            const photoHtml = closestAfter.photo ? 
                `<img class="boundary-photo" src="${closestAfter.photo}" alt=""/>` : '';
            boundaryAfterElement.innerHTML = `
                ${photoHtml}
                <span class="boundary-label">${closestAfter.word}</span>
            `;
        }
    }
    
    function startPlaceholderToggle() {
        // Clear any existing interval
        if (placeholderInterval) {
            clearInterval(placeholderInterval);
        }
        
        // Toggle placeholder every 3 seconds
        placeholderInterval = setInterval(() => {
            showHintPlaceholder = !showHintPlaceholder;
            updateInputPlaceholder();
        }, 3000);
    }

    async function checkSpelling(word) {
        if (!spellcheckEnabled) return true;
        const upperWord = word.toUpperCase();
        return wordsList.includes(upperWord);
    }

    async function submitWord(user) {
        if (winnerDeclared) return;
        let word = user.comment;
        if (!word || word.trim() === "") return;

        word = word.toUpperCase().trim().split(" ")[0];
        word = word.replace(/[^A-Z]/g, "");
        
        if (!word) return;

        try {
            // Check if word is between aardvark and zulu
            if (word <= "AARDVARK" || word >= "ZULU") {
                errorMessageElement.textContent = "Word must be between aardvark and zulu";
                errorMessageElement.style.display = "block";
                setTimeout(() => {
                    errorMessageElement.style.display = "none";
                }, 2000);
                return;
            }

            // Check if word is in the list
            const isValidWord = wordsList.includes(word);
            if (!isValidWord) {
                return;
            }

            const result = compareWord(word);
            
            // Attach attribution for UI overlays
            if (user && (user.nickname || user.username || user.uniqueId || user.photoUrl)) {
                result.attribution = {
                    name: user.nickname || user.username || user.uniqueId || "",
                    photo: user.photoUrl || ""
                };
            }
            
            errorMessageElement.style.display = "none";

            const alreadyGuessed = guesses.some(
                (g) => g.word === result.word
            );

            if (!allowDuplicates && alreadyGuessed) {
                errorMessageElement.textContent = "Word already guessed";
                errorMessageElement.style.display = "block";
                setTimeout(() => {
                    errorMessageElement.style.display = "none";
                }, 2000);
                return;
            }

            mostRecentGuess = result.word;

            if (!alreadyGuessed) {
                guesses.push(result);
                updateGuessCount(guesses.length);
            }

            renderPreviousGuesses();
            wordInput.value = "";

            if (result.comparison === "correct") {
                if (winnerDeclared) return;
                lastWord.textContent = result.word;
                winnerDeclared = true;
                if (window.GameManager) {
                    window.GameManager.endRound("win", [{ 
                        name: user.nickname || user.username, 
                        photo: user.photoUrl, 
                        uniqueId: user.uniqueId 
                    }], result.word);
                } else {
                    congratsOverlay.style.display = "flex";
                }
            }
        } catch (error) {
            console.error("Error submitting word:", error);
            errorMessageElement.textContent = "An error occurred. Please try again.";
            errorMessageElement.style.display = "block";
        }
    }

    function updateRecentGuessDisplay() {
        if (!mostRecentGuess || guesses.length === 0) {
            if (recentGuessBar) recentGuessBar.style.display = 'none';
            return;
        }
        
        const recentGuess = guesses.find(g => g.word === mostRecentGuess);
        if (!recentGuess) return;
        
        const letterMatches = getLetterMatches(recentGuess.word);
        const correctCount = countCorrectLetters(recentGuess.word);
        const firstLetterDist = getFirstLetterDistance(recentGuess.word);
        
        // Build word with colored letters
        const wordHtml = letterMatches.map(({letter, match}) => {
            return `<span class="letter ${match ? 'letter-correct' : ''}">${letter.toLowerCase()}</span>`;
        }).join('');
        
        const attribHtml = (recentGuess.attribution && (recentGuess.attribution.name || recentGuess.attribution.photo)) ? `
            <span class="guess-attrib">
                ${recentGuess.attribution.photo ? `<img class="guess-attrib-photo" src="${recentGuess.attribution.photo}" alt="${recentGuess.attribution.name}"/>` : ""}
                ${recentGuess.attribution.name ? `<span class="guess-attrib-name">${recentGuess.attribution.name}</span>` : ""}
            </span>
        ` : "";
        
        // Show green count for consecutive matches, or red distance for first letter
        let countBadge = '';
        if (correctCount > 0) {
            countBadge = `<span class="correct-count">${correctCount}</span>`;
        } else if (firstLetterDist !== 0) {
            const sign = firstLetterDist > 0 ? '+' : '';
            countBadge = `<span class="distance-count">${sign}${firstLetterDist}</span>`;
        }
        
        if (recentGuessBar) {
            recentGuessBar.innerHTML = `
                ${attribHtml}
                <span class="guess-word-center">${wordHtml}</span>
                ${countBadge}
            `;
            recentGuessBar.style.display = 'flex';
        }
    }

    function renderPreviousGuesses() {
        guessesContainer.innerHTML = "";
        
        if (guesses.length === 0) {
            updateBoundaryDisplay();
            if (recentGuessBar) recentGuessBar.style.display = 'none';
            return;
        }
        
        // Update the recent guess display
        updateRecentGuessDisplay();
        
        // Sort ALL guesses by badge number first, then by absolute alphabetical distance within each number group
        const sortedGuesses = [...guesses].sort((a, b) => {
            const scoreA = getClosenessScore(a.word);
            const scoreB = getClosenessScore(b.word);
            
            // Primary sort: by badge number (score)
            if (scoreA !== scoreB) {
                return scoreA - scoreB;
            }
            
            // Secondary sort: by total alphabetical distance when badge numbers are same
            const distA = getTotalAlphabeticalDistance(a.word);
            const distB = getTotalAlphabeticalDistance(b.word);
            
            // Debug logging
            if (scoreA === scoreB) {
                console.log(`Tiebreaker: ${a.word}(${distA}) vs ${b.word}(${distB})`);
            }
            
            return distA - distB;
        });

        // Update closest boundaries for placeholder
        const beforeTarget = guesses.filter(g => g.comparison === "higher").sort((a, b) => a.word.localeCompare(b.word));
        const afterTarget = guesses.filter(g => g.comparison === "lower").sort((a, b) => a.word.localeCompare(b.word));
        
        if (beforeTarget.length > 0) {
            const closest = beforeTarget[beforeTarget.length - 1];
            closestBefore = { 
                word: closest.word.toLowerCase(), 
                photo: closest.attribution?.photo || null 
            };
        } else {
            closestBefore = { word: "aardvark", photo: null };
        }
        
        if (afterTarget.length > 0) {
            const closest = afterTarget[0];
            closestAfter = { 
                word: closest.word.toLowerCase(), 
                photo: closest.attribution?.photo || null 
            };
        } else {
            closestAfter = { word: "zulu", photo: null };
        }
        
        updateInputPlaceholder();
        updateBoundaryDisplay();

        // Render all guesses sorted by closeness
        sortedGuesses.forEach((guess) => {
            const guessElement = document.createElement("div");
            guessElement.classList.add("guess-item");

            if (guess.word === mostRecentGuess) {
                guessElement.classList.add("guess-recent");
            }

            const letterMatches = getLetterMatches(guess.word);
            const correctCount = countCorrectLetters(guess.word);
            const firstLetterDist = getFirstLetterDistance(guess.word);
            
            // Build word with colored letters
            const wordHtml = letterMatches.map(({letter, match}) => {
                return `<span class="letter ${match ? 'letter-correct' : ''}">${letter.toLowerCase()}</span>`;
            }).join('');
            
            const attribHtml = (guess.attribution && (guess.attribution.name || guess.attribution.photo)) ? `
                <span class="guess-attrib">
                    ${guess.attribution.photo ? `<img class="guess-attrib-photo" src="${guess.attribution.photo}" alt="${guess.attribution.name}"/>` : ""}
                    ${guess.attribution.name ? `<span class="guess-attrib-name">${guess.attribution.name}</span>` : ""}
                </span>
            ` : "";

            // Show green count for consecutive matches, or red distance for first letter
            let countBadge = '';
            if (correctCount > 0) {
                countBadge = `<span class="correct-count">${correctCount}</span>`;
            } else if (firstLetterDist !== 0) {
                const sign = firstLetterDist > 0 ? '+' : '';
                countBadge = `<span class="distance-count">${sign}${firstLetterDist}</span>`;
            }

            guessElement.innerHTML = `
                ${attribHtml}
                <span class="guess-word-center">${wordHtml}</span>
                ${countBadge}`;
            guessesContainer.appendChild(guessElement);
        });
    }

    function updateGuessCount(c) {
        guessCountDisplay.textContent = c;
    }


    // ============================================================
    // 🧩 EVENT LISTENERS
    // ============================================================
    if (wordInput) {
        wordInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") submitWord({
                comment: wordInput.value,
                username: "host",
                nickname: "host",
                uniqueId: "host",
                photoUrl: "https://www.runchatcapture.com/assets/imgs/interactive_contexto_logo.png"
            });
        });
    }

    if (menuButton) menuButton.addEventListener("click", () => (menuOverlay.style.display = "flex"));
    if (menuOverlay) menuOverlay.addEventListener("click", (e) => { if (e.target === menuOverlay) menuOverlay.style.display = "none"; });
    
    if (playAgain) {
        playAgain.addEventListener("click", () => {
            congratsOverlay.style.display = "none";
            if (window.SettingsPanel?.openSettingsPanel) window.SettingsPanel.openSettingsPanel();
            if (window.SettingsPanel?.expandGameSettingsSection) window.SettingsPanel.expandGameSettingsSection();
            const input = document.getElementById("customWordInput");
            if (input) input.focus();
        });
    }
    
    if (closeHowToPlay) closeHowToPlay.addEventListener("click", () => (howToPlayOverlay.style.display = "none"));
    if (howToPlayOverlay) howToPlayOverlay.addEventListener("click", (e) => { if (e.target === howToPlayOverlay) howToPlayOverlay.style.display = "none"; });
    if (congratsOverlay) congratsOverlay.addEventListener("click", (e) => { if (e.target === congratsOverlay) congratsOverlay.style.display = "none"; });

    const randomGameBtn = document.getElementById("randomGame");
    if (randomGameBtn) {
        randomGameBtn.addEventListener("click", () => {
            wordwichInitGame();
        });
    }

    if (createCustomGameButton) {
        createCustomGameButton.addEventListener("click", () => {
            const customWord = customWordInput.value.trim().toUpperCase();
            if (customWord) {
                gameCreationUI.style.display = "block";
                wordCheckUI.style.display = "none";
                successMessageUI.style.display = "none";
                loadingGame.style.display = "flex";
                checkCustomWordValidity(customWord);
            }
        });
    }

    if (customWordInput) {
        customWordInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                const customWord = customWordInput.value.trim().toUpperCase();
                if (customWord) {
                    gameCreationUI.style.display = "block";
                    wordCheckUI.style.display = "none";
                    successMessageUI.style.display = "none";
                    loadingGame.style.display = "flex";
                    checkCustomWordValidity(customWord);
                }
            }
        });
    }

    async function checkCustomWordValidity(word) {
        try {
            // Ensure words list is loaded
            if (wordsList.length === 0) {
                await loadWordsList();
            }

            const upperWord = word.toUpperCase();
            
            if (!wordsList.includes(upperWord)) {
                // Word not in list
                loadingGame.style.display = "none";
                gameCreationUI.style.display = "none";
                wordCheckUI.style.display = "block";
                const panelError = document.getElementById("customGameError");
                if (panelError) {
                    panelError.style.display = "none";
                }
                if (suggestedWordDisplay) {
                    suggestedWordDisplay.textContent = "Word not found in dictionary";
                }
            } else {
                // Word is valid
                loadingGame.style.display = "none";
                gameCreationUI.style.display = "none";
                successMessageUI.style.display = "block";
                const panelError = document.getElementById("customGameError");
                if (panelError) {
                    panelError.style.display = "none";
                }
                targetWord = upperWord;
                winnerDeclared = false;
                if (window.SettingsPanel) window.SettingsPanel.setCurrentAnswer(targetWord);
            }
        } catch (error) {
            console.error("Error checking custom word:", error);
            loadingGame.style.display = "none";
            const panelError = document.getElementById("customGameError");
            if (panelError) {
                panelError.textContent = "Failed to validate word. Please try again.";
                panelError.style.display = "block";
                const input = document.getElementById("customWordInput");
                if (input) input.focus();
            }
        }
    }

    if (backToInput) {
        backToInput.addEventListener("click", () => {
            wordCheckUI.style.display = "none";
            gameCreationUI.style.display = "block";
        });
    }

    // acceptSimilarWord button doesn't exist in Wordwich UI
    if (acceptSimilarWord) {
        acceptSimilarWord.addEventListener("click", () => {
            // Not applicable for Wordwich - just go back
            wordCheckUI.style.display = "none";
            gameCreationUI.style.display = "block";
        });
    }

    if (continueToGame) {
        continueToGame.addEventListener("click", () => {
            guesses = [];
            mostRecentGuess = null;
            guessesContainer.innerHTML = "";
            if (recentGuessBar) recentGuessBar.style.display = 'none';
            updateGuessCount(0);
            loadingGame.style.display = "none";
            gameCreationUI.style.display = "block";
            successMessageUI.style.display = "none";
            customWordInput.value = "";
            loadingElement.style.display = "none";
        });
    }

    const howToPlayBtn = document.getElementById("howToPlay");
    if (howToPlayBtn) {
        howToPlayBtn.addEventListener("click", () => {
            menuOverlay.style.display = "none";
            howToPlayOverlay.style.display = "flex";
        });
    }

    const giveUpBtn = document.getElementById("giveUp");
    if (giveUpBtn) {
        giveUpBtn.addEventListener("click", () => {
            menuOverlay.style.display = "none";
            if (targetWord) {
                submitWord({
                    comment: targetWord,
                    username: "host",
                    nickname: "host",
                    uniqueId: "host",
                    photoUrl: "https://www.runchatcapture.com/assets/imgs/interactive_contexto_logo.png"
                });
            }
        });
    }

    if (spellcheckToggle) {
        spellcheckToggle.addEventListener("click", () => {
            spellcheckEnabled = !spellcheckEnabled;
            spellcheckToggle.src = spellcheckEnabled
                ? "https://www.runchatcapture.com/assets/imgs/spellcheck.png"
                : "https://www.runchatcapture.com/assets/imgs/nospellcheck.png";
        });
    }

    if (dupesToggle) {
        dupesToggle.addEventListener("click", () => {
            allowDuplicates = !allowDuplicates;
            dupesToggle.src = allowDuplicates
                ? "https://www.runchatcapture.com/assets/imgs/acceptdupes.png"
                : "https://www.runchatcapture.com/assets/imgs/blockdupes.png";
        });
    }

    if (darkToggle) {
        const container = document.querySelector('.contexto');
        darkToggle.addEventListener('change', () => {
            if (!container) return;
            if (darkToggle.checked) {
                container.classList.add('contexto-dark');
                if (typeof saveDarkModeEnabled === 'function') saveDarkModeEnabled(true);
            } else {
                container.classList.remove('contexto-dark');
                if (typeof saveDarkModeEnabled === 'function') saveDarkModeEnabled(false);
            }
        });
        darkToggle.checked = getDarkModeEnabled();
        if (darkToggle.checked) {
            container.classList.add('contexto-dark');
        }
    }


    // ============================================================
    // 🌐 EXPOSE PUBLIC API
    // ============================================================
    window.Wordwich = {
        initGame: wordwichInitGame,
        initCustomGame,
        submitWord,
        compareWord,
        checkSpelling,
        renderPreviousGuesses,
        updateGuessCount,
        getState: () => ({ targetWord, guesses, wordsList }),
        loadWordsList
    };

    // Initialize by loading words list
    console.log("=== WORDWICH INITIALIZATION START ===");
    console.log("Wordwich script loaded, starting word list fetch...");
    console.log("URL:", WORDS_JSON_URL);
    console.log("Time:", new Date().toISOString());
    
    loadWordsList().then((success) => {
        console.log("=== WORD LIST FETCH COMPLETED ===");
        console.log("Success:", success);
        console.log("Words loaded:", wordsList.length);
        console.log("Time:", new Date().toISOString());
        
        // Initialize boundary display
        updateBoundaryDisplay();
        
        // Start placeholder toggle
        startPlaceholderToggle();
        
        // Show a visual indicator if loading failed
        if (!success || wordsList.length === 0) {
            if (errorMessageElement) {
                errorMessageElement.textContent = "Failed to load word dictionary. Please refresh the page.";
                errorMessageElement.style.display = "block";
            }
        }
    }).catch(err => {
        console.error("=== WORD LIST FETCH FAILED ===");
        console.error("Error:", err);
        if (errorMessageElement) {
            errorMessageElement.textContent = "Failed to load word dictionary: " + err.message;
            errorMessageElement.style.display = "block";
        }
    });
})();
