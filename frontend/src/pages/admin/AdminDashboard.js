import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../context/AuthContext';

function AdminDashboard() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div>
        <Navbar />
        <div style={styles.error}>
          <div style={styles.errorIconWrapper}>
            <svg style={styles.errorIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2 style={styles.errorTitle}>Access Denied</h2>
          <p style={styles.errorText}>You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <Navbar />

      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.headerBadge}>
              <svg style={styles.badgeIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Admin Panel
            </div>
            <h1 style={styles.title}>Admin Dashboard</h1>
            <p style={styles.subtitle}>Manage your learning platform</p>
          </div>
        </div>

        <div style={styles.cardsGrid}>
          {/* Videos Management Card */}
          <Link to="/admin/videos" style={styles.card} className="admin-card">
            <div style={{...styles.cardIconWrapper, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <svg style={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
            </div>
            <h3 style={styles.cardTitle}>Video Management</h3>
            <p style={styles.cardDesc}>
              Upload, edit, and manage course videos
            </p>
            <div style={styles.cardFooter}>
              <span style={styles.cardStat}>
                <svg style={styles.statIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="23 7 16 12 23 17 23 7"/>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                12 Videos
              </span>
              <svg style={styles.cardArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
          </Link>

          {/* Users Management Card */}
          <Link to="/admin/users" style={styles.card} className="admin-card">
            <div style={{...styles.cardIconWrapper, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
              <svg style={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3 style={styles.cardTitle}>User Management</h3>
            <p style={styles.cardDesc}>
              Manage students and instructors
            </p>
            <div style={styles.cardFooter}>
              <span style={styles.cardStat}>
                <svg style={styles.statIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                </svg>
                234 Users
              </span>
              <svg style={styles.cardArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
          </Link>

          {/* Analytics Card */}
          <Link to="/admin/analytics" style={styles.card} className="admin-card">
            <div style={{...styles.cardIconWrapper, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
              <svg style={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </div>
            <h3 style={styles.cardTitle}>Analytics</h3>
            <p style={styles.cardDesc}>
              View platform statistics and insights
            </p>
            <div style={styles.cardFooter}>
              <span style={styles.cardStat}>
                <svg style={styles.statIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                View Reports
              </span>
              <svg style={styles.cardArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
          </Link>

          {/* Settings Card */}
          <Link to="/admin/settings" style={styles.card} className="admin-card">
            <div style={{...styles.cardIconWrapper, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'}}>
              <svg style={styles.cardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m-6-6h6m6 0h-6"/>
                <path d="M4.2 4.2l4.2 4.2m7.2 0l4.2-4.2M4.2 19.8l4.2-4.2m7.2 0l4.2 4.2"/>
              </svg>
            </div>
            <h3 style={styles.cardTitle}>Platform Settings</h3>
            <p style={styles.cardDesc}>
              Configure platform preferences
            </p>
            <div style={styles.cardFooter}>
              <span style={styles.cardStat}>
                <svg style={styles.statIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v6m0 4v10m-6-8h12"/>
                </svg>
                Configure
              </span>
              <svg style={styles.cardArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div style={styles.statsSection}>
          <div style={styles.sectionHeader}>
            <svg style={styles.sectionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            <h2 style={styles.sectionTitle}>Platform Overview</h2>
          </div>
          <div style={styles.statsGrid}>
            <div style={styles.statCard} className="stat-card">
              <div style={styles.statIconBg}>
                <svg style={styles.statCardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div style={styles.statNumber}>234</div>
              <div style={styles.statLabel}>Total Students</div>
              <div style={styles.statChange}>
                <svg style={styles.changeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
                +12% this month
              </div>
            </div>
            <div style={styles.statCard} className="stat-card">
              <div style={styles.statIconBg}>
                <svg style={styles.statCardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </div>
              <div style={styles.statNumber}>12</div>
              <div style={styles.statLabel}>Active Courses</div>
              <div style={styles.statChange}>
                <svg style={styles.changeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                +2 new
              </div>
            </div>
            <div style={styles.statCard} className="stat-card">
              <div style={styles.statIconBg}>
                <svg style={styles.statCardIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <polyline points="17 11 19 13 23 9"/>
                </svg>
              </div>
              <div style={styles.statNumber}>1,567</div>
              <div style={styles.statLabel}>Total Enrollments</div>
              <div style={styles.statChange}>
                <svg style={styles.changeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
                +45% growth
              </div>
            </div>
            <div style={styles.statCard} className="stat-card">
              <div style={styles.statIconBg}>
                <svg style={styles.statCardIcon} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div style={styles.statNumber}>4.8</div>
              <div style={styles.statLabel}>Average Rating</div>
              <div style={styles.statChange}>
                <div style={styles.starsWrapper}>
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} style={styles.star} viewBox="0 0 24 24" fill="#fbbf24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%)',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px 30px',
  },
  header: {
    marginBottom: '50px',
    position: 'relative',
    padding: '60px 40px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
  },
  headerContent: {
    position: 'relative',
    zIndex: 1,
  },
  headerBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: '700',
    color: 'white',
    marginBottom: '20px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  badgeIcon: {
    width: '18px',
    height: '18px',
  },
  title: {
    fontSize: '48px',
    fontWeight: '800',
    color: 'white',
    marginBottom: '12px',
    textShadow: '0 2px 20px rgba(0,0,0,0.2)',
  },
  subtitle: {
    fontSize: '20px',
    color: 'rgba(255, 255, 255, 0.9)',
    margin: 0,
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '28px',
    marginBottom: '60px',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all 0.4s ease',
    cursor: 'pointer',
    border: '1px solid rgba(0,0,0,0.04)',
    position: 'relative',
    overflow: 'hidden',
  },
  cardIconWrapper: {
    width: '68px',
    height: '68px',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.4s ease',
  },
  cardIcon: {
    width: '32px',
    height: '32px',
    color: 'white',
  },
  cardTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '12px',
    lineHeight: '1.3',
  },
  cardDesc: {
    fontSize: '15px',
    color: '#64748b',
    lineHeight: '1.6',
    marginBottom: '24px',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '20px',
    borderTop: '2px solid #f1f5f9',
  },
  cardStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#667eea',
    fontWeight: '700',
  },
  statIcon: {
    width: '16px',
    height: '16px',
  },
  cardArrow: {
    width: '20px',
    height: '20px',
    color: '#667eea',
    transition: 'transform 0.3s ease',
  },
  statsSection: {
    marginTop: '60px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '32px',
  },
  sectionIcon: {
    width: '28px',
    height: '28px',
    color: '#667eea',
  },
  sectionTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#1e293b',
    margin: 0,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid rgba(0,0,0,0.04)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  statIconBg: {
    width: '56px',
    height: '56px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
  },
  statCardIcon: {
    width: '28px',
    height: '28px',
    color: 'white',
  },
  statNumber: {
    fontSize: '44px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: '1',
    marginBottom: '10px',
  },
  statLabel: {
    fontSize: '15px',
    color: '#64748b',
    marginBottom: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statChange: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    color: '#10b981',
    fontWeight: '700',
  },
  changeIcon: {
    width: '16px',
    height: '16px',
    color: '#10b981',
  },
  starsWrapper: {
    display: 'flex',
    gap: '4px',
  },
  star: {
    width: '18px',
    height: '18px',
  },
  error: {
    textAlign: 'center',
    padding: '120px 40px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  errorIconWrapper: {
    width: '100px',
    height: '100px',
    margin: '0 auto 32px',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)',
  },
  errorIcon: {
    width: '50px',
    height: '50px',
    color: 'white',
  },
  errorTitle: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: '12px',
  },
  errorText: {
    fontSize: '18px',
    color: '#64748b',
    lineHeight: '1.6',
  },
};

// Add hover effects via a style tag
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    .admin-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.15) !important;
    }
    
    .admin-card:hover > div:first-child {
      transform: scale(1.1) rotate(5deg);
    }
    
    .admin-card:hover svg:last-child {
      transform: translateX(6px);
    }
    
    .stat-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
    }
    
    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }
    
    .stat-card:hover::before {
      transform: scaleX(1);
    }
  `;
  document.head.appendChild(styleSheet);
}

export default AdminDashboard;