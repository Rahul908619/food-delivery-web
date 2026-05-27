package com.swiggy.controller;

import com.swiggy.dto.request.AddressRequest;
import com.swiggy.dto.request.CartItemRequest;
import com.swiggy.dto.request.OrderRequest;
import com.swiggy.dto.request.PaymentVerifyRequest;
import com.swiggy.dto.request.ReviewRequest;
import com.swiggy.dto.response.ApiResponse;
import com.swiggy.entity.User;
import com.swiggy.service.CartService;
import com.swiggy.service.MenuItemService;
import com.swiggy.service.OrderService;
import com.swiggy.service.PaymentService;
import com.swiggy.service.RestaurantService;
import com.swiggy.service.ReviewService;
import com.swiggy.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/customer")
@Validated
@PreAuthorize("hasRole('CUSTOMER')")
@RequiredArgsConstructor
public class CustomerController {

    private final UserService userService;
    private final RestaurantService restaurantService;
    private final MenuItemService menuItemService;
    private final CartService cartService;
    private final OrderService orderService;
    private final ReviewService reviewService;
    private final PaymentService paymentService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<?>> getProfile() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(userService.toResponse(user)));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<?>> updateProfile(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) MultipartFile image
    ) {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Profile updated", userService.updateProfile(user.getId(), name, image)));
    }

    @PostMapping("/address")
    public ResponseEntity<ApiResponse<?>> addAddress(@Valid @RequestBody AddressRequest request) {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Address added", userService.addAddress(user.getId(), request)));
    }

    @GetMapping("/addresses")
    public ResponseEntity<ApiResponse<?>> getAddresses() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(userService.getMyAddresses(user.getId())));
    }

    @DeleteMapping("/address/{addressId}")
    public ResponseEntity<ApiResponse<?>> deleteAddress(@PathVariable @Positive(message = "Address id must be valid") Long addressId) {
        User user = userService.getCurrentUser();
        userService.deleteAddress(user.getId(), addressId);
        return ResponseEntity.ok(ApiResponse.success("Address deleted", null));
    }

    @GetMapping("/restaurants")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse<?>> getNearbyRestaurants(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(defaultValue = "10") @Positive(message = "Radius must be greater than 0") Double radius,
            @RequestParam(required = false) String vegFilter
    ) {
        return ResponseEntity.ok(ApiResponse.success(restaurantService.getNearby(lat, lng, radius, vegFilter)));
    }

    @GetMapping("/cities/serviceable")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse<?>> getServiceableCities() {
        return ResponseEntity.ok(ApiResponse.success(restaurantService.getServiceableCities()));
    }

    @GetMapping("/restaurant/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse<?>> getRestaurant(
            @PathVariable @Positive(message = "Restaurant id must be valid") Long id,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng
    ) {
        return ResponseEntity.ok(ApiResponse.success(restaurantService.getById(id, lat, lng)));
    }

    @GetMapping("/restaurant/{id}/menu")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse<?>> getMenu(@PathVariable @Positive(message = "Restaurant id must be valid") Long id) {
        return ResponseEntity.ok(ApiResponse.success(menuItemService.getMenu(id)));
    }

    @GetMapping("/restaurant/{id}/reviews")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse<?>> getReviews(@PathVariable @Positive(message = "Restaurant id must be valid") Long id) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getReviews(id)));
    }

    @PostMapping("/cart/add")
    public ResponseEntity<ApiResponse<?>> addToCart(@Valid @RequestBody CartItemRequest request) {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Cart updated",
                cartService.addToCart(user.getId(), request.getMenuItemId(), request.getQuantity())));
    }

    @GetMapping("/cart")
    public ResponseEntity<ApiResponse<?>> getCart() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(cartService.getCart(user.getId())));
    }

    @DeleteMapping("/cart/clear")
    public ResponseEntity<ApiResponse<?>> clearCart() {
        User user = userService.getCurrentUser();
        cartService.clearCart(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", null));
    }

    @PostMapping("/order/place")
    public ResponseEntity<ApiResponse<?>> placeOrder(@Valid @RequestBody OrderRequest request) {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Order placed", orderService.placeOrder(user.getId(), request)));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<?>> myOrders() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(orderService.getMyOrders(user.getId())));
    }

    @GetMapping("/order/{orderId}/track")
    public ResponseEntity<ApiResponse<?>> trackOrder(@PathVariable @Positive(message = "Order id must be valid") Long orderId) {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(orderService.trackOrder(orderId, user.getId())));
    }

    @PostMapping("/order/{orderId}/payment/initiate")
    public ResponseEntity<ApiResponse<?>> initiatePayment(@PathVariable @Positive(message = "Order id must be valid") Long orderId) {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Payment order created",
                paymentService.createRazorpayOrder(orderId, user.getId())));
    }

    @PostMapping("/order/{orderId}/payment/verify")
    public ResponseEntity<ApiResponse<?>> verifyPayment(
            @PathVariable @Positive(message = "Order id must be valid") Long orderId,
            @RequestBody PaymentVerifyRequest request
    ) {
        User user = userService.getCurrentUser();
        boolean verified = paymentService.verifyPayment(orderId, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(verified ? "Payment verified" : "Payment failed", verified));
    }

    @PostMapping("/order/{orderId}/payment/cod-confirm")
    public ResponseEntity<ApiResponse<?>> confirmCod(@PathVariable @Positive(message = "Order id must be valid") Long orderId) {
        User user = userService.getCurrentUser();
        paymentService.confirmCOD(orderId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("COD order confirmed", null));
    }

    @PostMapping("/review")
    public ResponseEntity<ApiResponse<?>> addReview(@Valid @RequestBody ReviewRequest request) {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Review submitted", reviewService.addReview(user.getId(), request)));
    }
}
