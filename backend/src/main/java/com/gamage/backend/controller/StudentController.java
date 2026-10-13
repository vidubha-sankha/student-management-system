
package com.gamage.backend.controller;

import com.gamage.backend.entity.Student;
import com.gamage.backend.repository.StudentRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:3000")
public class StudentController {

    private final StudentRepository studentRepository;

    // Constructor
    public StudentController(
            StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    // 1. GET - Get all students
    @GetMapping
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    // 2. GET - Get student by ID
    @GetMapping("/{id}")
    public Student getStudentById(
            @PathVariable Long id) {

        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    // 3. POST - Create new student
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Student createStudent(
            @RequestBody Student student) {

        return studentRepository.save(student);
    }

    // 4. PUT - Update student
    @PutMapping("/{id}")
    public Student updateStudent(
            @PathVariable Long id,
            @RequestBody Student updatedStudent) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        student.setName(updatedStudent.getName());
        student.setEmail(updatedStudent.getEmail());
        student.setCourse(updatedStudent.getCourse());

        return studentRepository.save(student);
    }

    // 5. DELETE - Delete student
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteStudent(
            @PathVariable Long id) {

        if (!studentRepository.existsById(id)) {
            throw new RuntimeException("Student not found");
        }

        studentRepository.deleteById(id);
    }
}
