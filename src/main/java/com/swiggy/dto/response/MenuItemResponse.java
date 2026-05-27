package com.swiggy.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MenuItemResponse {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Double offerPrice;
    private Integer offerPercent;
    private String imageUrl;
    private String category;
    private boolean veg;
    private boolean available;
    private Long restaurantId;
}
