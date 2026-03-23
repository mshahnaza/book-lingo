package org.example.booklingo.services;

import org.example.booklingo.dto.request.LoginRequest;
import org.example.booklingo.dto.request.RegisterRequest;
import org.example.booklingo.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(String refreshToken);

    void logout(String username);
}