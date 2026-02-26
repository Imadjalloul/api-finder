# ⚡ API Finder

A searchable directory of **8,800+ free APIs** across 20+ categories — with instant search, smart filters, and detailed API cards.

![License](https://img.shields.io/github/license/imadjalloul/api-finder)
[![Deploy to GitHub Pages](https://github.com/Imadjalloul/api-finder/actions/workflows/deploy.yml/badge.svg)](https://github.com/Imadjalloul/api-finder/actions/workflows/deploy.yml)

🔗 **[Try it live →](https://imadjalloul.github.io/api-finder/)**

---

## Features

- **🔍 Instant search** — Search by name, description, or category
- **🏷️ Category filters** — 20+ categories (AI, Finance, Weather, Games, etc.)
- **🔐 Auth type filter** — None, API Key, OAuth
- **🌐 CORS filter** — Find frontend-friendly APIs instantly
- **📋 Detail modal** — Full API info with direct documentation links
- **♾️ Lazy loading** — Loads 60 at a time for smooth scrolling
- **🎨 Dark theme** — Premium glassmorphism design

## How It Works

1. **Open the app** — Browse all 8,800+ APIs in a responsive card grid
2. **Search** — Type to instantly filter by name, description, or category
3. **Filter** — Narrow results by category, auth type, or CORS support
4. **Click any card** — View full details, docs link, and auth requirements

## Data Sources

API data is automatically scraped daily from multiple sources:

| Source | Description |
|---|---|
| [public-apis](https://github.com/public-apis/public-apis) | Community-maintained list of free APIs |
| [APIs.guru](https://apis.guru) | Machine-readable API directory |
| Reddit | API discussions from developer subreddits |
| HackerNews | API mentions in Show HN and comments |

> **Note:** The dataset is auto-updated daily via GitHub Actions.

## Tech Stack

- **React 19** — UI components
- **Vite 7** — Fast dev & builds
- **Vanilla CSS** — Premium dark theme, no framework needed
- **GitHub Actions** — Daily scraping + auto-deploy

## Getting Started

```bash
# Clone the repo
git clone https://github.com/Imadjalloul/api-finder.git
cd api-finder

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
├── index.html               # Entry point
├── src/
│   ├── App.jsx              # Main app — search, filter, grid
│   ├── components/
│   │   ├── SearchBar.jsx    # Search input with live count
│   │   ├── FilterPanel.jsx  # Category / Auth / CORS filters
│   │   ├── APICard.jsx      # Individual API card
│   │   └── DetailModal.jsx  # Expanded API details overlay
│   ├── data/
│   │   └── apis.json        # 8,800+ APIs dataset
│   └── index.css            # Full design system
├── scraper/                 # Auto-scraping scripts
│   ├── run-all.js           # Orchestrator
│   ├── fetch-public-apis.js
│   ├── fetch-apis-guru.js
│   ├── scan-reddit.js
│   ├── scan-hackernews.js
│   ├── normalize.js         # Schema normalizer
│   └── deduplicate.js       # Deduplication logic
└── .github/workflows/
    ├── deploy.yml           # GitHub Pages auto-deploy
    └── daily-scrape.yml     # Daily data refresh
```

## Support

If you find this useful, consider giving it a ⭐ on GitHub!

☕ [Buy Me a Coffee](https://ko-fi.com/imadjalloul)

## License

[MIT](./LICENSE)

---

Built for developers who need the right API, fast. ⚡
