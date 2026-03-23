package org.example.booklingo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningStatisticsResponse {

    private Integer totalFlashcards;
    private Integer flashcardsDueToday;
    private Integer totalReviewsToday;
    private Integer totalWords;
    private Integer totalBooks;
    private Double averageEaseFactor;
    private Integer streak;
}
