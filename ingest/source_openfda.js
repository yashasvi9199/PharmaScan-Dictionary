// ingest/source_openfda.js
// Minimal OpenFDA ingest script (no external deps).
// Node >=14 should work. Fetches paginated /drug/label entries and writes data/ingest_openfda.json

const https = require('https');
const fs = require('fs');
const path = require('path');

const OUT_PATH = path.join(__dirname, '..', 'data', 'ingest_openfda.json');
const LIMIT = 100; // openFDA max per request
const MAX_PAGES = 50; // safety cap to avoid runaway fetches (adjust as needed)
const USER_AGENT = 'PharmaScan-OpenFDA-Ingest/1.0 (+https://github.com/yashasvi9199/PharmaScan-Dictionary)';

function buildUrl(skip = 0) {
  // We request a few useful fields to reduce payload
  // fields param is optional; if it causes issues, remove it.
  const fields = [
    'openfda.brand_name',
    'openfda.generic_name',
    'openfda.substance_name',
    'openfda.manufacturer_name',
    'id',
    'set_id'
  ];
  return `/drug/label.json?limit=${LIMIT}&skip=${skip}&fields=${fields.join(',')}`;
}

function fetchJson(pathname) {
  const opts = {
    hostname: 'api.fda.gov',
    port: 443,
    path: pathname,
    method: 'GET',
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(opts, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => raw += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const json = JSON.parse(raw);
            resolve(json);
          } catch (err) {
            reject(new Error('Failed to parse JSON: ' + err.message));
          }
        } else if (res.statusCode === 404) {
          resolve(null);
        } else {
          reject(new Error(`OpenFDA HTTP ${res.statusCode}: ${raw.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function slugify(input) {
  if (!input || typeof input !== 'string') return '';
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeRecord(raw) {
  const openfda = raw.openfda || {};
  const brands = openfda.brand_name || [];
  const generics = openfda.generic_name || [];
  const substances = openfda.substance_name || [];
  const manufacturers = openfda.manufacturer_name || [];

  // prefer generic -> brand -> substance for canonical name
  const canonical =
    (generics[0]) ||
    (brands[0]) ||
    (substances[0]) ||
    raw.id ||
    raw.set_id ||
    '';

  return {
    id: raw.id || raw.set_id || null,
    canonical_name: canonical,
    brands: brands,
    generics: generics,
    substances: substances,
    manufacturers: manufacturers,
    slug: slugify(canonical),
    source: 'openfda'
  };
}

async function run() {
  console.log('Starting OpenFDA ingest...');
  const out = [];
  let skip = 0;
  let page = 0;

  while (page < MAX_PAGES) {
    const url = buildUrl(skip);
    console.log(`fetching skip=${skip} (page ${page + 1})`);
    let json;
    try {
      json = await fetchJson(url);
    } catch (err) {
      console.error('Fetch error:', err.message);
      break;
    }
    if (!json || !json.results || json.results.length === 0) {
      console.log('No more results or empty response; stopping.');
      break;
    }

    for (const r of json.results) {
      const norm = normalizeRecord(r);
      // simple dedupe guard: skip completely empty canonical names
      if (norm.canonical_name) out.push(norm);
    }

    // prepare next page
    skip += LIMIT;
    page += 1;

    // small polite pause to avoid tight loop (not rate-limit safe, but helps)
    await new Promise((res) => setTimeout(res, 200));
  }

  // write output
  try {
    fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
    fs.writeFileSync(OUT_PATH, JSON.stringify({ generated_at: new Date().toISOString(), count: out.length, records: out }, null, 2), 'utf8');
    console.log(`Wrote ${out.length} records to ${OUT_PATH}`);
  } catch (err) {
    console.error('Failed to write output:', err.message);
    process.exitCode = 2;
  }
}

if (require.main === module) {
  run().catch((err) => {
    console.error('Fatal:', err);
    process.exit(1);
  });
}

module.exports = { run, normalizeRecord, slugify };
