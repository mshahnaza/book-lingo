package org.example.booklingo.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.booklingo.dto.request.WordSaveRequest;
import org.example.booklingo.dto.response.WordResponse;
import org.example.booklingo.services.TranslateWordService;
import org.example.booklingo.services.WordService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/words")
@RequiredArgsConstructor
public class WordController {

    private final WordService wordService;
    private final TranslateWordService translateWordService;

    @PostMapping
    public ResponseEntity<WordResponse> saveWord(@Valid @RequestBody WordSaveRequest request) {
        WordResponse response = wordService.saveWord(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<WordResponse>> getUserWords() {
        List<WordResponse> words = wordService.getUserWords();
        return ResponseEntity.ok(words);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WordResponse> getWordById(@PathVariable Long id) {
        WordResponse word = wordService.getWordById(id);
        return ResponseEntity.ok(word);
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<WordResponse>> getWordsByBook(@PathVariable Long bookId) {
        List<WordResponse> words = wordService.getWordsByBook(bookId);
        return ResponseEntity.ok(words);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWord(@PathVariable Long id) {
        wordService.deleteWord(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/translate")
    public ResponseEntity<String> translateWord(
            @RequestParam String word,
            @RequestParam String sourceLanguage,
            @RequestParam String targetLanguage
    ) {
        String translation = translateWordService.translateWord(word, sourceLanguage, targetLanguage);
        return ResponseEntity.ok(translation);
    }

    @PostMapping("/detect-language")
    public ResponseEntity<String> detectLanguage(@RequestParam String text) {
        String language = translateWordService.detectLanguage(text);
        return ResponseEntity.ok(language);
    }
}