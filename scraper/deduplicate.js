/**
 * deduplicate.js — Merges new API entries with existing dataset,
 * removing duplicates by URL domain and name similarity.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APIS_PATH = resolve(__dirname, '..', 'src', 'data', 'apis.json');

/**
 * Extract the domain from a URL for comparison
 */
function getDomain(url) {
    try {
        const u = new URL(url);
        return u.hostname.replace(/^www\./, '').toLowerCase();
    } catch {
        return url.toLowerCase();
    }
}

/**
 * Normalize a name for fuzzy comparison
 */
function normName(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Deduplicate a list of new entries against the existing dataset.
 * Returns { merged, stats }
 */
function deduplicate(existingApis, newApis) {
    // Build lookup sets from existing data
    const existingDomains = new Set(existingApis.map(a => getDomain(a.url)));
    const existingNames = new Set(existingApis.map(a => normName(a.name)));
    const existingUrls = new Set(existingApis.map(a => a.url.toLowerCase().replace(/\/$/, '')));

    const added = [];
    let duplicateCount = 0;

    for (const api of newApis) {
        const domain = getDomain(api.url);
        const name = normName(api.name);
        const urlNorm = api.url.toLowerCase().replace(/\/$/, '');

        // Check for duplicates by exact URL, domain, or name
        if (existingUrls.has(urlNorm)) {
            duplicateCount++;
            continue;
        }

        if (existingDomains.has(domain) && existingNames.has(name)) {
            duplicateCount++;
            continue;
        }

        // Not a duplicate — add it
        added.push(api);
        existingDomains.add(domain);
        existingNames.add(name);
        existingUrls.add(urlNorm);
    }

    const merged = [...existingApis, ...added];

    // Sort by category, then name
    merged.sort((a, b) => {
        const catCmp = a.category.localeCompare(b.category);
        if (catCmp !== 0) return catCmp;
        return a.name.localeCompare(b.name);
    });

    return {
        merged,
        stats: {
            existing: existingApis.length,
            incoming: newApis.length,
            added: added.length,
            duplicates: duplicateCount,
            total: merged.length
        }
    };
}

/**
 * Load existing apis.json
 */
function loadExisting() {
    try {
        const data = readFileSync(APIS_PATH, 'utf-8');
        return JSON.parse(data);
    } catch {
        console.log('  No existing apis.json found, starting fresh');
        return [];
    }
}

/**
 * Save merged apis.json
 */
function saveApis(apis) {
    writeFileSync(APIS_PATH, JSON.stringify(apis, null, 4), 'utf-8');
}

/**
 * Main: merge new entries from stdin or a file into apis.json
 */
async function mergeFromFile(newApisPath) {
    const existing = loadExisting();
    const newData = JSON.parse(readFileSync(newApisPath, 'utf-8'));

    const { merged, stats } = deduplicate(existing, newData);

    saveApis(merged);

    console.log('\n📊 Deduplication Results:');
    console.log(`  Existing entries: ${stats.existing}`);
    console.log(`  Incoming entries: ${stats.incoming}`);
    console.log(`  New entries added: ${stats.added}`);
    console.log(`  Duplicates skipped: ${stats.duplicates}`);
    console.log(`  Total entries now: ${stats.total}`);

    return stats;
}

export { deduplicate, loadExisting, saveApis, mergeFromFile, getDomain, normName };
