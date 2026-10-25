package com.medibook.dto;

import com.medibook.entity.AppointmentStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record AdminDashboardResponse(
        long totalPatients,
        long totalDoctors,
        long totalAppointments,
        long pendingAppointments,
        long confirmedAppointments,
        long completedAppointments,
        long cancelledAppointments,
        List<RecentAppointment> recentAppointments
) {
    public record AdminPatientSummary(String fullName) {
    }

    public record AdminDoctorSummary(String fullName) {
    }

    public record RecentAppointment(
            Long id,
            AdminPatientSummary patient,
            AdminDoctorSummary doctor,
            LocalDate appointmentDate,
            LocalTime startTime,
            AppointmentStatus status
    ) {
    }
}
