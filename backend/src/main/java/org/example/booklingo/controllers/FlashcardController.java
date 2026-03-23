package org.example.booklingo.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.booklingo.dto.request.FlashcardCreateRequest;
import org.example.booklingo.dto.request.FlashcardReviewRequest;
import org.example.booklingo.dto.response.FlashcardResponse;
import org.example.booklingo.services.FlashcardService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flashcards")
@RequiredArgsConstructor
public class FlashcardController {

    private final FlashcardService flashcardService;

    @PostMapping
    public ResponseEntity<FlashcardResponse> createFlashcard(
            @Valid @RequestBody FlashcardCreateRequest request
    ) {
        FlashcardResponse response = flashcardService.createFlashcard(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<FlashcardResponse>> getUserFlashcards() {
        List<FlashcardResponse> flashcards = flashcardService.getUserFlashcards();
        return ResponseEntity.ok(flashcards);
    }

    @GetMapping("/due")
    public ResponseEntity<List<FlashcardResponse>> getDueFlashcards() {
        List<FlashcardResponse> flashcards = flashcardService.getDueFlashcards();
        return ResponseEntity.ok(flashcards);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlashcardResponse> getFlashcardById(@PathVariable Long id) {
        FlashcardResponse flashcard = flashcardService.getFlashcardById(id);
        return ResponseEntity.ok(flashcard);
    }

    @PostMapping("/review")
    public ResponseEntity<FlashcardResponse> reviewFlashcard(
            @Valid @RequestBody FlashcardReviewRequest request
    ) {
        FlashcardResponse response = flashcardService.reviewFlashcard(request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlashcard(@PathVariable Long id) {
        flashcardService.deleteFlashcard(id);
        return ResponseEntity.noContent().build();
    }
}
