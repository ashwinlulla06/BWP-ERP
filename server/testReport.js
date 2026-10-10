const http = require('http');
const jwt = require("jsonwebtoken");
require("dotenv").config();

function request(method, path, token) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(body) }); }
        catch (e) { resolve({ status: res.statusCode, body }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

(async () => {
  const tokenAdmin = jwt.sign({}, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: "1d", subject: "2" });
  const res = await request('GET', '/api/admin/reports?from=2026-09-01&to=2026-10-30&type=All+Bookings', tokenAdmin);
  console.log("Report status:", res.status);
  console.log("Report body:", res.body);
})();
