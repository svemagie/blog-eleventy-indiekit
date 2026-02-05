/**
 * Admin UI auth detection
 * Checks if the user is logged in to Indiekit by probing /session/login.
 * Dispatches a custom event for Alpine.js components to react to.
 */

(function () {
  const cacheKey = 'indiekit-auth-status';
  const cacheTTL = 5 * 60 * 1000; // 5 minutes

  function getCachedStatus() {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (!cached) return null;
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.ts > cacheTTL) {
        sessionStorage.removeItem(cacheKey);
        return null;
      }
      return parsed.loggedIn;
    } catch {
      return null;
    }
  }

  function setCachedStatus(loggedIn) {
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), loggedIn: loggedIn }));
    } catch {
      // sessionStorage full or unavailable
    }
  }

  function dispatch(loggedIn) {
    window.dispatchEvent(new CustomEvent('indiekit:auth', { detail: { loggedIn: loggedIn } }));
    if (loggedIn) {
      document.body.setAttribute('data-indiekit-auth', 'true');
    } else {
      document.body.removeAttribute('data-indiekit-auth');
    }
  }

  function checkAuth() {
    return fetch('/session/login', { credentials: 'same-origin', redirect: 'manual', cache: 'no-store' })
      .then(function (response) {
        // opaqueredirect means 302 → user is logged in
        return response.type === 'opaqueredirect';
      })
      .catch(function () {
        return false;
      });
  }

  // Cache-then-verify: show from cache instantly, correct in background
  var cached = getCachedStatus();
  if (cached !== null) {
    dispatch(cached);
  }

  checkAuth().then(function (loggedIn) {
    setCachedStatus(loggedIn);
    // Only re-dispatch if different from cache or no cache existed
    if (cached === null || cached !== loggedIn) {
      dispatch(loggedIn);
    }
  });
})();
