package com.swiggy.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordRequest {

    @NotBlank(message = "Email or phone required")
    private String emailOrPhone;

    @NotBlank(message = "Supabase access token required")
    private String accessToken;

    @NotBlank(message = "Password required")
    @Size(min = 6, message = "Password min 6 chars")
    private String newPassword;
}
