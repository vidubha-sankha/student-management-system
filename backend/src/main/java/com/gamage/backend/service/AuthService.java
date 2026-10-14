
package com.gamage.backend.service;

import com.gamage.backend.dto.RegisterRequest;
import com.gamage.backend.dto.LoginRequest;
import com.gamage.backend.dto.AuthResponse;

import com.gamage.backend.entity.AppUser;
import com.gamage.backend.entity.Role;

import com.gamage.backend.repository.AppUserRepository;
import com.gamage.backend.security.JwtService;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
public class AuthService {

    // Dependencies
    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // Constructor Injection
    public AuthService(
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // ========================================
    // 1. REGISTER USER
    // ========================================

    public AppUser register(RegisterRequest request) {

        String email = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email is already registered");
        }

        AppUser user = new AppUser();

        user.setName(request.name().trim());
        user.setEmail(email);

        // Hash password using BCrypt
        user.setPassword(
                passwordEncoder.encode(request.password()));

        // Default role
        user.setRole(Role.STUDENT);

        return userRepository.save(user);
    }

    // ========================================
    // 2. LOGIN USER
    // ========================================

    public AuthResponse login(LoginRequest request) {

        String email = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        // Find user by email
        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid email or password"));

        // Verify password
        if (!passwordEncoder.matches(
                request.password(),
                user.getPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password");
        }

        // Generate JWT Token
        String token = jwtService.generateToken(user);

        // Return login response
        return new AuthResponse(
                token,
                "Bearer",
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name());
    }
}
