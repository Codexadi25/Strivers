import React, { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { DRMProtectionWrapper } from '../components/secureViewer/DRMProtectionWrapper';
import { SecureCanvasViewer } from '../components/secureViewer/SecureCanvasViewer';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { loadRazorpay } from '../utils/razorpay';
import './ViewerPage.css';

export const ViewerPage = () => {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(null);
  const [watermark, setWatermark] = useState('');
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [error, setError] = useState(null);
  const [tierProduct, setTierProduct] = useState({ price: 499, title: 'Full-Stack Software Engineering', productId: 'course_fullstack' });

  const fetchProtectedContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [dataRes, coursesRes] = await Promise.allSettled([
        axiosClient.get('/secure/data'),
        axiosClient.get('/courses'),
      ]);

      if (coursesRes.status === 'fulfilled' && Array.isArray(coursesRes.value.data?.courses)) {
        const pro = coursesRes.value.data.courses.find((p) => p.productId === 'course_fullstack') || coursesRes.value.data.courses[0];
        if (pro) setTierProduct(pro);
      }

      if (dataRes.status === 'fulfilled' && dataRes.value.data?.success) {
        setContent(dataRes.value.data.payload);
        setWatermark(dataRes.value.data.watermark);
        setPaymentRequired(false);
      } else if (dataRes.status === 'rejected') {
        const err = dataRes.reason;
        if (err.response && err.response.status === 403 && err.response.data?.paymentRequired) {
          setPaymentRequired(true);
        } else {
          setError(err.response?.data?.message || 'Failed to authenticate data streams.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to authenticate data streams.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProtectedContent();
  }, [fetchProtectedContent]);

  const handleRazorpayCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      await loadRazorpay();

      const planId = tierProduct.productId || 'course_fullstack';
      const amountInPaise = tierProduct.priceInPaise || Math.round((tierProduct.price || 499) * 100);

      const { data: orderData } = await axiosClient.post('/create-order', {
        amount: amountInPaise,
        currency: 'INR',
        planId,
      });

      const orderId = orderData.order_id || orderData.orderId;
      const keyId =
        process.env.REACT_APP_RAZORPAY_KEY_ID ||
        orderData.key_id ||
        orderData.keyId ||
        orderData.key;

      if (!orderId) {
        throw new Error('Order creation failed on server.');
      }

      const options = {
        key: keyId,
        amount: orderData.amount || amountInPaise,
        currency: orderData.currency || 'INR',
        name: 'Strivers',
        description: tierProduct.title || 'Protected Tier Subscription',
        order_id: orderId,
        handler: async (response) => {
          try {
            const verifyRes = await axiosClient.post('/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyRes.data.success) {
              fetchProtectedContent();
            }
          } catch (verificationErr) {
            setError(
              verificationErr.response?.data?.error ||
              verificationErr.response?.data?.message ||
              'Payment verification failed on the server.'
            );
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError('Payment was cancelled by the user.');
          },
        },
        theme: { color: '#2563EB' },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', (response) => {
        setLoading(false);
        setError(response.error?.description || 'Payment failed. Please try again.');
      });
      razorpayInstance.open();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Payment initiation failed.');
    }
  };

  if (loading) {
    return (
      <div className="viewer-page-shell">
        <Header />
        <div className="viewer-skeleton-wrap">
          <SkeletonLoader height="40px" width="50%" />
          <SkeletonLoader height="350px" width="100%" />
        </div>
        <Footer />
      </div>
    );
  }

  if (paymentRequired) {
    return (
      <div className="viewer-page-shell">
        <Header />
        <div className="viewer-paywall-wrap">
          <div className="drm-protected-container viewer-paywall-card">
            <h2>Member Access Required</h2>
            <p className="viewer-paywall-desc">
              This study resource is reserved for enrolled learners. Unlock instant in-app access to continue.
            </p>
            <button onClick={handleRazorpayCheckout} className="viewer-unlock-btn">
              Pay ₹{tierProduct.price || 499} to Unlock
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="viewer-page-shell">
        <Header />
        <div className="viewer-error-wrap">
          <div className="drm-protected-container viewer-error-card">
            <p className="viewer-error-msg">{error}</p>
            <button onClick={fetchProtectedContent} className="viewer-retry-btn">
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="viewer-page-shell">
      <Header />
      <div className="viewer-canvas-wrap">
        <DRMProtectionWrapper>
          <SecureCanvasViewer contentData={content} watermarkText={watermark} />
        </DRMProtectionWrapper>
      </div>
      <Footer />
    </div>
  );
};
