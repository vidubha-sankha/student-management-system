package com.gamage.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AdminReviewRequestDTO(

        @NotBlank(message = "Status is required") @Pattern(regexp = "APPROVED|REJECTED", message = "Status must be APPROVED or REJECTED") String status,

        String adminComment

) {
}
