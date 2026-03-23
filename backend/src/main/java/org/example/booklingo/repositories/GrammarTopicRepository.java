package org.example.booklingo.repositories;

import org.example.booklingo.entities.GrammarTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrammarTopicRepository extends JpaRepository<GrammarTopic, Long> {

    List<GrammarTopic> findByLevelOrderByDisplayOrderAsc(String level);

    List<GrammarTopic> findAllByOrderByLevelAscDisplayOrderAsc();

    long countByLevel(String level);
}