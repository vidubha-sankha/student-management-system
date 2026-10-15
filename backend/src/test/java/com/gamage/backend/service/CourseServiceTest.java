package com.gamage.backend.service;

import com.gamage.backend.dto.request.CourseRequestDTO;
import com.gamage.backend.dto.response.CourseResponseDTO;
import com.gamage.backend.entity.Course;
import com.gamage.backend.repository.CourseRepository;
import com.gamage.backend.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private CourseService courseService;

    private Course course;

    @BeforeEach
    void setUp() {
        course = new Course(1L, "Computer Science", "Intro to CS");
    }

    @Test
    void findAll_returnsAllCourses() {
        when(courseRepository.findAll()).thenReturn(List.of(course));

        List<CourseResponseDTO> results = courseService.findAll();

        assertEquals(1, results.size());
        assertEquals("Computer Science", results.get(0).name());
        verify(courseRepository, times(1)).findAll();
    }

    @Test
    void findById_found_returnsCourse() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));

        CourseResponseDTO result = courseService.findById(1L);

        assertNotNull(result);
        assertEquals("Computer Science", result.name());
    }

    @Test
    void findById_notFound_throwsException() {
        when(courseRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> courseService.findById(99L));
    }

    @Test
    void create_savesAndReturnsCourse() {
        CourseRequestDTO request = new CourseRequestDTO("Mathematics", "Calculus");
        Course saved = new Course(2L, "Mathematics", "Calculus");
        when(courseRepository.save(any(Course.class))).thenReturn(saved);

        CourseResponseDTO result = courseService.create(request);

        assertNotNull(result);
        assertEquals(2L, result.id());
        assertEquals("Mathematics", result.name());
    }

    @Test
    void update_found_updatesAndReturnsCourse() {
        CourseRequestDTO request = new CourseRequestDTO("Advanced CS", "Updated Desc");
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(courseRepository.save(any(Course.class))).thenAnswer(i -> i.getArgument(0));

        CourseResponseDTO result = courseService.update(1L, request);

        assertEquals("Advanced CS", result.name());
        assertEquals("Updated Desc", result.description());
    }

    @Test
    void delete_existingAndNoStudents_deletesCourse() {
        when(courseRepository.existsById(1L)).thenReturn(true);
        when(studentRepository.existsByCourseId(1L)).thenReturn(false);

        assertDoesNotThrow(() -> courseService.delete(1L));
        verify(courseRepository, times(1)).deleteById(1L);
    }

    @Test
    void delete_enrolledStudentsExist_throwsBadRequest() {
        when(courseRepository.existsById(1L)).thenReturn(true);
        when(studentRepository.existsByCourseId(1L)).thenReturn(true);

        assertThrows(ResponseStatusException.class, () -> courseService.delete(1L));
        verify(courseRepository, never()).deleteById(1L);
    }
}
