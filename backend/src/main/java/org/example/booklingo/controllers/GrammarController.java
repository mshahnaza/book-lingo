package org.example.booklingo.controllers;

import lombok.RequiredArgsConstructor;
import org.example.booklingo.dto.response.GrammarLevelResponse;
import org.example.booklingo.services.GrammarService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grammar")
@RequiredArgsConstructor
public class GrammarController {

    private final GrammarService grammarService;

    @GetMapping
    public ResponseEntity<List<GrammarLevelResponse>> getAllLevels() {
        List<GrammarLevelResponse> levels = grammarService.getAllLevelsWithProgress();
        return ResponseEntity.ok(levels);
    }

    @PostMapping("/topics/{topicId}/complete")
    public ResponseEntity<Void> markTopicCompleted(@PathVariable Long topicId) {
        grammarService.markTopicCompleted(topicId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/topics/{topicId}/complete")
    public ResponseEntity<Void> markTopicIncomplete(@PathVariable Long topicId) {
        grammarService.markTopicIncomplete(topicId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/topics/{topicId}/visit")
    public ResponseEntity<Void> recordVisit(@PathVariable Long topicId) {
        grammarService.recordTopicVisit(topicId);
        return ResponseEntity.ok().build();
    }
}