package com.swiggy.controller;

import com.swiggy.dto.request.ForgotPasswordRequest;
import com.swiggy.dto.request.LoginRequest;
import com.swiggy.dto.request.OAuthLoginRequest;
import com.swiggy.dto.request.PhoneConnectRequest;
import com.swiggy.dto.request.RegisterRequest;
import com.swiggy.dto.request.ResetPasswordRequest;
import com.swiggy.dto.response.ApiResponse;
import com.swiggy.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<?>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Registered successfully", authService.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Login successful", authService.login(request)));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<?>> google(@Valid @RequestBody OAuthLoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Google login successful", authService.googleLogin(request)));
    }

    @PostMapping("/apple")
    public ResponseEntity<ApiResponse<?>> apple(@Valid @RequestBody OAuthLoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Apple login successful", authService.appleLogin(request)));
    }

    @PostMapping("/connect-phone")
    public ResponseEntity<ApiResponse<?>> connectPhone(@Valid @RequestBody PhoneConnectRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Phone number connected", authService.connectPhone(request)));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<?>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset email sent", null));
    }

    @PostMapping({"/user/forgot-password", "/customer/forgot-password"})
    public ResponseEntity<ApiResponse<?>> forgotUserPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request, "user");
        return ResponseEntity.ok(ApiResponse.success("Password reset email sent", null));
    }

    @PostMapping({"/partner/forgot-password", "/delivery/forgot-password"})
    public ResponseEntity<ApiResponse<?>> forgotPartnerPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request, "partner");
        return ResponseEntity.ok(ApiResponse.success("Password reset email sent", null));
    }

    @PostMapping({
            "/reset-password",
            "/user/reset-password",
            "/customer/reset-password",
            "/partner/reset-password",
            "/delivery/reset-password"
    })
    public ResponseEntity<ApiResponse<?>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password updated", null));
    }
}
