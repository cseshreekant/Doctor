package com.medibook.dto;

import com.medibook.entity.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AppointmentStatusUpdateRequest {
    @NotNull
    private AppointmentStatus status;
}
