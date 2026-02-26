/**
 * fetch-apis-guru.js — Fetches all APIs from the APIs.guru directory.
 * Source: https://api.apis.guru/v2/list.json (~2,500 APIs)
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { normalizeAll } from './normalize.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, 'output', 'apis-guru-raw.json');
const API_URL = 'https://api.apis.guru/v2/list.json';

async function fetchApisGuru() {
    console.log('🔄 Fetching APIs.guru directory...');

    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`APIs.guru fetch failed: ${res.status}`);

    const data = await res.json();
    const entries = [];

    for (const [providerKey, provider] of Object.entries(data)) {
        // Each provider can have multiple API versions; use the preferred one
        const versions = provider.versions || {};
        const preferredVersion = provider.preferred || Object.keys(versions).pop();
        const apiInfo = versions[preferredVersion];

        if (!apiInfo || !apiInfo.info) continue;

        const info = apiInfo.info;
        const name = info.title || providerKey;
        const description = (info.description || '').replace(/(<([^>]+)>)/gi, '').substring(0, 200).trim();
        const url = info['x-origin']?.[0]?.url
            || apiInfo.swaggerUrl
            || apiInfo.link
            || info.contact?.url
            || `https://${providerKey}`;

        // Determine auth type from security definitions
        let auth = 'none';
        const securityDefs = apiInfo.securityDefinitions || apiInfo.components?.securitySchemes || {};
        if (Object.keys(securityDefs).length > 0) {
            const types = Object.values(securityDefs).map(s => s.type?.toLowerCase() || '');
            if (types.some(t => t.includes('oauth'))) {
                auth = 'OAuth';
            } else if (types.some(t => t.includes('apikey') || t.includes('api_key') || t === 'apikey')) {
                auth = 'apiKey';
            } else {
                auth = 'apiKey'; // some form of auth exists
            }
        }

        entries.push({
            name,
            description: description || `${name} API`,
            url,
            auth,
            https: url.startsWith('https'),
            cors: 'unknown', // APIs.guru doesn't track CORS
            category: info['x-apisguru-categories']?.[0] || ''
        });
    }

    console.log(`  Found ${entries.length} raw entries from APIs.guru`);

    // Normalize all entries
    const normalized = normalizeAll(entries);

    // Write output
    const { mkdirSync } = await import('fs');
    mkdirSync(resolve(__dirname, 'output'), { recursive: true });
    writeFileSync(OUTPUT_PATH, JSON.stringify(normalized, null, 2), 'utf-8');
    console.log(`  Written to ${OUTPUT_PATH}`);

    return normalized;
}

// Run if called directly
if (process.argv[1] && process.argv[1].includes('fetch-apis-guru')) {
    fetchApisGuru().catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
}

export { fetchApisGuru };
