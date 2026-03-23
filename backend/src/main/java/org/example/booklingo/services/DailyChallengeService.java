package org.example.booklingo.services;

import org.example.booklingo.dto.request.DailyChallengeAnswerRequest;
import org.example.booklingo.dto.response.DailyChallengeResponse;

public interface DailyChallengeService {

    /**
     * Get today's daily challenge for the current user.
     * Creates a new challenge if one doesn't exist for today.
     */
    DailyChallengeResponse getTodayChallenge();

    /**
     * Submit answers for today's challenge and calculate XP.
     */
    DailyChallengeResponse submitAnswers(DailyChallengeAnswerRequest request);

    /**
     * Get user's gamification stats (XP, streak, level).
     */
    DailyChallengeResponse getUserStats();
}