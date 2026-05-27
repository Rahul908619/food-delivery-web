package com.swiggy.service;

import com.swiggy.dto.response.MenuItemResponse;
import com.swiggy.entity.MenuItem;
import com.swiggy.entity.Restaurant;
import com.swiggy.exception.ResourceNotFoundException;
import com.swiggy.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final CloudinaryService cloudinaryService;
    private final RestaurantService restaurantService;

    public List<MenuItemResponse> getMenu(Long restaurantId) {
        return menuItemRepository.findByRestaurantIdAndAvailableTrue(restaurantId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public MenuItemResponse addItem(
            Long ownerId,
            Long restaurantId,
            String name,
            String description,
            Double price,
            Integer offerPercent,
            String category,
            boolean isVeg,
            MultipartFile image
    ) {
        restaurantService.verifyOwner(restaurantId, ownerId);
        Restaurant restaurant = new Restaurant();
        restaurant.setId(restaurantId);

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = cloudinaryService.uploadImage(image, "menu");
        }

        Double offerPrice = null;
        if (offerPercent != null && offerPercent > 0) {
            offerPrice = price - (price * offerPercent / 100.0);
        }

        MenuItem item = MenuItem.builder()
                .restaurant(restaurant)
                .name(name)
                .description(description)
                .price(price)
                .offerPercent(offerPercent)
                .offerPrice(offerPrice)
                .category(category)
                .veg(isVeg)
                .imageUrl(imageUrl)
                .available(true)
                .build();
        return toResponse(menuItemRepository.save(item));
    }

    @Transactional
    public MenuItemResponse toggleAvailability(Long ownerId, Long itemId) {
        MenuItem item = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
        restaurantService.verifyOwner(item.getRestaurant().getId(), ownerId);
        item.setAvailable(!item.isAvailable());
        return toResponse(menuItemRepository.save(item));
    }

    @Transactional
    public MenuItemResponse updateItem(Long ownerId, Long itemId, Double price, Integer offerPercent, boolean available) {
        MenuItem item = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
        restaurantService.verifyOwner(item.getRestaurant().getId(), ownerId);
        if (price != null) {
            item.setPrice(price);
        }
        if (offerPercent != null) {
            item.setOfferPercent(offerPercent);
            item.setOfferPrice(item.getPrice() - (item.getPrice() * offerPercent / 100.0));
        }
        item.setAvailable(available);
        return toResponse(menuItemRepository.save(item));
    }

    @Transactional
    public void deleteItem(Long ownerId, Long itemId) {
        MenuItem item = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
        restaurantService.verifyOwner(item.getRestaurant().getId(), ownerId);
        if (item.getImageUrl() != null) {
            cloudinaryService.deleteImage(item.getImageUrl());
        }
        menuItemRepository.delete(item);
    }

    public MenuItemResponse toResponse(MenuItem item) {
        return MenuItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .offerPrice(item.getOfferPrice())
                .offerPercent(item.getOfferPercent())
                .imageUrl(item.getImageUrl())
                .category(item.getCategory())
                .veg(item.isVeg())
                .available(item.isAvailable())
                .restaurantId(item.getRestaurant().getId())
                .build();
    }
}
