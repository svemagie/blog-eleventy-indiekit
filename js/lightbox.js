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
    triggerElement: null,

    init() {
      const container = this.$root;
      const imgs = container.querySelectorAll(
        ".e-content img:not(.u-photo), .photo-gallery img.u-photo"
      );
      this.images = Array.from(imgs);

      this.images.forEach((img, i) => {
        img.style.cursor = "zoom-in";
        img.setAttribute("tabindex", "0");
        img.setAttribute("role", "button");
        img.setAttribute("aria-label", (img.alt || "Image") + " — click to enlarge");
        img.addEventListener("click", (e) => {
          e.preventDefault();
          this.show(i);
        });
        img.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this.show(i);
          }
        });
      });
    },

    show(index) {
      this.triggerElement = this.images[index];
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
      // Move focus to close button for keyboard users
      this.$nextTick(() => {
        const closeBtn = document.querySelector('[x-ref="closeBtn"]');
        if (closeBtn) closeBtn.focus();
      });
    },

    close() {
      this.open = false;
      this.src = "";
      document.body.style.overflow = "";
      // Return focus to the image that triggered the lightbox
      if (this.triggerElement) {
        this.triggerElement.focus();
        this.triggerElement = null;
      }
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
      if (e.key === "Tab") {
        const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
        if (!dialog) return;
        const focusable = Array.from(
          dialog.querySelectorAll('button, [tabindex]:not([tabindex="-1"])')
        ).filter((el) => el.offsetParent !== null);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
  }));
});
