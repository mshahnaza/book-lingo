package org.example.booklingo.services;

import org.example.booklingo.entities.User;

public interface UserService {

    User getCurrentUser();

    User getUserById(Long userId);

    User getUserByUsername(String username);
}