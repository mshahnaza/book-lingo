package org.example.booklingo.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashcardReviewRequest {

    @NotNull(message = "Flashcard ID is required")
    private Long flashcardId;

    @NotNull(message = "Quality rating is required")
    @Min(value = 0, message = "Quality must be between 0 and 5")
    @Max(value = 5, message = "Quality must be between 0 and 5")
    private Integer quality;

    private Integer responseTimeSeconds;
}