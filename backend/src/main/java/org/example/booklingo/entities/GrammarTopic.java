package org.example.booklingo.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "grammar_topics", indexes = {
    @Index(name = "idx_grammar_level", columnList = "level")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarTopic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 10)
    private String level; // A1-A2, B1-B2, C1

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(length = 50)
    private String source; // "British Council", etc.
}