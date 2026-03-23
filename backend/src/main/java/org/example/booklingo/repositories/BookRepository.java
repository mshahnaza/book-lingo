package org.example.booklingo.repositories;

import org.example.booklingo.entities.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    List<Book> findByUserId(Long userId);

    List<Book> findByUserIdOrderByUploadedAtDesc(Long userId);

    Optional<Book> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);
}