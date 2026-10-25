package com.medibook.controller;

import com.medibook.dto.AppointmentStatusUpdateRequest;
import com.medibook.dto.DoctorCreateRequest;
import com.medibook.dto.DoctorAvailabilityRequest;
import com.medibook.dto.DoctorRequest;
import com.medibook.dto.DoctorDashboardResponse;
import com.medibook.dto.AdminDashboardResponse;
import com.medibook.entity.Doctor;
import com.medibook.entity.DoctorAvailability;
import com.medibook.repository.DoctorAvailabilityRepository;
import com.medibook.repository.DoctorRepository;
import com.medibook.service.AppointmentService;
import com.medibook.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DoctorController {

    private final DoctorService doctorService;
    private final AppointmentService appointmentService;
    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository doctorAvailabilityRepository;

    @GetMapping("/doctors")
    public ResponseEntity<Page<Doctor>> getDoctors(
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "fee") String sortBy) {
        return ResponseEntity.ok(doctorService.getDoctors(specialization, search, page, size, sortBy));
    }

    @GetMapping("/doctors/{id}")
    public ResponseEntity<Doctor> getDoctor(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getDoctor(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/doctors")
    public ResponseEntity<Doctor> createDoctor(@Valid @RequestBody DoctorCreateRequest request) {
        return ResponseEntity.status(201).body(doctorService.createDoctor(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/doctors")
    public ResponseEntity<java.util.List<Doctor>> getAllDoctorsForAdmin() {
        return ResponseEntity.ok(doctorRepository.findAll());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/doctors/{id}")
    public ResponseEntity<Doctor> updateDoctor(@PathVariable Long id, @Valid @RequestBody DoctorRequest request) {
        return ResponseEntity.ok(doctorService.updateDoctor(id, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/doctors/{id}")
    public ResponseEntity<Void> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/dashboard")
    public ResponseEntity<AdminDashboardResponse> adminDashboard() {
        return ResponseEntity.ok(appointmentService.getAdminDashboard());
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @GetMapping("/doctor/dashboard")
    public ResponseEntity<DoctorDashboardResponse> doctorDashboard() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(appointmentService.getDoctorDashboard(email));
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @PostMapping("/doctor/availability")
    public ResponseEntity<DoctorAvailability> addAvailability(@Valid @RequestBody DoctorAvailabilityRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Doctor doctor = doctorRepository.findByEmail(email);

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be later than start time.");
        }

        DoctorAvailability availability = doctorAvailabilityRepository
                .findByDoctorIdAndDayOfWeek(doctor.getId(), request.getDayOfWeek())
                .orElseGet(() -> DoctorAvailability.builder()
                        .doctor(doctor)
                        .dayOfWeek(request.getDayOfWeek())
                        .build());

        availability.setStartTime(request.getStartTime());
        availability.setEndTime(request.getEndTime());
        return ResponseEntity.ok(doctorAvailabilityRepository.save(availability));
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @PatchMapping("/appointments/{id}/status")
    public ResponseEntity<Void> updateAppointmentStatus(@PathVariable Long id, @Valid @RequestBody AppointmentStatusUpdateRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        appointmentService.updateStatus(id, request, email);
        return ResponseEntity.noContent().build();
    }
}
