package org.example.booklingo.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyChallengeAnswerRequest {

    @NotNull
    private List<WordAnswer> answers;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WordAnswer {
        private Long wordId;
        private String selectedAnswer;
    }
}