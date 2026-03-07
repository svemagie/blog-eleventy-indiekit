/**
 * <time-difference> Web Component
 * Progressively enhances <time> elements with relative date display.
 * Falls back to static date text when JS is unavailable.
 *
 * Usage: <time-difference><time datetime="2026-02-15T...">February 15, 2026</time></time-difference>
 *
 * Inspired by zachleat.com's time-difference component.
 */
class TimeDifference extends HTMLElement {
  static register(tagName = "time-difference") {
    if ("customElements" in window) {
      customElements.define(tagName, TimeDifference);
    }
  }

  connectedCallback() {
    this.update();
    // Auto-update every 60 seconds
    this._interval = setInterval(() => this.update(), 60000);
  }

  disconnectedCallback() {
    clearInterval(this._interval);
  }

  update() {
    const time = this.querySelector("time[datetime]");
    if (!time) return;

    const datetime = time.getAttribute("datetime");
    if (!datetime) return;

    const date = new Date(datetime);
    if (isNaN(date.getTime())) return;

    const now = new Date();
    const diffMs = now - date;

    // Don't show relative time for future dates
    if (diffMs < 0) return;

    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30.44);
    const diffYear = Math.floor(diffDay / 365.25);

    let value, unit;

    if (diffSec < 60) {
      value = -diffSec;
      unit = "second";
    } else if (diffMin < 60) {
      value = -diffMin;
      unit = "minute";
    } else if (diffHour < 24) {
      value = -diffHour;
      unit = "hour";
    } else if (diffDay < 7) {
      value = -diffDay;
      unit = "day";
    } else if (diffWeek < 4) {
      value = -diffWeek;
      unit = "week";
    } else if (diffMonth < 12) {
      value = -diffMonth;
      unit = "month";
    } else {
      value = -diffYear;
      unit = "year";
    }

    try {
      const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
      const relative = rtf.format(value, unit);

      // Store original text as title for hover tooltip
      const originalText = time.textContent.trim();
      if (!time.hasAttribute("title")) {
        time.setAttribute("title", originalText);
      }
      // aria-label provides the full context: "2 days ago (March 5, 2026)"
      time.setAttribute("aria-label", relative + " (" + originalText + ")");
      time.textContent = relative;
    } catch {
      // Intl.RelativeTimeFormat not supported, keep static text
    }
  }
}

TimeDifference.register();
