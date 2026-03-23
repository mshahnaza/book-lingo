package org.example.booklingo.services;

public interface TranslateWordService {

    String translateWord(String word, String sourceLanguage, String targetLanguage);

    String detectLanguage(String text);
}