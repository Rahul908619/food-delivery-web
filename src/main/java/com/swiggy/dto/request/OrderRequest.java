package com.swiggy.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

@Data
public class OrderRequest {

    private String addressLine;

    private String city;
    private String pincode;
    private String landmark;

    @DecimalMin(value = "-90.0", message = "Latitude must be at least -90")
    @DecimalMax(value = "90.0", message = "Latitude cannot be more than 90")
    private Double latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be at least -180")
    @DecimalMax(value = "180.0", message = "Longitude cannot be more than 180")
    private Double longitude;

    @jakarta.validation.constraints.NotBlank(message = "Payment method is required")
    private String paymentMethod;

    private Long savedAddressId;
}
