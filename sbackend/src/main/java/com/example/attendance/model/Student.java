package com.example.attendance.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String regNo;
    private String email;
    private String password;
    private String className;

    private int totalClasses;
    private int presentCount;
    private double attendancePercentage;
    private String parentPhoneNumber;

    public Student() {
    }

    public Student(String name, String regNo, String email, String password, String className) {
        this.name = name;
        this.regNo = regNo;
        this.email = email;
        this.password = password;
        this.className = className;
        this.totalClasses = 0;
        this.presentCount = 0;
        this.attendancePercentage = 0.0;
        this.parentPhoneNumber = "";
    }

    public Student(String name, String regNo, String email, String password,
                   String className, String parentPhoneNumber) {
        this.name = name;
        this.regNo = regNo;
        this.email = email;
        this.password = password;
        this.className = className;
        this.parentPhoneNumber = parentPhoneNumber;
        this.totalClasses = 0;
        this.presentCount = 0;
        this.attendancePercentage = 0.0;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getRegNo() {
        return regNo;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getClassName() {
        return className;
    }

    public int getTotalClasses() {
        return totalClasses;
    }

    public int getPresentCount() {
        return presentCount;
    }

    public double getAttendancePercentage() {
        return attendancePercentage;
    }

    public String getParentPhoneNumber() {
        return parentPhoneNumber;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setRegNo(String regNo) {
        this.regNo = regNo;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public void setTotalClasses(int totalClasses) {
        this.totalClasses = totalClasses;
    }

    public void setPresentCount(int presentCount) {
        this.presentCount = presentCount;
    }

    public void setAttendancePercentage(double attendancePercentage) {
        this.attendancePercentage = attendancePercentage;
    }

    public void setParentPhoneNumber(String parentPhoneNumber) {
        this.parentPhoneNumber = parentPhoneNumber;
    }
}