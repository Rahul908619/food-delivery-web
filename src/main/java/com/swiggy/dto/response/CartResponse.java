package com.swiggy.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CartResponse {
    private Long cartId;
    private Long restaurantId;
    private String restaurantName;
    private List<CartItemResponse> items;
    private Double subtotal;
    private Double deliveryFee;
    private Double totalAmount;

    @Data
    @Builder
    public static class CartItemResponse {
        private Long cartItemId;
        private Long menuItemId;
        private String itemName;
        private String imageUrl;
        private boolean veg;
        private Double price;
        private Double offerPrice;
        private Integer quantity;
        private Double itemTotal;
    }
}
