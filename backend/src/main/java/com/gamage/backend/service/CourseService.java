package com.gamage.backend.service;

import com.gamage.backend.dto.request.CourseRequestDTO;
import com.gamage.backend.dto.response.CourseResponseDTO;
import com.gamage.backend.entity.Course;
import com.gamage.backend.repository.CourseRepository;
import com.gamage.backend.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class CourseService {

    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;

    public CourseService(CourseRepository courseRepository, StudentRepository studentRepository) {
        this.courseRepository = courseRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional(readOnly = true)
    public List<CourseResponseDTO> findAll() {
        return courseRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public CourseResponseDTO findById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        return toResponseDTO(course);
    }

    public CourseResponseDTO create(CourseRequestDTO request) {
        Course course = new Course();
        course.setName(request.name().trim());
        course.setDescription(request.description() != null ? request.description().trim() : null);

        Course saved = courseRepository.save(course);
        return toResponseDTO(saved);
    }

    public CourseResponseDTO update(Long id, CourseRequestDTO request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        course.setName(request.name().trim());
        course.setDescription(request.description() != null ? request.description().trim() : null);

        Course updated = courseRepository.save(course);
        return toResponseDTO(updated);
    }

    public void delete(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found");
        }
        if (studentRepository.existsByCourseId(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete course: enrolled students exist");
        }
        courseRepository.deleteById(id);
    }

    public CourseResponseDTO toResponseDTO(Course course) {
        if (course == null) {
            return null;
        }
        return new CourseResponseDTO(course.getId(), course.getName(), course.getDescription());
    }
}
