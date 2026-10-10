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
  const tokenStudent = jwt.sign({}, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: "1d", subject: "1" });
  const tokenAdmin = jwt.sign({}, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: "1d", subject: "2" });
  
  console.log("1. Admin adds equipment...");
  const eqRes = await request('POST', '/api/admin/equipment', { name: "Test Eq", category: "Test", total_qty: 5 }, tokenAdmin);
  const eqId = eqRes.body?.data?.id || 1;

  console.log("2. Student creates an equipment booking...");
  const date = "2026-10-15";
  const reserveRes = await request('POST', '/api/equipment/book', { equipment_id: eqId, date, time_slot: "10:00-11:00" }, tokenStudent);
  console.log("Reserve equipment status:", reserveRes.status, reserveRes.body);

  console.log("3. Admin checks reservations...");
  const adminRes = await request('GET', '/api/admin/reservations', null, tokenAdmin);
  console.log("Admin reservations status:", adminRes.status);
  
  if (adminRes.body && adminRes.body.data) {
    const reservation = adminRes.body.data.find(r => r.resource === "Test Eq");
    if (reservation) {
      console.log("Found reservation!", reservation);
    } else {
      console.log("Reservation NOT FOUND in admin endpoint!", adminRes.body.data);
    }
  } else {
    console.log("Error getting admin reservations:", adminRes.body);
  }
})();
