package com.swiggy.dto.request;

import com.swiggy.enums.Role;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OAuthLoginRequest {

    @NotBlank(message = "ID token is required")
    private String idToken;

    private String name;

    private Role role = Role.CUSTOMER;
}
