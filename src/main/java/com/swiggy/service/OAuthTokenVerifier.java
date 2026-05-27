package com.swiggy.service;

import com.swiggy.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OAuthTokenVerifier {

    private static final String GOOGLE_JWKS_URI = "https://www.googleapis.com/oauth2/v3/certs";
    private static final String APPLE_JWKS_URI = "https://appleid.apple.com/auth/keys";

    @Value("#{'${app.oauth.google-client-ids:}'.split(',')}")
    private List<String> googleClientIds;

    @Value("#{'${app.oauth.apple-client-ids:}'.split(',')}")
    private List<String> appleClientIds;

    private JwtDecoder googleDecoder;
    private JwtDecoder appleDecoder;

    public OAuthProfile verifyGoogle(String idToken) {
        Jwt jwt = googleDecoder().decode(idToken);
        validateIssuer(jwt, List.of("https://accounts.google.com", "accounts.google.com"), "Google");
        validateAudience(jwt, googleClientIds, "Google");
        String email = jwt.getClaimAsString("email");
        if (email == null || email.isBlank()) {
            throw new BusinessException("Google account did not provide an email");
        }
        return new OAuthProfile(email, jwt.getClaimAsString("name"), jwt.getClaimAsString("picture"));
    }

    public OAuthProfile verifyApple(String idToken) {
        Jwt jwt = appleDecoder().decode(idToken);
        validateIssuer(jwt, List.of("https://appleid.apple.com"), "Apple");
        validateAudience(jwt, appleClientIds, "Apple");
        String email = jwt.getClaimAsString("email");
        if (email == null || email.isBlank()) {
            throw new BusinessException("Apple account did not provide an email");
        }
        return new OAuthProfile(email, null, null);
    }

    private JwtDecoder googleDecoder() {
        if (googleDecoder == null) {
            googleDecoder = buildDecoder(GOOGLE_JWKS_URI);
        }
        return googleDecoder;
    }

    private JwtDecoder appleDecoder() {
        if (appleDecoder == null) {
            appleDecoder = buildDecoder(APPLE_JWKS_URI);
        }
        return appleDecoder;
    }

    private JwtDecoder buildDecoder(String jwksUri) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwksUri).build();
        OAuth2TokenValidator<Jwt> validator = new DelegatingOAuth2TokenValidator<>(new JwtTimestampValidator());
        decoder.setJwtValidator(validator);
        return token -> {
            try {
                return decoder.decode(token);
            } catch (JwtException ex) {
                throw new BusinessException("Invalid OAuth ID token");
            }
        };
    }

    private void validateIssuer(Jwt jwt, List<String> allowedIssuers, String provider) {
        String issuer = jwt.getIssuer() == null ? null : jwt.getIssuer().toString();
        if (issuer == null || !allowedIssuers.contains(issuer)) {
            throw new BusinessException("Invalid " + provider + " token issuer");
        }
    }

    private void validateAudience(Jwt jwt, List<String> configuredClientIds, String provider) {
        List<String> allowedClientIds = configuredClientIds.stream()
                .flatMap(value -> Arrays.stream(value.split(",")))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toList();
        if (allowedClientIds.isEmpty()) {
            throw new BusinessException(provider + " OAuth client ID is not configured");
        }
        boolean matched = jwt.getAudience().stream().anyMatch(allowedClientIds::contains);
        if (!matched) {
            OAuth2Error error = new OAuth2Error("invalid_token", "Invalid token audience", null);
            throw new BusinessException(error.getDescription());
        }
    }

    public record OAuthProfile(String email, String name, String profileImage) {
    }
}
