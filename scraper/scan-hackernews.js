/**
 * scan-hackernews.js — Scans Hacker News for new API mentions.
 * Uses HN Algolia API: https://hn.algolia.com/api
 */

import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { normalizeAll } from './normalize.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, 'output', 'hackernews-raw.json');

const SEARCH_QUERIES = [
    'Show HN: API',
    'free API',
    'public API',
    'open source API',
    'REST API',
];

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

/**
 * Search HN Algolia for API-related posts from the last 24 hours
 */
async function searchHN(query) {
    // Get posts from the last 7 days
    const weekAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&numericFilters=created_at_i>${weekAgo}&hitsPerPage=50`;

    try {
        const res = await fetch(url);
        if (!res.ok) return [];

        const data = await res.json();
        const hits = data.hits || [];
        const found = [];

        for (const hit of hits) {
            const { title, url: hitUrl, story_text } = hit;

            // Skip if no direct URL (self-posts without links)
            if (!hitUrl) continue;

            // Skip non-API links
            const lower = hitUrl.toLowerCase();
            if (lower.includes('youtube.com/watch')) continue;
            if (lower.includes('twitter.com')) continue;

            // Extract name from URL
            let name = '';
            try {
                const u = new URL(hitUrl);
                name = u.hostname.replace(/^www\./, '').split('.')[0];
                name = name.charAt(0).toUpperCase() + name.slice(1);
            } catch {
                continue;
            }

            found.push({
                name,
                description: (title || '').substring(0, 200),
                url: hitUrl,
                auth: 'unknown',
                https: hitUrl.startsWith('https'),
                cors: 'unknown',
                source: 'hackernews'
            });
        }

        return found;
    } catch (err) {
        console.log(`  ⚠️ HN search "${query}": ${err.message}`);
        return [];
    }
}

async function scanHackerNews() {
    console.log('🔄 Scanning Hacker News for new APIs...');

    const allFound = [];
    const seenUrls = new Set();

    for (const query of SEARCH_QUERIES) {
        console.log(`  Searching: "${query}"`);
        const found = await searchHN(query);

        // Deduplicate within this run
        for (const entry of found) {
            const urlKey = entry.url.toLowerCase().replace(/\/$/, '');
            if (!seenUrls.has(urlKey)) {
                seenUrls.add(urlKey);
                allFound.push(entry);
            }
        }

        await sleep(1000); // Rate limit
    }

    console.log(`  Found ${allFound.length} unique potential API links`);

    // Normalize
    const normalized = normalizeAll(allFound);

    // Write output
    mkdirSync(resolve(__dirname, 'output'), { recursive: true });
    writeFileSync(OUTPUT_PATH, JSON.stringify(normalized, null, 2), 'utf-8');
    console.log(`  Written to ${OUTPUT_PATH}`);

    return normalized;
}

// Run if called directly
if (process.argv[1] && process.argv[1].includes('scan-hackernews')) {
    scanHackerNews().catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
}

export { scanHackerNews };
