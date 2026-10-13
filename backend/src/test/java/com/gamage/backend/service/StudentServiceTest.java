package com.gamage.backend.service;

import com.gamage.backend.dto.StudentRequestDTO;
import com.gamage.backend.dto.StudentResponseDTO;
import com.gamage.backend.entity.Course;
import com.gamage.backend.entity.Student;
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
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private CourseRepository courseRepository;

    @InjectMocks
    private StudentService studentService;

    private Course course;
    private Student student;

    @BeforeEach
    void setUp() {
        course = new Course(1L, "Computer Science", "Intro to CS");
        student = new Student(1L, "Alice Smith", "alice@example.com", course);
    }

    @Test
    void findAll_returnsAllStudents() {
        when(studentRepository.findAll()).thenReturn(List.of(student));

        List<StudentResponseDTO> results = studentService.findAll();

        assertEquals(1, results.size());
        assertEquals("Alice Smith", results.get(0).name());
        assertEquals("Computer Science", results.get(0).course().name());
    }

    @Test
    void findById_found_returnsStudent() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        StudentResponseDTO result = studentService.findById(1L);

        assertNotNull(result);
        assertEquals("alice@example.com", result.email());
    }

    @Test
    void create_duplicateEmail_throwsConflict() {
        StudentRequestDTO request = new StudentRequestDTO("Alice Duplicate", "alice@example.com", 1L);
        when(studentRepository.existsByEmail("alice@example.com")).thenReturn(true);

        assertThrows(ResponseStatusException.class, () -> studentService.create(request));
        verify(studentRepository, never()).save(any());
    }

    @Test
    void create_validRequestWithCourse_savesStudent() {
        StudentRequestDTO request = new StudentRequestDTO("Bob Doe", "bob@example.com", 1L);
        when(studentRepository.existsByEmail("bob@example.com")).thenReturn(false);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));

        Student savedStudent = new Student(2L, "Bob Doe", "bob@example.com", course);
        when(studentRepository.save(any(Student.class))).thenReturn(savedStudent);

        StudentResponseDTO result = studentService.create(request);

        assertNotNull(result);
        assertEquals("Bob Doe", result.name());
        assertEquals("Computer Science", result.course().name());
    }

    @Test
    void create_validRequestWithoutCourse_savesStudentWithNullCourse() {
        StudentRequestDTO request = new StudentRequestDTO("Charlie", "charlie@example.com", null);
        when(studentRepository.existsByEmail("charlie@example.com")).thenReturn(false);

        Student savedStudent = new Student(3L, "Charlie", "charlie@example.com", null);
        when(studentRepository.save(any(Student.class))).thenReturn(savedStudent);

        StudentResponseDTO result = studentService.create(request);

        assertNotNull(result);
        assertEquals("Charlie", result.name());
        assertNull(result.course());
    }

    @Test
    void delete_existingStudent_deletesSuccessfully() {
        when(studentRepository.existsById(1L)).thenReturn(true);

        assertDoesNotThrow(() -> studentService.delete(1L));
        verify(studentRepository, times(1)).deleteById(1L);
    }
}
