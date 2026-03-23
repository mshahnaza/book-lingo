package org.example.booklingo.services;

import org.example.booklingo.dto.request.AdminCreateRequest;
import org.example.booklingo.dto.response.AdminUserStatsResponse;

import java.util.List;

public interface AdminService {
    List<AdminUserStatsResponse> getAllUsersWithStats();
    AdminUserStatsResponse getUserStatsById(Long userId);
    void toggleUserEnabled(Long userId);
    AdminUserStatsResponse createAdmin(AdminCreateRequest request);
}
