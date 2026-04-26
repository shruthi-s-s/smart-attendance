import React, { useEffect, useState } from "react";
import axios from "axios";

export default function StudentDashboard() {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [code, setCode] = useState("");
  const [attendance, setAttendance] = useState(0);
  const [attendanceList, setAttendanceList] = useState([]);

  const name = localStorage.getItem("name") || "Student";
  const regNo = localStorage.getItem("regNo") || "";
  const className = localStorage.getItem("className") || "AIDS-A";

  const subjects = [
    "Operating Systems",
    "Data Analytics",
    "Probability & Stats",
    "Design Analysis",
    "Environmental Science",
    "Machine Learning",
  ];

  const fetchAttendance = async (subject) => {
    try {
      const res = await axios.get("http://localhost:8080/auth/attendance-history", {
        params: {
          regNo: regNo,
          subject: subject,
        },
      });

      setAttendanceList(res.data);
    } catch (err) {
      console.log("ATTENDANCE HISTORY ERROR:", err);
      setAttendanceList([]);
    }
  };

  const loadAttendancePercentage = async (subject) => {
    try {
      const res = await axios.get(
        `http://localhost:8080/auth/attendance-percentage?regNo=${encodeURIComponent(
          regNo
        )}&subject=${encodeURIComponent(subject)}`
      );

      setAttendance(res.data.percentage || 0);
    } catch (err) {
      console.log("ATTENDANCE % ERROR:", err);
      setAttendance(0);
    }
  };

  useEffect(() => {
    if (selectedSubject) {
      loadAttendancePercentage(selectedSubject);
      fetchAttendance(selectedSubject);
    }
  }, [selectedSubject]);

  const handleSubmit = async () => {
    if (!selectedSubject) {
      alert("Select a subject");
      return;
    }

    if (!code.trim()) {
      alert("Enter code");
      return;
    }

    if (!regNo) {
      alert("Student register number missing. Login again.");
      return;
    }

    try {
      const payload = {
        code: code.trim(),
        regNo: regNo,
        className: className,
        subject: selectedSubject,
      };

      const res = await axios.post(
        "http://localhost:8080/auth/mark-attendance",
        payload
      );

      alert(res.data.message || "Attendance marked");

      setCode("");
      loadAttendancePercentage(selectedSubject);
      fetchAttendance(selectedSubject);
    } catch (err) {
      console.log("MARK ATTENDANCE ERROR:", err);
      console.log("MARK ATTENDANCE RESPONSE:", err.response);

      alert(
        err.response?.data?.message ||
          err.response?.data ||
          "Error marking attendance"
      );
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        {selectedSubject ? selectedSubject : `Welcome, ${name}`}
      </div>

      {!selectedSubject && (
        <div style={styles.grid}>
          {subjects.map((subject, index) => (
            <div
              key={index}
              style={styles.card}
              onClick={() => setSelectedSubject(subject)}
            >
              {subject}
            </div>
          ))}
        </div>
      )}

      {selectedSubject && (
        <>
          <div style={styles.main}>
            <div style={styles.leftPanel}>
              <h3 style={{ marginTop: 0 }}>Enter Code</h3>

              <input
                style={styles.input}
                placeholder="Enter code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={4}
              />

              <button style={styles.button} onClick={handleSubmit}>
                Submit
              </button>

              <button
                style={styles.backBtn}
                onClick={() => {
                  setSelectedSubject(null);
                  setCode("");
                  setAttendance(0);
                  setAttendanceList([]);
                }}
              >
                ← Back
              </button>
            </div>

            <div style={styles.rightPanel}>
              <div style={styles.circle}>
                <h1 style={styles.circleValue}>{attendance.toFixed(0)}%</h1>
                <p style={styles.circleLabel}>Attendance</p>
              </div>
            </div>
          </div>

          <div style={styles.historyBox}>
            <h3 style={styles.historyTitle}>Attendance History</h3>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Time</th>
                  <th style={styles.th}>Subject</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>

              <tbody>
                {attendanceList.length > 0 ? (
                  attendanceList.map((item, index) => (
                    <tr key={index}>
                      <td style={styles.td}>{item.date || "N/A"}</td>
                      <td style={styles.td}>
                        {item.time ? item.time.substring(0, 8) : "N/A"}
                      </td>
                      <td style={styles.td}>{item.subject}</td>
                      <td style={styles.td}>
                        <span
                          style={
                            item.status === "PRESENT"
                              ? styles.present
                              : styles.absent
                          }
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td style={styles.empty} colSpan="4">
                      No attendance records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#ffffff",
    fontFamily: "Segoe UI, sans-serif",
  },

  navbar: {
    background: "#050F1E",
    color: "#FFFFFF",
    padding: "20px 40px",
    fontSize: "22px",
    fontWeight: "600",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "25px",
    padding: "40px",
  },

  card: {
    background: "#0A1F3D",
    color: "#FFFFFF",
    minHeight: "130px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontWeight: "500",
    fontSize: "20px",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  },

  main: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "30px",
    padding: "40px",
  },

  leftPanel: {
    background: "#F8FAFC",
    borderRadius: "18px",
    padding: "30px",
    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
  },

  rightPanel: {
    background: "#F8FAFC",
    borderRadius: "18px",
    padding: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
  },

  input: {
    width: "100%",
    padding: "14px",
    fontSize: "18px",
    borderRadius: "10px",
    border: "1px solid #CBD5E1",
    marginBottom: "16px",
    outline: "none",
    boxSizing: "border-box",
  },

  button: {
    width: "100%",
    padding: "14px",
    background: "#2563EB",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "12px",
  },

  backBtn: {
    width: "100%",
    padding: "14px",
    background: "#E2E8F0",
    color: "#0F172A",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },

  circle: {
    width: "220px",
    height: "220px",
    borderRadius: "50%",
    background: "#0A1F3D",
    color: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  circleValue: {
    margin: 0,
    fontSize: "48px",
    fontWeight: "700",
  },

  circleLabel: {
    marginTop: "10px",
    fontSize: "18px",
    opacity: 0.9,
  },

  historyBox: {
    margin: "0 40px 40px 40px",
    background: "#F8FAFC",
    borderRadius: "18px",
    padding: "25px",
    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
  },

  historyTitle: {
    marginTop: 0,
    marginBottom: "15px",
    color: "#0F172A",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#FFFFFF",
    borderRadius: "12px",
    overflow: "hidden",
  },

  th: {
    background: "#0A1F3D",
    color: "#FFFFFF",
    padding: "14px",
    textAlign: "left",
  },

  td: {
    padding: "14px",
    borderBottom: "1px solid #E2E8F0",
    color: "#0F172A",
  },

  present: {
    color: "#166534",
    background: "#DCFCE7",
    padding: "6px 12px",
    borderRadius: "999px",
    fontWeight: "700",
  },

  absent: {
    color: "#991B1B",
    background: "#FEE2E2",
    padding: "6px 12px",
    borderRadius: "999px",
    fontWeight: "700",
  },

  empty: {
    padding: "20px",
    textAlign: "center",
    color: "#64748B",
  },
};