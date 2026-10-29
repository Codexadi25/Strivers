const Razorpay = require('razorpay');

function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    console.warn('[Razorpay Warning] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not set.');
    return null;
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
}

const instance = getRazorpayInstance();

module.exports = instance;
module.exports.getRazorpayInstance = getRazorpayInstance;
