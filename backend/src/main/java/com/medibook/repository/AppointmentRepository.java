package com.medibook.repository;

import com.medibook.entity.Appointment;
import com.medibook.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByDoctorId(Long doctorId);
    List<Appointment> findByPatientId(Long patientId);
    List<Appointment> findTop10ByOrderByCreatedAtDesc();

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :appointmentDate AND a.status NOT IN :excluded")
    List<Appointment> findByDoctorAndDateAndStatusNot(@Param("doctorId") Long doctorId,
                                                     @Param("appointmentDate") LocalDate appointmentDate,
                                                     @Param("excluded") List<AppointmentStatus> excludedStatuses);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.status = :status")
    long countByStatus(@Param("status") AppointmentStatus status);
}
