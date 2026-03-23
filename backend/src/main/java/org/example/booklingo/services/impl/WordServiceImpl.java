package org.example.booklingo.services.impl;

import lombok.RequiredArgsConstructor;
import org.example.booklingo.dto.request.WordSaveRequest;
import org.example.booklingo.dto.response.WordResponse;
import org.example.booklingo.entities.Book;
import org.example.booklingo.entities.User;
import org.example.booklingo.entities.Word;
import org.example.booklingo.mappers.WordMapper;
import org.example.booklingo.repositories.BookRepository;
import org.example.booklingo.repositories.WordRepository;
import org.example.booklingo.services.UserService;
import org.example.booklingo.services.WordService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WordServiceImpl implements WordService {

    private final WordRepository wordRepository;
    private final BookRepository bookRepository;
    private final UserService userService;
    private final WordMapper wordMapper;

    @Override
    @Transactional
    public WordResponse saveWord(WordSaveRequest request) {
        User currentUser = userService.getCurrentUser();

        Word word = wordMapper.toEntity(request);
        word.setUser(currentUser);

        if (request.getBookId() != null) {
            Book book = bookRepository.findByIdAndUserId(request.getBookId(), currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("Book not found or access denied"));
            word.setBook(book);
        }

        word = wordRepository.save(word);
        return wordMapper.toResponse(word);
    }

    @Override
    public WordResponse getWordById(Long wordId) {
        User currentUser = userService.getCurrentUser();
        Word word = wordRepository.findByIdAndUserId(wordId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Word not found or access denied"));
        return wordMapper.toResponse(word);
    }

    @Override
    public List<WordResponse> getUserWords() {
        User currentUser = userService.getCurrentUser();
        List<Word> words = wordRepository.findByUserIdOrderBySavedAtDesc(currentUser.getId());
        return wordMapper.toResponseList(words);
    }

    @Override
    public List<WordResponse> getWordsByBook(Long bookId) {
        User currentUser = userService.getCurrentUser();

        // Verify user owns this book
        bookRepository.findByIdAndUserId(bookId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Book not found or access denied"));

        List<Word> words = wordRepository.findByBookId(bookId);
        return wordMapper.toResponseList(words);
    }

    @Override
    @Transactional
    public void deleteWord(Long wordId) {
        User currentUser = userService.getCurrentUser();
        Word word = wordRepository.findByIdAndUserId(wordId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Word not found or access denied"));
        wordRepository.delete(word);
    }
}