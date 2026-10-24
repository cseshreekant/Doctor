package com.medibook.dto;

import com.medibook.entity.User;

public record AdminUserResponse(
        Long id,
        String fullName,
        String email,
        String role,
        boolean enabled
) {
    public static AdminUserResponse from(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                user.isEnabled()
        );
    }
}
