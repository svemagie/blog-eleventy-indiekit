/**
 * Save for Later — shared frontend module
 * Handles save button clicks on blogroll, podroll, listening, and news pages.
 * Only active when user is logged in (body[data-indiekit-auth="true"]).
 */
(function () {
  function isLoggedIn() {
    return document.body.getAttribute('data-indiekit-auth') === 'true';
  }

  async function saveForLater(button) {
    var url = button.dataset.saveUrl;
    var title = button.dataset.saveTitle || url;
    var source = button.dataset.saveSource || 'manual';
    if (!url) return;

    button.disabled = true;

    try {
      var response = await fetch('/readlater/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url, title: title, source: source }),
        credentials: 'same-origin'
      });

      if (response.ok) {
        button.classList.add('save-later--saved');
        button.title = 'Saved';
        button.setAttribute('aria-label', 'Saved');
        var label = button.querySelector('.save-later-label');
        if (label) label.textContent = 'Saved';
        var icon = button.querySelector('.save-later-icon');
        if (icon) icon.textContent = '🔖';
      } else {
        button.disabled = false;
      }
    } catch (e) {
      button.disabled = false;
    }
  }

  document.addEventListener('click', function (e) {
    if (!isLoggedIn()) return;
    var button = e.target.closest('.save-later-btn');
    if (button) {
      e.preventDefault();
      saveForLater(button);
    }
  });
})();
