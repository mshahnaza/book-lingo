package org.example.booklingo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashcardResponse {

    private Long id;
    private String front;
    private String back;
    private Long wordId;
    private LocalDate nextReviewDate;
    private Double easeFactor;
    private Integer intervalDays;
    private Integer repetitions;
    private LocalDateTime createdAt;
}
