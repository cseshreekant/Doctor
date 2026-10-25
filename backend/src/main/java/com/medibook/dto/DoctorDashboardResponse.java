package com.medibook.dto;

import com.medibook.entity.AppointmentStatus;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record DoctorDashboardResponse(
        DoctorInfo doctor,
        List<DoctorAppointmentSummary> appointments
) {
    public record DoctorInfo(
            Long id,
            String fullName,
            String specialization,
            List<AvailabilitySummary> availabilities
    ) {
    }

    public record AvailabilitySummary(
            Long id,
            DayOfWeek dayOfWeek,
            LocalTime startTime,
            LocalTime endTime
    ) {
    }

    public record PatientSummary(String fullName) {
    }

    public record DoctorAppointmentSummary(
            Long id,
            PatientSummary patient,
            LocalDate appointmentDate,
            LocalTime startTime,
            LocalTime endTime,
            String reason,
            AppointmentStatus status
    ) {
    }
}
