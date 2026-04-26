package com.example.attendance.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class AttendanceSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sessionId;
    private String code;
    private String subject;
    private String className;
    private String facultyEmail;

    private LocalDateTime startTime;
    private LocalDateTime expiresAt;

    private boolean active;

    // 🔥 NEW (Geo)
    private Double facultyLatitude;
    private Double facultyLongitude;

    public AttendanceSession() {}

    public Long getId() { return id; }
    public String getSessionId() { return sessionId; }
    public String getCode() { return code; }
    public String getSubject() { return subject; }
    public String getClassName() { return className; }
    public String getFacultyEmail() { return facultyEmail; }
    public LocalDateTime getStartTime() { return startTime; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public boolean isActive() { return active; }

    public Double getFacultyLatitude() { return facultyLatitude; }
    public Double getFacultyLongitude() { return facultyLongitude; }

    public void setId(Long id) { this.id = id; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    public void setCode(String code) { this.code = code; }
    public void setSubject(String subject) { this.subject = subject; }
    public void setClassName(String className) { this.className = className; }
    public void setFacultyEmail(String facultyEmail) { this.facultyEmail = facultyEmail; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public void setActive(boolean active) { this.active = active; }

    public void setFacultyLatitude(Double facultyLatitude) { this.facultyLatitude = facultyLatitude; }
    public void setFacultyLongitude(Double facultyLongitude) { this.facultyLongitude = facultyLongitude; }
}