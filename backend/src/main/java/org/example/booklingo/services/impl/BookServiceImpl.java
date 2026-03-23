package org.example.booklingo.services.impl;

import lombok.RequiredArgsConstructor;
import org.example.booklingo.dto.request.BookUploadRequest;
import org.example.booklingo.dto.response.BookResponse;
import org.example.booklingo.entities.Book;
import org.example.booklingo.entities.User;
import org.example.booklingo.enums.FileType;
import org.example.booklingo.mappers.BookMapper;
import org.example.booklingo.repositories.BookRepository;
import org.example.booklingo.services.BookService;
import org.example.booklingo.services.FileProcessingService;
import org.example.booklingo.services.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;
    private final UserService userService;
    private final BookMapper bookMapper;
    private final FileProcessingService fileProcessingService;

    @Override
    @Transactional
    public BookResponse uploadBook(MultipartFile file, BookUploadRequest request) {
        User currentUser = userService.getCurrentUser();

        String originalFilename = file.getOriginalFilename();
        FileType fileType = determineFileType(originalFilename);

        Book book = Book.builder()
                .user(currentUser)
                .title(request.getTitle())
                .author(request.getAuthor())
                .language(request.getLanguage())
                .originalFilename(originalFilename)
                .fileType(fileType)
                .build();

        try {
            // Save file to disk
            String filePath = fileProcessingService.saveFile(file, currentUser.getId());
            book.setFilePath(filePath);

            // Save book first to get ID
            book = bookRepository.save(book);

            // Parse file content and create Page entities
            fileProcessingService.processAndCreatePages(book, file);

            // Save book again with updated totalPages
            book = bookRepository.save(book);

        } catch (Exception e) {
            throw new RuntimeException("Failed to process uploaded file: " + e.getMessage(), e);
        }

        return bookMapper.toResponse(book);
    }

    @Override
    public BookResponse getBookById(Long bookId) {
        User currentUser = userService.getCurrentUser();
        Book book = bookRepository.findByIdAndUserId(bookId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Book not found or access denied"));
        return bookMapper.toResponse(book);
    }

    @Override
    public List<BookResponse> getUserBooks() {
        User currentUser = userService.getCurrentUser();
        List<Book> books = bookRepository.findByUserIdOrderByUploadedAtDesc(currentUser.getId());
        return bookMapper.toResponseList(books);
    }

    @Override
    @Transactional
    public void deleteBook(Long bookId) {
        User currentUser = userService.getCurrentUser();
        Book book = bookRepository.findByIdAndUserId(bookId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Book not found or access denied"));

        // Delete associated file from disk
        fileProcessingService.deleteFile(book.getFilePath());

        bookRepository.delete(book);
    }

    @Override
    @Transactional
    public void updateReadingPosition(Long bookId, Integer page) {
        User currentUser = userService.getCurrentUser();
        Book book = bookRepository.findByIdAndUserId(bookId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Book not found or access denied"));

        book.setCurrentPage(page);
        book.setLastReadAt(LocalDateTime.now());
        bookRepository.save(book);
    }

    private FileType determineFileType(String filename) {
        if (filename == null) {
            throw new RuntimeException("Filename cannot be null");
        }

        String lowerFilename = filename.toLowerCase();
        if (lowerFilename.endsWith(".pdf")) {
            return FileType.PDF;
        } else if (lowerFilename.endsWith(".txt")) {
            return FileType.TXT;
        } else {
            throw new RuntimeException("Unsupported file type. Only PDF and TXT are supported.");
        }
    }
}