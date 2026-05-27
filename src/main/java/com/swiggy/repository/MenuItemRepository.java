package com.swiggy.repository;

import com.swiggy.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByRestaurantId(Long restaurantId);
    List<MenuItem> findByRestaurantIdAndAvailableTrue(Long restaurantId);
    List<MenuItem> findByRestaurantIdAndVeg(Long restaurantId, boolean isVeg);
    List<MenuItem> findByRestaurantIdAndCategory(Long restaurantId, String category);
}
