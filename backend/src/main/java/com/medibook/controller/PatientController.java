package com.medibook.controller;

import com.medibook.dto.AppointmentRequest;
import com.medibook.dto.PatientProfileRequest;
import com.medibook.dto.PatientDashboardResponse;
import com.medibook.dto.PatientDashboardResponse.PatientSummary;
import com.medibook.entity.Patient;
import com.medibook.entity.User;
import com.medibook.repository.PatientRepository;
import com.medibook.repository.UserRepository;
import com.medibook.service.AppointmentService;
import com.medibook.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PatientController {

    private final PatientService patientService;
    private final AppointmentService appointmentService;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;

    @PreAuthorize("hasRole('PATIENT')")
    @GetMapping("/patient/dashboard")
    public ResponseEntity<PatientDashboardResponse> dashboard() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        Patient patient = patientRepository.findByUserId(user.getId()).orElseThrow();

        PatientSummary patientSummary = new PatientSummary(
                patient.getId(),
                patient.getFullName(),
                patient.getEmail(),
                patient.getPhoneNumber(),
                patient.getDateOfBirth(),
                patient.getGender(),
                patient.getAddress()
        );
        return ResponseEntity.ok(new PatientDashboardResponse(
                patientSummary,
                appointmentService.getPatientDashboardAppointments(patient.getId())
        ));
    }

    @PreAuthorize("hasRole('PATIENT')")
    @GetMapping("/patient/profile")
    public ResponseEntity<Patient> profile() {
        return ResponseEntity.ok(patientService.getCurrentPatient());
    }

    @PreAuthorize("hasRole('PATIENT')")
    @PutMapping("/patient/profile")
    public ResponseEntity<Patient> updateProfile(@Valid @RequestBody PatientProfileRequest request) {
        return ResponseEntity.ok(patientService.updateProfile(request));
    }

    @PreAuthorize("hasRole('PATIENT')")
    @PostMapping("/appointments")
    public ResponseEntity<Object> bookAppointment(@Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.bookAppointment(request));
    }

    @PreAuthorize("hasRole('PATIENT')")
    @GetMapping("/patient/appointments")
    public ResponseEntity<Object> getPatientAppointments() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        Patient patient = patientRepository.findByUserId(user.getId()).orElseThrow();
        return ResponseEntity.ok(appointmentService.getAppointmentsForPatient(patient.getId()));
    }
}
