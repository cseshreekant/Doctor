package com.medibook.controller;

import com.medibook.dto.AdminUserResponse;
import com.medibook.dto.AdminUserStatusRequest;
import com.medibook.entity.Role;
import com.medibook.entity.User;
import com.medibook.repository.DoctorRepository;
import com.medibook.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getUsers() {
        List<AdminUserResponse> users = userRepository.findAll(Sort.by(Sort.Direction.ASC, "fullName"))
                .stream()
                .map(AdminUserResponse::from)
                .toList();
        return ResponseEntity.ok(users);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/users/{id}/status")
    public ResponseEntity<AdminUserResponse> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody AdminUserStatusRequest request
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User account not found."));
        if (user.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Administrator accounts cannot be disabled here.");
        }

        user.setEnabled(request.enabled());
        if (user.getRole() == Role.DOCTOR) {
            var doctor = doctorRepository.findByEmail(user.getEmail());
            if (doctor != null) {
                doctor.setActive(request.enabled());
            }
        }

        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(AdminUserResponse.from(savedUser));
    }
}
