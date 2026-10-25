package com.medibook.service;

import com.medibook.dto.AppointmentRequest;
import com.medibook.dto.AppointmentStatusUpdateRequest;
import com.medibook.dto.AdminDashboardResponse;
import com.medibook.dto.AdminDashboardResponse.AdminDoctorSummary;
import com.medibook.dto.AdminDashboardResponse.AdminPatientSummary;
import com.medibook.dto.AdminDashboardResponse.RecentAppointment;
import com.medibook.dto.DoctorDashboardResponse;
import com.medibook.dto.DoctorDashboardResponse.AvailabilitySummary;
import com.medibook.dto.DoctorDashboardResponse.DoctorAppointmentSummary;
import com.medibook.dto.DoctorDashboardResponse.DoctorInfo;
import com.medibook.dto.DoctorDashboardResponse.PatientSummary;
import com.medibook.dto.PatientDashboardResponse.AppointmentSummary;
import com.medibook.dto.PatientDashboardResponse.DoctorSummary;
import com.medibook.entity.*;
import com.medibook.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

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
                .orElseThrow(() -> new IllegalArgumentException(
                        "This doctor has not set hours for " + day.getDisplayName(TextStyle.FULL, Locale.ENGLISH)
                                + " yet. Please choose another available day."
                ));

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

    @Transactional
    public AdminDashboardResponse getAdminDashboard() {
        List<RecentAppointment> recentAppointments = appointmentRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(appointment -> new RecentAppointment(
                        appointment.getId(),
                        new AdminPatientSummary(appointment.getPatient().getFullName()),
                        new AdminDoctorSummary(appointment.getDoctor().getFullName()),
                        appointment.getAppointmentDate(),
                        appointment.getStartTime(),
                        appointment.getStatus()
                ))
                .toList();

        return new AdminDashboardResponse(
                patientRepository.count(),
                doctorRepository.countByActiveTrue(),
                appointmentRepository.count(),
                appointmentRepository.countByStatus(AppointmentStatus.PENDING),
                appointmentRepository.countByStatus(AppointmentStatus.CONFIRMED),
                appointmentRepository.countByStatus(AppointmentStatus.COMPLETED),
                appointmentRepository.countByStatus(AppointmentStatus.CANCELLED),
                recentAppointments
        );
    }

    @Transactional
    public DoctorDashboardResponse getDoctorDashboard(String email) {
        Doctor doctor = doctorRepository.findByEmail(email);
        List<AvailabilitySummary> availabilities = doctorAvailabilityRepository.findByDoctorId(doctor.getId())
                .stream()
                .map(availability -> new AvailabilitySummary(
                        availability.getId(),
                        availability.getDayOfWeek(),
                        availability.getStartTime(),
                        availability.getEndTime()
                ))
                .toList();
        List<DoctorAppointmentSummary> appointments = appointmentRepository.findByDoctorId(doctor.getId())
                .stream()
                .map(appointment -> new DoctorAppointmentSummary(
                        appointment.getId(),
                        new PatientSummary(appointment.getPatient().getFullName()),
                        appointment.getAppointmentDate(),
                        appointment.getStartTime(),
                        appointment.getEndTime(),
                        appointment.getReason(),
                        appointment.getStatus()
                ))
                .toList();

        return new DoctorDashboardResponse(
                new DoctorInfo(doctor.getId(), doctor.getFullName(), doctor.getSpecialization(), availabilities),
                appointments
        );
    }

    public List<Appointment> getAppointmentsForPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    @Transactional
    public List<AppointmentSummary> getPatientDashboardAppointments(Long patientId) {
        return appointmentRepository.findByPatientId(patientId).stream()
                .map(appointment -> new AppointmentSummary(
                        appointment.getId(),
                        new DoctorSummary(
                                appointment.getDoctor().getId(),
                                appointment.getDoctor().getFullName(),
                                appointment.getDoctor().getSpecialization()
                        ),
                        appointment.getAppointmentDate(),
                        appointment.getStartTime(),
                        appointment.getEndTime(),
                        appointment.getReason(),
                        appointment.getStatus(),
                        appointment.getCreatedAt()
                ))
                .toList();
    }

    @Transactional
    public void updateStatus(Long id, AppointmentStatusUpdateRequest request, String doctorEmail) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        Doctor doctor = doctorRepository.findByEmail(doctorEmail);
        if (doctor == null || !appointment.getDoctor().getId().equals(doctor.getId())) {
            throw new AccessDeniedException("You can only update your own appointments.");
        }

        boolean validTransition = switch (appointment.getStatus()) {
            case PENDING -> request.getStatus() == AppointmentStatus.CONFIRMED
                    || request.getStatus() == AppointmentStatus.REJECTED;
            case CONFIRMED -> request.getStatus() == AppointmentStatus.COMPLETED;
            default -> false;
        };
        if (!validTransition) {
            throw new IllegalArgumentException("This appointment status cannot be changed to " + request.getStatus() + ".");
        }

        appointment.setStatus(request.getStatus());
        appointmentRepository.save(appointment);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }
}
