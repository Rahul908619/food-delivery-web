package com.swiggy.repository;

import com.swiggy.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomerIdOrderByPlacedAtDesc(Long customerId);
    List<Order> findByRestaurantIdOrderByPlacedAtDesc(Long restaurantId);
    List<Order> findByRestaurantOwnerIdOrderByPlacedAtDesc(Long ownerId);
    List<Order> findByDeliveryPartnerIdOrderByPlacedAtDesc(Long partnerId);

    @Query(value = """
        SELECT o.* FROM orders o
        JOIN restaurants r ON o.restaurant_id = r.id
        WHERE o.status = 'READY'
        AND o.delivery_partner_id IS NULL
        AND (
            6371 * ACOS(
                COS(RADIANS(:lat)) * COS(RADIANS(r.latitude)) *
                COS(RADIANS(r.longitude) - RADIANS(:lng)) +
                SIN(RADIANS(:lat)) * SIN(RADIANS(r.latitude))
            )
        ) <= :radiusKm
        ORDER BY o.placed_at ASC
        """, nativeQuery = true)
    List<Order> findAvailableOrdersNearby(
            @Param("lat") Double lat,
            @Param("lng") Double lng,
            @Param("radiusKm") Double radiusKm
    );

    Optional<Order> findByIdAndCustomerId(Long id, Long customerId);
    Optional<Order> findByIdAndRestaurantOwnerId(Long id, Long ownerId);
    Optional<Order> findByIdAndDeliveryPartnerId(Long id, Long partnerId);
    Optional<Order> findByRazorpayOrderId(String razorpayOrderId);

    @Query("SELECT COALESCE(SUM(o.restaurantEarning), 0) FROM Order o WHERE o.restaurant.owner.id = :ownerId AND o.status = com.swiggy.enums.OrderStatus.DELIVERED")
    Double getTotalEarningsByOwner(@Param("ownerId") Long ownerId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.restaurant.owner.id = :ownerId AND o.status = com.swiggy.enums.OrderStatus.DELIVERED")
    Long getTotalCompletedOrdersByOwner(@Param("ownerId") Long ownerId);
}
