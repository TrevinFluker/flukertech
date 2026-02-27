// ========================================================
// 🏆 CONTEXTO LEADERBOARD - Main JavaScript
// ========================================================

// API Configuration
const API_BASE_URL = 'https://cc-contexto-d01a6bbfa039.herokuapp.com/api/contexto-leaderboard';
const LOCAL_STORAGE_KEY = 'contextoLeaderboardBackground';

// State Management
let currentFilters = {
  timeRange: 'all',
  streamer: null,
  followersOnly: false,
  page: 1,
  limit: 50
};

let paginationData = {
  totalCount: 0,
  totalPages: 0
};

let leaderboardData = [];
let searchQuery = '';

// ========================================================
// INITIALIZATION
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  // Load saved background
  loadSavedBackground();
  
  // Parse URL parameters
  const urlParams = parseURLParams();
  if (urlParams.streamer) {
    currentFilters.streamer = urlParams.streamer;
    document.getElementById('streamerInput').value = urlParams.streamer;
    switchToStreamerMode();
  }
  if (urlParams.timeRange) {
    currentFilters.timeRange = urlParams.timeRange;
  }
  if (urlParams.followersOnly) {
    currentFilters.followersOnly = true;
    document.getElementById('followersOnlyCheckbox').checked = true;
  }
  
  // Initialize event listeners
  initializeEventListeners();
  
  // Initialize backgrounds
  initializeBackgrounds();
  
  // Update UI to match current filters
  updateFilterButtons();
  
  // Hide followers only section if in global mode
  if (!currentFilters.streamer) {
    const followersSection = document.getElementById('followersOnlyCheckbox').closest('.filter-section');
    if (followersSection) followersSection.style.display = 'none';
  }
  
  // Fetch initial data
  fetchAndRender();
}

// ========================================================
// URL PARAMETER PARSING
// ========================================================

function parseURLParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    streamer: params.get('streamer') || null,
    timeRange: params.get('timeRange') || 'all',
    followersOnly: params.get('followersOnly') === 'true'
  };
}

function updateURL() {
  const params = new URLSearchParams();
  
  if (currentFilters.streamer) {
    params.set('streamer', currentFilters.streamer);
  }
  if (currentFilters.timeRange !== 'all') {
    params.set('timeRange', currentFilters.timeRange);
  }
  if (currentFilters.followersOnly) {
    params.set('followersOnly', 'true');
  }
  
  const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
  window.history.replaceState({}, '', newURL);
}

// ========================================================
// EVENT LISTENERS
// ========================================================

function initializeEventListeners() {
  // Time range buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!btn.dataset.range) return; // skip buttons without a time range (e.g. live-hosts-btn)
      currentFilters.timeRange = btn.dataset.range;
      currentFilters.page = 1;
      updateFilterButtons();
      fetchAndRender();
    });
  });
  
  // Streamer mode toggle
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.mode === 'global') {
        switchToGlobalMode();
      } else {
        switchToStreamerMode();
      }
    });
  });
  
  // Apply streamer button
  document.getElementById('applyStreamerBtn').addEventListener('click', () => {
    const streamerInput = document.getElementById('streamerInput').value.trim();
    if (streamerInput) {
      currentFilters.streamer = streamerInput;
      currentFilters.page = 1;
      fetchAndRender();
    }
  });
  
  // Streamer input - apply on Enter
  document.getElementById('streamerInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('applyStreamerBtn').click();
    }
  });
  
  // Followers only checkbox
  document.getElementById('followersOnlyCheckbox').addEventListener('change', (e) => {
    currentFilters.followersOnly = e.target.checked;
    currentFilters.page = 1;
    fetchAndRender();
  });
  
  // Search functionality commented out for now
  /*
  // Search input
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', debounce((e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    if (searchQuery) {
      document.getElementById('clearSearchBtn').style.display = 'flex';
      highlightSearchResults();
    } else {
      document.getElementById('clearSearchBtn').style.display = 'none';
      clearSearchHighlight();
    }
  }, 300));
  
  // Clear search button
  document.getElementById('clearSearchBtn').addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    searchQuery = '';
    document.getElementById('clearSearchBtn').style.display = 'none';
    clearSearchHighlight();
  });
  */
  
  // Settings button
  document.getElementById('settingsButton').addEventListener('click', openSettings);
  
  // Close settings
  document.getElementById('closeSettingsBtn').addEventListener('click', closeSettings);
  document.getElementById('settingsOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'settingsOverlay') {
      closeSettings();
    }
  });
  
  // Export button
  document.getElementById('exportBtn').addEventListener('click', exportToCSV);
  
  // Live Hosts button
  document.getElementById('liveHostsBtn').addEventListener('click', () => {
    window.location.href = '../a/index.html';
  });
}

