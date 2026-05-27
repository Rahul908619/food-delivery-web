package com.swiggy.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.swiggy.dto.request.PaymentVerifyRequest;
import com.swiggy.dto.response.PaymentInitiateResponse;
import com.swiggy.entity.Payment;
import com.swiggy.enums.PaymentStatus;
import com.swiggy.exception.BusinessException;
import com.swiggy.exception.ResourceNotFoundException;
import com.swiggy.repository.OrderRepository;
import com.swiggy.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    public PaymentInitiateResponse createRazorpayOrder(Long orderId, Long customerId) {
        com.swiggy.entity.Order appOrder = orderRepository.findByIdAndCustomerId(orderId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if ("COD".equalsIgnoreCase(appOrder.getPaymentMethod())) {
            throw new BusinessException("COD orders do not require online payment");
        }
        if (appOrder.getPaymentStatus() == PaymentStatus.SUCCESS) {
            throw new BusinessException("Payment already completed");
        }
        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            JSONObject options = new JSONObject();
            options.put("amount", (int) (appOrder.getTotalAmount() * 100));
            options.put("currency", "INR");
            options.put("receipt", "order_" + orderId);
            options.put("notes", new JSONObject()
                    .put("restaurant", appOrder.getRestaurant().getName())
                    .put("order_id", orderId));

            Order razorpayOrder = client.orders.create(options);
            appOrder.setRazorpayOrderId(razorpayOrder.get("id").toString());
            orderRepository.save(appOrder);

            return PaymentInitiateResponse.builder()
                    .razorpayOrderId(razorpayOrder.get("id").toString())
                    .amount(appOrder.getTotalAmount())
                    .foodAmount(appOrder.getFoodAmount())
                    .deliveryFee(appOrder.getDeliveryFee())
                    .convenienceFee(appOrder.getConvenienceFee())
                    .currency("INR")
                    .keyId(keyId)
                    .orderId(orderId)
                    .restaurantName(appOrder.getRestaurant().getName())
                    .restaurantWillGet(appOrder.getRestaurantEarning())
                    .deliveryPartnerWillGet(appOrder.getDeliveryEarning())
                    .platformWillGet(appOrder.getAdminCommission())
                    .build();
        } catch (RazorpayException exception) {
            throw new BusinessException("Payment initiation failed: " + exception.getMessage());
        }
    }

    @Transactional
    public boolean verifyPayment(Long orderId, Long customerId, PaymentVerifyRequest request) {
        com.swiggy.entity.Order order = orderRepository.findByIdAndCustomerId(orderId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        try {
            String generated = hmacSha256(
                    request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId(),
                    keySecret
            );
            if (!generated.equals(request.getRazorpaySignature())) {
                throw new BusinessException("Payment verification failed - invalid signature");
            }

            order.setRazorpayPaymentId(request.getRazorpayPaymentId());
            order.setRazorpaySignature(request.getRazorpaySignature());
            order.setPaymentStatus(PaymentStatus.SUCCESS);
            orderRepository.save(order);

            Payment payment = paymentRepository.findByOrderId(order.getId()).orElseGet(Payment::new);
            payment.setOrder(order);
            payment.setRazorpayOrderId(request.getRazorpayOrderId());
            payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
            payment.setRazorpaySignature(request.getRazorpaySignature());
            payment.setAmount(order.getTotalAmount());
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(payment);
            return true;
        } catch (BusinessException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new BusinessException("Payment verification error: " + exception.getMessage());
        }
    }

    @Transactional
    public boolean confirmCOD(Long orderId, Long customerId) {
        com.swiggy.entity.Order order = orderRepository.findByIdAndCustomerId(orderId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!"COD".equalsIgnoreCase(order.getPaymentMethod())) {
            throw new BusinessException("This order is not COD");
        }

        Payment payment = paymentRepository.findByOrderId(order.getId()).orElseGet(Payment::new);
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setStatus(PaymentStatus.PENDING);
        paymentRepository.save(payment);
        return true;
    }

    private String hmacSha256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(hash);
    }
}
