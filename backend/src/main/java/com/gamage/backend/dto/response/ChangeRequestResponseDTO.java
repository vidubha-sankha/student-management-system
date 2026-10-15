
package com.gamage.backend.dto.response;

import java.time.LocalDateTime;

public record ChangeRequestResponseDTO(

        Long id,
        Long studentId,
        String studentName,
        String fieldName,
        String newValue,
        String reason,
        String status,
        String adminComment,
        LocalDateTime createdAt,
        LocalDateTime reviewedAt

) {
}
