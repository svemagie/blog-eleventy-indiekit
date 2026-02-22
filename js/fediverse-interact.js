/**
 * Fediverse remote interaction component (Alpine.js)
 * Enables users to like/boost/reply from their own fediverse instance
 * via the authorize_interaction endpoint.
 *
 * Registered via Alpine.data() so the component is available
 * regardless of script loading order.
 */

document.addEventListener("alpine:init", () => {
  Alpine.data("fediverseInteract", (postUrl) => ({
    postUrl,
    showModal: false,
    instance: "",
    suggestions: [],
    allNodes: null,
    loading: false,

    handleClick(event) {
      event.preventDefault();
      const saved = localStorage.getItem("fediverse_instance");
      if (saved && !event.shiftKey) {
        this.redirectToInstance(saved);
        return;
      }
      this.openModal(saved);
    },

    openModal(prefill) {
      this.instance = prefill || "";
      this.suggestions = [];
      this.showModal = true;
      this.fetchNodes();
      this.$nextTick(() => {
        const input = this.$refs.instanceInput;
        if (input) input.focus();
      });
    },

    async fetchNodes() {
      const cached = sessionStorage.getItem("fediverse_nodes");
      if (cached) {
        try {
          this.allNodes = JSON.parse(cached);
          this.filterSuggestions();
          return;
        } catch {
          // Corrupted cache, refetch
        }
      }

      this.loading = true;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      try {
        const res = await fetch("https://nodes.fediverse.party/nodes.json", {
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (res.ok) {
          this.allNodes = await res.json();
          sessionStorage.setItem(
            "fediverse_nodes",
            JSON.stringify(this.allNodes),
          );
          this.filterSuggestions();
        }
      } catch {
        // Network error or timeout — autocomplete unavailable
      } finally {
        this.loading = false;
      }
    },

    filterSuggestions() {
      const query = this.instance.trim().toLowerCase();
      if (!query || !this.allNodes) {
        this.suggestions = [];
        return;
      }
      this.suggestions = this.allNodes
        .filter((node) => node.toLowerCase().includes(query))
        .slice(0, 8);
    },

    selectSuggestion(domain) {
      this.instance = domain;
      this.suggestions = [];
    },

    confirm() {
      let domain = this.instance.trim();
      if (!domain) return;
      // Strip protocol and trailing slashes
      domain = domain.replace(/^https?:\/\//, "").replace(/\/+$/, "");
      localStorage.setItem("fediverse_instance", domain);
      this.showModal = false;
      this.redirectToInstance(domain);
    },

    redirectToInstance(domain) {
      const url = `https://${domain}/authorize_interaction?uri=${encodeURIComponent(this.postUrl)}`;
      window.location.href = url;
    },
  }));
});
