package org.example.booklingo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookResponse {

    private Long id;
    private String title;
    private String author;
    private String originalFilename;
    private String fileType;
    private String language;
    private Integer totalPages;
    private LocalDateTime uploadedAt;
    private Integer currentPage;
    private LocalDateTime lastReadAt;
}