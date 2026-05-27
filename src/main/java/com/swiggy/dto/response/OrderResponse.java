package com.swiggy.dto.response;

import com.swiggy.enums.OrderStatus;
import com.swiggy.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long orderId;
    private Long restaurantId;
    private String restaurantName;
    private String restaurantImage;
    private String restaurantAddress;
    private Double restaurantLat;
    private Double restaurantLng;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private String paymentMethod;
    private Double foodAmount;
    private Double deliveryFee;
    private Double convenienceFee;
    private Double totalAmount;
    private Double adminCommission;
    private Double restaurantEarning;
    private Double deliveryEarning;
    private Double distanceKm;
    private String deliveryAddressLine;
    private String deliveryCity;
    private String deliveryPincode;
    private Double deliveryLat;
    private Double deliveryLng;
    private Integer estimatedMinutes;
    private LocalDateTime placedAt;
    private LocalDateTime deliveredAt;
    private List<OrderItemResponse> items;
    private String deliveryPartnerName;
    private String deliveryPartnerPhone;
    private Double deliveryPartnerLat;
    private Double deliveryPartnerLng;

    @Data
    @Builder
    public static class OrderItemResponse {
        private String itemName;
        private String imageUrl;
        private boolean veg;
        private Integer quantity;
        private Double priceAtOrder;
    }
}
