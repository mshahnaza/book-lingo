package org.example.booklingo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WordResponse {

    private Long id;
    private String originalWord;
    private String translatedWord;
    private String sourceLanguage;
    private String targetLanguage;
    private String context;
    private Long bookId;
    private LocalDateTime savedAt;
}
