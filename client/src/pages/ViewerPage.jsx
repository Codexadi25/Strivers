import React, { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { DRMProtectionWrapper } from '../components/secureViewer/DRMProtectionWrapper';
import { SecureCanvasViewer } from '../components/secureViewer/SecureCanvasViewer';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import Navbar from '../components/common/Navbar';
import '../assets/styles/secureViewer.css';


export const ViewerPage = () => {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(null);
  const [watermark, setWatermark] = useState('');
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [error, setError] = useState(null);

  const fetchProtectedContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosClient.get('/secure/data');
      if (res.data.success) {
        setContent(res.data.payload);
        setWatermark(res.data.watermark);
        setPaymentRequired(false);
      }
    } catch (err) {
      if (err.response && err.response.status === 403 && err.response.data.paymentRequired) {
        setPaymentRequired(true);
      } else {
        setError(err.response?.data?.message || 'Failed to authenticate data streams.');
      }
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
      // 1. Create Order on Backend
      const { data: orderData } = await axiosClient.post('/payments/create-order', {
        amount: 499, // Amount in INR
        planId: 'plan_pro_access',
      });

      // 2. Open Razorpay Modal or simulate locally if in dev mode
      if (orderData.isSimulated || !window.Razorpay || orderData.key.includes('mock') || orderData.key.includes('XXXX')) {
        const verifyRes = await axiosClient.post('/payments/verify-payment', {
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: `pay_dev_${Date.now()}`,
          razorpay_signature: 'simulated_sig',
        });

        if (verifyRes.data.success) {
          fetchProtectedContent();
        }
        return;
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Secure Enterprise Access',
        description: '30-Day Protected Tier Subscription',
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            // 3. Verify Razorpay Signature on Server
            const verifyRes = await axiosClient.post('/payments/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              fetchProtectedContent();
            }
          } catch (verificationErr) {
            setError('Payment verification failed on the server.');
          }
        },
        theme: { color: '#00f2fe' },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment initiation failed.');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ maxWidth: '850px', margin: '40px auto', padding: '0 20px', width: '100%' }}>
          <SkeletonLoader height="40px" width="50%" />
          <SkeletonLoader height="350px" width="100%" />
        </div>
      </div>
    );
  }

  if (paymentRequired) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ maxWidth: '600px', margin: '60px auto', width: '100%', padding: '0 20px' }}>
          <div className="drm-protected-container" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <h2>Premium Access Required</h2>
            <p style={{ color: '#94a3b8', margin: '12px 0 24px' }}>
              This document is protected under dynamic DRM. Unlock access via Razorpay.
            </p>
            <button
              onClick={handleRazorpayCheckout}
              style={{
                padding: '12px 28px',
                backgroundColor: '#00f2fe',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Pay ₹499 to Unlock
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ maxWidth: '600px', margin: '40px auto', width: '100%', padding: '0 20px' }}>
          <div className="drm-protected-container" style={{ padding: '40px' }}>
            <p style={{ color: 'var(--danger)' }}>{error}</p>
            <button onClick={fetchProtectedContent} style={{ marginTop: '12px' }}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', width: '100%' }}>
        <DRMProtectionWrapper>
          <SecureCanvasViewer contentData={content} watermarkText={watermark} />
        </DRMProtectionWrapper>
      </div>
    </div>
  );
};