package com.gamage.backend.dto;

public record StudentProfileResponseDTO(
        Long id,
        String name,
        String email,
        CourseResponseDTO course,
        String profilePhotoUrl) {
}
