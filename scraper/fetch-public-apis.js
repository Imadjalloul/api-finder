/**
 * fetch-public-apis.js — Fetches APIs from the public-apis GitHub repo.
 * Parses the markdown README to extract ~1,400 API entries.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { normalizeAll } from './normalize.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, 'output', 'public-apis-raw.json');
const README_URL = 'https://raw.githubusercontent.com/public-apis/public-apis/master/README.md';

/**
 * Parse a markdown table row into an API entry
 * Format: | API | Description | Auth | HTTPS | CORS | Link |
 */
function parseTableRow(line, currentCategory) {
    // Split by | and trim
    const cells = line.split('|').map(c => c.trim()).filter(c => c);

    if (cells.length < 5) return null;

    const name = cells[0].replace(/\[([^\]]+)\]\([^)]+\)/, '$1').trim();
    const description = cells[1];

    // Extract auth
    let auth = cells[2] || '';
    if (auth === '`No`' || auth === 'No' || auth === '') auth = 'none';
    else if (auth.includes('OAuth')) auth = 'OAuth';
    else if (auth.includes('apiKey') || auth.includes('`apiKey`')) auth = 'apiKey';
    else if (auth.includes('X-')) auth = 'apiKey';
    else auth = auth.replace(/`/g, '');

    const https = cells[3]?.toLowerCase().includes('yes') ?? true;
    let cors = cells[4]?.toLowerCase().trim() || 'unknown';
    if (cors === 'yes') cors = 'yes';
    else if (cors === 'no') cors = 'no';
    else cors = 'unknown';

    // Extract URL from the API name markdown link or from the Link column
    let url = '';
    const linkMatch = cells[0].match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
        url = linkMatch[2];
    } else if (cells.length > 5) {
        const urlMatch = cells[5].match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (urlMatch) url = urlMatch[2];
    }

    if (!url) return null;

    return {
        name,
        description,
        category: currentCategory,
        auth,
        https,
        cors,
        url
    };
}

async function fetchPublicApis() {
    console.log('🔄 Fetching public-apis GitHub repo...');

    const res = await fetch(README_URL);
    if (!res.ok) throw new Error(`GitHub fetch failed: ${res.status}`);

    const markdown = await res.text();
    const lines = markdown.split('\n');
    const entries = [];
    let currentCategory = 'Other';

    for (const line of lines) {
        // Detect category headers: ### Category Name
        const headerMatch = line.match(/^###\s+(.+)/);
        if (headerMatch) {
            currentCategory = headerMatch[1].trim();
            continue;
        }

        // Skip table headers and separator rows
        if (line.startsWith('|') && !line.includes('---') && !line.toLowerCase().includes('| api |')) {
            const entry = parseTableRow(line, currentCategory);
            if (entry) entries.push(entry);
        }
    }

    console.log(`  Found ${entries.length} raw entries from public-apis`);

    // Normalize all entries
    const normalized = normalizeAll(entries);

    // Write output
    mkdirSync(resolve(__dirname, 'output'), { recursive: true });
    writeFileSync(OUTPUT_PATH, JSON.stringify(normalized, null, 2), 'utf-8');
    console.log(`  Written to ${OUTPUT_PATH}`);

    return normalized;
}

// Run if called directly
if (process.argv[1] && process.argv[1].includes('fetch-public-apis')) {
    fetchPublicApis().catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
}

export { fetchPublicApis };
