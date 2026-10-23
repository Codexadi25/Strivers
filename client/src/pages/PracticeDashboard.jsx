import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TOPICS } from '../data/practiceSheetData';
import { DOWNLOADABLE_NOTES } from '../data/downloadableNotesData';
import { LIVE_MENTORSHIP } from '../data/mentorshipData';
import CompanyMarquee from '../components/common/CompanyMarquee';
import PlacementDisclaimer from '../components/common/PlacementDisclaimer';
import api from '../utils/api';
import '../assets/styles/practiceDashboard.css';

export default function PracticeDashboard() {
  const [activeTab, setActiveTab] = useState('dsa'); // 'dsa' | 'mentorship' | 'notes' | 'analytics'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [onlySaved, setOnlySaved] = useState(false);
  const [onlyRevision, setOnlyRevision] = useState(false);

  // User Profile & Authentication loaded from backend (fetched ONCE on mount, NO continuous polling)
  const [userProfile, setUserProfile] = useState(null);
  const [userAuthData, setUserAuthData] = useState(null);
  const [userEnrolledSheets, setUserEnrolledSheets] = useState([]);
  const [userEnrolledCourses, setUserEnrolledCourses] = useState([]);

  // Live dynamic Practice Sheets from Backend
  const [practiceSheets, setPracticeSheets] = useState([]);
  const [selectedTrackCategory, setSelectedTrackCategory] = useState('non-tech'); // 'non-tech' | 'tech'
  const [activeSheetId, setActiveSheetId] = useState('non-tech-ops-zomato-blinkit');
  const [activeScenarioModal, setActiveScenarioModal] = useState(null);
  const [newProfilePassword, setNewProfilePassword] = useState('');
  const [passwordResetStatus, setPasswordResetStatus] = useState(null);
  const [enrollmentNotice, setEnrollmentNotice] = useState(null);

  // Solved state persistent in localStorage + backend
  const [solvedMap, setSolvedMap] = useState(() => {
    try {
      const stored = localStorage.getItem('strivers_solved_problems');
      return stored ? JSON.parse(stored) : { 'dsa-1-1': true, 'dsa-1-2': true, 'dsa-2-1': true };
    } catch {
      return {};
    }
  });

  // Revision / bookmarked problems
  const [revisionMap, setRevisionMap] = useState(() => {
    try {
      const stored = localStorage.getItem('strivers_revision_problems');
      return stored ? JSON.parse(stored) : { 'dsa-1-1': true, 'dsa-3-1': true };
    } catch {
      return {};
    }
  });

  // Personal notes
  const [notesMap, setNotesMap] = useState(() => {
    try {
      const stored = localStorage.getItem('strivers_problem_notes');
      return stored ? JSON.parse(stored) : {
        'dsa-1-1': 'Used first row and first column as flag markers in-place.',
        'dsa-1-2': 'Pascal Triangle row generation in O(N) using comb formula.',
      };
    } catch {
      return {};
    }
  });

  // Fetch original user profile data & practice sheets ONCE on component mount (No repeated API calls)
  useEffect(() => {
    let isMounted = true;

    // 1. Fetch Profile
    api
      .get('/profile/me')
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.success && res.data.profile) {
          const profile = res.data.profile;
          setUserProfile(profile);

          if (Array.isArray(profile.solvedProblems) && profile.solvedProblems.length > 0) {
            setSolvedMap((prev) => {
              const updated = { ...prev };
              profile.solvedProblems.forEach((pid) => {
                updated[pid] = true;
              });
              try {
                localStorage.setItem('strivers_solved_problems', JSON.stringify(updated));
              } catch {}
              return updated;
            });
          }

          if (Array.isArray(profile.starredProblems) && profile.starredProblems.length > 0) {
            setRevisionMap((prev) => {
              const updated = { ...prev };
              profile.starredProblems.forEach((pid) => {
                updated[pid] = true;
              });
              try {
                localStorage.setItem('strivers_revision_problems', JSON.stringify(updated));
              } catch {}
              return updated;
            });
          }

          if (profile.problemNotes && typeof profile.problemNotes === 'object') {
            setNotesMap((prev) => ({
              ...prev,
              ...profile.problemNotes,
            }));
          }
        }
      })
      .catch((err) => {
        console.warn('Profile loaded with fallback defaults:', err?.message || err);
      });

    // 2. Fetch User Auth & Permanent Enrolled Courses / Sheets
    api
      .get('/auth/me')
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.success && res.data.user) {
          setUserAuthData(res.data.user);
          setUserEnrolledSheets(res.data.user.enrolledPracticeSheets || []);
          setUserEnrolledCourses(res.data.user.enrolledCourses || []);
        }
      })
      .catch((err) => {
        console.warn('Auth session check:', err?.message || err);
      });

    // 3. Fetch Live Practice Sheets
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

    return () => {
      isMounted = false;
    };
  }, []);

  // Accordion state (day-1 open by default)
  const [openDays, setOpenDays] = useState({ 'day-1': true });

  // Modals
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isGroupStudyModalOpen, setIsGroupStudyModalOpen] = useState(false);
  const [activeNoteProblem, setActiveNoteProblem] = useState(null);
  const [currentNoteText, setCurrentNoteText] = useState('');
  const [selectedNoteFile, setSelectedNoteFile] = useState(null);

  // Countdown timer for Live Mentorship
  const [countdown, setCountdown] = useState({ hours: 42, minutes: 18, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // On-demand progress saving: only called when user takes an explicit action (never in intervals)
  const toggleSolve = (problemId) => {
    setSolvedMap((prev) => {
      const next = { ...prev, [problemId]: !prev[problemId] };
      try {
        localStorage.setItem('strivers_solved_problems', JSON.stringify(next));
      } catch {}

      // On-demand sync to backend (only on user action, never in polling loops)
      const solvedList = Object.keys(next).filter((k) => next[k]);
      api.post('/profile/progress', { solvedProblems: solvedList }).catch(() => {});

      return next;
    });
  };

  const toggleRevision = (problemId) => {
    setRevisionMap((prev) => {
      const next = { ...prev, [problemId]: !prev[problemId] };
      try {
        localStorage.setItem('strivers_revision_problems', JSON.stringify(next));
      } catch {}

      // On-demand sync to backend
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

      // On-demand sync note
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
    return userEnrolledSheets.some((s) => s.sheetId === (activeNonTechSheet?.sheetId || activeSheetId));
  }, [selectedTrackCategory, userEnrolledSheets, activeNonTechSheet, activeSheetId]);

  // Operational Problems for active Non-Tech Sheet
  const activeNonTechProblems = useMemo(() => {
    if (!activeNonTechSheet || !Array.isArray(activeNonTechSheet.topics)) return [];
    return activeNonTechSheet.topics.flatMap((t) => t.problems || []);
  }, [activeNonTechSheet]);

  const filteredNonTechTopics = useMemo(() => {
    if (!activeNonTechSheet || !Array.isArray(activeNonTechSheet.topics)) return [];
    return activeNonTechSheet.topics.map((top) => {
      const filtered = (top.problems || []).filter((p) => {
        const matchesSearch =
          !searchQuery ||
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.company && p.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.type && p.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.scenario && p.scenario.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesDiff =
          difficultyFilter === 'all' || p.difficulty.toLowerCase() === difficultyFilter.toLowerCase();

        const matchesSaved = !onlySaved || revisionMap[p.id];
        const matchesRev = !onlyRevision || revisionMap[p.id];

        return matchesSearch && matchesDiff && matchesSaved && matchesRev;
      });
      return { ...top, problems: filtered };
    }).filter((t) => t.problems.length > 0);
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
            message: `⚠️ Practice Sheet Limit Reached: Limited Practice Sheet Access is granted per user (${errData.maxAllowed || 2} sheets maximum). Please manage your active tracks or contact mentorship support.`,
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
        message: `💳 This specialized practice track requires an access fee of ₹${sheet.price.toFixed(2)}. Please complete payment to unlock.`,
      });
    }
  };

  const handleInProfilePasswordReset = async (e) => {
    e.preventDefault();
    if (!newProfilePassword || newProfilePassword.length < 4) {
      setPasswordResetStatus({ type: 'error', message: 'Password must be at least 4 characters.' });
      return;
    }
    const email = userAuthData?.email || userProfile?.email;
    if (!email) {
      setPasswordResetStatus({ type: 'error', message: 'User session email not identified.' });
      return;
    }
    try {
      await api.post('/auth/reset-password', {
        email,
        newPassword: newProfilePassword,
      });
      setPasswordResetStatus({ type: 'success', message: '✓ Password updated successfully!' });
      setNewProfilePassword('');
    } catch (err) {
      setPasswordResetStatus({ type: 'error', message: err.response?.data?.message || 'Password update failed.' });
    }
  };

  // Metrics calculation
  const allProblems = useMemo(() => {
    if (selectedTrackCategory === 'non-tech') {
      return activeNonTechProblems;
    }
    return TOPICS.flatMap((t) => t.problems);
  }, [selectedTrackCategory, activeNonTechProblems]);

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
    return TOPICS.map((day) => {
      const filtered = day.problems.filter((p) => {
        const matchesSearch =
          !searchQuery ||
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.companies.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesDiff =
          difficultyFilter === 'all' || p.difficulty.toLowerCase() === difficultyFilter.toLowerCase();

        const matchesSaved = !onlySaved || revisionMap[p.id];
        const matchesRev = !onlyRevision || revisionMap[p.id];

        return matchesSearch && matchesDiff && matchesSaved && matchesRev;
      });

      return { ...day, problems: filtered };
    }).filter((day) => day.problems.length > 0);
  }, [searchQuery, difficultyFilter, onlySaved, onlyRevision, revisionMap]);

  // Downloadable notes filtered
  const filteredNotes = useMemo(() => {
    if (!searchQuery) return DOWNLOADABLE_NOTES;
    const q = searchQuery.toLowerCase();
    return DOWNLOADABLE_NOTES.filter(
      (n) => n.title.toLowerCase().includes(q) || n.subtitle.toLowerCase().includes(q) || n.tag.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="dashboard-layout">
      {/* ====================================================================
          1. Left Navigation Sidebar
          ==================================================================== */}
      <aside className={`dashboard-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!isSidebarCollapsed && (
            <Link to="/" className="sidebar-logo">
              <svg width="26" height="26" viewBox="0 0 64 64" aria-hidden="true">
                <rect width="64" height="64" rx="14" fill="#0E1B3D" />
                <path d="M20 44l12-24 12 24" fill="none" stroke="#FFB703" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Strivers</span>
            </Link>
          )}
          <button
            className="sidebar-collapse-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? '›' : '‹'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item-btn ${activeTab === 'dsa' ? 'active' : ''}`}
            onClick={() => setActiveTab('dsa')}
            title="Sheets & Practice Problems"
          >
            <span style={{ fontSize: '1.2rem' }}>📑</span>
            {!isSidebarCollapsed && <span>Sheets</span>}
          </button>

          {!isSidebarCollapsed && activeTab === 'dsa' && (
            <div className="sidebar-subnav">
              <button className="subnav-btn active">DSA Sheet (193 Qs)</button>
              <button className="subnav-btn">DP Sheet (Coming Soon)</button>
              <button className="subnav-btn">Blind 75 Sheet</button>
            </div>
          )}

          <button
            className={`nav-item-btn ${activeTab === 'mentorship' ? 'active' : ''}`}
            onClick={() => setActiveTab('mentorship')}
            title="Live Mentorship & Masterclasses"
          >
            <span style={{ fontSize: '1.2rem' }}>🔴</span>
            {!isSidebarCollapsed && (
              <>
                <span>Live Mentorship</span>
                <span className="nav-item-badge">LIVE</span>
              </>
            )}
          </button>

          <button
            className={`nav-item-btn ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
            title="Downloadable Notes & Cheatsheets"
          >
            <span style={{ fontSize: '1.2rem' }}>📝</span>
            {!isSidebarCollapsed && <span>Downloadable Notes</span>}
          </button>

          <button
            className={`nav-item-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
            title="Profile & Consistency Analytics"
          >
            <span style={{ fontSize: '1.2rem' }}>📊</span>
            {!isSidebarCollapsed && <span>Profile & Stats</span>}
          </button>
        </nav>

        {!isSidebarCollapsed && (
          <div className="sidebar-footer">
            <div className="streak-card-mini" onClick={() => setIsStreakModalOpen(true)}>
              <span style={{ fontSize: '1.6rem' }}>🔥</span>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400E' }}>
                  {userProfile?.streak?.currentStreak || 1}{userProfile?.streak?.currentStreak === 1 ? 'st' : userProfile?.streak?.currentStreak === 2 ? 'nd' : 'th'} Day Streak
                </div>
                <div style={{ fontSize: '0.75rem', color: '#B45309' }}>
                  {userProfile?.streak?.totalActiveDays || 2} days active · Click for details
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ====================================================================
          2. Main Layout Area
          ==================================================================== */}
      <div className="dashboard-main">
        {/* Top Header Bar */}
        <header className="dashboard-topbar">
          <div className="topbar-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder={activeTab === 'notes' ? 'Search study notes, roadmaps, cheatsheets...' : 'Search topics, problems, companies (e.g. Google, Arrays)...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="topbar-actions">
            <button className="streak-pill-btn" onClick={() => setIsStreakModalOpen(true)}>
              <span>🔥</span>
              <span>
                {userProfile?.streak?.currentStreak || 1}{userProfile?.streak?.currentStreak === 1 ? 'st' : userProfile?.streak?.currentStreak === 2 ? 'nd' : 'th'} day streak
              </span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <div className="user-profile-badge">
                <div className="user-avatar-circle">
                  {((userProfile?.name || 'Aditya Sahu').split(' ').map((n) => n[0]).join('') || 'AS').slice(0, 2).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0F172A' }}>
                  {userProfile?.name || 'Aditya Sahu'}
                </span>
              </div>
            </button>

            <Link className="btn btn-ghost" to="/" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
              Home
            </Link>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <div className="dashboard-content-container">
          {/* ================================================================
              VIEW 1: DSA Practice Sheet (Image 1)
              ================================================================ */}
          {activeTab === 'dsa' && (
            <div className="dsa-content-layout">
              {/* Left Main: Problem Accordions & Header */}
              <div className="dsa-sheet-main-column">
                {/* Track Category Selector: Non-Tech Active vs Tech Template */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                  <button
                    className={`sheet-btn ${selectedTrackCategory === 'non-tech' ? 'primary' : ''}`}
                    style={{ padding: '10px 18px', fontSize: '0.95rem', fontWeight: 700 }}
                    onClick={() => setSelectedTrackCategory('non-tech')}
                  >
                    🏢 Non-Tech Operations Mentorship (Active Track)
                  </button>
                  <button
                    className={`sheet-btn ${selectedTrackCategory === 'tech' ? 'primary' : ''}`}
                    style={{ padding: '10px 18px', fontSize: '0.95rem', fontWeight: 700 }}
                    onClick={() => setSelectedTrackCategory('tech')}
                  >
                    💻 Technical SDE Track (Template Mode)
                  </button>
                </div>

                {enrollmentNotice && (
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      marginBottom: 16,
                      fontSize: '0.9rem',
                      lineHeight: 1.5,
                      background:
                        enrollmentNotice.type === 'success'
                          ? '#ECFDF5'
                          : enrollmentNotice.type === 'warning'
                          ? '#FFFBEB'
                          : '#EFF6FF',
                      border: `1px solid ${
                        enrollmentNotice.type === 'success'
                          ? '#A7F3D0'
                          : enrollmentNotice.type === 'warning'
                          ? '#FDE68A'
                          : '#BFDBFE'
                      }`,
                      color:
                        enrollmentNotice.type === 'success'
                          ? '#065F46'
                          : enrollmentNotice.type === 'warning'
                          ? '#92400E'
                          : '#1E40AF',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>{enrollmentNotice.message}</span>
                    <button
                      onClick={() => setEnrollmentNotice(null)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* =======================================================
                    BRANCH 1: NON-TECHNICAL JOB TRACKS
                    Target: Zomato, Blinkit, Hyperpure, District, Porter, Amazon, Flipkart, Swiggy
                    ======================================================= */}
                {selectedTrackCategory === 'non-tech' && (
                  <div>
                    {/* Header */}
                    <div className="sheet-header-card">
                      <div className="breadcrumb">
                        <span>Mentorship Tracks</span>
                        <span>›</span>
                        <span>Non-Technical Operations & Growth</span>
                      </div>

                      <h1 className="sheet-title">Non-Tech Operations & Growth Mentorship</h1>
                      <p className="sheet-subtitle">
                        • Practical Operational Problem Scenarios &nbsp; • Curated for Dark Store, Logistics & Category Management &nbsp; • Interview Guidance for Unicorns
                      </p>

                      {/* Marquee & Placement Notice */}
                      <div style={{ margin: '14px 0' }}>
                        <CompanyMarquee />
                        <div style={{ marginTop: 10 }}>
                          <PlacementDisclaimer compact />
                        </div>
                      </div>

                      {/* Quota & Access Status */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F1F5F9', padding: '10px 16px', borderRadius: 8, marginTop: 14 }}>
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>Practice Sheet Quota:</strong>{' '}
                          <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                            {userEnrolledSheets.length} / 2 Enrolled (Limited Practice Sheet Access Granted per User)
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#DBEAFE', color: '#1E40AF', padding: '3px 8px', borderRadius: 99 }}>
                          {userEnrolledSheets.length >= 2 ? 'Quota Reached' : `${2 - userEnrolledSheets.length} Slots Available`}
                        </span>
                      </div>

                      {/* Practice Sheet Selector Cards */}
                      <div style={{ marginTop: 16 }}>
                        <h3 style={{ fontSize: '1.05rem', margin: '0 0 10px', color: '#0E1B3D' }}>Select Job Role Practice Sheet</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                          {nonTechSheets.map((sheet) => {
                            const isEnrolled = userEnrolledSheets.some((s) => s.sheetId === sheet.sheetId);
                            const isSelected = activeSheetId === sheet.sheetId;
                            const isFree = sheet.price === 0 || sheet.isFree;

                            return (
                              <div
                                key={sheet.sheetId}
                                onClick={() => setActiveSheetId(sheet.sheetId)}
                                style={{
                                  padding: 14,
                                  borderRadius: 10,
                                  border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                                  background: isSelected ? '#EFF6FF' : '#FFFFFF',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  gap: 8,
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <span
                                      style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        padding: '2px 8px',
                                        borderRadius: 99,
                                        background: isFree ? '#DCFCE7' : '#FEF3C7',
                                        color: isFree ? '#16A34A' : '#D97706',
                                      }}
                                    >
                                      {isFree ? '₹0.00 Free Enrollment' : `₹${sheet.price.toFixed(2)} Paid Track`}
                                    </span>
                                    {isEnrolled && (
                                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB' }}>
                                        ✓ Enrolled
                                      </span>
                                    )}
                                  </div>
                                  <strong style={{ fontSize: '0.95rem', color: '#0F172A', lineHeight: 1.3 }}>{sheet.title}</strong>
                                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 4 }}>{sheet.targetRole}</div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                                    {(sheet.targetCompanies || []).slice(0, 4).map((comp) => (
                                      <span key={comp} className="company-badge" style={{ fontSize: '0.72rem' }}>
                                        {comp}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                                  {isEnrolled ? (
                                    <button
                                      className="sheet-btn primary"
                                      style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveSheetId(sheet.sheetId);
                                      }}
                                    >
                                      ✓ Continue Practice
                                    </button>
                                  ) : isFree ? (
                                    <button
                                      className="sheet-btn primary"
                                      style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEnrollPracticeSheet(sheet);
                                      }}
                                    >
                                      Enroll for Free (₹0.00)
                                    </button>
                                  ) : (
                                    <button
                                      className="sheet-btn"
                                      style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEnrollPracticeSheet(sheet);
                                      }}
                                    >
                                      Unlock for ₹{sheet.price.toFixed(2)}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Active Non-Tech Sheet Details & Scenarios Accordion */}
                    {activeNonTechSheet && (
                      <div style={{ marginTop: 24 }}>
                        <div style={{ padding: '16px 20px', background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 20 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                            <div>
                              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2563EB', textTransform: 'uppercase' }}>
                                Active Practice Curriculum
                              </div>
                              <h2 style={{ margin: '4px 0', fontSize: '1.4rem', color: '#0E1B3D' }}>{activeNonTechSheet.title}</h2>
                              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748B' }}>{activeNonTechSheet.description}</p>
                            </div>
                            <div>
                              {isUserEnrolledInActiveSheet ? (
                                <button className="sheet-btn primary" style={{ cursor: 'default' }}>
                                  ✓ Start Learning
                                </button>
                              ) : (
                                <button
                                  className="sheet-btn primary"
                                  onClick={() => handleEnrollPracticeSheet(activeNonTechSheet)}
                                >
                                  {activeNonTechSheet.price === 0 ? 'Enroll for Free (₹0.00)' : `Unlock for ₹${activeNonTechSheet.price.toFixed(2)}`}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Topics and Problems for Active Non-Tech Sheet */}
                        <div className="days-accordion-list">
                          {filteredNonTechTopics.map((topic, topicIdx) => {
                            const topicKey = `topic-${topic.topicId || topicIdx}`;
                            const isOpen = openDays[topicKey] !== false; // open by default

                            return (
                              <div key={topicKey} className={`day-accordion-card ${isOpen ? 'open' : ''}`}>
                                <div className="day-accordion-header" onClick={() => toggleDayAccordion(topicKey)}>
                                  <div className="day-title-group">
                                    <span style={{ fontSize: '1.1rem' }}>{isOpen ? '📂' : '📁'}</span>
                                    <div>
                                      <span className="day-title-text">{topic.topicTitle}</span>
                                      {topic.summary && (
                                        <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 400 }}>{topic.summary}</div>
                                      )}
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span className="day-progress-pill">
                                      {topic.problems.filter((p) => solvedMap[p.id]).length}/{topic.problems.length}
                                    </span>
                                    <span style={{ fontSize: '0.9rem', color: '#64748B' }}>{isOpen ? '▲' : '▼'}</span>
                                  </div>
                                </div>

                                {isOpen && (
                                  <div className="problems-table-wrapper">
                                    <table className="problems-table">
                                      <thead>
                                        <tr>
                                          <th style={{ width: 44 }}>Status</th>
                                          <th>Interview Scenario</th>
                                          <th style={{ width: 110 }}>Company</th>
                                          <th style={{ width: 90 }}>Level</th>
                                          <th style={{ width: 130 }}>Domain Type</th>
                                          <th style={{ width: 120, textAlign: 'center' }}>Guidance</th>
                                          <th style={{ width: 50, textAlign: 'center' }}>Notes</th>
                                          <th style={{ width: 50, textAlign: 'center' }}>Revise</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {topic.problems.map((problem) => {
                                          const isSolved = !!solvedMap[problem.id];
                                          const isRev = !!revisionMap[problem.id];
                                          const hasNote = !!notesMap[problem.id];

                                          return (
                                            <tr key={problem.id} className={isSolved ? 'solved-row' : ''}>
                                              <td>
                                                <div
                                                  className={`custom-checkbox ${isSolved ? 'checked' : ''}`}
                                                  onClick={() => toggleSolve(problem.id)}
                                                  title={isSolved ? 'Mark as Unsolved' : 'Mark as Solved'}
                                                >
                                                  {isSolved ? '✓' : ''}
                                                </div>
                                              </td>
                                              <td>
                                                <strong style={{ color: isSolved ? '#047857' : '#0F172A', cursor: 'pointer' }} onClick={() => setActiveScenarioModal(problem)}>
                                                  {problem.title}
                                                </strong>
                                                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 2 }}>
                                                  {problem.scenario.slice(0, 90)}...
                                                </div>
                                              </td>
                                              <td>
                                                <span className="company-badge" style={{ fontWeight: 700 }}>
                                                  {problem.company}
                                                </span>
                                              </td>
                                              <td>
                                                <span className={`diff-pill ${problem.difficulty.toLowerCase()}`}>
                                                  {problem.difficulty}
                                                </span>
                                              </td>
                                              <td>
                                                <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                                                  {problem.type}
                                                </span>
                                              </td>
                                              <td style={{ textAlign: 'center' }}>
                                                <button
                                                  className="sheet-btn primary"
                                                  style={{ padding: '3px 8px', fontSize: '0.78rem' }}
                                                  onClick={() => setActiveScenarioModal(problem)}
                                                >
                                                  View Solution →
                                                </button>
                                              </td>
                                              <td style={{ textAlign: 'center' }}>
                                                <button
                                                  onClick={() => openNoteModal(problem)}
                                                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: hasNote ? '#2563EB' : '#94A3B8' }}
                                                  title={hasNote ? 'Edit note' : 'Add note'}
                                                >
                                                  {hasNote ? '📝' : '✏️'}
                                                </button>
                                              </td>
                                              <td style={{ textAlign: 'center' }}>
                                                <button
                                                  onClick={() => toggleRevision(problem.id)}
                                                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: isRev ? '#F59E0B' : '#CBD5E1' }}
                                                  title={isRev ? 'Starred for Revision' : 'Star for Revision'}
                                                >
                                                  ★
                                                </button>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* =======================================================
                    BRANCH 2: TECHNICAL SDE TRACK (TEMPLATE MODE)
                    Preserved for Technical Background Users
                    ======================================================= */}
                {selectedTrackCategory === 'tech' && (
                  <div>
                    {/* Template Notice */}
                    <div
                      style={{
                        padding: '14px 18px',
                        background: '#FEF3C7',
                        border: '1px solid #FDE68A',
                        borderRadius: 10,
                        color: '#92400E',
                        marginBottom: 20,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>ℹ️</span>
                      <div>
                        <strong style={{ fontSize: '0.95rem' }}>Technical SDE Master Preparation Sheet (Template Mode)</strong>
                        <div style={{ fontSize: '0.85rem', color: '#B45309', marginTop: 2 }}>
                          This 193-problem Data Structures & Algorithms curriculum is preserved as a structured reference template for technical candidates.
                        </div>
                      </div>
                    </div>

                    <div className="sheet-header-card">
                      <div className="breadcrumb">
                        <span>Technical Track</span>
                        <span>›</span>
                        <span>SDE Master Preparation Template</span>
                      </div>

                      <h1 className="sheet-title">SDE Sheet - Most Important Interview Questions (Template)</h1>
                      <p className="sheet-subtitle">
                        • Preserved Technical DSA curriculum &nbsp; • All DSA topics covered &nbsp; • Real interview patterns
                      </p>

                      <div className="sheet-action-btns">
                        <button className="sheet-btn" onClick={() => setIsGroupStudyModalOpen(true)}>
                          <span>👥</span>
                          <span>Group Study</span>
                        </button>
                        <button
                          className={`sheet-btn ${onlySaved ? 'primary' : ''}`}
                          onClick={() => setOnlySaved(!onlySaved)}
                        >
                          <span>🔖</span>
                          <span>{onlySaved ? 'Show All Questions' : 'Saved Questions'}</span>
                        </button>
                      </div>

                      {/* Level & Revision Filter Pills */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>Level:</span>
                        {['all', 'easy', 'medium', 'hard'].map((diff) => (
                          <button
                            key={diff}
                            className={`sheet-btn ${difficultyFilter === diff ? 'primary' : ''}`}
                            style={{ padding: '4px 10px', fontSize: '0.8rem', textTransform: 'capitalize' }}
                            onClick={() => setDifficultyFilter(diff)}
                          >
                            {diff}
                          </button>
                        ))}
                        <button
                          className={`sheet-btn ${onlyRevision ? 'primary' : ''}`}
                          style={{ padding: '4px 10px', fontSize: '0.8rem', marginLeft: 'auto' }}
                          onClick={() => setOnlyRevision(!onlyRevision)}
                        >
                          ★ {onlyRevision ? 'Showing Starred' : 'Filter Revision Starred'}
                        </button>
                      </div>
                    </div>

                    {/* Day by Day Accordions (Preserved 193 questions) */}
                    <div className="days-accordion-list">
                      {filteredTopics.map((day) => {
                        const isOpen = !!openDays[day.id];
                        const daySolved = day.problems.filter((p) => solvedMap[p.id]).length;
                        const isCompleted = daySolved === day.problems.length && day.problems.length > 0;

                        return (
                          <div key={day.id} className={`day-accordion-card ${isOpen ? 'open' : ''}`}>
                            <div className="day-accordion-header" onClick={() => toggleDayAccordion(day.id)}>
                              <div className="day-title-group">
                                <span style={{ fontSize: '1.1rem' }}>{isOpen ? '📂' : '📁'}</span>
                                <span className="day-title-text">{day.title}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span className={`day-progress-pill ${isCompleted ? 'completed' : ''}`}>
                                  {daySolved}/{day.problems.length}
                                </span>
                                <span style={{ fontSize: '0.9rem', color: '#64748B' }}>{isOpen ? '▲' : '▼'}</span>
                              </div>
                            </div>

                            {isOpen && (
                              <div className="problems-table-wrapper">
                                <table className="problems-table">
                                  <thead>
                                    <tr>
                                      <th style={{ width: 44 }}>Status</th>
                                      <th>Problem</th>
                                      <th style={{ width: 80, textAlign: 'center' }}>Editorial</th>
                                      <th style={{ width: 80, textAlign: 'center' }}>Practice</th>
                                      <th style={{ width: 90 }}>Level</th>
                                      <th style={{ width: 60, textAlign: 'center' }}>Notes</th>
                                      <th>Companies</th>
                                      <th style={{ width: 50, textAlign: 'center' }}>Revise</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {day.problems.map((problem) => {
                                      const isSolved = !!solvedMap[problem.id];
                                      const isRev = !!revisionMap[problem.id];
                                      const hasNote = !!notesMap[problem.id];

                                      return (
                                        <tr key={problem.id} className={isSolved ? 'solved-row' : ''}>
                                          <td>
                                            <div
                                              className={`custom-checkbox ${isSolved ? 'checked' : ''}`}
                                              onClick={() => toggleSolve(problem.id)}
                                              title={isSolved ? 'Mark as Unsolved' : 'Mark as Solved'}
                                            >
                                              {isSolved ? '✓' : ''}
                                            </div>
                                          </td>
                                          <td>
                                            <a
                                              href={problem.practiceUrl}
                                              target="_blank"
                                              rel="noreferrer"
                                              style={{
                                                fontWeight: 600,
                                                color: isSolved ? '#047857' : '#0F172A',
                                                textDecoration: 'none',
                                              }}
                                            >
                                              {problem.title}
                                            </a>
                                          </td>
                                          <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                                              <a className="action-icon-link" href={problem.articleUrl} target="_blank" rel="noreferrer" title="Article">📄</a>
                                              <a className="action-icon-link" href={problem.videoUrl} target="_blank" rel="noreferrer" title="Video">▶️</a>
                                            </div>
                                          </td>
                                          <td style={{ textAlign: 'center' }}>
                                            <a
                                              href={problem.practiceUrl}
                                              target="_blank"
                                              rel="noreferrer"
                                              style={{ fontSize: '0.8rem', fontWeight: 700, padding: '2px 8px', background: '#F1F5F9', borderRadius: 4, color: '#2563EB', textDecoration: 'none' }}
                                            >
                                              Solve ↗
                                            </a>
                                          </td>
                                          <td>
                                            <span className={`diff-pill ${problem.difficulty.toLowerCase()}`}>
                                              {problem.difficulty}
                                            </span>
                                          </td>
                                          <td style={{ textAlign: 'center' }}>
                                            <button
                                              onClick={() => openNoteModal(problem)}
                                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: hasNote ? '#2563EB' : '#94A3B8' }}
                                              title={hasNote ? 'Edit note' : 'Add note'}
                                            >
                                              {hasNote ? '📝' : '✏️'}
                                            </button>
                                          </td>
                                          <td>
                                            <div className="company-badges-cell">
                                              {problem.companies.slice(0, 3).map((comp) => (
                                                <span key={comp} className="company-badge">{comp}</span>
                                              ))}
                                              {problem.companies.length > 3 && (
                                                <span className="company-badge" style={{ color: '#64748B' }}>+{problem.companies.length - 3}</span>
                                              )}
                                            </div>
                                          </td>
                                          <td style={{ textAlign: 'center' }}>
                                            <button
                                              onClick={() => toggleRevision(problem.id)}
                                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: isRev ? '#F59E0B' : '#CBD5E1' }}
                                              title={isRev ? 'Starred for Revision' : 'Star for Revision'}
                                            >
                                              ★
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Sidebar: Progress Gauge & Streak Calendar */}
              <aside className="dsa-right-sidebar">
                {/* Total Progress Card */}
                <div className="progress-overview-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: '1.4rem' }}>🚀</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0E1B3D' }}>
                        {progressPercent > 0 ? "You're making great progress!" : "Let's get started!"}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                        {totalProblemsCount - totalSolvedCount} questions left to solve
                      </div>
                    </div>
                  </div>

                  <div className="progress-gauge-box">
                    <div className="gauge-svg-wrap">
                      <svg width="80" height="80" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#E2E8F0"
                          strokeWidth="3.5"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#2563EB"
                          strokeWidth="3.5"
                          strokeDasharray={`${progressPercent}, 100`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="gauge-center-text">{progressPercent}%</span>
                    </div>

                    <div className="gauge-label-group">
                      <h4>Total Progress</h4>
                      <p>
                        <strong>{totalSolvedCount}</strong> / {totalProblemsCount} Solved
                      </p>
                    </div>
                  </div>

                  {/* Difficulty breakdown */}
                  <div className="diff-bars-list">
                    <div className="diff-bar-item">
                      <div className="diff-bar-header">
                        <span style={{ color: '#16A34A' }}>Easy</span>
                        <span>
                          {easySolved} / {easyProblems.length}
                        </span>
                      </div>
                      <div className="diff-bar-track">
                        <div
                          className="diff-bar-fill easy"
                          style={{ width: `${(easySolved / (easyProblems.length || 1)) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="diff-bar-item">
                      <div className="diff-bar-header">
                        <span style={{ color: '#D97706' }}>Medium</span>
                        <span>
                          {mediumSolved} / {mediumProblems.length}
                        </span>
                      </div>
                      <div className="diff-bar-track">
                        <div
                          className="diff-bar-fill medium"
                          style={{ width: `${(mediumSolved / (mediumProblems.length || 1)) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="diff-bar-item">
                      <div className="diff-bar-header">
                        <span style={{ color: '#DC2626' }}>Hard</span>
                        <span>
                          {hardSolved} / {hardProblems.length}
                        </span>
                      </div>
                      <div className="diff-bar-track">
                        <div
                          className="diff-bar-fill hard"
                          style={{ width: `${(hardSolved / (hardProblems.length || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Streak Calendar Mini Widget */}
                <div className="streak-calendar-card">
                  <div className="calendar-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>🔥</span>
                      <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>1st Day Streak</strong>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#64748B' }}>October 2026</span>
                  </div>

                  <div className="calendar-grid">
                    <div className="calendar-day-label">Su</div>
                    <div className="calendar-day-label">Mo</div>
                    <div className="calendar-day-label">Tu</div>
                    <div className="calendar-day-label">We</div>
                    <div className="calendar-day-label">Th</div>
                    <div className="calendar-day-label">Fr</div>
                    <div className="calendar-day-label">Sa</div>

                    {/* Dummy month days */}
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                      const isActiveStreak = day === 2 || day === 19;
                      const isToday = day === 20;

                      return (
                        <div
                          key={day}
                          className={`calendar-date-cell ${isActiveStreak ? 'active-streak' : ''} ${isToday ? 'today' : ''}`}
                          onClick={() => setIsStreakModalOpen(true)}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>

                  <div className="calendar-footer-link" onClick={() => setIsStreakModalOpen(true)}>
                    <span>Total Active Days: 2</span>
                    <span>View Details ›</span>
                  </div>
                </div>
              </aside>
            </div>
          )}

          {/* ================================================================
              VIEW 2: Live Mentorship Sessions & Attendance (Requested feature)
              ================================================================ */}
          {activeTab === 'mentorship' && (
            <div className="mentorship-container">
              {/* Live Session Hero Card */}
              <div className="live-hero-card">
                <div className="live-pulse-badge">
                  <div className="live-pulse-dot" />
                  <span>UPCOMING SUNDAY MASTERCLASS</span>
                </div>

                <h2 className="live-hero-title">{LIVE_MENTORSHIP.nextSession.title}</h2>
                <p className="live-hero-desc">
                  Join industry leaders from <strong>Zomato, Blinkit, and Porter</strong> for a high-intensity 2.5-hour live session. Get your ATS resume roasted live, practice real mock interview questions, and learn hiring secrets.
                </p>

                {/* Countdown Timer */}
                <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '1.4rem', fontWeight: 800 }}>{String(countdown.hours).padStart(2, '0')}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Hours</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '1.4rem', fontWeight: 800 }}>{String(countdown.minutes).padStart(2, '0')}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Minutes</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '1.4rem', fontWeight: 800, color: '#38BDF8' }}>{String(countdown.seconds).padStart(2, '0')}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Seconds</div>
                  </div>
                </div>

                {/* Mentors Row */}
                <div className="mentors-row-grid">
                  {LIVE_MENTORSHIP.nextSession.mentors.map((m) => (
                    <div key={m.name} className="mentor-card-bubble">
                      <img src={m.avatar} alt={m.name} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{m.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{m.role}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                  <a
                    className="live-join-btn"
                    href={LIVE_MENTORSHIP.nextSession.meetUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>🎥</span>
                    <span>Join Live Mentorship Room (Google Meet)</span>
                  </a>
                  <button
                    className="sheet-btn"
                    style={{ background: 'rgba(255,255,255,0.12)', color: '#FFF', borderColor: 'rgba(255,255,255,0.2)' }}
                    onClick={() => alert(`Meeting Code: ${LIVE_MENTORSHIP.nextSession.roomCode}\nDirect Link: ${LIVE_MENTORSHIP.nextSession.meetUrl}`)}
                  >
                    📋 Copy Meeting Link
                  </button>
                </div>
              </div>

              {/* Continuous Loop Company Logo Marquee Ribbon */}
              <CompanyMarquee title="Organizations Where Our Online Session Mentors Have Worked" />

              {/* Placement Guidance Disclaimer */}
              <PlacementDisclaimer />

              {/* Agenda & Schedule */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
                {/* Agenda */}
                <div className="agenda-card">
                  <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem' }}>Masterclass Live Agenda</h3>
                  <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
                    Every minute is engineered to maximize your placement conversion rate.
                  </p>

                  <div className="timeline-list">
                    {LIVE_MENTORSHIP.nextSession.agenda.map((item, idx) => (
                      <div key={idx} className="timeline-item">
                        <div className="timeline-time-badge">{item.time}</div>
                        <div style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.5 }}>{item.topic}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weekly Schedule & 1-on-1 Mock Booking */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div className="agenda-card">
                    <h3 style={{ margin: '0 0 14px', fontSize: '1.15rem' }}>Weekly Live Timetable</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {LIVE_MENTORSHIP.weeklySchedule.map((s, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '12px',
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: 8,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <strong style={{ fontSize: '0.9rem', color: '#0E1B3D' }}>{s.day}</strong>
                            <span style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 600 }}>{s.time}</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#475569' }}>{s.title}</div>
                          <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: 4 }}>Mentor: {s.mentor}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
                      border: '1px solid #F59E0B',
                      borderRadius: 14,
                      padding: 20,
                    }}
                  >
                    <h4 style={{ margin: '0 0 6px', color: '#92400E' }}>Need 1-on-1 Personalized Mentorship?</h4>
                    <p style={{ margin: '0 0 14px', fontSize: '0.88rem', color: '#B45309' }}>
                      Schedule a private 45-minute technical mock interview or resume roast with a mentor.
                    </p>
                    <button
                      className="sheet-btn primary"
                      style={{ background: '#B45309', borderColor: '#B45309' }}
                      onClick={() => alert('1-on-1 slot booking opens after this Sunday live masterclass!')}
                    >
                      Book 1-on-1 Slot →
                    </button>
                  </div>
                </div>
              </div>

              {/* Past Recorded Masterclasses */}
              <div>
                <h3 style={{ fontSize: '1.35rem', marginBottom: 4 }}>Recorded Masterclasses & Resource Vault</h3>
                <p className="muted" style={{ margin: '0 0 16px', fontSize: '0.9rem' }}>
                  Missed a live session? Re-watch in 1080p with complete transcripts, code snippets, and notes.
                </p>

                <div className="recordings-grid">
                  {LIVE_MENTORSHIP.recordedSessions.map((rec) => (
                    <div key={rec.id} className="recording-card">
                      <div className="recording-thumb">
                        <img src={rec.thumbnail} alt={rec.title} />
                        <div className="recording-play-overlay">
                          <a href={rec.recordingUrl} target="_blank" rel="noreferrer" className="play-circle">
                            ▶
                          </a>
                        </div>
                      </div>
                      <div className="recording-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563EB' }}>{rec.duration}</span>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{rec.recordedDate}</span>
                        </div>
                        <h4 style={{ margin: '0 0 8px', fontSize: '0.98rem', color: '#0E1B3D', flex: 1 }}>{rec.title}</h4>
                        <div style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: 12 }}>Mentor: {rec.mentor}</div>
                        <a
                          className="sheet-btn"
                          href={rec.recordingUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ textAlign: 'center', width: '100%', justifyContent: 'center' }}
                        >
                          Watch Recording ↗
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              VIEW 3: Downloadable Notes & Cheat Sheets (Image 2)
              ================================================================ */}
          {activeTab === 'notes' && (
            <div>
              <div className="notes-page-header">
                <div className="breadcrumb">
                  <span>DSA Sheet</span>
                  <span>›</span>
                  <span>Study Material</span>
                </div>
                <h1 style={{ fontFamily: 'var(--display)', fontSize: '2.1rem', margin: '0 0 6px' }}>
                  Downloadable Notes
                </h1>
                <p className="muted" style={{ margin: 0 }}>
                  Browse curated high-yield engineering resources, handwritten notes, PDFs, cheatsheets, and roadmaps.
                </p>
              </div>

              <div className="notes-grid">
                {filteredNotes.map((note) => (
                  <div key={note.id} className="note-card">
                    <div className="note-card-banner">
                      <span className="note-card-badge">{note.tag}</span>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '2.6rem' }}>📚</span>
                      </div>
                    </div>

                    <div className="note-card-body">
                      <h3 className="note-card-title">{note.title}</h3>
                      <p className="note-card-subtitle">{note.subtitle}</p>

                      <div className="note-card-footer">
                        <span className="note-file-count">
                          {note.filesCount} {note.filesCount === 1 ? 'File' : 'Files'}
                        </span>
                        <button
                          className="note-view-link"
                          onClick={() => setSelectedNoteFile(note)}
                          style={{ background: 'none', border: 'none', padding: 0 }}
                        >
                          <span>View File</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================
              VIEW 4: Profile & Analytics Dashboard (Image 3)
              ================================================================ */}
          {activeTab === 'analytics' && (
            <div className="analytics-grid-layout">
              {/* Main Column */}
              <div>
                {/* Greeting Hero */}
                <div className="profile-hero-banner">
                  <div>
                    <h2 className="profile-hero-title">Hi, Aditya Sahu</h2>
                    <p className="profile-hero-desc">
                      Track your placement preparation, inspect topic weaknesses, maintain daily problem streaks, and unlock consistency badges.
                    </p>
                  </div>
                  <div style={{ fontSize: '3.6rem' }}>🎯</div>
                </div>

                {/* Submissions Heatmap */}
                <div className="heatmap-card">
                  <div className="heatmap-header">
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem' }}>All Submissions Heatmap</h3>
                      <span style={{ fontSize: '0.85rem', color: '#16A34A', fontWeight: 600 }}>
                        458 submissions in this year
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                      <span>Total active days: <strong>244</strong></span> &nbsp;•&nbsp;
                      <span>Max streak: <strong>105 days</strong></span>
                    </div>
                  </div>

                  {/* Heatmap Grid */}
                  <div className="heatmap-grid-scroll">
                    <div className="heatmap-matrix">
                      {Array.from({ length: 364 }, (_, i) => {
                        const rand = Math.sin(i * 13) + Math.cos(i * 7);
                        let level = 'level-0';
                        if (rand > 1.2) level = 'level-4';
                        else if (rand > 0.6) level = 'level-3';
                        else if (rand > 0.1) level = 'level-2';
                        else if (rand > -0.4) level = 'level-1';

                        return (
                          <div
                            key={i}
                            className={`heatmap-cell ${level}`}
                            title={`Day ${i + 1}: ${level !== 'level-0' ? Math.floor(Math.abs(rand * 4)) + 1 : 0} problems solved`}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, fontSize: '0.75rem', color: '#64748B', marginTop: 10 }}>
                    <span>Less</span>
                    <div className="heatmap-cell" />
                    <div className="heatmap-cell level-1" />
                    <div className="heatmap-cell level-2" />
                    <div className="heatmap-cell level-3" />
                    <div className="heatmap-cell level-4" />
                    <span>More</span>
                  </div>
                </div>

                {/* Consistency Badges */}
                <div className="heatmap-card">
                  <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem' }}>Consistency Badges</h3>
                  <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
                    Earn streak trophies by solving at least one interview problem every single day.
                  </p>

                  <div className="badges-row">
                    <div className="badge-item">
                      <div className="badge-icon">🔥</div>
                      <div className="badge-name">7 Days Bronze</div>
                      <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>Unlocked ✓</span>
                    </div>

                    <div className="badge-item">
                      <div className="badge-icon">⚡</div>
                      <div className="badge-name">21 Days Silver</div>
                      <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>Unlocked ✓</span>
                    </div>

                    <div className="badge-item">
                      <div className="badge-icon">⭐</div>
                      <div className="badge-name">50 Days Gold</div>
                      <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>Unlocked ✓</span>
                    </div>

                    <div className="badge-item">
                      <div className="badge-icon">🏆</div>
                      <div className="badge-name">100 Days Legend</div>
                      <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600 }}>In Progress (105d)</span>
                    </div>
                  </div>
                </div>

                {/* 1. My Enrolled Courses & Permanent Lifetime Access */}
                <div className="heatmap-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0E1B3D' }}>
                        🎓 Lifetime Enrolled Courses & Payment Receipts
                      </h3>
                      <p className="muted" style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>
                        Permanent lifetime course access granted on verified payment. Transaction & Reference details stored for permanent recovery.
                      </p>
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: '#DCFCE7', color: '#15803D' }}>
                      Permanent Access Active
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {userEnrolledCourses && userEnrolledCourses.length > 0 ? (
                      userEnrolledCourses.map((c, idx) => (
                        <div
                          key={c.orderId || idx}
                          style={{
                            padding: '16px',
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                            <div>
                              <strong style={{ fontSize: '1.02rem', color: '#0E1B3D' }}>
                                {c.courseTitle || c.courseId?.toUpperCase() || 'Full Mentorship Program'}
                              </strong>
                              <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                                Enrolled: {c.paidAt ? new Date(c.paidAt).toLocaleString() : 'Permanent Lifetime'}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <span style={{ background: '#DCFCE7', color: '#16A34A', fontWeight: 700, padding: '3px 8px', borderRadius: 6, fontSize: '0.75rem' }}>
                                ✓ Lifetime Access
                              </span>
                              <span style={{ background: '#EFF6FF', color: '#2563EB', fontWeight: 700, padding: '3px 8px', borderRadius: 6, fontSize: '0.75rem' }}>
                                Paid: ₹{c.amount || 2999}
                              </span>
                            </div>
                          </div>

                          {/* Txn ID, Ref ID, and Order Audit Info */}
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                              gap: 10,
                              background: '#FFFFFF',
                              padding: '10px 14px',
                              borderRadius: 8,
                              border: '1px dashed #CBD5E1',
                              fontSize: '0.82rem',
                            }}
                          >
                            <div>
                              <span style={{ color: '#64748B' }}>Txn. ID:</span>{' '}
                              <code style={{ color: '#0F172A', fontWeight: 700 }}>{c.paymentId || 'pay_verified_permanent'}</code>
                            </div>
                            <div>
                              <span style={{ color: '#64748B' }}>Ref. ID:</span>{' '}
                              <code style={{ color: '#0F172A', fontWeight: 700 }}>{c.referenceId || c.orderId || 'ref_permanent'}</code>
                            </div>
                            <div>
                              <span style={{ color: '#64748B' }}>Order ID:</span>{' '}
                              <code style={{ color: '#0F172A', fontWeight: 700 }}>{c.orderId || 'ord_system'}</code>
                            </div>
                            <div>
                              <span style={{ color: '#64748B' }}>Linked Email:</span>{' '}
                              <strong style={{ color: '#2563EB' }}>{userAuthData?.email || userProfile?.email || 'Active Account'}</strong>
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <Link to="/products" className="sheet-btn primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                              Continue Learning →
                            </Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div
                        style={{
                          padding: '16px',
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: 10,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 10,
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '0.98rem', color: '#0E1B3D' }}>
                            {userAuthData?.hasActiveAccess ? 'Unicorn Placement Mentorship (Permanent Access)' : 'Explore Our Placement Mentorship Programs'}
                          </strong>
                          <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: 2 }}>
                            {userAuthData?.hasActiveAccess
                              ? 'Your account has permanent active membership access. Lifetime curriculum unlocked.'
                              : 'Unlock 1-on-1 resume reviews, mock interviews, and live offline hiring days.'}
                          </div>
                        </div>
                        <Link to="/products" className="sheet-btn primary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
                          {userAuthData?.hasActiveAccess ? '✓ Continue Learning' : 'Explore Courses & Pricing →'}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Limited Practice Sheet Quota & Enrolled Sheets */}
                <div className="heatmap-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0E1B3D' }}>
                        📋 Enrolled Practice Sheets (Quota: {userEnrolledSheets.length} / {userAuthData?.maxPracticeSheetsAllowed || 2} Allowed)
                      </h3>
                      <p className="muted" style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>
                        Only limited practice sheet access is granted per user. Only sheets with ₹0.00 access fee are free to enroll.
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 99,
                        background: userEnrolledSheets.length >= (userAuthData?.maxPracticeSheetsAllowed || 2) ? '#FEF3C7' : '#DCFCE7',
                        color: userEnrolledSheets.length >= (userAuthData?.maxPracticeSheetsAllowed || 2) ? '#B45309' : '#15803D',
                      }}
                    >
                      {userEnrolledSheets.length} of {userAuthData?.maxPracticeSheetsAllowed || 2} Enrolled
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {userEnrolledSheets && userEnrolledSheets.length > 0 ? (
                      userEnrolledSheets.map((sheet, idx) => (
                        <div
                          key={sheet.sheetId || idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '14px 18px',
                            background: '#F8FAFC',
                            borderRadius: 10,
                            border: '1px solid #E2E8F0',
                            flexWrap: 'wrap',
                            gap: 10,
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <strong style={{ fontSize: '0.98rem', color: '#0F172A' }}>{sheet.sheetTitle || sheet.sheetId}</strong>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#DCFCE7', color: '#16A34A', padding: '2px 8px', borderRadius: 99 }}>
                                ₹0.00 Free Enrollment
                              </span>
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: 4 }}>
                              Role Track: <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{sheet.roleType || 'Non-Technical'}</span> · Enrolled on {sheet.enrolledAt ? new Date(sheet.enrolledAt).toLocaleDateString() : 'Active'}
                            </div>
                          </div>

                          <button
                            className="sheet-btn primary"
                            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                            onClick={() => {
                              setActiveSheetId(sheet.sheetId);
                              setSelectedTrackCategory(sheet.roleType || 'non-tech');
                              setActiveTab('dsa');
                            }}
                          >
                            ✓ Continue Practice →
                          </button>
                        </div>
                      ))
                    ) : (
                      <div
                        style={{
                          padding: '16px',
                          textAlign: 'center',
                          background: '#F8FAFC',
                          borderRadius: 8,
                          border: '1px dashed #CBD5E1',
                        }}
                      >
                        <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#64748B' }}>
                          You have not enrolled in any practice sheets yet. You can enroll in up to 2 practice sheets for ₹0.00 free!
                        </p>
                        <button
                          className="sheet-btn primary"
                          style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                          onClick={() => {
                            setActiveTab('dsa');
                            setSelectedTrackCategory('non-tech');
                          }}
                        >
                          Explore Practice Sheets →
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. In-Profile Password Reset Mechanism */}
                <div className="heatmap-card">
                  <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem', color: '#0E1B3D' }}>
                    🔒 In-Profile Password Reset Mechanism
                  </h3>
                  <p className="muted" style={{ margin: '0 0 14px', fontSize: '0.85rem' }}>
                    Quickly update your account login credentials directly from your profile dashboard.
                  </p>

                  <form onSubmit={handleInProfilePasswordReset} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 450 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter your new secure password (min 4 chars)"
                        value={newProfilePassword}
                        onChange={(e) => setNewProfilePassword(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: '1px solid #CBD5E1',
                          fontSize: '0.9rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    {passwordResetStatus && (
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: 8,
                          fontSize: '0.85rem',
                          background: passwordResetStatus.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                          border: `1px solid ${passwordResetStatus.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
                          color: passwordResetStatus.type === 'success' ? '#065F46' : '#991B1B',
                        }}
                      >
                        {passwordResetStatus.message}
                      </div>
                    )}

                    <div>
                      <button type="submit" className="sheet-btn primary" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
                        Update Password Now
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Profile Sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Personal Profile Card */}
                <div className="progress-overview-card">
                  <div style={{ textAlign: 'center', paddingBottom: 16, borderBottom: '1px solid #F1F5F9' }}>
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        background: '#2563EB',
                        color: '#FFF',
                        fontSize: '1.8rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px',
                      }}
                    >
                      {((userAuthData?.name || userProfile?.name || 'User').split(' ').map((n) => n[0]).join('') || 'US').slice(0, 2).toUpperCase()}
                    </div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem' }}>
                      {userAuthData?.name || userProfile?.name || 'Verified User'}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                      {userAuthData?.email || userProfile?.email || 'user@strivers.in'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 600, marginTop: 4 }}>
                      {userAuthData?.isPermanent || userEnrolledCourses.length > 0
                        ? '✓ Permanent Lifetime Member'
                        : userAuthData?.role === 'admin'
                        ? '🛡️ Platform Admin'
                        : 'Practice Dashboard Free User'}
                    </div>
                  </div>

                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="muted">User ID</span>
                      <code style={{ fontSize: '0.8rem', color: '#0F172A' }}>
                        {(userAuthData?.uid || 'usr_client').slice(0, 16)}...
                      </code>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="muted">Account Role</span>
                      <strong style={{ textTransform: 'capitalize' }}>{userAuthData?.role || 'User'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="muted">Target Unicorns</span>
                      <strong style={{ textAlign: 'right' }}>
                        Zomato, Blinkit, Swiggy, Porter
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="muted">Practice Quota</span>
                      <strong>
                        {userEnrolledSheets.length} / {userAuthData?.maxPracticeSheetsAllowed || 2} Sheets
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Weekly Time Graph */}
                <div className="progress-overview-card">
                  <h4 style={{ margin: '0 0 12px', fontSize: '1rem' }}>Total Learning Time (Weekly)</h4>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 110, padding: '10px 0', borderBottom: '1px solid #E2E8F0' }}>
                    {[
                      { day: 'S', h: 45, time: '1h 30m' },
                      { day: 'M', h: 80, time: '3h 15m' },
                      { day: 'T', h: 65, time: '2h 40m' },
                      { day: 'W', h: 95, time: '4h 10m' },
                      { day: 'T', h: 70, time: '2h 50m' },
                      { day: 'F', h: 85, time: '3h 30m' },
                      { day: 'S', h: 100, time: '4h 30m' },
                    ].map((col) => (
                      <div key={col.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <div
                          style={{
                            width: 18,
                            height: col.h,
                            background: '#2563EB',
                            borderRadius: 4,
                          }}
                          title={`${col.day}: ${col.time}`}
                        />
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{col.day}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: 'center', marginTop: 10, fontSize: '0.85rem', color: '#64748B' }}>
                    Total this week: <strong>22h 35m</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================================
          MODAL 1: Streak Details (Image 4)
          ==================================================================== */}
      {isStreakModalOpen && (
        <div className="modal-overlay" onClick={() => setIsStreakModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Streak Details</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Your daily consistency overview</span>
              </div>
              <button className="modal-close-btn" onClick={() => setIsStreakModalOpen(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Quad stats */}
              <div className="streak-metrics-quad">
                <div className="quad-card">
                  <div className="quad-card-title">
                    <span>🔥</span> Current Week
                  </div>
                  <div className="quad-card-value">2 days</div>
                </div>

                <div className="quad-card">
                  <div className="quad-card-title">
                    <span>🏆</span> Best Week
                  </div>
                  <div className="quad-card-value">7 days</div>
                </div>

                <div className="quad-card">
                  <div className="quad-card-title">
                    <span>📅</span> Current Month
                  </div>
                  <div className="quad-card-value">14 days</div>
                </div>

                <div className="quad-card">
                  <div className="quad-card-title">
                    <span>📈</span> Best Month
                  </div>
                  <div className="quad-card-value">28 days</div>
                </div>
              </div>

              {/* Total Active Banner */}
              <div
                style={{
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: 10,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <span style={{ fontSize: '1.4rem' }}>⚡</span>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#1E3A8A' }}>Total Active Days</div>
                  <strong style={{ fontSize: '1.1rem', color: '#1E3A8A' }}>2 days (Oct 2, 2026 - Present)</strong>
                </div>
              </div>

              {/* Month Calendar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.9rem', fontWeight: 700 }}>
                  <span>October 2026</span>
                  <span style={{ color: '#2563EB' }}>Active Streak</span>
                </div>

                <div className="calendar-grid">
                  <div className="calendar-day-label">Su</div>
                  <div className="calendar-day-label">Mo</div>
                  <div className="calendar-day-label">Tu</div>
                  <div className="calendar-day-label">We</div>
                  <div className="calendar-day-label">Th</div>
                  <div className="calendar-day-label">Fr</div>
                  <div className="calendar-day-label">Sa</div>

                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                    const isActive = day === 2 || day === 19;
                    const isToday = day === 20;

                    return (
                      <div
                        key={day}
                        className={`calendar-date-cell ${isActive ? 'active-streak' : ''} ${isToday ? 'today' : ''}`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                className="sheet-btn primary"
                style={{ width: '100%', marginTop: 24, justifyContent: 'center' }}
                onClick={() => setIsStreakModalOpen(false)}
              >
                Close Streak Overview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: Personal Problem Note Editor
          ==================================================================== */}
      {activeNoteProblem && (
        <div className="modal-overlay" onClick={() => setActiveNoteProblem(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Personal Problem Note</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>{activeNoteProblem.title}</span>
              </div>
              <button className="modal-close-btn" onClick={() => setActiveNoteProblem(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#475569' }}>
                Save your personal key takeaways, edge cases, time/space complexities, or custom tips for revision.
              </p>
              <textarea
                rows={6}
                value={currentNoteText}
                onChange={(e) => setCurrentNoteText(e.target.value)}
                placeholder="e.g. Remember to handle negative numbers in Kadane's algorithm. Edge case: all elements negative..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontFamily: 'var(--body)',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <button className="sheet-btn" onClick={() => setActiveNoteProblem(null)}>
                  Cancel
                </button>
                <button className="sheet-btn primary" onClick={saveNote}>
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 3: Note File Preview / Download Modal
          ==================================================================== */}
      {selectedNoteFile && (
        <div className="modal-overlay" onClick={() => setSelectedNoteFile(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{selectedNoteFile.title}</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>{selectedNoteFile.tag}</span>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedNoteFile(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#334155' }}>
                {selectedNoteFile.previewText}
              </p>

              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px dashed #CBD5E1',
                  borderRadius: 10,
                  padding: 16,
                  margin: '16px 0',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 6 }}>Included Resources:</div>
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.85rem', color: '#475569' }}>
                  <li>Complete handwritten high-yield summary PDF</li>
                  <li>Interview Q&A bank with solutions & code snippets</li>
                  <li>Diagrammatic architectures & mental models</li>
                </ul>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="sheet-btn" onClick={() => setSelectedNoteFile(null)}>
                  Close
                </button>
                <button
                  className="sheet-btn primary"
                  onClick={() => {
                    alert(`Starting download for ${selectedNoteFile.title} PDF notes!`);
                    setSelectedNoteFile(null);
                  }}
                >
                  Download PDF Notes 📥
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 4: Plan Your DSA Journey Creator
          ==================================================================== */}
      {isPlanModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPlanModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Create Your DSA Roadmap</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Custom timeline generator</span>
              </div>
              <button className="modal-close-btn" onClick={() => setIsPlanModalOpen(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.9rem', color: '#475569', margin: '0 0 16px' }}>
                Choose your target interview preparation window. We will automatically calculate the daily problem target for you:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { weeks: 4, label: 'Fast-Track (4 Weeks)', desc: '6-7 problems daily · For immediate upcoming interviews' },
                  { weeks: 8, label: 'Standard Master (8 Weeks)', desc: '3-4 problems daily · Recommended for placement season' },
                  { weeks: 12, label: 'Deep Mastery (12 Weeks)', desc: '2 problems daily · In-depth foundational mastery' },
                ].map((plan) => (
                  <div
                    key={plan.weeks}
                    style={{
                      padding: 14,
                      border: '1.5px solid #E2E8F0',
                      borderRadius: 10,
                      cursor: 'pointer',
                      background: '#F8FAFC',
                    }}
                    onClick={() => {
                      alert(`Personalized ${plan.label} plan activated! Daily goal set.`);
                      setIsPlanModalOpen(false);
                    }}
                  >
                    <strong style={{ fontSize: '0.95rem', color: '#0E1B3D' }}>{plan.label}</strong>
                    <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: 4 }}>{plan.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 5: Group Study & CodeBuddies
          ==================================================================== */}
      {isGroupStudyModalOpen && (
        <div className="modal-overlay" onClick={() => setIsGroupStudyModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Find a Group Study Partner</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Pair programming & peer mock interviews</span>
              </div>
              <button className="modal-close-btn" onClick={() => setIsGroupStudyModalOpen(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.9rem', color: '#475569', margin: '0 0 16px' }}>
                Connect with active strivers preparing for the same target companies. Compare problem approaches, share live code, and conduct peer mocks.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { name: 'Kavya R.', target: 'Amazon SDE-1', solved: '124 Qs solved', active: 'Active now' },
                  { name: 'Rohan M.', target: 'Google SWE', solved: '148 Qs solved', active: 'Active 10m ago' },
                  { name: 'Sameer K.', target: 'Blinkit / Zomato', solved: '92 Qs solved', active: 'Active now' },
                ].map((buddy, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: 10,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{buddy.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                        Target: {buddy.target} • {buddy.solved}
                      </div>
                    </div>
                    <button
                      className="sheet-btn primary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      onClick={() => {
                        alert(`Study partner request sent to ${buddy.name}!`);
                        setIsGroupStudyModalOpen(false);
                      }}
                    >
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 6: Operational Business Scenario & Case Study Modal (Non-Tech)
          ==================================================================== */}
      {activeScenarioModal && (
        <div className="modal-overlay" onClick={() => setActiveScenarioModal(null)}>
          <div className="modal-card" style={{ maxWidth: 680, width: '92%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span className="company-badge" style={{ fontWeight: 800 }}>
                    {activeScenarioModal.company}
                  </span>
                  <span className={`diff-pill ${activeScenarioModal.difficulty.toLowerCase()}`}>
                    {activeScenarioModal.difficulty}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                    {activeScenarioModal.type}
                  </span>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0E1B3D' }}>
                  {activeScenarioModal.title}
                </h3>
              </div>
              <button className="modal-close-btn" onClick={() => setActiveScenarioModal(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
              {/* Scenario Context */}
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem', color: '#1E293B' }}>
                  📦 Real-World Operational Scenario:
                </h4>
                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderLeft: '4px solid #2563EB',
                    borderRadius: 8,
                    padding: '12px 16px',
                    fontSize: '0.92rem',
                    lineHeight: 1.6,
                    color: '#334155',
                  }}
                >
                  {activeScenarioModal.scenario}
                </div>
              </div>

              {/* Key Operational Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 18 }}>
                <div style={{ background: '#EFF6FF', padding: '10px 12px', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#1E40AF', fontWeight: 600, textTransform: 'uppercase' }}>Delivery SLA</div>
                  <strong style={{ fontSize: '1rem', color: '#1E3A8A' }}>99.2% Target</strong>
                </div>
                <div style={{ background: '#ECFDF5', padding: '10px 12px', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#065F46', fontWeight: 600, textTransform: 'uppercase' }}>Picker Time</div>
                  <strong style={{ fontSize: '1rem', color: '#065F46' }}>&lt; 90 Seconds</strong>
                </div>
                <div style={{ background: '#FEF3C7', padding: '10px 12px', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#92400E', fontWeight: 600, textTransform: 'uppercase' }}>Fill Rate</div>
                  <strong style={{ fontSize: '1rem', color: '#92400E' }}>&gt; 98.5%</strong>
                </div>
                <div style={{ background: '#F1F5F9', padding: '10px 12px', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase' }}>Customer NPS</div>
                  <strong style={{ fontSize: '1rem', color: '#0F172A' }}>4.8 / 5.0</strong>
                </div>
              </div>

              {/* Mentor Guidance & Solution Breakdown */}
              <div style={{ marginBottom: 18 }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem', color: '#1E293B' }}>
                  💡 Mentor Solution Breakdown & Action Framework:
                </h4>
                <div
                  style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: 8,
                    padding: '14px 16px',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    color: '#166534',
                  }}
                >
                  <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Recommended Ops Playbook:</p>
                  <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <li><strong>Root Cause Isolation:</strong> Segment order delay into 3 buckets: dark store pick/pack time, rider assignment latency, and last-mile transit hurdles.</li>
                    <li><strong>Rider Balancing & Surge Protocols:</strong> Activate dynamic radius geo-fencing (reducing delivery radius from 3km to 1.8km during rainfall or order spikes) to maintain 10-minute SLA.</li>
                    <li><strong>Inventory Buffer Strategy:</strong> Implement fast-moving SKU safety stock (milk, bread, eggs, chips) directly in high-velocity picking zones next to the packing station.</li>
                    <li><strong>Customer Communication & NPS Retention:</strong> Trigger automated SMS/WhatsApp ETA updates with transparent compensation coupons for orders exceeding 15 minutes.</li>
                  </ol>
                </div>
              </div>

              {/* Interview Takeaways */}
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px dashed #CBD5E1',
                  borderRadius: 8,
                  padding: '12px 16px',
                  fontSize: '0.85rem',
                  color: '#475569',
                }}
              >
                <strong style={{ color: '#0F172A' }}>🎯 Interview Evaluation Tip:</strong>
                <p style={{ margin: '4px 0 0' }}>
                  When answering this in an interview with <strong>{activeScenarioModal.company}</strong>, emphasize data-driven trade-offs between customer delivery time (SLA) vs. delivery fleet burn cost. Interviewers look for hands-on operational grit, ownership mindset, and calm escalation handling.
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                <button
                  className={`sheet-btn ${solvedMap[activeScenarioModal.id] ? '' : 'primary'}`}
                  style={{
                    padding: '8px 18px',
                    fontSize: '0.88rem',
                    background: solvedMap[activeScenarioModal.id] ? '#DCFCE7' : undefined,
                    color: solvedMap[activeScenarioModal.id] ? '#15803D' : undefined,
                    borderColor: solvedMap[activeScenarioModal.id] ? '#86EFAC' : undefined,
                  }}
                  onClick={() => {
                    toggleSolve(activeScenarioModal.id);
                  }}
                >
                  {solvedMap[activeScenarioModal.id] ? '✓ Marked as Solved' : 'Mark as Solved ✓'}
                </button>

                <button
                  className="sheet-btn"
                  onClick={() => setActiveScenarioModal(null)}
                >
                  Close Scenario
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
