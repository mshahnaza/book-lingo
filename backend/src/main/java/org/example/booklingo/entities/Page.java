package org.example.booklingo.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pages", indexes = {
    @Index(name = "idx_page_book_id", columnList = "book_id"),
    @Index(name = "idx_page_book_page_number", columnList = "book_id, page_number", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Page {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(name = "page_number", nullable = false)
    private Integer pageNumber;

    @Lob
    @Column(name = "text_content", columnDefinition = "TEXT")
    private String textContent;
}