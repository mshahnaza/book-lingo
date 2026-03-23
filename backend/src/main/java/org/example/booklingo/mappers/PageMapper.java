package org.example.booklingo.mappers;

import org.example.booklingo.dto.response.PageResponse;
import org.example.booklingo.entities.Page;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PageMapper {

    @Mapping(target = "bookId", source = "book.id")
    PageResponse toResponse(Page page);
}