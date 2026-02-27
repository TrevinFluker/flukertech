// ========================================================
// 🎮 CONTEXTO ACTIVE HOSTS - Main JavaScript
// ========================================================

// API Configuration
const API_URL = 'https://cc-contexto-d01a6bbfa039.herokuapp.com/api/active-hosts?gameType=contexto';
const REFRESH_INTERVAL = 30000; // 30 seconds
const LOCAL_STORAGE_KEY = 'contextoActiveBackground';

// State
let activeHosts = [];
let lastFetchTime = null;
let refreshIntervalId = null;

// ========================================================
// INITIALIZATION
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  // Load saved background (if using same system as leaderboard)
  loadSavedBackground();
  
  // Fetch initial data
  fetchAndRender();
  
  // Set up auto-refresh
  startAutoRefresh();
  
  // Update "last update" timer every 10 seconds
  setInterval(updateLastUpdateDisplay, 10000);
}

// ========================================================
// API CALLS
// ========================================================

async function fetchActiveHosts() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching active hosts:', error);
    throw error;
  }
}

// ========================================================
// RENDERING
// ========================================================

async function fetchAndRender() {
  showLoading();
  hideError();
  
  try {
    const data = await fetchActiveHosts();
    
    // Filter to only show hosts active within last 30 minutes
    const allHosts = data.activeHosts || [];
    activeHosts = allHosts.filter(host => {
      const timeAgo = getTimeAgo(host.lastActive);
      return timeAgo.minutes < 30;
    });
    
    lastFetchTime = new Date();
    
    renderHosts(activeHosts);
    updateInfoBanner(activeHosts.length);
    updateLastUpdateDisplay();
    
    hideLoading();
    
    if (activeHosts.length === 0) {
      showEmptyState();
    } else {
      hideEmptyState();
    }
    
  } catch (error) {
    hideLoading();
    showError('Failed to load active hosts. Please try again.');
    console.error('Error:', error);
  }
}

function renderHosts(hosts) {
  const container = document.getElementById('hostsGrid');
  container.innerHTML = '';
  
  if (hosts.length === 0) {
    return;
  }
  
  hosts.filter(host => host.username != null).forEach(host => {
    const card = createHostCard(host);
    container.appendChild(card);
  });
}

function createHostCard(host) {
  const card = document.createElement('a');
  card.className = 'host-card';
  card.href = `https://www.tiktok.com/@${host.username}/live`;
  card.target = '_blank';
  card.rel = 'noopener noreferrer';
  
  const timeAgo = getTimeAgo(host.lastActive);
  const timeBadgeClass = getTimeBadgeClass(timeAgo.minutes);
  
  card.innerHTML = `
    <div class="host-card-header">
      <span class="live-indicator">● LIVE</span>
    </div>
    <div class="host-username">@${escapeHtml(host.username)}</div>
    <div class="host-info">
      <div class="host-time">
        <span>⏱️ Last active:</span>
        <span class="time-badge ${timeBadgeClass}">${timeAgo.text}</span>
      </div>
    </div>
  `;
  
  return card;
}

function updateInfoBanner(count) {
  const activeCountEl = document.getElementById('activeCount');
  activeCountEl.textContent = `${count} Active Host${count !== 1 ? 's' : ''}`;
}

function updateLastUpdateDisplay() {
  if (!lastFetchTime) return;
  
  const lastUpdateEl = document.getElementById('lastUpdate');
  const timeAgo = getTimeAgo(lastFetchTime.toISOString());
  lastUpdateEl.textContent = `Updated ${timeAgo.text}`;
}

// ========================================================
// TIME UTILITIES
// ========================================================

function getTimeAgo(isoString) {
  const now = new Date();
  const then = new Date(isoString);
  const diffMs = now - then;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  
  if (diffSeconds < 60) {
    return { text: 'just now', minutes: 0 };
  } else if (diffMinutes < 60) {
    return { 
      text: `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`,
      minutes: diffMinutes 
    };
  } else if (diffHours < 24) {
    return { 
      text: `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`,
      minutes: diffMinutes 
    };
  } else {
    const diffDays = Math.floor(diffHours / 24);
    return { 
      text: `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`,
      minutes: diffMinutes 
    };
  }
}

function getTimeBadgeClass(minutes) {
  if (minutes < 5) {
    return ''; // green (default)
  } else if (minutes < 15) {
    return 'warning'; // yellow
  } else {
    return 'old'; // gray
  }
}

// ========================================================
// AUTO-REFRESH
// ========================================================

function startAutoRefresh() {
  // Clear any existing interval
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
  }
  
  // Set up new interval
  refreshIntervalId = setInterval(() => {
    fetchAndRender();
  }, REFRESH_INTERVAL);
}

function stopAutoRefresh() {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }
}

// Stop refresh when page is hidden, resume when visible
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopAutoRefresh();
  } else {
    startAutoRefresh();
    fetchAndRender(); // Fetch immediately when returning to page
  }
});

// ========================================================
// BACKGROUND MANAGEMENT (Optional - same as leaderboard)
// ========================================================

function loadSavedBackground() {
  const savedBg = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (savedBg) {
    document.body.style.backgroundImage = `url('${savedBg}')`;
    document.body.setAttribute('data-has-bg-image', 'true');
  }
  // If no saved background, use the default GIF from CSS
}

// ========================================================
// UI HELPERS
// ========================================================

function showLoading() {
  document.getElementById('loadingContainer').style.display = 'flex';
  document.getElementById('hostsContainer').style.opacity = '0.5';
}

function hideLoading() {
  document.getElementById('loadingContainer').style.display = 'none';
  document.getElementById('hostsContainer').style.opacity = '1';
}

function showError(message) {
  const errorEl = document.getElementById('errorMessage');
  errorEl.textContent = message;
  errorEl.style.display = 'block';
}

function hideError() {
  document.getElementById('errorMessage').style.display = 'none';
}

function showEmptyState() {
  document.getElementById('emptyState').style.display = 'block';
  document.getElementById('hostsContainer').style.display = 'none';
}

function hideEmptyState() {
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('hostsContainer').style.display = 'block';
}

function escapeHtml(text) {
  if (text == null) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}
