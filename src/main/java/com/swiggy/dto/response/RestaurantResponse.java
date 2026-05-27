package com.swiggy.dto.response;

import com.swiggy.enums.VegType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RestaurantResponse {
    private Long id;
    private String name;
    private String description;
    private VegType vegType;
    private String cuisineType;
    private String imageUrl;
    private String addressLine;
    private String city;
    private Double latitude;
    private Double longitude;
    private String openTime;
    private String closeTime;
    private Double rating;
    private Integer totalReviews;
    private boolean open;
    private boolean approved;
    private Double distanceKm;
    private Double deliveryFee;
    private Integer estimatedMinutes;
    private String phone;
}
