package com.swiggy.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class LocationUtil {

    @Value("${delivery.free-distance-km:7.0}")
    private double freeDistanceKm;

    @Value("${delivery.per-km-charge:5.0}")
    private double perKmCharge;

    @Value("${delivery.base-charge:30.0}")
    private double baseCharge;

    public double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        final int earthRadiusKm = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadiusKm * c;
    }

    public double calculateDeliveryFee(double distanceKm) {
        if (distanceKm <= freeDistanceKm) {
            return 0.0;
        }
        return baseCharge + (distanceKm - freeDistanceKm) * perKmCharge;
    }

    public int estimatedDeliveryMinutes(double distanceKm) {
        return (int) Math.ceil((distanceKm / 20.0) * 60 + 10);
    }
}
