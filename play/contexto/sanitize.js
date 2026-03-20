// sanitize.js
// Input sanitization utilities for Contexto.
// Cleans all incoming TikTok user data before it enters the game pipeline.

// ---------------------------------------------------------------------------
// Image URL allowlist — copied from l/leaderboard.js (keep in sync)
// Covers all TikTok CDN hostnames observed in production.
// ---------------------------------------------------------------------------
const TRUSTED_IMAGE_HOSTS = [
  // TikTok CDN - US
  'p16-sign-sg.tiktokcdn.com',
  'p16-common-sign.tiktokcdn-us.com',
  'p19-common-sign.tiktokcdn-us.com',
  'p16-sign-va.tiktokcdn.com',
  'p77-sign-va.tiktokcdn.com',
  'p77-sign-va-lite.tiktokcdn.com',
  'p58-sign-va.tiktokcdn.com',
  'p9-sign-sg.tiktokcdn.com',
  'p77-sign-sg.tiktokcdn.com',
  'p77-sign-sg-lite.tiktokcdn.com',
  // TikTok CDN - EU
  'p16-common-sign.tiktokcdn-eu.com',
  'p19-common-sign.tiktokcdn-eu.com',
  'p19-pu-sign-no.tiktokcdn-eu.com',
  'p16-pu-sign-no.tiktokcdn-eu.com',
  'p19-common-sign-useastred.tiktokcdn-eu.com',
  'p16-common-sign-useastred.tiktokcdn-eu.com',
  // ByteDance infrastructure
  'sf16-passport-va.ibytedtos.com',
  // App assets
  'static.vecteezy.com',
  'www.runchatcapture.com'
];

const DEFAULT_AVATAR = 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg';

/**
 * Returns true only if the URL is https and its hostname is in TRUSTED_IMAGE_HOSTS.
 * Rejects javascript:, data:, relative URLs, and any injected attribute payloads.
 */
function isSafeImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === 'https:' &&
      TRUSTED_IMAGE_HOSTS.some(host => parsed.hostname === host || parsed.hostname.endsWith('.' + host))
    );
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// HTML entity encoding — safe for all innerHTML text contexts
// ---------------------------------------------------------------------------

/**
 * Escapes the five characters that can break out of an HTML context.
 * After escaping, the value is safe to interpolate into innerHTML template strings.
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[m]);
}

// ---------------------------------------------------------------------------
// User object sanitizer — call this on every incoming TikTok event user object
// ---------------------------------------------------------------------------

/**
 * Returns a new user object with all text fields HTML-encoded and photoUrl
 * validated against the CDN allowlist (replaced with DEFAULT_AVATAR on failure).
 * Pass-through fields (followStatus, eventType) carry no HTML rendering risk.
 */
function sanitizeUser(user) {
  if (!user || typeof user !== 'object') return {};
  return {
    username:          escapeHtml(user.username),
    nickname:          escapeHtml(user.nickname),
    uniqueId:          escapeHtml(user.uniqueId),
    photoUrl:          isSafeImageUrl(user.photoUrl) ? user.photoUrl : DEFAULT_AVATAR,
    followStatus:      user.followStatus,
    gift_name:         escapeHtml(user.gift_name),
    comment:           escapeHtml(user.comment),
    eventType:         user.eventType,
    tikfinityUsername: user.tikfinityUsername ? escapeHtml(user.tikfinityUsername) : null
  };
}
