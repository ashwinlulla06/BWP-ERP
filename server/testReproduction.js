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
  console.log("1. Login as Student (dhruv@unireserve.edu / student123)...");
  const loginStudentRes = await request('POST', '/api/auth/login', { email: 'dhruv@unireserve.edu', password: 'password123' });
  console.log("Student login status:", loginStudentRes.status);
  
  if (!loginStudentRes.body.data) {
    // try default password
    const loginStudentRes2 = await request('POST', '/api/auth/login', { email: 'dhruv@unireserve.edu', password: 'password' });
    console.log("Student login status 2:", loginStudentRes2.status);
  }
  
})();
