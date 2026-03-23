package org.example.booklingo.mappers;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.example.booklingo.dto.request.FlashcardCreateRequest;
import org.example.booklingo.dto.response.FlashcardResponse;
import org.example.booklingo.entities.Flashcard;
import org.example.booklingo.entities.Word;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-28T19:44:59+0600",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Oracle Corporation)"
)
@Component
public class FlashcardMapperImpl implements FlashcardMapper {

    @Override
    public FlashcardResponse toResponse(Flashcard flashcard) {
        if ( flashcard == null ) {
            return null;
        }

        FlashcardResponse.FlashcardResponseBuilder flashcardResponse = FlashcardResponse.builder();

        flashcardResponse.wordId( flashcardWordId( flashcard ) );
        flashcardResponse.id( flashcard.getId() );
        flashcardResponse.front( flashcard.getFront() );
        flashcardResponse.back( flashcard.getBack() );
        flashcardResponse.nextReviewDate( flashcard.getNextReviewDate() );
        flashcardResponse.easeFactor( flashcard.getEaseFactor() );
        flashcardResponse.intervalDays( flashcard.getIntervalDays() );
        flashcardResponse.repetitions( flashcard.getRepetitions() );
        flashcardResponse.createdAt( flashcard.getCreatedAt() );

        return flashcardResponse.build();
    }

    @Override
    public List<FlashcardResponse> toResponseList(List<Flashcard> flashcards) {
        if ( flashcards == null ) {
            return null;
        }

        List<FlashcardResponse> list = new ArrayList<FlashcardResponse>( flashcards.size() );
        for ( Flashcard flashcard : flashcards ) {
            list.add( toResponse( flashcard ) );
        }

        return list;
    }

    @Override
    public Flashcard toEntity(FlashcardCreateRequest request) {
        if ( request == null ) {
            return null;
        }

        Flashcard.FlashcardBuilder flashcard = Flashcard.builder();

        flashcard.front( request.getFront() );
        flashcard.back( request.getBack() );

        return flashcard.build();
    }

    private Long flashcardWordId(Flashcard flashcard) {
        if ( flashcard == null ) {
            return null;
        }
        Word word = flashcard.getWord();
        if ( word == null ) {
            return null;
        }
        Long id = word.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
