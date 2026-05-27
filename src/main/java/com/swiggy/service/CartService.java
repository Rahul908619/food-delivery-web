package com.swiggy.service;

import com.swiggy.dto.response.CartResponse;
import com.swiggy.entity.Cart;
import com.swiggy.entity.CartItem;
import com.swiggy.entity.MenuItem;
import com.swiggy.entity.Restaurant;
import com.swiggy.entity.User;
import com.swiggy.exception.BusinessException;
import com.swiggy.exception.ResourceNotFoundException;
import com.swiggy.repository.CartItemRepository;
import com.swiggy.repository.CartRepository;
import com.swiggy.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final MenuItemRepository menuItemRepository;

    @Transactional
    public CartResponse addToCart(Long userId, Long menuItemId, Integer quantity) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));

        if (!menuItem.isAvailable()) {
            throw new BusinessException("This item is currently unavailable");
        }

        Restaurant restaurant = menuItem.getRestaurant();
        if (!restaurant.isApproved() || !restaurant.isOpen()) {
            throw new BusinessException("Restaurant is not accepting orders right now");
        }

        Cart cart = cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = new User();
            user.setId(userId);
            return cartRepository.save(Cart.builder().user(user).restaurant(restaurant).build());
        });

        if (cart.getRestaurant() != null && !cart.getRestaurant().getId().equals(restaurant.getId())) {
            cartItemRepository.deleteAll(cart.getItems());
            cart.getItems().clear();
            cart.setRestaurant(restaurant);
            cartRepository.save(cart);
        }

        cartItemRepository.findByCartIdAndMenuItemId(cart.getId(), menuItemId).ifPresentOrElse(existing -> {
            if (quantity <= 0) {
                cartItemRepository.delete(existing);
            } else {
                existing.setQuantity(quantity);
                cartItemRepository.save(existing);
            }
        }, () -> {
            if (quantity > 0) {
                cartItemRepository.save(CartItem.builder()
                        .cart(cart)
                        .menuItem(menuItem)
                        .quantity(quantity)
                        .build());
            }
        });

        return buildCartResponse(userId);
    }

    public CartResponse getCart(Long userId) {
        return buildCartResponse(userId);
    }

    @Transactional
    public void clearCart(Long userId) {
        cartRepository.findByUserId(userId).ifPresent(cart -> {
            cartItemRepository.deleteAll(cart.getItems());
            cart.getItems().clear();
            cart.setRestaurant(null);
            cartRepository.save(cart);
        });
    }

    private CartResponse buildCartResponse(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart is empty"));

        List<CartResponse.CartItemResponse> items = cart.getItems().stream()
                .map(cartItem -> {
                    MenuItem menuItem = cartItem.getMenuItem();
                    double effectivePrice = menuItem.getOfferPrice() != null ? menuItem.getOfferPrice() : menuItem.getPrice();
                    return CartResponse.CartItemResponse.builder()
                            .cartItemId(cartItem.getId())
                            .menuItemId(menuItem.getId())
                            .itemName(menuItem.getName())
                            .imageUrl(menuItem.getImageUrl())
                            .veg(menuItem.isVeg())
                            .price(menuItem.getPrice())
                            .offerPrice(menuItem.getOfferPrice())
                            .quantity(cartItem.getQuantity())
                            .itemTotal(effectivePrice * cartItem.getQuantity())
                            .build();
                })
                .toList();

        double subtotal = cart.getTotalAmount();
        return CartResponse.builder()
                .cartId(cart.getId())
                .restaurantId(cart.getRestaurant() != null ? cart.getRestaurant().getId() : null)
                .restaurantName(cart.getRestaurant() != null ? cart.getRestaurant().getName() : null)
                .items(items)
                .subtotal(subtotal)
                .deliveryFee(0.0)
                .totalAmount(subtotal)
                .build();
    }
}
