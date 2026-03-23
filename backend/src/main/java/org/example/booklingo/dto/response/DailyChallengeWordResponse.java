package org.example.booklingo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyChallengeWordResponse {

    private Long wordId;
    private String originalWord;
    private String correctTranslation;
    private String context;
    private List<String> options; // Multiple choice options (including correct answer)

    // New fields for varied exercise types
    private String exerciseType; // "translation", "fill_blank", "reverse", "context_match"
    private String question; // The question to display
    private String correctAnswer; // The correct answer for this exercise
    private String contextWithBlank; // Context with ___ for fill_blank type
}