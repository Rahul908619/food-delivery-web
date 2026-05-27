package com.swiggy.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AddressRequest {
    @NotBlank(message = "Address line is required")
    @Size(max = 200, message = "Address too long")
    private String addressLine;
    @Size(max = 100, message = "Landmark too long")
    private String landmark;
    @NotBlank(message = "City is required")
    private String city;
    @NotBlank(message = "Pincode is required")
    @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Invalid Indian pincode")
    private String pincode;
    @NotBlank(message = "State is required")
    private String state;
    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "6.0", message = "Latitude out of supported range")
    @DecimalMax(value = "37.0", message = "Latitude out of supported range")
    private Double latitude;
    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "68.0", message = "Longitude out of supported range")
    @DecimalMax(value = "97.0", message = "Longitude out of supported range")
    private Double longitude;
    private String label = "HOME";
    private boolean isDefault = false;
}
