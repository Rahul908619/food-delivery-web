package com.swiggy.repository;

import com.swiggy.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    List<Restaurant> findByOwnerId(Long ownerId);

    Optional<Restaurant> findByIdAndOwnerId(Long id, Long ownerId);

    List<Restaurant> findByApprovedFalse();

    List<Restaurant> findByApprovedTrueAndActiveTrue();

    @Query("""
        SELECT DISTINCT r.city
        FROM Restaurant r
        WHERE r.approved = true
          AND r.active = true
          AND r.city IS NOT NULL
          AND TRIM(r.city) <> ''
        ORDER BY r.city
        """)
    List<String> findDistinctServiceableCities();

    @Query(value = """
        SELECT r.* FROM restaurants r
        WHERE r.approved = true AND r.active = true
        AND (
            6371 * ACOS(
                COS(RADIANS(:lat)) * COS(RADIANS(r.latitude)) *
                COS(RADIANS(r.longitude) - RADIANS(:lng)) +
                SIN(RADIANS(:lat)) * SIN(RADIANS(r.latitude))
            )
        ) <= :radiusKm
        ORDER BY (
            6371 * ACOS(
                COS(RADIANS(:lat)) * COS(RADIANS(r.latitude)) *
                COS(RADIANS(r.longitude) - RADIANS(:lng)) +
                SIN(RADIANS(:lat)) * SIN(RADIANS(r.latitude))
            )
        ) ASC
        """, nativeQuery = true)
    List<Restaurant> findNearbyRestaurants(
            @Param("lat") Double lat,
            @Param("lng") Double lng,
            @Param("radiusKm") Double radiusKm
    );

    @Query(value = """
        SELECT r.* FROM restaurants r
        WHERE r.approved = true AND r.active = true AND r.veg_type = :vegType
        AND (
            6371 * ACOS(
                COS(RADIANS(:lat)) * COS(RADIANS(r.latitude)) *
                COS(RADIANS(r.longitude) - RADIANS(:lng)) +
                SIN(RADIANS(:lat)) * SIN(RADIANS(r.latitude))
            )
        ) <= :radiusKm
        ORDER BY r.rating DESC
        """, nativeQuery = true)
    List<Restaurant> findNearbyByVegType(
            @Param("lat") Double lat,
            @Param("lng") Double lng,
            @Param("radiusKm") Double radiusKm,
            @Param("vegType") String vegType
    );
}
