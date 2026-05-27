package com.swiggy.service;

import com.swiggy.dto.request.ForgotPasswordRequest;
import com.swiggy.dto.request.LoginRequest;
import com.swiggy.dto.request.OAuthLoginRequest;
import com.swiggy.dto.request.PhoneConnectRequest;
import com.swiggy.dto.request.RegisterRequest;
import com.swiggy.dto.request.ResetPasswordRequest;
import com.swiggy.dto.response.AuthResponse;
import com.swiggy.entity.DeliveryPartner;
import com.swiggy.entity.User;
import com.swiggy.enums.Role;
import com.swiggy.exception.BusinessException;
import com.swiggy.exception.ResourceNotFoundException;
import com.swiggy.repository.DeliveryPartnerRepository;
import com.swiggy.repository.UserRepository;
import com.swiggy.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OAuthTokenVerifier oAuthTokenVerifier;
    private final UserService userService;
    private final SupabaseAuthService supabaseAuthService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        boolean hasEmail = request.getEmail() != null && !request.getEmail().isBlank();
        boolean hasPhone = request.getPhone() != null && !request.getPhone().isBlank();

        if (!hasEmail && !hasPhone) {
            throw new BusinessException("Email or phone number is required");
        }
        if (request.getRole() == Role.ADMIN) {
            throw new BusinessException("Cannot register as ADMIN via this endpoint");
        }
        if (hasEmail && userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already registered");
        }
        if (hasPhone && userRepository.existsByPhone(request.getPhone())) {
            throw new BusinessException("Phone number already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(hasEmail ? request.getEmail() : null)
                .phone(hasPhone ? request.getPhone() : null)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .active(true)
                .build();

        user = userRepository.save(user);
        syncSupabaseAccountIfPossible(user, request.getPassword(), true);

        if (user.getRole() == Role.DELIVERY_PARTNER && !deliveryPartnerRepository.existsByUserId(user.getId())) {
            deliveryPartnerRepository.save(DeliveryPartner.builder()
                    .user(user)
                    .available(false)
                    .approved(false)
                    .totalEarnings(0.0)
                    .todayEarnings(0.0)
                    .totalDeliveries(0)
                    .rating(0.0)
                    .build());
        }

        String identifier = hasEmail ? user.getEmail() : user.getPhone();
        String token = jwtUtil.generateToken(identifier, user.getRole().name(), user.getId());
        return buildAuthResponse(user, token);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getIdentifier())
                .or(() -> userRepository.findByPhone(request.getIdentifier()))
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        if (!user.isActive()) {
            throw new BusinessException("Your account is blocked. Contact support.");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException("Invalid password");
        }
        syncSupabaseAccountIfPossible(user, request.getPassword(), false);

        String identifier = user.getEmail() != null ? user.getEmail() : user.getPhone();
        String token = jwtUtil.generateToken(identifier, user.getRole().name(), user.getId());
        return buildAuthResponse(user, token);
    }

    @Transactional
    public AuthResponse googleLogin(OAuthLoginRequest request) {
        OAuthTokenVerifier.OAuthProfile profile = oAuthTokenVerifier.verifyGoogle(request.getIdToken());
        return loginOrRegisterOAuthUser(profile, request);
    }

    @Transactional
    public AuthResponse appleLogin(OAuthLoginRequest request) {
        OAuthTokenVerifier.OAuthProfile profile = oAuthTokenVerifier.verifyApple(request.getIdToken());
        return loginOrRegisterOAuthUser(profile, request);
    }

    @Transactional
    public AuthResponse connectPhone(PhoneConnectRequest request) {
        User user = userService.getCurrentUser();
        ensurePanelRole(user.getRole());
        if (userRepository.existsByPhone(request.getPhone())
                && (user.getPhone() == null || !user.getPhone().equals(request.getPhone()))) {
            throw new BusinessException("Phone number already registered");
        }
        user.setPhone(request.getPhone());
        user.setPhoneVerified(false);
        user = userRepository.save(user);

        String identifier = user.getEmail() != null ? user.getEmail() : user.getPhone();
        String token = jwtUtil.generateToken(identifier, user.getRole().name(), user.getId());
        return buildAuthResponse(user, token);
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        forgotPassword(request, null);
    }

    public void forgotPassword(ForgotPasswordRequest request, String audience) {
        User user = findByEmailOrPhone(request.getEmailOrPhone());
        if (!user.isActive()) {
            throw new BusinessException("Your account is blocked. Contact support.");
        }
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new BusinessException("No email linked to this account");
        }

        ensureSupabaseRecoveryAccount(user);
        supabaseAuthService.sendPasswordRecoveryEmail(user.getEmail(), request.getRedirectTo(), audience);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = findByEmailOrPhone(request.getEmailOrPhone());
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new BusinessException("No email linked to this account");
        }

        String supabaseEmail = supabaseAuthService.getAuthenticatedEmail(request.getAccessToken());
        if (!user.getEmail().equalsIgnoreCase(supabaseEmail)) {
            throw new BusinessException("Reset session does not match this account");
        }

        supabaseAuthService.updatePassword(request.getAccessToken(), request.getNewPassword());
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private AuthResponse loginOrRegisterOAuthUser(OAuthTokenVerifier.OAuthProfile profile, OAuthLoginRequest request) {
        Role requestedRole = request.getRole() == null ? Role.CUSTOMER : request.getRole();
        ensurePanelRole(requestedRole);

        User user = userRepository.findByEmail(profile.email()).orElse(null);
        if (user == null) {
            String name = firstNonBlank(request.getName(), profile.name(), profile.email().split("@")[0]);
            user = User.builder()
                    .name(name)
                    .email(profile.email())
                    .password(passwordEncoder.encode("OAUTH2_" + UUID.randomUUID()))
                    .role(requestedRole)
                    .profileImage(profile.profileImage())
                    .active(true)
                    .build();
            user = userRepository.save(user);
            createDeliveryPartnerIfNeeded(user);
        } else {
            ensurePanelRole(user.getRole());
            if (!user.isActive()) {
                throw new BusinessException("Your account is blocked. Contact support.");
            }
            boolean changed = false;
            if ((user.getName() == null || user.getName().isBlank()) && firstNonBlank(request.getName(), profile.name()) != null) {
                user.setName(firstNonBlank(request.getName(), profile.name()));
                changed = true;
            }
            if ((user.getProfileImage() == null || user.getProfileImage().isBlank()) && profile.profileImage() != null) {
                user.setProfileImage(profile.profileImage());
                changed = true;
            }
            if (changed) {
                user = userRepository.save(user);
            }
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return buildAuthResponse(user, token);
    }

    private void createDeliveryPartnerIfNeeded(User user) {
        if (user.getRole() == Role.DELIVERY_PARTNER && !deliveryPartnerRepository.existsByUserId(user.getId())) {
            deliveryPartnerRepository.save(DeliveryPartner.builder()
                    .user(user)
                    .available(false)
                    .approved(false)
                    .totalEarnings(0.0)
                    .todayEarnings(0.0)
                    .totalDeliveries(0)
                    .rating(0.0)
                    .build());
        }
    }

    private User findByEmailOrPhone(String emailOrPhone) {
        if (emailOrPhone == null || emailOrPhone.isBlank()) {
            throw new BusinessException("Email or phone number is required");
        }
        String identifier = emailOrPhone.trim();
        return userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByPhone(identifier))
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
    }

    private void syncSupabaseAccountIfPossible(User user, String rawPassword, boolean failFast) {
        if (!supabaseAuthService.isConfigured()
                || user.getEmail() == null
                || user.getEmail().isBlank()
                || rawPassword == null
                || rawPassword.isBlank()) {
            return;
        }

        try {
            supabaseAuthService.signUpEmailPasswordUser(
                    user.getEmail(),
                    rawPassword,
                    user.getName(),
                    user.getRole().name()
            );
        } catch (BusinessException exception) {
            if (failFast) {
                throw exception;
            }
        }
    }

    private void ensureSupabaseRecoveryAccount(User user) {
        if (!supabaseAuthService.isConfigured()) {
            return;
        }

        supabaseAuthService.signUpEmailPasswordUser(
                user.getEmail(),
                "TEMP_" + UUID.randomUUID() + UUID.randomUUID(),
                user.getName(),
                user.getRole().name()
        );
    }

    private void ensurePanelRole(Role role) {
        if (role == Role.ADMIN) {
            throw new BusinessException("Admin accounts cannot use this authentication flow");
        }
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .token(token)
                .profileImage(user.getProfileImage())
                .phoneVerified(user.isPhoneVerified())
                .build();
    }
}
