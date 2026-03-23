package org.example.booklingo.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "learning_sessions", indexes = {
    @Index(name = "idx_learning_session_user_id", columnList = "user_id"),
    @Index(name = "idx_learning_session_flashcard_id", columnList = "flashcard_id"),
    @Index(name = "idx_learning_session_reviewed_at", columnList = "user_id, reviewed_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "flashcard_id", nullable = false)
    private Flashcard flashcard;

    @Column(name = "reviewed_at", nullable = false)
    private LocalDateTime reviewedAt;

    @Column(nullable = false)
    private Integer quality;

    @Column(name = "response_time_seconds")
    private Integer responseTimeSeconds;

    @PrePersist
    protected void onCreate() {
        reviewedAt = LocalDateTime.now();
    }
}