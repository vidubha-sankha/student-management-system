package com.gamage.backend.service;

import com.gamage.backend.dto.response.CourseResponseDTO;
import com.gamage.backend.dto.response.StudentProfileResponseDTO;
import com.gamage.backend.entity.Course;
import com.gamage.backend.entity.Student;
import com.gamage.backend.repository.StudentRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class StudentProfileService {

    private final StudentRepository studentRepository;

    public StudentProfileService(
            StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Transactional(readOnly = true)
    public StudentProfileResponseDTO getMyProfile(
            String email) {

        Student student = studentRepository
                .findByUser_Email(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Student profile not found"));

        CourseResponseDTO courseDTO = null;

        Course course = student.getCourse();

        if (course != null) {
            courseDTO = new CourseResponseDTO(
                    course.getId(),
                    course.getName(),
                    course.getDescription());
        }

        return new StudentProfileResponseDTO(
                student.getId(),
                student.getName(),
                student.getEmail(),
                courseDTO,
                student.getProfilePhotoUrl());
    }
}
