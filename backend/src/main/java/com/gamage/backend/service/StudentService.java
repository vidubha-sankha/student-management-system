package com.gamage.backend.service;

import com.gamage.backend.dto.CourseResponseDTO;
import com.gamage.backend.dto.StudentRequestDTO;
import com.gamage.backend.dto.StudentResponseDTO;
import com.gamage.backend.entity.Course;
import com.gamage.backend.entity.Student;
import com.gamage.backend.repository.CourseRepository;
import com.gamage.backend.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class StudentService {

    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    public StudentService(StudentRepository studentRepository, CourseRepository courseRepository) {
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
    }

    @Transactional(readOnly = true)
    public List<StudentResponseDTO> findAll() {
        return studentRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public StudentResponseDTO findById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        return toResponseDTO(student);
    }

    public StudentResponseDTO create(StudentRequestDTO request) {
        String trimmedEmail = request.email().trim();
        if (studentRepository.existsByEmail(trimmedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already in use");
        }

        Student student = new Student();
        student.setName(request.name().trim());
        student.setEmail(trimmedEmail);

        Long courseId = request.resolvedCourseId();
        if (courseId != null) {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found with id: " + courseId));
            student.setCourse(course);
        } else {
            student.setCourse(null);
        }

        Student saved = studentRepository.save(student);
        return toResponseDTO(saved);
    }

    public StudentResponseDTO update(Long id, StudentRequestDTO request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        String trimmedEmail = request.email().trim();
        if (!trimmedEmail.equalsIgnoreCase(student.getEmail()) && studentRepository.existsByEmail(trimmedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already in use");
        }

        student.setName(request.name().trim());
        student.setEmail(trimmedEmail);

        Long courseId = request.resolvedCourseId();
        if (courseId != null) {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found with id: " + courseId));
            student.setCourse(course);
        } else {
            student.setCourse(null);
        }

        Student updated = studentRepository.save(student);
        return toResponseDTO(updated);
    }

    public void delete(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found");
        }
        studentRepository.deleteById(id);
    }

    public StudentResponseDTO toResponseDTO(Student student) {
        if (student == null) {
            return null;
        }
        CourseResponseDTO courseDTO = null;
        if (student.getCourse() != null) {
            Course c = student.getCourse();
            courseDTO = new CourseResponseDTO(c.getId(), c.getName(), c.getDescription());
        }
        return new StudentResponseDTO(student.getId(), student.getName(), student.getEmail(), courseDTO);
    }
}
