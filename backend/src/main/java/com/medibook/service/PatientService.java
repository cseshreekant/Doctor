package com.medibook.service;

import com.medibook.dto.PatientProfileRequest;
import com.medibook.entity.Patient;
import com.medibook.entity.User;
import com.medibook.repository.PatientRepository;
import com.medibook.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public Patient getCurrentPatient() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));
    }

    @Transactional
    public Patient updateProfile(PatientProfileRequest request) {
        Patient patient = getCurrentPatient();

        if (request.getFullName() != null) patient.setFullName(request.getFullName());
        if (request.getPhoneNumber() != null) patient.setPhoneNumber(request.getPhoneNumber());
        if (request.getDateOfBirth() != null) patient.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) patient.setGender(request.getGender());
        if (request.getAddress() != null) patient.setAddress(request.getAddress());

        User user = patient.getUser();
        user.setFullName(patient.getFullName());
        userRepository.save(user);

        return patientRepository.save(patient);
    }
}
