package com.medibook.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class DoctorCreateRequest extends DoctorRequest {

    @NotBlank
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@#$%^&+=!]).{8,}$",
            message = "password must be at least 8 characters and include a letter, a number, and a symbol")
    private String password;
}
