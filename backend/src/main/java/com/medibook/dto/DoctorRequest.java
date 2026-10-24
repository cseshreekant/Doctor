package com.medibook.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class DoctorRequest {
    @NotBlank
    private String fullName;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String specialization;

    @NotBlank
    private String qualification;

    @NotNull
    @Positive
    private Integer yearsOfExperience;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private Double consultationFee;

    private String description;
    private String profileImageUrl;
    private boolean active = true;
}
