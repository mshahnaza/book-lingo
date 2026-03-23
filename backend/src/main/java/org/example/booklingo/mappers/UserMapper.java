package org.example.booklingo.mappers;

import org.example.booklingo.dto.response.AuthResponse;
import org.example.booklingo.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "role", expression = "java(user.getRole().name())")
    @Mapping(target = "accessToken", source = "accessToken")
    @Mapping(target = "refreshToken", source = "refreshToken")
    @Mapping(target = "tokenType", constant = "Bearer")
    AuthResponse toAuthResponse(User user, String accessToken, String refreshToken);
}