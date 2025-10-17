// tiktokEvents.js
// Handles incoming TikTok events from Chrome extension and routes them to GameManager

// Comment event listener
window.addEventListener("handleRealCommmentEvent", function(event) {
    const user = {
      username: event.detail.username,
      photoUrl: event.detail.photoUrl,
      gift_name: event.detail.gift_name || "",
      comment: event.detail.comment
    };
  
    // Pass the guess/comment to GameManager
    GameManager.handleRealComment(user);
  });
  
  // Gift event listener
  window.addEventListener("handleRealGiftEvent", function(event) {
    const user = {
      username: event.detail.username,
      photoUrl: event.detail.photoUrl,
      gift_name: event.detail.gift_name,
      comment: event.detail.comment || ""
    };
  
    // Pass the gift to GameManager
    GameManager.handleRealGift(user);
  });
  