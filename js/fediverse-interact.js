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
      this.showModal = true;
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
