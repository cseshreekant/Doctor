package com.medibook.service;

import com.medibook.dto.DoctorRequest;
import com.medibook.dto.DoctorCreateRequest;
import com.medibook.entity.Doctor;
import com.medibook.entity.Role;
import com.medibook.entity.User;
import com.medibook.repository.DoctorRepository;
import com.medibook.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public Page<Doctor> getDoctors(String specialization, String search, int page, int size, String sortBy) {
        Sort sort = Sort.by("consultationFee").descending();
        if ("experience".equalsIgnoreCase(sortBy)) {
            sort = Sort.by("yearsOfExperience").descending();
        } else if ("name".equalsIgnoreCase(sortBy)) {
            sort = Sort.by("fullName").ascending();
        }

        Pageable pageable = PageRequest.of(page, size, sort);
        return doctorRepository.searchDoctors(specialization, search, pageable);
    }

    public Doctor getDoctor(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
    }

    @Transactional
    public Doctor createDoctor(DoctorCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("An account already exists with this email");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.DOCTOR)
                .enabled(true)
                .build();

        userRepository.save(user);

        Doctor doctor = Doctor.builder()
                .user(user)
                .fullName(request.getFullName())
                .email(request.getEmail())
                .specialization(request.getSpecialization())
                .qualification(request.getQualification())
                .yearsOfExperience(request.getYearsOfExperience())
                .consultationFee(request.getConsultationFee())
                .description(request.getDescription())
                .profileImageUrl(request.getProfileImageUrl())
                .active(request.isActive())
                .build();

        return doctorRepository.save(doctor);
    }

    @Transactional
    public Doctor updateDoctor(Long id, DoctorRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        doctor.setFullName(request.getFullName());
        doctor.setEmail(request.getEmail());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setQualification(request.getQualification());
        doctor.setYearsOfExperience(request.getYearsOfExperience());
        doctor.setConsultationFee(request.getConsultationFee());
        doctor.setDescription(request.getDescription());
        doctor.setProfileImageUrl(request.getProfileImageUrl());
        doctor.setActive(request.isActive());

        User user = doctor.getUser();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        userRepository.save(user);

        return doctorRepository.save(doctor);
    }

    @Transactional
    public void deleteDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        userRepository.delete(doctor.getUser());
        doctorRepository.delete(doctor);
    }
}
