package org.example.booklingo.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.booklingo.dto.request.DailyChallengeAnswerRequest;
import org.example.booklingo.dto.response.DailyChallengeResponse;
import org.example.booklingo.services.DailyChallengeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/daily-challenge")
@RequiredArgsConstructor
public class DailyChallengeController {

    private final DailyChallengeService dailyChallengeService;

    /**
     * Get today's challenge with words to learn.
     * Creates a new challenge if one doesn't exist for today.
     */
    @GetMapping
    public ResponseEntity<DailyChallengeResponse> getTodayChallenge() {
        DailyChallengeResponse challenge = dailyChallengeService.getTodayChallenge();
        return ResponseEntity.ok(challenge);
    }

    /**
     * Submit answers for today's challenge.
     */
    @PostMapping("/submit")
    public ResponseEntity<DailyChallengeResponse> submitAnswers(
            @Valid @RequestBody DailyChallengeAnswerRequest request) {
        DailyChallengeResponse result = dailyChallengeService.submitAnswers(request);
        return ResponseEntity.ok(result);
    }

    /**
     * Get user's gamification stats (XP, streak, level).
     */
    @GetMapping("/stats")
    public ResponseEntity<DailyChallengeResponse> getUserStats() {
        DailyChallengeResponse stats = dailyChallengeService.getUserStats();
        return ResponseEntity.ok(stats);
    }
}
