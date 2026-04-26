package com.example.attendance.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.attendance.model.AttendanceSession;

public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {

    Optional<AttendanceSession> findFirstByActiveTrueOrderByStartTimeDesc();

    Optional<AttendanceSession> findBySessionId(String sessionId);
}