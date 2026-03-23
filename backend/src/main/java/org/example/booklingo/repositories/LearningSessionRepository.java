package org.example.booklingo.repositories;

import org.example.booklingo.entities.LearningSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LearningSessionRepository extends JpaRepository<LearningSession, Long> {

    List<LearningSession> findByUserIdOrderByReviewedAtDesc(Long userId);

    List<LearningSession> findByFlashcardIdOrderByReviewedAtDesc(Long flashcardId);

    long countByUserIdAndReviewedAtAfter(Long userId, LocalDateTime dateTime);

    List<LearningSession> findByUserIdAndReviewedAtBetween(Long userId, LocalDateTime start, LocalDateTime end);

    long countByUserId(Long userId);
}