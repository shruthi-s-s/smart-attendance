package com.example.attendance.controller;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.attendance.model.AttendanceRecord;
import com.example.attendance.model.AttendanceSession;
import com.example.attendance.model.Faculty;
import com.example.attendance.model.Student;
import com.example.attendance.repository.AttendanceRecordRepository;
import com.example.attendance.repository.AttendanceSessionRepository;
import com.example.attendance.repository.FacultyRepository;
import com.example.attendance.repository.StudentRepository;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceSessionRepository attendanceSessionRepository;

    private static final long CODE_EXPIRY_SECONDS = 15;
    private static final double ALLOWED_DISTANCE_METERS = 30.0;

    public AuthController(StudentRepository studentRepository,
                          FacultyRepository facultyRepository,
                          AttendanceRecordRepository attendanceRecordRepository,
                          AttendanceSessionRepository attendanceSessionRepository) {
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.attendanceSessionRepository = attendanceSessionRepository;
    }

    @PostMapping("/student-login")
    public Student studentLogin(@RequestBody Map<String, String> req) {
        return studentRepository
                .findByEmailAndPassword(req.get("email"), req.get("password"))
                .orElseThrow(() -> new RuntimeException("Invalid student login"));
    }

    @GetMapping("/student-by-email")
    public Student getStudentByEmail(@RequestParam String email) {
        return studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    @PostMapping("/faculty-login")
    public Faculty facultyLogin(@RequestBody Map<String, String> req) {
        return facultyRepository
                .findByEmailAndPassword(req.get("email"), req.get("password"))
                .orElseThrow(() -> new RuntimeException("Invalid faculty login"));
    }

    @PostMapping("/generate-code")
    public Map<String, String> generateCode(@RequestBody Map<String, String> req) {

        String subject = req.get("subject");
        String className = req.get("className");
        String facultyEmail = req.getOrDefault("facultyEmail", "faculty@college.com");

        Double facultyLatitude = Double.valueOf(req.get("latitude"));
        Double facultyLongitude = Double.valueOf(req.get("longitude"));

        List<Student> students = studentRepository.findByClassName(className);

        if (students.isEmpty()) {
            throw new RuntimeException("No students found for class: " + className);
        }

        String generatedCode = String.valueOf(1000 + new Random().nextInt(9000));

        AttendanceSession session = attendanceSessionRepository
                .findFirstByActiveTrueOrderByStartTimeDesc()
                .filter(s -> s.getSubject().equals(subject) && s.getClassName().equals(className))
                .orElse(null);

        if (session == null) {
            String sessionId = UUID.randomUUID().toString();

            session = new AttendanceSession();
            session.setSessionId(sessionId);
            session.setSubject(subject);
            session.setClassName(className);
            session.setFacultyEmail(facultyEmail);
            session.setStartTime(LocalDateTime.now());
            session.setActive(true);

            attendanceSessionRepository.save(session);

            for (Student student : students) {
                AttendanceRecord record = new AttendanceRecord();
                record.setSessionId(sessionId);
                record.setRegNo(student.getRegNo());
                record.setName(student.getName());
                record.setClassName(className);
                record.setSubject(subject);
                record.setStatus("ABSENT");
                record.setDate(LocalDate.now());
                record.setTime(LocalTime.now());
                attendanceRecordRepository.save(record);
            }
        }

        session.setCode(generatedCode);
        session.setExpiresAt(LocalDateTime.now().plusSeconds(CODE_EXPIRY_SECONDS));
        session.setFacultyLatitude(facultyLatitude);
        session.setFacultyLongitude(facultyLongitude);

        attendanceSessionRepository.save(session);

        Map<String, String> response = new HashMap<>();
        response.put("code", generatedCode);
        response.put("sessionId", session.getSessionId());
        response.put("message", "Code generated successfully");
        return response;
    }

    @PostMapping("/mark-attendance")
    public Map<String, String> markAttendance(@RequestBody Map<String, String> req) {

        String code = req.get("code");
        String regNo = req.get("regNo");
        String subject = req.get("subject");
        String className = req.get("className");

        Double studentLatitude = Double.valueOf(req.get("latitude"));
        Double studentLongitude = Double.valueOf(req.get("longitude"));

        AttendanceSession session = attendanceSessionRepository
                .findFirstByActiveTrueOrderByStartTimeDesc()
                .orElseThrow(() -> new RuntimeException("No active attendance session"));

        if (!session.getSubject().equals(subject)) {
            throw new RuntimeException("Wrong subject selected");
        }

        if (!session.getClassName().equals(className)) {
            throw new RuntimeException("Wrong class selected");
        }

        if (LocalDateTime.now().isAfter(session.getExpiresAt())) {
            throw new RuntimeException("Code expired. Ask faculty to generate a new code.");
        }

        if (!session.getCode().equals(code)) {
            throw new RuntimeException("Invalid code");
        }

        double distance = calculateDistance(
                session.getFacultyLatitude(),
                session.getFacultyLongitude(),
                studentLatitude,
                studentLongitude
        );

        if (distance > ALLOWED_DISTANCE_METERS) {
            throw new RuntimeException("You are not within 30 meters of faculty");
        }

        Student student = studentRepository.findByRegNo(regNo)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (!student.getClassName().equals(className)) {
            throw new RuntimeException("Student does not belong to this class");
        }

        AttendanceRecord record = attendanceRecordRepository
                .findBySessionIdAndRegNo(session.getSessionId(), regNo)
                .orElseThrow(() -> new RuntimeException("Attendance record not found"));

        record.setStatus("PRESENT");
        record.setDate(LocalDate.now());
        record.setTime(LocalTime.now());

        attendanceRecordRepository.save(record);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Attendance marked successfully");
        response.put("distance", String.format("%.2f meters", distance));
        return response;
    }

    @GetMapping("/current-attendance")
    public List<AttendanceRecord> getCurrentAttendance() {
        return attendanceSessionRepository.findFirstByActiveTrueOrderByStartTimeDesc()
                .map(session -> attendanceRecordRepository.findBySessionId(session.getSessionId()))
                .orElse(new ArrayList<>());
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

        long total = attendanceRecordRepository.countByRegNoAndSubject(regNo, subject);
        long present = attendanceRecordRepository.countByRegNoAndSubjectAndStatus(regNo, subject, "PRESENT");

        double percentage = total == 0 ? 0.0 : (present * 100.0) / total;

        Map<String, Double> response = new HashMap<>();
        response.put("percentage", percentage);
        return response;
    }

    @GetMapping("/student-stats")
    public Map<String, Object> getStudentStats(@RequestParam String regNo,
                                               @RequestParam String subject) {

        Student student = studentRepository.findByRegNo(regNo)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        long total = attendanceRecordRepository.countByRegNoAndSubject(regNo, subject);
        long present = attendanceRecordRepository.countByRegNoAndSubjectAndStatus(regNo, subject, "PRESENT");

        double percentage = total == 0 ? 0.0 : (present * 100.0) / total;

        int neededClasses = 0;

        if (percentage < 75 && total > 0) {
            neededClasses = (int) Math.ceil(((0.75 * total) - present) / 0.25);

            if (neededClasses < 0) {
                neededClasses = 0;
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("name", student.getName());
        response.put("regNo", student.getRegNo());
        response.put("className", student.getClassName());
        response.put("subject", subject);
        response.put("totalClasses", total);
        response.put("presentCount", present);
        response.put("attendancePercentage", percentage);
        response.put("neededClasses", neededClasses);

        return response;
    }

    @GetMapping("/remaining-time")
    public Map<String, Object> getRemainingTime() {
        return attendanceSessionRepository.findFirstByActiveTrueOrderByStartTimeDesc()
                .map(session -> {
                    long remaining = Duration.between(LocalDateTime.now(), session.getExpiresAt()).getSeconds();

                    Map<String, Object> response = new HashMap<>();
                    response.put("active", true);
                    response.put("subject", session.getSubject());
                    response.put("className", session.getClassName());

                    if (remaining <= 0) {
                        response.put("codeActive", false);
                        response.put("remainingSeconds", 0);
                    } else {
                        response.put("codeActive", true);
                        response.put("remainingSeconds", remaining);
                    }

                    return response;
                })
                .orElseGet(() -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("active", false);
                    response.put("codeActive", false);
                    response.put("remainingSeconds", 0);
                    return response;
                });
    }

    @GetMapping("/attendance-summary")
    public List<Map<String, Object>> getAttendanceSummary(@RequestParam String className,
                                                          @RequestParam String subject) {

        List<Student> students = studentRepository.findByClassName(className);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Student student : students) {
            long total = attendanceRecordRepository.countByRegNoAndSubject(student.getRegNo(), subject);
            long present = attendanceRecordRepository.countByRegNoAndSubjectAndStatus(student.getRegNo(), subject, "PRESENT");

            double percentage = total == 0 ? 0.0 : (present * 100.0) / total;

            Map<String, Object> data = new HashMap<>();
            data.put("regNo", student.getRegNo());
            data.put("name", student.getName());
            data.put("presentCount", present);
            data.put("totalClasses", total);
            data.put("percentage", percentage);

            result.add(data);
        }

        return result;
    }

    @GetMapping(value = "/attendance-csv", produces = "text/csv")
    public String downloadAttendanceCSV(@RequestParam String className,
                                        @RequestParam String subject) {

        List<Student> students = studentRepository.findByClassName(className);

        StringBuilder csv = new StringBuilder();

        csv.append("Reg No,Name,Subject,Classes Attended,Total Classes,Percentage\n");

        for (Student student : students) {

            long total = attendanceRecordRepository
                    .countByRegNoAndSubject(student.getRegNo(), subject);

            long present = attendanceRecordRepository
                    .countByRegNoAndSubjectAndStatus(
                            student.getRegNo(),
                            subject,
                            "PRESENT"
                    );

            double percentage = total == 0 ? 0.0 : (present * 100.0) / total;

            csv.append(student.getRegNo()).append(",");
            csv.append(student.getName()).append(",");
            csv.append(subject).append(",");
            csv.append(present).append(",");
            csv.append(total).append(",");
            csv.append(String.format("%.2f", percentage)).append("\n");
        }

        return csv.toString();
    }

    @PostMapping("/end-attendance")
    public Map<String, String> endAttendance() {
        attendanceSessionRepository.findFirstByActiveTrueOrderByStartTimeDesc()
                .ifPresent(session -> {
                    session.setActive(false);
                    attendanceSessionRepository.save(session);
                });

        Map<String, String> response = new HashMap<>();
        response.put("message", "Attendance session ended");
        return response;
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000;

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }
}