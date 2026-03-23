package org.example.booklingo.repositories;

import org.example.booklingo.entities.UserGrammarProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserGrammarProgressRepository extends JpaRepository<UserGrammarProgress, Long> {

    List<UserGrammarProgress> findByUserId(Long userId);

    Optional<UserGrammarProgress> findByUserIdAndTopicId(Long userId, Long topicId);

    long countByUserIdAndCompletedTrue(Long userId);

    @Query("SELECT COUNT(p) FROM UserGrammarProgress p WHERE p.user.id = :userId AND p.completed = true AND p.topic.level = :level")
    long countCompletedByUserIdAndLevel(@Param("userId") Long userId, @Param("level") String level);

    List<UserGrammarProgress> findByUserIdAndTopicLevel(Long userId, String level);
}