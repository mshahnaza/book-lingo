package org.example.booklingo.mappers;

import javax.annotation.processing.Generated;
import org.example.booklingo.dto.response.AuthResponse;
import org.example.booklingo.entities.User;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-28T19:45:00+0600",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Oracle Corporation)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public AuthResponse toAuthResponse(User user, String accessToken, String refreshToken) {
        if ( user == null && accessToken == null && refreshToken == null ) {
            return null;
        }

        AuthResponse.AuthResponseBuilder authResponse = AuthResponse.builder();

        if ( user != null ) {
            authResponse.username( user.getUsername() );
            authResponse.email( user.getEmail() );
            authResponse.firstName( user.getFirstName() );
            authResponse.lastName( user.getLastName() );
        }
        authResponse.accessToken( accessToken );
        authResponse.refreshToken( refreshToken );
        authResponse.role( user.getRole().name() );
        authResponse.tokenType( "Bearer" );

        return authResponse.build();
    }
}
