// Utility helper functions

/**
 * Clamp a value between min and max
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Generate a random number between min and max
 */
export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Generate a random integer between min and max (inclusive)
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Linear interpolation between two values
 */
export function lerp(start, end, t) {
    return start + (end - start) * t;
}

/**
 * Check if two circles intersect
 */
export function circleIntersect(x1, y1, r1, x2, y2, r2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < r1 + r2;
}

/**
 * Check if a point is within bounds
 */
export function inBounds(x, y, width, height, boundWidth, boundHeight) {
    return x >= 0 && x <= boundWidth - width && 
           y >= 0 && y <= boundHeight - height;
}

/**
 * Create a delay promise
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
