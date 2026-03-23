package org.example.booklingo.mappers;

import javax.annotation.processing.Generated;
import org.example.booklingo.dto.response.PageResponse;
import org.example.booklingo.entities.Book;
import org.example.booklingo.entities.Page;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-28T19:45:00+0600",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Oracle Corporation)"
)
@Component
public class PageMapperImpl implements PageMapper {

    @Override
    public PageResponse toResponse(Page page) {
        if ( page == null ) {
            return null;
        }

        PageResponse.PageResponseBuilder pageResponse = PageResponse.builder();

        pageResponse.bookId( pageBookId( page ) );
        pageResponse.id( page.getId() );
        pageResponse.pageNumber( page.getPageNumber() );
        pageResponse.textContent( page.getTextContent() );

        return pageResponse.build();
    }

    private Long pageBookId(Page page) {
        if ( page == null ) {
            return null;
        }
        Book book = page.getBook();
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
