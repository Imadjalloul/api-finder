/**
 * scan-reddit.js — Scans Reddit for new API mentions.
 * Uses Reddit's public JSON API (no auth needed).
 * Subreddits: r/webdev, r/programming, r/api, r/javascript, r/node
 */

import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { normalizeAll } from './normalize.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, 'output', 'reddit-raw.json');

const SUBREDDITS = ['webdev', 'programming', 'api', 'javascript', 'node', 'reactjs'];
const API_KEYWORDS = ['free api', 'public api', 'open api', 'rest api', 'api for', 'api directory', 'api list'];
const USER_AGENT = 'APIFinder/1.0 (scraper bot)';

// Rate limiter: Reddit allows ~60 requests/min for non-auth
function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

/**
 * Extract potential API URLs from text
 */
function extractApiUrls(text) {
    if (!text) return [];
    const urlPattern = /https?:\/\/[^\s\)"\]<>]+/g;
    const urls = text.match(urlPattern) || [];

    // Filter to likely API documentation URLs
    return urls.filter(url => {
        const lower = url.toLowerCase();
        // Skip common non-API links
        if (lower.includes('reddit.com')) return false;
        if (lower.includes('imgur.com') && !lower.includes('api')) return false;
        if (lower.includes('youtube.com/watch')) return false;
        if (lower.includes('twitter.com')) return false;
        // Favor links with API-related paths
        return lower.includes('api') ||
            lower.includes('docs') ||
            lower.includes('developer') ||
            lower.includes('swagger') ||
            lower.includes('reference') ||
            lower.includes('.io') ||
            lower.includes('.dev');
    });
}

/**
 * Fetch recent posts from a subreddit matching API keywords
 */
async function scanSubreddit(subreddit) {
    const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=100`;

    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': USER_AGENT }
        });

        if (!res.ok) {
            console.log(`  ⚠️ r/${subreddit}: HTTP ${res.status}`);
            return [];
        }

        const data = await res.json();
        const posts = data?.data?.children || [];
        const found = [];

        for (const post of posts) {
            const { title, selftext, url: postUrl } = post.data;
            const fullText = `${title} ${selftext || ''}`.toLowerCase();

            // Check if post mentions APIs
            const matchesKeyword = API_KEYWORDS.some(kw => fullText.includes(kw));
            if (!matchesKeyword) continue;

            // Extract API URLs from the post
            const apiUrls = extractApiUrls(selftext || '');

            // Also check the post's direct URL if it's not a self-post
            if (postUrl && !postUrl.includes('reddit.com')) {
                apiUrls.push(postUrl);
            }

            for (const apiUrl of apiUrls) {
                // Try to extract a name from the URL
                let name = '';
                try {
                    const u = new URL(apiUrl);
                    name = u.hostname.replace(/^www\./, '').replace(/\.(com|org|io|dev|api|net)$/g, '');
                    name = name.charAt(0).toUpperCase() + name.slice(1);
                } catch {
                    continue;
                }

                found.push({
                    name,
                    description: title.substring(0, 200),
                    url: apiUrl,
                    auth: 'unknown',
                    https: apiUrl.startsWith('https'),
                    cors: 'unknown',
                    source: `reddit/r/${subreddit}`
                });
            }
        }

        return found;
    } catch (err) {
        console.log(`  ⚠️ r/${subreddit}: ${err.message}`);
        return [];
    }
}

async function scanReddit() {
    console.log('🔄 Scanning Reddit for new APIs...');

    const allFound = [];

    for (const sub of SUBREDDITS) {
        console.log(`  Scanning r/${sub}...`);
        const found = await scanSubreddit(sub);
        allFound.push(...found);
        await sleep(2000); // Rate limit: 2s between requests
    }

    console.log(`  Found ${allFound.length} potential API mentions`);

    // Normalize
    const normalized = normalizeAll(allFound);

    // Write output
    mkdirSync(resolve(__dirname, 'output'), { recursive: true });
    writeFileSync(OUTPUT_PATH, JSON.stringify(normalized, null, 2), 'utf-8');
    console.log(`  Written to ${OUTPUT_PATH}`);

    return normalized;
}

// Run if called directly
if (process.argv[1] && process.argv[1].includes('scan-reddit')) {
    scanReddit().catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
}

export { scanReddit };