// ========================================================
// MODE SWITCHING
// ========================================================

function switchToGlobalMode() {
  currentFilters.streamer = null;
  currentFilters.page = 1;
  document.getElementById('streamerInputContainer').style.display = 'none';
  // Hide followers only checkbox in global mode
  const followersSection = document.getElementById('followersOnlyCheckbox').closest('.filter-section');
  if (followersSection) followersSection.style.display = 'none';
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === 'global');
  });
  fetchAndRender();
}

function switchToStreamerMode() {
  document.getElementById('streamerInputContainer').style.display = 'flex';
  // Show followers only checkbox in streamer mode
  const followersSection = document.getElementById('followersOnlyCheckbox').closest('.filter-section');
  if (followersSection) followersSection.style.display = 'block';
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === 'streamer');
  });
  // Only fetch if streamer is already set
  if (currentFilters.streamer) {
    fetchAndRender();
  }
}

function updateFilterButtons() {
  // Update time range buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.range === currentFilters.timeRange);
  });
}

// ========================================================
// API CALLS
// ========================================================

async function fetchLeaderboard(filters) {
  const params = new URLSearchParams({
    timeRange: filters.timeRange,
    page: filters.page,
    limit: filters.limit
  });
  
  if (filters.streamer) {
    params.append('streamer', filters.streamer);
  }
  
  if (filters.followersOnly) {
    params.append('followersOnly', 'true');
  }
  
  const url = `${API_BASE_URL}?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
}

async function fetchAllPages(filters) {
  const allData = [];
  let page = 1;
  let totalPages = 1;
  
  showLoading();
  
  while (page <= totalPages) {
    const result = await fetchLeaderboard({ ...filters, page, limit: 100 });
    allData.push(...result.leaderboard);
    totalPages = result.pagination.totalPages;
    page++;
  }
  
  hideLoading();
  return allData;
}

// ========================================================
// RENDERING
// ========================================================

async function fetchAndRender() {
  showLoading();
  hideError();
  
  try {
    const data = await fetchLeaderboard(currentFilters);
    
    leaderboardData = data.leaderboard;
    paginationData = data.pagination;
    
    renderLeaderboard(leaderboardData);
    renderPagination();
    updateFilterInfo();
    updateExportButton();
    updateURL();
    
    hideLoading();
    
    if (leaderboardData.length === 0) {
      showEmptyState();
    } else {
      hideEmptyState();
    }
    
  } catch (error) {
    hideLoading();
    showError('Failed to load leaderboard. Please try again.');
    console.error('Error:', error);
  }
}

function renderLeaderboard(data) {
  const container = document.getElementById('leaderboardList');
  container.innerHTML = '';
  
  if (data.length === 0) {
    return;
  }
  
  // Filter out @host user
  const filteredData = data.filter(entry => entry.uniqueId !== 'host');
  
  filteredData.forEach(entry => {
    const row = createLeaderboardRow(entry);
    container.appendChild(row);
  });
  
  // Search functionality commented out for now
  /*
  // If there's a search query, highlight results
  if (searchQuery) {
    highlightSearchResults();
  }
  */
}

function createLeaderboardRow(entry) {
  const row = document.createElement('div');
  row.className = 'leaderboard-row';
  row.dataset.userData = JSON.stringify(entry);
  row.dataset.uniqueId = entry.uniqueId;
  row.dataset.nickname = (entry.nickname || '').toLowerCase();
  
  // Rank styling
  let rankClass = 'rank-number';
  if (entry.rank === 1) rankClass += ' top1';
  else if (entry.rank === 2) rankClass += ' top2';
  else if (entry.rank === 3) rankClass += ' top3';
  
  // Avatar with fallback to default profile icon
  const avatarSrc = entry.photoUrl || 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg';
  
  row.innerHTML = `
    <div class="${rankClass}">#${entry.rank}</div>
    <div class="player-info">
      <img src="${avatarSrc}" alt="${entry.nickname}" class="player-avatar" onerror="this.src='https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'">
      <div class="player-text">
        <div class="player-nickname">${escapeHtml(entry.nickname || 'Anonymous')}</div>
        <div class="player-id">@${escapeHtml(entry.uniqueId || 'unknown')}</div>
      </div>
    </div>
    <div class="win-count">
      <span>🏆 ${entry.winCount}</span>
    </div>
  `;
  
  return row;
}

function renderPagination() {
  const info = document.getElementById('paginationInfo');
  const controls = document.getElementById('paginationControls');
  
  const start = (paginationData.page - 1) * currentFilters.limit + 1;
  const end = Math.min(paginationData.page * currentFilters.limit, paginationData.totalCount);
  
  info.textContent = `Showing ${start}-${end} of ${paginationData.totalCount} players`;
  
  controls.innerHTML = '';
  
  if (paginationData.totalPages <= 1) {
    return;
  }
  
  // First button
  const firstBtn = createPageButton('First', 1, paginationData.page === 1);
  controls.appendChild(firstBtn);
  
  // Previous button
  const prevBtn = createPageButton('◄ Prev', paginationData.page - 1, paginationData.page === 1);
  controls.appendChild(prevBtn);
  
  // Page numbers
  const pageNumbers = getPageNumbers(paginationData.page, paginationData.totalPages);
  pageNumbers.forEach(pageNum => {
    if (pageNum === '...') {
      const ellipsis = document.createElement('span');
      ellipsis.textContent = '...';
      ellipsis.className = 'page-btn';
      ellipsis.style.cursor = 'default';
      ellipsis.style.border = 'none';
      controls.appendChild(ellipsis);
    } else {
      const btn = createPageButton(pageNum, pageNum, false, pageNum === paginationData.page);
      controls.appendChild(btn);
    }
  });
  
  // Next button
  const nextBtn = createPageButton('Next ►', paginationData.page + 1, paginationData.page === paginationData.totalPages);
  controls.appendChild(nextBtn);
  
  // Last button
  const lastBtn = createPageButton('Last', paginationData.totalPages, paginationData.page === paginationData.totalPages);
  controls.appendChild(lastBtn);
}

function createPageButton(label, pageNum, disabled, isActive = false) {
  const btn = document.createElement('button');
  btn.className = 'page-btn';
  btn.textContent = label;
  btn.disabled = disabled;
  
  if (isActive) {
    btn.classList.add('active');
  }
  
  if (!disabled) {
    btn.addEventListener('click', () => goToPage(pageNum));
  }
  
  return btn;
}

function getPageNumbers(current, total) {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let l;
  
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }
  
  range.forEach(i => {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  });
  
  return rangeWithDots;
}

function goToPage(pageNum) {
  currentFilters.page = pageNum;
  fetchAndRender();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================================================
// SEARCH & HIGHLIGHT
// ========================================================

function highlightSearchResults() {
  const rows = document.querySelectorAll('.leaderboard-row');
  let foundAny = false;
  
  rows.forEach(row => {
    const nickname = row.dataset.nickname;
    const uniqueId = row.dataset.uniqueId.toLowerCase();
    
    const matches = nickname.includes(searchQuery) || uniqueId.includes(searchQuery);
    
    if (matches) {
      row.classList.add('highlighted');
      
      // Add "You!" badge if not already present
      if (!row.querySelector('.found-badge')) {
        const badge = document.createElement('span');
        badge.className = 'found-badge';
        badge.textContent = '⭐ Found!';
        row.querySelector('.win-count').appendChild(badge);
      }
      
      if (!foundAny) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        foundAny = true;
      }
    } else {
      row.classList.remove('highlighted');
      const badge = row.querySelector('.found-badge');
      if (badge) badge.remove();
    }
  });
}

function clearSearchHighlight() {
  document.querySelectorAll('.leaderboard-row').forEach(row => {
    row.classList.remove('highlighted');
    const badge = row.querySelector('.found-badge');
    if (badge) badge.remove();
  });
}

// ========================================================
// FILTER INFO
// ========================================================

function updateFilterInfo() {
  const summary = document.getElementById('filterSummary');
  
  let text = 'Showing: ';
  
  if (currentFilters.streamer) {
    text += `${currentFilters.streamer}'s Leaderboard`;
  } else {
    text += 'Global Leaderboard';
  }
  
  const timeRangeText = {
    'all': 'All Time',
    'today': 'Today',
    'week': 'This Week',
    'month': 'This Month'
  };
  
  text += ` - ${timeRangeText[currentFilters.timeRange]}`;
  
  if (currentFilters.followersOnly) {
    text += ' (Followers Only)';
  }
  
  summary.textContent = text;
}

