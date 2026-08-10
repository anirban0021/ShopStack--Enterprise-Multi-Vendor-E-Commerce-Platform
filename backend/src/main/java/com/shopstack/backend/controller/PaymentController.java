package com.shopstack.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.razorpay.RazorpayException;
import com.shopstack.backend.config.RazorpayConfig;
import com.shopstack.backend.model.Order;
import com.shopstack.backend.service.PaymentService;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private RazorpayConfig razorpayConfig;

    /**
     * Public endpoint to get Razorpay public key configuration
     */
    @GetMapping("/config")
    public ResponseEntity<?> getPaymentConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("keyId", razorpayConfig.getKeyId());
        config.put("currency", "INR");
        return ResponseEntity.ok(config);
    }

    /**
     * Create Razorpay Order before opening Checkout
     */
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> payload) {
        try {
            if (!payload.containsKey("amount")) {
                return ResponseEntity.badRequest().body("Amount is required.");
            }

            double amount = Double.parseDouble(payload.get("amount").toString());
            String receipt = payload.containsKey("receipt") ? payload.get("receipt").toString() : null;

            Map<String, Object> razorpayOrder = paymentService.createRazorpayOrder(amount, receipt);
            return ResponseEntity.ok(razorpayOrder);
        } catch (RazorpayException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Razorpay order creation failed: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    /**
     * Verify payment signature and place confirmed order
     */
    @PostMapping("/verify-and-order")
    public ResponseEntity<?> verifyAndOrder(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.parseLong(payload.get("userId").toString());
            List<Map<String, Object>> itemsList = (List<Map<String, Object>>) payload.get("items");
            String paymentMethod = payload.containsKey("paymentMethod") && payload.get("paymentMethod") != null 
                    ? payload.get("paymentMethod").toString() : "RAZORPAY";
            
            Map<String, Object> deliveryInfo = (Map<String, Object>) payload.get("deliveryInfo");

            String razorpayOrderId = payload.containsKey("razorpayOrderId") && payload.get("razorpayOrderId") != null 
                    ? payload.get("razorpayOrderId").toString() : null;
            String razorpayPaymentId = payload.containsKey("razorpayPaymentId") && payload.get("razorpayPaymentId") != null 
                    ? payload.get("razorpayPaymentId").toString() : null;
            String razorpaySignature = payload.containsKey("razorpaySignature") && payload.get("razorpaySignature") != null 
                    ? payload.get("razorpaySignature").toString() : null;

            // If paying through Razorpay, verify cryptographic signature
            if ("RAZORPAY".equalsIgnoreCase(paymentMethod)) {
                if (razorpayOrderId == null || razorpayPaymentId == null || razorpaySignature == null) {
                    return ResponseEntity.badRequest().body("Missing Razorpay transaction details for signature verification.");
                }

                boolean isValidSignature = paymentService.verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
                if (!isValidSignature) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Payment signature verification failed. Untrusted transaction.");
                }
            }

            // Place verified order in the database
            Order order = paymentService.placeVerifiedOrder(
                    userId, 
                    itemsList, 
                    paymentMethod, 
                    razorpayOrderId, 
                    razorpayPaymentId, 
                    deliveryInfo
            );

            return ResponseEntity.ok(order);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Order placement failed: " + e.getMessage());
        }
    }
}
