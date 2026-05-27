package com.swiggy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaymentInitiateResponse {
    private String razorpayOrderId;
    private Double amount;
    private Double foodAmount;
    private Double deliveryFee;
    private Double convenienceFee;
    private String currency;
    private String keyId;
    private Long orderId;
    private String restaurantName;
    private Double restaurantWillGet;
    private Double deliveryPartnerWillGet;
    private Double platformWillGet;
}
