package org.example.booklingo.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.booklingo.dto.request.BookUploadRequest;
import org.example.booklingo.dto.response.BookResponse;
import org.example.booklingo.services.BookService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BookResponse> uploadBook(
            @RequestParam("file") MultipartFile file,
            @Valid @ModelAttribute BookUploadRequest request
    ) {
        BookResponse response = bookService.uploadBook(file, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<BookResponse>> getUserBooks() {
        List<BookResponse> books = bookService.getUserBooks();
        return ResponseEntity.ok(books);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookResponse> getBookById(@PathVariable Long id) {
        BookResponse book = bookService.getBookById(id);
        return ResponseEntity.ok(book);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/position")
    public ResponseEntity<Void> updateReadingPosition(
            @PathVariable Long id,
            @RequestParam("page") Integer page
    ) {
        bookService.updateReadingPosition(id, page);
        return ResponseEntity.ok().build();
    }
}
