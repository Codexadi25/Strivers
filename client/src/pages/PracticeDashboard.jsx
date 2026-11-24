import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { onAuthStateChanged } from 'firebase/auth';

import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import PracticeSheetsView from '../components/dashboard/PracticeSheetsView';
import MentorshipView from '../components/dashboard/MentorshipView';
import NotesResourcesView from '../components/dashboard/NotesResourcesView';
import AnalyticsProfileView from '../components/dashboard/AnalyticsProfileView';
import DashboardModals from '../components/dashboard/DashboardModals';

import { TOPICS } from '../data/practiceSheetData';
import { DOWNLOADABLE_NOTES } from '../data/downloadableNotesData';
import { auth } from '../services/firebase';
import api from '../utils/api';
import { getAuthUser, getAuthToken } from '../utils/authStorage';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, updateUser } from '../store/slices/authSlice';
import '../assets/styles/practiceDashboard.css';

export default function PracticeDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const reduxUser = useSelector(selectCurrentUser);

  const initialCachedUser = useMemo(() => reduxUser || getAuthUser(), [reduxUser]);

  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState('dsa'); // 'dsa' | 'mentorship' | 'notes' | 'analytics'
  const [practiceViewMode, setPracticeViewMode] = useState(() => {
    const enrolled = initialCachedUser?.enrolledPracticeSheets;
    return Array.isArray(enrolled) && enrolled.length > 0 ? 'my' : 'all';
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [onlySaved, setOnlySaved] = useState(false);
  const [onlyRevision, setOnlyRevision] = useState(false);

  // User Profile & Authentication loaded from backend
  const [authChecked, setAuthChecked] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [userAuthData, setUserAuthData] = useState(() => initialCachedUser);
  const [userEnrolledSheets, setUserEnrolledSheets] = useState(() => initialCachedUser?.enrolledPracticeSheets || []);
  const [userEnrolledCourses, setUserEnrolledCourses] = useState(() => initialCachedUser?.enrolledCourses || []);
  const [liveProducts, setLiveProducts] = useState([]);

  // Live dynamic Practice Sheets from Backend
  const [practiceSheets, setPracticeSheets] = useState([]);
  const [selectedTrackCategory, setSelectedTrackCategory] = useState('non-tech'); // 'non-tech' | 'tech'
  const [activeSheetId, setActiveSheetId] = useState('non-tech-ops-zomato-blinkit');
  const [activeScenarioModal, setActiveScenarioModal] = useState(null);
  const [enrollmentNotice, setEnrollmentNotice] = useState(null);

  // Downloadable Notes & Strict In-App Viewer Engine
  const [dbNotes, setDbNotes] = useState([]);
  const [activeSecretCodeNote, setActiveSecretCodeNote] = useState(null);
  const [inputSecretCode, setInputSecretCode] = useState('');
  const [secretCodeError, setSecretCodeError] = useState(null);
  const [secretCodeSuccess, setSecretCodeSuccess] = useState(null);
  const [isRedeemingCode, setIsRedeemingCode] = useState(false);
  const [drmActiveNote, setDrmActiveNote] = useState(null);
  const [drmContent, setDrmContent] = useState(null);
  const [isDrmLoading, setIsDrmLoading] = useState(false);
  const [isDocumentObfuscated, setIsDocumentObfuscated] = useState(false);
  const [screenshotWarningNotice, setScreenshotWarningNotice] = useState(false);

  // Solved, revision, and notes maps strictly synced from logged-in user profile
  const [solvedMap, setSolvedMap] = useState({});
  const [revisionMap, setRevisionMap] = useState({});
  const [notesMap, setNotesMap] = useState({});

  // Accordion state (day-1 open by default)
  const [openDays, setOpenDays] = useState({ 'day-1': true });

  // Dialog Modals
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isGroupStudyModalOpen, setIsGroupStudyModalOpen] = useState(false);
  const [activeNoteProblem, setActiveNoteProblem] = useState(null);
  const [currentNoteText, setCurrentNoteText] = useState('');
  const [selectedNoteFile, setSelectedNoteFile] = useState(null);

  // Fetch user profile & practice sheets cleanly on mount and auth transitions
  useEffect(() => {
    let isMounted = true;

    const clearAuthenticatedState = () => {
      if (!isMounted) return;
      setUserProfile(null);
      setUserAuthData(null);
      setUserEnrolledSheets([]);
      setUserEnrolledCourses([]);
      setDbNotes([]);
      setSolvedMap({});
      setRevisionMap({});
      setNotesMap({});
    };

    const syncAuthAndProfile = (fbUserOverride) => {
      const storedToken = getAuthToken();
      const cachedUser = getAuthUser();
      const firebaseUser = fbUserOverride !== undefined ? fbUserOverride : auth?.currentUser;

      if (cachedUser && (storedToken || firebaseUser)) {
        if (isMounted) {
          setUserAuthData((prev) => prev || cachedUser);
          if (Array.isArray(cachedUser.enrolledPracticeSheets)) {
            setUserEnrolledSheets((prev) => (prev && prev.length > 0 ? prev : cachedUser.enrolledPracticeSheets));
          }
          if (Array.isArray(cachedUser.enrolledCourses)) {
            setUserEnrolledCourses((prev) => (prev && prev.length > 0 ? prev : cachedUser.enrolledCourses));
          }
        }
      }

      const fetchProfileAndNotes = () => {
        api
          .get('/profile/me')
          .then((res) => {
            if (!isMounted) return;
            if (res.data?.success && res.data.profile) {
              const profile = res.data.profile;
              setUserProfile(profile);

              const solvedNext = {};
              if (Array.isArray(profile.solvedProblems)) {
                profile.solvedProblems.forEach((pid) => {
                  solvedNext[pid] = true;
                });
              }
              setSolvedMap(solvedNext);

              const revNext = {};
              if (Array.isArray(profile.starredProblems)) {
                profile.starredProblems.forEach((pid) => {
                  revNext[pid] = true;
                });
              }
              setRevisionMap(revNext);

              setNotesMap(
                profile.problemNotes && typeof profile.problemNotes === 'object'
                  ? { ...profile.problemNotes }
                  : {}
              );
            }
          })
          .catch(() => {});

        api
          .get('/notes')
          .then((res) => {
            if (!isMounted) return;
            if (res.data?.success && Array.isArray(res.data.notes)) {
              setDbNotes(res.data.notes);
            }
          })
          .catch(() => {});
      };

      api
        .get('/auth/me')
        .then((res) => {
          if (!isMounted) return;
          if (res.data?.success && res.data.user) {
            setUserAuthData(res.data.user);
            const enrolled = res.data.user.enrolledPracticeSheets || [];
            setUserEnrolledSheets(enrolled);
            if (enrolled.length > 0) {
              setPracticeViewMode('my');
            }
            setUserEnrolledCourses(res.data.user.enrolledCourses || []);
            dispatch(updateUser(res.data.user));
            fetchProfileAndNotes();
          } else {
            clearAuthenticatedState();
          }
        })
        .catch(() => {
          if (!isMounted) return;
          if (firebaseUser) {
            setUserAuthData({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student',
              role: 'user',
            });
            fetchProfileAndNotes();
          } else {
            clearAuthenticatedState();
          }
        })
        .finally(() => {
          if (isMounted) setAuthChecked(true);
        });
    };

    syncAuthAndProfile();
    window.addEventListener('auth_state_change', syncAuthAndProfile);

    let unsubscribeFirebase = () => {};
    try {
      if (auth && typeof onAuthStateChanged === 'function') {
        unsubscribeFirebase = onAuthStateChanged(auth, (fbUser) => {
          if (fbUser || getAuthToken()) {
            syncAuthAndProfile(fbUser);
          }
        });
      }
    } catch (_) {}

    // Fetch Live Practice Sheets (Public Catalog)
    api
      .get('/practice/sheets')
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.success && Array.isArray(res.data.sheets)) {
          setPracticeSheets(res.data.sheets);
          const nonTech = res.data.sheets.filter((s) => s.roleType === 'non-tech');
          if (nonTech.length > 0) {
            setActiveSheetId(nonTech[0].sheetId);
          }
        }
      })
      .catch((err) => {
        console.warn('Practice sheets fetch fallback:', err?.message || err);
      });

    // Fetch Live Courses & Masterclasses for Live Mentorship Room
    api
      .get('/courses')
      .then((res) => {
        if (!isMounted) return;
        const raw = res.data?.courses || res.data?.products;
        if (raw) {
          setLiveProducts(raw);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
      window.removeEventListener('auth_state_change', syncAuthAndProfile);
      unsubscribeFirebase();
    };
  }, []);

  // On-demand progress saving: only called when user takes an explicit action
  const toggleSolve = (problemId) => {
    setSolvedMap((prev) => {
      const next = { ...prev, [problemId]: !prev[problemId] };
      try {
        localStorage.setItem('strivers_solved_problems', JSON.stringify(next));
      } catch {}

      const solvedList = Object.keys(next).filter((k) => next[k]);
      api
        .post('/profile/progress', { solvedProblems: solvedList })
        .then((res) => {
          if (res.data?.profile) setUserProfile(res.data.profile);
        })
        .catch(() => {});

      return next;
    });
  };

  const toggleRevision = (problemId) => {
    setRevisionMap((prev) => {
      const next = { ...prev, [problemId]: !prev[problemId] };
      try {
        localStorage.setItem('strivers_revision_problems', JSON.stringify(next));
      } catch {}

      const starredList = Object.keys(next).filter((k) => next[k]);
      api.post('/profile/progress', { starredProblems: starredList }).catch(() => {});

      return next;
    });
  };

  const toggleDayAccordion = (dayId) => {
    setOpenDays((prev) => ({ ...prev, [dayId]: !prev[dayId] }));
  };

  const openNoteModal = (problem) => {
    setActiveNoteProblem(problem);
    setCurrentNoteText(notesMap[problem.id] || '');
  };

  const saveNote = () => {
    if (activeNoteProblem) {
      const next = { ...notesMap, [activeNoteProblem.id]: currentNoteText };
      setNotesMap(next);
      try {
        localStorage.setItem('strivers_problem_notes', JSON.stringify(next));
      } catch {}

      api.post('/profile/progress', { problemNotes: next }).catch(() => {});
      setActiveNoteProblem(null);
    }
  };

  // Categorized practice sheets
  const nonTechSheets = useMemo(() => {
    return practiceSheets.filter((s) => s.roleType === 'non-tech');
  }, [practiceSheets]);

  const activeNonTechSheet = useMemo(() => {
    return nonTechSheets.find((s) => s.sheetId === activeSheetId) || nonTechSheets[0] || null;
  }, [nonTechSheets, activeSheetId]);

  const isUserEnrolledInActiveSheet = useMemo(() => {
    if (selectedTrackCategory === 'tech') return true;
    return userEnrolledSheets.some(
      (s) => s.sheetId === (activeNonTechSheet?.sheetId || activeSheetId)
    );
  }, [selectedTrackCategory, userEnrolledSheets, activeNonTechSheet, activeSheetId]);

  // Operational Problems for active Non-Tech Sheet
  const activeNonTechProblems = useMemo(() => {
    if (!activeNonTechSheet || !Array.isArray(activeNonTechSheet.topics)) return [];
    return activeNonTechSheet.topics.flatMap((t) => t.problems || []);
  }, [activeNonTechSheet]);

  const filteredNonTechTopics = useMemo(() => {
    if (!activeNonTechSheet || !Array.isArray(activeNonTechSheet.topics)) return [];
    return activeNonTechSheet.topics
      .map((top) => {
        const filtered = (top.problems || []).filter((p) => {
          const matchesSearch =
            !searchQuery ||
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.company && p.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.type && p.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.scenario && p.scenario.toLowerCase().includes(searchQuery.toLowerCase()));

          const matchesDiff =
            difficultyFilter === 'all' ||
            p.difficulty.toLowerCase() === difficultyFilter.toLowerCase();

          const matchesSaved = !onlySaved || revisionMap[p.id];
          const matchesRev = !onlyRevision || revisionMap[p.id];

          return matchesSearch && matchesDiff && matchesSaved && matchesRev;
        });
        return { ...top, problems: filtered };
      })
      .filter((t) => t.problems.length > 0);
  }, [activeNonTechSheet, searchQuery, difficultyFilter, onlySaved, onlyRevision, revisionMap]);

  const handleEnrollPracticeSheet = async (sheet) => {
    if (!sheet) return;
    setEnrollmentNotice(null);

    const alreadyEnrolled = userEnrolledSheets.some((s) => s.sheetId === sheet.sheetId);
    if (alreadyEnrolled) {
      setActiveSheetId(sheet.sheetId);
      return;
    }

    if (sheet.price === 0 || sheet.isFree) {
      try {
        const res = await api.post('/practice/enroll', { sheetId: sheet.sheetId });
        if (res.data?.success) {
          const newEnrollment = {
            sheetId: sheet.sheetId,
            sheetTitle: sheet.title,
            roleType: sheet.roleType,
            enrolledAt: new Date(),
          };
          setUserEnrolledSheets((prev) => [...prev, newEnrollment]);
          setActiveSheetId(sheet.sheetId);
          setEnrollmentNotice({
            type: 'success',
            message: `🎉 Successfully enrolled in "${sheet.title}" for free! You now have permanent practice access to this track.`,
          });
        }
      } catch (err) {
        const errData = err.response?.data;
        if (errData?.limitReached) {
          setEnrollmentNotice({
            type: 'warning',
            message: `⚠️ Practice Sheet Limit Reached: Limited Practice Sheet Access is granted per user (${
              errData.maxAllowed || 2
            } sheets maximum). Please manage your active tracks or contact mentorship support.`,
          });
        } else {
          setEnrollmentNotice({
            type: 'error',
            message: errData?.message || 'Enrollment request failed.',
          });
        }
      }
    } else {
      setEnrollmentNotice({
        type: 'info',
        message: `💳 This specialized practice track requires an access fee of ₹${sheet.price.toFixed(
          2
        )}. Please complete payment to unlock.`,
      });
    }
  };

  // Dynamic Tech sheets from backend (with baseline fallback if offline)
  const techTopicsSource = useMemo(() => {
    const techSheets = practiceSheets.filter(
      (s) => s.roleType === 'tech' && Array.isArray(s.topics) && s.topics.length > 0
    );
    if (techSheets.length > 0) {
      return techSheets[0].topics.map((t, idx) => ({
        id: t.topicId || `day-${idx + 1}`,
        dayNumber: idx + 1,
        title: t.topicTitle || t.title || `Module ${idx + 1}`,
        category: t.summary || 'DSA',
        problems: (t.problems || []).map((p) => ({
          id: p.id,
          title: p.title,
          difficulty: p.difficulty || 'Medium',
          articleUrl: p.resourceLink || p.articleUrl || '#',
          videoUrl: p.videoUrl || '#',
          practiceUrl: p.resourceLink || p.practiceUrl || '#',
          companies: p.companies || (p.company ? [p.company] : ['Top Tech']),
          note: p.keyTakeaway || p.solutionGuidance || '',
        })),
      }));
    }
    return TOPICS;
  }, [practiceSheets]);

  // Metrics calculation
  const allProblems = useMemo(() => {
    if (selectedTrackCategory === 'non-tech') {
      return activeNonTechProblems;
    }
    return techTopicsSource.flatMap((t) => t.problems);
  }, [selectedTrackCategory, activeNonTechProblems, techTopicsSource]);

  const totalProblemsCount = allProblems.length;
  const totalSolvedCount = useMemo(() => {
    return allProblems.filter((p) => solvedMap[p.id]).length;
  }, [allProblems, solvedMap]);

  const progressPercent = Math.round((totalSolvedCount / (totalProblemsCount || 1)) * 100);

  const easyProblems = allProblems.filter((p) => p.difficulty === 'Easy');
  const mediumProblems = allProblems.filter((p) => p.difficulty === 'Medium');
  const hardProblems = allProblems.filter((p) => p.difficulty === 'Hard');

  const easySolved = easyProblems.filter((p) => solvedMap[p.id]).length;
  const mediumSolved = mediumProblems.filter((p) => solvedMap[p.id]).length;
  const hardSolved = hardProblems.filter((p) => solvedMap[p.id]).length;

  // Filtered Topics
  const filteredTopics = useMemo(() => {
    return techTopicsSource
      .map((day) => {
        const filtered = day.problems.filter((p) => {
          const matchesSearch =
            !searchQuery ||
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.companies.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

          const matchesDiff =
            difficultyFilter === 'all' ||
            p.difficulty.toLowerCase() === difficultyFilter.toLowerCase();

          const matchesSaved = !onlySaved || revisionMap[p.id];
          const matchesRev = !onlyRevision || revisionMap[p.id];

          return matchesSearch && matchesDiff && matchesSaved && matchesRev;
        });

        return { ...day, problems: filtered };
      })
      .filter((day) => day.problems.length > 0);
  }, [techTopicsSource, searchQuery, difficultyFilter, onlySaved, onlyRevision, revisionMap]);

  // Downloadable notes (Dynamic from MongoDB with Free & Paid classification)
  const combinedNotesList = useMemo(() => {
    if (dbNotes && dbNotes.length > 0) {
      return dbNotes;
    }
    return DOWNLOADABLE_NOTES.map((n, idx) => ({
      noteId: n.id,
      title: n.title,
      subtitle: n.subtitle,
      tag: n.tag,
      color: n.color || '#3B82F6',
      type: idx === 0 || idx === 1 ? 'free' : 'paid',
      fileType: 'html',
      fileSize: 52000,
      hasAccess: idx === 0 || idx === 1,
      isLocked: idx > 1,
      accessReason: idx > 1 ? 'Masterclass Secret Code or Enrollment Required' : 'Free Note',
    }));
  }, [dbNotes]);

  const filteredNotes = useMemo(() => {
    if (!searchQuery) return combinedNotesList;
    const q = searchQuery.toLowerCase();
    return combinedNotesList.filter(
      (n) =>
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.subtitle && n.subtitle.toLowerCase().includes(q)) ||
        (n.tag && n.tag.toLowerCase().includes(q))
    );
  }, [searchQuery, combinedNotesList]);

  // Percentage helper for each sheet
  const getSheetProgress = (sheet) => {
    if (!sheet) return 0;
    if (sheet.sheetId === 'strivers-sde-sheet' || sheet.roleType === 'tech') {
      return totalProblemsCount > 0 ? Math.round((totalSolvedCount / totalProblemsCount) * 100) : 0;
    }
    const sheetProblems = (sheet.topics || []).flatMap((t) => t.problems || []);
    if (sheetProblems.length === 0) return 0;
    const solved = sheetProblems.filter((p) => solvedMap[p.id]).length;
    return Math.round((solved / sheetProblems.length) * 100);
  };

  // Dynamic Streak & Calendar Computations
  const streakData = useMemo(() => {
    const rawStreak = userProfile?.streak || {};
    const currentStreak = rawStreak.currentStreak ?? 0;
    const totalActiveDays = rawStreak.totalActiveDays ?? 0;
    const bestStreak = rawStreak.bestStreak ?? 0;
    const weeklyMinutes = rawStreak.weeklyMinutes ?? 0;
    const activeDatesList = Array.isArray(rawStreak.activeDates) ? rawStreak.activeDates : [];

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthIndex = now.getMonth();
    const monthName = now.toLocaleString('default', { month: 'long' });
    const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonthIndex, 1).getDay();
    const todayDateNum = now.getDate();

    const activeDaysSet = new Set();
    activeDatesList.forEach((dStr) => {
      if (typeof dStr === 'string' && dStr.includes('-')) {
        const parts = dStr.split('-');
        if (
          parseInt(parts[0], 10) === currentYear &&
          parseInt(parts[1], 10) === currentMonthIndex + 1
        ) {
          activeDaysSet.add(parseInt(parts[2], 10));
        }
      } else if (!isNaN(Number(dStr))) {
        activeDaysSet.add(Number(dStr));
      }
    });

    if (totalSolvedCount > 0) {
      activeDaysSet.add(todayDateNum);
    }

    const dailySubmissions =
      rawStreak.dailySubmissions instanceof Map
        ? Object.fromEntries(rawStreak.dailySubmissions)
        : rawStreak.dailySubmissions || {};

    const weeklyDistribution =
      rawStreak.weeklyDistribution && rawStreak.weeklyDistribution.length === 7
        ? rawStreak.weeklyDistribution
        : [
            { day: 'S', dayIndex: 0, minutes: 0, time: '0h 0m' },
            { day: 'M', dayIndex: 1, minutes: 0, time: '0h 0m' },
            { day: 'T', dayIndex: 2, minutes: 0, time: '0h 0m' },
            { day: 'W', dayIndex: 3, minutes: 0, time: '0h 0m' },
            { day: 'T', dayIndex: 4, minutes: 0, time: '0h 0m' },
            { day: 'F', dayIndex: 5, minutes: 0, time: '0h 0m' },
            { day: 'S', dayIndex: 6, minutes: 0, time: '0h 0m' },
          ];

    const streakSuffix =
      currentStreak === 1 ? 'st' : currentStreak === 2 ? 'nd' : currentStreak === 3 ? 'rd' : 'th';

    return {
      currentStreak,
      totalActiveDays,
      bestStreak,
      weeklyMinutes,
      activeDaysSet,
      daysInMonth,
      firstDayIndex,
      todayDateNum,
      monthName,
      currentMonthIndex,
      currentYear,
      streakSuffix,
      dailySubmissions,
      weeklyDistribution,
    };
  }, [userProfile, totalSolvedCount]);

  // Analytics preparation
  const analyticsData = useMemo(() => {
    const topicBreakdown = (
      selectedTrackCategory === 'non-tech' && activeNonTechSheet?.topics
        ? activeNonTechSheet.topics
        : techTopicsSource
    ).map((t) => {
      const title = t.topicTitle || t.title;
      const tProblems = t.problems || [];
      const solved = tProblems.filter((p) => solvedMap[p.id]).length;
      const total = tProblems.length;
      const percent = total > 0 ? Math.round((solved / total) * 100) : 0;
      return { topic: title, solved, total, percent };
    });

    return {
      topicBreakdown,
      easySolved,
      easyTotal: easyProblems.length,
      mediumSolved,
      mediumTotal: mediumProblems.length,
      hardSolved,
      hardTotal: hardProblems.length,
    };
  }, [
    selectedTrackCategory,
    activeNonTechSheet,
    techTopicsSource,
    solvedMap,
    easySolved,
    easyProblems.length,
    mediumSolved,
    mediumProblems.length,
    hardSolved,
    hardProblems.length,
  ]);

  // Enrolled masterclass for live room - Strictly distinguished from generic courses using schema
  const enrolledCourseProduct = useMemo(() => {
    if (!liveProducts || liveProducts.length === 0) return null;
    const masterclassesOnly = liveProducts.filter(
      (p) => p.category === 'masterclass' || p.isMasterclass === true || p.productId === 'masterclass'
    );
    return (
      masterclassesOnly.find((p) => {
        const pid = p._id || p.productId;
        return (
          userEnrolledCourses?.some((c) => c.courseId === pid) ||
          (userAuthData?.hasActiveSubscription && (pid === 'masterclass' || pid === 'placement_masterclass'))
        );
      }) || (userAuthData?.hasActiveSubscription ? masterclassesOnly[0] : null)
    );
  }, [liveProducts, userEnrolledCourses, userAuthData]);

  // Active Live Mentorship class
  const activeMentorshipClass = useMemo(() => {
    const masterclassesOnly = liveProducts.filter(
      (p) => p.category === 'masterclass' || p.isMasterclass === true || p.productId === 'masterclass'
    );
    if (
      enrolledCourseProduct &&
      (enrolledCourseProduct.category === 'masterclass' || enrolledCourseProduct.isMasterclass)
    ) {
      return enrolledCourseProduct;
    }
    const liveNow = masterclassesOnly.find((p) => p.sessionStatus === 'live');
    if (liveNow) return liveNow;
    const upcoming = masterclassesOnly.find((p) => p.sessionStatus === 'upcoming');
    if (upcoming) return upcoming;
    return masterclassesOnly[0] || null;
  }, [enrolledCourseProduct, liveProducts]);

  const isUserEnrolledInClass = Boolean(enrolledCourseProduct);

  // Handle Opening Downloadable Notes (Enforces Login & Paid/Free Access)
  const handleOpenNote = async (note) => {
    if (!userAuthData && !userProfile) {
      alert('Authentication required. A regular user who has not logged in cannot access Downloadable Notes.');
      navigate('/login');
      return;
    }

    if (note.type === 'paid' && (note.isLocked || !note.hasAccess)) {
      setActiveSecretCodeNote(note);
      setInputSecretCode('');
      setSecretCodeError(null);
      setSecretCodeSuccess(null);
      return;
    }

    setDrmActiveNote(note);
    setIsDrmLoading(true);
    setDrmContent(null);

    try {
      const noteIdentifier = note.noteId || note.id;
      const res = await api.get(`/notes/${encodeURIComponent(noteIdentifier)}/content`);
      if (res.data?.success) {
        setDrmContent(res.data);
      } else {
        alert(res.data?.message || 'Failed to load note content.');
        setDrmActiveNote(null);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setDrmActiveNote(null);
        setActiveSecretCodeNote(note);
        setInputSecretCode('');
        setSecretCodeError(
          err.response?.data?.message ||
            'This is a Paid Note. You must be enrolled in the Masterclass or enter the attendee secret code to view.'
        );
      } else {
        setDrmContent({
          title: note.title,
          fileType: note.fileType || 'html',
          mimeType: note.fileType === 'pdf' ? 'application/pdf' : 'text/html',
          fileData: btoa(
            `<div style="font-family: -apple-system, sans-serif; padding: 24px; line-height: 1.6;"><h2>${note.title}</h2><p style="color: #64748B;">${note.subtitle || ''}</p><hr style="border: none; border-top: 1px solid #E2E8F0; margin: 16px 0;" /><p>${note.previewText || 'Confidential Strivers Study Guide.'}</p></div>`
          ),
          watermark: userAuthData?.email || userProfile?.email || 'student@strivers.com',
        });
      }
    } finally {
      setIsDrmLoading(false);
    }
  };

  // Handle Redeeming Masterclass Attendee Secret Code
  const handleRedeemSecretCode = async (e) => {
    e.preventDefault();
    if (!inputSecretCode.trim() || !activeSecretCodeNote) return;

    setIsRedeemingCode(true);
    setSecretCodeError(null);
    setSecretCodeSuccess(null);

    try {
      const noteIdentifier = activeSecretCodeNote.noteId || activeSecretCodeNote.id;
      const res = await api.post(`/notes/${encodeURIComponent(noteIdentifier)}/redeem-code`, {
        secretCode: inputSecretCode.trim(),
        masterclassId: activeSecretCodeNote.linkedMasterclassId || 'masterclass',
      });

      if (res.data?.success) {
        setSecretCodeSuccess(res.data.message || '✓ Secret code verified! Note unlocked.');
        try {
          const listRes = await api.get('/notes');
          if (listRes.data?.notes) {
            setDbNotes(listRes.data.notes);
          }
        } catch {}

        setTimeout(() => {
          const unlocked = { ...activeSecretCodeNote, hasAccess: true, isLocked: false };
          setActiveSecretCodeNote(null);
          handleOpenNote(unlocked);
        }, 1200);
      }
    } catch (err) {
      setSecretCodeError(
        err.response?.data?.message ||
          'Secret code verification failed. Ensure you are enrolled in this Masterclass and enter the correct code.'
      );
    } finally {
      setIsRedeemingCode(false);
    }
  };

  // DRM Anti-Screenshot & Anti-Print Protection Engine
  useEffect(() => {
    if (!drmActiveNote) return;

    let warningTimer = null;

    const triggerWarning = (reason = 'Screenshot/Print attempt') => {
      setScreenshotWarningNotice(true);
      setIsDocumentObfuscated(true);

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('You can not take Screenshot or Print this page');
        }
      } catch {}

      api.post('/secure/log-breach', { reason }).catch(() => {});

      if (warningTimer) clearTimeout(warningTimer);
      warningTimer = setTimeout(() => {
        setScreenshotWarningNotice(false);
        setIsDocumentObfuscated(false);
      }, 3500);
    };

    const handleBeforePrint = (e) => {
      e.preventDefault();
      triggerWarning('Print dialog invoked');
      return false;
    };

    const handleKeyDown = (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44 || e.code === 'PrintScreen') {
        e.preventDefault();
        e.stopPropagation();
        triggerWarning('PrintScreen key pressed');
        return false;
      }

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        e.stopPropagation();
        triggerWarning('Snipping Tool shortcut (Ctrl/Meta+Shift+S)');
        return false;
      }

      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        triggerWarning('Mac screen capture shortcut (Cmd+Shift+3/4/5)');
        return false;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        e.stopPropagation();
        triggerWarning('Print shortcut (Ctrl/Cmd+P)');
        return false;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        triggerWarning('Save document shortcut (Ctrl/Cmd+S)');
        return false;
      }

      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'C', 'c', 'J', 'j'].includes(e.key))
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerWarning('Developer inspection shortcut');
        return false;
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44 || e.code === 'PrintScreen') {
        e.preventDefault();
        triggerWarning('PrintScreen key released');
      }
    };

    const handleWindowBlur = () => {
      setIsDocumentObfuscated(true);
    };

    const handleWindowFocus = () => {
      setTimeout(() => {
        setIsDocumentObfuscated(false);
      }, 350);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setIsDocumentObfuscated(true);
      } else {
        setTimeout(() => setIsDocumentObfuscated(false), 350);
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      triggerWarning('Right click / Context menu attempt');
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      if (warningTimer) clearTimeout(warningTimer);
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [drmActiveNote]);

  // Loading state
  if (!authChecked) {
    return (
      <div className="pd-auth-gate-shell">
        <Header user={null} />
        <main className="pd-auth-gate-main">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
              color: '#64748B',
            }}
          >
            <CircularProgress size={32} />
            <Typography variant="body2">Verifying session and loading your profile...</Typography>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Unauthenticated Paywall/Sign-in Gate
  if (!userAuthData) {
    return (
      <div className="pd-auth-gate-shell">
        <Header user={null} />
        <main className="pd-auth-gate-main">
          <Paper elevation={0} className="pd-auth-gate-card">
            <LockOutlinedIcon sx={{ fontSize: 48, color: '#2563EB', mb: 1.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
              Sign In Required
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.6, mb: 3 }}>
              Practice sheets, live mentorship sessions, study notes, and your personal stats are
              only available after signing in to your Strivers account.
            </Typography>
            <div className="pd-auth-gate-actions">
              <Button
                variant="contained"
                color="primary"
                data-testid="practice-signin-btn"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/login?redirect=/practice')}
              >
                Sign In to Continue
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/register?redirect=/practice')}
              >
                Create Account
              </Button>
            </div>
          </Paper>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* 1. Left Navigation Sidebar */}
      <DashboardSidebar
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        practiceViewMode={practiceViewMode}
        setPracticeViewMode={setPracticeViewMode}
        userEnrolledSheets={userEnrolledSheets}
        practiceSheets={practiceSheets}
        streakData={streakData}
        onOpenStreakModal={() => setIsStreakModalOpen(true)}
      />

      {/* 2. Main Layout Area */}
      <div className="dashboard-main">
        {/* Top Header Bar & Mobile Drawers */}
        <DashboardHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          practiceViewMode={practiceViewMode}
          setPracticeViewMode={setPracticeViewMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          mobileDrawerOpen={mobileDrawerOpen}
          setMobileDrawerOpen={setMobileDrawerOpen}
          userProfile={userProfile}
          userAuthData={userAuthData}
          streakData={streakData}
          userEnrolledSheets={userEnrolledSheets}
          practiceSheets={practiceSheets}
          onOpenStreakModal={() => setIsStreakModalOpen(true)}
        />

        {/* Dashboard Content Container */}
        <div className="dashboard-content-container">
          {/* VIEW 1: Practice Sheets (Non-Tech & Tech Tracks) */}
          {activeTab === 'dsa' && (
            <PracticeSheetsView
              selectedTrackCategory={selectedTrackCategory}
              setSelectedTrackCategory={setSelectedTrackCategory}
              enrollmentNotice={enrollmentNotice}
              setEnrollmentNotice={setEnrollmentNotice}
              userEnrolledSheets={userEnrolledSheets}
              userAuthData={userAuthData}
              practiceViewMode={practiceViewMode}
              setPracticeViewMode={setPracticeViewMode}
              nonTechSheets={nonTechSheets}
              activeSheetId={activeSheetId}
              setActiveSheetId={setActiveSheetId}
              activeNonTechSheet={activeNonTechSheet}
              isUserEnrolledInActiveSheet={isUserEnrolledInActiveSheet}
              handleEnrollPracticeSheet={handleEnrollPracticeSheet}
              filteredNonTechTopics={filteredNonTechTopics}
              openDays={openDays}
              toggleDayAccordion={toggleDayAccordion}
              solvedMap={solvedMap}
              revisionMap={revisionMap}
              notesMap={notesMap}
              toggleSolve={toggleSolve}
              toggleRevision={toggleRevision}
              openNoteModal={openNoteModal}
              setActiveScenarioModal={setActiveScenarioModal}
              onlySaved={onlySaved}
              setOnlySaved={setOnlySaved}
              onlyRevision={onlyRevision}
              setOnlyRevision={setOnlyRevision}
              difficultyFilter={difficultyFilter}
              setDifficultyFilter={setDifficultyFilter}
              filteredTopics={filteredTopics}
              setIsGroupStudyModalOpen={setIsGroupStudyModalOpen}
              progressPercent={progressPercent}
              totalProblemsCount={totalProblemsCount}
              totalSolvedCount={totalSolvedCount}
              easySolved={easySolved}
              easyProblems={easyProblems}
              mediumSolved={mediumSolved}
              mediumProblems={mediumProblems}
              hardSolved={hardSolved}
              hardProblems={hardProblems}
              streakData={streakData}
              setIsStreakModalOpen={setIsStreakModalOpen}
              getSheetProgress={getSheetProgress}
            />
          )}

          {/* VIEW 2: Live Mentorship Sessions & Masterclasses */}
          {activeTab === 'mentorship' && (
            <MentorshipView
              activeMentorshipClass={activeMentorshipClass}
              isUserEnrolledInClass={isUserEnrolledInClass}
              userAuthData={userAuthData}
              onNavigateToNotes={() => setActiveTab('notes')}
              onUnlock={() =>
                navigate(
                  `/courses?checkout=${encodeURIComponent(
                    activeMentorshipClass?.productId || 'masterclass'
                  )}`
                )
              }
            />
          )}

          {/* VIEW 3: Downloadable Notes & Cheat Sheets */}
          {activeTab === 'notes' && (
            <NotesResourcesView
              userAuthData={userAuthData}
              userProfile={userProfile}
              filteredNotes={filteredNotes}
              onOpenNote={handleOpenNote}
            />
          )}

          {/* VIEW 4: Profile & Analytics Dashboard */}
          {activeTab === 'analytics' && (
            <AnalyticsProfileView
              userProfile={userProfile}
              userAuthData={userAuthData}
              userEnrolledSheets={userEnrolledSheets}
              totalSolvedCount={totalSolvedCount}
              streakData={streakData}
              solvedMap={solvedMap}
              analyticsData={analyticsData}
            />
          )}
        </div>
      </div>

      {/* 3. Global Dashboard Dialogs & Modals */}
      <DashboardModals
        isStreakModalOpen={isStreakModalOpen}
        setIsStreakModalOpen={setIsStreakModalOpen}
        streakData={streakData}
        activeNoteProblem={activeNoteProblem}
        setActiveNoteProblem={setActiveNoteProblem}
        currentNoteText={currentNoteText}
        setCurrentNoteText={setCurrentNoteText}
        saveNote={saveNote}
        selectedNoteFile={selectedNoteFile}
        setSelectedNoteFile={setSelectedNoteFile}
        isPlanModalOpen={isPlanModalOpen}
        setIsPlanModalOpen={setIsPlanModalOpen}
        isGroupStudyModalOpen={isGroupStudyModalOpen}
        setIsGroupStudyModalOpen={setIsGroupStudyModalOpen}
        activeScenarioModal={activeScenarioModal}
        setActiveScenarioModal={setActiveScenarioModal}
        screenshotWarningNotice={screenshotWarningNotice}
        setScreenshotWarningNotice={setScreenshotWarningNotice}
        activeSecretCodeNote={activeSecretCodeNote}
        setActiveSecretCodeNote={setActiveSecretCodeNote}
        inputSecretCode={inputSecretCode}
        setInputSecretCode={setInputSecretCode}
        secretCodeError={secretCodeError}
        secretCodeSuccess={secretCodeSuccess}
        isRedeemingCode={isRedeemingCode}
        handleRedeemSecretCode={handleRedeemSecretCode}
        drmActiveNote={drmActiveNote}
        setDrmActiveNote={setDrmActiveNote}
        isDocumentObfuscated={isDocumentObfuscated}
        drmContent={drmContent}
        isDrmLoading={isDrmLoading}
        userAuthData={userAuthData}
        userProfile={userProfile}
      />
    </div>
  );
}
