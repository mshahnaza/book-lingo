package org.example.booklingo.controllers;

import lombok.RequiredArgsConstructor;
import org.example.booklingo.dto.response.LearningStatisticsResponse;
import org.example.booklingo.services.LearningStatisticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class LearningStatisticsController {

    private final LearningStatisticsService statisticsService;

    @GetMapping
    public ResponseEntity<LearningStatisticsResponse> getStatistics() {
        LearningStatisticsResponse statistics = statisticsService.getStatistics();
        return ResponseEntity.ok(statistics);
    }
}