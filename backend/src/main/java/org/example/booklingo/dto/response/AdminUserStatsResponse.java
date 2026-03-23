package org.example.booklingo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserStatsResponse {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private Boolean isEnabled;
    private LocalDateTime createdAt;
    private LocalDateTime lastActivity;

    // Learning statistics
    private Integer totalBooks;
    private Integer totalWords;
    private Integer totalFlashcards;
    private Integer flashcardsDueToday;
    private Integer totalReviewsToday;
    private Integer totalReviewsAllTime;
    private Double averageEaseFactor;

    // Activity indicators
    private Boolean isActive; // Had activity in last 7 days
    private Integer daysActive; // Days with activity in last 30 days
}