// ========================================================
// SETTINGS PANEL
// ========================================================

function openSettings() {
  document.getElementById('settingsOverlay').style.display = 'flex';
  updateExportButton();
}

function closeSettings() {
  document.getElementById('settingsOverlay').style.display = 'none';
}

function initializeBackgrounds() {
  const grid = document.getElementById('backgroundGrid');
  grid.innerHTML = '';
  
  // Get saved background
  const savedBg = localStorage.getItem(LOCAL_STORAGE_KEY);
  
  // Add default option
  const defaultOption = createBackgroundOption('Default', null);
  if (!savedBg) {
    defaultOption.classList.add('selected');
  }
  grid.appendChild(defaultOption);
  
  // Add background images from backgrounds.js
  if (typeof backgroundImages !== 'undefined') {
    backgroundImages.forEach((url, index) => {
      const option = createBackgroundOption(`Background ${index + 1}`, url);
      if (savedBg === url) {
        option.classList.add('selected');
      }
      grid.appendChild(option);
    });
  }
}

function createBackgroundOption(name, url) {
  const option = document.createElement('div');
  option.className = 'background-option';
  option.title = name;
  
  if (url) {
    option.style.backgroundImage = `url('${url}')`;
  } else {
    option.style.background = 'linear-gradient(135deg, #15202b 0%, #1e2433 100%)';
  }
  
  option.addEventListener('click', () => {
    selectBackground(url);
  });
  
  return option;
}

