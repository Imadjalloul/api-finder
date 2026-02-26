/**
 * normalize.js — Central normalizer for all scraped API entries.
 * Validates, standardizes, and auto-categorizes API entries.
 */

// Category keyword mapping for auto-categorization
const CATEGORY_KEYWORDS = {
    'Weather': ['weather', 'forecast', 'climate', 'temperature', 'meteorolog'],
    'Finance': ['stock', 'forex', 'currency', 'exchange rate', 'crypto', 'market data', 'financial', 'banking', 'payment'],
    'News': ['news', 'article', 'headlines', 'press', 'journalism', 'media coverage'],
    'AI & Machine Learning': ['machine learning', 'artificial intelligence', ' ai ', 'nlp', 'neural', 'deep learning', 'llm', 'gpt', 'language model', 'image recognition', 'computer vision'],
    'Development': ['developer', 'api tool', 'sdk', 'devops', 'ci/cd', 'testing tool', 'code', 'programming', 'repository', 'git'],
    'Animals': ['animal', 'dog', 'cat', 'pet', 'wildlife', 'bird', 'fish', 'species'],
    'Entertainment': ['movie', 'tv show', 'music', 'game', 'anime', 'manga', 'joke', 'comic', 'entertainment', 'film', 'series'],
    'Geocoding': ['geocod', 'geolocation', 'country', 'location', 'latitude', 'longitude', 'address lookup'],
    'Books': ['book', 'library', 'literature', 'publication', 'reading', 'author', 'isbn'],
    'Photography': ['photo', 'image', 'picture', 'stock photo', 'wallpaper', 'placeholder image'],
    'Science': ['science', 'space', 'nasa', 'physics', 'chemistry', 'biology', 'astronomy', 'planet', 'earth', 'research paper'],
    'Food & Drink': ['food', 'recipe', 'meal', 'drink', 'cocktail', 'nutrition', 'restaurant', 'cooking', 'beer', 'wine'],
    'Sports': ['sport', 'football', 'soccer', 'basketball', 'nba', 'nfl', 'cricket', 'tennis', 'baseball', 'f1', 'racing'],
    'Security': ['security', 'malware', 'virus', 'threat', 'vulnerability', 'breach', 'cybersecurity', 'spam', 'phishing'],
    'Text & Language': ['translat', 'dictionary', 'language', 'text analysis', 'nlp', 'sentiment', 'word', 'spelling', 'grammar'],
    'Social': ['social media', 'discord', 'reddit', 'twitter', 'telegram', 'slack', 'chat', 'messaging', 'mastodon'],
    'Utilities': ['qr code', 'url shorten', 'email valid', 'random', 'uuid', 'placeholder', 'utility', 'converter', 'calculator'],
    'Blockchain': ['blockchain', 'ethereum', 'bitcoin', 'web3', 'smart contract', 'defi', 'nft', 'token'],
    'Cloud & Storage': ['cloud', 'storage', 'file hosting', 'upload', 'cdn', 'object storage', 's3'],
    'Productivity': ['productivity', 'task', 'project management', 'calendar', 'scheduling', 'todo', 'note', 'kanban'],
    'Communication': ['email', 'sms', 'voice', 'call', 'notification', 'push', 'whatsapp', 'communication'],
    'E-Commerce': ['ecommerce', 'e-commerce', 'shop', 'product', 'cart', 'checkout', 'store', 'merchant', 'dropship'],
    'Video & Media': ['video', 'youtube', 'streaming', 'gif', 'animation', 'media', 'podcast', 'audio'],
    'Auth & Identity': ['auth', 'identity', 'login', 'oauth', 'sso', 'session', 'user management', 'access control'],
    'Maps & Transport': ['map', 'route', 'direction', 'navigation', 'transit', 'transport', 'gps', 'traffic'],
    'Government & Health': ['government', 'health', 'medical', 'hospital', 'fda', 'census', 'election', 'law', 'regulation'],
    'Testing': ['mock', 'test data', 'fake data', 'placeholder', 'dummy', 'sample data', 'seed data'],
    'Education': ['education', 'learning', 'course', 'university', 'school', 'quiz', 'trivia', 'study'],
    'IoT & Hardware': ['iot', 'sensor', 'device', 'hardware', 'raspberry', 'arduino', 'smart home', 'mqtt'],
    'Data & Analytics': ['analytics', 'dataset', 'open data', 'statistics', 'visualization', 'big data', 'data mining']
};

/**
 * Auto-categorize an API based on its name and description
 */
function categorize(name, description) {
    const text = `${name} ${description}`.toLowerCase();

    let bestMatch = null;
    let bestScore = 0;

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        let score = 0;
        for (const kw of keywords) {
            if (text.includes(kw)) {
                score += kw.length; // longer matches get higher scores
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestMatch = category;
        }
    }

    return bestMatch || 'Other';
}

/**
 * Normalize auth type to our standard values: 'none', 'apiKey', 'OAuth'
 */
function normalizeAuth(auth) {
    if (!auth || auth === '' || auth === 'No') return 'none';
    const lower = (auth + '').toLowerCase().trim();
    if (lower === 'no' || lower === 'none' || lower === '' || lower === 'null') return 'none';
    if (lower.includes('oauth')) return 'OAuth';
    if (lower.includes('apikey') || lower.includes('api key') || lower === 'yes' || lower === 'api_key') return 'apiKey';
    if (lower.includes('key') || lower.includes('token') || lower.includes('x-') || lower.includes('bearer')) return 'apiKey';
    if (lower.includes('user-agent')) return 'none'; // just a header
    return 'apiKey'; // default to apiKey if some auth is specified
}

/**
 * Normalize CORS to our standard values: 'yes', 'no', 'unknown'
 */
function normalizeCors(cors) {
    if (!cors || cors === '') return 'unknown';
    const lower = (cors + '').toLowerCase().trim();
    if (lower === 'yes' || lower === 'true' || lower === '1') return 'yes';
    if (lower === 'no' || lower === 'false' || lower === '0') return 'no';
    return 'unknown';
}

/**
 * Normalize a single API entry into our standard schema
 */
function normalizeEntry(raw) {
    // Validate required fields
    if (!raw.name || !raw.url) return null;

    const name = (raw.name + '').trim();
    const description = (raw.description || '').trim();
    const url = (raw.url || '').trim();

    // Skip entries with no valid URL
    if (!url.startsWith('http')) return null;

    // Skip entries with very short names
    if (name.length < 2) return null;

    const category = raw.category || categorize(name, description);
    const auth = normalizeAuth(raw.auth || raw.Auth);
    const https = raw.https !== undefined ? !!raw.https : url.startsWith('https');
    const cors = normalizeCors(raw.cors || raw.Cors);
    const discovered_at = raw.discovered_at || new Date().toISOString().split('T')[0];

    return {
        name,
        description: description || `${name} API`,
        category,
        auth,
        https,
        cors,
        url,
        discovered_at
    };
}

/**
 * Normalize an array of raw entries
 */
function normalizeAll(rawEntries) {
    const results = [];
    let skipped = 0;

    for (const raw of rawEntries) {
        const normalized = normalizeEntry(raw);
        if (normalized) {
            results.push(normalized);
        } else {
            skipped++;
        }
    }

    console.log(`  Normalized: ${results.length} valid, ${skipped} skipped`);
    return results;
}

export { normalizeEntry, normalizeAll, categorize, normalizeAuth, normalizeCors, CATEGORY_KEYWORDS };
