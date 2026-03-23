package org.example.booklingo.services;

import org.example.booklingo.dto.request.WordSaveRequest;
import org.example.booklingo.dto.response.WordResponse;

import java.util.List;

public interface WordService {

    WordResponse saveWord(WordSaveRequest request);

    WordResponse getWordById(Long wordId);

    List<WordResponse> getUserWords();

    List<WordResponse> getWordsByBook(Long bookId);

    void deleteWord(Long wordId);
}