package com.swiggy.service;

import com.swiggy.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class SupabaseAuthService {

    private final RestClient.Builder restClientBuilder;

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.key:}")
    private String supabaseKey;

    @Value("${supabase.password-reset.redirect-url:}")
    private String defaultResetRedirectUrl;

    @Value("${supabase.password-reset.user-redirect-url:}")
    private String userResetRedirectUrl;

    @Value("${supabase.password-reset.partner-redirect-url:}")
    private String partnerResetRedirectUrl;

    public void signUpEmailPasswordUser(String email, String password, String name, String role) {
        ensureConfigured();

        try {
            client().post()
                    .uri(authUrl("/signup"))
                    .headers(this::addSupabaseHeaders)
                    .body(Map.of(
                            "email", email,
                            "password", password,
                            "data", Map.of(
                                    "name", name == null ? "" : name,
                                    "role", role == null ? "" : role
                            )
                    ))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException exception) {
            if (isAlreadyRegistered(exception)) {
                return;
            }
            throw new BusinessException("Supabase signup failed");
        } catch (RestClientException exception) {
            throw new BusinessException("Supabase signup failed");
        }
    }

    public void sendPasswordRecoveryEmail(String email, String redirectTo) {
        sendPasswordRecoveryEmail(email, redirectTo, null);
    }

    public void sendPasswordRecoveryEmail(String email, String redirectTo, String audience) {
        ensureConfigured();

        String url = authUrl("/recover");
        String effectiveRedirectTo = firstNonBlank(redirectTo, audienceRedirectUrl(audience), defaultResetRedirectUrl);
        if (effectiveRedirectTo != null) {
            url = UriComponentsBuilder.fromHttpUrl(url)
                    .queryParam("redirect_to", effectiveRedirectTo)
                    .toUriString();
        }

        try {
            client().post()
                    .uri(url)
                    .headers(this::addSupabaseHeaders)
                    .body(Map.of("email", email))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException exception) {
            throw new BusinessException("Supabase password reset failed");
        } catch (RestClientException exception) {
            throw new BusinessException("Supabase password reset failed");
        }
    }

    public String getAuthenticatedEmail(String accessToken) {
        ensureConfigured();

        try {
            Map<?, ?> response = client().get()
                    .uri(authUrl("/user"))
                    .headers(headers -> addSupabaseHeaders(headers, accessToken))
                    .retrieve()
                    .body(Map.class);

            Object email = response == null ? null : response.get("email");
            if (email == null || email.toString().isBlank()) {
                throw new BusinessException("Supabase session has no email");
            }
            return email.toString();
        } catch (RestClientResponseException exception) {
            throw new BusinessException("Invalid Supabase reset session");
        } catch (RestClientException exception) {
            throw new BusinessException("Invalid Supabase reset session");
        }
    }

    public void updatePassword(String accessToken, String newPassword) {
        ensureConfigured();

        try {
            client().put()
                    .uri(authUrl("/user"))
                    .headers(headers -> addSupabaseHeaders(headers, accessToken))
                    .body(Map.of("password", newPassword))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException exception) {
            throw new BusinessException("Supabase password update failed");
        } catch (RestClientException exception) {
            throw new BusinessException("Supabase password update failed");
        }
    }

    private RestClient client() {
        return restClientBuilder.build();
    }

    private void addSupabaseHeaders(HttpHeaders headers) {
        addSupabaseHeaders(headers, supabaseKey);
    }

    private void addSupabaseHeaders(HttpHeaders headers, String bearerToken) {
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseKey);
        headers.setBearerAuth(bearerToken);
    }

    private String authUrl(String path) {
        return supabaseUrl.replaceAll("/+$", "") + "/auth/v1" + path;
    }

    private void ensureConfigured() {
        if (supabaseUrl == null || supabaseUrl.isBlank() || supabaseKey == null || supabaseKey.isBlank()) {
            throw new BusinessException("Supabase is not configured");
        }
    }

    public boolean isConfigured() {
        return supabaseUrl != null && !supabaseUrl.isBlank() && supabaseKey != null && !supabaseKey.isBlank();
    }

    private boolean isAlreadyRegistered(RestClientResponseException exception) {
        String body = exception.getResponseBodyAsString();
        return body != null && body.toLowerCase().contains("already registered");
    }

    private String audienceRedirectUrl(String audience) {
        if ("partner".equalsIgnoreCase(audience) || "delivery".equalsIgnoreCase(audience)) {
            return partnerResetRedirectUrl;
        }
        if ("user".equalsIgnoreCase(audience) || "customer".equalsIgnoreCase(audience)) {
            return userResetRedirectUrl;
        }
        return null;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return null;
    }
}
