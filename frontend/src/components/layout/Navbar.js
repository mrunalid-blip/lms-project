import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.navbarGlow}></div>
      <div style={styles.container}>
        {/* Logo */}
        <Link to="/videos" style={styles.logo} className="logo-link">
          <div style={styles.logoIcon}>
            <svg style={styles.logoIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div>
            <div style={styles.logoText}>MedLearn</div>
            <div style={styles.logoSubtext}>Professional Medical Education</div>
          </div>
        </Link>

        {/* Navigation Links */}
        <div style={styles.navLinks}>
          <Link to="/courses" style={styles.navLink} className="nav-link">
            <svg style={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            <span>Courses</span>
          </Link>
          <Link to="/videos" style={styles.navLink} className="nav-link">
            <svg style={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span>My Dashboard</span>
          </Link>
          {isAdmin && (
            <Link to="/admin" style={styles.adminLink} className="admin-link">
              <svg style={styles.adminIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m-6-6h6m6 0h-6"/>
                <path d="M4.2 4.2l4.2 4.2m7.2 0l4.2-4.2M4.2 19.8l4.2-4.2m7.2 0l4.2 4.2"/>
              </svg>
              <span>Admin Panel</span>
            </Link>
          )}
        </div>

        {/* User Menu */}
        <div style={styles.userMenu}>
          <div
            style={styles.userAvatar}
            onClick={() => setShowDropdown(!showDropdown)}
            className="user-avatar"
          >
            <span style={styles.avatarText}>
              {user?.fullName?.charAt(0).toUpperCase()}
            </span>
            <div style={styles.avatarRing}></div>
          </div>

          {showDropdown && (
            <div style={styles.dropdown} className="dropdown-menu">
              <div style={styles.dropdownHeader}>
                <div style={styles.dropdownAvatar}>
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
                <div style={styles.dropdownUserInfo}>
                  <strong style={styles.dropdownUserName}>{user?.fullName}</strong>
                  <small style={styles.userEmail}>{user?.email}</small>
                </div>
                <span style={styles.roleBadge}>
                  {user?.role === "admin" ? (
                    <>
                      <svg style={styles.badgeIcon} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      Admin
                    </>
                  ) : (
                    <>
                      <svg style={styles.badgeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      Learner
                    </>
                  )}
                </span>
              </div>
              <div style={styles.dropdownDivider}></div>
              <button
                style={styles.dropdownItem}
                onClick={() => navigate("/profile")}
                className="dropdown-item"
              >
                <svg style={styles.dropdownIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Profile
              </button>
              <button
                style={styles.dropdownItem}
                onClick={() => navigate("/settings")}
                className="dropdown-item"
              >
                <svg style={styles.dropdownIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6m-6-6h6m6 0h-6"/>
                  <path d="M4.2 4.2l4.2 4.2m7.2 0l4.2-4.2M4.2 19.8l4.2-4.2m7.2 0l4.2 4.2"/>
                </svg>
                Settings
              </button>
              <div style={styles.dropdownDivider}></div>
              <button 
                style={styles.dropdownItemDanger} 
                onClick={handleLogout}
                className="dropdown-item-danger"
              >
                <svg style={styles.dropdownIconDanger} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    backdropFilter: "blur(10px)",
  },
  navbarGlow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "2px",
    background: "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%)",
    backgroundSize: "200% 100%",
    animation: "gradientShift 3s ease infinite",
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "16px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    textDecoration: "none",
    color: "#1e293b",
    transition: "transform 0.3s ease",
  },
  logoIcon: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    width: "54px",
    height: "54px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
    transition: "all 0.3s ease",
  },
  logoIconSvg: {
    width: "28px",
    height: "28px",
    color: "white",
  },
  logoText: {
    fontSize: "26px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.5px",
  },
  logoSubtext: {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  navLinks: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  navLink: {
    textDecoration: "none",
    color: "#475569",
    fontSize: "15px",
    fontWeight: "600",
    padding: "10px 18px",
    borderRadius: "12px",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    position: "relative",
  },
  navIcon: {
    width: "18px",
    height: "18px",
    color: "#667eea",
  },
  adminLink: {
    textDecoration: "none",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    padding: "10px 18px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    boxShadow: "0 4px 12px rgba(245, 87, 108, 0.3)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease",
  },
  adminIcon: {
    width: "18px",
    height: "18px",
    color: "white",
  },
  userMenu: {
    position: "relative",
  },
  userAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
    position: "relative",
    transition: "all 0.3s ease",
  },
  avatarRing: {
    position: "absolute",
    top: "-3px",
    left: "-3px",
    right: "-3px",
    bottom: "-3px",
    borderRadius: "50%",
    border: "2px solid transparent",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  avatarText: {
    color: "#ffffff",
    fontSize: "20px",
    fontWeight: "800",
  },
  dropdown: {
    position: "absolute",
    top: "60px",
    right: 0,
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
    minWidth: "280px",
    overflow: "hidden",
    border: "1px solid rgba(0,0,0,0.06)",
    animation: "dropdownSlide 0.2s ease-out",
  },
  dropdownHeader: {
    padding: "24px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  dropdownAvatar: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.2)",
    backdropFilter: "blur(10px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "800",
    marginBottom: "8px",
    border: "2px solid rgba(255,255,255,0.3)",
  },
  dropdownUserInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  dropdownUserName: {
    fontSize: "18px",
    fontWeight: "700",
  },
  userEmail: {
    color: "rgba(255,255,255,0.8)",
    fontSize: "13px",
    fontWeight: "500",
  },
  roleBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    backgroundColor: "rgba(255,255,255,0.95)",
    color: "#667eea",
    borderRadius: "50px",
    fontSize: "12px",
    fontWeight: "700",
    width: "fit-content",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  badgeIcon: {
    width: "14px",
    height: "14px",
  },
  dropdownDivider: {
    height: "1px",
    background: "linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%)",
    margin: "8px 0",
  },
  dropdownItem: {
    width: "100%",
    padding: "14px 24px",
    border: "none",
    backgroundColor: "transparent",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "500",
    color: "#475569",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  dropdownIcon: {
    width: "18px",
    height: "18px",
    color: "#667eea",
  },
  dropdownItemDanger: {
    width: "100%",
    padding: "14px 24px",
    border: "none",
    backgroundColor: "transparent",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    color: "#ef4444",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  dropdownIconDanger: {
    width: "18px",
    height: "18px",
    color: "#ef4444",
  },
};

// Add keyframe animations and hover effects via a style tag
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes gradientShift {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }
    
    @keyframes dropdownSlide {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .logo-link:hover {
      transform: translateX(4px);
    }
    
    .logo-link:hover > div:first-child {
      transform: rotate(-5deg) scale(1.05);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
    }
    
    .nav-link:hover {
      background-color: #f1f5f9 !important;
      color: #667eea !important;
      transform: translateY(-2px);
    }
    
    .nav-link:hover svg {
      transform: scale(1.1);
    }
    
    .admin-link:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(245, 87, 108, 0.4) !important;
    }
    
    .user-avatar:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
    }
    
    .user-avatar:hover .avatar-ring {
      opacity: 1 !important;
    }
    
    .dropdown-item:hover {
      background-color: #f8fafc !important;
      padding-left: 28px !important;
    }
    
    .dropdown-item-danger:hover {
      background-color: #fef2f2 !important;
      padding-left: 28px !important;
    }
    
    .dropdown-menu {
      animation: dropdownSlide 0.2s ease-out;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Navbar;