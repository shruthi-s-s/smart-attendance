package com.example.attendance;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.example.attendance.model.Faculty;
import com.example.attendance.model.Student;
import com.example.attendance.repository.FacultyRepository;
import com.example.attendance.repository.StudentRepository;

@SpringBootApplication
public class AttendanceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AttendanceApplication.class, args);
    }

    @Bean
    CommandLineRunner loadData(StudentRepository studentRepository, FacultyRepository facultyRepository) {
        return args -> {

            if (studentRepository.count() == 0) {
                studentRepository.save(new Student("Arun Kumar", "211724001", "student1@college.com", "1234", "AIDS-A"));
                studentRepository.save(new Student("Priya S", "211724002", "student2@college.com", "1234", "AIDS-A"));
                studentRepository.save(new Student("Kavin Raj", "211724003", "student3@college.com", "1234", "AIDS-A"));
                studentRepository.save(new Student("Nisha M", "211724004", "student4@college.com", "1234", "AIDS-A"));
                studentRepository.save(new Student("Vikram R", "211724005", "student5@college.com", "1234", "AIDS-A"));
            }

            if (facultyRepository.count() == 0) {
                facultyRepository.save(
                        new Faculty(
                                "OS Faculty",
                                "faculty@college.com",
                                "1234",
                                "Operating Systems",
                                "AIDS-A"
                        )
                );
            }
        };
    }
}