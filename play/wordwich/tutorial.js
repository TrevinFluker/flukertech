// tutorial.js
// Interactive tutorial system for Wordwich

(function() {
    // ============================================================
    // 🎓 TUTORIAL STATE
    // ============================================================
    let tutorialActive = false;
    let currentStep = 0;
    let tutorialSteps = [];
    let overlayElement = null;
    let tooltipElement = null;
    let spotlightElement = null;

    // ============================================================
    // 📋 TUTORIAL STEPS DEFINITION
    // ============================================================
    function initializeTutorialSteps() {
        return [
            {
                type: 'header',
                title: 'A few things before you start playing!',
                message: 'This quick tutorial will show you how WordWich works.',
                action: null,
                tooltip: null
            },
            {
                type: 'setup',
                action: () => {
                    // Set the target word to "marble"
                    if (window.Wordwich && window.Wordwich.setTargetWord) {
                        window.Wordwich.setTargetWord('marble');
                    }
                },
                tooltip: null
            },
            {
                type: 'enter-word',
                word: 'apple',
                targetSelector: '.guesses-container.before-container',
                tooltipPosition: 'top-right',
                tooltipText: "TikTok user's comments will display on top or bottom of input depending on their position before or after the secret word alphabetically",
                action: () => {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            if (window.Wordwich && window.Wordwich.submitWord) {
                                window.Wordwich.submitWord({
                                    name: 'Tutorial',
                                    comment: 'apple',
                                    photo: 'https://via.placeholder.com/50',
                                    uniqueId: 'tutorial-user'
                                });
                            }
                            setTimeout(resolve, 500);
                        }, 300);
                    });
                }
            },
            {
                type: 'enter-word',
                word: 'zip',
                targetSelector: '.guesses-container.after-container',
                tooltipPosition: 'top-right',
                tooltipText: "TikTok user's comments will display on top or bottom of input depending on their position before or after the secret word alphabetically",
                action: () => {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            if (window.Wordwich && window.Wordwich.submitWord) {
                                window.Wordwich.submitWord({
                                    name: 'Tutorial',
                                    comment: 'zip',
                                    photo: 'https://via.placeholder.com/50',
                                    uniqueId: 'tutorial-user'
                                });
                            }
                            setTimeout(resolve, 500);
                        }, 300);
                    });
                }
            },
            {
                type: 'enter-word',
                word: 'mark',
                targetSelector: '.guess-recent',
                tooltipPosition: 'top-right',
                tooltipText: "Words that share the same letters from the beginning of the word will have their matching letters highlighted in green.",
                action: () => {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            if (window.Wordwich && window.Wordwich.submitWord) {
                                window.Wordwich.submitWord({
                                    name: 'Tutorial',
                                    comment: 'mark',
                                    photo: 'https://via.placeholder.com/50',
                                    uniqueId: 'tutorial-user'
                                });
                            }
                            setTimeout(resolve, 800);
                        }, 300);
                    });
                }
            },
            {
                type: 'trigger-hint',
                targetSelector: '#hintDisplay',
                tooltipPosition: 'bottom-right',
                tooltipText: "Users can also trigger hints with a gift of your choice",
                action: () => {
                    return new Promise(resolve => {
                        setTimeout(async () => {
                            if (window.Wordwich && window.Wordwich.triggerHint) {
                                await window.Wordwich.triggerHint();
                            }
                            // Wait longer for hint to render and display
                            setTimeout(resolve, 1000);
                        }, 300);
                    });
                }
            },
            {
                type: 'open-settings',
                targetSelector: '#hint-gift-name',
                tooltipPosition: 'top-left',
                tooltipText: "Enter the name of the gift you'll require your audience to send for hints. Must match case. For instance: 'Rose' not 'rose'.",
                action: () => {
                    return new Promise(resolve => {
                        if (window.SettingsPanel && window.SettingsPanel.openSettingsPanel) {
                            window.SettingsPanel.openSettingsPanel();
                        }
                        setTimeout(() => {
                            if (window.SettingsPanel && window.SettingsPanel.expandGameSettingsSection) {
                                window.SettingsPanel.expandGameSettingsSection();
                            }
                            setTimeout(resolve, 500);
                        }, 300);
                    });
                }
            }
        ];
    }

    // ============================================================
    // 🎬 TUTORIAL CONTROL FUNCTIONS
    // ============================================================
    function startTutorial() {
        if (tutorialActive) return;
        
        tutorialActive = true;
        currentStep = 0;
        tutorialSteps = initializeTutorialSteps();
        
        createOverlay();
        executeCurrentStep();
    }

    function nextTutorialStep() {
        currentStep++;
        
        if (currentStep >= tutorialSteps.length) {
            completeTutorial();
        } else {
            executeCurrentStep();
        }
    }

    function skipTutorial() {
        completeTutorial();
    }

    function completeTutorial() {
        tutorialActive = false;
        cleanupTutorialUI();
        saveTutorialSeen(true);
        
        // Reload the page to clear all tutorial state (hints, guesses, etc.)
        setTimeout(() => {
            window.location.reload();
        }, 300);
    }

    async function executeCurrentStep() {
        const step = tutorialSteps[currentStep];
        
        // Clear previous tooltip and spotlight
        if (tooltipElement) {
            tooltipElement.remove();
            tooltipElement = null;
        }
        if (spotlightElement) {
            spotlightElement.remove();
            spotlightElement = null;
        }

        if (step.type === 'header') {
            showHeaderModal(step.title, step.message);
        } else {
            // Execute the step action first
            if (step.action) {
                await step.action();
            }
            
            // Then show the tooltip if applicable
            if (step.tooltipText && step.targetSelector) {
                showTooltip(step.targetSelector, step.tooltipText, step.tooltipPosition);
            } else {
                // If no tooltip, auto-advance
                nextTutorialStep();
            }
        }
    }

    // ============================================================
    // 🎨 UI RENDERING FUNCTIONS
    // ============================================================
    function createOverlay() {
        overlayElement = document.createElement('div');
        overlayElement.className = 'tutorial-overlay';
        overlayElement.id = 'tutorial-overlay';
        document.body.appendChild(overlayElement);
    }

    function showHeaderModal(title, message) {
        const modal = document.createElement('div');
        modal.className = 'tutorial-header-modal';
        modal.innerHTML = `
            <div class="tutorial-header-content">
                <h2>${title}</h2>
                <p>${message}</p>
                <div class="tutorial-buttons">
                    <button class="tutorial-btn tutorial-btn-primary" id="tutorial-continue">Continue</button>
                    <button class="tutorial-btn tutorial-btn-secondary" id="tutorial-skip">Skip Tutorial</button>
                </div>
            </div>
        `;
        
        overlayElement.appendChild(modal);
        
        document.getElementById('tutorial-continue').addEventListener('click', () => {
            modal.remove();
            nextTutorialStep();
        });
        
        document.getElementById('tutorial-skip').addEventListener('click', () => {
            modal.remove();
            skipTutorial();
        });
    }

    function showTooltip(targetSelector, text, position = 'top-right') {
        // Wait a bit for DOM to update
        setTimeout(() => {
            const targetElement = document.querySelector(targetSelector);
            
            if (!targetElement) {
                console.warn('Tutorial target not found:', targetSelector);
                // Auto-advance if target not found
                nextTutorialStep();
                return;
            }

            // Create spotlight
            createSpotlight(targetElement);
            
            // Create tooltip
            tooltipElement = document.createElement('div');
            tooltipElement.className = 'tutorial-tooltip';
            tooltipElement.innerHTML = `
                <div class="tutorial-tooltip-content">
                    <p>${text}</p>
                    <div class="tutorial-buttons">
                        <button class="tutorial-btn tutorial-btn-primary" id="tutorial-next">Next</button>
                        <button class="tutorial-btn tutorial-btn-secondary" id="tutorial-skip-btn">Skip Tutorial</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(tooltipElement);
            
            // Position tooltip
            positionTooltip(tooltipElement, targetElement, position);
            
            // Add event listeners
            document.getElementById('tutorial-next').addEventListener('click', nextTutorialStep);
            document.getElementById('tutorial-skip-btn').addEventListener('click', skipTutorial);
            
            // Reposition on window resize
            const resizeHandler = () => positionTooltip(tooltipElement, targetElement, position);
            window.addEventListener('resize', resizeHandler);
            tooltipElement._resizeHandler = resizeHandler;
        }, 100);
    }

    function createSpotlight(targetElement) {
        const rect = targetElement.getBoundingClientRect();
        
        spotlightElement = document.createElement('div');
        spotlightElement.className = 'tutorial-spotlight';
        spotlightElement.style.position = 'absolute';
        spotlightElement.style.left = (rect.left + window.scrollX - 10) + 'px';
        spotlightElement.style.top = (rect.top + window.scrollY - 10) + 'px';
        spotlightElement.style.width = (rect.width + 20) + 'px';
        spotlightElement.style.height = (rect.height + 20) + 'px';
        
        document.body.appendChild(spotlightElement);
    }

    function positionTooltip(tooltip, target, position) {
        const rect = target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let top, left;
        
        switch (position) {
            case 'top-right':
                top = rect.top + window.scrollY - tooltipRect.height - 20;
                left = rect.right + window.scrollX - tooltipRect.width;
                break;
            case 'top-left':
                top = rect.top + window.scrollY - tooltipRect.height - 20;
                left = rect.left + window.scrollX;
                break;
            case 'bottom-right':
                top = rect.bottom + window.scrollY + 20;
                left = rect.right + window.scrollX - tooltipRect.width;
                break;
            case 'bottom-left':
                top = rect.bottom + window.scrollY + 20;
                left = rect.left + window.scrollX;
                break;
            default:
                top = rect.top + window.scrollY - tooltipRect.height - 20;
                left = rect.right + window.scrollX - tooltipRect.width;
        }
        
        // Ensure tooltip stays within viewport
        const margin = 20;
        if (left < margin) left = margin;
        if (left + tooltipRect.width > window.innerWidth - margin) {
            left = window.innerWidth - tooltipRect.width - margin;
        }
        if (top < margin) {
            // If not enough space above, place below
            top = rect.bottom + window.scrollY + 20;
        }
        
        tooltip.style.position = 'absolute';
        tooltip.style.top = top + 'px';
        tooltip.style.left = left + 'px';
    }

    function cleanupTutorialUI() {
        if (overlayElement) {
            overlayElement.remove();
            overlayElement = null;
        }
        if (tooltipElement) {
            if (tooltipElement._resizeHandler) {
                window.removeEventListener('resize', tooltipElement._resizeHandler);
            }
            tooltipElement.remove();
            tooltipElement = null;
        }
        if (spotlightElement) {
            spotlightElement.remove();
            spotlightElement = null;
        }
    }

    // ============================================================
    // 🌍 EXPOSE GLOBALLY
    // ============================================================
    window.Tutorial = {
        start: startTutorial,
        skip: skipTutorial,
        isActive: () => tutorialActive,
        reset: () => {
            saveTutorialSeen(false);
            console.log("Tutorial reset! Reload the page to see the tutorial.");
        }
    };
    
    console.log("Tutorial module loaded. Use Tutorial.reset() in console to reset tutorial flag.");
})();
