package org.example.booklingo.services;

import org.example.booklingo.dto.response.GrammarLevelResponse;

import java.util.List;

public interface GrammarService {

    List<GrammarLevelResponse> getAllLevelsWithProgress();

    void markTopicCompleted(Long topicId);

    void markTopicIncomplete(Long topicId);

    void recordTopicVisit(Long topicId);
}