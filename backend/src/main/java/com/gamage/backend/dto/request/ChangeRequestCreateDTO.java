
package com.gamage.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ChangeRequestCreateDTO(

        @NotBlank(message = "Field name is required") @Pattern(regexp = "name|email|course", message = "Field must be name, email or course") String fieldName,

        @NotBlank(message = "New value is required") @Size(max = 255) String newValue,

        @NotBlank(message = "Reason is required") @Size(max = 1000) String reason

) {
}
