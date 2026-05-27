package com.swiggy.service;

import com.swiggy.dto.request.OrderRequest;
import com.swiggy.dto.response.OrderResponse;
import com.swiggy.entity.Address;
import com.swiggy.entity.Cart;
import com.swiggy.entity.DeliveryPartner;
import com.swiggy.entity.Order;
import com.swiggy.entity.OrderItem;
import com.swiggy.entity.Restaurant;
import com.swiggy.entity.User;
import com.swiggy.enums.OrderStatus;
import com.swiggy.enums.PaymentStatus;
import com.swiggy.exception.BusinessException;
import com.swiggy.exception.ResourceNotFoundException;
import com.swiggy.exception.UnauthorizedException;
import com.swiggy.repository.AddressRepository;
import com.swiggy.repository.CartRepository;
import com.swiggy.repository.DeliveryPartnerRepository;
import com.swiggy.repository.OrderItemRepository;
import com.swiggy.repository.OrderRepository;
import com.swiggy.util.LocationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final Set<String> SUPPORTED_PAYMENT_METHODS = Set.of("RAZORPAY", "COD", "UPI", "CARD");

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final CartService cartService;
    private final LocationUtil locationUtil;

    @Value("${payment.admin-commission-percent:15.0}")
    private double adminCommissionPercent;

    @Value("${payment.convenience-fee:5.0}")
    private double convenienceFee;

    @Transactional
    public OrderResponse placeOrder(Long userId, OrderRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException("Cart is empty"));
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BusinessException("Cart is empty");
        }

        Restaurant restaurant = cart.getRestaurant();
        if (restaurant == null || !restaurant.isOpen()) {
            throw new BusinessException("Restaurant is currently closed");
        }

        String paymentMethod = normalizePaymentMethod(request.getPaymentMethod());

        String addressLine;
        String city;
        String pincode;
        double latitude;
        double longitude;

        if (request.getSavedAddressId() != null) {
            Address address = addressRepository.findById(request.getSavedAddressId())
                    .orElseThrow(() -> new ResourceNotFoundException("Saved address not found"));
            if (!address.getUser().getId().equals(userId)) {
                throw new UnauthorizedException("Not your address");
            }
            addressLine = address.getAddressLine();
            city = address.getCity();
            pincode = address.getPincode();
            latitude = address.getLatitude();
            longitude = address.getLongitude();
        } else {
            if (request.getAddressLine() == null || request.getAddressLine().isBlank()) {
                throw new BusinessException("Address is required");
            }
            if (request.getLatitude() == null || request.getLongitude() == null) {
                throw new BusinessException("Delivery latitude and longitude are required");
            }
            addressLine = request.getAddressLine().trim();
            city = request.getCity();
            pincode = request.getPincode();
            latitude = request.getLatitude();
            longitude = request.getLongitude();
        }

        double distanceKm = locationUtil.calculateDistance(
                latitude, longitude,
                restaurant.getLatitude(), restaurant.getLongitude()
        );
        double deliveryFee = locationUtil.calculateDeliveryFee(distanceKm);
        int etaMinutes = locationUtil.estimatedDeliveryMinutes(distanceKm);
        double foodAmount = cart.getTotalAmount();
        double commissionOnly = foodAmount * adminCommissionPercent / 100.0;
        double adminCommission = commissionOnly + convenienceFee;
        double restaurantEarning = foodAmount - commissionOnly;
        double totalAmount = foodAmount + deliveryFee + convenienceFee;

        Order order = Order.builder()
                .customer(cart.getUser())
                .restaurant(restaurant)
                .status(OrderStatus.PLACED)
                .paymentStatus(PaymentStatus.PENDING)
                .paymentMethod(paymentMethod)
                .foodAmount(foodAmount)
                .deliveryFee(deliveryFee)
                .convenienceFee(convenienceFee)
                .totalAmount(totalAmount)
                .distanceKm(distanceKm)
                .adminCommission(adminCommission)
                .restaurantEarning(restaurantEarning)
                .deliveryEarning(deliveryFee)
                .deliveryAddressLine(addressLine)
                .deliveryLatitude(latitude)
                .deliveryLongitude(longitude)
                .deliveryCity(city)
                .deliveryPincode(pincode)
                .estimatedMinutes(etaMinutes)
                .build();

        Order savedOrder = orderRepository.save(order);
        List<OrderItem> items = cart.getItems().stream()
                .map(cartItem -> {
                    double price = cartItem.getMenuItem().getOfferPrice() != null
                            ? cartItem.getMenuItem().getOfferPrice()
                            : cartItem.getMenuItem().getPrice();
                    return OrderItem.builder()
                            .order(savedOrder)
                            .menuItem(cartItem.getMenuItem())
                            .quantity(cartItem.getQuantity())
                            .priceAtOrder(price)
                            .build();
                })
                .toList();
        savedOrder.setOrderItems(orderItemRepository.saveAll(items));
        cartService.clearCart(userId);
        return toResponse(savedOrder);
    }

    public List<OrderResponse> getMyOrders(Long customerId) {
        return orderRepository.findByCustomerIdOrderByPlacedAtDesc(customerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public OrderResponse trackOrder(Long orderId, Long customerId) {
        Order order = orderRepository.findByIdAndCustomerId(orderId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return toResponse(order);
    }

    public List<OrderResponse> getRestaurantOrders(Long ownerId) {
        return orderRepository.findByRestaurantOwnerIdOrderByPlacedAtDesc(ownerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public OrderResponse updateOrderStatusByOwner(Long orderId, Long ownerId, OrderStatus newStatus) {
        if (newStatus != OrderStatus.ACCEPTED && newStatus != OrderStatus.REJECTED
                && newStatus != OrderStatus.PREPARING && newStatus != OrderStatus.READY) {
            throw new BusinessException("Invalid status for owner");
        }
        Order order = orderRepository.findByIdAndRestaurantOwnerId(orderId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setStatus(newStatus);
        if (newStatus == OrderStatus.ACCEPTED) {
            order.setAcceptedAt(LocalDateTime.now());
        }
        return toResponse(orderRepository.save(order));
    }

    public List<OrderResponse> getAvailableOrders(Double lat, Double lng, Double radius) {
        return orderRepository.findAvailableOrdersNearby(lat, lng, radius)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public OrderResponse acceptOrderByDelivery(Long orderId, Long deliveryUserId) {
        DeliveryPartner deliveryPartner = deliveryPartnerRepository.findByUserId(deliveryUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery partner profile not found"));
        if (!deliveryPartner.isApproved()) {
            throw new BusinessException("Delivery partner is not approved yet");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (order.getDeliveryPartner() != null) {
            throw new BusinessException("Order already assigned to another delivery partner");
        }
        if (order.getStatus() != OrderStatus.READY) {
            throw new BusinessException("Order is not ready for pickup yet");
        }

        User deliveryUser = deliveryPartner.getUser();
        order.setDeliveryPartner(deliveryUser);
        order.setStatus(OrderStatus.OUT_FOR_DELIVERY);
        deliveryPartner.setAvailable(false);
        deliveryPartnerRepository.save(deliveryPartner);
        return toResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse markDelivered(Long orderId, Long deliveryUserId) {
        Order order = orderRepository.findByIdAndDeliveryPartnerId(orderId, deliveryUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found or not assigned to you"));

        order.setStatus(OrderStatus.DELIVERED);
        order.setDeliveredAt(LocalDateTime.now());

        deliveryPartnerRepository.findByUserId(deliveryUserId).ifPresent(deliveryPartner -> {
            deliveryPartner.setTotalEarnings(deliveryPartner.getTotalEarnings() + order.getDeliveryEarning());
            deliveryPartner.setTodayEarnings(deliveryPartner.getTodayEarnings() + order.getDeliveryEarning());
            deliveryPartner.setTotalDeliveries(deliveryPartner.getTotalDeliveries() + 1);
            deliveryPartner.setAvailable(true);
            deliveryPartnerRepository.save(deliveryPartner);
        });

        return toResponse(orderRepository.save(order));
    }

    public Double getTotalEarningsByOwner(Long ownerId) {
        return orderRepository.getTotalEarningsByOwner(ownerId);
    }

    public Long getTotalCompletedOrdersByOwner(Long ownerId) {
        return orderRepository.getTotalCompletedOrdersByOwner(ownerId);
    }

    public OrderResponse toResponse(Order order) {
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());

        String deliveryPartnerName = null;
        String deliveryPartnerPhone = null;
        Double deliveryPartnerLat = null;
        Double deliveryPartnerLng = null;
        if (order.getDeliveryPartner() != null) {
            deliveryPartnerName = order.getDeliveryPartner().getName();
            deliveryPartnerPhone = order.getDeliveryPartner().getPhone();
            DeliveryPartner deliveryPartner = deliveryPartnerRepository.findByUserId(order.getDeliveryPartner().getId()).orElse(null);
            if (deliveryPartner != null) {
                deliveryPartnerLat = deliveryPartner.getCurrentLatitude();
                deliveryPartnerLng = deliveryPartner.getCurrentLongitude();
            }
        }

        return OrderResponse.builder()
                .orderId(order.getId())
                .restaurantId(order.getRestaurant().getId())
                .restaurantName(order.getRestaurant().getName())
                .restaurantImage(order.getRestaurant().getImageUrl())
                .restaurantAddress(order.getRestaurant().getAddressLine())
                .restaurantLat(order.getRestaurant().getLatitude())
                .restaurantLng(order.getRestaurant().getLongitude())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .foodAmount(order.getFoodAmount())
                .deliveryFee(order.getDeliveryFee())
                .convenienceFee(order.getConvenienceFee())
                .totalAmount(order.getTotalAmount())
                .adminCommission(order.getAdminCommission())
                .restaurantEarning(order.getRestaurantEarning())
                .deliveryEarning(order.getDeliveryEarning())
                .distanceKm(order.getDistanceKm())
                .deliveryAddressLine(order.getDeliveryAddressLine())
                .deliveryCity(order.getDeliveryCity())
                .deliveryPincode(order.getDeliveryPincode())
                .deliveryLat(order.getDeliveryLatitude())
                .deliveryLng(order.getDeliveryLongitude())
                .estimatedMinutes(order.getEstimatedMinutes())
                .placedAt(order.getPlacedAt())
                .deliveredAt(order.getDeliveredAt())
                .deliveryPartnerName(deliveryPartnerName)
                .deliveryPartnerPhone(deliveryPartnerPhone)
                .deliveryPartnerLat(deliveryPartnerLat)
                .deliveryPartnerLng(deliveryPartnerLng)
                .items(items.stream().map(item -> OrderResponse.OrderItemResponse.builder()
                        .itemName(item.getMenuItem().getName())
                        .imageUrl(item.getMenuItem().getImageUrl())
                        .veg(item.getMenuItem().isVeg())
                        .quantity(item.getQuantity())
                        .priceAtOrder(item.getPriceAtOrder())
                        .build()).toList())
                .build();
    }

    private String normalizePaymentMethod(String paymentMethod) {
        if (paymentMethod == null || paymentMethod.isBlank()) {
            throw new BusinessException("Payment method is required");
        }
        String normalized = paymentMethod.trim().toUpperCase();
        if (!SUPPORTED_PAYMENT_METHODS.contains(normalized)) {
            throw new BusinessException("Unsupported payment method");
        }
        return normalized;
    }
}
