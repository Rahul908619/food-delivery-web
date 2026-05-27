package com.swiggy.service;

import com.swiggy.dto.response.RestaurantResponse;
import com.swiggy.entity.Restaurant;
import com.swiggy.entity.User;
import com.swiggy.enums.VegType;
import com.swiggy.exception.BusinessException;
import com.swiggy.exception.ResourceNotFoundException;
import com.swiggy.exception.UnauthorizedException;
import com.swiggy.repository.RestaurantRepository;
import com.swiggy.util.LocationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final CloudinaryService cloudinaryService;
    private final LocationUtil locationUtil;

    public List<RestaurantResponse> getNearby(Double lat, Double lng, Double radiusKm, String vegFilter) {
        List<Restaurant> restaurants;
        if (lat == null || lng == null) {
            restaurants = getApprovedActiveRestaurants(vegFilter);
            return restaurants.stream().map(restaurant -> toResponse(restaurant, null, null)).toList();
        }

        restaurants = (vegFilter != null && !vegFilter.isBlank())
                ? restaurantRepository.findNearbyByVegType(lat, lng, radiusKm, vegFilter.toUpperCase())
                : restaurantRepository.findNearbyRestaurants(lat, lng, radiusKm);
        if (restaurants.isEmpty()) {
            restaurants = getApprovedActiveRestaurants(vegFilter);
        }
        return restaurants.stream().map(restaurant -> toResponse(restaurant, lat, lng)).toList();
    }

    public RestaurantResponse getById(Long id, Double lat, Double lng) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .filter(found -> found.isApproved() && found.isActive())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        return toResponse(restaurant, lat, lng);
    }

    public List<String> getServiceableCities() {
        return restaurantRepository.findDistinctServiceableCities().stream()
                .map(city -> city == null ? null : city.trim())
                .filter(city -> city != null && !city.isEmpty())
                .map(city -> city.toLowerCase(Locale.ROOT))
                .map(this::toDisplayCity)
                .distinct()
                .toList();
    }

    @Transactional
    public RestaurantResponse registerRestaurant(
            User owner,
            String name,
            String description,
            String vegType,
            String cuisineType,
            String addressLine,
            String city,
            String pincode,
            Double lat,
            Double lng,
            String phone,
            String gstNumber,
            String openTime,
            String closeTime,
            MultipartFile image
    ) {
        if (!restaurantRepository.findByOwnerId(owner.getId()).isEmpty()) {
            throw new BusinessException("You already have a registered restaurant");
        }

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = cloudinaryService.uploadImage(image, "restaurants");
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        Restaurant restaurant = Restaurant.builder()
                .owner(owner)
                .name(name)
                .description(description)
                .vegType(parseVegType(vegType))
                .cuisineType(cuisineType)
                .addressLine(addressLine)
                .city(city)
                .pincode(pincode)
                .latitude(lat)
                .longitude(lng)
                .phone(phone)
                .gstNumber(gstNumber)
                .openTime(openTime != null && !openTime.isBlank() ? LocalTime.parse(openTime, formatter) : null)
                .closeTime(closeTime != null && !closeTime.isBlank() ? LocalTime.parse(closeTime, formatter) : null)
                .imageUrl(imageUrl)
                .approved(false)
                .open(true)
                .active(true)
                .rating(0.0)
                .totalReviews(0)
                .build();

        return toResponse(restaurantRepository.save(restaurant), null, null);
    }

    public Restaurant getMyRestaurant(Long ownerId) {
        return restaurantRepository.findByOwnerId(ownerId).stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No restaurant registered yet"));
    }

    @Transactional
    public RestaurantResponse toggleOpen(Long ownerId) {
        Restaurant restaurant = getMyRestaurant(ownerId);
        restaurant.setOpen(!restaurant.isOpen());
        return toResponse(restaurantRepository.save(restaurant), null, null);
    }

    @Transactional
    public RestaurantResponse updateImage(Long ownerId, MultipartFile image) {
        Restaurant restaurant = getMyRestaurant(ownerId);
        if (restaurant.getImageUrl() != null) {
            cloudinaryService.deleteImage(restaurant.getImageUrl());
        }
        String url = cloudinaryService.uploadImage(image, "restaurants");
        restaurant.setImageUrl(url);
        return toResponse(restaurantRepository.save(restaurant), null, null);
    }

    public List<Restaurant> getPendingRestaurants() {
        return restaurantRepository.findByApprovedFalse();
    }

    @Transactional
    public RestaurantResponse approveRestaurant(Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        restaurant.setApproved(true);
        return toResponse(restaurantRepository.save(restaurant), null, null);
    }

    public void verifyOwner(Long restaurantId, Long ownerId) {
        restaurantRepository.findByIdAndOwnerId(restaurantId, ownerId)
                .orElseThrow(() -> new UnauthorizedException("Not your restaurant"));
    }

    public RestaurantResponse toResponse(Restaurant restaurant, Double userLat, Double userLng) {
        Double distanceKm = null;
        Double deliveryFee = null;
        Integer estimatedMinutes = null;
        if (userLat != null && userLng != null) {
            distanceKm = locationUtil.calculateDistance(userLat, userLng, restaurant.getLatitude(), restaurant.getLongitude());
            distanceKm = Math.round(distanceKm * 10.0) / 10.0;
            deliveryFee = locationUtil.calculateDeliveryFee(distanceKm);
            estimatedMinutes = locationUtil.estimatedDeliveryMinutes(distanceKm);
        }
        return RestaurantResponse.builder()
                .id(restaurant.getId())
                .name(restaurant.getName())
                .description(restaurant.getDescription())
                .vegType(restaurant.getVegType())
                .cuisineType(restaurant.getCuisineType())
                .imageUrl(restaurant.getImageUrl())
                .addressLine(restaurant.getAddressLine())
                .city(restaurant.getCity())
                .latitude(restaurant.getLatitude())
                .longitude(restaurant.getLongitude())
                .openTime(restaurant.getOpenTime() != null ? restaurant.getOpenTime().toString() : null)
                .closeTime(restaurant.getCloseTime() != null ? restaurant.getCloseTime().toString() : null)
                .rating(restaurant.getRating())
                .totalReviews(restaurant.getTotalReviews())
                .open(restaurant.isOpen())
                .approved(restaurant.isApproved())
                .distanceKm(distanceKm)
                .deliveryFee(deliveryFee)
                .estimatedMinutes(estimatedMinutes)
                .phone(restaurant.getPhone())
                .build();
    }

    private VegType parseVegType(String value) {
        try {
            return VegType.valueOf(value.toUpperCase());
        } catch (Exception exception) {
            throw new BusinessException("Invalid veg type");
        }
    }

    private List<Restaurant> getApprovedActiveRestaurants(String vegFilter) {
        return restaurantRepository.findByApprovedTrueAndActiveTrue().stream()
                .filter(restaurant -> vegFilter == null
                        || vegFilter.isBlank()
                        || restaurant.getVegType().name().equalsIgnoreCase(vegFilter))
                .toList();
    }

    private String toDisplayCity(String normalizedCity) {
        return switch (normalizedCity) {
            case "delhi", "new delhi", "delhi ncr", "gurgaon", "gurugram", "noida", "ghaziabad", "faridabad" -> "Delhi NCR";
            case "bengaluru" -> "Bangalore";
            default -> {
                String[] parts = normalizedCity.split("\\s+");
                for (int index = 0; index < parts.length; index++) {
                    if (!parts[index].isEmpty()) {
                        parts[index] = Character.toUpperCase(parts[index].charAt(0)) + parts[index].substring(1);
                    }
                }
                yield String.join(" ", parts);
            }
        };
    }
}
