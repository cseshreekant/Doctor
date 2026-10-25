package com.medibook.dto;

import com.medibook.entity.AppointmentStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public record PatientDashboardResponse(
        PatientSummary patient,
        List<AppointmentSummary> appointments
) {
    public record PatientSummary(
            Long id,
            String fullName,
            String email,
            String phoneNumber,
            LocalDate dateOfBirth,
            String gender,
            String address
    ) {
    }

    public record DoctorSummary(
            Long id,
            String fullName,
            String specialization
    ) {
    }

    public record AppointmentSummary(
            Long id,
            DoctorSummary doctor,
            LocalDate appointmentDate,
            LocalTime startTime,
            LocalTime endTime,
            String reason,
            AppointmentStatus status,
            LocalDateTime createdAt
    ) {
    }
}
