package org.example.booklingo.services.impl;

import lombok.RequiredArgsConstructor;
import org.example.booklingo.dto.response.LearningStatisticsResponse;
import org.example.booklingo.entities.Flashcard;
import org.example.booklingo.entities.User;
import org.example.booklingo.repositories.BookRepository;
import org.example.booklingo.repositories.FlashcardRepository;
import org.example.booklingo.repositories.LearningSessionRepository;
import org.example.booklingo.repositories.WordRepository;
import org.example.booklingo.services.LearningStatisticsService;
import org.example.booklingo.services.UserService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LearningStatisticsServiceImpl implements LearningStatisticsService {

    private final FlashcardRepository flashcardRepository;
    private final WordRepository wordRepository;
    private final BookRepository bookRepository;
    private final LearningSessionRepository learningSessionRepository;
    private final UserService userService;

    @Override
    public LearningStatisticsResponse getStatistics() {
        User currentUser = userService.getCurrentUser();
        Long userId = currentUser.getId();

        // Total flashcards
        long totalFlashcards = flashcardRepository.countByUserId(userId);

        // Flashcards due today
        List<Flashcard> dueFlashcards = flashcardRepository
                .findByUserIdAndNextReviewDateLessThanEqual(userId, LocalDate.now());
        int flashcardsDueToday = dueFlashcards.size();

        // Total reviews today
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        long totalReviewsToday = learningSessionRepository
                .countByUserIdAndReviewedAtAfter(userId, startOfDay);

        // Total words
        long totalWords = wordRepository.findByUserId(userId).size();

        // Total books
        long totalBooks = bookRepository.findByUserId(userId).size();

        // Average ease factor
        List<Flashcard> allFlashcards = flashcardRepository.findByUserId(userId);
        double averageEaseFactor = allFlashcards.stream()
                .mapToDouble(Flashcard::getEaseFactor)
                .average()
                .orElse(0.0);

        // Streak calculation (simplified - days with at least one review)
        // TODO: Implement proper streak calculation with consecutive days
        int streak = 0;

        return LearningStatisticsResponse.builder()
                .totalFlashcards((int) totalFlashcards)
                .flashcardsDueToday(flashcardsDueToday)
                .totalReviewsToday((int) totalReviewsToday)
                .totalWords((int) totalWords)
                .totalBooks((int) totalBooks)
                .averageEaseFactor(Math.round(averageEaseFactor * 100.0) / 100.0)
                .streak(streak)
                .build();
    }
}