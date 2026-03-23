package org.example.booklingo.mappers;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.example.booklingo.dto.request.WordSaveRequest;
import org.example.booklingo.dto.response.WordResponse;
import org.example.booklingo.entities.Book;
import org.example.booklingo.entities.Word;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-28T19:45:00+0600",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Oracle Corporation)"
)
@Component
public class WordMapperImpl implements WordMapper {

    @Override
    public WordResponse toResponse(Word word) {
        if ( word == null ) {
            return null;
        }

        WordResponse.WordResponseBuilder wordResponse = WordResponse.builder();

        wordResponse.bookId( wordBookId( word ) );
        wordResponse.id( word.getId() );
        wordResponse.originalWord( word.getOriginalWord() );
        wordResponse.translatedWord( word.getTranslatedWord() );
        wordResponse.sourceLanguage( word.getSourceLanguage() );
        wordResponse.targetLanguage( word.getTargetLanguage() );
        wordResponse.context( word.getContext() );
        wordResponse.savedAt( word.getSavedAt() );

        return wordResponse.build();
    }

    @Override
    public List<WordResponse> toResponseList(List<Word> words) {
        if ( words == null ) {
            return null;
        }

        List<WordResponse> list = new ArrayList<WordResponse>( words.size() );
        for ( Word word : words ) {
            list.add( toResponse( word ) );
        }

        return list;
    }

    @Override
    public Word toEntity(WordSaveRequest request) {
        if ( request == null ) {
            return null;
        }

        Word.WordBuilder word = Word.builder();

        word.originalWord( request.getOriginalWord() );
        word.translatedWord( request.getTranslatedWord() );
        word.sourceLanguage( request.getSourceLanguage() );
        word.targetLanguage( request.getTargetLanguage() );
        word.context( request.getContext() );

        return word.build();
    }

    private Long wordBookId(Word word) {
        if ( word == null ) {
            return null;
        }
        Book book = word.getBook();
        if ( book == null ) {
            return null;
        }
        Long id = book.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
