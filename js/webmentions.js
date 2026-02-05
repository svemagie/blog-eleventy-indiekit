/**
 * Client-side webmention fetcher
 * Supplements build-time cached webmentions with real-time data from proxy API
 */

(function () {
  const container = document.querySelector('[data-webmentions]');
  if (!container) return;

  const target = container.dataset.target;
  const domain = container.dataset.domain;
  const buildTime = parseInt(container.dataset.buildtime, 10) || 0;

  if (!target || !domain) return;

  // Rate limit: only fetch once per page load
  const cacheKey = `wm-fetched-${target}`;
  if (sessionStorage.getItem(cacheKey)) return;
  sessionStorage.setItem(cacheKey, '1');

  // Use server-side proxy to keep webmention.io token secure
  // Fetch both with and without trailing slash since webmention.io
  // stores targets inconsistently (Bridgy sends different formats)
  const targetWithSlash = target.endsWith('/') ? target : target + '/';
  const targetWithoutSlash = target.endsWith('/') ? target.slice(0, -1) : target;
  const apiUrl1 = `/webmentions-api/api/mentions?target=${encodeURIComponent(targetWithSlash)}&per-page=100`;
  const apiUrl2 = `/webmentions-api/api/mentions?target=${encodeURIComponent(targetWithoutSlash)}&per-page=100`;

  // Check if build-time webmentions section exists
  const hasBuildTimeSection = document.getElementById('webmentions') !== null;

  Promise.all([
    fetch(apiUrl1).then((res) => res.json()).catch(() => ({ children: [] })),
    fetch(apiUrl2).then((res) => res.json()).catch(() => ({ children: [] })),
  ])
    .then(([data1, data2]) => {
      // Merge and deduplicate by wm-id
      const seen = new Set();
      const allChildren = [];
      for (const wm of [...(data1.children || []), ...(data2.children || [])]) {
        if (!seen.has(wm['wm-id'])) {
          seen.add(wm['wm-id']);
          allChildren.push(wm);
        }
      }
      const data = { children: allChildren };
      if (!data.children || !data.children.length) return;

      let mentionsToShow;
      if (hasBuildTimeSection) {
        // Build-time section exists - only show NEW webmentions to avoid duplicates
        mentionsToShow = data.children.filter((wm) => {
          const wmTime = new Date(wm['wm-received']).getTime();
          return wmTime > buildTime;
        });
      } else {
        // No build-time section - show ALL webmentions from API
        mentionsToShow = data.children;
      }

      if (!mentionsToShow.length) return;

      // Group by type
      const likes = mentionsToShow.filter((m) => m['wm-property'] === 'like-of');
      const reposts = mentionsToShow.filter((m) => m['wm-property'] === 'repost-of');
      const replies = mentionsToShow.filter((m) => m['wm-property'] === 'in-reply-to');
      const mentions = mentionsToShow.filter((m) => m['wm-property'] === 'mention-of');

      // Append new likes
      if (likes.length) {
        appendAvatars('.webmention-likes .avatar-row', likes, 'likes');
        updateCount('.webmention-likes h3', likes.length);
      }

      // Append new reposts
      if (reposts.length) {
        appendAvatars('.webmention-reposts .avatar-row', reposts, 'reposts');
        updateCount('.webmention-reposts h3', reposts.length);
      }

      // Append new replies
      if (replies.length) {
        appendReplies('.webmention-replies ul', replies);
        updateCount('.webmention-replies h3', replies.length);
      }

      // Append new mentions
      if (mentions.length) {
        appendMentions('.webmention-mentions ul', mentions);
        updateCount('.webmention-mentions h3', mentions.length);
      }

      // Update total count in main header
      updateTotalCount(mentionsToShow.length);
    })
    .catch((err) => {
      console.debug('[Webmentions] Error fetching:', err.message);
    });

  function appendAvatars(selector, items, type) {
    let row = document.querySelector(selector);

    // Create section if it doesn't exist
    if (!row) {
      const section = createAvatarSection(type);
      let webmentionsSection = document.getElementById('webmentions');
      if (!webmentionsSection) {
        createWebmentionsSection();
        webmentionsSection = document.getElementById('webmentions');
      }
      if (webmentionsSection) {
        webmentionsSection.appendChild(section);
        row = section.querySelector('.avatar-row');
      }
    }

    if (!row) return;

    items.forEach((item) => {
      const author = item.author || {};

      const link = document.createElement('a');
      link.href = author.url || '#';
      link.className = 'inline-block';
      link.title = author.name || 'Anonymous';
      link.target = '_blank';
      link.rel = 'noopener';
      link.dataset.new = 'true';

      const img = document.createElement('img');
      img.src = author.photo || '/images/default-avatar.svg';
      img.alt = author.name || 'Anonymous';
      img.className = 'w-8 h-8 rounded-full ring-2 ring-primary-500';
      img.loading = 'lazy';

      link.appendChild(img);
      row.appendChild(link);
    });
  }

  function appendReplies(selector, items) {
    let list = document.querySelector(selector);

    // Create section if it doesn't exist
    if (!list) {
      const section = createReplySection();
      let webmentionsSection = document.getElementById('webmentions');
      if (!webmentionsSection) {
        createWebmentionsSection();
        webmentionsSection = document.getElementById('webmentions');
      }
      if (webmentionsSection) {
        webmentionsSection.appendChild(section);
        list = section.querySelector('ul');
      }
    }

    if (!list) return;

    items.forEach((item) => {
      const author = item.author || {};
      const content = item.content || {};
      const published = item.published || item['wm-received'];

      const li = document.createElement('li');
      li.className = 'p-4 bg-surface-100 dark:bg-surface-800 rounded-lg ring-2 ring-primary-500';
      li.dataset.new = 'true';

      // Build reply card using DOM methods
      const wrapper = document.createElement('div');
      wrapper.className = 'flex gap-3';

      // Avatar link
      const avatarLink = document.createElement('a');
      avatarLink.href = author.url || '#';
      avatarLink.target = '_blank';
      avatarLink.rel = 'noopener';

      const avatarImg = document.createElement('img');
      avatarImg.src = author.photo || '/images/default-avatar.svg';
      avatarImg.alt = author.name || 'Anonymous';
      avatarImg.className = 'w-10 h-10 rounded-full';
      avatarImg.loading = 'lazy';
      avatarLink.appendChild(avatarImg);

      // Content area
      const contentDiv = document.createElement('div');
      contentDiv.className = 'flex-1 min-w-0';

      // Header row
      const headerDiv = document.createElement('div');
      headerDiv.className = 'flex items-baseline gap-2 mb-1';

      const authorLink = document.createElement('a');
      authorLink.href = author.url || '#';
      authorLink.className = 'font-semibold text-surface-900 dark:text-surface-100 hover:underline';
      authorLink.target = '_blank';
      authorLink.rel = 'noopener';
      authorLink.textContent = author.name || 'Anonymous';

      const dateLink = document.createElement('a');
      dateLink.href = item.url || '#';
      dateLink.className = 'text-xs text-surface-500 hover:underline';
      dateLink.target = '_blank';
      dateLink.rel = 'noopener';

      const timeEl = document.createElement('time');
      timeEl.dateTime = published;
      timeEl.textContent = formatDate(published);
      dateLink.appendChild(timeEl);

      const newBadge = document.createElement('span');
      newBadge.className = 'text-xs text-primary-600 dark:text-primary-400 font-medium';
      newBadge.textContent = 'NEW';

      headerDiv.appendChild(authorLink);
      headerDiv.appendChild(dateLink);
      headerDiv.appendChild(newBadge);

      // Reply content - use textContent for safety
      const replyDiv = document.createElement('div');
      replyDiv.className = 'text-surface-700 dark:text-surface-300 prose dark:prose-invert prose-sm max-w-none';
      replyDiv.textContent = content.text || '';

      contentDiv.appendChild(headerDiv);
      contentDiv.appendChild(replyDiv);

      wrapper.appendChild(avatarLink);
      wrapper.appendChild(contentDiv);
      li.appendChild(wrapper);

      // Prepend to show newest first
      list.insertBefore(li, list.firstChild);
    });
  }

  function appendMentions(selector, items) {
    let list = document.querySelector(selector);

    if (!list) {
      const section = createMentionSection();
      let webmentionsSection = document.getElementById('webmentions');
      if (!webmentionsSection) {
        createWebmentionsSection();
        webmentionsSection = document.getElementById('webmentions');
      }
      if (webmentionsSection) {
        webmentionsSection.appendChild(section);
        list = section.querySelector('ul');
      }
    }

    if (!list) return;

    items.forEach((item) => {
      const author = item.author || {};
      const published = item.published || item['wm-received'];

      const li = document.createElement('li');
      li.dataset.new = 'true';

      const link = document.createElement('a');
      link.href = item.url || '#';
      link.className = 'text-primary-600 dark:text-primary-400 hover:underline';
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = `${author.name || 'Someone'} mentioned this on ${formatDate(published)}`;

      const badge = document.createElement('span');
      badge.className = 'text-xs text-primary-600 dark:text-primary-400 font-medium ml-1';
      badge.textContent = 'NEW';

      li.appendChild(link);
      li.appendChild(badge);

      list.insertBefore(li, list.firstChild);
    });
  }

  function updateCount(selector, additionalCount) {
    const header = document.querySelector(selector);
    if (!header) return;

    const text = header.textContent;
    const match = text.match(/(\d+)/);
    if (match) {
      const currentCount = parseInt(match[1], 10);
      const newCount = currentCount + additionalCount;
      header.textContent = text.replace(/\d+/, newCount);
    }
  }

  function updateTotalCount(additionalCount) {
    const header = document.querySelector('#webmentions h2');
    if (!header) return;

    const text = header.textContent;
    const match = text.match(/\((\d+)\)/);
    if (match) {
      const currentCount = parseInt(match[1], 10);
      const newCount = currentCount + additionalCount;
      header.textContent = text.replace(/\(\d+\)/, `(${newCount})`);
    }
  }

  function createAvatarSection(type) {
    const section = document.createElement('div');
    section.className = `webmention-${type} mb-6`;

    const header = document.createElement('h3');
    header.className = 'text-sm font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-wide mb-3';
    header.textContent = `0 ${type === 'likes' ? 'Likes' : 'Reposts'}`;

    const row = document.createElement('div');
    row.className = 'avatar-row';

    section.appendChild(header);
    section.appendChild(row);

    return section;
  }

  function createReplySection() {
    const section = document.createElement('div');
    section.className = 'webmention-replies';

    const header = document.createElement('h3');
    header.className = 'text-sm font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-wide mb-4';
    header.textContent = '0 Replies';

    const list = document.createElement('ul');
    list.className = 'space-y-4';

    section.appendChild(header);
    section.appendChild(list);

    return section;
  }

  function createMentionSection() {
    const section = document.createElement('div');
    section.className = 'webmention-mentions mt-6';

    const header = document.createElement('h3');
    header.className = 'text-sm font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-wide mb-3';
    header.textContent = '0 Mentions';

    const list = document.createElement('ul');
    list.className = 'space-y-2 text-sm';

    section.appendChild(header);
    section.appendChild(list);

    return section;
  }

  function createWebmentionsSection() {
    const webmentionForm = document.querySelector('.webmention-form');
    if (!webmentionForm) return;

    const section = document.createElement('section');
    section.className = 'webmentions mt-8 pt-8 border-t border-surface-200 dark:border-surface-700';
    section.id = 'webmentions';

    const header = document.createElement('h2');
    header.className = 'text-xl font-bold text-surface-900 dark:text-surface-100 mb-6';
    header.textContent = 'Webmentions (0)';

    section.appendChild(header);
    webmentionForm.parentNode.insertBefore(section, webmentionForm);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
})();
