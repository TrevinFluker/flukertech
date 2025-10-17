// contextoGame.js
// Contexto gameplay logic safely namespaced for use by GameManager

(function () {
    // ============================================================
    // 🧠 GAME STATE
    // ============================================================
    let gameData = null;
    let guesses = [];
    let targetWord = "";
    let mostRecentGuessLemma = null;
    let guessRankIsThreeOrHigher = true;
    let dictionary = null;
    let spellcheckEnabled = true;
    let allowDuplicates = true;
    let suggestedWord = "";
    let winnerDeclared = false; // prevent multiple winners per round
    const numberOfGames = 1100;
    const API_BASE_URL = "https://ccbackend.com";

    // ============================================================
    // 🎨 DOM ELEMENTS
    // ============================================================
    const wordInput = document.getElementById("wordInput");
    const guessesContainer = document.getElementById("guessesContainer");
    const lastGuessContainer = document.getElementById("lastGuess");
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
    async function initDictionary() {
        try {
            const response = await fetch('https://cdn.jsdelivr.net/npm/word-list-json@1.0.0/words.json');
            const words = await response.json();
            dictionary = new Set(words.map((word) => word.toLowerCase()));
        } catch (error) {
            console.error("Failed to load dictionary:", error);
            dictionary = null;
        }
    }

    async function contextoInitGame(gameIndex = null) {
        guesses = [];
        mostRecentGuessLemma = null;
        guessesContainer.innerHTML = "";
        lastGuessContainer.style.display = "none";
        loadingElement.style.display = "block";
        errorMessageElement.style.display = "none";

        if (gameIndex === null) {
            gameIndex = Math.floor(Math.random() * (numberOfGames + 1));
        }

        try {
            const response = await fetch(`${API_BASE_URL}/game?index=${gameIndex}`);
            
            if (!response.ok) {
                throw new Error("Failed to fetch game data from game endpoint");
            }

            gameData = await response.json();
            const targetWordObj = gameData.results.find((item) => parseInt(item.rank) === 1);
            targetWord = targetWordObj ? targetWordObj.lemma : "unknown";
            winnerDeclared = false;
            guessRankIsThreeOrHigher = true;
            if (window.SettingsPanel) window.SettingsPanel.setCurrentAnswer(targetWord);

            loadingElement.style.display = "none";
            updateGuessCount(0);
        } catch (error) {
            console.error("Error fetching game data:", error);
            errorMessageElement.textContent = "Failed to load game data. Please check your connection.";
            errorMessageElement.style.display = "block";
            loadingElement.style.display = "none";
        }
    }

    async function initCustomGame(word) {
        guesses = [];
        mostRecentGuessLemma = null;
        guessesContainer.innerHTML = "";
        lastGuessContainer.style.display = "none";
        loadingElement.style.display = "block";
        errorMessageElement.style.display = "none";

        try {
            if (gameData && targetWord === word) {
                loadingElement.style.display = "none";
                updateGuessCount(0);
                return true;
            }

            const response = await fetch(`${API_BASE_URL}/rank?word=${word}`);
            if (!response.ok) throw new Error("Failed to generate custom game");

            gameData = await response.json();
            targetWord = word;
            winnerDeclared = false;
            guessRankIsThreeOrHigher = true;
            window.SettingsPanel.setCurrentAnswer(word);

            loadingElement.style.display = "none";
            updateGuessCount(0);
            return true;
        } catch (error) {
            console.error("Error creating custom game:", error);
            const panelError = document.getElementById("customGameError");
            if (panelError) {
                loadingGame.style.display = "none";
                wordCheckUI.style.display = "none";
                successMessageUI.style.display = "none";
                gameCreationUI.style.display = "block";
                panelError.textContent = "Failed to create custom game. Please try another word.";
                panelError.style.display = "block";
                const input = document.getElementById("customWordInput");
                if (input) input.focus();
            }
            return false;
        }
    }

    // ============================================================
    // 🔤 GAME LOGIC
    // ============================================================
    function findWordRank(word) {
        word = word.toLowerCase().trim();

        if (!gameData || !gameData.results) {
            return { lemma: word, rank: 10000 + Math.floor(Math.random() * 1000), word };
        }

        const matchedItem = gameData.results.find(
            (item) => item.word?.toLowerCase() === word || item.lemma?.toLowerCase() === word
        );

        if (matchedItem) {
            return { lemma: matchedItem.lemma, rank: parseInt(matchedItem.rank), word };
        }

        return { lemma: word, rank: 10000 + Math.floor(Math.random() * 1000), word };
    }

    async function checkSpelling(word) {
        if (!spellcheckEnabled) return true;
        word = word.toLowerCase();

        if (dictionary && dictionary.has(word)) return true;
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            return response.ok;
        } catch (error) {
            console.error("Spellcheck failed:", error);
            return true;
        }
    }
    //In this function, I'm trying to pass the user's comment as the word to be guessed.
    //I also need to pass the user's photo and username to the other functions within submitWord.
    async function submitWord(user) {
        if (winnerDeclared) return;
        let word = user.comment;
        if (!word || word.trim() === "" || !gameData) return;

        word = word.toLowerCase().trim().split(" ")[0];
        word = word.replace(/[^a-zA-Z]/g, "");

        try {
            // const isValidWord = await checkSpelling(word);
            // if (!isValidWord) {
            //     errorMessageElement.textContent = "Not a valid English word";
            //     errorMessageElement.style.display = "block";
            //     return;
            // }

            const result = findWordRank(word);
            // if the guess is rank 2 or lower, set guessRankIsThreeOrHigher to false
            if (result.rank <= 2) {
                guessRankIsThreeOrHigher = false;
            }

            // attach attribution for UI overlays
            if (user && (user.nickname || user.username || user.uniqueId || user.photoUrl)) {
                result.attribution = {
                    name: user.nickname || user.username || user.uniqueId || "",
                    photo: user.photoUrl || ""
                };
            }
            errorMessageElement.style.display = "none";

            const alreadyGuessed = guesses.some(
                (g) => g.lemma.toLowerCase() === result.lemma.toLowerCase()
            );

            mostRecentGuessLemma = result.lemma;
            updateLastGuess(result);

            // if (!allowDuplicates && alreadyGuessed) {
            //     errorMessageElement.textContent = "Word already guessed";
            //     errorMessageElement.style.display = "block";
            //     return;
            // }

            if (!alreadyGuessed) {
                guesses.push(result);
                guesses.sort((a, b) => a.rank - b.rank);
                if (guesses.length > 50) guesses = guesses.slice(0, 50);
                updateGuessCount(Number(document.getElementById("guessCount").textContent) + 1);
            }

            renderPreviousGuesses();
            wordInput.value = "";

            if (result.rank === 1) {
                if (winnerDeclared) return;
                winnerDeclared = true;
                if (lastWord) lastWord.textContent = result.lemma;
                if (window.GameManager) {
                    window.GameManager.endRound("win", [{ name: user.nickname, photo: user.photoUrl, uniqueId: user.uniqueId }], result.lemma);
                } else {
                    congratsOverlay.style.display = "flex";
                }
            }
        } catch (error) {
            console.error("Error submitting word:", error);
            errorMessageElement.textContent = "An error occurred. Please try again later.";
            errorMessageElement.style.display = "block";
        }
    }

    function updateLastGuess(guess) {
        
        if (!guess) {
            lastGuessContainer.style.display = "none";
            return;
        }

        lastGuessContainer.style.display = "flex";
        let bgClass = "";
        if (guess.rank < 300) bgClass = "blue-bg";
        else if (guess.rank <= 1500) bgClass = "yellow-bg";
        else bgClass = "red-bg";

        const progressWidth = Math.max(1, 100 - guess.rank / 30);
        lastGuessContainer.className = "last-guess " + bgClass;
        const attribHtml = (guess.attribution && (guess.attribution.name || guess.attribution.photo)) ? `
            <span class="guess-attrib">
                ${guess.attribution.photo ? `<img class=\"guess-attrib-photo\" src=\"${guess.attribution.photo}\" alt=\"${guess.attribution.name}\"/>` : ""}
                ${guess.attribution.name ? `<span class=\"guess-attrib-name\">${guess.attribution.name}</span>` : ""}
            </span>
        ` : "";

        lastGuessContainer.innerHTML = `
            <div class="progress-bar" style="width:${progressWidth}%"></div>
            <span>${guess.lemma}</span>
            ${attribHtml}
            <span>${guess.rank}</span>`;
    }

    function renderPreviousGuesses() {
        guessesContainer.innerHTML = "";
        guesses.forEach((guess) => {
            const guessElement = document.createElement("div");
            guessElement.classList.add("guess-item");

            if (guess.lemma.toLowerCase() === mostRecentGuessLemma.toLowerCase()) {
                guessElement.classList.add("guess-recent");
            }

            if (guess.rank < 300) guessElement.classList.add("blue-bg");
            else if (guess.rank <= 1500) guessElement.classList.add("yellow-bg");
            else guessElement.classList.add("red-bg");

            const progressWidth = Math.max(1, 100 - guess.rank / 30);
            const attribHtml = (guess.attribution && (guess.attribution.name || guess.attribution.photo)) ? `
                <span class="guess-attrib">
                    ${guess.attribution.photo ? `<img class=\"guess-attrib-photo\" src=\"${guess.attribution.photo}\" alt=\"${guess.attribution.name}\"/>` : ""}
                    ${guess.attribution.name ? `<span class=\"guess-attrib-name\">${guess.attribution.name}</span>` : ""}
                </span>
            ` : "";

            guessElement.innerHTML = `
                <div class="progress-bar" style="width:${progressWidth}%"></div>
                <span>${guess.lemma}</span>
                ${attribHtml}
                <span>${guess.rank}</span>`;
            guessesContainer.appendChild(guessElement);
        });
    }

    function updateGuessCount(c) {
        guessCountDisplay.textContent = c;
    }

    // ============================================================
    // 🧩 EVENT LISTENERS
    // ============================================================
    wordInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") submitWord(wordInput.value);
    });

    menuButton.addEventListener("click", () => (menuOverlay.style.display = "flex"));
    menuOverlay.addEventListener("click", (e) => { if (e.target === menuOverlay) menuOverlay.style.display = "none"; });
    if (selectGameOption) {
        selectGameOption.addEventListener("click", () => {
            menuOverlay.style.display = "none";
            if (window.SettingsPanel?.openSettingsPanel) window.SettingsPanel.openSettingsPanel();
            if (window.SettingsPanel?.expandGameSettingsSection) window.SettingsPanel.expandGameSettingsSection();
            const input = document.getElementById("customWordInput");
            if (input) input.focus();
        });
    }
    playAgain.addEventListener("click", () => {
        congratsOverlay.style.display = "none";
        if (window.SettingsPanel?.openSettingsPanel) window.SettingsPanel.openSettingsPanel();
        if (window.SettingsPanel?.expandGameSettingsSection) window.SettingsPanel.expandGameSettingsSection();
        const input = document.getElementById("customWordInput");
        if (input) input.focus();
    });
    if (closeSelectGame) closeSelectGame.addEventListener("click", () => {
        const overlay = document.getElementById("selectGameOverlay");
        if (overlay) overlay.style.display = "none";
    });
    if (closeHowToPlay) closeHowToPlay.addEventListener("click", () => (howToPlayOverlay.style.display = "none"));
    howToPlayOverlay.addEventListener("click", (e) => { if (e.target === howToPlayOverlay) howToPlayOverlay.style.display = "none"; });
    congratsOverlay.addEventListener("click", (e) => { if (e.target === congratsOverlay) congratsOverlay.style.display = "none"; });
    if (selectGameOverlay) selectGameOverlay.addEventListener("click", (e) => { if (e.target === selectGameOverlay) selectGameOverlay.style.display = "none"; });

    document.getElementById("randomGame").addEventListener("click", () => {
        const overlay = document.getElementById("selectGameOverlay");
        if (overlay) overlay.style.display = "none";
        const newRandomIndex = Math.floor(Math.random() * (numberOfGames + 1));
        contextoInitGame(newRandomIndex);
    });

    // removed eye toggle

    createCustomGameButton.addEventListener("click", () => {
        const customWord = customWordInput.value.trim();
        if (customWord) {
            gameCreationUI.style.display = "block";
            wordCheckUI.style.display = "none";
            successMessageUI.style.display = "none";
            loadingGame.style.display = "flex";
            checkCustomWordValidity(customWord);
        }
    });

    customWordInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const customWord = customWordInput.value.trim();
            if (customWord) {
                gameCreationUI.style.display = "block";
                wordCheckUI.style.display = "none";
                successMessageUI.style.display = "none";
                loadingGame.style.display = "flex";
                checkCustomWordValidity(customWord);
            }
        }
    });

    async function checkCustomWordValidity(word) {
        try {
            const response = await fetch(`${API_BASE_URL}/rank?word=${word}`);
            if (!response.ok) throw new Error("Failed to generate custom game");
            const data = await response.json();

            const rank1Word = data.results.find((item) => parseInt(item.rank) === 1);
            if (!rank1Word || rank1Word.lemma.toLowerCase() !== word.toLowerCase()) {
                suggestedWord = rank1Word ? rank1Word.lemma : data.results[0]?.lemma || word;
                gameData = data;
                loadingGame.style.display = "none";
                gameCreationUI.style.display = "none";
                wordCheckUI.style.display = "block";
                const panelError = document.getElementById("customGameError");
                if (panelError) {
                    panelError.style.display = "none";
                } 
                if (suggestedWordDisplay) suggestedWordDisplay.textContent = suggestedWord;
            } else {
                loadingGame.style.display = "none";
                gameCreationUI.style.display = "none";
                successMessageUI.style.display = "block";
                const panelError = document.getElementById("customGameError");
                if (panelError) {
                    panelError.style.display = "none";
                } 
                gameData = data;
                targetWord = word;
                window.SettingsPanel.setCurrentAnswer(word);
            }
        } catch (error) {
            console.error("Error creating custom game:", error);
            loadingGame.style.display = "none";
            const panelError = document.getElementById("customGameError");
            if (panelError) {
                panelError.textContent = "Failed to create custom game. Please try another word.";
                panelError.style.display = "block";
                const input = document.getElementById("customWordInput");
                if (input) input.focus();
            } 
        }
    }

    backToInput.addEventListener("click", () => {
        wordCheckUI.style.display = "none";
        gameCreationUI.style.display = "block";
    });

    acceptSimilarWord.addEventListener("click", () => {
        wordCheckUI.style.display = "none";
        guesses = [];
        mostRecentGuessLemma = null;
        guessesContainer.innerHTML = "";
        lastGuessContainer.style.display = "none";
        targetWord = suggestedWord;
        window.SettingsPanel.setCurrentAnswer(suggestedWord);
        updateGuessCount(0);
        gameCreationUI.style.display = "block";
        customWordInput.value = "";
        loadingElement.style.display = "none";
    });

    continueToGame.addEventListener("click", () => {
        guesses = [];
        mostRecentGuessLemma = null;
        guessesContainer.innerHTML = "";
        lastGuessContainer.style.display = "none";
        updateGuessCount(0);
        loadingGame.style.display = "none";
        gameCreationUI.style.display = "block";
        successMessageUI.style.display = "none";
        customWordInput.value = "";
        loadingElement.style.display = "none";
    });

    document.getElementById("howToPlay").addEventListener("click", () => {
        menuOverlay.style.display = "none";
        howToPlayOverlay.style.display = "flex";
    });

    document.getElementById("hintOption").addEventListener("click", () => {
        menuOverlay.style.display = "none";

        const hasGuesses = Array.isArray(guesses) && guesses.length > 0;
        const lowestRank = hasGuesses ? Math.min(...guesses.map(g => Number(g.rank))) : null;

        // Do not provide hints when the best guess is rank 2 or better
        if (lowestRank != null && lowestRank <= 2) {
            return;
        }

        let targetRank;
        if (lowestRank != null && lowestRank < 300) {
            // Never hint ranks below 3
            targetRank = Math.max(2, lowestRank - 1);
        } else {
            targetRank = 300;
        }

        let hintItem = gameData.results.find(item => parseInt(item.rank) === targetRank);
        if (!hintItem) {
            for (let r = targetRank - 1; r >= 3; r--) {
                hintItem = gameData.results.find(item => parseInt(item.rank) === r);
                if (hintItem) break;
            }
        }

        if (hintItem) {
            submitWord(hintItem.lemma);
            return;
        }
    });

    document.getElementById("giveUp").addEventListener("click", () => {
        menuOverlay.style.display = "none";
        if (gameData && gameData.results) {
            const winningWord = gameData.results.find((item) => parseInt(item.rank) === 1);
            if (winningWord) submitWord(winningWord.lemma);
            else console.log("The target word was: " + targetWord);
        } else console.log("The target word was: " + targetWord);
    });

    spellcheckToggle.addEventListener("click", () => {
        spellcheckEnabled = !spellcheckEnabled;
        spellcheckToggle.src = spellcheckEnabled
            ? "https://www.runchatcapture.com/assets/imgs/spellcheck.png"
            : "https://www.runchatcapture.com/assets/imgs/nospellcheck.png";
    });

    dupesToggle.addEventListener("click", () => {
        allowDuplicates = !allowDuplicates;
        dupesToggle.src = allowDuplicates
            ? "https://www.runchatcapture.com/assets/imgs/acceptdupes.png"
            : "https://www.runchatcapture.com/assets/imgs/blockdupes.png";
    });

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
    window.Contexto = {
        initGame: contextoInitGame,
        initCustomGame,
        submitWord,
        findWordRank,
        checkSpelling,
        updateLastGuess,
        renderPreviousGuesses,
        updateGuessCount,
        getState: () => ({ targetWord, guesses, gameData }),
        processGift,
        guesses,
        targetWord,
        gameData
    };

    initDictionary();
})();

// Process gifts routed from GameManager. If gift name matches saved hint gift, submit next-best words.
function processGift(user) {
    // if guessRankIsThreeOrHigher is false, return
    if (!guessRankIsThreeOrHigher) return;
    try {
        const savedName = typeof getHintGiftName === 'function' ? (getHintGiftName() || '').trim().toLowerCase() : '';
        const incoming = String(user?.giftName || '').trim().toLowerCase();
        const count = Number(user?.giftCount) || 0;
        if (!savedName || !incoming || incoming !== savedName) return;
        const state = window.Contexto.getState();
        const data = state.gameData;
        if (!data || !Array.isArray(data.results) || data.results.length === 0) return;

        // Determine current best rank from guesses
        const currentGuesses = state.guesses || [];
        let lowestRank = Math.min(...currentGuesses.map(g => Number(g.rank)));
        let targetFrom = isFinite(lowestRank) ? Math.max(1, lowestRank - 1) : 300;

        // Build a map rank -> lemma for fast lookup
        const rankToItem = {};
        data.results.forEach(it => { const r = parseInt(it.rank); if (!isNaN(r)) rankToItem[r] = it; });

        let submitted = 0;
        let r = targetFrom;
        while (submitted < count && r >= 1) {
            if (rankToItem[r]) {
                const lemma = rankToItem[r].lemma;
                // submit as if this user commented the word
                window.Contexto.submitWord({
                    comment: lemma,
                    nickname: user?.nickname,
                    username: user?.username,
                    uniqueId: user?.uniqueId,
                    photoUrl: user?.photoUrl
                });
                submitted++;
            }
            r--;
        }
    } catch (e) {
        console.warn('processGift failed:', e);
    }
}
