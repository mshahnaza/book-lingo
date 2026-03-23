package org.example.booklingo.services;

import org.example.booklingo.dto.response.PageResponse;

import java.util.List;

public interface PageService {

    PageResponse getPageByNumber(Long bookId, Integer pageNumber);

    List<PageResponse> getBookPages(Long bookId);
}