package org.example.booklingo.mappers;

import org.example.booklingo.dto.request.FlashcardCreateRequest;
import org.example.booklingo.dto.response.FlashcardResponse;
import org.example.booklingo.entities.Flashcard;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface FlashcardMapper {

    @Mapping(target = "wordId", source = "word.id")
    FlashcardResponse toResponse(Flashcard flashcard);

    List<FlashcardResponse> toResponseList(List<Flashcard> flashcards);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "word", ignore = true)
    @Mapping(target = "nextReviewDate", ignore = true)
    @Mapping(target = "easeFactor", ignore = true)
    @Mapping(target = "intervalDays", ignore = true)
    @Mapping(target = "repetitions", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "learningSessions", ignore = true)
    Flashcard toEntity(FlashcardCreateRequest request);
}