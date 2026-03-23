package org.example.booklingo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrammarTopicResponse {
    private Long id;
    private String level;
    private String name;
    private String description;
    private String url;
    private String source;
    private Boolean completed;
    private String completedAt;
}