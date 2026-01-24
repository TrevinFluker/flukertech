// settingsPanel.js
// Hooks Settings UI <-> storage.js, and exposes open/close

document.addEventListener("DOMContentLoaded", () => {
    const settingsPanel = document.getElementById("settings-panel");
    const settingsToggle = document.getElementById("settings-toggle");
    const closeSettings = document.getElementById("close-settings");
  
    // ---------- Open/Close ----------
    if (settingsToggle && settingsPanel) {
      settingsToggle.addEventListener("click", () => settingsPanel.classList.add("open"));
    }
    if (closeSettings && settingsPanel) {
      closeSettings.addEventListener("click", () => settingsPanel.classList.remove("open"));
    }
  
    // ---------- Collapse/expand sections ----------
    const sectionHeaders = document.querySelectorAll(".settings-section-header");
    sectionHeaders.forEach(header => {
      header.classList.add("collapsed");
      header.addEventListener("click", () => header.classList.toggle("collapsed"));
    });
  
    // ---------- DOM refs ----------
    // Game settings
    const languageSelect = document.getElementById("language-select");
  const clearLeaderboardBtn = document.getElementById("clear-leaderboard");
  const visibleRows = document.getElementById("visible-rows");
  const decVisibleRows = document.getElementById("decrease-visible-rows");
  const incVisibleRows = document.getElementById("increase-visible-rows");
  
    // Simulate
    const simulateGuesses = document.getElementById("simulate-guesses");
    const currentAnswerEl = document.getElementById('current-answer-display');
  
    // Winning popup
    const winningSoundUrl = document.getElementById("winning-sound-url");
    const winningModalDuration = document.getElementById("winning-modal-duration");
    const decDuration = document.getElementById("decrease-duration");
    const incDuration = document.getElementById("increase-duration");
    const testWinningSound = document.getElementById("test-winning-sound");
  
    // Instruction popup
    const instructionActive = document.getElementById("instruction-popup-active");
    const instructionDuration = document.getElementById("instruction-popup-duration");
    const decInstr = document.getElementById("decrease-instruction-duration");
    const incInstr = document.getElementById("increase-instruction-duration");
    const instructionText = document.getElementById("instruction-popup-text");
    const instructionGif = document.getElementById("instruction-popup-gif");
    const testInstructionPopup = document.getElementById("test-instruction-popup");
  
    // TTS
    const ttsEnabled = document.getElementById("tts-enabled");
    const ttsVoice = document.getElementById("tts-voice");
    const ttsVolume = document.getElementById("tts-volume");
    const decVol = document.getElementById("decrease-tts-volume");
    const incVol = document.getElementById("increase-tts-volume");
    const ttsRate = document.getElementById("tts-rate");
    const decRate = document.getElementById("decrease-tts-rate");
    const incRate = document.getElementById("increase-tts-rate");
    const ttsReadWords = document.getElementById("tts-read-words");
    const ttsRoundStartEnabled = document.getElementById("tts-round-start-enabled");
    const ttsRoundStartTexts = document.getElementById("tts-round-start-texts");
    const ttsGameWonEnabled = document.getElementById("tts-game-won-enabled");
    const ttsGameWonTexts = document.getElementById("tts-game-won-texts");
    const ttsGameplayEnabled = document.getElementById("tts-gameplay-enabled");
    const ttsGameplayInterval = document.getElementById("tts-gameplay-interval");
    const decTtsInt = document.getElementById("decrease-tts-interval");
    const incTtsInt = document.getElementById("increase-tts-interval");
    const ttsGameplayTexts = document.getElementById("tts-gameplay-texts");
    const testTtsBtn = document.getElementById("test-tts");
  
    // ---------- Populate from storage on load ----------
  if (languageSelect) languageSelect.value = getLanguage();
    if (simulateGuesses) simulateGuesses.checked = !!getSimulateGuesses();
    if (visibleRows) {
      visibleRows.value = getVisibleRows();
      updateContainerHeights(getVisibleRows());
    }
  
    // Hint gift name
    const hintGiftName = document.getElementById("hint-gift-name");
    if (hintGiftName) hintGiftName.value = getHintGiftName() || "";
  
    if (winningSoundUrl) winningSoundUrl.value = getWinningSoundUrl() || winningSoundUrl.value || "";
    if (winningModalDuration) winningModalDuration.value = getWinningModalDuration();
  
    if (instructionActive) instructionActive.checked = !!getInstructionActive();
    if (instructionDuration) instructionDuration.value = getInstructionDuration();
    if (instructionText) instructionText.value = getInstructionText();
    if (instructionGif) instructionGif.value = getInstructionGif();
  
    if (ttsEnabled) ttsEnabled.checked = !!getTtsEnabled();
    if (ttsVolume) ttsVolume.value = getTtsVolume();
    if (ttsRate) ttsRate.value = getTtsRate();
    if (ttsReadWords) ttsReadWords.checked = !!getTtsReadWords();
    if (ttsRoundStartEnabled) ttsRoundStartEnabled.checked = !!getTtsRoundStartEnabled();
    if (ttsRoundStartTexts) ttsRoundStartTexts.value = getTtsRoundStartTexts();
    if (ttsGameWonEnabled) ttsGameWonEnabled.checked = !!getTtsGameWonEnabled();
    if (ttsGameWonTexts) ttsGameWonTexts.value = getTtsGameWonTexts();
    if (ttsGameplayEnabled) ttsGameplayEnabled.checked = !!getTtsGameplayEnabled();
    if (ttsGameplayInterval) ttsGameplayInterval.value = getTtsGameplayInterval();
    if (ttsGameplayTexts) ttsGameplayTexts.value = getTtsGameplayTexts();

    if (window.Wordwich) {
      let state = window.Wordwich.getState()
      currentAnswerEl.textContent = state.targetWord || "Not loaded..."
    }
  
    // Populate voices
    function populateVoices() {
      if (!ttsVoice) return;
      const voices = window.speechSynthesis?.getVoices?.() || [];
      ttsVoice.innerHTML = '<option value="">Default Voice</option>';
      voices.forEach(v => {
        const opt = document.createElement("option");
        opt.value = v.name;
        opt.textContent = `${v.name} (${v.lang})`;
        ttsVoice.appendChild(opt);
      });
      const stored = getTtsVoice();
      if (stored) ttsVoice.value = stored;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = populateVoices;
      populateVoices();
    }
  
    // ---------- Persist on change ----------
    const clamp = (num, min, max) => Math.max(min, Math.min(max, num));
    
    if (languageSelect) {
      languageSelect.addEventListener("change", () => saveLanguage(languageSelect.value));
    }
  
    if (visibleRows) {
      const updateVisibleRows = () => {
        const val = clamp(parseInt(visibleRows.value || "5", 10), 5, 12);
        visibleRows.value = val;
        saveVisibleRows(val);
        updateContainerHeights(val);
      };
      visibleRows.addEventListener("input", updateVisibleRows);
      if (decVisibleRows) decVisibleRows.addEventListener("click", () => {
        visibleRows.value = clamp(Number(visibleRows.value) - 1, 5, 12);
        saveVisibleRows(Number(visibleRows.value));
        updateContainerHeights(Number(visibleRows.value));
      });
      if (incVisibleRows) incVisibleRows.addEventListener("click", () => {
        visibleRows.value = clamp(Number(visibleRows.value) + 1, 5, 12);
        saveVisibleRows(Number(visibleRows.value));
        updateContainerHeights(Number(visibleRows.value));
      });
    }
  
    if (simulateGuesses) {
      simulateGuesses.addEventListener("change", () => saveSimulateGuesses(simulateGuesses.checked));
    }
  
    // Hint gift name
    if (hintGiftName) {
      hintGiftName.addEventListener("input", () => {
        saveHintGiftName(hintGiftName.value.trim());
        // Restart placeholder toggle when hint gift name changes
        if (window.Wordwich?.restartPlaceholderToggle) {
          window.Wordwich.restartPlaceholderToggle();
        }
      });
    }
  
    if (winningSoundUrl) {
      winningSoundUrl.addEventListener("input", () => saveWinningSoundUrl(winningSoundUrl.value.trim()));
    }
  
    if (winningModalDuration) {
      const updateWinDur = () => {
        const val = clamp(parseInt(winningModalDuration.value || "5", 10), 1, 10);
        winningModalDuration.value = val;
        saveWinningModalDuration(val);
      };
      winningModalDuration.addEventListener("input", updateWinDur);
      if (decDuration) decDuration.addEventListener("click", () => {
        winningModalDuration.value = clamp(Number(winningModalDuration.value) - 1, 1, 10);
        saveWinningModalDuration(Number(winningModalDuration.value));
      });
      if (incDuration) incDuration.addEventListener("click", () => {
        winningModalDuration.value = clamp(Number(winningModalDuration.value) + 1, 1, 10);
        saveWinningModalDuration(Number(winningModalDuration.value));
      });
    }
  
    if (instructionActive) {
      instructionActive.addEventListener("change", () => saveInstructionActive(instructionActive.checked));
    }
    if (instructionDuration) {
      const updateInstrDur = () => {
        const val = clamp(parseInt(instructionDuration.value || "3", 10), 1, 10);
        instructionDuration.value = val;
        saveInstructionDuration(val);
      };
      instructionDuration.addEventListener("input", updateInstrDur);
      if (decInstr) decInstr.addEventListener("click", () => {
        instructionDuration.value = clamp(Number(instructionDuration.value) - 1, 1, 10);
        saveInstructionDuration(Number(instructionDuration.value));
      });
      if (incInstr) incInstr.addEventListener("click", () => {
        instructionDuration.value = clamp(Number(instructionDuration.value) + 1, 1, 10);
        saveInstructionDuration(Number(instructionDuration.value));
      });
    }
    if (instructionText) {
      instructionText.addEventListener("input", () => saveInstructionText(instructionText.value));
    }
    if (instructionGif) {
      instructionGif.addEventListener("input", () => saveInstructionGif(instructionGif.value.trim()));
    }
  
    if (ttsEnabled) {
      ttsEnabled.addEventListener("change", () => saveTtsEnabled(ttsEnabled.checked));
    }
    if (ttsVoice) {
      ttsVoice.addEventListener("change", () => saveTtsVoice(ttsVoice.value));
    }
    if (ttsVolume) {
      const updateVol = () => {
        const val = clamp(parseInt(ttsVolume.value || "50", 10), 0, 100);
        ttsVolume.value = val;
        saveTtsVolume(val);
      };
      ttsVolume.addEventListener("input", updateVol);
      if (decVol) decVol.addEventListener("click", () => {
        ttsVolume.value = clamp(Number(ttsVolume.value) - 10, 0, 100);
        saveTtsVolume(Number(ttsVolume.value));
      });
      if (incVol) incVol.addEventListener("click", () => {
        ttsVolume.value = clamp(Number(ttsVolume.value) + 10, 0, 100);
        saveTtsVolume(Number(ttsVolume.value));
      });
    }
    if (ttsRate) {
      const updateRate = () => {
        const val = clamp(parseInt(ttsRate.value || "10", 10), 5, 12);
        ttsRate.value = val;
        saveTtsRate(val);
      };
      ttsRate.addEventListener("input", updateRate);
      if (decRate) decRate.addEventListener("click", () => {
        ttsRate.value = clamp(Number(ttsRate.value) - 1, 5, 12);
        saveTtsRate(Number(ttsRate.value));
      });
      if (incRate) incRate.addEventListener("click", () => {
        ttsRate.value = clamp(Number(ttsRate.value) + 1, 5, 12);
        saveTtsRate(Number(ttsRate.value));
      });
    }
    if (ttsReadWords) {
      ttsReadWords.addEventListener("change", () => saveTtsReadWords(ttsReadWords.checked));
    }
    if (ttsRoundStartEnabled) {
      ttsRoundStartEnabled.addEventListener("change", () => saveTtsRoundStartEnabled(ttsRoundStartEnabled.checked));
    }
    if (ttsRoundStartTexts) {
      ttsRoundStartTexts.addEventListener("input", () => saveTtsRoundStartTexts(ttsRoundStartTexts.value));
    }
    if (ttsGameWonEnabled) {
      ttsGameWonEnabled.addEventListener("change", () => saveTtsGameWonEnabled(ttsGameWonEnabled.checked));
    }
    if (ttsGameWonTexts) {
      ttsGameWonTexts.addEventListener("input", () => saveTtsGameWonTexts(ttsGameWonTexts.value));
    }
    if (ttsGameplayEnabled) {
      ttsGameplayEnabled.addEventListener("change", () => saveTtsGameplayEnabled(ttsGameplayEnabled.checked));
    }
    if (ttsGameplayInterval) {
      const updateInt = () => {
        const val = clamp(parseInt(ttsGameplayInterval.value || "30", 10), 10, 300);
        ttsGameplayInterval.value = val;
        saveTtsGameplayInterval(val);
      };
      ttsGameplayInterval.addEventListener("input", updateInt);
      if (decTtsInt) decTtsInt.addEventListener("click", () => {
        ttsGameplayInterval.value = clamp(Number(ttsGameplayInterval.value) - 10, 10, 300);
        saveTtsGameplayInterval(Number(ttsGameplayInterval.value));
      });
      if (incTtsInt) incTtsInt.addEventListener("click", () => {
        ttsGameplayInterval.value = clamp(Number(ttsGameplayInterval.value) + 10, 10, 300);
        saveTtsGameplayInterval(Number(ttsGameplayInterval.value));
      });
    }
    if (ttsGameplayTexts) {
      ttsGameplayTexts.addEventListener("input", () => saveTtsGameplayTexts(ttsGameplayTexts.value));
    }
  
    // ---------- Test buttons ----------
    if (testWinningSound) {
      testWinningSound.addEventListener("click", () => {
        const url = getWinningSoundUrl();
        if (url) {
          GameManager.playSound(url);
        } else {
          GameManager.showMessage("No winning sound URL set", "error");
        }
      });
    }
  
    if (testInstructionPopup) {
      testInstructionPopup.addEventListener("click", () => {
        GameManager.showInstructionPopup(
          getInstructionText(),
          getInstructionGif(),
          getInstructionDuration()
        );
      });
    }
  
    if (testTtsBtn) {
      testTtsBtn.addEventListener("click", () => {
        if (!getTtsEnabled()) {
          GameManager.showMessage("Enable TTS first.", "error");
          return;
        }
        GameManager.speakText("This is a test of text to speech.");
      });
    }

    // Clear leaderboard
    if (clearLeaderboardBtn) {
      clearLeaderboardBtn.addEventListener("click", () => {
        const confirmed = window.confirm("Clear the leaderboard? This cannot be undone.\nReload the page to see the change.");
        if (!confirmed) return;
        if (window.Leaderboard && typeof window.Leaderboard.clearLeaderboard === 'function') {
          window.Leaderboard.clearLeaderboard();
        } else {
          // Fallback if leaderboard module is unavailable
          try {
            localStorage.removeItem("wwGameLeaderboard");
            if (typeof window.updateFloatingLeaderboard === 'function') {
              window.updateFloatingLeaderboard();
            }
          } catch (e) {}
        }
      });
    }
    
    // ---------- Update container heights based on visible rows ----------
    function updateContainerHeights(rows) {
      const rowHeight = 48; // 43px min-height + 5px gap
      const maxHeight = rowHeight * rows;
      const style = document.documentElement.style;
      style.setProperty('--max-container-height', `${maxHeight}px`);
    }
  });
  
  // ----------------------------
  // 🔹 Exposed API (programmatic open/close)
  // ----------------------------
  function openSettingsPanel() {
    document.getElementById("settings-panel")?.classList.add("open");
  }
  function closeSettingsPanel() {
    document.getElementById("settings-panel")?.classList.remove("open");
  }
  function expandGameSettingsSection() {
    const header = document.getElementById("game-settings-header");
    const content = document.getElementById("game-settings-content");
    if (!header || !content) return;
    header.classList.remove("collapsed");
  }
  function getCurrentAnswer() {
    const el = document.getElementById("current-answer-display");
    return el ? el.textContent : "";
  }
  function setCurrentAnswer(value) {
    const el = document.getElementById("current-answer-display");
    if (!el) return;
    el.textContent = value == null ? "" : String(value);
  }

  window.SettingsPanel = { openSettingsPanel, closeSettingsPanel, expandGameSettingsSection, getCurrentAnswer, setCurrentAnswer };
  