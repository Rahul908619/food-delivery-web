package com.swiggy.controller;

import com.swiggy.dto.response.ApiResponse;
import com.swiggy.enums.Role;
import com.swiggy.repository.DeliveryPartnerRepository;
import com.swiggy.repository.OrderRepository;
import com.swiggy.repository.RestaurantRepository;
import com.swiggy.repository.UserRepository;
import com.swiggy.service.OrderService;
import com.swiggy.service.RestaurantService;
import com.swiggy.service.UserService;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@Validated
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final RestaurantService restaurantService;
    private final OrderService orderService;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final RestaurantRepository restaurantRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<?>> dashboard() {
        long totalCustomers = userRepository.findByRole(Role.CUSTOMER).size();
        long totalRestaurants = restaurantRepository.count();
        long totalOrders = orderRepository.count();
        long totalDeliveryPartners = userRepository.findByRole(Role.DELIVERY_PARTNER).size();
        long pendingApprovals = restaurantRepository.findByApprovedFalse().size();
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "totalCustomers", totalCustomers,
                "totalRestaurants", totalRestaurants,
                "totalOrders", totalOrders,
                "totalDeliveryPartners", totalDeliveryPartners,
                "pendingApprovals", pendingApprovals
        )));
    }

    @GetMapping("/restaurants")
    public ResponseEntity<ApiResponse<?>> getAllRestaurants() {
        return ResponseEntity.ok(ApiResponse.success(
                restaurantRepository.findAll().stream()
                        .map(restaurant -> restaurantService.toResponse(restaurant, null, null))
                        .toList()
        ));
    }

    @GetMapping("/restaurants/pending")
    public ResponseEntity<ApiResponse<?>> pendingRestaurants() {
        return ResponseEntity.ok(ApiResponse.success(
                restaurantService.getPendingRestaurants().stream()
                        .map(restaurant -> restaurantService.toResponse(restaurant, null, null))
                        .toList()
        ));
    }

    @PutMapping("/restaurant/{id}/approve")
    public ResponseEntity<ApiResponse<?>> approveRestaurant(@PathVariable @Positive(message = "Restaurant id must be valid") Long id) {
        return ResponseEntity.ok(ApiResponse.success("Restaurant approved",
                restaurantService.approveRestaurant(id)));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<?>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(
                userRepository.findAll().stream().map(userService::toResponse).toList()
        ));
    }

    @GetMapping("/delivery-partners")
    public ResponseEntity<ApiResponse<?>> getDeliveryPartners() {
        return ResponseEntity.ok(ApiResponse.success(
                deliveryPartnerRepository.findAll().stream()
                        .map(partner -> {
                            Map<String, Object> response = new LinkedHashMap<>();
                            response.put("id", partner.getId());
                            response.put("user", userService.toResponse(partner.getUser()));
                            response.put("vehicleType", partner.getVehicleType());
                            response.put("vehicleNumber", partner.getVehicleNumber());
                            response.put("licenseNumber", partner.getLicenseNumber());
                            response.put("available", partner.isAvailable());
                            response.put("approved", partner.isApproved());
                            response.put("currentLatitude", partner.getCurrentLatitude());
                            response.put("currentLongitude", partner.getCurrentLongitude());
                            response.put("totalEarnings", partner.getTotalEarnings());
                            response.put("todayEarnings", partner.getTodayEarnings());
                            response.put("totalDeliveries", partner.getTotalDeliveries());
                            response.put("rating", partner.getRating());
                            return response;
                        })
                        .toList()
        ));
    }

    @PutMapping("/user/{userId}/block")
    public ResponseEntity<ApiResponse<?>> blockUser(@PathVariable @Positive(message = "User id must be valid") Long userId) {
        var updatedUser = userService.toggleUserActive(userId);
        return ResponseEntity.ok(ApiResponse.success(
                updatedUser.isActive() ? "User unblocked" : "User blocked",
                updatedUser
        ));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<?>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.success(
                orderRepository.findAll().stream().map(orderService::toResponse).toList()
        ));
    }
}
