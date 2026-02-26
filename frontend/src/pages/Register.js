import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/videos');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundDecoration}></div>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </div>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join our learning platform today</p>
        </div>

        {error && (
          <div style={styles.error}>
            <svg style={styles.errorIcon} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <svg style={styles.labelIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onFocus={() => setFocusedField('fullName')}
              onBlur={() => setFocusedField('')}
              required
              style={{
                ...styles.input,
                ...(focusedField === 'fullName' ? styles.inputFocused : {})
              }}
              placeholder="John Doe"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <svg style={styles.labelIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField('')}
              required
              style={{
                ...styles.input,
                ...(focusedField === 'email' ? styles.inputFocused : {})
              }}
              placeholder="you@example.com"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <svg style={styles.labelIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField('')}
              required
              style={{
                ...styles.input,
                ...(focusedField === 'password' ? styles.inputFocused : {})
              }}
              placeholder="At least 6 characters"
              minLength="6"
            />
            <div style={styles.passwordHint}>
              <svg style={styles.hintIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              Minimum 6 characters required
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {})
            }}
          >
            {loading ? (
              <span style={styles.buttonContent}>
                <span style={styles.spinner}></span>
                Creating Account...
              </span>
            ) : (
              <span style={styles.buttonContent}>
                Create Account
                <svg style={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
              </span>
            )}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>or</span>
        </div>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>
            Sign in here
            <svg style={styles.linkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundDecoration: {
    position: 'absolute',
    top: '-50%',
    right: '-50%',
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
    borderRadius: '50%',
  },
  card: {
    backgroundColor: 'white',
    padding: '48px',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    width: '100%',
    maxWidth: '440px',
    position: 'relative',
    animation: 'slideUp 0.5s ease-out',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  iconWrapper: {
    width: '64px',
    height: '64px',
    margin: '0 auto 20px',
    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 16px rgba(17, 153, 142, 0.4)',
  },
  icon: {
    width: '32px',
    height: '32px',
    color: 'white',
  },
  title: {
    margin: '0 0 8px 0',
    color: '#1a202c',
    fontSize: '28px',
    fontWeight: '700',
  },
  subtitle: {
    margin: 0,
    color: '#718096',
    fontSize: '14px',
  },
  error: {
    backgroundColor: '#fff5f5',
    color: '#c53030',
    padding: '14px 16px',
    borderRadius: '12px',
    marginBottom: '24px',
    border: '1px solid #feb2b2',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
  },
  errorIcon: {
    width: '20px',
    height: '20px',
    flexShrink: 0,
  },
  formGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    color: '#2d3748',
    fontWeight: '600',
    fontSize: '14px',
  },
  labelIcon: {
    width: '16px',
    height: '16px',
    color: '#11998e',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '15px',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    outline: 'none',
    backgroundColor: '#f7fafc',
  },
  inputFocused: {
    borderColor: '#11998e',
    backgroundColor: 'white',
    boxShadow: '0 0 0 3px rgba(17, 153, 142, 0.1)',
  },
  passwordHint: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '8px',
    fontSize: '12px',
    color: '#718096',
  },
  hintIcon: {
    width: '14px',
    height: '14px',
    color: '#a0aec0',
  },
  button: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(17, 153, 142, 0.4)',
    marginTop: '8px',
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  buttonIcon: {
    width: '18px',
    height: '18px',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block',
  },
  divider: {
    position: 'relative',
    margin: '32px 0',
    textAlign: 'center',
  },
  dividerText: {
    backgroundColor: 'white',
    padding: '0 16px',
    color: '#a0aec0',
    fontSize: '13px',
    fontWeight: '500',
    position: 'relative',
    zIndex: 1,
  },
  footer: {
    textAlign: 'center',
    margin: 0,
    color: '#4a5568',
    fontSize: '14px',
  },
  link: {
    color: '#11998e',
    textDecoration: 'none',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s ease',
  },
  linkIcon: {
    width: '14px',
    height: '14px',
  },
};

// Add keyframe animations via a style tag
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    
    button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(17, 153, 142, 0.5) !important;
    }
    
    button:active:not(:disabled) {
      transform: translateY(0);
    }
    
    input:hover:not(:focus) {
      border-color: #cbd5e0 !important;
    }
    
    a:hover {
      color: #0d7a6f !important;
      gap: 6px !important;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Register;