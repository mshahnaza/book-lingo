package org.example.booklingo.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "flashcards", indexes = {
    @Index(name = "idx_flashcard_user_id", columnList = "user_id"),
    @Index(name = "idx_flashcard_next_review", columnList = "user_id, next_review_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Flashcard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "word_id")
    private Word word;

    @Column(nullable = false, length = 200)
    private String front;

    @Column(nullable = false, length = 200)
    private String back;

    @Column(name = "next_review_date")
    private LocalDate nextReviewDate;

    @Column(name = "ease_factor")
    @Builder.Default
    private Double easeFactor = 2.5;

    @Column(name = "interval_days")
    @Builder.Default
    private Integer intervalDays = 0;

    @Column(name = "repetitions")
    @Builder.Default
    private Integer repetitions = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "flashcard", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("reviewedAt DESC")
    @Builder.Default
    private List<LearningSession> learningSessions = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (nextReviewDate == null) {
            nextReviewDate = LocalDate.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}