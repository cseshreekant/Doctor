package com.medibook.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class PatientProfileRequest {
    private String fullName;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
}
