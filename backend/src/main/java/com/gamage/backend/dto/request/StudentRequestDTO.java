package com.gamage.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@JsonIgnoreProperties(ignoreUnknown = true)
public record StudentRequestDTO(
        @NotBlank(message = "Student name is required") String name,

        @NotBlank(message = "Student email is required") @Email(message = "Valid email is required") String email,

        Long courseId,
        CourseRef course) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CourseRef(@JsonProperty("id") Long id) {
    }

    @JsonCreator
    public StudentRequestDTO(
            @JsonProperty("name") String name,
            @JsonProperty("email") String email,
            @JsonProperty("courseId") Long courseId,
            @JsonProperty("course") CourseRef course) {
        this.name = name;
        this.email = email;
        this.courseId = courseId;
        this.course = course;
    }

    public StudentRequestDTO(String name, String email, Long courseId) {
        this(name, email, courseId, null);
    }

    public Long resolvedCourseId() {
        if (courseId != null) {
            return courseId;
        }
        if (course != null && course.id() != null) {
            return course.id();
        }
        return null;
    }
}
