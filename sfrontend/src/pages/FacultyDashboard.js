import React, { useEffect, useState } from "react";
import axios from "axios";

function FacultyDashboard() {
  const [selectedClass, setSelectedClass] = useState(null);

  const [code, setCode] = useState("");
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);

  const facultyName = localStorage.getItem("facultyName") || "Faculty";
  const subject = localStorage.getItem("facultySubject") || "Operating Systems";
  const facultyEmail =
    localStorage.getItem("facultyEmail") || "faculty@college.com";

  const API_BASE = "http://localhost:8080/auth";

  const classOptions = ["AIDS-A"];

  const className = selectedClass;

  const chooseClass = (cls) => {
    setSelectedClass(cls);
    localStorage.setItem("facultyClassName", cls);
  };

  const backToClasses = () => {
    setSelectedClass(null);
    setCode("");
    setStudents([]);
    setSummary([]);
    setShowSummary(false);
    setRemainingTime(0);
    setPresentCount(0);
    setAbsentCount(0);
  };

  const loadAttendance = async () => {
    if (!className) return;

    try {
      const res = await axios.get(`${API_BASE}/current-attendance`);
      const data = Array.isArray(res.data) ? res.data : [];

      setStudents(data);
      setPresentCount(data.filter((s) => s.status === "PRESENT").length);
      setAbsentCount(data.filter((s) => s.status === "ABSENT").length);
    } catch {
      setStudents([]);
      setPresentCount(0);
      setAbsentCount(0);
    }
  };

  const loadSummary = async () => {
    if (!className) return;

    try {
      const res = await axios.get(`${API_BASE}/attendance-summary`, {
        params: {
          className: className,
          subject: subject,
        },
      });

      setSummary(Array.isArray(res.data) ? res.data : []);
      setShowSummary(true);
    } catch {
      alert("Error loading attendance summary");
    }
  };

  const downloadCSV = async () => {
    if (!className) return;

    try {
      const res = await axios.get(`${API_BASE}/attendance-csv`, {
        params: {
          className: className,
          subject: subject,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", `${className}_${subject}_attendance.csv`);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("CSV download failed");
    }
  };

  const loadRemainingTime = async () => {
    try {
      const res = await axios.get(`${API_BASE}/remaining-time`);

      if (res.data.active) {
        setRemainingTime(res.data.remainingSeconds || 0);
      } else {
        setRemainingTime(0);
        setCode("");
      }
    } catch {
      setRemainingTime(0);
    }
  };

  const generateCode = async () => {
    if (!className) {
      alert("Choose a class first");
      return;
    }

    setLoading(true);

    if (!navigator.geolocation) {
      alert("Geolocation is not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const payload = {
            subject,
            className,
            facultyEmail,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          const res = await axios.post(`${API_BASE}/generate-code`, payload);

          setCode(res.data.code || "");
          setRemainingTime(15);
          setShowSummary(false);
          await loadAttendance();
        } catch (err) {
          alert(
            err.response?.data?.message ||
              err.response?.data ||
              "Error generating code"
          );
        } finally {
          setLoading(false);
        }
      },
      () => {
        alert("Allow location access to generate code");
        setLoading(false);
      }
    );
  };

  const endAttendance = async () => {
    try {
      await axios.post(`${API_BASE}/end-attendance`);
      setCode("");
      setRemainingTime(0);
      setStudents([]);
      setPresentCount(0);
      setAbsentCount(0);
      alert("Attendance session ended");
    } catch {
      alert("Error ending attendance");
    }
  };

  useEffect(() => {
    if (!selectedClass) return;

    loadAttendance();
    loadRemainingTime();

    const interval = setInterval(() => {
      loadAttendance();
      loadRemainingTime();
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedClass]);

  if (!selectedClass) {
    return (
      <div style={styles.page}>
        <div style={styles.shell}>
          <div style={styles.topBar}>
            <div>
              <h1 style={styles.title}>Welcome, {facultyName}</h1>
              <p style={styles.subtitle}>{subject}</p>
            </div>

            <div style={styles.profileWrap}>
              <div style={styles.profileAvatar}></div>
              <span style={styles.profileText}>Profile</span>
            </div>
          </div>

          <div style={styles.classSection}>
            <h2 style={styles.classHeading}>Choose Class</h2>

            <div style={styles.classGrid}>
              {classOptions.map((cls) => (
                <button
                  key={cls}
                  style={styles.classCard}
                  onClick={() => chooseClass(cls)}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.title}>Welcome, {facultyName}</h1>
            <p style={styles.subtitle}>
              {subject} - {className}
            </p>
          </div>

          <div style={styles.topRight}>
            <button style={styles.backClassButton} onClick={backToClasses}>
              Change Class
            </button>

            <button style={styles.viewButton} onClick={loadSummary}>
              View Attendance
            </button>

            <button style={styles.downloadButton} onClick={downloadCSV}>
              Download CSV
            </button>

            <div style={styles.profileWrap}>
              <div style={styles.profileAvatar}></div>
              <span style={styles.profileText}>Profile</span>
            </div>
          </div>
        </div>

        <div style={styles.detailContent}>
          <div style={styles.codeCard}>
            <div style={styles.sectionLabel}>ATTENDANCE CODE</div>

            <div style={styles.codeBox}>
              <span style={styles.codeText}>{code || "----"}</span>
            </div>

            <p style={styles.timerText}>
              Time Left: {remainingTime > 0 ? `${remainingTime}s` : "Expired"}
            </p>

            <div style={styles.buttonRow}>
              <button
                style={styles.primaryButton}
                onClick={generateCode}
                disabled={loading}
              >
                {loading ? "Getting Location..." : "Generate Code"}
              </button>

              <button style={styles.secondaryButton} onClick={loadAttendance}>
                Refresh Attendance
              </button>

              <button style={styles.endButton} onClick={endAttendance}>
                End Attendance
              </button>
            </div>
          </div>

          <div style={styles.tableCard}>
            <div style={styles.tableHeaderWrap}>
              <div>
                <div style={styles.sectionLabel}>
                  {showSummary ? "ATTENDANCE SUMMARY" : "CURRENT SESSION"}
                </div>
                <h3 style={styles.tableTitle}>{subject} Attendance</h3>
              </div>

              {!showSummary && (
                <div style={styles.badgeGroup}>
                  <span style={styles.badge}>{students.length} Students</span>
                  <span style={styles.presentBadge}>
                    {presentCount} Present
                  </span>
                  <span style={styles.absentBadge}>{absentCount} Absent</span>
                </div>
              )}

              {showSummary && (
                <button
                  style={styles.backSmallButton}
                  onClick={() => setShowSummary(false)}
                >
                  Back to Session
                </button>
              )}
            </div>

            {!showSummary ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Reg No</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {students.length > 0 ? (
                    students.map((student, index) => (
                      <tr key={index}>
                        <td style={styles.td}>{student?.regNo || "N/A"}</td>
                        <td style={styles.td}>{student?.name || "Unknown"}</td>
                        <td style={styles.td}>
                          <span
                            style={
                              student?.status === "PRESENT"
                                ? styles.presentPill
                                : styles.absentPill
                            }
                          >
                            {student?.status || "ABSENT"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td style={styles.emptyRow} colSpan="3">
                        No current session records yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Reg No</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Classes Attended</th>
                    <th style={styles.th}>Total Classes</th>
                    <th style={styles.th}>Percentage</th>
                  </tr>
                </thead>

                <tbody>
                  {summary.length > 0 ? (
                    summary.map((student, index) => (
                      <tr key={index}>
                        <td style={styles.td}>{student.regNo}</td>
                        <td style={styles.td}>{student.name}</td>
                        <td style={styles.td}>{student.presentCount}</td>
                        <td style={styles.td}>{student.totalClasses}</td>
                        <td style={styles.td}>
                          <span
                            style={
                              student.percentage >= 75
                                ? styles.presentPill
                                : styles.absentPill
                            }
                          >
                            {Number(student.percentage).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td style={styles.emptyRow} colSpan="5">
                        No attendance summary found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FacultyDashboard;

const styles = {
  page: {
    minHeight: "100vh",
    background: "#FFFFFF",
    padding: "24px",
    fontFamily: "'Segoe UI', sans-serif",
  },

  shell: {
    maxWidth: "1400px",
    margin: "0 auto",
  },

  topBar: {
    background: "#050F1E",
    padding: "28px 34px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
    borderRadius: "14px",
  },

  title: {
    margin: 0,
    color: "#FFFFFF",
    fontSize: "36px",
    fontWeight: "700",
  },

  subtitle: {
    margin: "8px 0 0 0",
    color: "#DBEAFF",
    fontSize: "15px",
  },

  topRight: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  profileWrap: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  profileAvatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    border: "2px solid #3B82F6",
    background: "rgba(255,255,255,0.05)",
  },

  profileText: {
    color: "#FFFFFF",
    fontSize: "16px",
    fontWeight: "500",
  },

  classSection: {
    marginTop: "50px",
    padding: "0 30px",
  },

  classHeading: {
    color: "#050F1E",
    fontSize: "30px",
    fontWeight: "700",
    marginBottom: "24px",
  },

  classGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "28px",
  },

  classCard: {
    height: "150px",
    background: "#082144",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "16px",
    boxShadow: "0 14px 28px rgba(0,0,0,0.08)",
    fontSize: "28px",
    fontWeight: "700",
    cursor: "pointer",
  },

  backClassButton: {
    background: "#475569",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "999px",
    padding: "12px 22px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
  },

  viewButton: {
    background: "#F97316",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "999px",
    padding: "12px 24px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
  },

  downloadButton: {
    background: "#16A34A",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "999px",
    padding: "12px 24px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
  },

  detailContent: {
    display: "grid",
    gridTemplateColumns: "380px 1fr",
    gap: "24px",
    alignItems: "start",
  },

  codeCard: {
    background: "#050F1E",
    borderRadius: "20px",
    padding: "28px",
  },

  sectionLabel: {
    color: "#8FA0BB",
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "1px",
    textTransform: "uppercase",
    marginBottom: "18px",
  },

  codeBox: {
    height: "180px",
    borderRadius: "18px",
    background: "#0A1F3D",
    border: "1px solid #2563EB",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "14px",
  },

  codeText: {
    color: "#FFFFFF",
    fontSize: "52px",
    fontWeight: "700",
    letterSpacing: "12px",
  },

  timerText: {
    color: "#DBEAFF",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0 0 8px 0",
    textAlign: "center",
  },

  buttonRow: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  primaryButton: {
    background: "#2563EB",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "999px",
    padding: "14px 18px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
  },

  secondaryButton: {
    background: "#1E293B",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "999px",
    padding: "14px 18px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
  },

  endButton: {
    background: "#DC2626",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "999px",
    padding: "14px 18px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
  },

  tableCard: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    overflow: "hidden",
    borderRadius: "18px",
  },

  tableHeaderWrap: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 26px 18px 26px",
    background: "#FFFFFF",
    gap: "20px",
  },

  tableTitle: {
    margin: "4px 0 0 0",
    color: "#050F1E",
    fontSize: "24px",
    fontWeight: "700",
  },

  badgeGroup: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  badge: {
    background: "#EFF6FF",
    color: "#1848A0",
    border: "1px solid #BFDBFE",
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
  },

  presentBadge: {
    background: "#DCFCE7",
    color: "#166534",
    border: "1px solid #86EFAC",
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
  },

  absentBadge: {
    background: "#FEE2E2",
    color: "#991B1B",
    border: "1px solid #FCA5A5",
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
  },

  backSmallButton: {
    background: "#2563EB",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "999px",
    padding: "10px 18px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    background: "#050F1E",
    color: "#DBEAFF",
    textAlign: "left",
    padding: "16px 22px",
    fontSize: "15px",
    fontWeight: "600",
  },

  td: {
    background: "#FFFFFF",
    color: "#050F1E",
    padding: "18px 22px",
    fontSize: "15px",
    borderBottom: "1px solid #E2E8F0",
  },

  presentPill: {
    display: "inline-block",
    background: "#DCFCE7",
    color: "#166534",
    border: "1px solid #86EFAC",
    borderRadius: "999px",
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: "600",
  },

  absentPill: {
    display: "inline-block",
    background: "#FEE2E2",
    color: "#991B1B",
    border: "1px solid #FCA5A5",
    borderRadius: "999px",
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: "600",
  },

  emptyRow: {
    background: "#FFFFFF",
    color: "#8FA0BB",
    padding: "28px",
    textAlign: "center",
    fontSize: "15px",
  },
};