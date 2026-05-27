package com.swiggy.service;

import com.swiggy.dto.request.ReviewRequest;
import com.swiggy.dto.response.ReviewResponse;
import com.swiggy.entity.Order;
import com.swiggy.entity.Restaurant;
import com.swiggy.entity.Review;
import com.swiggy.entity.User;
import com.swiggy.enums.OrderStatus;
import com.swiggy.exception.BusinessException;
import com.swiggy.exception.ResourceNotFoundException;
import com.swiggy.repository.OrderRepository;
import com.swiggy.repository.RestaurantRepository;
import com.swiggy.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final RestaurantRepository restaurantRepository;

    @Transactional
    public ReviewResponse addReview(Long userId, ReviewRequest request) {
        Order order = orderRepository.findByIdAndCustomerId(request.getOrderId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new BusinessException("Can only review after delivery");
        }
        if (!order.getRestaurant().getId().equals(request.getRestaurantId())) {
            throw new BusinessException("Order does not belong to this restaurant");
        }
        if (reviewRepository.existsByUserIdAndRestaurantId(userId, request.getRestaurantId())) {
            throw new BusinessException("You have already reviewed this restaurant");
        }

        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        User user = new User();
        user.setId(userId);

        Review review = Review.builder()
                .user(user)
                .restaurant(restaurant)
                .order(order)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review savedReview = reviewRepository.save(review);
        Double avg = reviewRepository.getAverageRating(request.getRestaurantId());
        restaurant.setRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        restaurant.setTotalReviews(restaurant.getTotalReviews() + 1);
        restaurantRepository.save(restaurant);

        return toResponse(savedReview);
    }

    public List<ReviewResponse> getReviews(Long restaurantId) {
        return reviewRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .userName(review.getUser().getName())
                .userImage(review.getUser().getProfileImage())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
