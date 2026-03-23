package org.example.booklingo.mappers;

import org.example.booklingo.dto.request.WordSaveRequest;
import org.example.booklingo.dto.response.WordResponse;
import org.example.booklingo.entities.Word;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface WordMapper {

    @Mapping(target = "bookId", source = "book.id")
    WordResponse toResponse(Word word);

    List<WordResponse> toResponseList(List<Word> words);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "book", ignore = true)
    @Mapping(target = "savedAt", ignore = true)
    @Mapping(target = "flashcards", ignore = true)
    Word toEntity(WordSaveRequest request);
}