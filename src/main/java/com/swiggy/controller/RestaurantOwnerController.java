package com.swiggy.controller;

import com.swiggy.dto.response.ApiResponse;
import com.swiggy.entity.User;
import com.swiggy.enums.OrderStatus;
import com.swiggy.service.MenuItemService;
import com.swiggy.service.OrderService;
import com.swiggy.service.RestaurantService;
import com.swiggy.service.ReviewService;
import com.swiggy.service.UserService;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/owner")
@Validated
@PreAuthorize("hasRole('RESTAURANT_OWNER')")
@RequiredArgsConstructor
public class RestaurantOwnerController {

    private final UserService userService;
    private final RestaurantService restaurantService;
    private final MenuItemService menuItemService;
    private final OrderService orderService;
    private final ReviewService reviewService;

    @PostMapping("/restaurant/register")
    public ResponseEntity<ApiResponse<?>> registerRestaurant(
            @RequestParam @NotBlank(message = "Restaurant name is required") String name,
            @RequestParam(required = false) String description,
            @RequestParam @NotBlank(message = "Veg type is required") String vegType,
            @RequestParam(required = false) String cuisineType,
            @RequestParam @NotBlank(message = "Address line is required") String addressLine,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String pincode,
            @RequestParam @DecimalMin(value = "-90.0", message = "Latitude must be at least -90") @DecimalMax(value = "90.0", message = "Latitude cannot be more than 90") Double latitude,
            @RequestParam @DecimalMin(value = "-180.0", message = "Longitude must be at least -180") @DecimalMax(value = "180.0", message = "Longitude cannot be more than 180") Double longitude,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String gstNumber,
            @RequestParam(required = false) String openTime,
            @RequestParam(required = false) String closeTime,
            @RequestParam(required = false) MultipartFile image
    ) {
        User owner = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(
                "Restaurant registered. Pending admin approval.",
                restaurantService.registerRestaurant(
                        owner, name, description, vegType, cuisineType, addressLine, city, pincode,
                        latitude, longitude, phone, gstNumber, openTime, closeTime, image
                )
        ));
    }

    @GetMapping("/restaurant")
    public ResponseEntity<ApiResponse<?>> getMyRestaurant() {
        User owner = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(
                restaurantService.toResponse(restaurantService.getMyRestaurant(owner.getId()), null, null)));
    }

    @PutMapping("/restaurant/toggle-open")
    public ResponseEntity<ApiResponse<?>> toggleOpen() {
        User owner = userService.getCurrentUser();
        var restaurant = restaurantService.toggleOpen(owner.getId());
        return ResponseEntity.ok(ApiResponse.success(
                restaurant.isOpen() ? "Restaurant opened" : "Restaurant closed", restaurant));
    }

    @PutMapping("/restaurant/image")
    public ResponseEntity<ApiResponse<?>> updateImage(@RequestParam MultipartFile image) {
        User owner = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Image updated",
                restaurantService.updateImage(owner.getId(), image)));
    }

    @PostMapping("/menu/add")
    public ResponseEntity<ApiResponse<?>> addMenuItem(
            @RequestParam @Positive(message = "Restaurant id must be valid") Long restaurantId,
            @RequestParam @NotBlank(message = "Item name is required") String name,
            @RequestParam(required = false) String description,
            @RequestParam @Positive(message = "Price must be greater than 0") Double price,
            @RequestParam(required = false) @PositiveOrZero(message = "Offer percent cannot be negative") Integer offerPercent,
            @RequestParam(required = false) String category,
            @RequestParam boolean isVeg,
            @RequestParam(required = false) MultipartFile image
    ) {
        User owner = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Menu item added",
                menuItemService.addItem(owner.getId(), restaurantId, name, description, price, offerPercent, category, isVeg, image)));
    }

    @GetMapping("/menu/{restaurantId}")
    public ResponseEntity<ApiResponse<?>> getMenu(@PathVariable @Positive(message = "Restaurant id must be valid") Long restaurantId) {
        User owner = userService.getCurrentUser();
        restaurantService.verifyOwner(restaurantId, owner.getId());
        return ResponseEntity.ok(ApiResponse.success(menuItemService.getMenu(restaurantId)));
    }

    @PutMapping("/menu/{itemId}/toggle")
    public ResponseEntity<ApiResponse<?>> toggleItem(@PathVariable @Positive(message = "Item id must be valid") Long itemId) {
        User owner = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Item updated",
                menuItemService.toggleAvailability(owner.getId(), itemId)));
    }

    @PutMapping("/menu/{itemId}")
    public ResponseEntity<ApiResponse<?>> updateItem(
            @PathVariable @Positive(message = "Item id must be valid") Long itemId,
            @RequestParam(required = false) @Positive(message = "Price must be greater than 0") Double price,
            @RequestParam(required = false) @PositiveOrZero(message = "Offer percent cannot be negative") Integer offerPercent,
            @RequestParam(defaultValue = "true") boolean available
    ) {
        User owner = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Updated",
                menuItemService.updateItem(owner.getId(), itemId, price, offerPercent, available)));
    }

    @DeleteMapping("/menu/{itemId}")
    public ResponseEntity<ApiResponse<?>> deleteItem(@PathVariable @Positive(message = "Item id must be valid") Long itemId) {
        User owner = userService.getCurrentUser();
        menuItemService.deleteItem(owner.getId(), itemId);
        return ResponseEntity.ok(ApiResponse.success("Item deleted", null));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<?>> getOrders() {
        User owner = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(orderService.getRestaurantOrders(owner.getId())));
    }

    @PutMapping("/order/{orderId}/accept")
    public ResponseEntity<ApiResponse<?>> acceptOrder(@PathVariable @Positive(message = "Order id must be valid") Long orderId) {
        User owner = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Order accepted",
                orderService.updateOrderStatusByOwner(orderId, owner.getId(), OrderStatus.ACCEPTED)));
    }

    @PutMapping("/order/{orderId}/reject")
    public ResponseEntity<ApiResponse<?>> rejectOrder(@PathVariable @Positive(message = "Order id must be valid") Long orderId) {
        User owner = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Order rejected",
                orderService.updateOrderStatusByOwner(orderId, owner.getId(), OrderStatus.REJECTED)));
    }

    @PutMapping("/order/{orderId}/preparing")
    public ResponseEntity<ApiResponse<?>> markPreparing(@PathVariable @Positive(message = "Order id must be valid") Long orderId) {
        User owner = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Order marked as preparing",
                orderService.updateOrderStatusByOwner(orderId, owner.getId(), OrderStatus.PREPARING)));
    }

    @PutMapping("/order/{orderId}/ready")
    public ResponseEntity<ApiResponse<?>> markReady(@PathVariable @Positive(message = "Order id must be valid") Long orderId) {
        User owner = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Order ready for pickup",
                orderService.updateOrderStatusByOwner(orderId, owner.getId(), OrderStatus.READY)));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<?>> getAnalytics() {
        User owner = userService.getCurrentUser();
        var restaurant = restaurantService.getMyRestaurant(owner.getId());
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "totalEarnings", orderService.getTotalEarningsByOwner(owner.getId()),
                "totalCompletedOrders", orderService.getTotalCompletedOrdersByOwner(owner.getId()),
                "restaurantRating", restaurant.getRating(),
                "totalReviews", restaurant.getTotalReviews(),
                "isOpen", restaurant.isOpen(),
                "isApproved", restaurant.isApproved()
        )));
    }

    @GetMapping("/reviews")
    public ResponseEntity<ApiResponse<?>> getReviews() {
        User owner = userService.getCurrentUser();
        var restaurant = restaurantService.getMyRestaurant(owner.getId());
        return ResponseEntity.ok(ApiResponse.success(reviewService.getReviews(restaurant.getId())));
    }
}
