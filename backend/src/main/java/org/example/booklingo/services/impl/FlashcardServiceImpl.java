package org.example.booklingo.services.impl;

import lombok.RequiredArgsConstructor;
import org.example.booklingo.dto.request.FlashcardCreateRequest;
import org.example.booklingo.dto.request.FlashcardReviewRequest;
import org.example.booklingo.dto.response.FlashcardResponse;
import org.example.booklingo.entities.Flashcard;
import org.example.booklingo.entities.LearningSession;
import org.example.booklingo.entities.User;
import org.example.booklingo.entities.Word;
import org.example.booklingo.mappers.FlashcardMapper;
import org.example.booklingo.repositories.FlashcardRepository;
import org.example.booklingo.repositories.LearningSessionRepository;
import org.example.booklingo.repositories.WordRepository;
import org.example.booklingo.services.FlashcardService;
import org.example.booklingo.services.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FlashcardServiceImpl implements FlashcardService {

    private final FlashcardRepository flashcardRepository;
    private final WordRepository wordRepository;
    private final LearningSessionRepository learningSessionRepository;
    private final UserService userService;
    private final FlashcardMapper flashcardMapper;

    @Override
    @Transactional
    public FlashcardResponse createFlashcard(FlashcardCreateRequest request) {
        User currentUser = userService.getCurrentUser();

        Flashcard flashcard = flashcardMapper.toEntity(request);
        flashcard.setUser(currentUser);

        if (request.getWordId() != null) {
            Word word = wordRepository.findByIdAndUserId(request.getWordId(), currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("Word not found or access denied"));
            flashcard.setWord(word);
        }

        // Initialize SM-2 algorithm values (set in entity with @Builder.Default)
        flashcard.setNextReviewDate(LocalDate.now());

        flashcard = flashcardRepository.save(flashcard);
        return flashcardMapper.toResponse(flashcard);
    }

    @Override
    public FlashcardResponse getFlashcardById(Long flashcardId) {
        User currentUser = userService.getCurrentUser();
        Flashcard flashcard = flashcardRepository.findByIdAndUserId(flashcardId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Flashcard not found or access denied"));
        return flashcardMapper.toResponse(flashcard);
    }

    @Override
    public List<FlashcardResponse> getUserFlashcards() {
        User currentUser = userService.getCurrentUser();
        List<Flashcard> flashcards = flashcardRepository.findByUserId(currentUser.getId());
        return flashcardMapper.toResponseList(flashcards);
    }

    @Override
    public List<FlashcardResponse> getDueFlashcards() {
        User currentUser = userService.getCurrentUser();
        List<Flashcard> flashcards = flashcardRepository
                .findByUserIdAndNextReviewDateLessThanEqual(currentUser.getId(), LocalDate.now());
        return flashcardMapper.toResponseList(flashcards);
    }

    @Override
    @Transactional
    public FlashcardResponse reviewFlashcard(FlashcardReviewRequest request) {
        User currentUser = userService.getCurrentUser();

        Flashcard flashcard = flashcardRepository.findByIdAndUserId(request.getFlashcardId(), currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Flashcard not found or access denied"));

        // Save learning session
        LearningSession session = LearningSession.builder()
                .user(currentUser)
                .flashcard(flashcard)
                .quality(request.getQuality())
                .responseTimeSeconds(request.getResponseTimeSeconds())
                .build();
        learningSessionRepository.save(session);

        // Apply SM-2 algorithm
        updateFlashcardWithSM2(flashcard, request.getQuality());
        flashcard = flashcardRepository.save(flashcard);

        return flashcardMapper.toResponse(flashcard);
    }

    @Override
    @Transactional
    public void deleteFlashcard(Long flashcardId) {
        User currentUser = userService.getCurrentUser();
        Flashcard flashcard = flashcardRepository.findByIdAndUserId(flashcardId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Flashcard not found or access denied"));
        flashcardRepository.delete(flashcard);
    }

    /**
     * SM-2 Algorithm implementation
     * Quality scale: 0-5
     * - 0: Complete blackout
     * - 1: Incorrect response; correct answer remembered
     * - 2: Incorrect response; correct answer seemed easy to recall
     * - 3: Correct response recalled with serious difficulty
     * - 4: Correct response after hesitation
     * - 5: Perfect response
     */
    private void updateFlashcardWithSM2(Flashcard flashcard, Integer quality) {
        int repetitions = flashcard.getRepetitions();
        double easeFactor = flashcard.getEaseFactor();
        int intervalDays = flashcard.getIntervalDays();

        if (quality >= 3) {
            // Correct response
            if (repetitions == 0) {
                intervalDays = 1;
            } else if (repetitions == 1) {
                intervalDays = 6;
            } else {
                intervalDays = (int) Math.round(intervalDays * easeFactor);
            }
            repetitions++;
        } else {
            // Incorrect response - reset
            repetitions = 0;
            intervalDays = 1;
        }

        // Update ease factor
        easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

        // Ease factor should not be less than 1.3
        if (easeFactor < 1.3) {
            easeFactor = 1.3;
        }

        flashcard.setRepetitions(repetitions);
        flashcard.setIntervalDays(intervalDays);
        flashcard.setEaseFactor(easeFactor);
        flashcard.setNextReviewDate(LocalDate.now().plusDays(intervalDays));
    }
}