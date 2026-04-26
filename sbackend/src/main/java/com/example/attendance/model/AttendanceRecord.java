package com.example.attendance.model;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sessionId;
    private String regNo;
    private String name;
    private String className;
    private String subject;
    private String status;
    private LocalDate date;
    private LocalTime time;

    public AttendanceRecord() {
    }

    public Long getId() {
        return id;
    }

    public String getSessionId() {
        return sessionId;
    }

    public String getRegNo() {
        return regNo;
    }

    public String getName() {
        return name;
    }

    public String getClassName() {
        return className;
    }

    public String getSubject() {
        return subject;
    }

    public String getStatus() {
        return status;
    }

    public LocalDate getDate() {
        return date;
    }

    public LocalTime getTime() {
        return time;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public void setRegNo(String regNo) {
        this.regNo = regNo;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public void setTime(LocalTime time) {
        this.time = time;
    }
}