/**
 * Alpine.js TOC scanner component.
 * Scans .e-content for h2/h3/h4 headings with IDs,
 * builds a table of contents, and highlights the
 * current section via IntersectionObserver scroll spy.
 */
document.addEventListener("alpine:init", () => {
  Alpine.data("tocScanner", () => ({
    items: [],
    _observer: null,

    init() {
      const content = document.querySelector(".e-content");
      if (!content) { this._hideWrapper(); return; }

      const headings = content.querySelectorAll("h2[id], h3[id], h4[id]");
      if (headings.length < 3) { this._hideWrapper(); return; }

      this.items = Array.from(headings).map((h) => ({
        id: h.id,
        text: h.textContent.replace(/^#\s*/, "").trim(),
        level: parseInt(h.tagName[1]),
        active: false,
      }));

      this._observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              this.items.forEach((item) => {
                item.active = item.id === entry.target.id;
              });
            }
          }
        },
        { rootMargin: "0px 0px -70% 0px" },
      );

      headings.forEach((h) => this._observer.observe(h));
    },

    _hideWrapper() {
      const wrapper = this.$root.closest(".widget-collapsible");
      if (wrapper) wrapper.style.display = "none";
    },

    destroy() {
      if (this._observer) this._observer.disconnect();
    },
  }));
});
