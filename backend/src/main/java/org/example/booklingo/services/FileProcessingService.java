package org.example.booklingo.services;

import org.example.booklingo.entities.Book;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface FileProcessingService {

    String saveFile(MultipartFile file, Long userId) throws IOException;

    void deleteFile(String filePath);

    void processAndCreatePages(Book book, MultipartFile file) throws IOException;
}