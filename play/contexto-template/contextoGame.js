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
    let dictionary = null;
    let spellcheckEnabled = true;
    let allowDuplicates = true;
    let suggestedWord = "";
    const numberOfGames = 300;
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
    const eyeToggle = document.getElementById("eyeToggle");
    const gameCreationUI = document.getElementById("gameCreationUI");
    const wordCheckUI = document.getElementById("wordCheckUI");
    const successMessageUI = document.getElementById("successMessageUI");
    const loadingGame = document.getElementById("loadingGame");
    const backToInput = document.getElementById("backToInput");
    const acceptSimilarWord = document.getElementById("acceptSimilarWord");
    const continueToGame = document.getElementById("continueToGame");
    const spellcheckToggle = document.getElementById("spellcheckToggle");
    const dupesToggle = document.getElementById("dupesToggle");

    // Set initial state to password
    customWordInput.type = "password";
    eyeToggle.textContent = "🚫";

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
            document.getElementById("gameNumber").textContent = `#${gameIndex}`;
            const response = await fetch(`${API_BASE_URL}/game?index=${gameIndex}`);

            if (!response.ok) {
                throw new Error("Failed to fetch game data from game endpoint");
            }

            gameData = await response.json();

            const targetWordObj = gameData.results.find((item) => parseInt(item.rank) === 1);
            targetWord = targetWordObj ? targetWordObj.lemma : "unknown";
            if (window.SettingsPanel) window.SettingsPanel.setCurrentAnswer(targetWord);

            loadingElement.style.display = "none";
            updateGuessCount();
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
            document.getElementById("gameNumber").textContent = "Custom";

            if (gameData && targetWord === word) {
                loadingElement.style.display = "none";
                updateGuessCount();
                return true;
            }

            const response = await fetch(`${API_BASE_URL}/rank?word=${word}`);
            if (!response.ok) throw new Error("Failed to generate custom game");

            gameData = await response.json();
            targetWord = word;
            window.SettingsPanel.setCurrentAnswer(word);

            loadingElement.style.display = "none";
            updateGuessCount();
            return true;
        } catch (error) {
            console.error("Error creating custom game:", error);
            errorMessageElement.textContent = "Failed to create custom game. Please try another word.";
            errorMessageElement.style.display = "block";
            loadingElement.style.display = "none";
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

    async function submitWord(word) {
        if (!word || word.trim() === "" || !gameData) return;

        word = word.toLowerCase().trim();
        try {
            const isValidWord = await checkSpelling(word);
            if (!isValidWord) {
                errorMessageElement.textContent = "Not a valid English word";
                errorMessageElement.style.display = "block";
                return;
            }

            const result = findWordRank(word);
            errorMessageElement.style.display = "none";

            const alreadyGuessed = guesses.some(
                (g) => g.lemma.toLowerCase() === result.lemma.toLowerCase()
            );

            if (!allowDuplicates && alreadyGuessed) {
                errorMessageElement.textContent = "Word already guessed";
                errorMessageElement.style.display = "block";
                return;
            }

            mostRecentGuessLemma = result.lemma;
            updateLastGuess(result);

            if (!alreadyGuessed) {
                guesses.push(result);
                guesses.sort((a, b) => a.rank - b.rank);
                if (guesses.length > 50) guesses = guesses.slice(0, 50);
                updateGuessCount();
            }

            renderPreviousGuesses();
            wordInput.value = "";

            if (result.rank === 1) {
                if (window.GameManager) {
                    window.GameManager.endRound("win", [{ name: "Chat", photo: "https://picsum.photos/seed/chat/100" }], result.lemma);
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
        lastGuessContainer.innerHTML = `
            <div class="progress-bar" style="width:${progressWidth}%"></div>
            <span>${guess.lemma}</span><span>${guess.rank}</span>`;
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
            guessElement.innerHTML = `
                <div class="progress-bar" style="width:${progressWidth}%"></div>
                <span>${guess.lemma}</span><span>${guess.rank}</span>`;
            guessesContainer.appendChild(guessElement);
        });
    }

    function updateGuessCount() {
        guessCountDisplay.textContent = guesses.length;
    }

    // ============================================================
    // 🧩 EVENT LISTENERS
    // ============================================================
    wordInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") submitWord(wordInput.value);
    });

    menuButton.addEventListener("click", () => (menuOverlay.style.display = "flex"));
    menuOverlay.addEventListener("click", (e) => { if (e.target === menuOverlay) menuOverlay.style.display = "none"; });
    selectGameOption.addEventListener("click", () => { menuOverlay.style.display = "none"; selectGameOverlay.style.display = "flex"; });
    playAgain.addEventListener("click", () => { congratsOverlay.style.display = "none"; selectGameOverlay.style.display = "flex"; });
    closeSelectGame.addEventListener("click", () => (selectGameOverlay.style.display = "none"));
    if (closeHowToPlay) closeHowToPlay.addEventListener("click", () => (howToPlayOverlay.style.display = "none"));
    howToPlayOverlay.addEventListener("click", (e) => { if (e.target === howToPlayOverlay) howToPlayOverlay.style.display = "none"; });
    congratsOverlay.addEventListener("click", (e) => { if (e.target === congratsOverlay) congratsOverlay.style.display = "none"; });
    selectGameOverlay.addEventListener("click", (e) => { if (e.target === selectGameOverlay) selectGameOverlay.style.display = "none"; });

    document.getElementById("randomGame").addEventListener("click", () => {
        selectGameOverlay.style.display = "none";
        const newRandomIndex = Math.floor(Math.random() * (numberOfGames + 1));
        contextoInitGame(newRandomIndex);
    });

    eyeToggle.addEventListener("click", () => {
        if (customWordInput.type === "password") {
            customWordInput.type = "text";
            eyeToggle.textContent = "👁️";
        } else {
            customWordInput.type = "password";
            eyeToggle.textContent = "🚫";
        }
    });

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
            } else {
                loadingGame.style.display = "none";
                gameCreationUI.style.display = "none";
                successMessageUI.style.display = "block";
                gameData = data;
                targetWord = word;
                window.SettingsPanel.setCurrentAnswer(word);
            }
        } catch (error) {
            console.error("Error creating custom game:", error);
            loadingGame.style.display = "none";
            errorMessageElement.textContent = "Failed to create custom game. Please try another word.";
            errorMessageElement.style.display = "block";
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
        document.getElementById("gameNumber").textContent = "Custom";
        updateGuessCount();
        selectGameOverlay.style.display = "none";
        gameCreationUI.style.display = "block";
        customWordInput.value = "";
        loadingElement.style.display = "none";
    });

    continueToGame.addEventListener("click", () => {
        guesses = [];
        mostRecentGuessLemma = null;
        guessesContainer.innerHTML = "";
        lastGuessContainer.style.display = "none";
        document.getElementById("gameNumber").textContent = "Custom";
        updateGuessCount();
        selectGameOverlay.style.display = "none";
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
        if (guesses.length > 0) {
            const bestGuessRank = guesses[0].rank;
            if (gameData && gameData.results) {
                for (let i = bestGuessRank - 2; i >= 0; i--) {
                    const nextBestWord = gameData.results.find((item) => parseInt(item.rank) === i + 1);
                    if (nextBestWord) {
                        submitWord(nextBestWord.lemma);
                        return;
                    }
                }
            }
        }
        alert("Hint: No better hint available. Try common words.");
    });

    document.getElementById("giveUp").addEventListener("click", () => {
        menuOverlay.style.display = "none";
        if (gameData && gameData.results) {
            const winningWord = gameData.results.find((item) => parseInt(item.rank) === 1);
            if (winningWord) submitWord(winningWord.lemma);
            else alert("The target word was: " + targetWord);
        } else alert("The target word was: " + targetWord);
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
        guesses,
        targetWord,
        gameData
    };

    initDictionary();
})();
