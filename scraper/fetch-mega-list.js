/**
 * fetch-mega-list.js — Fetches APIs from cporter202/API-mega-list
 * Parses markdown tables in each category subdirectory.
 * Source: https://github.com/cporter202/API-mega-list (~10,498 APIs)
 */

import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { normalizeAll } from './normalize.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, 'output', 'mega-list-raw.json');

// Category directories from the repo README
const CATEGORIES = [
    { dir: 'agents-apis-697', name: 'AI & Machine Learning' },
    { dir: 'ai-apis-1208', name: 'AI & Machine Learning' },
    { dir: 'automation-apis-4825', name: 'Utilities' },
    { dir: 'business-apis-2', name: 'Finance' },
    { dir: 'developer-tools-apis-2652', name: 'Development' },
    { dir: 'ecommerce-apis-2440', name: 'E-Commerce' },
    { dir: 'integrations-apis-890', name: 'Productivity' },
    { dir: 'jobs-apis-848', name: 'Data & Analytics' },
    { dir: 'lead-generation-apis-3452', name: 'Data & Analytics' },
    { dir: 'marketing-apis-1068', name: 'Social' },
    { dir: 'news-and-media-apis-2', name: 'News' },
    { dir: 'real-estate-apis-2', name: 'Data & Analytics' },
    { dir: 'scraping-and-crawling-apis-4', name: 'Development' },
    { dir: 'search-apis-4', name: 'Utilities' },
    { dir: 'seo-apis-7', name: 'Development' },
    { dir: 'social-media-apis-1932', name: 'Social' },
    { dir: 'travel-and-hospitality-apis-2', name: 'Maps & Transport' },
    { dir: 'web-data-apis-4', name: 'Data & Analytics' },
];

const BASE_URL = 'https://raw.githubusercontent.com/cporter202/API-mega-list/main';

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

/**
 * Parse a markdown table row: | [Name](URL) | Description |
 */
function parseRow(line, category) {
    // Split by |
    const cells = line.split('|').map(c => c.trim()).filter(c => c);
    if (cells.length < 2) return null;

    // First cell should have [Name](URL) pattern
    const linkMatch = cells[0].match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (!linkMatch) return null;

    const name = linkMatch[1].trim();
    let url = linkMatch[2].trim();

    // Clean up affiliate tracking params
    url = url.replace(/[?&]fpr=[^&]+/g, '').replace(/\?$/, '');

    const description = (cells[1] || '').trim();

    // Skip if too short or looks like a header
    if (name.length < 2) return null;
    if (name.toLowerCase() === 'name' || name.toLowerCase() === 'api') return null;

    return {
        name,
        description: description.substring(0, 200) || `${name} API`,
        url,
        category,
        auth: 'unknown',
        https: url.startsWith('https'),
        cors: 'unknown',
    };
}

async function fetchCategory(cat) {
    const url = `${BASE_URL}/${cat.dir}/README.md`;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.log(`  ⚠️ ${cat.dir}: HTTP ${res.status}`);
            return [];
        }

        const markdown = await res.text();
        const lines = markdown.split('\n');
        const entries = [];

        for (const line of lines) {
            if (line.startsWith('|') && !line.includes('---') && !line.toLowerCase().includes('| name')) {
                const entry = parseRow(line, cat.name);
                if (entry) entries.push(entry);
            }
        }

        console.log(`  ✅ ${cat.dir}: ${entries.length} APIs`);
        return entries;
    } catch (err) {
        console.log(`  ⚠️ ${cat.dir}: ${err.message}`);
        return [];
    }
}

async function fetchMegaList() {
    console.log('🔄 Fetching API-mega-list from GitHub...');
    console.log(`  Processing ${CATEGORIES.length} categories...\n`);

    const allEntries = [];

    for (const cat of CATEGORIES) {
        const entries = await fetchCategory(cat);
        allEntries.push(...entries);
        await sleep(500); // be nice to GitHub
    }

    console.log(`\n  Total raw entries: ${allEntries.length}`);

    // Normalize all entries
    const normalized = normalizeAll(allEntries);

    // Write output
    mkdirSync(resolve(__dirname, 'output'), { recursive: true });
    writeFileSync(OUTPUT_PATH, JSON.stringify(normalized, null, 2), 'utf-8');
    console.log(`  Written to ${OUTPUT_PATH}`);

    return normalized;
}

// Run if called directly
if (process.argv[1] && process.argv[1].includes('fetch-mega-list')) {
    fetchMegaList().catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
}

export { fetchMegaList };
