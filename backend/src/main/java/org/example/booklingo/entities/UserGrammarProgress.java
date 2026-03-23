package org.example.booklingo.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_grammar_progress", indexes = {
    @Index(name = "idx_user_grammar_user_id", columnList = "user_id"),
    @Index(name = "idx_user_grammar_topic_id", columnList = "topic_id")
}, uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "topic_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserGrammarProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "topic_id", nullable = false)
    private GrammarTopic topic;

    @Column(nullable = false)
    @Builder.Default
    private Boolean completed = false;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "visited_at")
    private LocalDateTime visitedAt;

    @PrePersist
    protected void onCreate() {
        visitedAt = LocalDateTime.now();
    }
}