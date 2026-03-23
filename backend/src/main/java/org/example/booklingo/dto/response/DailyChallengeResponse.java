package org.example.booklingo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyChallengeResponse {

    private Long id;
    private LocalDate challengeDate;
    private Boolean isCompleted;
    private Integer wordsShown;
    private Integer wordsCorrect;
    private List<DailyChallengeWordResponse> words;

    // Simple progress stats
    private Integer totalChallengesCompleted;
    private Integer totalWordsLearned;
}
