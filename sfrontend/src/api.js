import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/auth",
});

export const studentLogin = (data) => API.post("/student-login", data);
export const facultyLogin = (data) => API.post("/faculty-login", data);

export default API;