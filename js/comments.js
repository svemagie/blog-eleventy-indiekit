/**
 * Client-side comments component (Alpine.js)
 * Handles IndieAuth flow, comment submission, and display
 *
 * Registered via Alpine.data() so the component is available
 * regardless of script loading order.
 */

document.addEventListener("alpine:init", () => {
  Alpine.data("commentsSection", (targetUrl) => ({
    targetUrl,
    user: null,
    meUrl: "",
    commentText: "",
    comments: [],
    loading: true,
    authLoading: false,
    submitting: false,
    statusMessage: "",
    statusType: "info",
    maxLength: 2000,

    async init() {
      await this.checkSession();
      await this.loadComments();
      this.handleAuthReturn();
    },

    async checkSession() {
      try {
        const res = await fetch("/comments/api/session", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) this.user = data.user;
        }
      } catch {
        // No session
      }
    },

    handleAuthReturn() {
      const params = new URLSearchParams(window.location.search);
      const authError = params.get("auth_error");
      if (authError) {
        this.showStatus(`Authentication failed: ${authError}`, "error");
        window.history.replaceState(
          {},
          "",
          window.location.pathname + "#comments",
        );
      }
    },

    async loadComments() {
      this.loading = true;
      try {
        const url = `/comments/api/comments?target=${encodeURIComponent(this.targetUrl)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          this.comments = data.children || [];
        }
      } catch (e) {
        console.error("[Comments] Load error:", e);
      } finally {
        this.loading = false;
      }
    },

    async startAuth() {
      this.authLoading = true;
      try {
        const res = await fetch("/comments/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            me: this.meUrl,
            returnUrl: window.location.pathname + "#comments",
          }),
          credentials: "include",
        });

        if (!res.ok) {
          const data = await res.json();
          this.showStatus(data.error || "Auth failed", "error");
          return;
        }

        const data = await res.json();
        if (data.authUrl) {
          window.location.href = data.authUrl;
        }
      } catch {
        this.showStatus("Failed to start authentication", "error");
      } finally {
        this.authLoading = false;
      }
    },

    async submitComment() {
      if (!this.commentText.trim()) return;
      this.submitting = true;

      try {
        const res = await fetch("/comments/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: this.commentText,
            target: this.targetUrl,
          }),
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (data.comment) {
            this.comments.unshift(data.comment);
          }
          this.commentText = "";
          this.showStatus("Comment posted!", "success");
        } else {
          const data = await res.json();
          this.showStatus(data.error || "Failed to post", "error");
        }
      } catch {
        this.showStatus("Error posting comment", "error");
      } finally {
        this.submitting = false;
      }
    },

    signOut() {
      document.cookie =
        "comment_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      this.user = null;
      this.showStatus("Signed out", "info");
    },

    showStatus(message, type = "info") {
      this.statusMessage = message;
      this.statusType = type;
      setTimeout(() => {
        this.statusMessage = "";
      }, 5000);
    },
  }));
});
