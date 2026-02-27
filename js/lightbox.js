/**
 * Alpine.js lightbox component for article images.
 * Registers via alpine:init so it's available before Alpine starts.
 * Click any image inside .e-content to view fullscreen.
 * Navigate with arrow keys, close with Escape or click outside.
 */
document.addEventListener("alpine:init", () => {
  Alpine.data("lightbox", () => ({
    open: false,
    src: "",
    alt: "",
    images: [],
    currentIndex: 0,

    init() {
      const container = this.$root;
      const imgs = container.querySelectorAll(
        ".e-content img:not(.u-photo)"
      );
      this.images = Array.from(imgs);

      this.images.forEach((img, i) => {
        img.style.cursor = "zoom-in";
        img.addEventListener("click", (e) => {
          e.preventDefault();
          this.show(i);
        });
      });
    },

    show(index) {
      this.currentIndex = index;
      const img = this.images[index];
      // Use the largest source available
      const picture = img.closest("picture");
      if (picture) {
        const source = picture.querySelector("source");
        if (source) {
          // Extract the URL from srcset (strip width descriptor)
          const srcset = source.getAttribute("srcset") || "";
          this.src = srcset.split(/\s+/)[0] || img.src;
        } else {
          this.src = img.src;
        }
      } else {
        this.src = img.src;
      }
      this.alt = img.alt || "";
      this.open = true;
      document.body.style.overflow = "hidden";
    },

    close() {
      this.open = false;
      this.src = "";
      document.body.style.overflow = "";
    },

    next() {
      if (this.images.length > 1) {
        this.show((this.currentIndex + 1) % this.images.length);
      }
    },

    prev() {
      if (this.images.length > 1) {
        this.show(
          (this.currentIndex - 1 + this.images.length) % this.images.length
        );
      }
    },

    onKeydown(e) {
      if (!this.open) return;
      if (e.key === "Escape") this.close();
      if (e.key === "ArrowRight") this.next();
      if (e.key === "ArrowLeft") this.prev();
    },
  }));
});
