import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import courseService from '../services/courseService';

import Navbar from '../components/layout/Navbar';

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
 
  const loadCourses = useCallback(async () => {
    try {
      const data = await courseService.getAllCourses();
      setCourses(data.courses);
    } catch (err) {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const formatPrice = (prices) => {
    if (!prices || prices.length === 0) return 'Contact for price';
    const price = prices[0];
    return `${price.currency} ${parseFloat(price.price).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={styles.loading}>
          <div style={styles.loader}></div>
          <p style={styles.loadingText}>Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <Navbar />

      <div style={styles.container}>
        {/* Hero Section */}
        <div style={styles.hero}>
          <div style={styles.heroBackground}></div>
          <div style={styles.heroContent}>
            <div style={styles.heroBadge}>
              <svg style={styles.heroBadgeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              Medical Education Excellence
            </div>
            <h1 style={styles.heroTitle}>Explore Our Medical Courses</h1>
            <p style={styles.heroSubtitle}>
              Advanced fellowship programs in collaboration with Apollo Hospitals
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{...styles.statIconWrapper, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <svg style={styles.statIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <div>
              <div style={styles.statNumber}>{courses.length}</div>
              <div style={styles.statLabel}>Available Programs</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIconWrapper, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
              <svg style={styles.statIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <div style={styles.statNumber}>
                {courses.reduce((sum, c) => sum + (c.active_learners || 0), 0)}
              </div>
              <div style={styles.statLabel}>Active Learners</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIconWrapper, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
              <svg style={styles.statIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div>
              <div style={styles.statNumber}>4.5</div>
              <div style={styles.statLabel}>Average Rating</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIconWrapper, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'}}>
              <svg style={styles.statIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <div>
              <div style={styles.statNumber}>
                {courses.reduce((sum, c) => sum + (c.rating_count || 0), 0)}
              </div>
              <div style={styles.statLabel}>Total Reviews</div>
            </div>
          </div>
        </div>

        {error && (
          <div style={styles.error}>
            <svg style={styles.errorIcon} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {error}
          </div>
        )}

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIconWrapper}>
              <svg style={styles.emptyIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <h3 style={styles.emptyTitle}>No courses available yet</h3>
            <p style={styles.emptyText}>Check back soon for new programs</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {courses.map((course) => (
              <Link
                key={course.uuid}
                to={`/course/${course.uuid}`}
                style={styles.card}
                className="course-card"
              >
                {/* Banner Image */}
                <div style={styles.banner}>
                  {course.banner ? (
                    <img 
                      src={course.banner} 
                      alt={course.banner_alt_tag || course.course_name}
                      style={styles.bannerImg}
                    />
                  ) : (
                    <div style={styles.placeholderBanner}>
                      <svg style={styles.placeholderIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                      </svg>
                    </div>
                  )}
                  <div style={styles.courseType}>
                    <svg style={styles.courseTypeIcon} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    {course.course_type_name}
                  </div>
                  <div style={styles.bannerOverlay}></div>
                </div>

                {/* Card Content */}
                <div style={styles.cardBody}>
                  <h3 style={styles.courseTitle}>{course.course_name}</h3>
                  
                  <p style={styles.courseDesc}>
                    {course.one_line_description?.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </p>

                  {/* Course Meta */}
                  <div style={styles.courseMeta}>
                    <div style={styles.metaItem}>
                      <svg style={styles.metaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span>{course.duration_years} Year Program</span>
                    </div>
                    <div style={styles.metaItem}>
                      <svg style={styles.metaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      <span>{course.active_learners || 0} Enrolled</span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div style={styles.rating}>
                    <div style={styles.ratingStars}>
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i}
                          style={styles.starIcon}
                          viewBox="0 0 24 24" 
                          fill={i < Math.floor(course.rating || 4) ? '#fbbf24' : '#e5e7eb'}
                          stroke="none"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      ))}
                    </div>
                    <span style={styles.ratingText}>
                      {course.rating || 4.0} ({course.rating_count || 0} reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <div style={styles.priceSection}>
                    <div style={styles.priceWrapper}>
                      <div style={styles.priceLabel}>Course Fee</div>
                      <div style={styles.price}>{formatPrice(course.prices_inr)}</div>
                    </div>
                    {course.prices_inr?.[0]?.emi_price && (
                      <div style={styles.emiText}>
                        <svg style={styles.emiIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                          <line x1="1" y1="10" x2="23" y2="10"/>
                        </svg>
                        EMI from ₹{parseFloat(course.prices_inr[0].emi_price).toLocaleString()}/mo
                      </div>
                    )}
                  </div>

                  {/* Eligibility */}
                  {course.eligibility && course.eligibility.length > 0 && (
                    <div style={styles.eligibility}>
                      <svg style={styles.eligibilityIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                      <div>
                        <strong style={styles.eligibilityLabel}>Eligibility:</strong>
                        <span style={styles.eligibilityText}>{course.eligibility.join(', ')}</span>
                      </div>
                    </div>
                  )}

                  {/* View Button */}
                  <button style={styles.viewButton} className="view-button">
                    <span>View Course Details</span>
                    <svg style={styles.viewButtonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
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
  hero: {
    position: 'relative',
    marginBottom: '60px',
    padding: '80px 40px',
    borderRadius: '24px',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 60%)',
  },
  heroContent: {
    position: 'relative',
    textAlign: 'center',
    color: 'white',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
    padding: '10px 20px',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '24px',
    border: '1px solid rgba(255,255,255,0.3)',
  },
  heroBadgeIcon: {
    width: '18px',
    height: '18px',
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: '800',
    marginBottom: '16px',
    textShadow: '0 2px 20px rgba(0,0,0,0.2)',
  },
  heroSubtitle: {
    fontSize: '20px',
    maxWidth: '700px',
    margin: '0 auto',
    opacity: 0.95,
    lineHeight: '1.6',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '24px',
    marginBottom: '60px',
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: '28px',
    borderRadius: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(0,0,0,0.04)',
  },
  statIconWrapper: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  statIconSvg: {
    width: '28px',
    height: '28px',
    color: 'white',
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: '1',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  loading: {
    textAlign: 'center',
    padding: '120px 20px',
  },
  loader: {
    width: '60px',
    height: '60px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    margin: '0 auto 24px',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '18px',
    color: '#64748b',
    fontWeight: '500',
  },
  error: {
    backgroundColor: '#fff5f5',
    color: '#c53030',
    padding: '20px 24px',
    borderRadius: '16px',
    marginBottom: '30px',
    border: '1px solid #feb2b2',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '15px',
    fontWeight: '500',
  },
  errorIcon: {
    width: '24px',
    height: '24px',
    flexShrink: 0,
  },
  empty: {
    textAlign: 'center',
    padding: '100px 20px',
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  },
  emptyIconWrapper: {
    width: '100px',
    height: '100px',
    margin: '0 auto 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconSvg: {
    width: '50px',
    height: '50px',
    color: 'white',
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '16px',
    color: '#64748b',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '32px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all 0.4s ease',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid rgba(0,0,0,0.04)',
  },
  banner: {
    position: 'relative',
    height: '240px',
    overflow: 'hidden',
  },
  bannerImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
  },
  placeholderBanner: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    width: '80px',
    height: '80px',
    color: 'rgba(255,255,255,0.9)',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100px',
    background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)',
  },
  courseType: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    backgroundColor: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    color: '#667eea',
    padding: '8px 16px',
    borderRadius: '50px',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  courseTypeIcon: {
    width: '14px',
    height: '14px',
  },
  cardBody: {
    padding: '28px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  courseTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '12px',
    lineHeight: '1.4',
  },
  courseDesc: {
    fontSize: '15px',
    color: '#64748b',
    lineHeight: '1.7',
    marginBottom: '20px',
    flex: 1,
  },
  courseMeta: {
    display: 'flex',
    gap: '24px',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '2px solid #f1f5f9',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500',
  },
  metaIcon: {
    width: '18px',
    height: '18px',
    color: '#667eea',
  },
  rating: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  ratingStars: {
    display: 'flex',
    gap: '2px',
  },
  starIcon: {
    width: '18px',
    height: '18px',
  },
  ratingText: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '600',
  },
  priceSection: {
    marginBottom: '20px',
    padding: '20px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
  },
  priceWrapper: {
    marginBottom: '8px',
  },
  priceLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  price: {
    fontSize: '32px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  emiText: {
    fontSize: '13px',
    color: '#10b981',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  emiIcon: {
    width: '16px',
    height: '16px',
  },
  eligibility: {
    fontSize: '13px',
    color: '#475569',
    padding: '16px',
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    borderRadius: '12px',
    marginBottom: '20px',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    border: '1px solid #fbbf24',
  },
  eligibilityIcon: {
    width: '18px',
    height: '18px',
    color: '#f59e0b',
    flexShrink: 0,
    marginTop: '2px',
  },
  eligibilityLabel: {
    color: '#78350f',
    marginRight: '4px',
  },
  eligibilityText: {
    color: '#92400e',
  },
  viewButton: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  },
  viewButtonIcon: {
    width: '18px',
    height: '18px',
    transition: 'transform 0.3s ease',
  },
};

// Add keyframe animations and hover effects via a style tag
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    
    .course-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.15) !important;
    }
    
    .course-card:hover img {
      transform: scale(1.08);
    }
    
    .view-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4) !important;
    }
    
    .view-button:hover svg {
      transform: translateX(4px);
    }
    
    .view-button:active {
      transform: translateY(0);
    }
    
    ${styles.statCard && `
      .stat-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 30px rgba(0,0,0,0.12) !important;
      }
    `}
  `;
  
  // Add class to stat cards for hover effect
  document.head.appendChild(styleSheet);
}

export default CourseList;