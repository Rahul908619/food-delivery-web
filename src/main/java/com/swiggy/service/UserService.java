package com.swiggy.service;

import com.swiggy.dto.request.AddressRequest;
import com.swiggy.dto.response.UserResponse;
import com.swiggy.entity.Address;
import com.swiggy.entity.User;
import com.swiggy.exception.ResourceNotFoundException;
import com.swiggy.exception.UnauthorizedException;
import com.swiggy.repository.AddressRepository;
import com.swiggy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final CloudinaryService cloudinaryService;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new UnauthorizedException("User not authenticated");
        }
        String identifier = authentication.getName();
        return userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByPhone(identifier))
                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));
    }

    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .profileImage(user.getProfileImage())
                .active(user.isActive())
                .phoneVerified(user.isPhoneVerified())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Transactional
    public UserResponse updateProfile(Long userId, String name, MultipartFile image) {
        User user = getById(userId);
        if (name != null && !name.isBlank()) {
            user.setName(name);
        }
        if (image != null && !image.isEmpty()) {
            String url = cloudinaryService.uploadImage(image, "profiles");
            user.setProfileImage(url);
        }
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public Address addAddress(Long userId, AddressRequest request) {
        User user = getById(userId);
        if (request.isDefault()) {
            addressRepository.findByUserId(userId).forEach(address -> {
                address.setDefault(false);
                addressRepository.save(address);
            });
        }
        Address address = Address.builder()
                .user(user)
                .addressLine(request.getAddressLine())
                .landmark(request.getLandmark())
                .city(request.getCity())
                .pincode(request.getPincode())
                .state(request.getState())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .label(request.getLabel())
                .isDefault(request.isDefault())
                .build();
        return addressRepository.save(address);
    }

    public List<Address> getMyAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDesc(userId);
    }

    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        if (!address.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Not your address");
        }
        addressRepository.delete(address);
    }

    public UserResponse toggleUserActive(Long userId) {
        User user = getById(userId);
        user.setActive(!user.isActive());
        return toResponse(userRepository.save(user));
    }
}
