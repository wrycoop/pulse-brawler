const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
    // CORS headers for all requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Handle POST to save tuning.json (strip query params)
    const urlPath = req.url.split('?')[0];
    
    // Remote console logging
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
    
    if (req.method === 'POST' && urlPath === '/tuning.json') {
        console.log('POST /tuning.json received');
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                // Validate JSON
                JSON.parse(body);
                fs.writeFileSync(path.join(__dirname, 'tuning.json'), body);
                console.log('tuning.json saved successfully');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end('{"ok":true}');
            } catch (e) {
                console.log('tuning.json save failed:', e.message);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end('{"error":"Invalid JSON"}');
            }
        });
        return;
    }

    // Strip query params for file serving
    const cleanUrl = req.url.split('?')[0];
    let filePath = path.join(__dirname, cleanUrl === '/' ? 'index.html' : cleanUrl);

    // Security: prevent directory traversal
    const realPath = path.resolve(filePath);
    if (!realPath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    // Serve file
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404);
            res.end('Not Found');
            return;
        }

        // Set content type
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
    console.log(`Open this URL in a browser and connect a PS4/PS5 controller.`);
});
