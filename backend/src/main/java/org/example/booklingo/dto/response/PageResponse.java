package org.example.booklingo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PageResponse {

    private Long id;
    private Long bookId;
    private Integer pageNumber;
    private String textContent;
}