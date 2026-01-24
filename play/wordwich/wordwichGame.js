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
    let hintDisplayed = false; // Track if hint shown this round
    let placeholderToggleInterval = null; // Track placeholder toggle interval
    let showingHintPlaceholder = false; // Track which placeholder is showing
    
    // Boundary words with attribution
    let closestBefore = { word: "aardvark", photo: null };
    let closestAfter = { word: "zulu", photo: null };
    
    // Reference common words from a.js (loaded globally)
    const COMMON_WORDS = window.COMMON_WORDS || [];
    const WORDS_JSON_URL = "https://www.runchatcapture.com/wordwich.json";

    // ============================================================
    // 🎨 DOM ELEMENTS
    // ============================================================
    const wordInput = document.getElementById("wordInput");
    const guessesContainerBefore = document.getElementById("guessesContainerBefore");
    const guessesContainerAfter = document.getElementById("guessesContainerAfter");
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
        hintDisplayed = false;
        closestBefore = { word: "aardvark", photo: null };
        closestAfter = { word: "zulu", photo: null };
        if (guessesContainerBefore) guessesContainerBefore.innerHTML = "";
        if (guessesContainerAfter) guessesContainerAfter.innerHTML = "";
        loadingElement.style.display = "block";
        errorMessageElement.style.display = "none";
        
        // Stop any existing placeholder toggle
        stopPlaceholderToggle();
        updateInputPlaceholder();

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
            
            // Start placeholder toggle
            startPlaceholderToggle();
            
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
        if (guessesContainerBefore) guessesContainerBefore.innerHTML = "";
        if (guessesContainerAfter) guessesContainerAfter.innerHTML = "";
        errorMessageElement.style.display = "none";
        
        // Stop any existing placeholder toggle
        stopPlaceholderToggle();
        updateInputPlaceholder();

        const upperWord = word.toUpperCase();
        
        // Check if word exists in the words list
        if (!wordsList.includes(upperWord)) {
            return false;
        }

        targetWord = upperWord;
        winnerDeclared = false;
        if (window.SettingsPanel) window.SettingsPanel.setCurrentAnswer(targetWord);
        updateGuessCount(0);
        
        // Start placeholder toggle
        startPlaceholderToggle();
        
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
            if (showingHintPlaceholder) {
                // Show hint placeholder
                const hintGiftName = typeof getHintGiftName === 'function' ? getHintGiftName() : '';
                wordInput.placeholder = `${hintGiftName} for hint`;
            } else {
                // Show normal placeholder
                wordInput.placeholder = `The word is alphabetically between '${closestBefore.word}' and '${closestAfter.word}'`;
            }
        }
    }
    
    function startPlaceholderToggle() {
        // Clear any existing interval
        if (placeholderToggleInterval) {
            clearInterval(placeholderToggleInterval);
            placeholderToggleInterval = null;
        }
        
        // Only start if hint gift name is set
        const hintGiftName = typeof getHintGiftName === 'function' ? getHintGiftName() : '';
        if (!hintGiftName || !hintGiftName.trim()) {
            showingHintPlaceholder = false;
            updateInputPlaceholder();
            return;
        }
        
        // Reset to normal placeholder initially
        showingHintPlaceholder = false;
        updateInputPlaceholder();
        
        // Toggle every 4 seconds
        placeholderToggleInterval = setInterval(() => {
            // Fade out
            if (wordInput) {
                wordInput.style.opacity = '0';
                
                // Change text after fade out (250ms)
                setTimeout(() => {
                    showingHintPlaceholder = !showingHintPlaceholder;
                    updateInputPlaceholder();
                    
                    // Fade in
                    wordInput.style.opacity = '1';
                }, 250);
            }
        }, 4000);
    }
    
    function stopPlaceholderToggle() {
        if (placeholderToggleInterval) {
            clearInterval(placeholderToggleInterval);
            placeholderToggleInterval = null;
        }
        showingHintPlaceholder = false;
        if (wordInput) {
            wordInput.style.opacity = '1';
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
            
            // Only clear input if this was the host's guess
            if (user.uniqueId === "host") {
                wordInput.value = "";
                
                // Remove has-text class to show fake cursor again
                const inputContainer = document.querySelector('.input-container');
                if (inputContainer) {
                    inputContainer.classList.remove('has-text');
                }
            }

            if (result.comparison === "correct") {
                if (winnerDeclared) return;
                lastWord.textContent = result.word;
                winnerDeclared = true;
                
                // Stop placeholder toggle when game ends
                stopPlaceholderToggle();
                
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


    function renderPreviousGuesses() {
        if (guessesContainerBefore) guessesContainerBefore.innerHTML = "";
        if (guessesContainerAfter) guessesContainerAfter.innerHTML = "";
        
        if (guesses.length === 0) {
            return;
        }
        
        // Split guesses into before and after target
        const beforeTarget = guesses.filter(g => g.comparison === "higher");
        const afterTarget = guesses.filter(g => g.comparison === "lower");
        
        // Sort both containers alphabetically (A-Z)
        let sortedBefore = [...beforeTarget].sort((a, b) => a.word.localeCompare(b.word));
        let sortedAfter = [...afterTarget].sort((a, b) => a.word.localeCompare(b.word));

        // Limit to 50 words per container - keep closest 50 to target
        if (sortedBefore.length > 50) {
            // Keep last 50 (closest to target alphabetically)
            sortedBefore = sortedBefore.slice(-50);
        }
        if (sortedAfter.length > 50) {
            // Keep first 50 (closest to target alphabetically)
            sortedAfter = sortedAfter.slice(0, 50);
        }

        // Update closest boundaries for placeholder
        if (sortedBefore.length > 0) {
            const closest = sortedBefore[sortedBefore.length - 1];
            closestBefore = { 
                word: closest.word.toLowerCase(), 
                photo: closest.attribution?.photo || null 
            };
        } else {
            closestBefore = { word: "aardvark", photo: null };
        }
        
        if (sortedAfter.length > 0) {
            const closest = sortedAfter[0];
            closestAfter = { 
                word: closest.word.toLowerCase(), 
                photo: closest.attribution?.photo || null 
            };
        } else {
            closestAfter = { word: "zulu", photo: null };
        }
        
        updateInputPlaceholder();

        // Render guesses before target (above input)
        sortedBefore.forEach((guess) => {
            const guessElement = createGuessElement(guess);
            if (guessesContainerBefore) guessesContainerBefore.appendChild(guessElement);
        });
        
        // Scroll to bottom of before container (to show closest guesses to target)
        if (guessesContainerBefore && sortedBefore.length > 0) {
            setTimeout(() => {
                guessesContainerBefore.scrollTop = guessesContainerBefore.scrollHeight;
            }, 0);
        }
        
        // Render guesses after target (below input)
        sortedAfter.forEach((guess) => {
            const guessElement = createGuessElement(guess);
            if (guessesContainerAfter) guessesContainerAfter.appendChild(guessElement);
        });
    }
    
    function createGuessElement(guess) {
        const guessElement = document.createElement("div");
        guessElement.classList.add("guess-item");

        if (guess.word === mostRecentGuess) {
            guessElement.classList.add("guess-recent");
        }

        const letterMatches = getLetterMatches(guess.word);
        
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

        guessElement.innerHTML = `
            ${attribHtml}
            <span class="guess-word-center">${wordHtml}</span>`;
        
        return guessElement;
    }

    function updateGuessCount(c) {
        guessCountDisplay.textContent = c;
    }


    // ============================================================
    // 🧩 EVENT LISTENERS
    // ============================================================
    if (wordInput) {
        const inputContainer = document.querySelector('.input-container');
        
        wordInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") submitWord({
                comment: wordInput.value,
                username: "host",
                nickname: "host",
                uniqueId: "host",
                photoUrl: "https://www.runchatcapture.com/assets/imgs/interactive_contexto_logo.png"
            });
        });
        
        // Toggle fake cursor based on input content
        wordInput.addEventListener('input', () => {
            if (wordInput.value.length > 0) {
                inputContainer.classList.add('has-text');
            } else {
                inputContainer.classList.remove('has-text');
            }
        });
        
        // Initialize on load
        if (wordInput.value.length > 0) {
            inputContainer.classList.add('has-text');
        }
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
            if (guessesContainerBefore) guessesContainerBefore.innerHTML = "";
            if (guessesContainerAfter) guessesContainerAfter.innerHTML = "";
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
    // 🎁 GIFT PROCESSING
    // ============================================================
    async function processGift(user) {
        try {
            // Only allow one hint per round
            if (hintDisplayed) return;
            
            // Check if gift name matches configured hint gift
            const savedGiftName = (typeof getHintGiftName === 'function' ? getHintGiftName() : '').trim().toLowerCase();
            const incomingGiftName = String(user?.giftName || '').trim().toLowerCase();
            
            if (!savedGiftName || !incomingGiftName || incomingGiftName !== savedGiftName) {
                return;
            }
            
            // Get current target word
            if (!targetWord) return;
            
            // Fetch hint from JSON
            const response = await fetch('/play/wordwich/hints_output.json');
            if (!response.ok) return;
            
            const hints = await response.json();
            const hint = hints[targetWord.toLowerCase()];
            
            if (hint) {
                showHint(hint, user);
                hintDisplayed = true;
            }
        } catch (e) {
            console.warn('Failed to process gift hint:', e);
        }
    }

    function showHint(hintText, user) {
        const hintDisplay = document.getElementById('hintDisplay');
        if (!hintDisplay) return;
        
        const attribHtml = (user && (user.nickname || user.username || user.photoUrl)) ? `
            <span class="hint-attrib">
                ${user.photoUrl ? `<img class="hint-attrib-photo" src="${user.photoUrl}" alt="${user.nickname || user.username}"/>` : ''}
                ${user.nickname || user.username ? `<span class="hint-attrib-name">${user.nickname || user.username}</span>` : ''}
            </span>
        ` : '';
        
        hintDisplay.innerHTML = `
            <span class="hint-icon">💡</span>
            ${attribHtml}
            <span class="hint-text">${hintText}</span>
        `;
        
        hintDisplay.style.display = 'flex';
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
        loadWordsList,
        processGift,
        startPlaceholderToggle,
        stopPlaceholderToggle,
        restartPlaceholderToggle: () => {
            stopPlaceholderToggle();
            startPlaceholderToggle();
        }
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
