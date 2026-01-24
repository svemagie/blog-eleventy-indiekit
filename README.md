# Indiekit Eleventy Theme

A modern, responsive Eleventy theme designed for [Indiekit](https://getindiekit.com/)-powered IndieWeb blogs.

## Features

- **IndieWeb Ready**: Full h-card, h-entry, h-feed microformats support
- **Dark Mode**: Automatic dark/light mode with manual toggle
- **Responsive**: Mobile-first design with Tailwind CSS
- **Social Integration**:
  - Bluesky and Mastodon feeds in sidebar
  - GitHub activity page
  - Funkwhale listening history
  - YouTube channel display
- **Performance**: Optimized images, lazy loading, prefetching
- **Accessible**: Semantic HTML, proper ARIA labels

## Usage

This theme is designed to be used as a git submodule in an Indiekit deployment:

```bash
git submodule add https://github.com/rmdes/indiekit-eleventy-theme.git eleventy-site
```

## Configuration

The theme uses environment variables for configuration. See the data files in `_data/` for required variables:

- `SITE_NAME`, `SITE_URL`, `SITE_DESCRIPTION`
- `AUTHOR_NAME`, `AUTHOR_BIO`, `AUTHOR_AVATAR`
- `GITHUB_USERNAME`, `BLUESKY_HANDLE`, `MASTODON_INSTANCE`
- And more...

## Directory Structure

```
├── _data/           # Eleventy data files (site config, API fetchers)
├── _includes/       # Layouts and components
├── css/             # Tailwind CSS source
├── images/          # Static images
├── *.njk            # Page templates
├── eleventy.config.js
└── package.json
```

## Development

```bash
npm install
npm run dev
```

## License

MIT
