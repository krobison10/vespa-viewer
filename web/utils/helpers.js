export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getTimeAgo(date) {
  const now = new Date();
  const inputDate = new Date(date);
  const diffTime = Math.abs(now - inputDate);

  // Time units in milliseconds
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30; // Approximation
  const year = day * 365; // Approximation

  // Determine the appropriate time unit
  if (diffTime < minute) {
    const seconds = Math.floor(diffTime / second);
    return seconds <= 0 ? 'Just now' : `${seconds}s ago`;
  } else if (diffTime < hour) {
    const minutes = Math.floor(diffTime / minute);
    return `${minutes}m ago`;
  } else if (diffTime < day) {
    const hours = Math.floor(diffTime / hour);
    return `${hours}h ago`;
  } else if (diffTime < week) {
    const days = Math.floor(diffTime / day);
    return `${days}d ago`;
  } else if (diffTime < month) {
    const weeks = Math.floor(diffTime / week);
    return `${weeks}w ago`;
  } else if (diffTime < year) {
    const months = Math.floor(diffTime / month);
    return `${months}mo ago`;
  } else {
    const years = Math.floor(diffTime / year);
    return `${years}y ago`;
  }
}

export function dateFormat(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
}

export function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (err) {
    console.warn(err);
    return false;
  }
}

/**
 * Get a cookie from the document object
 * @param {string} name - The name of the cookie to get
 * @returns {string|null} The value of the cookie or null if the cookie is not found
 */
export function getCookie(name) {
  if (typeof document === 'undefined') return undefined;

  const cookies = document.cookie.split(';');
  const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split('=')[1].trim()) : null;
}

/**
 * Set a cookie in the document object
 * @param {string} name - The name of the cookie to set
 * @param {string} value - The value of the cookie to set
 * @param {number} days - The number of days to expire the cookie
 */
export function setCookie(name, value, days) {
  if (typeof document === 'undefined') return undefined;

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}
