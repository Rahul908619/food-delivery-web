package com.swiggy.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Email or phone required")
    private String identifier;

    @NotBlank(message = "Password required")
    private String password;
}
