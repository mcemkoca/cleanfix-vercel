// CleanFix Auth Module v2
// Secure client-side auth with role checking, session timeout, and token validation
// NOTE: This is a DEMO/STATIC app. For production, use server-side JWT + HttpOnly cookies.

const AUTH = {
  TOKEN_KEY: 'kobipro_auth_token',
  USER_KEY: 'kobipro_user',
  SESSION_TTL_MS: 24 * 60 * 60 * 1000, // 24 hours (default)
  REMEMBER_TTL_MS: 7 * 24 * 60 * 60 * 1000, // 7 days

  getSessionTTL() {
    const remember = localStorage.getItem('cf_remember_me');
    return remember === '1' ? this.REMEMBER_TTL_MS : this.SESSION_TTL_MS;
  },

  // Generate a cryptographically secure random token
  generateSecureToken() {
    const arr = new Uint8Array(16);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(arr);
    } else {
      // Fallback for very old browsers (not cryptographically secure)
      for (let i = 0; i < 16; i++) arr[i] = Math.floor(Math.random() * 256);
    }
    const hex = Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
    return 'cf_' + hex + '_' + Date.now();
  },

  // Create and store a new session
  setSession(role = 'admin', name = 'Jan Wouters', email = 'jan@cleanfix.be') {
    const token = this.generateSecureToken();
    const user = { name, email, role, createdAt: Date.now() };
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    return { token, user };
  },

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  getUser() {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  // Validate token format and session expiry
  isValid() {
    const token = this.getToken();
    if (!token) return false;
    // Reject old predictable demo tokens (demo_ + timestamp)
    if (token.startsWith('demo_')) {
      this.logout();
      return false;
    }
    if (!token.startsWith('cf_')) return false;
    const parts = token.split('_');
    if (parts.length !== 3) return false;
    const ts = parseInt(parts[2], 10);
    if (isNaN(ts)) return false;
    if (Date.now() - ts > this.getSessionTTL()) {
      this.logout();
      return false;
    }
    return true;
  },

  // Check if user is authenticated; optionally enforce role
  checkAuth(requiredRole) {
    if (!this.isValid()) {
      window.location.replace('login.html');
      return false;
    }
    if (requiredRole) {
      const user = this.getUser();
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!user || !roles.includes(user.role)) {
        window.location.replace('login.html?error=unauthorized');
        return false;
      }
    }
    return true;
  },

  // Logout and clear storage
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    window.location.replace('login.html');
  },

  // Alias for backward compat
  requireRole(roles) {
    return this.checkAuth(roles);
  }
};

// Global exports for backward compatibility
window.AUTH = AUTH;
window.checkAuth = AUTH.checkAuth.bind(AUTH);
