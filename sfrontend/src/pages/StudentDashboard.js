import React, { useState } from "react";
import axios from "axios";

function StudentDashboard() {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [code, setCode] = useState("");
  const [percentage, setPercentage] = useState(0);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = "http://localhost:8080/auth";

  const studentName = localStorage.getItem("studentName") || "Student";
  const regNo = localStorage.getItem("studentRegNo") || "";
  const className = localStorage.getItem("studentClassName") || "";

  const subjects = [
    "Operating Systems",
    "Data Analytics",
    "Probability & Stats",
    "Design Analysis",
    "Environmental Science",
    "Machine Learning",
  ];

  const loadStudentStats = async (subject) => {
    try {
      const res = await axios.get(`${API_BASE}/student-stats`, {
        params: { regNo, subject },
      });
      setStats(res.data);
    } catch {
      setStats(null);
    }
  };

  const loadPercentage = async (subject) => {
    try {
      const res = await axios.get(`${API_BASE}/attendance-percentage`, {
        params: { regNo, subject },
      });
      setPercentage(res.data.percentage || 0);
    } catch {
      setPercentage(0);
    }
  };

  const loadHistory = async (subject) => {
    try {
      const res = await axios.get(`${API_BASE}/attendance-history`, {
        params: { regNo, subject },
      });
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch {
      setHistory([]);
    }
  };

  const openSubject = async (subject) => {
    setSelectedSubject(subject);
    setCode("");
    setMessage("");
    setStats(null);
    setPercentage(0);
    setHistory([]);

    await loadPercentage(subject);
    await loadStudentStats(subject);
    await loadHistory(subject);
  };

  const backToSubjects = () => {
    setSelectedSubject(null);
    setCode("");
    setMessage("");
    setStats(null);
    setPercentage(0);
    setHistory([]);
  };

  const submitCode = () => {
    if (!regNo || !className) {
      alert("Student details missing. Please login again.");
      return;
    }

    if (!code.trim()) {
      alert("Enter attendance code");
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setMessage("Checking location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const payload = {
            code,
            regNo,
            subject: selectedSubject,
            className,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          const res = await axios.post(`${API_BASE}/mark-attendance`, payload);

          setMessage(res.data.message || "Attendance marked successfully");
          setCode("");

          await loadPercentage(selectedSubject);
          await loadStudentStats(selectedSubject);
          await loadHistory(selectedSubject);
        } catch (err) {
          setMessage(
            err.response?.data?.message ||
              err.response?.data ||
              "Attendance failed"
          );
        } finally {
          setLoading(false);
        }
      },
      () => {
        setMessage("Location permission denied. Attendance cannot be marked.");
        setLoading(false);
      }
    );
  };

  const getStatusText = () => {
    if (percentage >= 80) return "SAFE";
    if (percentage >= 75) return "RISK";
    return "CRITICAL";
  };

  const getStatusStyle = () => {
    if (percentage >= 80) return styles.safeBadge;
    if (percentage >= 75) return styles.riskBadge;
    return styles.criticalBadge;
  };

  if (!selectedSubject) {
    return (
      <div style={styles.page}>
        <div style={styles.topBar}>
          <h1 style={styles.title}>Welcome, {studentName}</h1>
        </div>

        <div style={styles.subjectGrid}>
          {subjects.map((subject, index) => (
            <button
              key={index}
              style={styles.subjectCard}
              onClick={() => openSubject(subject)}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.title}>Welcome, {studentName}</h1>
          <p style={styles.subtitle}>
            {regNo} - {className}
          </p>
        </div>

        <button style={styles.backButton} onClick={backToSubjects}>
          Back
        </button>
      </div>

      <div style={styles.detailGrid}>
        <div style={styles.card}>
          <div style={styles.sectionLabel}>MARK ATTENDANCE</div>

          <h2 style={styles.subjectTitle}>{selectedSubject}</h2>

          <input
            style={styles.input}
            type="text"
            placeholder="Enter 4-digit code"
            value={code}
            maxLength="4"
            onChange={(e) => setCode(e.target.value)}
          />

          <button
            style={styles.primaryButton}
            onClick={submitCode}
            disabled={loading}
          >
            {loading ? "Checking Location..." : "Submit Code"}
          </button>

        

          {message && <p style={styles.message}>{message}</p>}
        </div>

        <div style={styles.card}>
          <div style={styles.sectionLabel}>ATTENDANCE STATUS</div>

          <h2 style={styles.percentage}>{Number(percentage).toFixed(1)}%</h2>

          <span style={getStatusStyle()}>{getStatusText()}</span>

          <div style={styles.statsGrid}>
            <div>
              <p style={styles.statLabel}>Present Count</p>
              <h3 style={styles.statValue}>{stats?.presentCount || 0}</h3>
            </div>

            <div>
              <p style={styles.statLabel}>Total Classes</p>
              <h3 style={styles.statValue}>{stats?.totalClasses || 0}</h3>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.historyCard}>
        <h2 style={styles.historyTitle}>Attendance History</h2>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Subject</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>

          <tbody>
            {history.length > 0 ? (
              history.map((item, index) => (
                <tr key={index}>
                  <td style={styles.td}>{item.date}</td>
                  <td style={styles.td}>{item.subject}</td>
                  <td style={styles.td}>
                    <span
                      style={
                        item.status === "PRESENT"
                          ? styles.presentPill
                          : styles.absentPill
                      }
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td style={styles.emptyRow} colSpan="3">
                  No attendance history found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentDashboard;

const styles = {
  page: {
    minHeight: "100vh",
    background: "#FFFFFF",
    padding: "24px",
    fontFamily: "'Segoe UI', sans-serif",
  },

  topBar: {
    background: "#050F1E",
    padding: "28px 34px",
    marginBottom: "46px",
    borderRadius: "0px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    margin: 0,
    color: "#FFFFFF",
    fontSize: "28px",
    fontWeight: "700",
  },

  subtitle: {
    margin: "8px 0 0 0",
    color: "#DBEAFF",
    fontSize: "15px",
  },

  subjectGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "28px",
    padding: "0 30px",
  },

  subjectCard: {
    height: "145px",
    background: "#082144",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "16px",
    boxShadow: "0 14px 28px rgba(0,0,0,0.08)",
    fontSize: "22px",
    fontWeight: "700",
    cursor: "pointer",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "28px",
    maxWidth: "1180px",
    margin: "0 auto",
  },

  card: {
    background: "#050F1E",
    borderRadius: "18px",
    padding: "32px",
    color: "#FFFFFF",
  },

  sectionLabel: {
    color: "#9EB4D4",
    fontSize: "14px",
    fontWeight: "700",
    letterSpacing: "1.4px",
    marginBottom: "28px",
  },

  subjectTitle: {
    margin: "0 0 24px 0",
    fontSize: "30px",
    color: "#FFFFFF",
  },

  input: {
    width: "100%",
    padding: "17px",
    borderRadius: "12px",
    border: "1px solid #2563EB",
    fontSize: "18px",
    marginBottom: "18px",
    boxSizing: "border-box",
    outline: "none",
  },

  primaryButton: {
    width: "100%",
    background: "#2563EB",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "999px",
    padding: "15px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "700",
  },

  geoText: {
    color: "#93C5FD",
    fontSize: "13px",
    textAlign: "center",
    marginTop: "18px",
  },

  message: {
    color: "#DBEAFF",
    fontSize: "15px",
    fontWeight: "600",
    marginTop: "16px",
    textAlign: "center",
  },

  percentage: {
    fontSize: "64px",
    margin: "0 0 18px 0",
    color: "#FFFFFF",
  },

  safeBadge: {
    display: "inline-block",
    background: "#DCFCE7",
    color: "#166534",
    border: "1px solid #86EFAC",
    borderRadius: "999px",
    padding: "8px 18px",
    fontWeight: "700",
  },

  riskBadge: {
    display: "inline-block",
    background: "#FEF3C7",
    color: "#92400E",
    border: "1px solid #FCD34D",
    borderRadius: "999px",
    padding: "8px 18px",
    fontWeight: "700",
  },

  criticalBadge: {
    display: "inline-block",
    background: "#FEE2E2",
    color: "#991B1B",
    border: "1px solid #FCA5A5",
    borderRadius: "999px",
    padding: "8px 18px",
    fontWeight: "700",
  },

  statsGrid: {
    marginTop: "34px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
  },

  statLabel: {
    color: "#9EB4D4",
    fontSize: "15px",
    margin: 0,
  },

  statValue: {
    color: "#FFFFFF",
    fontSize: "32px",
    margin: "8px 0 0 0",
  },

  backButton: {
    background: "#2563EB",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "999px",
    padding: "12px 22px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
  },

  historyCard: {
    margin: "38px auto 0 auto",
    maxWidth: "1260px",
    background: "#F8FAFC",
    borderRadius: "18px",
    padding: "28px",
    boxShadow: "0 12px 28px rgba(0,0,0,0.05)",
  },

  historyTitle: {
    margin: "0 0 18px 0",
    color: "#050F1E",
    fontSize: "22px",
    fontWeight: "700",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    overflow: "hidden",
    borderRadius: "12px",
  },

  th: {
    background: "#082144",
    color: "#FFFFFF",
    textAlign: "left",
    padding: "16px",
    fontSize: "15px",
  },

  td: {
    background: "#FFFFFF",
    color: "#050F1E",
    padding: "16px",
    borderBottom: "1px solid #E2E8F0",
    fontSize: "15px",
  },

  presentPill: {
    display: "inline-block",
    background: "#DCFCE7",
    color: "#166534",
    border: "1px solid #86EFAC",
    borderRadius: "999px",
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: "700",
  },

  absentPill: {
    display: "inline-block",
    background: "#FEE2E2",
    color: "#991B1B",
    border: "1px solid #FCA5A5",
    borderRadius: "999px",
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: "700",
  },

  emptyRow: {
    background: "#FFFFFF",
    color: "#94A3B8",
    padding: "24px",
    textAlign: "center",
    fontSize: "15px",
  },
};