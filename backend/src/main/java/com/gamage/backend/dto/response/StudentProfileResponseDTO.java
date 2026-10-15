package com.gamage.backend.dto.response;

public record StudentProfileResponseDTO(
                Long id,
                String name,
                String email,
                CourseResponseDTO course,
                String profilePhotoUrl) {
}