function selectBackground(url) {
  if (url) {
    document.body.style.backgroundImage = `url('${url}')`;
    document.body.setAttribute('data-has-bg-image', 'true');
    localStorage.setItem(LOCAL_STORAGE_KEY, url);
  } else {
    // Reset to default GIF
    document.body.style.backgroundImage = `url('https://i.pinimg.com/originals/f1/a7/07/f1a707c5bad8b99796c8c4591d8fc6a2.gif')`;
    document.body.removeAttribute('data-has-bg-image');
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
  
  // Update selection UI
  document.querySelectorAll('.background-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  event.target.classList.add('selected');
}

function loadSavedBackground() {
  const savedBg = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (savedBg) {
    document.body.style.backgroundImage = `url('${savedBg}')`;
    document.body.setAttribute('data-has-bg-image', 'true');
  }
  // If no saved background, use the default GIF from CSS
}

// ========================================================
// CSV EXPORT
// ========================================================

function updateExportButton() {
  const exportBtn = document.getElementById('exportBtn');
  const exportHint = document.getElementById('exportHint');
  
  if (currentFilters.streamer) {
    exportBtn.disabled = false;
    exportHint.style.display = 'none';
  } else {
    exportBtn.disabled = true;
    exportHint.style.display = 'block';
  }
}

async function exportToCSV() {
  if (!currentFilters.streamer) {
    alert('CSV export is only available for single streamer view');
    return;
  }
  
  try {
    // Show loading state
    const exportBtn = document.getElementById('exportBtn');
    const originalText = exportBtn.textContent;
    exportBtn.textContent = '⏳ Fetching data...';
    exportBtn.disabled = true;
    
    // Fetch all pages
    const allData = await fetchAllPages(currentFilters);
    
    // Generate CSV
    const csv = generateCSV(allData);
    
    // Download
    const filename = `contexto_leaderboard_${currentFilters.streamer}_${currentFilters.timeRange}_${Date.now()}.csv`;
    downloadCSV(csv, filename);
    
    // Reset button
    exportBtn.textContent = originalText;
    exportBtn.disabled = false;
    
  } catch (error) {
    console.error('Export error:', error);
    alert('Failed to export data. Please try again.');
    
    const exportBtn = document.getElementById('exportBtn');
    exportBtn.textContent = '📊 Export to CSV';
    exportBtn.disabled = false;
  }
}

function generateCSV(data) {
  const headers = ['Rank', 'Nickname', 'UniqueId', 'WinCount', 'FollowStatus'];
  const rows = data.map(entry => [
    entry.rank,
    `"${(entry.nickname || '').replace(/"/g, '""')}"`,
    entry.uniqueId,
    entry.winCount,
    entry.followStatus !== null ? entry.followStatus : ''
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// ========================================================
// UI HELPERS
// ========================================================

function showLoading() {
  document.getElementById('loadingContainer').style.display = 'flex';
  document.getElementById('leaderboardContainer').style.opacity = '0.5';
}

function hideLoading() {
  document.getElementById('loadingContainer').style.display = 'none';
  document.getElementById('leaderboardContainer').style.opacity = '1';
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
  document.getElementById('leaderboardContainer').style.display = 'none';
}

function hideEmptyState() {
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('leaderboardContainer').style.display = 'block';
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
