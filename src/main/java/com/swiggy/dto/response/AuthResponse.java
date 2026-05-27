package com.swiggy.dto.response;

import com.swiggy.enums.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private String token;
    private String profileImage;
    private boolean phoneVerified;
}
