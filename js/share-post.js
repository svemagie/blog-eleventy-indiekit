/**
 * Share Post — frontend module
 * Opens the Indiekit post creation form in a popup window.
 * Provides a dropdown menu with post type choices.
 * Only active when user is logged in (body[data-indiekit-auth="true"]).
 */
(function () {
  var POST_TYPES = [
    { value: 'note', label: 'Note' },
    { value: 'bookmark', label: 'Bookmark' },
    { value: 'reply', label: 'Reply' },
    { value: 'like', label: 'Like' },
    { value: 'repost', label: 'Repost' },
    { value: 'article', label: 'Article' }
  ];

  function isLoggedIn() {
    return document.body.getAttribute('data-indiekit-auth') === 'true';
  }

  function openPostPopup(type, url, title) {
    var createUrl = '/posts/create'
      + '?type=' + encodeURIComponent(type)
      + '&url=' + encodeURIComponent(url)
      + '&name=' + encodeURIComponent(title);

    window.open(
      createUrl,
      'PostCreator',
      'resizable,scrollbars,status=0,toolbar=0,menubar=0,titlebar=0,width=620,height=780,location=0'
    );
  }

  function createDropdown(button) {
    if (button.querySelector('.post-type-dropdown')) return;

    var url = button.dataset.shareUrl;
    var title = button.dataset.shareTitle || '';

    var dropdown = document.createElement('div');
    dropdown.className = 'post-type-dropdown';

    POST_TYPES.forEach(function (pt) {
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'post-type-dropdown-item';
      item.textContent = pt.label;
      item.addEventListener('click', function (e) {
        e.stopPropagation();
        openPostPopup(pt.value, url, title);
        closeAllDropdowns();
      });
      dropdown.appendChild(item);
    });

    button.style.position = 'relative';
    button.appendChild(dropdown);
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.post-type-dropdown.open').forEach(function (d) {
      d.classList.remove('open');
    });
  }

  document.addEventListener('click', function (e) {
    if (!isLoggedIn()) return;

    var button = e.target.closest('.share-post-btn');
    if (button) {
      e.preventDefault();
      e.stopPropagation();
      createDropdown(button);
      var dropdown = button.querySelector('.post-type-dropdown');
      var wasOpen = dropdown.classList.contains('open');
      closeAllDropdowns();
      if (!wasOpen) {
        dropdown.classList.add('open');
      }
      return;
    }

    // Click outside closes dropdowns
    closeAllDropdowns();
  });
})();
