package com.medibook.repository;

import com.medibook.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Page<Doctor> findByActiveTrue(Pageable pageable);

    @Query("SELECT d FROM Doctor d WHERE d.active = true " +
            "AND (:specialization IS NULL OR :specialization = '' OR d.specialization = :specialization) " +
            "AND (:search IS NULL OR :search = '' OR LOWER(d.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(d.description) LIKE LOWER(CONCAT('%', :search, '%'))) ")
    Page<Doctor> searchDoctors(@Param("specialization") String specialization,
                              @Param("search") String search,
                              Pageable pageable);

    boolean existsByEmail(String email);
    Doctor findByEmail(String email);
    long countByActiveTrue();
}
