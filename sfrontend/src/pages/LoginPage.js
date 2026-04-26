import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { studentLogin, facultyLogin } from "../api";

function LoginPage() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      if (role === "student") {
        const res = await studentLogin({ email, password });

        localStorage.setItem("role", "student");
        localStorage.setItem("name", res.data.name || "Student");
        localStorage.setItem("regNo", res.data.regNo || "");
        localStorage.setItem("className", res.data.className || "AIDS-A");

        navigate("/student");
      } else {
        const res = await facultyLogin({ email, password });

        localStorage.setItem("role", "faculty");
        localStorage.setItem("facultyName", res.data.name || "Faculty");
        localStorage.setItem(
          "facultySubject",
          res.data.subject || "Operating Systems"
        );
        localStorage.setItem(
          "facultyClassName",
          res.data.className || "AIDS-A"
        );

        navigate("/faculty");
      }
    } catch (err) {
      console.log("LOGIN ERROR:", err);
      console.log("LOGIN RESPONSE:", err.response);
      alert(
        err.response?.data?.message ||
          err.response?.data ||
          "Invalid login credentials"
      );
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.left}>
          <div style={styles.leftContent}>
            <h1 style={styles.systemTitle}>
              Smart <br /> Attendance
            </h1>
            <p style={styles.systemSubtitle}>
              Login as student or faculty to continue
            </p>
          </div>
        </div>

        <div style={styles.right}>
          <h2 style={styles.loginTitle}>Login</h2>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={styles.select}
          >
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
          </select>

          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          <button onClick={handleLogin} style={styles.button}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

const styles = {
  container: {
    height: "100vh",
    background: "#ffffff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Segoe UI, sans-serif",
  },

  card: {
    width: "780px",
    height: "430px",
    display: "flex",
    overflow: "hidden",
    borderRadius: "18px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
    background: "#fff",
  },

  left: {
    flex: 1,
    background: "#050F1E",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
  },

  leftContent: {
    maxWidth: "260px",
  },

  systemTitle: {
    margin: 0,
    fontSize: "42px",
    lineHeight: "1.2",
    color: "#FFFFFF",
    fontWeight: "700",
  },

  systemSubtitle: {
    marginTop: "18px",
    color: "#DBEAFF",
    fontSize: "16px",
    lineHeight: "1.6",
  },

  right: {
    flex: 1,
    padding: "50px 40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  loginTitle: {
    fontSize: "30px",
    marginBottom: "20px",
    color: "#050F1E",
  },

  select: {
    padding: "13px",
    marginBottom: "14px",
    borderRadius: "8px",
    border: "1px solid #CBD5E1",
  },

  input: {
    padding: "14px",
    marginBottom: "14px",
    borderRadius: "8px",
    border: "1px solid #CBD5E1",
    outline: "none",
    fontSize: "15px",
  },

  button: {
    marginTop: "8px",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "#050F1E",
    color: "#FFFFFF",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
};