package org.example.booklingo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrammarLevelResponse {
    private String level;
    private String name;
    private String color;
    private int totalTopics;
    private int completedTopics;
    private List<GrammarTopicResponse> topics;
}