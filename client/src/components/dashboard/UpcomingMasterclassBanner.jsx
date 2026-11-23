import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  Stack,
  Avatar,
  Alert,
} from '@mui/material';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

// Helper to parse time string like "11:00 AM", "01:30 PM", etc.
function parseTime(timeStr) {
  if (!timeStr) return { hours: 11, minutes: 0 };
  const match = String(timeStr).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return { hours: 11, minutes: 0 };
  let [, h, m, meridiem] = match;
  let hours = parseInt(h, 10);
  const minutes = parseInt(m, 10);
  if (meridiem) {
    if (meridiem.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (meridiem.toUpperCase() === 'AM' && hours === 12) hours = 0;
  }
  return { hours, minutes };
}

// Helper to parse date string + time string into a Date object
function parseDateTime(dateStr, timeStr) {
  if (!dateStr) return null;
  // Strip day of week prefix and bracketed remarks, e.g. "Sunday, 22 Nov 2026 - 11:00 AM IST (Aditya & Lead Mentors)"
  let cleanDate = String(dateStr)
    .replace(/^[A-Za-z]+,\s*/, '')
    .replace(/\s*\(.*\)/, '')
    .replace(/\s*-\s*.*$/, '')
    .trim();

  const time = parseTime(timeStr);
  const d = new Date(cleanDate);
  if (!isNaN(d.getTime())) {
    d.setHours(time.hours, time.minutes, 0, 0);
    return d;
  }
  return null;
}

export default function UpcomingMasterclassBanner({
  masterclass,
  isEnrolled = false,
  user = null,
  onNavigateToNotes,
  onUnlock,
}) {
  const [now, setNow] = useState(() => new Date());
  const [copiedLink, setCopiedLink] = useState(false);

  // Update clock every second for live countdown precision
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute timing info, status, countdown, and active slot
  const scheduleInfo = useMemo(() => {
    if (!masterclass) {
      return { status: 'empty', message: 'No recent masterclass anouncements for now.' };
    }

    // 1. Explicitly marked status
    if (masterclass.sessionStatus === 'ended' || masterclass.sessionStatus === 'completed') {
      const endSlot = masterclass.timingSlots?.[0];
      const endTime = endSlot?.endTime || '01:00 PM';
      return {
        status: 'ended',
        endTime,
        message: `The Session was already over at ${endTime} you may Download Notes and Shared Resources below. T&C Applied.`,
      };
    }

    if (masterclass.sessionStatus === 'live') {
      return { status: 'live', masterclass };
    }

    const slots = Array.isArray(masterclass.timingSlots) ? masterclass.timingSlots : [];

    let targetStart = null;
    let chosenSlot = null;
    let lastPastSlot = null;

    if (masterclass.targetCountdown) {
      const cd = new Date(masterclass.targetCountdown);
      if (!isNaN(cd.getTime())) targetStart = cd;
    }

    for (const slot of slots) {
      if (slot.active === false) continue;
      const dateStr = slot.date || slot.dateTime;
      const startStr = slot.startTime || '11:00 AM';
      const endStr = slot.endTime || '01:00 PM';

      const pStart = parseDateTime(dateStr, startStr);
      const pEnd = parseDateTime(dateStr, endStr);

      if (pStart && pEnd) {
        if (now >= pStart && now <= pEnd) {
          return { status: 'live', slot, masterclass };
        }
        if (pStart > now) {
          if (!targetStart || pStart < targetStart) {
            targetStart = pStart;
            chosenSlot = slot;
          }
        } else if (now > pEnd) {
          lastPastSlot = slot;
        }
      }
    }

    // Try parsing sessionDate if no slot was in future
    if (!targetStart && masterclass.sessionDate) {
      const pSession = parseDateTime(masterclass.sessionDate, '11:00 AM');
      if (pSession && pSession > now) {
        targetStart = pSession;
      }
    }

    // If future session found -> UPCOMING with countdown
    if (targetStart && targetStart > now) {
      const diffMs = targetStart.getTime() - now.getTime();
      const totalSecs = Math.max(0, Math.floor(diffMs / 1000));
      const hours = Math.floor(totalSecs / 3600);
      const minutes = Math.floor((totalSecs % 3600) / 60);
      const seconds = totalSecs % 60;
      const days = Math.floor(hours / 24);
      const displayHours = days > 0 ? hours % 24 : hours;

      return {
        status: 'upcoming',
        targetDate: targetStart,
        days,
        hours: displayHours,
        totalHours: hours,
        minutes,
        seconds,
        slot: chosenSlot,
        masterclass,
      };
    }

    // If all slots are in past -> ENDED
    const pastEndTime = lastPastSlot?.endTime || masterclass.timingSlots?.[0]?.endTime || '01:00 PM';
    return {
      status: 'ended',
      endTime: pastEndTime,
      message: `The Session was already over at ${pastEndTime} you may Download Notes and Shared Resources below. T&C Applied.`,
    };
  }, [masterclass, now]);

  const meetingUrl =
    masterclass?.activeMeetingLink ||
    masterclass?.meetingLink ||
    'https://meet.google.com/strivers-placement-live';

  const handleCopyLink = useCallback(() => {
    if (!isEnrolled) {
      if (onUnlock) onUnlock();
      else alert(`🔒 Enrollment required to unlock your live meeting credentials.`);
      return;
    }
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(meetingUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } else {
      alert(`Meeting Link: ${meetingUrl}`);
    }
  }, [isEnrolled, meetingUrl, onUnlock]);

  // Mentors list (with clean fallbacks)
  const mentors = useMemo(() => {
    if (masterclass?.mentors && masterclass.mentors.length > 0) {
      return masterclass.mentors;
    }
    return [
      {
        name: 'Aditya Sahu',
        role: 'Ex Startek: Zomato Executive & Ex Tech. Mahindra: Flipkart L1 CRM',
      },
      {
        name: 'Aishwarya Bhatia',
        role: 'Ex American Express Executive, Ex Startek: Zomato/Blinkit Team Lead',
      },
    ];
  }, [masterclass]);

  // =========================================================================
  // CASE 1: No masterclass announcements available
  // =========================================================================
  if (scheduleInfo.status === 'empty') {
    return (
      <Alert
        severity="info"
        icon={<InfoOutlinedIcon fontSize="small" />}
        sx={{
          borderRadius: 2.5,
          py: 1,
          px: 2,
          mb: 2,
          fontSize: '0.9rem',
          fontWeight: 600,
          background: 'rgba(239, 246, 255, 0.95)',
          border: '1px solid #BFDBFE',
          color: '#1E3A8A',
        }}
      >
        No recent masterclass anouncements for now.
      </Alert>
    );
  }

  // =========================================================================
  // CASE 2: Masterclass session is ALREADY OVER
  // =========================================================================
  if (scheduleInfo.status === 'ended') {
    return (
      <Card
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: '#F8FAFC',
          borderRadius: 3,
          p: { xs: 1.75, sm: 2.25 },
          mb: 2,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 18px rgba(15, 23, 42, 0.25)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
              <Chip
                size="small"
                label="SESSION CONCLUDED"
                sx={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#FCD34D',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  height: 22,
                }}
              />
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                {masterclass.title || 'Strivers Placement Masterclass'}
              </Typography>
            </Stack>

            <Typography
              variant="body2"
              sx={{
                color: '#E2E8F0',
                fontSize: { xs: '0.88rem', sm: '0.94rem' },
                lineHeight: 1.5,
                fontWeight: 500,
              }}
            >
              The Session was already over at {scheduleInfo.endTime} you may Download Notes and Shared Resources below. T&amp;C Applied.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.25} sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}>
            {onNavigateToNotes && (
              <Button
                variant="contained"
                size="small"
                startIcon={<DownloadOutlinedIcon sx={{ fontSize: 18 }} />}
                onClick={onNavigateToNotes}
                sx={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  color: '#FFFFFF',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  py: 0.8,
                  px: 2,
                  borderRadius: 2,
                  boxShadow: '0 2px 10px rgba(37, 99, 235, 0.35)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
                  },
                }}
              >
                Download Notes &amp; Resources
              </Button>
            )}

            {masterclass.whatsappGroupLink && (
              <Button
                variant="outlined"
                size="small"
                component="a"
                href={masterclass.whatsappGroupLink}
                target="_blank"
                rel="noreferrer"
                startIcon={<WhatsAppIcon sx={{ fontSize: 18, color: '#25D366' }} />}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.18)',
                  color: '#F8FAFC',
                  textTransform: 'none',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  py: 0.8,
                  px: 1.75,
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: '#25D366',
                    background: 'rgba(37, 211, 102, 0.08)',
                  },
                }}
              >
                WhatsApp Updates
              </Button>
            )}
          </Stack>
        </Stack>
      </Card>
    );
  }

  // =========================================================================
  // CASE 3 & 4: Masterclass is LIVE NOW or UPCOMING
  // =========================================================================
  const isLive = scheduleInfo.status === 'live';

  return (
    <Card
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #0B132B 0%, #1C2541 100%)',
        color: '#F8FAFC',
        borderRadius: 3,
        p: { xs: 2, sm: 2.5 },
        mb: 2.5,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 24px rgba(11, 19, 43, 0.35)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Badge & Schedule Tag */}
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
          mb: 1.5,
        }}
      >
        <Chip
          size="small"
          icon={
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: isLive ? '#EF4444' : isEnrolled ? '#10B981' : '#F59E0B',
                boxShadow: isLive ? '0 0 8px #EF4444' : 'none',
              }}
            />
          }
          label={
            isLive
              ? '🔴 LIVE CLASS RUNNING NOW'
              : isEnrolled
              ? '⚡ YOUR ENROLLED BATCH • LIVE ROOM ACCESS'
              : '🔒 UPCOMING MASTERCLASS • ENROLLMENT OPEN'
          }
          sx={{
            background: isLive
              ? 'rgba(239, 68, 68, 0.16)'
              : isEnrolled
              ? 'rgba(16, 185, 129, 0.16)'
              : 'rgba(245, 158, 11, 0.16)',
            color: isLive ? '#FCA5A5' : isEnrolled ? '#6EE7B7' : '#FCD34D',
            border: `1px solid ${
              isLive
                ? 'rgba(239, 68, 68, 0.35)'
                : isEnrolled
                ? 'rgba(16, 185, 129, 0.35)'
                : 'rgba(245, 158, 11, 0.35)'
            }`,
            fontWeight: 800,
            fontSize: '0.72rem',
            height: 24,
            px: 0.5,
          }}
        />

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <CalendarMonthOutlinedIcon sx={{ fontSize: 16, color: '#38BDF8' }} />
          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
            {masterclass.sessionDate || 'Sunday, 11:00 AM IST'}
          </Typography>
        </Stack>
      </Stack>

      {/* Title & Short Description - Compact & Clean */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 800,
          fontFamily: 'var(--display)',
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
          lineHeight: 1.25,
          color: '#FFFFFF',
          mb: 0.75,
        }}
      >
        {masterclass.title || 'Strivers Placement Masterclass'}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: '#94A3B8',
          fontSize: '0.86rem',
          lineHeight: 1.45,
          maxWidth: 680,
          mb: 2,
        }}
      >
        {masterclass.description ||
          'Live interactive weekend workshop with unicorn mentors. ATS resume blueprints, portfolio hosting, cold emails, and interview unit economics.'}
      </Typography>

      {/* Countdown Timer (Compact MUI Box Grid) - Only when Upcoming */}
      {!isLive && (
        <Stack direction="row" spacing={1.25} sx={{ mb: 2, flexWrap: 'wrap' }}>
          {scheduleInfo.days > 0 && (
            <Box
              sx={{
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: 2,
                px: 1.75,
                py: 0.75,
                textAlign: 'center',
                minWidth: 54,
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Typography sx={{ fontFamily: 'var(--mono)', fontSize: '1.15rem', fontWeight: 800, color: '#38BDF8' }}>
                {String(scheduleInfo.days).padStart(2, '0')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.68rem', display: 'block' }}>
                Days
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              background: 'rgba(255, 255, 255, 0.06)',
              borderRadius: 2,
              px: 1.75,
              py: 0.75,
              textAlign: 'center',
              minWidth: 54,
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Typography sx={{ fontFamily: 'var(--mono)', fontSize: '1.15rem', fontWeight: 800, color: '#F8FAFC' }}>
              {String(scheduleInfo.hours).padStart(2, '0')}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.68rem', display: 'block' }}>
              Hours
            </Typography>
          </Box>

          <Box
            sx={{
              background: 'rgba(255, 255, 255, 0.06)',
              borderRadius: 2,
              px: 1.75,
              py: 0.75,
              textAlign: 'center',
              minWidth: 54,
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Typography sx={{ fontFamily: 'var(--mono)', fontSize: '1.15rem', fontWeight: 800, color: '#F8FAFC' }}>
              {String(scheduleInfo.minutes).padStart(2, '0')}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.68rem', display: 'block' }}>
              Minutes
            </Typography>
          </Box>

          <Box
            sx={{
              background: 'rgba(255, 255, 255, 0.06)',
              borderRadius: 2,
              px: 1.75,
              py: 0.75,
              textAlign: 'center',
              minWidth: 54,
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Typography sx={{ fontFamily: 'var(--mono)', fontSize: '1.15rem', fontWeight: 800, color: '#38BDF8' }}>
              {String(scheduleInfo.seconds).padStart(2, '0')}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.68rem', display: 'block' }}>
              Seconds
            </Typography>
          </Box>
        </Stack>
      )}

      {/* Mentors Row (Compact Pills) */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        {mentors.map((m) => (
          <Box
            key={m.name}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 2,
              py: 0.75,
              px: 1.5,
              maxWidth: 340,
            }}
          >
            <Avatar
              src={m.avatar || ''}
              alt={m.name}
              sx={{ width: 30, height: 30, bgcolor: '#2563EB', fontSize: '0.75rem', fontWeight: 700 }}
            >
              {m.name.slice(0, 2).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.84rem', color: '#FFFFFF', noWrap: true }}>
                {m.name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.72rem', display: 'block', noWrap: true }}>
                {m.role || m.company}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>

      {/* Copied Notice Banner */}
      {copiedLink && (
        <Alert
          severity="success"
          icon={<CheckCircleOutlinedIcon fontSize="small" />}
          sx={{
            py: 0.5,
            px: 1.5,
            mb: 1.75,
            borderRadius: 2,
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10B981',
            color: '#34D399',
            fontSize: '0.84rem',
          }}
        >
          ✓ Meeting Link Copied to Clipboard! Ready to paste into Google Meet.
        </Alert>
      )}

      {/* Action Buttons */}
      <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
        {isEnrolled ? (
          <Button
            variant="contained"
            component="a"
            href={meetingUrl}
            target="_blank"
            rel="noreferrer"
            startIcon={<VideocamOutlinedIcon sx={{ fontSize: 20 }} />}
            sx={{
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              py: 0.9,
              px: 2.25,
              borderRadius: 2,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
              },
            }}
          >
            Join Live Mentorship Room (Google Meet)
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={onUnlock}
            startIcon={<LockOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              py: 0.9,
              px: 2.25,
              borderRadius: 2,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
              },
            }}
          >
            Unlock Live Room Access (₹{masterclass.price || 74})
          </Button>
        )}

        <Button
          variant="outlined"
          onClick={handleCopyLink}
          startIcon={<ContentCopyOutlinedIcon sx={{ fontSize: 18 }} />}
          sx={{
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: '#FFFFFF',
            textTransform: 'none',
            fontSize: '0.84rem',
            fontWeight: 600,
            py: 0.9,
            px: 2,
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.06)',
            '&:hover': {
              borderColor: 'rgba(255, 255, 255, 0.4)',
              background: 'rgba(255, 255, 255, 0.12)',
            },
          }}
        >
          Copy Meeting Link
        </Button>

        {masterclass.whatsappGroupLink && (
          <Button
            variant="outlined"
            component="a"
            href={masterclass.whatsappGroupLink}
            target="_blank"
            rel="noreferrer"
            startIcon={<WhatsAppIcon sx={{ fontSize: 18, color: '#25D366' }} />}
            sx={{
              borderColor: 'rgba(37, 211, 102, 0.3)',
              color: '#F8FAFC',
              textTransform: 'none',
              fontSize: '0.84rem',
              fontWeight: 600,
              py: 0.9,
              px: 2,
              borderRadius: 2,
              background: 'rgba(37, 211, 102, 0.08)',
              '&:hover': {
                borderColor: '#25D366',
                background: 'rgba(37, 211, 102, 0.16)',
              },
            }}
          >
            WhatsApp Updates
          </Button>
        )}

        {onNavigateToNotes && (
          <Button
            variant="text"
            onClick={onNavigateToNotes}
            startIcon={<DownloadOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{
              color: '#94A3B8',
              textTransform: 'none',
              fontSize: '0.84rem',
              fontWeight: 600,
              py: 0.9,
              px: 1.5,
              '&:hover': {
                color: '#FFFFFF',
              },
            }}
          >
            Study Notes &amp; Resources
          </Button>
        )}
      </Stack>
    </Card>
  );
}
