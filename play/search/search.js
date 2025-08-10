function getGoogleSuggestions(query) {
    return new Promise((resolve, reject) => {
        const url = `https://cc-test-server-4e3612916ba4.herokuapp.com/api/suggest?q=${encodeURIComponent(query)}`;
        
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                resolve({
                    query: query,
                    suggestions: data.suggestions || data || [],
                    timestamp: new Date().toISOString()
                });
            })
            .catch(error => {
                reject(new Error(`Failed to load suggestions: ${error.message}`));
            });
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