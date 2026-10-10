const http = require('http');
const jwt = require("jsonwebtoken");
require("dotenv").config();

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
  const tokenStudent = jwt.sign({}, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: "1d", subject: "1" }); // Dhruv's ID
  const tokenAdmin = jwt.sign({}, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: "1d", subject: "2" }); // Het's ID
  
  // 1. Add a book first so we can reserve it
  const bookRes = await request('POST', '/api/admin/books', { title: "Test Book", author: "Test", isbn: "12345" }, tokenAdmin);
  const bookId = bookRes.body.data.id;

  console.log("1. Student creates a book reservation...");
  const reserveRes = await request('POST', '/api/books/reserve', { book_id: bookId, pickup_date: "2026-10-10" }, tokenStudent);
  console.log("Reserve book status:", reserveRes.status, reserveRes.body);

  console.log("2. Admin checks reservations...");
  const adminRes = await request('GET', '/api/admin/reservations', null, tokenAdmin);
  console.log("Admin reservations status:", adminRes.status);
  console.log("Admin reservations:", adminRes.body.data);

})();
