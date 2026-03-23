package org.example.booklingo.repositories;

import org.example.booklingo.entities.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PageRepository extends JpaRepository<Page, Long> {

    Optional<Page> findByBookIdAndPageNumber(Long bookId, Integer pageNumber);

    List<Page> findByBookIdOrderByPageNumberAsc(Long bookId);

    long countByBookId(Long bookId);
}