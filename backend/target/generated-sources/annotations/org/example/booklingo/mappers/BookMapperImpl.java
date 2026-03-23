package org.example.booklingo.mappers;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.example.booklingo.dto.response.BookResponse;
import org.example.booklingo.entities.Book;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-28T19:45:00+0600",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Oracle Corporation)"
)
@Component
public class BookMapperImpl implements BookMapper {

    @Override
    public BookResponse toResponse(Book book) {
        if ( book == null ) {
            return null;
        }

        BookResponse.BookResponseBuilder bookResponse = BookResponse.builder();

        if ( book.getFileType() != null ) {
            bookResponse.fileType( book.getFileType().name() );
        }
        bookResponse.id( book.getId() );
        bookResponse.title( book.getTitle() );
        bookResponse.author( book.getAuthor() );
        bookResponse.originalFilename( book.getOriginalFilename() );
        bookResponse.language( book.getLanguage() );
        bookResponse.totalPages( book.getTotalPages() );
        bookResponse.uploadedAt( book.getUploadedAt() );
        bookResponse.currentPage( book.getCurrentPage() );
        bookResponse.lastReadAt( book.getLastReadAt() );

        return bookResponse.build();
    }

    @Override
    public List<BookResponse> toResponseList(List<Book> books) {
        if ( books == null ) {
            return null;
        }

        List<BookResponse> list = new ArrayList<BookResponse>( books.size() );
        for ( Book book : books ) {
            list.add( toResponse( book ) );
        }

        return list;
    }
}
