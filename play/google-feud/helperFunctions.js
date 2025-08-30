/**
 * Helper Functions for Google Feud Game
 * Contains utility functions that can be reused across the application
 */

/**
 * Checks if a guess matches any of the provided answers using sophisticated matching logic
 * @param {string} guess - The user's guess to check
 * @param {Array} answers - Array of answer objects with {answer, found, index} properties
 * @returns {Array} Array of matching answer objects
 */
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
