package com.gamage.backend.controller;

import com.gamage.backend.dto.StudentProfileResponseDTO;
import com.gamage.backend.service.StudentProfileService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/student")
public class StudentProfileController {

    private final StudentProfileService profileService;

    public StudentProfileController(
            StudentProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/me")
    public StudentProfileResponseDTO getMyProfile(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required");
        }

        String email = authentication.getName();

        return profileService.getMyProfile(email);
    }
}
