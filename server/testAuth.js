const http = require('http');

function request(method, path, data, token) {
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
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

(async () => {
  // Test Faculty (now Admin) login
  // Note: we don't know Het's password, but wait, do we? The user said "do not hardcode passwords". I'll just check if the role is admin in the DB.
  // Actually, I can't test login if I don't know the password. I will test by bypassing login and directly querying the database or mocking a token.
  
  const jwt = require("jsonwebtoken");
  require("dotenv").config();
  const token = jwt.sign({}, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: "1d", subject: "2" }); // Het's ID
  
  console.log("Token for User 2:", token);
  const adminRes = await request('GET', '/api/admin/reservations', null, token);
  console.log("Admin API (User 2, admin):", adminRes.status);
  
  const tokenStudent = jwt.sign({}, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: "1d", subject: "1" }); // Dhruv's ID
  const studentRes = await request('GET', '/api/admin/reservations', null, tokenStudent);
  console.log("Admin API (User 1, student):", studentRes.status);
})();
