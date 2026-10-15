
package com.gamage.backend.service;

import com.gamage.backend.dto.request.AdminReviewRequestDTO;
import com.gamage.backend.dto.request.ChangeRequestCreateDTO;
import com.gamage.backend.dto.response.ChangeRequestResponseDTO;

import com.gamage.backend.entity.AppUser;
import com.gamage.backend.entity.ChangeRequest;
import com.gamage.backend.entity.Course;
import com.gamage.backend.entity.Student;

import com.gamage.backend.repository.AppUserRepository;
import com.gamage.backend.repository.ChangeRequestRepository;
import com.gamage.backend.repository.CourseRepository;
import com.gamage.backend.repository.StudentRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
public class ChangeRequestService {

    private final ChangeRequestRepository changeRequestRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final AppUserRepository appUserRepository;

    public ChangeRequestService(
            ChangeRequestRepository changeRequestRepository,
            StudentRepository studentRepository,
            CourseRepository courseRepository,
            AppUserRepository appUserRepository) {

        this.changeRequestRepository = changeRequestRepository;
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
        this.appUserRepository = appUserRepository;
    }

    // STUDENT: Submit a new change request
    @Transactional
    public ChangeRequestResponseDTO createRequest(
            String loggedInEmail,
            ChangeRequestCreateDTO dto) {

        Student student = findLoggedInStudent(loggedInEmail);

        String fieldName = dto.fieldName();
        String newValue = dto.newValue().trim();
        String reason = dto.reason().trim();

        if (newValue.isBlank() || reason.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "New value and reason cannot be empty");
        }

        if (fieldName == null ||
                !List.of("name", "email", "course")
                        .contains(fieldName)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid field name");
        }

        if ("email".equals(fieldName) &&
                !newValue.matches(
                        "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid email address");
        }

        if ("course".equals(fieldName)) {
            Long courseId = parseCourseId(newValue);

            if (!courseRepository.existsById(courseId)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Selected course does not exist");
            }
        }

        ChangeRequest request = new ChangeRequest();
        request.setStudent(student);
        request.setFieldName(fieldName);
        request.setNewValue(newValue);
        request.setReason(reason);
        request.setStatus("PENDING");

        ChangeRequest saved = changeRequestRepository.save(request);

        return toResponse(saved);
    }

    // STUDENT: View own request history
    @Transactional(readOnly = true)
    public List<ChangeRequestResponseDTO> getMyRequests(
            String loggedInEmail) {

        Student student = findLoggedInStudent(loggedInEmail);

        return changeRequestRepository
                .findByStudent_IdOrderByCreatedAtDesc(
                        student.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ADMIN: View all requests
    @Transactional(readOnly = true)
    public List<ChangeRequestResponseDTO> getAllRequests() {

        return changeRequestRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ADMIN: Filter requests by status
    @Transactional(readOnly = true)
    public List<ChangeRequestResponseDTO> getRequestsByStatus(
            String status) {

        String normalized = status.toUpperCase(Locale.ROOT);

        if (!List.of("PENDING", "APPROVED", "REJECTED")
                .contains(normalized)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid request status");
        }

        return changeRequestRepository
                .findByStatusOrderByCreatedAtDesc(normalized)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ADMIN: Approve or reject a change request
    @Transactional
    public ChangeRequestResponseDTO reviewRequest(
            Long requestId,
            AdminReviewRequestDTO dto) {

        ChangeRequest request = changeRequestRepository
                .findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Change request not found"));

        if (!"PENDING".equals(request.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This request has already been reviewed");
        }

        String decision = dto.status();

        if (!List.of("APPROVED", "REJECTED")
                .contains(decision)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid review status");
        }

        if ("APPROVED".equals(decision)) {
            applyApprovedChange(request);
        }

        request.setStatus(decision);
        request.setAdminComment(
                dto.adminComment() == null
                        ? null
                        : dto.adminComment().trim());
        request.setReviewedAt(LocalDateTime.now());

        ChangeRequest saved = changeRequestRepository.save(request);

        return toResponse(saved);
    }

    // Apply approved changes to student information
    private void applyApprovedChange(
            ChangeRequest request) {

        Student student = request.getStudent();
        AppUser user = student.getUser();

        String fieldName = request.getFieldName();
        String newValue = request.getNewValue().trim();

        switch (fieldName) {

            case "name" -> {

                student.setName(newValue);

                if (user != null) {
                    user.setName(newValue);
                    appUserRepository.save(user);
                }
            }

            case "email" -> {

                if (!newValue.matches(
                        "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Invalid email address");
                }

                boolean studentEmailTaken = studentRepository.existsByEmail(newValue)
                        && !student.getEmail()
                                .equals(newValue);

                boolean userEmailTaken = appUserRepository.existsByEmail(newValue)
                        && (user == null
                                || !user.getEmail()
                                        .equals(newValue));

                if (studentEmailTaken || userEmailTaken) {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Email address is already in use");
                }

                student.setEmail(newValue);

                if (user != null) {
                    user.setEmail(newValue);
                    appUserRepository.save(user);
                }
            }

            case "course" -> {

                Long courseId = parseCourseId(newValue);

                Course course = courseRepository
                        .findById(courseId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Selected course not found"));

                student.setCourse(course);
            }

            default -> throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unsupported field name");
        }

        studentRepository.save(student);
    }

    // Convert course ID from text to number
    private Long parseCourseId(String value) {

        try {
            Long courseId = Long.valueOf(value);

            if (courseId <= 0) {
                throw new NumberFormatException();
            }

            return courseId;

        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Valid course ID is required");
        }
    }

    // Find the currently logged-in student
    private Student findLoggedInStudent(String email) {

        return studentRepository
                .findByUser_Email(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Student profile not found"));
    }

    // Convert entity to response DTO
    private ChangeRequestResponseDTO toResponse(
            ChangeRequest request) {

        return new ChangeRequestResponseDTO(
                request.getId(),
                request.getStudent().getId(),
                request.getStudent().getName(),
                request.getFieldName(),
                request.getNewValue(),
                request.getReason(),
                request.getStatus(),
                request.getAdminComment(),
                request.getCreatedAt(),
                request.getReviewedAt());
    }
}
