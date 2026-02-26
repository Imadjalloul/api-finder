# ⚡ API Finder

**Discover 1,500+ free APIs across 20+ categories. Search, filter, build.**

[![Deploy to GitHub Pages](https://github.com/Imadjalloul/api-finder/actions/workflows/deploy.yml/badge.svg)](https://github.com/Imadjalloul/api-finder/actions/workflows/deploy.yml)

🔗 **[Try it live →](https://imadjalloul.github.io/api-finder/)**

---

## Features

- 🔍 **Instant search** — filter by name, description, or category
- 🏷️ **Category filters** — 20+ categories (AI, Finance, Weather, etc.)
- 🔐 **Auth type filter** — None, API Key, OAuth
- 🌐 **CORS filter** — find frontend-friendly APIs
- 📋 **Detail modal** — full API info with direct links
- ♾️ **Infinite scroll** — load 60 at a time, smooth pagination
- 📱 **Responsive** — works on mobile and desktop

## Data Sources

API data is automatically scraped daily from:
- [public-apis](https://github.com/public-apis/public-apis)
- [APIs.guru](https://apis.guru)
- Reddit API discussions
- HackerNews threads

## Tech Stack

- **React 19** + **Vite 7**
- **TypeScript** (config) + **JSX** (components)
- Vanilla CSS (dark theme, glassmorphism)
- GitHub Actions (daily scrape + auto-deploy)

## Getting Started

```bash
git clone https://github.com/Imadjalloul/api-finder.git
cd api-finder
npm install
npm run dev
```

## Project Structure

```
├── src/
│   ├── App.jsx              # Main app with search/filter/grid
│   ├── components/
│   │   ├── SearchBar.jsx    # Search input
│   │   ├── FilterPanel.jsx  # Category/Auth/CORS filters
│   │   ├── APICard.jsx      # API card in grid
│   │   └── DetailModal.jsx  # Expanded API details
│   ├── data/
│   │   └── apis.json        # 1,500+ APIs dataset
│   └── index.css            # Design system
├── scraper/                 # Auto-scraping scripts
│   ├── run-all.js
│   ├── fetch-public-apis.js
│   ├── fetch-apis-guru.js
│   ├── scan-reddit.js
│   ├── scan-hackernews.js
│   ├── normalize.js
│   └── deduplicate.js
└── .github/workflows/
    ├── deploy.yml           # Auto-deploy to Pages
    └── daily-scrape.yml     # Daily data refresh
```

## License

MIT

---

Built for developers who need the right API, fast. ⚡
