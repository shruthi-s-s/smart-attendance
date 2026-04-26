package com.example.attendance.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.attendance.model.Student;

public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByEmailAndPassword(String email, String password);

    Optional<Student> findByRegNo(String regNo);

    Optional<Student> findByEmail(String email);

    List<Student> findByClassName(String className);
}