package org.example.booklingo.services.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.booklingo.entities.Book;
import org.example.booklingo.entities.Page;
import org.example.booklingo.enums.FileType;
import org.example.booklingo.repositories.PageRepository;
import org.example.booklingo.services.FileProcessingService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileProcessingServiceImpl implements FileProcessingService {

    private final PageRepository pageRepository;

    @Value("${file.upload.directory:./uploads}")
    private String uploadDirectory;

    @Value("${file.txt.lines.per.page:50}")
    private int linesPerPage;

    @Override
    public String saveFile(MultipartFile file, Long userId) throws IOException {
        // Create user-specific directory
        Path userDirectory = Paths.get(uploadDirectory, userId.toString());
        Files.createDirectories(userDirectory);

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null ?
                originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
        String uniqueFilename = UUID.randomUUID().toString() + extension;

        // Save file
        Path targetPath = userDirectory.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        return targetPath.toString();
    }

    @Override
    public void deleteFile(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return;
        }

        try {
            Path path = Paths.get(filePath);
            Files.deleteIfExists(path);
            log.info("Deleted file: {}", filePath);
        } catch (IOException e) {
            log.error("Failed to delete file: {}", filePath, e);
        }
    }

    @Override
    public void processAndCreatePages(Book book, MultipartFile file) throws IOException {
        if (book.getFileType() == FileType.TXT) {
            processTxtFile(book, file);
        } else if (book.getFileType() == FileType.PDF) {
            processPdfFile(book, file);
        } else {
            throw new IllegalArgumentException("Unsupported file type: " + book.getFileType());
        }
    }

    private void processTxtFile(Book book, MultipartFile file) throws IOException {
        List<String> allLines = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                allLines.add(line);
            }
        }

        // Split into pages
        int totalPages = (int) Math.ceil((double) allLines.size() / linesPerPage);
        book.setTotalPages(totalPages);

        List<Page> pages = new ArrayList<>();
        for (int i = 0; i < totalPages; i++) {
            int startLine = i * linesPerPage;
            int endLine = Math.min(startLine + linesPerPage, allLines.size());

            StringBuilder pageContent = new StringBuilder();
            for (int j = startLine; j < endLine; j++) {
                pageContent.append(allLines.get(j)).append("\n");
            }

            Page page = Page.builder()
                    .book(book)
                    .pageNumber(i + 1)
                    .textContent(pageContent.toString())
                    .build();

            pages.add(page);
        }

        pageRepository.saveAll(pages);
        log.info("Created {} pages for TXT book: {}", totalPages, book.getTitle());
    }

    private void processPdfFile(Book book, MultipartFile file) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            int totalPages = document.getNumberOfPages();
            book.setTotalPages(totalPages);

            PDFTextStripper stripper = new PDFTextStripper();
            List<Page> pages = new ArrayList<>();

            for (int i = 1; i <= totalPages; i++) {
                stripper.setStartPage(i);
                stripper.setEndPage(i);

                String textContent = stripper.getText(document);

                // Clean up the extracted text
                if (textContent == null || textContent.trim().isEmpty()) {
                    textContent = "(No text content on this page)";
                }

                Page page = Page.builder()
                        .book(book)
                        .pageNumber(i)
                        .textContent(textContent)
                        .build();

                pages.add(page);
            }

            pageRepository.saveAll(pages);
            log.info("Created {} pages for PDF book: {}", totalPages, book.getTitle());
        } catch (Exception e) {
            log.error("Failed to process PDF file: {}", book.getTitle(), e);
            throw new IOException("Failed to process PDF file: " + e.getMessage(), e);
        }
    }
}