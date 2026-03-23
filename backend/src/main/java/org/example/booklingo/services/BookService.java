package org.example.booklingo.services;

import org.example.booklingo.dto.request.BookUploadRequest;
import org.example.booklingo.dto.response.BookResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface BookService {

    BookResponse uploadBook(MultipartFile file, BookUploadRequest request);

    BookResponse getBookById(Long bookId);

    List<BookResponse> getUserBooks();

    void deleteBook(Long bookId);

    void updateReadingPosition(Long bookId, Integer page);
}