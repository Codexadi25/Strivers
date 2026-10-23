import React, { useMemo, useState } from 'react';
import {
  Box,
  Stack,
  IconButton,
  Button,
  Tooltip,
  Typography,
  Paper,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ShareIcon from '@mui/icons-material/Share';
import { BRAND, adTemplates, nextSessionLabel } from '../../config/strivers';

export default function ShareAds({ price = 21, early = false }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedInstagram, setCopiedInstagram] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Get active course link
  const courseUrl = useMemo(() => {
    if (typeof window !== 'undefined' && window.location.origin) {
      return window.location.origin;
    }
    return BRAND.siteUrl || 'https://strivers.in';
  }, []);

  // Pre-formatted viral captions
  const ads = useMemo(
    () => adTemplates({ price, url: courseUrl, session: nextSessionLabel(), early }),
    [price, courseUrl, early]
  );

  const defaultShareText = useMemo(() => {
    return ads[0]?.text || `Check out the Strivers Placement Masterclass for ₹${price}!\n${courseUrl}`;
  }, [ads, price, courseUrl]);

  // Social URLs
  const encodedText = encodeURIComponent(defaultShareText);
  const encodedUrl = encodeURIComponent(courseUrl);

  const shareUrls = {
    whatsapp: `https://wa.me/?text=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    instagramText: defaultShareText,
  };

  const copyToClipboard = async (text, type) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }

      if (type === 'link') {
        setCopiedLink(true);
        setSnackbar({
          open: true,
          message: '✓ Course link copied to clipboard!',
          severity: 'success',
        });
        setTimeout(() => setCopiedLink(false), 2200);
      } else if (type === 'instagram') {
        setCopiedInstagram(true);
        setSnackbar({
          open: true,
          message: '✓ High-converting Instagram caption copied! Ready to paste in your story or DM.',
          severity: 'success',
        });
        setTimeout(() => setCopiedInstagram(false), 2200);
      }
    } catch {
      setSnackbar({
        open: true,
        message: 'Unable to copy to clipboard.',
        severity: 'error',
      });
    }
  };

  const handleShareClick = (platform) => {
    if (platform === 'instagram') {
      copyToClipboard(shareUrls.instagramText, 'instagram');
      // Optionally open Instagram in new tab
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 760, mx: 'auto', mt: 2 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 3.5,
          border: '1.5px solid #E2E8F0',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
          boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.06)',
        }}
      >
        {/* Header / Subtitle */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB',
            }}
          >
            <ShareIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0E1B3D', lineHeight: 1.2 }}>
              Quick Share with Friends
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.85rem' }}>
              Tap any logo to share directly or copy the course link with one click
            </Typography>
          </Box>
        </Stack>

        {/* Material UI Share Buttons Row */}
        <Stack
          direction="row"
          spacing={{ xs: 1.5, sm: 2 }}
          alignItems="center"
          justifyContent="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ py: 1.5 }}
        >
          {/* 1. WhatsApp Button */}
          <Tooltip title="Share on WhatsApp" arrow>
            <IconButton
              aria-label="Share on WhatsApp"
              onClick={() => handleShareClick('whatsapp')}
              sx={{
                width: { xs: 52, sm: 58 },
                height: { xs: 52, sm: 58 },
                bgcolor: '#25D366',
                color: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: '#1EBE5D',
                  transform: 'translateY(-2px) scale(1.05)',
                  boxShadow: '0 6px 18px rgba(37, 211, 102, 0.45)',
                },
              }}
            >
              <WhatsAppIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
            </IconButton>
          </Tooltip>

          {/* 2. Instagram Button */}
          <Tooltip title={copiedInstagram ? 'Caption Copied!' : 'Copy Caption & Share to Instagram'} arrow>
            <IconButton
              aria-label="Share on Instagram"
              onClick={() => handleShareClick('instagram')}
              sx={{
                width: { xs: 52, sm: 58 },
                height: { xs: 52, sm: 58 },
                background: copiedInstagram
                  ? '#16A34A'
                  : 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                color: '#FFFFFF',
                boxShadow: copiedInstagram
                  ? '0 4px 14px rgba(22, 163, 74, 0.35)'
                  : '0 4px 14px rgba(220, 39, 67, 0.35)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  opacity: 0.92,
                  transform: 'translateY(-2px) scale(1.05)',
                  boxShadow: '0 6px 18px rgba(220, 39, 67, 0.45)',
                },
              }}
            >
              {copiedInstagram ? (
                <CheckIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
              ) : (
                <InstagramIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
              )}
            </IconButton>
          </Tooltip>

          {/* 3. Facebook Button */}
          <Tooltip title="Share on Facebook" arrow>
            <IconButton
              aria-label="Share on Facebook"
              onClick={() => handleShareClick('facebook')}
              sx={{
                width: { xs: 52, sm: 58 },
                height: { xs: 52, sm: 58 },
                bgcolor: '#1877F2',
                color: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(24, 119, 242, 0.35)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: '#0C63D4',
                  transform: 'translateY(-2px) scale(1.05)',
                  boxShadow: '0 6px 18px rgba(24, 119, 242, 0.45)',
                },
              }}
            >
              <FacebookIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
            </IconButton>
          </Tooltip>

          {/* 4. Twitter / X Button */}
          <Tooltip title="Share on Twitter (X)" arrow>
            <IconButton
              aria-label="Share on Twitter"
              onClick={() => handleShareClick('twitter')}
              sx={{
                width: { xs: 52, sm: 58 },
                height: { xs: 52, sm: 58 },
                bgcolor: '#0F172A',
                color: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.35)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: '#1E293B',
                  transform: 'translateY(-2px) scale(1.05)',
                  boxShadow: '0 6px 18px rgba(15, 23, 42, 0.45)',
                },
              }}
            >
              <TwitterIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
            </IconButton>
          </Tooltip>

          {/* 5. Direct Link Icon Button */}
          <Tooltip title={copiedLink ? 'Copied!' : 'Copy Course Link'} arrow>
            <IconButton
              aria-label="Copy course link"
              onClick={() => copyToClipboard(courseUrl, 'link')}
              sx={{
                width: { xs: 52, sm: 58 },
                height: { xs: 52, sm: 58 },
                bgcolor: copiedLink ? '#16A34A' : '#2563EB',
                color: '#FFFFFF',
                boxShadow: copiedLink
                  ? '0 4px 14px rgba(22, 163, 74, 0.35)'
                  : '0 4px 14px rgba(37, 99, 235, 0.35)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: copiedLink ? '#15803D' : '#1D4ED8',
                  transform: 'translateY(-2px) scale(1.05)',
                  boxShadow: '0 6px 18px rgba(37, 99, 235, 0.45)',
                },
              }}
            >
              {copiedLink ? (
                <CheckIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
              ) : (
                <LinkIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
              )}
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Link to the course input bar */}
        <Box sx={{ mt: 2.5 }}>
          <TextField
            fullWidth
            size="small"
            value={courseUrl}
            readOnly
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon sx={{ color: '#64748B', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={copiedLink ? <CheckIcon /> : <ContentCopyIcon />}
                    onClick={() => copyToClipboard(courseUrl, 'link')}
                    sx={{
                      bgcolor: copiedLink ? '#16A34A' : '#2563EB',
                      color: '#FFFFFF',
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: 2,
                      px: 2,
                      py: 0.6,
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: copiedLink ? '#15803D' : '#1D4ED8',
                        boxShadow: 'none',
                      },
                    }}
                  >
                    {copiedLink ? 'Copied' : 'Copy Link'}
                  </Button>
                </InputAdornment>
              ),
              sx: {
                bgcolor: '#FFFFFF',
                borderRadius: 2.5,
                fontSize: '0.9rem',
                fontFamily: 'monospace',
                pr: 0.75,
                '& fieldset': {
                  borderColor: '#CBD5E1',
                },
                '&:hover fieldset': {
                  borderColor: '#94A3B8',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#2563EB',
                },
              },
            }}
          />
        </Box>

        {/* Quick info chip */}
        <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
          <Chip
            size="small"
            label="✓ Verified placement session link · Direct 1-tap invite"
            sx={{
              bgcolor: '#EFF6FF',
              color: '#1E40AF',
              fontSize: '0.78rem',
              fontWeight: 600,
              border: '1px solid #BFDBFE',
            }}
          />
        </Stack>
      </Paper>

      {/* Snackbar feedback notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2, fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
