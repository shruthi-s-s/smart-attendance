package com.example.attendance.controller;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.attendance.model.AttendanceRecord;
import com.example.attendance.model.Faculty;
import com.example.attendance.model.Student;
import com.example.attendance.repository.AttendanceRecordRepository;
import com.example.attendance.repository.FacultyRepository;
import com.example.attendance.repository.StudentRepository;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;

    private static String currentCode = "";
    private static boolean sessionActive = false;
    private static String currentSubject = "";
    private static String currentClassName = "";
    private static String currentSessionId = "";

    private static long codeGeneratedTime = 0L;
    private static final long CODE_EXPIRY_MILLIS = 15000;

    private static String facultyIP = "";

    public AuthController(StudentRepository studentRepository,
                          FacultyRepository facultyRepository,
                          AttendanceRecordRepository attendanceRecordRepository) {
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
    }

    @PostMapping("/student-login")
    public Student studentLogin(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        String password = req.get("password");

        if (email == null || password == null || email.isBlank() || password.isBlank()) {
            throw new RuntimeException("Email and password are required");
        }

        return studentRepository
                .findByEmailAndPassword(email, password)
                .orElseThrow(() -> new RuntimeException("Invalid student login"));
    }

    @PostMapping("/faculty-login")
    public Faculty facultyLogin(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        String password = req.get("password");

        if (email == null || password == null || email.isBlank() || password.isBlank()) {
            throw new RuntimeException("Email and password are required");
        }

        return facultyRepository
                .findByEmailAndPassword(email, password)
                .orElseThrow(() -> new RuntimeException("Invalid faculty login"));
    }

    @PostMapping("/generate-code")
    public Map<String, String> generateCode(@RequestBody Map<String, String> req,
                                            HttpServletRequest request) {

        String subject = req.get("subject");
        String className = req.get("className");

        if (subject == null || subject.isBlank()) {
            throw new RuntimeException("Subject is missing");
        }

        if (className == null || className.isBlank()) {
            throw new RuntimeException("Class name is missing");
        }

        List<Student> students = studentRepository.findByClassName(className);

        if (students.isEmpty()) {
            throw new RuntimeException("No students found for class: " + className);
        }

        currentCode = String.valueOf(1000 + new Random().nextInt(9000));
        sessionActive = true;
        currentSubject = subject;
        currentClassName = className;
        currentSessionId = String.valueOf(System.currentTimeMillis());
        codeGeneratedTime = System.currentTimeMillis();
        facultyIP = request.getRemoteAddr();

        System.out.println("=================================");
        System.out.println("GENERATE CODE API CALLED");
        System.out.println("Subject: " + subject);
        System.out.println("Class Name: " + className);
        System.out.println("Faculty IP: " + facultyIP);
        System.out.println("Generated Code: " + currentCode);
        System.out.println("Current Session ID: " + currentSessionId);
        System.out.println("=================================");

        for (Student student : students) {
            student.setTotalClasses(student.getTotalClasses() + 1);

            double percentage = student.getTotalClasses() == 0
                    ? 0.0
                    : (student.getPresentCount() * 100.0) / student.getTotalClasses();

            student.setAttendancePercentage(percentage);
            studentRepository.save(student);

            AttendanceRecord record = new AttendanceRecord();
            record.setSessionId(currentSessionId);
            record.setRegNo(student.getRegNo());
            record.setName(student.getName());
            record.setClassName(className);
            record.setSubject(subject);
            record.setStatus("ABSENT");
            record.setDate(LocalDate.now());
            record.setTime(LocalTime.now());

            attendanceRecordRepository.save(record);
        }

        return Map.of(
                "code", currentCode,
                "message", "Code generated successfully"
        );
    }

    @PostMapping("/mark-attendance")
    public Map<String, String> markAttendance(@RequestBody Map<String, String> req,
                                              HttpServletRequest request) {

        String code = req.get("code");
        String regNo = req.get("regNo");
        String subject = req.get("subject");
        String className = req.get("className");

        String studentIP = request.getRemoteAddr();

        System.out.println("=================================");
        System.out.println("MARK ATTENDANCE API CALLED");
        System.out.println("Student IP: " + studentIP);
        System.out.println("Faculty IP: " + facultyIP);
        System.out.println("IP MATCH: " + studentIP.equals(facultyIP));
        System.out.println("Entered Code: " + code);
        System.out.println("Current Code: " + currentCode);
        System.out.println("Reg No: " + regNo);
        System.out.println("Subject: " + subject);
        System.out.println("Class Name: " + className);
        System.out.println("Current Session ID: " + currentSessionId);
        System.out.println("=================================");

        if (!sessionActive) {
            throw new RuntimeException("Attendance session is not active");
        }

        if (code == null || code.isBlank()) {
            throw new RuntimeException("Code is required");
        }

        if (regNo == null || regNo.isBlank()) {
            throw new RuntimeException("Register number is required");
        }

        if (subject == null || subject.isBlank()) {
            throw new RuntimeException("Subject is required");
        }

        if (className == null || className.isBlank()) {
            throw new RuntimeException("Class name is required");
        }

        long elapsedTime = System.currentTimeMillis() - codeGeneratedTime;

        if (elapsedTime > CODE_EXPIRY_MILLIS) {
            sessionActive = false;
            currentCode = "";
            throw new RuntimeException("Code expired. Attendance must be marked within 15 seconds.");
        }

        if (!studentIP.equals(facultyIP)) {
            throw new RuntimeException("You are not on the same network as faculty");
        }

        if (!code.equals(currentCode)) {
            throw new RuntimeException("Invalid code");
        }

        if (!subject.equals(currentSubject) || !className.equals(currentClassName)) {
            throw new RuntimeException("Student subject/class mismatch");
        }

        Student student = studentRepository.findByRegNo(regNo)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        AttendanceRecord record = attendanceRecordRepository
                .findBySessionIdAndRegNo(currentSessionId, regNo)
                .orElseThrow(() -> new RuntimeException("Attendance record not found for current session"));

        if (!"PRESENT".equalsIgnoreCase(record.getStatus())) {
            record.setStatus("PRESENT");
            record.setDate(LocalDate.now());
            record.setTime(LocalTime.now());

            attendanceRecordRepository.save(record);

            student.setPresentCount(student.getPresentCount() + 1);

            double percentage = student.getTotalClasses() == 0
                    ? 0.0
                    : (student.getPresentCount() * 100.0) / student.getTotalClasses();

            student.setAttendancePercentage(percentage);
            studentRepository.save(student);
        }

        return Map.of("message", "Attendance marked successfully");
    }

    @GetMapping("/current-attendance")
    public List<AttendanceRecord> getCurrentAttendance() {
        System.out.println("API HIT: /auth/current-attendance");
        System.out.println("Session Active: " + sessionActive);
        System.out.println("Current Session ID: " + currentSessionId);

        if (!sessionActive || currentSessionId == null || currentSessionId.isBlank()) {
            return List.of();
        }

        return attendanceRecordRepository.findBySessionId(currentSessionId);
    }

    @GetMapping("/attendance")
    public List<AttendanceRecord> getAttendance(@RequestParam String className,
                                                @RequestParam String subject) {
        return attendanceRecordRepository.findByClassNameAndSubject(className, subject);
    }

    @GetMapping("/attendance-history")
    public List<AttendanceRecord> getStudentAttendanceHistory(@RequestParam String regNo,
                                                              @RequestParam String subject) {
        return attendanceRecordRepository.findByRegNoAndSubjectOrderByDateDescTimeDesc(regNo, subject);
    }

    @GetMapping("/attendance-percentage")
    public Map<String, Double> getAttendancePercentage(@RequestParam String regNo,
                                                       @RequestParam String subject) {
        Student student = studentRepository.findByRegNo(regNo)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        return Map.of("percentage", student.getAttendancePercentage());
    }

    @GetMapping("/remaining-time")
    public Map<String, Object> getRemainingTime() {
        if (!sessionActive || codeGeneratedTime == 0L) {
            return Map.of("active", false, "remainingSeconds", 0);
        }

        long elapsed = System.currentTimeMillis() - codeGeneratedTime;
        long remaining = CODE_EXPIRY_MILLIS - elapsed;

        if (remaining <= 0) {
            sessionActive = false;
            currentCode = "";
            return Map.of("active", false, "remainingSeconds", 0);
        }

        return Map.of(
                "active", true,
                "remainingSeconds", remaining / 1000
        );
    }

    @GetMapping("/student-stats")
    public Map<String, Object> getStudentStats(@RequestParam String regNo) {
        Student student = studentRepository.findByRegNo(regNo)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        return Map.of(
                "name", student.getName(),
                "regNo", student.getRegNo(),
                "className", student.getClassName(),
                "totalClasses", student.getTotalClasses(),
                "presentCount", student.getPresentCount(),
                "attendancePercentage", student.getAttendancePercentage(),
                "parentPhoneNumber", student.getParentPhoneNumber()
        );
    }

    @PostMapping("/end-attendance")
    public Map<String, String> endAttendance() {
        sessionActive = false;
        currentCode = "";
        currentSubject = "";
        currentClassName = "";
        currentSessionId = "";
        codeGeneratedTime = 0L;
        facultyIP = "";

        return Map.of("message", "Attendance session ended");
    }
}