import { useEffect, useState } from "react";
import adminUserService from "../../services/adminUserService";
import Navbar from "../../components/layout/Navbar";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await adminUserService.getAllUsers();
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const openUser = async (user) => {
    setSelectedUser(user);
    try {
      const res = await adminUserService.getUserCourses(user._id);
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error(err);
      setCourses([]);
    }
  };

  const toggleStatus = async (userId) => {
    try {
      setProcessing(true);
      await adminUserService.toggleUserStatus(userId);
      await loadUsers();

      if (selectedUser?._id === userId) {
        setSelectedUser((prev) => ({
          ...prev,
          isActive: !prev.isActive,
        }));
      }
    } catch {
      alert("Action not allowed");
    } finally {
      setProcessing(false);
    }
  };

 const removeCourse = async (courseId) => {
  try {
    setProcessing(true);
    await adminUserService.removeCourse(
      selectedUser._id,
      courseId
    );
    openUser(selectedUser);
  } catch {
    alert("Failed to remove course");
  } finally {
    setProcessing(false);
  }
};


  return (
    <>
      <Navbar />

      <div style={styles.page}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.headerIconWrapper}>
              <svg style={styles.headerIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <h1 style={styles.title}>User Management</h1>
              <p style={styles.subtitle}>
                View users, manage access, and control enrollments
              </p>
            </div>
          </div>

          {/* Stats */}
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <svg style={styles.statIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <div>
                <div style={styles.statNumber}>{users.length}</div>
                <div style={styles.statLabel}>Total Users</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <svg style={styles.statIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <div>
                <div style={styles.statNumber}>
                  {users.filter(u => u.isActive).length}
                </div>
                <div style={styles.statLabel}>Active Users</div>
              </div>
            </div>
            <div style={styles.statCard}>
              <svg style={styles.statIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <div>
                <div style={styles.statNumber}>
                  {users.filter(u => u.role === 'admin').length}
                </div>
                <div style={styles.statLabel}>Admins</div>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.layout}>
          {/* USERS LIST */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardHeaderLeft}>
                <svg style={styles.cardHeaderIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <h3 style={styles.cardTitle}>All Users</h3>
              </div>
              <span style={styles.userCount}>{users.length} users</span>
            </div>

            {loading ? (
              <div style={styles.loading}>
                <div style={styles.loader}></div>
                <p style={styles.loadingText}>Loading users…</p>
              </div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.tableHeader}>Name</th>
                      <th style={styles.tableHeader}>Email</th>
                      <th style={styles.tableHeader}>Status</th>
                      <th style={{...styles.tableHeader, textAlign: "right"}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr
                        key={u._id}
                        style={
                          selectedUser?._id === u._id
                            ? styles.activeRow
                            : styles.tableRow
                        }
                        className="user-row"
                      >
                        <td style={styles.tableCell}>
                          <div style={styles.userCell}>
                            <div style={styles.avatarWrapper}>
                              {u.fullName?.charAt(0).toUpperCase()}
                            </div>
                            <span style={styles.userName}>{u.fullName}</span>
                          </div>
                        </td>
                        <td style={styles.tableCell}>
                          <div style={styles.emailCell}>
                            <svg style={styles.emailIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                              <polyline points="22,6 12,13 2,6"/>
                            </svg>
                            {u.email}
                          </div>
                        </td>
                        <td style={styles.tableCell}>
                          <span
                            style={
                              u.role === "admin"
                                ? styles.badgeAdmin
                                : u.isActive
                                ? styles.badgeActive
                                : styles.badgeDisabled
                            }
                          >
                            {u.role === "admin" ? (
                              <>
                                <svg style={styles.badgeIcon} viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                                Admin
                              </>
                            ) : u.isActive ? (
                              <>
                                <svg style={styles.badgeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                Active
                              </>
                            ) : (
                              <>
                                <svg style={styles.badgeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10"/>
                                  <line x1="15" y1="9" x2="9" y2="15"/>
                                  <line x1="9" y1="9" x2="15" y2="15"/>
                                </svg>
                                Disabled
                              </>
                            )}
                          </span>
                        </td>
                        <td style={{...styles.tableCell, textAlign: "right"}}>
                          <div style={styles.actions}>
                            <button
                              style={styles.btn}
                              onClick={() => openUser(u)}
                              className="view-btn"
                            >
                              <svg style={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                              View
                            </button>

                            {u.role !== "admin" && (
                              <button
                                style={
                                  u.isActive
                                    ? styles.btnDanger
                                    : styles.btnSuccess
                                }
                                disabled={processing}
                                onClick={() => toggleStatus(u._id)}
                                className={u.isActive ? "danger-btn" : "success-btn"}
                              >
                                <svg style={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  {u.isActive ? (
                                    <>
                                      <circle cx="12" cy="12" r="10"/>
                                      <line x1="15" y1="9" x2="9" y2="15"/>
                                      <line x1="9" y1="9" x2="15" y2="15"/>
                                    </>
                                  ) : (
                                    <polyline points="20 6 9 17 4 12"/>
                                  )}
                                </svg>
                                {u.isActive ? "Disable" : "Enable"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* USER DETAILS */}
          <div style={styles.card}>
            {!selectedUser ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIconWrapper}>
                  <svg style={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <p style={styles.emptyText}>
                  Select a user to view assigned courses
                </p>
              </div>
            ) : (
              <>
                <div style={styles.userDetailsHeader}>
                  <div style={styles.userDetailsAvatar}>
                    {selectedUser.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={styles.userDetailsName}>
                      {selectedUser.fullName}
                    </h3>
                    <p style={styles.userMeta}>
                      <svg style={styles.metaIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      {selectedUser.email}
                    </p>
                  </div>
                </div>

                <div style={styles.divider} />

                <div style={styles.sectionHeader}>
                  <svg style={styles.sectionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                  <h4 style={styles.sectionTitle}>Assigned Courses</h4>
                  <span style={styles.courseBadge}>{courses.length}</span>
                </div>

                {courses.length === 0 ? (
                  <div style={styles.noCoursesState}>
                    <svg style={styles.noCoursesIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                    <p style={styles.noCourseText}>No courses assigned</p>
                  </div>
                ) : (
                  <ul style={styles.courseList}>
                    {courses.map((c) => (
                      <li key={c.courseUuid} style={styles.courseItem} className="course-item">
                        <div style={styles.courseItemLeft}>
                          <div style={styles.courseIconWrapper}>
                            <svg style={styles.courseIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                            </svg>
                          </div>
                          <span style={styles.courseName}>{c.courseName}</span>
                        </div>
                        <button
                          style={styles.removeBtn}
                          disabled={processing}
                          onClick={() => removeCourse(c.courseId)}
                          className="remove-btn"
                        >
                          <svg style={styles.removeBtnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminUsers;


/* ===================== STYLES ===================== */

const styles = {
  page: {
    padding: "32px",
    background: "linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%)",
    minHeight: "100vh",
  },
  header: {
    marginBottom: "32px",
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "24px",
  },
  headerIconWrapper: {
    width: "64px",
    height: "64px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
  },
  headerIcon: {
    width: "32px",
    height: "32px",
    color: "white",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "800",
    color: "#1e293b",
  },
  subtitle: {
    marginTop: "6px",
    color: "#64748b",
    fontSize: "16px",
    fontWeight: "500",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  },
  statCard: {
    background: "white",
    padding: "24px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    border: "1px solid rgba(0,0,0,0.04)",
    transition: "all 0.3s ease",
  },
  statIcon: {
    width: "40px",
    height: "40px",
    padding: "10px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "12px",
    color: "white",
    flexShrink: 0,
  },
  statNumber: {
    fontSize: "28px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    lineHeight: "1",
    marginBottom: "4px",
  },
  statLabel: {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: "24px",
  },
  card: {
    background: "#fff",
    borderRadius: "20px",
    padding: "28px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.04)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    paddingBottom: "20px",
    borderBottom: "2px solid #f1f5f9",
  },
  cardHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  cardHeaderIcon: {
    width: "24px",
    height: "24px",
    color: "#667eea",
  },
  cardTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "800",
    color: "#1e293b",
  },
  userCount: {
    padding: "6px 14px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderRadius: "50px",
    fontSize: "13px",
    fontWeight: "700",
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    gap: "20px",
  },
  loader: {
    width: "50px",
    height: "50px",
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #667eea",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    color: "#64748b",
    fontSize: "16px",
    fontWeight: "500",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  tableHeaderRow: {
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
  },
  tableHeader: {
    padding: "16px 12px",
    textAlign: "left",
    color: "#475569",
    fontWeight: "700",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tableRow: {
    borderBottom: "1px solid #f1f5f9",
    transition: "all 0.3s ease",
  },
  activeRow: {
    background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    borderLeft: "4px solid #667eea",
  },
  tableCell: {
    padding: "16px 12px",
    color: "#64748b",
  },
  userCell: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatarWrapper: {
    width: "40px",
    height: "40px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "800",
    fontSize: "16px",
    flexShrink: 0,
  },
  userName: {
    fontWeight: "600",
    color: "#1e293b",
  },
  emailCell: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  emailIcon: {
    width: "16px",
    height: "16px",
    color: "#667eea",
    flexShrink: 0,
  },
  badgeActive: {
    background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
    color: "#065f46",
    padding: "6px 12px",
    borderRadius: "50px",
    fontSize: "12px",
    fontWeight: "700",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    border: "1px solid #86efac",
  },
  badgeDisabled: {
    background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
    color: "#991b1b",
    padding: "6px 12px",
    borderRadius: "50px",
    fontSize: "12px",
    fontWeight: "700",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    border: "1px solid #fca5a5",
  },
  badgeAdmin: {
    background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
    color: "#78350f",
    padding: "6px 12px",
    borderRadius: "50px",
    fontSize: "12px",
    fontWeight: "700",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    border: "1px solid #fbbf24",
  },
  badgeIcon: {
    width: "14px",
    height: "14px",
  },
  actions: {
    display: "flex",
    gap: "8px",
    justifyContent: "flex-end",
  },
  btn: {
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    border: "2px solid #e2e8f0",
    padding: "8px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.3s ease",
  },
  btnDanger: {
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
  },
  btnSuccess: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
  },
  btnIcon: {
    width: "16px",
    height: "16px",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
  },
  emptyIconWrapper: {
    width: "80px",
    height: "80px",
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
    border: "2px solid #e2e8f0",
  },
  emptyIcon: {
    width: "40px",
    height: "40px",
    color: "#94a3b8",
  },
  emptyText: {
    color: "#64748b",
    fontSize: "15px",
    fontWeight: "500",
    margin: 0,
  },
  userDetailsHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px",
  },
  userDetailsAvatar: {
    width: "64px",
    height: "64px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "28px",
    fontWeight: "800",
    boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
  },
  userDetailsName: {
    margin: "0 0 6px 0",
    fontSize: "22px",
    fontWeight: "800",
    color: "#1e293b",
  },
  userMeta: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  metaIcon: {
    width: "16px",
    height: "16px",
    color: "#667eea",
  },
  divider: {
    height: "2px",
    background: "linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%)",
    margin: "24px 0",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  sectionIcon: {
    width: "20px",
    height: "20px",
    color: "#667eea",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#1e293b",
    margin: 0,
    flex: 1,
  },
  courseBadge: {
    padding: "4px 10px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderRadius: "50px",
    fontSize: "12px",
    fontWeight: "700",
  },
  noCoursesState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 20px",
    gap: "16px",
  },
  noCoursesIcon: {
    width: "48px",
    height: "48px",
    color: "#cbd5e0",
  },
  noCourseText: {
    color: "#94a3b8",
    fontSize: "14px",
    margin: 0,
  },
  courseList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  courseItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    transition: "all 0.3s ease",
  },
  courseItemLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
  },
  courseIconWrapper: {
    width: "40px",
    height: "40px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  courseIcon: {
    width: "20px",
    height: "20px",
    color: "white",
  },
  courseName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1e293b",
  },
  removeBtn: {
    background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
    color: "#991b1b",
    border: "2px solid #fca5a5",
    padding: "8px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.3s ease",
  },
  removeBtnIcon: {
    width: "16px",
    height: "16px",
  },
};

// Add keyframe animations and hover effects via a style tag
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .user-row:hover {
      background: #f8fafc !important;
    }
    
    .view-btn:hover {
      background: white !important;
      border-color: #cbd5e0 !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
    }
    
    .danger-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4) !important;
    }
    
    .success-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4) !important;
    }
    
    .course-item:hover {
      background: white !important;
      border-color: #cbd5e0 !important;
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
    }
    
    .remove-btn:hover {
      background: linear-gradient(135deg, #fecaca 0%, #f87171 100%) !important;
      border-color: #f87171 !important;
      transform: scale(1.05);
    }
  `;
  document.head.appendChild(styleSheet);
}
