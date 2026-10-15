package com.gamage.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CourseRequestDTO(
        @NotBlank(message = "Course name is required") String name,
        String description) {
}
