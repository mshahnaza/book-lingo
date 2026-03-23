package org.example.booklingo.mappers;

import org.example.booklingo.dto.response.BookResponse;
import org.example.booklingo.entities.Book;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface BookMapper {

    @Mapping(target = "fileType", source = "fileType")
    BookResponse toResponse(Book book);

    List<BookResponse> toResponseList(List<Book> books);
}