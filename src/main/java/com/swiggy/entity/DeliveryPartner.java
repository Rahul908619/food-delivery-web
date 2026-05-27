package com.swiggy.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_partners")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryPartner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String vehicleType;
    private String vehicleNumber;
    private String licenseNumber;
    private String aadharNumber;
    private String profileImageUrl;

    @Builder.Default
    @Column(nullable = false)
    private boolean available = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean approved = false;

    private Double currentLatitude;
    private Double currentLongitude;
    private LocalDateTime locationUpdatedAt;

    @Builder.Default
    @Column(nullable = false)
    private Double totalEarnings = 0.0;

    @Builder.Default
    @Column(nullable = false)
    private Double todayEarnings = 0.0;

    @Builder.Default
    @Column(nullable = false)
    private Integer totalDeliveries = 0;

    @Builder.Default
    private Double rating = 0.0;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
