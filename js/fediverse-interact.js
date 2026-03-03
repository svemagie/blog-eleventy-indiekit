/**
 * Fediverse interaction & sharing component (Alpine.js)
 *
 * Two modes:
 *   - "interact" (default): redirect to authorize_interaction for like/boost/reply/follow
 *   - "share": redirect to /share?text=... for composing a new post
 *
 * Stores multiple domains in localStorage with usage tracking.
 * Registered via Alpine.data() so the component is available
 * regardless of script loading order.
 */

const STORAGE_KEY = "fediverse_domains_v1";
const OLD_STORAGE_KEY = "fediverse_instance";

function loadDomains() {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (json) return JSON.parse(json);
  } catch { /* corrupted data */ }

  // Migrate from old single-domain key
  const old = localStorage.getItem(OLD_STORAGE_KEY);
  if (old) {
    const domains = [{ domain: old, used: 1, lastUsed: new Date().toISOString() }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(domains));
    localStorage.removeItem(OLD_STORAGE_KEY);
    return domains;
  }

  return [];
}

function saveDomains(domains) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(domains));
}

function addDomain(domain) {
  const domains = loadDomains();
  const existing = domains.find((d) => d.domain === domain);
  if (existing) {
    existing.used += 1;
    existing.lastUsed = new Date().toISOString();
  } else {
    domains.push({ domain, used: 1, lastUsed: new Date().toISOString() });
  }
  saveDomains(domains);
  return domains;
}

function removeDomain(domain) {
  const domains = loadDomains().filter((d) => d.domain !== domain);
  saveDomains(domains);
  return domains;
}

function isValidDomain(str) {
  try {
    return new URL(`https://${str}`).hostname === str;
  } catch {
    return false;
  }
}

document.addEventListener("alpine:init", () => {
  Alpine.data("fediverseInteract", (targetUrl, mode) => ({
    targetUrl,
    mode: mode || "interact",
    showModal: false,
    instance: "",
    savedDomains: [],
    showInput: false,
    error: "",

    handleClick(event) {
      event.preventDefault();
      this.savedDomains = loadDomains().sort((a, b) => b.used - a.used);

      if (this.savedDomains.length === 1 && !event.shiftKey) {
        addDomain(this.savedDomains[0].domain);
        this.redirectToInstance(this.savedDomains[0].domain);
        return;
      }

      if (this.savedDomains.length === 0) {
        this.showInput = true;
      } else {
        this.showInput = false;
      }

      this.instance = "";
      this.error = "";
      this.showModal = true;
    },

    showAddNew() {
      this.showInput = true;
      this.instance = "";
      this.error = "";
      this.$nextTick(() => {
        const input = this.$refs.instanceInput;
        if (input) input.focus();
      });
    },

    confirm() {
      let domain = this.instance.trim();
      if (!domain) return;
      // Strip protocol and trailing slashes
      domain = domain.replace(/^https?:\/\//, "").replace(/\/+$/, "");

      if (!isValidDomain(domain)) {
        this.error = "Please enter a valid domain (e.g. mastodon.social)";
        return;
      }

      this.error = "";
      this.savedDomains = addDomain(domain);
      this.showModal = false;
      this.redirectToInstance(domain);
    },

    useSaved(domain) {
      this.savedDomains = addDomain(domain);
      this.showModal = false;
      this.redirectToInstance(domain);
    },

    deleteSaved(domain) {
      this.savedDomains = removeDomain(domain);
      if (this.savedDomains.length === 0) {
        this.showInput = true;
      }
    },

    redirectToInstance(domain) {
      if (this.mode === "share") {
        window.location.href = `https://${domain}/share?text=${encodeURIComponent(this.targetUrl)}`;
      } else {
        window.location.href = `https://${domain}/authorize_interaction?uri=${encodeURIComponent(this.targetUrl)}`;
      }
    },
  }));
});
