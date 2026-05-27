package com.swiggy.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ForgotPasswordRequest {

    @NotBlank(message = "Email or phone required")
    private String emailOrPhone;

    private String redirectTo;
}
