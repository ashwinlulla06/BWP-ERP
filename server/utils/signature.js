const crypto = require('crypto');

const secret = process.env.SIGNATURE_SECRET || "default_signature_secret_please_change_this";

function generateSignature(bookingData) {
  // Format the data consistently before hashing
  const payload = JSON.stringify(bookingData);
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  return hmac.digest('hex');
}

function verifySignature(bookingData, signature) {
  if (!signature) return false;
  const expectedSignature = generateSignature(bookingData);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

module.exports = {
  generateSignature,
  verifySignature
};
