package org.example.booklingo.repositories;

import org.example.booklingo.entities.Flashcard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlashcardRepository extends JpaRepository<Flashcard, Long> {

    List<Flashcard> findByUserId(Long userId);

    List<Flashcard> findByUserIdAndNextReviewDateLessThanEqual(Long userId, LocalDate date);

    Optional<Flashcard> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);
}