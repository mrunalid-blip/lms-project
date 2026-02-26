import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import courseService from '../services/courseService';
import Navbar from '../components/layout/Navbar';

function CourseDetails() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCourseDetails();
    checkEnrollmentStatus();
  }, [uuid]);

  const loadCourseDetails = async () => {
    try {
      const data = await courseService.getCourseById(uuid);
      setCourse(data.course);
    } catch (err) {
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

const checkEnrollmentStatus = async () => {
  try {
    const enrolled = await courseService.checkEnrollment(uuid);
    setIsEnrolled(enrolled);
  } catch (err) {
    console.error('Error checking enrollment:', err);
  }
};


  const handleEnroll = async () => {
  if (isEnrolled) return;

  setEnrolling(true);
  try {
    await courseService.enrollInCourse(uuid); // ONLY UUID
    setIsEnrolled(true);
    navigate('/videos'); // redirect to LMS
  } catch (err) {
    console.error(err.response?.data || err);
    alert(err.response?.data?.error || 'Enrollment failed');
  } finally {
    setEnrolling(false);
  }
};


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
          <p>Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.error}>{error || 'Course not found'}</div>
          <button onClick={() => navigate('/')} style={styles.backButton}>
            ← Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <Navbar />

      <div style={styles.container}>
        {/* Back Button */}
        <button onClick={() => navigate('/')} style={styles.backButton}>
          ← Back to All Courses
        </button>

        {/* Course Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.courseType}>{course.course_type_name}</div>
            <h1 style={styles.title}>{course.course_name}</h1>
            <p style={styles.subtitle}>
              {course.one_line_description?.replace(/<[^>]*>/g, '')}
            </p>

            {/* Course Meta */}
            <div style={styles.metaGrid}>
              <div style={styles.metaItem}>
                <span style={styles.metaIcon}>⏱️</span>
                <div>
                  <div style={styles.metaLabel}>Duration</div>
                  <div style={styles.metaValue}>{course.duration_years} Year Program</div>
                </div>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaIcon}>👥</span>
                <div>
                  <div style={styles.metaLabel}>Enrolled</div>
                  <div style={styles.metaValue}>{course.active_learners || 0} Students</div>
                </div>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaIcon}>⭐</span>
                <div>
                  <div style={styles.metaLabel}>Rating</div>
                  <div style={styles.metaValue}>
                    {course.rating || 4.0} ({course.rating_count || 0} reviews)
                  </div>
                </div>
              </div>
            </div>

            {/* Enrollment Status Badge */}
            {isEnrolled && (
              <div style={styles.enrolledBadge}>
                <span style={styles.checkIcon}>✓</span>
                You're enrolled in this course
              </div>
            )}
          </div>

          {/* Banner Image */}
          <div style={styles.bannerSection}>
            {course.banner ? (
              <img 
                src={course.banner} 
                alt={course.banner_alt_tag || course.course_name}
                style={styles.bannerImage}
              />
            ) : (
              <div style={styles.placeholderBanner}>
                <span style={styles.placeholderIcon}>🎓</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={styles.contentGrid}>
          {/* Left Column - Course Details */}
          <div style={styles.mainContent}>
            {/* Description */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>About This Course</h2>
              <div 
                style={styles.description}
                dangerouslySetInnerHTML={{ __html: course.one_line_description }}
              />
            </div>

            {/* Eligibility */}
            {course.eligibility && course.eligibility.length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Eligibility Criteria</h2>
                <ul style={styles.eligibilityList}>
                  {course.eligibility.map((item, index) => (
                    <li key={index} style={styles.eligibilityItem}>
                      <span style={styles.bulletIcon}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* What You'll Learn */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>What You'll Learn</h2>
              <div style={styles.learningGrid}>
                <div style={styles.learningItem}>
                  <span style={styles.learningIcon}>📚</span>
                  <div>Comprehensive medical curriculum</div>
                </div>
                <div style={styles.learningItem}>
                  <span style={styles.learningIcon}>🏥</span>
                  <div>Clinical practice experience</div>
                </div>
                <div style={styles.learningItem}>
                  <span style={styles.learningIcon}>👨‍⚕️</span>
                  <div>Expert faculty guidance</div>
                </div>
                <div style={styles.learningItem}>
                  <span style={styles.learningIcon}>🎓</span>
                  <div>Professional certification</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Enrollment Card */}
          <div style={styles.sidebar}>
            <div style={styles.enrollmentCard}>
              {/* Price */}
              <div style={styles.priceSection}>
                <div style={styles.price}>{formatPrice(course.prices_inr)}</div>
                {course.prices_inr?.[0]?.emi_price && (
                  <div style={styles.emiText}>
                    EMI starting ₹{parseFloat(course.prices_inr[0].emi_price).toLocaleString()}/month
                  </div>
                )}
              </div>

              {/* Enrollment Button */}
              {!isEnrolled ? (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  style={enrolling ? styles.enrollButtonDisabled : styles.enrollButton}
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              ) : (
                <button
                  onClick={() => navigate('/videos')}
                  style={styles.goToDashboardButton}
                >
                  Go to My Dashboard →
                </button>
              )}

              {/* Features */}
              <div style={styles.features}>
                <div style={styles.feature}>
                  <span style={styles.featureIcon}>🎥</span>
                  <span>Video lectures</span>
                </div>
                <div style={styles.feature}>
                  <span style={styles.featureIcon}>📝</span>
                  <span>Assignments & quizzes</span>
                </div>
                <div style={styles.feature}>
                  <span style={styles.featureIcon}>📱</span>
                  <span>Mobile access</span>
                </div>
                <div style={styles.feature}>
                  <span style={styles.featureIcon}>🏆</span>
                  <span>Certificate of completion</span>
                </div>
                <div style={styles.feature}>
                  <span style={styles.featureIcon}>♾️</span>
                  <span>Lifetime access</span>
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
    backgroundColor: '#f8f9fa',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '30px',
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#0066cc',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    marginBottom: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  loading: {
    textAlign: 'center',
    padding: '80px 20px',
  },
  loader: {
    width: '50px',
    height: '50px',
    border: '5px solid #e0e0e0',
    borderTop: '5px solid #0066cc',
    borderRadius: '50%',
    margin: '0 auto 20px',
    animation: 'spin 1s linear infinite',
  },
  error: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  header: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '40px',
    marginBottom: '40px',
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  headerContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  courseType: {
    display: 'inline-block',
    backgroundColor: '#ff6b6b',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: '16px',
    width: 'fit-content',
  },
  title: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '16px',
    lineHeight: '1.3',
  },
  subtitle: {
    fontSize: '18px',
    color: '#7f8c8d',
    lineHeight: '1.6',
    marginBottom: '30px',
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '20px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  metaIcon: {
    fontSize: '28px',
  },
  metaLabel: {
    fontSize: '13px',
    color: '#7f8c8d',
    marginBottom: '4px',
  },
  metaValue: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#2c3e50',
  },
  enrolledBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    width: 'fit-content',
  },
  checkIcon: {
    fontSize: '18px',
    fontWeight: '700',
  },
  bannerSection: {
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '12px',
  },
  placeholderBanner: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #0066cc 0%, #00a896 100%)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: '100px',
    color: 'rgba(255,255,255,0.9)',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '30px',
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '20px',
  },
  description: {
    fontSize: '16px',
    color: '#7f8c8d',
    lineHeight: '1.8',
  },
  eligibilityList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  eligibilityItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px',
    marginBottom: '8px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    fontSize: '15px',
    color: '#2c3e50',
  },
  bulletIcon: {
    color: '#00a896',
    fontWeight: '700',
    fontSize: '18px',
  },
  learningGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  learningItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#2c3e50',
    fontWeight: '500',
  },
  learningIcon: {
    fontSize: '24px',
  },
  sidebar: {
    position: 'sticky',
    top: '30px',
    height: 'fit-content',
  },
  enrollmentCard: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
  },
  priceSection: {
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '2px solid #e0e0e0',
  },
  price: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#0066cc',
    marginBottom: '8px',
  },
  emiText: {
    fontSize: '14px',
    color: '#00a896',
    fontWeight: '500',
  },
  enrollButton: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '24px',
    transition: 'background-color 0.3s',
  },
  enrollButtonDisabled: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#cccccc',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'not-allowed',
    marginBottom: '24px',
  },
  goToDashboardButton: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#00a896',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '24px',
    transition: 'background-color 0.3s',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    color: '#2c3e50',
  },
  featureIcon: {
    fontSize: '20px',
  },
};

export default CourseDetails;