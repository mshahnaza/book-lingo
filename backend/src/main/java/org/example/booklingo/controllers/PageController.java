package org.example.booklingo.controllers;

import lombok.RequiredArgsConstructor;
import org.example.booklingo.dto.response.PageResponse;
import org.example.booklingo.services.PageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books/{bookId}/pages")
@RequiredArgsConstructor
public class PageController {

    private final PageService pageService;

    @GetMapping("/{pageNumber}")
    public ResponseEntity<PageResponse> getPage(
            @PathVariable Long bookId,
            @PathVariable Integer pageNumber
    ) {
        PageResponse page = pageService.getPageByNumber(bookId, pageNumber);
        return ResponseEntity.ok(page);
    }

    @GetMapping
    public ResponseEntity<List<PageResponse>> getAllPages(@PathVariable Long bookId) {
        List<PageResponse> pages = pageService.getBookPages(bookId);
        return ResponseEntity.ok(pages);
    }
}
