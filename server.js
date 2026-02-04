const http = require('http');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const PORT = 3000;

// Google Sheet config
const SHEET_ID = '1S-kMA5o6hxUvOe1r4KOGu4T50cyRgF8-nfBknDV2Ht8';
const CREDS_PATH = '/Users/johnny/.openclaw/credentials/google-docs-service-account.json';

// Cache
let tuningCache = null;
let lastFetch = 0;
const CACHE_MS = 2000;

// Auth setup
let sheetsApi = null;
async function getSheets() {
  if (sheetsApi) return sheetsApi;
  
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDS_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });
  sheetsApi = google.sheets({ version: 'v4', auth });
  return sheetsApi;
}

// Fetch tuning from sheet
async function fetchTuningFromSheet() {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "'Tuning Sheet'!A:D"
  });
  
  const rows = res.data.values || [];
  const tuning = {};
  
  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const section = row[0]?.trim();
    const param = row[1]?.trim();
    const value = row[2]?.trim();
    
    if (!section || !param || value === undefined || value === '') continue;
    
    if (!tuning[section]) tuning[section] = {};
    tuning[section][param] = parseFloat(value);
  }
  
  return tuning;
}

// Get tuning (cached)
async function getTuning() {
  const now = Date.now();
  if (tuningCache && (now - lastFetch) < CACHE_MS) {
    return tuningCache;
  }
  
  try {
    tuningCache = await fetchTuningFromSheet();
    lastFetch = now;
    console.log('📊 Tuning fetched from Google Sheet');
    return tuningCache;
  } catch (e) {
    console.error('Sheet fetch failed:', e.message);
    if (tuningCache) return tuningCache;
    // Fallback to local file
    try {
      return JSON.parse(fs.readFileSync(path.join(__dirname, 'tuning.json'), 'utf8'));
    } catch {
      return {};
    }
  }
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const urlPath = req.url.split('?')[0];
  
  // Serve tuning from Google Sheet
  if (req.method === 'GET' && urlPath === '/tuning.json') {
    try {
      const tuning = await getTuning();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(tuning, null, 2));
    } catch (e) {
      console.error('Tuning error:', e);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end('{"error":"Failed to fetch tuning"}');
    }
    return;
  }
  
  // Console logging from browser
  if (req.method === 'POST' && urlPath === '/console') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { level, args } = JSON.parse(body);
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[BROWSER ${level.toUpperCase()}] ${timestamp}:`, ...args);
      } catch (e) {}
      res.writeHead(200);
      res.end();
    });
    return;
  }
  
  // Screenshot capture from browser
  if (req.method === 'POST' && urlPath === '/screenshot') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { image } = JSON.parse(body);
        // image is base64 data URL
        const base64Data = image.replace(/^data:image\/png;base64,/, '');
        const filename = `screenshot-${Date.now()}.png`;
        const filepath = path.join(__dirname, filename);
        fs.writeFileSync(filepath, base64Data, 'base64');
        console.log(`📸 Screenshot saved: ${filename}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, filename }));
      } catch (e) {
        console.error('Screenshot error:', e);
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Static file serving
  const cleanUrl = req.url.split('?')[0];
  let filePath = path.join(__dirname, cleanUrl === '/' ? 'index.html' : cleanUrl);

  const realPath = path.resolve(filePath);
  if (!realPath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    let contentType = 'text/plain';
    if (filePath.endsWith('.html')) contentType = 'text/html';
    else if (filePath.endsWith('.js')) contentType = 'application/javascript';
    else if (filePath.endsWith('.css')) contentType = 'text/css';
    else if (filePath.endsWith('.json')) contentType = 'application/json';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎮 Brawler Proto running at http://localhost:${PORT}`);
  console.log(`📊 Tuning from: https://docs.google.com/spreadsheets/d/${SHEET_ID}`);
  console.log(`Edit sheet → refresh game → values update`);
});
