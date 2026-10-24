package com.medibook.service;

import com.medibook.dto.AppointmentRequest;
import com.medibook.dto.AppointmentStatusUpdateRequest;
import com.medibook.entity.*;
import com.medibook.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final DoctorAvailabilityRepository doctorAvailabilityRepository;

    @Transactional
    public Appointment bookAppointment(AppointmentRequest request) {
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        if (!doctor.isActive()) {
            throw new IllegalArgumentException("Doctor is currently inactive");
        }

        if (request.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Appointment date cannot be in the past");
        }

        DayOfWeek day = request.getAppointmentDate().getDayOfWeek();
        DoctorAvailability availability = doctorAvailabilityRepository
                .findByDoctorIdAndDayOfWeek(doctor.getId(), day)
                .orElseThrow(() -> new IllegalArgumentException("Doctor is not available on that day"));

        LocalTime startTime = request.getStartTime();
        LocalTime endTime = startTime.plusMinutes(30);

        if (startTime.isBefore(availability.getStartTime()) || endTime.isAfter(availability.getEndTime())) {
            throw new IllegalArgumentException("Selected slot is outside doctor working hours");
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Patient patient = patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));

        List<Appointment> sameDoctorAppointments = appointmentRepository
                .findByDoctorAndDateAndStatusNot(doctor.getId(), request.getAppointmentDate(), List.of(AppointmentStatus.CANCELLED, AppointmentStatus.REJECTED));

        for (Appointment existing : sameDoctorAppointments) {
            boolean overlap = startTime.isBefore(existing.getEndTime()) && existing.getStartTime().isBefore(endTime);
            if (overlap) {
                throw new IllegalArgumentException("This time slot is already booked");
            }
        }

        List<Appointment> patientAppointments = appointmentRepository.findByPatientId(patient.getId());
        for (Appointment existing : patientAppointments) {
            boolean sameSlot = existing.getAppointmentDate().equals(request.getAppointmentDate())
                    && existing.getStartTime().equals(startTime)
                    && existing.getStatus() != AppointmentStatus.CANCELLED
                    && existing.getStatus() != AppointmentStatus.REJECTED;
            if (sameSlot) {
                throw new IllegalArgumentException("You already booked this slot");
            }
        }

        Appointment appointment = Appointment.builder()
                .doctor(doctor)
                .patient(patient)
                .appointmentDate(request.getAppointmentDate())
                .startTime(startTime)
                .endTime(endTime)
                .reason(request.getReason())
                .status(AppointmentStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getAppointmentsForDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    public List<Appointment> getAppointmentsForPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public Appointment updateStatus(Long id, AppointmentStatusUpdateRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus(request.getStatus());
        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }
}
