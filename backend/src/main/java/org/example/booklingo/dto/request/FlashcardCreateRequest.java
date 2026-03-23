package org.example.booklingo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashcardCreateRequest {

    @NotBlank(message = "Front side is required")
    @Size(max = 200, message = "Front side must not exceed 200 characters")
    private String front;

    @NotBlank(message = "Back side is required")
    @Size(max = 200, message = "Back side must not exceed 200 characters")
    private String back;

    private Long wordId;
}