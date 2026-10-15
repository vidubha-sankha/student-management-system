package com.gamage.backend.service;

import com.gamage.backend.dto.AuthResponse;
import com.gamage.backend.dto.LoginRequest;
import com.gamage.backend.dto.RegisterRequestDTO;

import com.gamage.backend.entity.AppUser;
import com.gamage.backend.entity.Course;
import com.gamage.backend.entity.Role;
import com.gamage.backend.entity.Student;

import com.gamage.backend.repository.AppUserRepository;
import com.gamage.backend.repository.CourseRepository;
import com.gamage.backend.repository.StudentRepository;

import com.gamage.backend.security.JwtService;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
public class AuthService {

        private final AppUserRepository userRepository;
        private final StudentRepository studentRepository;
        private final CourseRepository courseRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;

        public AuthService(
                        AppUserRepository userRepository,
                        StudentRepository studentRepository,
                        CourseRepository courseRepository,
                        PasswordEncoder passwordEncoder,
                        JwtService jwtService) {
                this.userRepository = userRepository;
                this.studentRepository = studentRepository;
                this.courseRepository = courseRepository;
                this.passwordEncoder = passwordEncoder;
                this.jwtService = jwtService;
        }

        // =====================================
        // STUDENT REGISTRATION
        // =====================================

        @Transactional
        public void registerStudent(RegisterRequestDTO request) {

                // 1. Check password confirmation
                if (!request.password().equals(request.confirmPassword())) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Passwords do not match");
                }

                // 2. Normalize email
                String email = request.email()
                                .trim()
                                .toLowerCase(Locale.ROOT);

                // 3. Check duplicate email
                if (userRepository.existsByEmail(email)
                                || studentRepository.existsByEmail(email)) {
                        throw new ResponseStatusException(
                                        HttpStatus.CONFLICT,
                                        "Email is already registered");
                }

                // 4. Find course
                Course course = courseRepository
                                .findById(request.courseId())
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Selected course not found"));

                // 5. Create user account
                AppUser user = new AppUser();
                user.setName(request.name().trim());
                user.setEmail(email);
                user.setPassword(
                                passwordEncoder.encode(request.password()));
                user.setRole(Role.STUDENT);

                AppUser savedUser = userRepository.save(user);

                // 6. Create student profile
                Student student = new Student();
                student.setName(request.name().trim());
                student.setEmail(email);
                student.setCourse(course);
                student.setUser(savedUser);

                studentRepository.save(student);
        }

        // =====================================
        // STUDENT / ADMIN LOGIN
        // =====================================

        @Transactional(readOnly = true)
        public AuthResponse login(LoginRequest request) {

                // 1. Normalize email
                String email = request.email()
                                .trim()
                                .toLowerCase(Locale.ROOT);

                // 2. Find user
                AppUser user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.UNAUTHORIZED,
                                                "Invalid email or password"));

                // 3. Verify password using BCrypt
                if (!passwordEncoder.matches(
                                request.password(),
                                user.getPassword())) {
                        throw new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "Invalid email or password");
                }

                // 4. Generate JWT token
                String token = jwtService.generateToken(user);

                // 5. Return authentication response
                return new AuthResponse(
                                token,
                                "Bearer",
                                user.getId(),
                                user.getName(),
                                user.getEmail(),
                                user.getRole().name());
        }
}
