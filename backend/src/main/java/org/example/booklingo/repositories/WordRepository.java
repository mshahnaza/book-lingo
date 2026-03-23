package org.example.booklingo.repositories;

import org.example.booklingo.entities.Word;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WordRepository extends JpaRepository<Word, Long> {

    List<Word> findByUserId(Long userId);

    List<Word> findByUserIdOrderBySavedAtDesc(Long userId);

    List<Word> findByBookId(Long bookId);

    Optional<Word> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);
}