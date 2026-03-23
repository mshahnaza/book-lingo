package org.example.booklingo.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.booklingo.dto.request.AdminCreateRequest;
import org.example.booklingo.dto.response.AdminUserStatsResponse;
import org.example.booklingo.services.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserStatsResponse>> getAllUsersWithStats() {
        List<AdminUserStatsResponse> users = adminService.getAllUsersWithStats();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<AdminUserStatsResponse> getUserStats(@PathVariable Long id) {
        AdminUserStatsResponse userStats = adminService.getUserStatsById(id);
        return ResponseEntity.ok(userStats);
    }

    @PutMapping("/users/{id}/toggle-enabled")
    public ResponseEntity<Void> toggleUserEnabled(@PathVariable Long id) {
        adminService.toggleUserEnabled(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/create-admin")
    public ResponseEntity<AdminUserStatsResponse> createAdmin(@Valid @RequestBody AdminCreateRequest request) {
        AdminUserStatsResponse newAdmin = adminService.createAdmin(request);
        return ResponseEntity.ok(newAdmin);
    }
}
