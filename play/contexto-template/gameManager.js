// gameManager.js
// Generic game lifecycle & utilities for single or multi-winner stream games

// ----------------------------
// 🔹 Lifecycle
// ----------------------------
function initGame() {
    console.log("Initializing game...");
  
    hideWinningModal();
    hideInstructionPopup();
    clearMessage();
  
    if (getInstructionActive()) {
      showInstructionPopup(
        getInstructionText(),
        getInstructionGif(),
        getInstructionDuration()
      );
    }
  
    if (getTtsRoundStartEnabled()) {
      const texts = String(getTtsRoundStartTexts() || "").split(";");
      const candidates = texts.map(s => s.trim()).filter(Boolean);
      if (candidates.length) {
        const randomText = candidates[Math.floor(Math.random() * candidates.length)];
        speakText(randomText);
      }
    }
  }

function startRound() {
    console.log("Starting new round...");
    showMessage("Round Started");
}

function endRound(result, winners = [], answer = "") {
    console.log("Ending round:", result);

    if (result === "win") {
        const url = getWinningSoundUrl();
        playSound(url);
        showWinningModal(winners, answer);

        if (getTtsGameWonEnabled()) {
        const texts = String(getTtsGameWonTexts() || "").split(";");
        const candidates = texts.map(s => s.trim()).filter(Boolean);
        if (candidates.length) {
            const randomText = candidates[Math.floor(Math.random() * candidates.length)];
            speakText(randomText);
        }
        }
    } else if (result === "loss") {
        showMessage(`The word was ${answer}`, "error");
    }

    setTimeout(hideWinningModal, (getWinningModalDuration() || 5) * 1000);
}

function nextGame() {
    console.log("Moving to next game...");
    initGame();
    startRound();
}

// ----------------------------
// 🔹 UI Helpers
// ----------------------------
function showMessage(text, type = "info") {
    const msg = document.getElementById("message");
    if (!msg) return;
    msg.innerText = text;
    msg.style.color = type === "error" ? "red" : "#fff";
}

function clearMessage() {
    const msg = document.getElementById("message");
    if (msg) msg.innerText = "";
}

function showWinningModal(winners, word) {
    const overlay = document.getElementById("winning-overlay");
    const modalWord = document.getElementById("winning-word");
    const singleWinner = document.getElementById("single-winner");
    const multipleWinners = document.getElementById("multiple-winners");

    if (!overlay) return;

    modalWord.innerText = word;

    if (winners.length === 1) {
        // Show single winner
        singleWinner.style.display = "flex";
        multipleWinners.style.display = "none";

        document.getElementById("winner-name").innerText = winners[0].name;
        document.getElementById("winner-photo").src = winners[0].photo;
    } else if (winners.length > 1) {
        // Show multiple winners
        singleWinner.style.display = "none";
        multipleWinners.style.display = "flex";
        multipleWinners.innerHTML = "";

        winners.forEach(w => {
            const div = document.createElement("div");
            div.className = "multi-winner";
            div.innerHTML = `
                <img class="multi-winner-photo" src="${w.photo}" alt="${w.name}" />
                <div class="multi-winner-name">${w.name}</div>
            `;
            multipleWinners.appendChild(div);
        });
    } else {
        // No winners
        singleWinner.style.display = "none";
        multipleWinners.style.display = "none";
    }

    overlay.classList.add("show");
}

function hideWinningModal() {
    const overlay = document.getElementById("winning-overlay");
    if (overlay) overlay.classList.remove("show");
}

function showInstructionPopup(text, gifUrl, durationSec = 3) {
    const popup = document.getElementById("instruction-popup");
    const textDisplay = document.getElementById("instruction-popup-text-display");
    const gifDisplay = document.getElementById("instruction-popup-gif-display");

    if (!popup) return;

    textDisplay.innerText = text;
    if (gifUrl) {
        gifDisplay.src = gifUrl;
        gifDisplay.style.display = "block";
    } else {
        gifDisplay.style.display = "none";
    }

    popup.classList.add("show");

    setTimeout(() => {
        popup.classList.remove("show");
    }, durationSec * 1000);
}

function hideInstructionPopup() {
    const popup = document.getElementById("instruction-popup");
    if (popup) popup.classList.remove("show");
}

// ----------------------------
// 🔹 Sound & TTS
// ----------------------------
function playSound(url) {
    if (!url) return;
    const audio = new Audio(url);
    audio.play().catch(err => console.warn("Sound play failed:", err));
}

function speakText(text) {
    if (!getTtsEnabled()) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const vol = Number(getTtsVolume() ?? 50);
    const rateRaw = Number(getTtsRate() ?? 10);
    utterance.volume = Math.max(0, Math.min(1, vol / 100));
    utterance.rate = Math.max(0.1, Math.min(2.0, rateRaw / 10));
  
    const desiredName = getTtsVoice();
    const voices = window.speechSynthesis?.getVoices?.() || [];
    if (desiredName) {
      const v = voices.find(v => v.name === desiredName);
      if (v) utterance.voice = v;
    }
    try {
      speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis failed:", e);
    }
  }
  

function handleRealComment(user) {
    // Example: take user's comment as a guess
    console.log("New TikTok comment guess:", user);

    // TODO: integrate guess validation here
    // e.g., check against current answer, update leaderboard, etc.
}

function handleRealGift(user) {
    console.log("New TikTok gift event:", user);

    // TODO: integrate logic here
    // e.g., trigger hint reveal, bonus round, extra life, etc.
}

document.addEventListener("DOMContentLoaded", () => {
    // Load persisted settings and start the first round if you want
    initGame();
    if (window.Contexto?.initGame) window.Contexto.initGame();
    // Optionally: startRound();
});

// ----------------------------
// 🔹 Expose globally
// ----------------------------
window.GameManager = {
    initGame,
    startRound,
    endRound,
    nextGame,
    showMessage,
    clearMessage,
    showWinningModal,
    hideWinningModal,
    showInstructionPopup,
    hideInstructionPopup,
    playSound,
    speakText,
    handleRealComment,
    handleRealGift
};
