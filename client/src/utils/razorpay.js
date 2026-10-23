let loading;

export function loadRazorpay() {
  if (typeof window !== 'undefined' && window.Razorpay) {
    return Promise.resolve();
  }
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve();
      s.onerror = () => {
        loading = null;
        reject(new Error('Could not load Razorpay. Check your internet connection.'));
      };
      document.body.appendChild(s);
    });
  }
  return loading;
}
