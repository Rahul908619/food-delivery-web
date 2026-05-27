package com.swiggy.controller;

import com.swiggy.dto.request.LocationUpdateRequest;
import com.swiggy.dto.response.ApiResponse;
import com.swiggy.entity.User;
import com.swiggy.service.DeliveryService;
import com.swiggy.service.OrderService;
import com.swiggy.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/delivery", "/api/partner"})
@Validated
@PreAuthorize("hasRole('DELIVERY_PARTNER')")
@RequiredArgsConstructor
public class DeliveryController {

    private final UserService userService;
    private final OrderService orderService;
    private final DeliveryService deliveryService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<?>> getProfile() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(deliveryService.getProfile(user.getId())));
    }

    @PutMapping("/availability")
    public ResponseEntity<ApiResponse<?>> toggleAvailability() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Availability updated",
                deliveryService.toggleAvailability(user.getId())));
    }

    @PutMapping("/location")
    public ResponseEntity<ApiResponse<?>> updateLocation(
            @RequestParam @DecimalMin(value = "-90.0", message = "Latitude must be at least -90") @DecimalMax(value = "90.0", message = "Latitude cannot be more than 90") Double lat,
            @RequestParam @DecimalMin(value = "-180.0", message = "Longitude must be at least -180") @DecimalMax(value = "180.0", message = "Longitude cannot be more than 180") Double lng
    ) {
        User user = userService.getCurrentUser();
        deliveryService.updateLocation(user.getId(), lat, lng);
        return ResponseEntity.ok(ApiResponse.success("Location updated", null));
    }

    @PostMapping({"/partner/location/update", "/location/update"})
    public ResponseEntity<ApiResponse<?>> updateLocationFromBody(@Valid @RequestBody LocationUpdateRequest request) {
        User user = userService.getCurrentUser();
        deliveryService.updateLocation(user.getId(), request.getLat(), request.getLng());
        return ResponseEntity.ok(ApiResponse.success("Location updated", null));
    }

    @GetMapping("/orders/available")
    public ResponseEntity<ApiResponse<?>> getAvailableOrders(
            @RequestParam @DecimalMin(value = "-90.0", message = "Latitude must be at least -90") @DecimalMax(value = "90.0", message = "Latitude cannot be more than 90") Double lat,
            @RequestParam @DecimalMin(value = "-180.0", message = "Longitude must be at least -180") @DecimalMax(value = "180.0", message = "Longitude cannot be more than 180") Double lng,
            @RequestParam(defaultValue = "5") @Positive(message = "Radius must be greater than 0") Double radius
    ) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getAvailableOrders(lat, lng, radius)));
    }

    @PutMapping("/order/{orderId}/accept")
    public ResponseEntity<ApiResponse<?>> acceptOrder(@PathVariable @Positive(message = "Order id must be valid") Long orderId) {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Order accepted",
                orderService.acceptOrderByDelivery(orderId, user.getId())));
    }

    @PutMapping("/order/{orderId}/delivered")
    public ResponseEntity<ApiResponse<?>> markDelivered(@PathVariable @Positive(message = "Order id must be valid") Long orderId) {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Order marked delivered",
                orderService.markDelivered(orderId, user.getId())));
    }

    @GetMapping("/orders/my")
    public ResponseEntity<ApiResponse<?>> myDeliveries() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(deliveryService.getMyDeliveries(user.getId())));
    }

    @GetMapping("/earnings")
    public ResponseEntity<ApiResponse<?>> getEarnings() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(deliveryService.getEarnings(user.getId())));
    }
}
