/**
 * run-all.js — Main orchestrator that runs all scrapers,
 * deduplicates results, and updates apis.json.
 *
 * Usage:
 *   node scraper/run-all.js           # Run all scrapers (bulk + daily)
 *   node scraper/run-all.js --daily   # Run only daily scrapers (Reddit, HN)
 *   node scraper/run-all.js --bulk    # Run only bulk scrapers (APIs.guru, public-apis)
 */

import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { fetchApisGuru } from './fetch-apis-guru.js';
import { fetchPublicApis } from './fetch-public-apis.js';
import { scanReddit } from './scan-reddit.js';
import { scanHackerNews } from './scan-hackernews.js';
import { deduplicate, loadExisting, saveApis } from './deduplicate.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const dailyOnly = args.includes('--daily');
const bulkOnly = args.includes('--bulk');

async function main() {
    console.log('═══════════════════════════════════════════');
    console.log('⚡ API Finder — Scraper Pipeline');
    console.log(`  Mode: ${dailyOnly ? 'DAILY' : bulkOnly ? 'BULK' : 'ALL'}`);
    console.log(`  Time: ${new Date().toISOString()}`);
    console.log('═══════════════════════════════════════════\n');

    let allNew = [];

    // ── BULK SCRAPERS ──
    if (!dailyOnly) {
        try {
            console.log('\n📦 [1/4] APIs.guru');
            const guruApis = await fetchApisGuru();
            allNew.push(...guruApis);
        } catch (err) {
            console.error('  ❌ APIs.guru failed:', err.message);
        }

        try {
            console.log('\n📦 [2/4] public-apis GitHub');
            const publicApis = await fetchPublicApis();
            allNew.push(...publicApis);
        } catch (err) {
            console.error('  ❌ public-apis failed:', err.message);
        }
    }

    // ── DAILY SCRAPERS ──
    if (!bulkOnly) {
        try {
            console.log('\n🔍 [3/4] Reddit');
            const redditApis = await scanReddit();
            allNew.push(...redditApis);
        } catch (err) {
            console.error('  ❌ Reddit failed:', err.message);
        }

        try {
            console.log('\n🔍 [4/4] Hacker News');
            const hnApis = await scanHackerNews();
            allNew.push(...hnApis);
        } catch (err) {
            console.error('  ❌ Hacker News failed:', err.message);
        }
    }

    // ── DEDUPLICATE & MERGE ──
    console.log('\n🔀 Deduplicating and merging...');
    const existing = loadExisting();
    const { merged, stats } = deduplicate(existing, allNew);

    // Save
    saveApis(merged);

    // ── REPORT ──
    console.log('\n═══════════════════════════════════════════');
    console.log('📊 FINAL REPORT');
    console.log('═══════════════════════════════════════════');
    console.log(`  Previous total:   ${stats.existing}`);
    console.log(`  Scraped total:    ${stats.incoming}`);
    console.log(`  ✅ New added:     ${stats.added}`);
    console.log(`  ⏭️  Duplicates:    ${stats.duplicates}`);
    console.log(`  📦 New total:     ${stats.total}`);
    console.log('═══════════════════════════════════════════\n');

    // Exit with non-zero if no new APIs found (useful for CI)
    if (stats.added === 0) {
        console.log('ℹ️  No new APIs found this run.');
    } else {
        console.log(`🎉 Added ${stats.added} new APIs!`);
    }

    return stats;
}

main().catch(err => {
    console.error('❌ Pipeline failed:', err);
    process.exit(1);
});
