package org.example.booklingo.services.impl;

import lombok.RequiredArgsConstructor;
import org.example.booklingo.services.TranslateWordService;
import org.example.booklingo.services.TranslationService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TranslateWordServiceImpl implements TranslateWordService {

    private final TranslationService translationService;

    @Override
    public String translateWord(String word, String sourceLanguage, String targetLanguage) {
        return translationService.translate(word, sourceLanguage, targetLanguage);
    }

    @Override
    public String detectLanguage(String text) {
        return translationService.detectLanguage(text);
    }
}