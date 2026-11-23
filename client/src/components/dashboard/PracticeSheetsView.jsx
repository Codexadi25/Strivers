import React from 'react';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

import CompanyMarquee from '../common/CompanyMarquee';
import PlacementDisclaimer from '../common/PlacementDisclaimer';

export default function PracticeSheetsView({
  selectedTrackCategory,
  setSelectedTrackCategory,
  enrollmentNotice,
  setEnrollmentNotice,
  userEnrolledSheets = [],
  userAuthData,
  practiceViewMode,
  setPracticeViewMode,
  nonTechSheets = [],
  activeSheetId,
  setActiveSheetId,
  activeNonTechSheet,
  isUserEnrolledInActiveSheet,
  handleEnrollPracticeSheet,
  filteredNonTechTopics = [],
  openDays = {},
  toggleDayAccordion,
  solvedMap = {},
  revisionMap = {},
  notesMap = {},
  toggleSolve,
  toggleRevision,
  openNoteModal,
  setActiveScenarioModal,
  // Tech Track Props
  onlySaved,
  setOnlySaved,
  onlyRevision,
  setOnlyRevision,
  difficultyFilter,
  setDifficultyFilter,
  filteredTopics = [],
  setIsGroupStudyModalOpen,
  // Right Sidebar Props
  progressPercent,
  totalProblemsCount,
  totalSolvedCount,
  easySolved,
  easyProblems = [],
  mediumSolved,
  mediumProblems = [],
  hardSolved,
  hardProblems = [],
  streakData,
  setIsStreakModalOpen,
  getSheetProgress,
}) {
  return (
    <div className="dsa-content-layout">
      {/* Left Main: Problem Accordions & Header */}
      <div className="dsa-sheet-main-column">
        {/* Track Category Selector: Non-Tech Active vs Tech Template */}
        <div className="track-category-selector-row">
          <button
            className={`sheet-btn track-category-btn ${
              selectedTrackCategory === 'non-tech' ? 'primary' : ''
            }`}
            onClick={() => setSelectedTrackCategory('non-tech')}
          >
            <BusinessCenterOutlinedIcon sx={{ fontSize: 16 }} />
            <span>Non-Tech Operations</span>
          </button>
          <button
            className={`sheet-btn track-category-btn ${
              selectedTrackCategory === 'tech' ? 'primary' : ''
            }`}
            onClick={() => setSelectedTrackCategory('tech')}
          >
            <CodeOutlinedIcon sx={{ fontSize: 16 }} />
            <span>Technical SDE</span>
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
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '1rem',
              }}
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
              <div className="breadcrumb pd-mobile-hide">
                <span>Mentorship Tracks</span>
                <span>›</span>
                <span>Non-Technical Operations &amp; Growth</span>
              </div>

              <h1 className="sheet-title">Non-Tech Operations &amp; Growth</h1>
              <p className="sheet-subtitle pd-mobile-hide">
                Practical operational problem scenarios for dark store, logistics &amp; category
                management interviews.
              </p>

              {/* Marquee & Placement Notice (Desktop Only) */}
              <div className="pd-mobile-hide" style={{ margin: '14px 0' }}>
                <CompanyMarquee />
                <div style={{ marginTop: 10 }}>
                  <PlacementDisclaimer compact />
                </div>
              </div>

              {/* Quota & Access Status (Desktop Only) */}
              <div
                className="pd-mobile-hide"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                  background: '#F1F5F9',
                  padding: '10px 16px',
                  borderRadius: 8,
                  marginTop: 14,
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>
                    Practice Sheet Quota:
                  </strong>{' '}
                  <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                    {userEnrolledSheets.length} /{' '}
                    {userAuthData?.maxPracticeSheetsAllowed || 2} Enrolled
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: '#DBEAFE',
                    color: '#1E40AF',
                    padding: '3px 8px',
                    borderRadius: 99,
                  }}
                >
                  {userEnrolledSheets.length >=
                  (userAuthData?.maxPracticeSheetsAllowed || 2)
                    ? 'Quota Reached'
                    : `${
                        (userAuthData?.maxPracticeSheetsAllowed || 2) -
                        userEnrolledSheets.length
                      } Slots Available`}
                </span>
              </div>

              {/* Practice Sheet Selector Cards */}
              <div style={{ marginTop: 14 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <h3 style={{ fontSize: '1rem', margin: 0, color: '#0E1B3D' }}>
                    {practiceViewMode === 'my'
                      ? 'My Enrolled Practice Sheets'
                      : 'Practice Sheets Catalog'}
                  </h3>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      className={`sheet-btn ${practiceViewMode === 'my' ? 'primary' : ''}`}
                      style={{ padding: '4px 12px', fontSize: '0.82rem' }}
                      onClick={() => setPracticeViewMode('my')}
                    >
                      My Sheets ({userEnrolledSheets.length})
                    </button>
                    <button
                      className={`sheet-btn ${practiceViewMode === 'all' ? 'primary' : ''}`}
                      style={{ padding: '4px 12px', fontSize: '0.82rem' }}
                      onClick={() => setPracticeViewMode('all')}
                    >
                      All Sheets ({nonTechSheets.length})
                    </button>
                  </div>
                </div>

                {practiceViewMode === 'my' &&
                nonTechSheets.filter((s) =>
                  userEnrolledSheets.some((u) => u.sheetId === s.sheetId)
                ).length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '24px 16px',
                      background: '#F8FAFC',
                      borderRadius: 10,
                      border: '1px dashed #CBD5E1',
                    }}
                  >
                    <AssignmentIcon sx={{ fontSize: 36, color: '#2563EB', mb: 1 }} />
                    <h4 style={{ margin: '0 0 6px', color: '#0F172A' }}>
                      No Enrolled Practice Sheets Yet
                    </h4>
                    <p
                      className="pd-mobile-hide"
                      style={{ margin: '0 0 14px', color: '#64748B', fontSize: '0.86rem' }}
                    >
                      Browse available practice sheets to enroll and track your progress.
                    </p>
                    <button
                      className="sheet-btn primary"
                      onClick={() => setPracticeViewMode('all')}
                    >
                      Browse All Practice Sheets ({nonTechSheets.length})
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
                      gap: 12,
                    }}
                  >
                    {nonTechSheets
                      .filter((sheet) =>
                        practiceViewMode === 'my'
                          ? userEnrolledSheets.some((s) => s.sheetId === sheet.sheetId)
                          : true
                      )
                      .map((sheet) => {
                        const isEnrolled = userEnrolledSheets.some(
                          (s) => s.sheetId === sheet.sheetId
                        );
                        const isSelected = activeSheetId === sheet.sheetId;
                        const isFree = sheet.price === 0 || sheet.isFree;
                        const progressPct = getSheetProgress ? getSheetProgress(sheet) : 0;

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
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginBottom: 6,
                                }}
                              >
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
                                  {isFree
                                    ? '₹0.00 Free Enrollment'
                                    : `₹${sheet.price.toFixed(2)} Paid Track`}
                                </span>
                                {isEnrolled && (
                                  <span
                                    style={{
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      color: '#2563EB',
                                    }}
                                  >
                                    ✓ Enrolled
                                  </span>
                                )}
                              </div>
                              <strong
                                style={{
                                  fontSize: '0.95rem',
                                  color: '#0F172A',
                                  lineHeight: 1.3,
                                }}
                              >
                                {sheet.title}
                              </strong>
                              <div
                                style={{
                                  fontSize: '0.8rem',
                                  color: '#64748B',
                                  marginTop: 4,
                                }}
                              >
                                {sheet.targetRole}
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: 4,
                                  marginTop: 8,
                                }}
                              >
                                {(sheet.targetCompanies || []).slice(0, 4).map((comp) => (
                                  <span
                                    key={comp}
                                    className="company-badge"
                                    style={{ fontSize: '0.72rem' }}
                                  >
                                    {comp}
                                  </span>
                                ))}
                              </div>

                              {isEnrolled && (
                                <div style={{ marginTop: 10 }}>
                                  <div
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      fontSize: '0.78rem',
                                      color: '#64748B',
                                      marginBottom: 3,
                                    }}
                                  >
                                    <span>Progress</span>
                                    <strong>{progressPct}%</strong>
                                  </div>
                                  <div
                                    style={{
                                      width: '100%',
                                      height: 6,
                                      background: '#E2E8F0',
                                      borderRadius: 99,
                                      overflow: 'hidden',
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: `${progressPct}%`,
                                        height: '100%',
                                        background: '#10B981',
                                        borderRadius: 99,
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            <div
                              style={{
                                marginTop: 8,
                                display: 'flex',
                                justifyContent: 'flex-end',
                              }}
                            >
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
                )}
              </div>
            </div>

            {/* Active Non-Tech Sheet Details & Scenarios Accordion */}
            {activeNonTechSheet && (
              <div style={{ marginTop: 24 }}>
                <div
                  style={{
                    padding: '16px 20px',
                    background: '#FFFFFF',
                    borderRadius: 12,
                    border: '1px solid #E2E8F0',
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 10,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: '#2563EB',
                          textTransform: 'uppercase',
                        }}
                      >
                        Active Practice Curriculum
                      </div>
                      <h2
                        style={{
                          margin: '4px 0',
                          fontSize: '1.4rem',
                          color: '#0E1B3D',
                        }}
                      >
                        {activeNonTechSheet.title}
                      </h2>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.88rem',
                          color: '#64748B',
                        }}
                      >
                        {activeNonTechSheet.description}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {isUserEnrolledInActiveSheet ? (
                        <button className="sheet-btn primary" style={{ cursor: 'default' }}>
                          ✓ Start Learning
                        </button>
                      ) : (
                        <button
                          className="sheet-btn primary"
                          onClick={() => handleEnrollPracticeSheet(activeNonTechSheet)}
                        >
                          {activeNonTechSheet.price === 0
                            ? 'Enroll for Free (₹0.00)'
                            : `Unlock for ₹${activeNonTechSheet.price.toFixed(2)}`}
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
                      <div
                        key={topicKey}
                        className={`day-accordion-card ${isOpen ? 'open' : ''}`}
                      >
                        <div
                          className="day-accordion-header"
                          onClick={() => toggleDayAccordion(topicKey)}
                        >
                          <div className="day-title-group">
                            {isOpen ? (
                              <FolderOpenOutlinedIcon
                                sx={{ fontSize: 20, color: '#2563EB' }}
                              />
                            ) : (
                              <FolderOutlinedIcon
                                sx={{ fontSize: 20, color: '#64748B' }}
                              />
                            )}
                            <div>
                              <span className="day-title-text">{topic.topicTitle}</span>
                              {topic.summary && (
                                <div
                                  className="pd-mobile-hide"
                                  style={{
                                    fontSize: '0.8rem',
                                    color: '#64748B',
                                    fontWeight: 400,
                                  }}
                                >
                                  {topic.summary}
                                </div>
                              )}
                            </div>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              flexShrink: 0,
                            }}
                          >
                            <span className="day-progress-pill">
                              {topic.problems.filter((p) => solvedMap[p.id]).length}/
                              {topic.problems.length}
                            </span>
                            {isOpen ? (
                              <ExpandLessIcon sx={{ fontSize: 18, color: '#64748B' }} />
                            ) : (
                              <ExpandMoreIcon sx={{ fontSize: 18, color: '#64748B' }} />
                            )}
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
                                  <th style={{ width: 130 }} className="pd-mobile-hide">
                                    Domain Type
                                  </th>
                                  <th style={{ width: 120, textAlign: 'center' }}>
                                    Guidance
                                  </th>
                                  <th
                                    style={{ width: 50, textAlign: 'center' }}
                                    className="pd-mobile-hide"
                                  >
                                    Notes
                                  </th>
                                  <th style={{ width: 50, textAlign: 'center' }}>Revise</th>
                                </tr>
                              </thead>
                              <tbody>
                                {topic.problems.map((problem) => {
                                  const isSolved = !!solvedMap[problem.id];
                                  const isRev = !!revisionMap[problem.id];
                                  const hasNote = !!notesMap[problem.id];

                                  return (
                                    <tr
                                      key={problem.id}
                                      className={isSolved ? 'solved-row' : ''}
                                    >
                                      <td>
                                        <div
                                          className={`custom-checkbox ${
                                            isSolved ? 'checked' : ''
                                          }`}
                                          onClick={() => toggleSolve(problem.id)}
                                          title={
                                            isSolved
                                              ? 'Mark as Unsolved'
                                              : 'Mark as Solved'
                                          }
                                        >
                                          {isSolved ? '✓' : ''}
                                        </div>
                                      </td>
                                      <td className="pd-col-title">
                                        <strong
                                          style={{
                                            color: isSolved ? '#047857' : '#0F172A',
                                            cursor: 'pointer',
                                          }}
                                          onClick={() => setActiveScenarioModal(problem)}
                                        >
                                          {problem.title}
                                        </strong>
                                        <div
                                          className="pd-mobile-hide"
                                          style={{
                                            fontSize: '0.8rem',
                                            color: '#64748B',
                                            marginTop: 2,
                                          }}
                                        >
                                          {problem.scenario.slice(0, 90)}...
                                        </div>
                                      </td>
                                      <td>
                                        <span
                                          className="company-badge"
                                          style={{ fontWeight: 700 }}
                                        >
                                          {problem.company}
                                        </span>
                                      </td>
                                      <td>
                                        <span
                                          className={`diff-pill ${problem.difficulty.toLowerCase()}`}
                                        >
                                          {problem.difficulty}
                                        </span>
                                      </td>
                                      <td className="pd-mobile-hide">
                                        <span
                                          style={{ fontSize: '0.8rem', color: '#475569' }}
                                        >
                                          {problem.type}
                                        </span>
                                      </td>
                                      <td style={{ textAlign: 'center' }}>
                                        <button
                                          className="sheet-btn primary"
                                          style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                                          onClick={() => setActiveScenarioModal(problem)}
                                        >
                                          Solution →
                                        </button>
                                      </td>
                                      <td
                                        className="pd-mobile-hide"
                                        style={{ textAlign: 'center' }}
                                      >
                                        <button
                                          onClick={() => openNoteModal(problem)}
                                          style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: hasNote ? '#2563EB' : '#94A3B8',
                                            display: 'inline-flex',
                                          }}
                                          title={hasNote ? 'Edit note' : 'Add note'}
                                        >
                                          <EditOutlinedIcon fontSize="small" />
                                        </button>
                                      </td>
                                      <td style={{ textAlign: 'center' }}>
                                        <button
                                          onClick={() => toggleRevision(problem.id)}
                                          style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: isRev ? '#F59E0B' : '#CBD5E1',
                                            display: 'inline-flex',
                                          }}
                                          title={
                                            isRev
                                              ? 'Starred for Revision'
                                              : 'Star for Revision'
                                          }
                                        >
                                          {isRev ? (
                                            <StarIcon fontSize="small" />
                                          ) : (
                                            <StarBorderIcon fontSize="small" />
                                          )}
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
            {/* Template Notice (Desktop Only) */}
            <div
              className="pd-mobile-hide"
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
              <BoltOutlinedIcon sx={{ fontSize: 22, color: '#D97706' }} />
              <div>
                <strong style={{ fontSize: '0.95rem' }}>
                  Technical SDE Master Preparation Sheet (Template Mode)
                </strong>
                <div style={{ fontSize: '0.85rem', color: '#B45309', marginTop: 2 }}>
                  This 193-problem Data Structures &amp; Algorithms curriculum is preserved
                  as a structured reference template for technical candidates.
                </div>
              </div>
            </div>

            <div className="sheet-header-card">
              <div className="breadcrumb pd-mobile-hide">
                <span>Technical Track</span>
                <span>›</span>
                <span>SDE Master Preparation Template</span>
              </div>

              <h1 className="sheet-title">SDE Sheet - Interview Questions</h1>
              <p className="sheet-subtitle pd-mobile-hide">
                Preserved Technical DSA curriculum covering core interview patterns.
              </p>

              <div className="sheet-action-btns pd-mobile-hide">
                <button
                  className="sheet-btn"
                  onClick={() => setIsGroupStudyModalOpen(true)}
                >
                  <GroupsOutlinedIcon fontSize="small" />
                  <span>Group Study</span>
                </button>
                <button
                  className={`sheet-btn ${onlySaved ? 'primary' : ''}`}
                  onClick={() => setOnlySaved(!onlySaved)}
                >
                  <BookmarkBorderOutlinedIcon fontSize="small" />
                  <span>{onlySaved ? 'Show All Questions' : 'Saved Questions'}</span>
                </button>
              </div>

              {/* Level & Revision Filter Pills */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>
                  Level:
                </span>
                {['all', 'easy', 'medium', 'hard'].map((diff) => (
                  <button
                    key={diff}
                    className={`sheet-btn ${difficultyFilter === diff ? 'primary' : ''}`}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.8rem',
                      textTransform: 'capitalize',
                    }}
                    onClick={() => setDifficultyFilter(diff)}
                  >
                    {diff}
                  </button>
                ))}
                <button
                  className={`sheet-btn pd-mobile-hide ${onlyRevision ? 'primary' : ''}`}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.8rem',
                    marginLeft: 'auto',
                  }}
                  onClick={() => setOnlyRevision(!onlyRevision)}
                >
                  {onlyRevision ? 'Showing Starred' : 'Filter Revision Starred'}
                </button>
              </div>
            </div>

            {/* Day by Day Accordions (Preserved 193 questions) */}
            <div className="days-accordion-list">
              {filteredTopics.map((day) => {
                const isOpen = !!openDays[day.id];
                const daySolved = day.problems.filter((p) => solvedMap[p.id]).length;
                const isCompleted =
                  daySolved === day.problems.length && day.problems.length > 0;

                return (
                  <div key={day.id} className={`day-accordion-card ${isOpen ? 'open' : ''}`}>
                    <div
                      className="day-accordion-header"
                      onClick={() => toggleDayAccordion(day.id)}
                    >
                      <div className="day-title-group">
                        {isOpen ? (
                          <FolderOpenOutlinedIcon
                            sx={{ fontSize: 20, color: '#2563EB' }}
                          />
                        ) : (
                          <FolderOutlinedIcon
                            sx={{ fontSize: 20, color: '#64748B' }}
                          />
                        )}
                        <span className="day-title-text">{day.title}</span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          flexShrink: 0,
                        }}
                      >
                        <span
                          className={`day-progress-pill ${
                            isCompleted ? 'completed' : ''
                          }`}
                        >
                          {daySolved}/{day.problems.length}
                        </span>
                        {isOpen ? (
                          <ExpandLessIcon sx={{ fontSize: 18, color: '#64748B' }} />
                        ) : (
                          <ExpandMoreIcon sx={{ fontSize: 18, color: '#64748B' }} />
                        )}
                      </div>
                    </div>

                    {isOpen && (
                      <div className="problems-table-wrapper">
                        <table className="problems-table">
                          <thead>
                            <tr>
                              <th style={{ width: 44 }}>Status</th>
                              <th>Problem</th>
                              <th
                                style={{ width: 80, textAlign: 'center' }}
                                className="pd-mobile-hide"
                              >
                                Editorial
                              </th>
                              <th style={{ width: 80, textAlign: 'center' }}>Practice</th>
                              <th style={{ width: 90 }}>Level</th>
                              <th
                                style={{ width: 60, textAlign: 'center' }}
                                className="pd-mobile-hide"
                              >
                                Notes
                              </th>
                              <th className="pd-mobile-hide">Companies</th>
                              <th style={{ width: 50, textAlign: 'center' }}>Revise</th>
                            </tr>
                          </thead>
                          <tbody>
                            {day.problems.map((problem) => {
                              const isSolved = !!solvedMap[problem.id];
                              const isRev = !!revisionMap[problem.id];
                              const hasNote = !!notesMap[problem.id];

                              return (
                                <tr
                                  key={problem.id}
                                  className={isSolved ? 'solved-row' : ''}
                                >
                                  <td>
                                    <div
                                      className={`custom-checkbox ${
                                        isSolved ? 'checked' : ''
                                      }`}
                                      onClick={() => toggleSolve(problem.id)}
                                      title={
                                        isSolved
                                          ? 'Mark as Unsolved'
                                          : 'Mark as Solved'
                                      }
                                    >
                                      {isSolved ? '✓' : ''}
                                    </div>
                                  </td>
                                  <td className="pd-col-title">
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
                                  <td
                                    className="pd-mobile-hide"
                                    style={{ textAlign: 'center' }}
                                  >
                                    <div
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: 6,
                                      }}
                                    >
                                      <a
                                        className="action-icon-link"
                                        href={problem.articleUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        title="Article"
                                      >
                                        <DescriptionOutlinedIcon fontSize="small" />
                                      </a>
                                      <a
                                        className="action-icon-link"
                                        href={problem.videoUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        title="Video"
                                      >
                                        <PlayCircleOutlinedIcon fontSize="small" />
                                      </a>
                                    </div>
                                  </td>
                                  <td style={{ textAlign: 'center' }}>
                                    <a
                                      href={problem.practiceUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        padding: '3px 9px',
                                        background: '#EFF6FF',
                                        borderRadius: 6,
                                        color: '#2563EB',
                                        textDecoration: 'none',
                                      }}
                                    >
                                      Solve →
                                    </a>
                                  </td>
                                  <td>
                                    <span
                                      className={`diff-pill ${problem.difficulty.toLowerCase()}`}
                                    >
                                      {problem.difficulty}
                                    </span>
                                  </td>
                                  <td
                                    className="pd-mobile-hide"
                                    style={{ textAlign: 'center' }}
                                  >
                                    <button
                                      onClick={() => openNoteModal(problem)}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: hasNote ? '#2563EB' : '#94A3B8',
                                        display: 'inline-flex',
                                      }}
                                      title={hasNote ? 'Edit note' : 'Add note'}
                                    >
                                      <EditOutlinedIcon fontSize="small" />
                                    </button>
                                  </td>
                                  <td className="pd-mobile-hide">
                                    <div className="company-badges-cell">
                                      {problem.companies.slice(0, 3).map((comp) => (
                                        <span key={comp} className="company-badge">
                                          {comp}
                                        </span>
                                      ))}
                                      {problem.companies.length > 3 && (
                                        <span
                                          className="company-badge"
                                          style={{ color: '#64748B' }}
                                        >
                                          +{problem.companies.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td style={{ textAlign: 'center' }}>
                                    <button
                                      onClick={() => toggleRevision(problem.id)}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: isRev ? '#F59E0B' : '#CBD5E1',
                                        display: 'inline-flex',
                                      }}
                                      title={
                                        isRev
                                          ? 'Starred for Revision'
                                          : 'Star for Revision'
                                      }
                                    >
                                      {isRev ? (
                                        <StarIcon fontSize="small" />
                                      ) : (
                                        <StarBorderIcon fontSize="small" />
                                      )}
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 12,
            }}
          >
            <TrendingUpIcon sx={{ fontSize: 22, color: '#2563EB' }} />
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: '#0E1B3D',
                }}
              >
                {progressPercent > 0
                  ? "You're making great progress!"
                  : "Let's get started!"}
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
                  style={{
                    width: `${(easySolved / (easyProblems.length || 1)) * 100}%`,
                  }}
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
                  style={{
                    width: `${(mediumSolved / (mediumProblems.length || 1)) * 100}%`,
                  }}
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
                  style={{
                    width: `${(hardSolved / (hardProblems.length || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Streak Calendar Mini Widget - Fully Dynamic */}
        <div className="streak-calendar-card">
          <div className="calendar-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <LocalFireDepartmentIcon sx={{ fontSize: 18, color: '#D97706' }} />
              <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>
                {streakData.currentStreak}
                {streakData.streakSuffix} Day Streak
              </strong>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
              {streakData.monthName} {streakData.currentYear}
            </span>
          </div>

          <div className="calendar-grid">
            <div className="calendar-day-label">Su</div>
            <div className="calendar-day-label">Mo</div>
            <div className="calendar-day-label">Tu</div>
            <div className="calendar-day-label">We</div>
            <div className="calendar-day-label">Th</div>
            <div className="calendar-day-label">Fr</div>
            <div className="calendar-day-label">Sa</div>

            {/* Empty placeholder cells for weekday offset before 1st of month */}
            {Array.from({ length: streakData.firstDayIndex }, (_, i) => (
              <div
                key={`empty-pre-${i}`}
                className="calendar-date-cell empty"
                style={{ opacity: 0 }}
              />
            ))}

            {/* Dynamic month days */}
            {Array.from({ length: streakData.daysInMonth }, (_, i) => i + 1).map((day) => {
              const isActiveStreak = streakData.activeDaysSet.has(day);
              const isToday = day === streakData.todayDateNum;

              return (
                <div
                  key={day}
                  className={`calendar-date-cell ${
                    isActiveStreak ? 'active-streak' : ''
                  } ${isToday ? 'today' : ''}`}
                  onClick={() => setIsStreakModalOpen(true)}
                  title={`${streakData.monthName} ${day}: ${
                    isActiveStreak ? 'Active streak day 🔥' : 'Inactive'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>

          <div
            className="calendar-footer-link"
            onClick={() => setIsStreakModalOpen(true)}
          >
            <span>Total Active Days: {streakData.totalActiveDays}</span>
            <span>View Details ›</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
