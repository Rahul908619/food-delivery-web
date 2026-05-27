package com.swiggy.dto.response;

import com.swiggy.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private String profileImage;
    private boolean active;
    private boolean phoneVerified;
    private LocalDateTime createdAt;
}
