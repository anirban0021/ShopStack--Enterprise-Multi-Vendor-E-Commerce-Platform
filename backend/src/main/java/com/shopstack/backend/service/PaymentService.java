package com.shopstack.backend.service;

import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.shopstack.backend.config.RazorpayConfig;
import com.shopstack.backend.model.Order;
import com.shopstack.backend.model.OrderItem;
import com.shopstack.backend.model.Product;
import com.shopstack.backend.repository.OrderItemRepository;
import com.shopstack.backend.repository.OrderRepository;
import com.shopstack.backend.repository.ProductRepository;

@Service
public class PaymentService {

    @Autowired
    private RazorpayClient razorpayClient;

    @Autowired
    private RazorpayConfig razorpayConfig;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    /**
     * Create an order on Razorpay servers
     */
    public Map<String, Object> createRazorpayOrder(double amountInRupees, String receipt) throws RazorpayException {
        // Razorpay accepts amount in paise (1 INR = 100 paise)
        long amountInPaise = Math.round(amountInRupees * 100.0);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", receipt != null && !receipt.isEmpty() ? receipt : "rcpt_" + System.currentTimeMillis());
        orderRequest.put("payment_capture", 1); // Auto capture

        com.razorpay.Order rzpOrder = razorpayClient.orders.create(orderRequest);

        Map<String, Object> response = new HashMap<>();
        response.put("razorpayOrderId", rzpOrder.get("id"));
        response.put("amount", rzpOrder.get("amount")); // in paise
        response.put("amountInRupees", amountInRupees);
        response.put("currency", rzpOrder.get("currency"));
        response.put("keyId", razorpayConfig.getKeyId());
        response.put("status", rzpOrder.get("status"));

        return response;
    }

    /**
     * Verify the HMAC SHA-256 signature returned by Razorpay Checkout
     */
    public boolean verifyPaymentSignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        if (razorpayOrderId == null || razorpayPaymentId == null || razorpaySignature == null) {
            return false;
        }

        try {
            String payload = razorpayOrderId + "|" + razorpayPaymentId;
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(razorpayConfig.getKeySecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secretKey);

            byte[] hash = sha256_HMAC.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            
            // Convert to hex string
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }

            return hexString.toString().equalsIgnoreCase(razorpaySignature.trim());
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Process checkout order: validate stock, deduct inventory, save Order and OrderItems
     */
    @Transactional
    public Order placeVerifiedOrder(Long userId, List<Map<String, Object>> itemsList, 
                                   String paymentMethod, String razorpayOrderId, String razorpayPaymentId,
                                   Map<String, Object> deliveryInfo) {
        if (itemsList == null || itemsList.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        // Validate stock for all items
        double itemsSubtotal = 0.0;
        for (Map<String, Object> itemData : itemsList) {
            Long productId = Long.parseLong(itemData.get("id").toString());
            int quantity = Integer.parseInt(itemData.get("quantity").toString());
            double price = Double.parseDouble(itemData.get("price").toString());

            Optional<Product> prodOpt = productRepository.findById(productId);
            if (prodOpt.isEmpty()) {
                throw new IllegalArgumentException("Product with ID " + productId + " not found.");
            }
            Product product = prodOpt.get();
            if (product.getStock() < quantity) {
                throw new IllegalStateException("Insufficient stock for product '" + product.getName() + "'. Only " + product.getStock() + " units available.");
            }
            itemsSubtotal += price * quantity;
        }
        itemsSubtotal = Math.round(itemsSubtotal * 100.0) / 100.0;

        // Delivery fee calculation: Under 500 = 99, 500 and above = free
        double deliveryFee = (itemsSubtotal < 500.0 && itemsSubtotal > 0) ? 99.0 : 0.0;
        double totalAmount = Math.round((itemsSubtotal + deliveryFee) * 100.0) / 100.0;

        String orderIdStr = "ORD-" + (int) (100000 + Math.random() * 900000);
        String dateStr = new SimpleDateFormat("MMM dd, yyyy").format(new Date());

        String recipientName = deliveryInfo != null && deliveryInfo.get("name") != null ? deliveryInfo.get("name").toString() : "";
        String recipientPhone = deliveryInfo != null && deliveryInfo.get("phone") != null ? deliveryInfo.get("phone").toString() : "";
        String deliveryAddress = deliveryInfo != null && deliveryInfo.get("address") != null ? deliveryInfo.get("address").toString() : "";

        // Create Order Entity
        Order order = new Order(
                orderIdStr, 
                userId, 
                dateStr, 
                totalAmount, 
                "CONFIRMED",
                paymentMethod != null ? paymentMethod : "RAZORPAY",
                razorpayOrderId,
                razorpayPaymentId,
                recipientName,
                recipientPhone,
                deliveryAddress
        );
        orderRepository.save(order);

        // Process cart items, deduct stock and create order items
        for (Map<String, Object> itemData : itemsList) {
            Long productId = Long.parseLong(itemData.get("id").toString());
            String productName = itemData.get("name").toString();
            double price = Double.parseDouble(itemData.get("price").toString());
            int quantity = Integer.parseInt(itemData.get("quantity").toString());

            Product product = productRepository.findById(productId).get();
            Long vendorId = product.getVendorId();
            Double originalPrice = product.getPrice();
            Double discountPercentage = product.getDiscountPercentage();

            if (itemData.containsKey("originalPrice") && itemData.get("originalPrice") != null) {
                originalPrice = Double.parseDouble(itemData.get("originalPrice").toString());
            }
            if (itemData.containsKey("discountPercentage") && itemData.get("discountPercentage") != null) {
                discountPercentage = Double.parseDouble(itemData.get("discountPercentage").toString());
            }

            // Reduce stock
            product.setStock(product.getStock() - quantity);
            productRepository.save(product);

            // Create and save Order Line Item
            OrderItem orderItem = new OrderItem(orderIdStr, productId, productName, price, originalPrice, discountPercentage, quantity, vendorId);
            orderItemRepository.save(orderItem);
        }

        return order;
    }
}
