package com.example.attendance.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.attendance.model.AttendanceRecord;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    List<AttendanceRecord> findByClassNameAndSubject(String className, String subject);

    Optional<AttendanceRecord> findBySessionIdAndRegNo(String sessionId, String regNo);

    List<AttendanceRecord> findByRegNoAndSubjectOrderByDateDescTimeDesc(String regNo, String subject);

    List<AttendanceRecord> findBySessionId(String sessionId);
}