package org.example.booklingo.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.booklingo.entities.User;
import org.example.booklingo.enums.Role;
import org.example.booklingo.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataBootstrap implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createDefaultAdminIfNotExists();
    }

    private void createDefaultAdminIfNotExists() {
        // Check if any admin exists
        boolean adminExists = userRepository.findAll().stream()
                .anyMatch(user -> user.getRole() == Role.ADMIN);

        if (!adminExists) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@booklingo.com")
                    .password(passwordEncoder.encode("admin123"))
                    .firstName("Admin")
                    .lastName("User")
                    .role(Role.ADMIN)
                    .isEnabled(true)
                    .build();

            userRepository.save(admin);
            log.info("Default admin user created: username='admin', password='admin123'");
        } else {
            log.info("Admin user already exists, skipping bootstrap");
        }
    }
}
