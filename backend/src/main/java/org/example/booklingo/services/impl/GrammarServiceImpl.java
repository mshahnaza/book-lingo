package org.example.booklingo.services.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.booklingo.dto.response.GrammarLevelResponse;
import org.example.booklingo.dto.response.GrammarTopicResponse;
import org.example.booklingo.entities.GrammarTopic;
import org.example.booklingo.entities.User;
import org.example.booklingo.entities.UserGrammarProgress;
import org.example.booklingo.repositories.GrammarTopicRepository;
import org.example.booklingo.repositories.UserGrammarProgressRepository;
import org.example.booklingo.services.GrammarService;
import org.example.booklingo.services.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GrammarServiceImpl implements GrammarService {

    private final GrammarTopicRepository grammarTopicRepository;
    private final UserGrammarProgressRepository progressRepository;
    private final UserService userService;

    private static final Map<String, String> LEVEL_NAMES = Map.of(
            "A1-A2", "Elementary",
            "B1-B2", "Intermediate",
            "C1", "Advanced"
    );

    private static final Map<String, String> LEVEL_COLORS = Map.of(
            "A1-A2", "#4CAF50",
            "B1-B2", "#FF9800",
            "C1", "#9C27B0"
    );

    @Override
    @Transactional(readOnly = true)
    public List<GrammarLevelResponse> getAllLevelsWithProgress() {
        User currentUser = userService.getCurrentUser();
        List<GrammarTopic> allTopics = grammarTopicRepository.findAllByOrderByLevelAscDisplayOrderAsc();

        // Get user's progress
        Map<Long, UserGrammarProgress> progressMap = progressRepository.findByUserId(currentUser.getId())
                .stream()
                .collect(Collectors.toMap(p -> p.getTopic().getId(), p -> p));

        // Group topics by level
        Map<String, List<GrammarTopic>> topicsByLevel = allTopics.stream()
                .collect(Collectors.groupingBy(GrammarTopic::getLevel, LinkedHashMap::new, Collectors.toList()));

        List<GrammarLevelResponse> levels = new ArrayList<>();

        for (Map.Entry<String, List<GrammarTopic>> entry : topicsByLevel.entrySet()) {
            String level = entry.getKey();
            List<GrammarTopic> topics = entry.getValue();

            List<GrammarTopicResponse> topicResponses = topics.stream()
                    .map(topic -> {
                        UserGrammarProgress progress = progressMap.get(topic.getId());
                        return GrammarTopicResponse.builder()
                                .id(topic.getId())
                                .level(topic.getLevel())
                                .name(topic.getName())
                                .description(topic.getDescription())
                                .url(topic.getUrl())
                                .source(topic.getSource())
                                .completed(progress != null && progress.getCompleted())
                                .completedAt(progress != null && progress.getCompletedAt() != null
                                        ? progress.getCompletedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                                        : null)
                                .build();
                    })
                    .collect(Collectors.toList());

            int completedCount = (int) topicResponses.stream().filter(t -> Boolean.TRUE.equals(t.getCompleted())).count();

            levels.add(GrammarLevelResponse.builder()
                    .level(level)
                    .name(LEVEL_NAMES.getOrDefault(level, level))
                    .color(LEVEL_COLORS.getOrDefault(level, "#666666"))
                    .totalTopics(topics.size())
                    .completedTopics(completedCount)
                    .topics(topicResponses)
                    .build());
        }

        return levels;
    }

    @Override
    @Transactional
    public void markTopicCompleted(Long topicId) {
        User currentUser = userService.getCurrentUser();
        GrammarTopic topic = grammarTopicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        UserGrammarProgress progress = progressRepository.findByUserIdAndTopicId(currentUser.getId(), topicId)
                .orElse(UserGrammarProgress.builder()
                        .user(currentUser)
                        .topic(topic)
                        .build());

        progress.setCompleted(true);
        progress.setCompletedAt(LocalDateTime.now());
        progressRepository.save(progress);

        log.info("User {} marked topic {} as completed", currentUser.getUsername(), topic.getName());
    }

    @Override
    @Transactional
    public void markTopicIncomplete(Long topicId) {
        User currentUser = userService.getCurrentUser();

        progressRepository.findByUserIdAndTopicId(currentUser.getId(), topicId)
                .ifPresent(progress -> {
                    progress.setCompleted(false);
                    progress.setCompletedAt(null);
                    progressRepository.save(progress);
                    log.info("User {} marked topic {} as incomplete", currentUser.getUsername(), topicId);
                });
    }

    @Override
    @Transactional
    public void recordTopicVisit(Long topicId) {
        User currentUser = userService.getCurrentUser();
        GrammarTopic topic = grammarTopicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        UserGrammarProgress progress = progressRepository.findByUserIdAndTopicId(currentUser.getId(), topicId)
                .orElse(UserGrammarProgress.builder()
                        .user(currentUser)
                        .topic(topic)
                        .completed(false)
                        .build());

        progress.setVisitedAt(LocalDateTime.now());
        progressRepository.save(progress);
    }
}