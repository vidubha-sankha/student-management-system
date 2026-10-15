
package com.gamage.backend.controller;

import com.gamage.backend.dto.request.AdminReviewRequestDTO;
import com.gamage.backend.dto.request.ChangeRequestCreateDTO;
import com.gamage.backend.dto.response.ChangeRequestResponseDTO;
import com.gamage.backend.service.ChangeRequestService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ChangeRequestController {

    private final ChangeRequestService changeRequestService;

    public ChangeRequestController(
            ChangeRequestService changeRequestService) {
        this.changeRequestService = changeRequestService;
    }

    // STUDENT: Submit a new change request
    @PostMapping("/student/requests")
    public ResponseEntity<ChangeRequestResponseDTO> createRequest(
            Authentication authentication,
            @Valid @RequestBody ChangeRequestCreateDTO dto) {

        ChangeRequestResponseDTO response = changeRequestService.createRequest(
                authentication.getName(),
                dto);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // STUDENT: View own request history
    @GetMapping("/student/requests")
    public List<ChangeRequestResponseDTO> getMyRequests(
            Authentication authentication) {

        return changeRequestService.getMyRequests(
                authentication.getName());
    }

    // ADMIN: View all requests or filter by status
    @GetMapping("/admin/requests")
    public List<ChangeRequestResponseDTO> getAllRequests(
            @RequestParam(required = false) String status) {

        if (status != null && !status.isBlank()) {
            return changeRequestService.getRequestsByStatus(status);
        }

        return changeRequestService.getAllRequests();
    }

    // ADMIN: Approve or reject a change request
    @PutMapping("/admin/requests/{id}/review")
    public ChangeRequestResponseDTO reviewRequest(
            @PathVariable Long id,
            @Valid @RequestBody AdminReviewRequestDTO dto) {

        return changeRequestService.reviewRequest(id, dto);
    }
}
