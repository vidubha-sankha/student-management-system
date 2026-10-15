package com.gamage.backend.dto.response;

public record StudentResponseDTO(Long id, String name, String email, CourseResponseDTO course) {

}
