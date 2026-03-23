package org.example.booklingo.services;

public interface TranslationService {

    String translate(String text, String sourceLanguage, String targetLanguage);

    String detectLanguage(String text);
}
