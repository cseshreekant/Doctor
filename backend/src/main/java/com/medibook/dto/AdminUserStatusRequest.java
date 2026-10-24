package com.medibook.dto;

import jakarta.validation.constraints.NotNull;

public record AdminUserStatusRequest(
        @NotNull Boolean enabled
) {
}
