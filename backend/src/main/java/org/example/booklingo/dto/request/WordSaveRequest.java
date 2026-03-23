package org.example.booklingo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WordSaveRequest {

    @NotBlank(message = "Original word is required")
    @Size(max = 100, message = "Original word must not exceed 100 characters")
    private String originalWord;

    @NotBlank(message = "Translated word is required")
    @Size(max = 100, message = "Translated word must not exceed 100 characters")
    private String translatedWord;

    @Size(max = 10, message = "Source language must not exceed 10 characters")
    private String sourceLanguage;

    @Size(max = 10, message = "Target language must not exceed 10 characters")
    private String targetLanguage;

    private String context;

    private Long bookId;
}