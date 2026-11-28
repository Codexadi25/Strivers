import React from 'react';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

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
  availableSheets = [],
  activeSheetId,
  setActiveSheetId,
  activeSheet,
  isUserEnrolledInActiveSheet,
  handleEnrollPracticeSheet,
  filteredTopics = [],
  openDays = {},
  toggleDayAccordion,
  solvedMap = {},
  revisionMap = {},
  notesMap = {},
  toggleSolve,
  toggleRevision,
  openNoteModal,
  setActiveScenarioModal,
  // Tech & General Filter Props
  onlySaved,
  setOnlySaved,
  onlyRevision,
  setOnlyRevision,
  difficultyFilter,
  setDifficultyFilter,
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
  const displayedSheets = (availableSheets || []).filter((sheet) => {
    if (practiceViewMode === 'my') {
      return userEnrolledSheets.some((s) => s.sheetId === sheet.sheetId);
    }
    return true;
  });

  return (
    <div className="dsa-content-layout">
      {/* Left Main: Problem Accordions & Header */}
      <div className="dsa-sheet-main-column">
        {/* Track Category Selector */}
        <div className="track-category-selector-row">
          <button
            className={`sheet-btn track-category-btn ${
              selectedTrackCategory === 'all' ? 'primary' : ''
            }`}
            onClick={() => setSelectedTrackCategory('all')}
          >
            <AppsOutlinedIcon sx={{ fontSize: 16 }} />
            <span>All Job Tracks</span>
          </button>
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

        {/* Header Card & Quota */}
        <div className="sheet-header-card">
          <div className="breadcrumb pd-mobile-hide">
            <span>Mentorship Tracks</span>
            <span>›</span>
            <span>
              {selectedTrackCategory === 'tech'
                ? 'Technical SDE Master'
                : selectedTrackCategory === 'non-tech'
                ? 'Non-Tech Operations & Growth'
                : 'All Placement Tracks'}
            </span>
          </div>

          <h1 className="sheet-title">
            {selectedTrackCategory === 'tech'
              ? 'Technical Software Engineering (SDE) Practice'
              : selectedTrackCategory === 'non-tech'
              ? 'Non-Tech Operations & Growth Tracks'
              : 'Placement Curriculum & Problem Sets'}
          </h1>
          <p className="sheet-subtitle pd-mobile-hide">
            Real-world interview problems, dark store operational math, system designs, and algorithms curated by lead mentors.
          </p>

          {/* Marquee & Placement Notice (Desktop Only) */}
          <div className="pd-mobile-hide" style={{ margin: '14px 0' }}>
            <CompanyMarquee />
            <div style={{ marginTop: 10 }}>
              <PlacementDisclaimer compact />
            </div>
          </div>

          {/* Quota & Access Status */}
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
              {userEnrolledSheets.length >= (userAuthData?.maxPracticeSheetsAllowed || 2)
                ? 'Quota Reached'
                : `${(userAuthData?.maxPracticeSheetsAllowed || 2) - userEnrolledSheets.length} Slots Available`}
            </span>
          </div>

          {/* Practice Sheet Selector Cards (My Sheets vs All Sheets) */}
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 10,
                marginBottom: 12,
              }}
            >
              <h3 style={{ fontSize: '1rem', margin: 0, color: '#0E1B3D', fontWeight: 700 }}>
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
                  All Sheets ({availableSheets.length})
                </button>
              </div>
            </div>

            {practiceViewMode === 'my' && displayedSheets.length === 0 ? (
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
                  Browse available practice tracks below to enroll for free and start problem solving.
                </p>
                <button
                  className="sheet-btn primary"
                  onClick={() => setPracticeViewMode('all')}
                >
                  Browse All Practice Sheets ({availableSheets.length})
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
                  gap: 12,
                }}
              >
                {displayedSheets.map((sheet) => {
                  const isEnrolled = userEnrolledSheets.some((s) => s.sheetId === sheet.sheetId);
                  const isSelected = (activeSheet?.sheetId || activeSheetId) === sheet.sheetId;
                  const isFree = sheet.price === 0 || sheet.isFree;
                  const progressPct = getSheetProgress ? getSheetProgress(sheet) : 0;

                  return (
                    <div
                      key={sheet.sheetId || sheet.id}
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
                            {isFree ? '₹0.00 Free' : `₹${sheet.price.toFixed(2)} Paid`}
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
                            display: 'block',
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
                          {sheet.targetRole || sheet.roleTag}
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 4,
                            marginTop: 8,
                          }}
                        >
                          {(sheet.targetCompanies || sheet.companyTags || []).slice(0, 4).map((comp) => (
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
                            ✓ Practice Now
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
                            Enroll Free (₹0)
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

        {/* Active Sheet Curriculum Details */}
        {activeSheet && (
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
                    Active Track Curriculum
                  </div>
                  <h2
                    style={{
                      margin: '4px 0',
                      fontSize: '1.4rem',
                      color: '#0E1B3D',
                    }}
                  >
                    {activeSheet.title}
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.88rem',
                      color: '#64748B',
                    }}
                  >
                    {activeSheet.description}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {isUserEnrolledInActiveSheet ? (
                    <button className="sheet-btn primary" style={{ cursor: 'default' }}>
                      ✓ Learning Active
                    </button>
                  ) : (
                    <button
                      className="sheet-btn primary"
                      onClick={() => handleEnrollPracticeSheet(activeSheet)}
                    >
                      {activeSheet.price === 0
                        ? 'Enroll for Free (₹0.00)'
                        : `Unlock for ₹${activeSheet.price.toFixed(2)}`}
                    </button>
                  )}
                </div>
              </div>

              {/* Filters for Questions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid #F1F5F9',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>
                  Filter Level:
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
                  className={`sheet-btn pd-mobile-hide ${onlySaved ? 'primary' : ''}`}
                  onClick={() => setOnlySaved(!onlySaved)}
                  style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                >
                  <BookmarkBorderOutlinedIcon sx={{ fontSize: 16 }} />
                  <span>{onlySaved ? 'All Questions' : 'Saved Questions'}</span>
                </button>
                <button
                  className={`sheet-btn pd-mobile-hide ${onlyRevision ? 'primary' : ''}`}
                  onClick={() => setOnlyRevision(!onlyRevision)}
                  style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                >
                  <StarIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                  <span>{onlyRevision ? 'All Questions' : 'Revision Only'}</span>
                </button>
              </div>
            </div>

            {/* Modules and Problems Accordions */}
            <div className="days-accordion-list">
              {filteredTopics.map((topic, topicIdx) => {
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
                          {topic.problems.length} Solved
                        </span>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="day-problems-table-wrapper">
                        <table className="day-problems-table">
                          <thead>
                            <tr>
                              <th style={{ width: 44 }}>Status</th>
                              <th>Problem / Scenario</th>
                              <th style={{ width: 110 }}>Company</th>
                              <th style={{ width: 90 }}>Difficulty</th>
                              <th className="pd-mobile-hide" style={{ width: 110 }}>Type</th>
                              <th style={{ width: 100, textAlign: 'center' }}>Guidance</th>
                              <th className="pd-mobile-hide" style={{ width: 50, textAlign: 'center' }}>Notes</th>
                              <th style={{ width: 50, textAlign: 'center' }}>Star</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topic.problems.map((problem) => {
                              const isSolved = Boolean(solvedMap[problem.id]);
                              const isRev = Boolean(revisionMap[problem.id]);
                              const hasNote = Boolean(notesMap[problem.id]);

                              return (
                                <tr
                                  key={problem.id}
                                  className={isSolved ? 'row-solved' : ''}
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
                                    {problem.scenario && (
                                      <div
                                        className="pd-mobile-hide"
                                        style={{
                                          fontSize: '0.8rem',
                                          color: '#64748B',
                                          marginTop: 2,
                                        }}
                                      >
                                        {problem.scenario.slice(0, 95)}...
                                      </div>
                                    )}
                                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                                      {problem.resourceLink && problem.resourceLink !== '#' && (
                                        <a
                                          href={problem.resourceLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{
                                            fontSize: '0.74rem',
                                            color: '#2563EB',
                                            textDecoration: 'none',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 2,
                                          }}
                                        >
                                          <span>Practice Link</span>
                                          <OpenInNewIcon sx={{ fontSize: 12 }} />
                                        </a>
                                      )}
                                      {problem.videoUrl && problem.videoUrl !== '#' && (
                                        <a
                                          href={problem.videoUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{
                                            fontSize: '0.74rem',
                                            color: '#DC2626',
                                            textDecoration: 'none',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 2,
                                          }}
                                        >
                                          <span>Video Solution</span>
                                          <PlayCircleOutlinedIcon sx={{ fontSize: 13 }} />
                                        </a>
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    <span
                                      className="company-badge"
                                      style={{ fontWeight: 700 }}
                                    >
                                      {problem.company || 'Top Tech'}
                                    </span>
                                  </td>
                                  <td>
                                    <span
                                      className={`diff-pill ${(problem.difficulty || 'medium').toLowerCase()}`}
                                    >
                                      {problem.difficulty || 'Medium'}
                                    </span>
                                  </td>
                                  <td className="pd-mobile-hide">
                                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                                      {problem.type || 'Problem'}
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

      {/* Right Sidebar: Dynamic Target Roles, Overall Syllabus Progress & Streak Calendar */}
      <aside className="dsa-sheet-sidebar">
        {/* Active Track Target Roles Card */}
        <div className="target-roles-card">
          <div className="target-roles-header">
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#0F172A' }}>
              Target Role Specialization
            </h3>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#2563EB',
                background: '#EFF6FF',
                padding: '2px 8px',
                borderRadius: 99,
              }}
            >
              {activeSheet?.category || 'Curriculum'}
            </span>
          </div>

          <div
            style={{
              fontSize: '0.85rem',
              color: '#334155',
              fontWeight: 600,
              margin: '8px 0 10px',
            }}
          >
            {activeSheet?.targetRole || activeSheet?.roleTag || 'Software & Operations Roles'}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(activeSheet?.targetCompanies || activeSheet?.companyTags || []).map((comp) => (
              <span
                key={comp}
                className="company-badge"
                style={{ fontSize: '0.75rem', fontWeight: 600 }}
              >
                {comp}
              </span>
            ))}
          </div>
        </div>

        {/* Overall Syllabus Progress Card */}
        <div className="progress-overview-card">
          <div className="progress-circle-group">
            <div
              className="progress-circle"
              style={{
                background: `conic-gradient(#2563EB ${progressPercent * 3.6}deg, #E2E8F0 0deg)`,
              }}
            >
              <div className="progress-circle-inner">
                <span className="progress-percent-val">{progressPercent}%</span>
                <span className="progress-percent-sub">Syllabus Solved</span>
              </div>
            </div>

            <div className="progress-stat-stack">
              <div className="progress-stat-num">
                {totalSolvedCount} / {totalProblemsCount}
              </div>
              <div className="progress-stat-lbl">Questions Mastered</div>
            </div>
          </div>

          {/* Difficulty breakdown */}
          <div className="difficulty-breakdown-list">
            <div className="diff-breakdown-row">
              <div className="diff-meta">
                <span className="diff-dot easy" />
                <span className="diff-label">Easy</span>
                <span className="diff-counts">
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

            <div className="diff-breakdown-row">
              <div className="diff-meta">
                <span className="diff-dot medium" />
                <span className="diff-label">Medium</span>
                <span className="diff-counts">
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

            <div className="diff-breakdown-row">
              <div className="diff-meta">
                <span className="diff-dot hard" />
                <span className="diff-label">Hard</span>
                <span className="diff-counts">
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

        {/* Dynamic Streak Calendar Mini Widget */}
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

            {Array.from({ length: streakData.firstDayIndex }, (_, i) => (
              <div
                key={`empty-pre-${i}`}
                className="calendar-date-cell empty"
                style={{ opacity: 0 }}
              />
            ))}

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
