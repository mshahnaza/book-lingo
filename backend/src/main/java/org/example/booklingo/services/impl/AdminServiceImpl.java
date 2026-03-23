package org.example.booklingo.services.impl;

import lombok.RequiredArgsConstructor;
import org.example.booklingo.dto.request.AdminCreateRequest;
import org.example.booklingo.dto.response.AdminUserStatsResponse;
import org.example.booklingo.entities.Flashcard;
import org.example.booklingo.entities.LearningSession;
import org.example.booklingo.entities.User;
import org.example.booklingo.enums.Role;
import org.example.booklingo.repositories.*;
import org.example.booklingo.services.AdminService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final WordRepository wordRepository;
    private final FlashcardRepository flashcardRepository;
    private final LearningSessionRepository learningSessionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<AdminUserStatsResponse> getAllUsersWithStats() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(this::buildUserStats)
                .collect(Collectors.toList());
    }

    @Override
    public AdminUserStatsResponse getUserStatsById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return buildUserStats(user);
    }

    @Override
    @Transactional
    public void toggleUserEnabled(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsEnabled(!user.getIsEnabled());
        userRepository.save(user);
    }

    @Override
    @Transactional
    public AdminUserStatsResponse createAdmin(AdminCreateRequest request) {
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User admin = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(Role.ADMIN)
                .isEnabled(true)
                .build();

        User savedAdmin = userRepository.save(admin);
        return buildUserStats(savedAdmin);
    }

    private AdminUserStatsResponse buildUserStats(User user) {
        Long userId = user.getId();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        LocalDateTime thirtyDaysAgo = now.minusDays(30);

        // Count statistics
        long totalBooks = bookRepository.countByUserId(userId);
        long totalWords = wordRepository.countByUserId(userId);
        long totalFlashcards = flashcardRepository.countByUserId(userId);
        long totalReviewsToday = learningSessionRepository.countByUserIdAndReviewedAtAfter(userId, startOfDay);
        long totalReviewsAllTime = learningSessionRepository.countByUserId(userId);

        // Flashcards due today
        List<Flashcard> dueFlashcards = flashcardRepository
                .findByUserIdAndNextReviewDateLessThanEqual(userId, LocalDate.now());
        int flashcardsDueToday = dueFlashcards.size();

        // Average ease factor
        List<Flashcard> allFlashcards = flashcardRepository.findByUserId(userId);
        double averageEaseFactor = allFlashcards.stream()
                .mapToDouble(Flashcard::getEaseFactor)
                .average()
                .orElse(0.0);

        // Activity check - had any session in last 7 days
        long recentActivity = learningSessionRepository.countByUserIdAndReviewedAtAfter(userId, sevenDaysAgo);
        boolean isActive = recentActivity > 0 || totalBooks > 0;

        // Days active in last 30 days
        List<LearningSession> last30DaysSessions = learningSessionRepository
                .findByUserIdAndReviewedAtBetween(userId, thirtyDaysAgo, now);
        Set<LocalDate> activeDays = new HashSet<>();
        for (LearningSession session : last30DaysSessions) {
            activeDays.add(session.getReviewedAt().toLocalDate());
        }
        int daysActive = activeDays.size();

        // Last activity (most recent session)
        List<LearningSession> sessions = learningSessionRepository.findByUserIdOrderByReviewedAtDesc(userId);
        LocalDateTime lastActivity = sessions.isEmpty() ? user.getCreatedAt() : sessions.get(0).getReviewedAt();

        return AdminUserStatsResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .isEnabled(user.getIsEnabled())
                .createdAt(user.getCreatedAt())
                .lastActivity(lastActivity)
                .totalBooks((int) totalBooks)
                .totalWords((int) totalWords)
                .totalFlashcards((int) totalFlashcards)
                .flashcardsDueToday(flashcardsDueToday)
                .totalReviewsToday((int) totalReviewsToday)
                .totalReviewsAllTime((int) totalReviewsAllTime)
                .averageEaseFactor(Math.round(averageEaseFactor * 100.0) / 100.0)
                .isActive(isActive)
                .daysActive(daysActive)
                .build();
    }
}
