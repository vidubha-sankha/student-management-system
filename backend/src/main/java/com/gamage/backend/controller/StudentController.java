package com.gamage.backend.controller;
import com.gamage.backend.dto.*;
import com.gamage.backend.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:3000")
public class StudentController {
    private final StudentService service;
    public StudentController(StudentService service) { this.service = service; }
    @GetMapping public List<StudentResponseDTO> getAllStudents() { return service.findAll(); }
    @GetMapping("/{id}") public StudentResponseDTO getStudentById(@PathVariable Long id) { return service.findById(id); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public StudentResponseDTO createStudent(@Valid @RequestBody StudentRequestDTO request) { return service.create(request); }
    @PutMapping("/{id}")
    public StudentResponseDTO updateStudent(@PathVariable Long id, @Valid @RequestBody StudentRequestDTO request) { return service.update(id, request); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteStudent(@PathVariable Long id) { service.delete(id); }
}
