import React, { useEffect, useState } from "react";
import axios from "axios";

function FacultyDashboard() {
  const [code, setCode] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const facultyName = localStorage.getItem("facultyName") || "OS Faculty";
  const subject = localStorage.getItem("facultySubject") || "Operating Systems";
  const className = localStorage.getItem("facultyClassName") || "AIDS-A";

  const API_BASE = "http://localhost:8080/auth";

  const loadAttendance = async () => {
    try {
      const res = await axios.get(`${API_BASE}/current-attendance`);

      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("LOAD ATTENDANCE ERROR:", err);
      console.log("LOAD ATTENDANCE RESPONSE:", err.response);

      setStudents([]);

      alert(
        "Error loading attendance: " +
          (err.response?.status || "NO STATUS") +
          " - " +
          (err.response?.data?.message || err.response?.data || err.message)
      );
    }
  };

  const generateCode = async () => {
    try {
      setLoading(true);

      const payload = {
        subject: subject,
        className: className,
      };

      console.log("GENERATE CODE PAYLOAD:", payload);

      const res = await axios.post(`${API_BASE}/generate-code`, payload);

      setCode(res.data.code || "");
      await loadAttendance();
    } catch (err) {
      console.log("GENERATE CODE ERROR:", err);
      console.log("GENERATE CODE RESPONSE:", err.response);

      alert(
        err.response?.data?.message ||
          err.response?.data ||
          "Error generating code"
      );
    } finally {
      setLoading(false);
    }
  };

  const endAttendance = async () => {
    try {
      await axios.post(`${API_BASE}/end-attendance`);
      setCode("");
      setStudents([]);
      alert("Attendance session ended");
    } catch (err) {
      console.log("END ATTENDANCE ERROR:", err);
      console.log("END ATTENDANCE RESPONSE:", err.response);

      alert(
        err.response?.data?.message ||
          err.response?.data ||
          "Error ending attendance"
      );
    }
  };

  useEffect(() => {
    loadAttendance();

    const interval = setInterval(() => {
      loadAttendance();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

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

          <div style={styles.profileWrap}>
            <div style={styles.profileAvatar}></div>
            <span style={styles.profileText}>Profile</span>
          </div>
        </div>

        <div style={styles.detailContent}>
          <div style={styles.codeCard}>
            <div style={styles.sectionLabel}>ATTENDANCE CODE</div>

            <div style={styles.codeBox}>
              <span style={styles.codeText}>{code || "----"}</span>
            </div>

            <div style={styles.buttonRow}>
              <button
                style={styles.primaryButton}
                onClick={generateCode}
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate Code"}
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
                <div style={styles.sectionLabel}>CURRENT SESSION</div>
                <h3 style={styles.tableTitle}>{subject} Attendance</h3>
              </div>

              <span style={styles.badge}>{students.length} Students</span>
            </div>

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
    boxShadow: "0 12px 28px rgba(5,15,30,0.08)",
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
    marginBottom: "18px",
  },

  codeText: {
    color: "#FFFFFF",
    fontSize: "52px",
    fontWeight: "700",
    letterSpacing: "12px",
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
    boxShadow: "0 8px 22px rgba(5,15,30,0.06)",
    overflow: "hidden",
    borderRadius: "18px",
  },

  tableHeaderWrap: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 26px 18px 26px",
    background: "#FFFFFF",
  },

  tableTitle: {
    margin: "4px 0 0 0",
    color: "#050F1E",
    fontSize: "24px",
    fontWeight: "700",
  },

  badge: {
    background: "#EFF6FF",
    color: "#1848A0",
    border: "1px solid #BFDBFE",
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "600",
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
    verticalAlign: "middle",
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