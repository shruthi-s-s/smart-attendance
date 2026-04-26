package com.example.attendance.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.attendance.model.Student;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByEmailAndPassword(String email, String password);
    List<Student> findByClassName(String className);
    Optional<Student> findByRegNo(String regNo);
}