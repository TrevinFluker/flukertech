function getGoogleSuggestions(query) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const callbackName = 'googleSuggestCallback_' + Date.now();
        
        // Create global callback function
        window[callbackName] = function(data) {
            // Cleanup
            document.head.removeChild(script);
            delete window[callbackName];
            
            // The response format is [query, [suggestions], [], []]
            const suggestions = data[1] || [];
            
            resolve({
                query: data[0],
                suggestions: suggestions,
                timestamp: new Date().toISOString()
            });
        };
        
        script.src = `https://suggestqueries.google.com/complete/search?client=chrome&callback=${callbackName}&q=${encodeURIComponent(query)}`;
        script.onerror = () => {
            reject(new Error('Failed to load suggestions'));
            document.head.removeChild(script);
            delete window[callbackName];
        };
        
        document.head.appendChild(script);
    });
}

// Usage example:
getGoogleSuggestions('javascript')
  .then(result => {
    console.log('Query:', result.query);
    console.log('Suggestions:', result.suggestions);
    console.log('Timestamp:', result.timestamp);
  })
  .catch(error => {
    console.error('Error:', error.message);
  });