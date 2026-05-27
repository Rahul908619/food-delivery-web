package com.swiggy.service;

import com.swiggy.entity.DeliveryPartner;
import com.swiggy.exception.ResourceNotFoundException;
import com.swiggy.repository.DeliveryPartnerRepository;
import com.swiggy.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliveryPartnerRepository deliveryPartnerRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;

    public DeliveryPartner getProfile(Long userId) {
        return deliveryPartnerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery partner profile not found"));
    }

    public DeliveryPartner toggleAvailability(Long userId) {
        DeliveryPartner partner = getProfile(userId);
        partner.setAvailable(!partner.isAvailable());
        return deliveryPartnerRepository.save(partner);
    }

    public void updateLocation(Long userId, Double lat, Double lng) {
        DeliveryPartner partner = getProfile(userId);
        partner.setCurrentLatitude(lat);
        partner.setCurrentLongitude(lng);
        partner.setLocationUpdatedAt(LocalDateTime.now());
        deliveryPartnerRepository.save(partner);
    }

    public List<?> getMyDeliveries(Long userId) {
        return orderRepository.findByDeliveryPartnerIdOrderByPlacedAtDesc(userId)
                .stream()
                .map(orderService::toResponse)
                .toList();
    }

    public Map<String, Object> getEarnings(Long userId) {
        DeliveryPartner partner = getProfile(userId);
        return Map.of(
                "totalEarnings", partner.getTotalEarnings(),
                "todayEarnings", partner.getTodayEarnings(),
                "totalDeliveries", partner.getTotalDeliveries(),
                "rating", partner.getRating()
        );
    }
}
