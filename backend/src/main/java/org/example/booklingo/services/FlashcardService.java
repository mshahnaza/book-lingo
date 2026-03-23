package org.example.booklingo.services;

import org.example.booklingo.dto.request.FlashcardCreateRequest;
import org.example.booklingo.dto.request.FlashcardReviewRequest;
import org.example.booklingo.dto.response.FlashcardResponse;

import java.util.List;

public interface FlashcardService {

    FlashcardResponse createFlashcard(FlashcardCreateRequest request);

    FlashcardResponse getFlashcardById(Long flashcardId);

    List<FlashcardResponse> getUserFlashcards();

    List<FlashcardResponse> getDueFlashcards();

    FlashcardResponse reviewFlashcard(FlashcardReviewRequest request);

    void deleteFlashcard(Long flashcardId);
}