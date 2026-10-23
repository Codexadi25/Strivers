const Razorpay = require('razorpay');

let razorpayInstance = null;
const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_mock123456789';
const keySecret = process.env.RAZORPAY_KEY_SECRET || 'mockSecret123456789';

try {
  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
} catch (error) {
  console.warn(`[Razorpay Warning] Initialized fallback instance: ${error.message}`);
}

module.exports = razorpayInstance;