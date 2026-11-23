import React from 'react';

export default function AnalyticsProfileView({
  userProfile,
  userAuthData,
  userEnrolledSheets = [],
  totalSolvedCount,
  streakData,
  solvedMap = {},
  analyticsData,
}) {
  const userName =
    userProfile?.name ||
    userAuthData?.name ||
    userAuthData?.email?.split('@')[0] ||
    'Student';

  return (
    <div className="analytics-grid-layout">
      {/* Main Column */}
      <div>
        {/* Greeting Hero */}
        <div className="profile-hero-banner">
          <div>
            <h2 className="profile-hero-title">Hi, {userName}</h2>
            <p className="profile-hero-desc">
              Track your placement preparation, inspect topic weaknesses, maintain daily
              problem streaks, and unlock consistency badges.
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
                {totalSolvedCount} problem{totalSolvedCount === 1 ? '' : 's'} solved to date
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
              <span>
                Total active days: <strong>{streakData.totalActiveDays}</strong>
              </span>{' '}
              &nbsp;•&nbsp;
              <span>
                Max streak: <strong>{streakData.bestStreak} days</strong>
              </span>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="heatmap-grid-scroll">
            <div className="heatmap-matrix">
              {Array.from({ length: 364 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (363 - i));
                const dStr = d.toISOString().slice(0, 10);
                const dayNum = d.getDate();
                const isThisMonth =
                  d.getMonth() === streakData.currentMonthIndex &&
                  d.getFullYear() === streakData.currentYear;

                const subCount =
                  streakData.dailySubmissions[dStr] !== undefined
                    ? streakData.dailySubmissions[dStr]
                    : isThisMonth && streakData.activeDaysSet.has(dayNum)
                    ? (dayNum % 3) + 2
                    : 0;

                let level = 'level-0';
                if (subCount >= 5) level = 'level-4';
                else if (subCount >= 3) level = 'level-3';
                else if (subCount >= 2) level = 'level-2';
                else if (subCount >= 1) level = 'level-1';

                return (
                  <div
                    key={i}
                    className={`heatmap-cell ${level}`}
                    title={`${d.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}: ${subCount} problems solved`}
                  />
                );
              })}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 6,
              fontSize: '0.75rem',
              color: '#64748B',
              marginTop: 10,
            }}
          >
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
            Earn streak trophies by solving interview problems and maintaining learning
            momentum.
          </p>

          <div className="badges-row">
            <div className="badge-item">
              <div className="badge-icon">🔥</div>
              <div className="badge-name">7 Problems Bronze</div>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: totalSolvedCount >= 7 ? '#16A34A' : '#94A3B8',
                  fontWeight: 600,
                }}
              >
                {totalSolvedCount >= 7 ? 'Unlocked ✓' : `${totalSolvedCount}/7`}
              </span>
            </div>

            <div className="badge-item">
              <div className="badge-icon">⚡</div>
              <div className="badge-name">15 Problems Silver</div>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: totalSolvedCount >= 15 ? '#16A34A' : '#94A3B8',
                  fontWeight: 600,
                }}
              >
                {totalSolvedCount >= 15 ? 'Unlocked ✓' : `${totalSolvedCount}/15`}
              </span>
            </div>

            <div className="badge-item">
              <div className="badge-icon">👑</div>
              <div className="badge-name">30 Problems Gold</div>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: totalSolvedCount >= 30 ? '#16A34A' : '#94A3B8',
                  fontWeight: 600,
                }}
              >
                {totalSolvedCount >= 30 ? 'Unlocked ✓' : `${totalSolvedCount}/30`}
              </span>
            </div>

            <div className="badge-item">
              <div className="badge-icon">💎</div>
              <div className="badge-name">50 Problems Diamond</div>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: totalSolvedCount >= 50 ? '#16A34A' : '#94A3B8',
                  fontWeight: 600,
                }}
              >
                {totalSolvedCount >= 50 ? 'Unlocked ✓' : `${totalSolvedCount}/50`}
              </span>
            </div>
          </div>
        </div>

        {/* Topic Breakdown */}
        <div className="heatmap-card">
          <h3 style={{ margin: '0 0 14px', fontSize: '1.15rem' }}>
            Topic Performance &amp; Coverage
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(analyticsData?.topicBreakdown || []).map((t) => (
              <div key={t.topic}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.88rem',
                    marginBottom: 6,
                  }}
                >
                  <strong style={{ color: '#0F172A' }}>{t.topic}</strong>
                  <span style={{ color: '#64748B' }}>
                    {t.solved} / {t.total} ({t.percent}%)
                  </span>
                </div>
                <div
                  style={{
                    height: 8,
                    background: '#F1F5F9',
                    borderRadius: 99,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${t.percent}%`,
                      background:
                        t.percent > 60
                          ? '#10B981'
                          : t.percent > 25
                          ? '#3B82F6'
                          : '#F59E0B',
                      borderRadius: 99,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Rail: Profile Mini Card & Solved Breakdown */}
      <aside className="dsa-sheet-right-rail">
        <div className="profile-side-card">
          <div
            className="user-avatar-circle"
            style={{ width: 68, height: 68, fontSize: '1.6rem', margin: '0 auto 12px' }}
          >
            {(
              (userName || 'ST')
                .split(' ')
                .map((n) => n[0])
                .join('') || 'ST'
            )
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem' }}>{userName}</h3>
          <p
            className="muted"
            style={{ margin: '0 0 14px', fontSize: '0.82rem', wordBreak: 'break-all' }}
          >
            {userAuthData?.email || userProfile?.email || 'Student Account'}
          </p>

          <div
            style={{
              background: '#F8FAFC',
              borderRadius: 8,
              padding: '12px 14px',
              textAlign: 'left',
              fontSize: '0.84rem',
              color: '#475569',
              lineHeight: 1.6,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
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
              <span className="muted">Target Companies</span>
              <strong style={{ textAlign: 'right' }}>
                {Array.isArray(userProfile?.targetCompanies) && userProfile.targetCompanies.length > 0
                  ? userProfile.targetCompanies.join(', ')
                  : 'Google, Atlassian'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted">Practice Quota</span>
              <strong>
                {userEnrolledSheets?.length || 1} / {userAuthData?.maxPracticeSheetsAllowed || 2} Sheets
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted">Problems Solved</span>
              <strong>{totalSolvedCount}</strong>
            </div>
          </div>
        </div>

        {/* Quad Solved Split */}
        <div className="sheet-progress-card">
          <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem' }}>Solved Split</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem',
                  marginBottom: 4,
                }}
              >
                <span style={{ color: '#16A34A', fontWeight: 700 }}>Easy</span>
                <span>
                  {analyticsData?.easySolved || 0} / {analyticsData?.easyTotal || 0}
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  background: '#F1F5F9',
                  borderRadius: 99,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${
                      ((analyticsData?.easySolved || 0) /
                        (analyticsData?.easyTotal || 1)) *
                      100
                    }%`,
                    background: '#16A34A',
                  }}
                />
              </div>
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem',
                  marginBottom: 4,
                }}
              >
                <span style={{ color: '#D97706', fontWeight: 700 }}>Medium</span>
                <span>
                  {analyticsData?.mediumSolved || 0} / {analyticsData?.mediumTotal || 0}
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  background: '#F1F5F9',
                  borderRadius: 99,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${
                      ((analyticsData?.mediumSolved || 0) /
                        (analyticsData?.mediumTotal || 1)) *
                      100
                    }%`,
                    background: '#D97706',
                  }}
                />
              </div>
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem',
                  marginBottom: 4,
                }}
              >
                <span style={{ color: '#DC2626', fontWeight: 700 }}>Hard</span>
                <span>
                  {analyticsData?.hardSolved || 0} / {analyticsData?.hardTotal || 0}
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  background: '#F1F5F9',
                  borderRadius: 99,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${
                      ((analyticsData?.hardSolved || 0) /
                        (analyticsData?.hardTotal || 1)) *
                      100
                    }%`,
                    background: '#DC2626',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
