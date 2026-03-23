package org.example.booklingo.repositories;

import org.example.booklingo.entities.DailyChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyChallengeRepository extends JpaRepository<DailyChallenge, Long> {

    Optional<DailyChallenge> findByUserIdAndChallengeDate(Long userId, LocalDate date);

    List<DailyChallenge> findByUserId(Long userId);

    boolean existsByUserIdAndChallengeDateAndIsCompletedTrue(Long userId, LocalDate date);
}