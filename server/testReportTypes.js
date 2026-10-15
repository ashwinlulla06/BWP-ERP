const http = require('http');
const jwt = require("jsonwebtoken");
require("dotenv").config();

function request(path, token) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
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
  
  const types = ["All Bookings", "Equipment Usage", "Library Checkout"];
  for (const type of types) {
    const res = await request(`/api/admin/reports?from=2026-09-01&to=2026-10-30&type=${encodeURIComponent(type)}`, tokenAdmin);
    console.log(`Report [${type}] status:`, res.status);
    if (res.status === 200) {
      console.log(`Success, HTML length: ${res.body.data.html.length}`);
    } else {
      console.log(`Error:`, res.body);
    }
  }
})();
