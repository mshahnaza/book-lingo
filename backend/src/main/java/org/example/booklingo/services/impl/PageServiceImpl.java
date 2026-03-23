package org.example.booklingo.services.impl;

import lombok.RequiredArgsConstructor;
import org.example.booklingo.dto.response.PageResponse;
import org.example.booklingo.entities.Page;
import org.example.booklingo.entities.User;
import org.example.booklingo.mappers.PageMapper;
import org.example.booklingo.repositories.BookRepository;
import org.example.booklingo.repositories.PageRepository;
import org.example.booklingo.services.PageService;
import org.example.booklingo.services.UserService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PageServiceImpl implements PageService {

    private final PageRepository pageRepository;
    private final BookRepository bookRepository;
    private final UserService userService;
    private final PageMapper pageMapper;

    @Override
    public PageResponse getPageByNumber(Long bookId, Integer pageNumber) {
        User currentUser = userService.getCurrentUser();

        // Verify user owns the book
        bookRepository.findByIdAndUserId(bookId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Book not found or access denied"));

        Page page = pageRepository.findByBookIdAndPageNumber(bookId, pageNumber)
                .orElseThrow(() -> new RuntimeException("Page not found"));

        return pageMapper.toResponse(page);
    }

    @Override
    public List<PageResponse> getBookPages(Long bookId) {
        User currentUser = userService.getCurrentUser();

        // Verify user owns the book
        bookRepository.findByIdAndUserId(bookId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Book not found or access denied"));

        List<Page> pages = pageRepository.findByBookIdOrderByPageNumberAsc(bookId);
        return pages.stream()
                .map(pageMapper::toResponse)
                .toList();
    }
}