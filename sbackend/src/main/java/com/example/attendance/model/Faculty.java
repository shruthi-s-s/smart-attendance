package com.example.attendance.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "faculty")
public class Faculty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    private String subject;
    private String className;

    public Faculty() {
    }

    public Faculty(String name, String email, String password, String subject, String className) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.subject = subject;
        this.className = className;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getSubject() {
        return subject;
    }

    public String getClassName() {
        return className;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public void setClassName(String className) {
        this.className = className;
    }
}