package com.shopstack.backend.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.backend.model.Order;
import com.shopstack.backend.model.OrderItem;
import com.shopstack.backend.model.Product;
import com.shopstack.backend.model.Settlement;
import com.shopstack.backend.repository.OrderItemRepository;
import com.shopstack.backend.repository.OrderRepository;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.SettlementRepository;
import com.shopstack.backend.service.PaymentService;

@RestController
@RequestMapping("/api/vendor")
@CrossOrigin(origins = "http://localhost:5173")
public class VendorController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private SettlementRepository settlementRepository;

    @Autowired
    private PaymentService paymentService;

    // Get Analytics for a Vendor
    @GetMapping("/{vendorId}/analytics")
    public ResponseEntity<?> getVendorAnalytics(@PathVariable Long vendorId) {
        // 1. Fetch vendor's products
        List<Product> products = productRepository.findAll().stream()
                .filter(p -> p.getVendorId() != null && p.getVendorId().equals(vendorId))
                .collect(Collectors.toList());

        // 2. Fetch vendor's order line items
        List<OrderItem> orderItems = orderItemRepository.findByVendorId(vendorId);

        // 3. Perform aggregate calculations
        double totalRevenue = 0;
        int totalItemsSold = 0;
        Set<String> distinctOrderIds = orderItems.stream().map(OrderItem::getOrderId).collect(Collectors.toSet());
        
        for (OrderItem item : orderItems) {
            totalRevenue += item.getPrice() * item.getQuantity();
            totalItemsSold += item.getQuantity();
        }

        double averageOrderValue = distinctOrderIds.isEmpty() ? 0 : (totalRevenue / distinctOrderIds.size());
        
        // Count products with stock < 5
        long lowStockCount = products.stream().filter(p -> p.getStock() < 5).count();

        // Find top selling products
        Map<String, Integer> productSales = new HashMap<>();
        for (OrderItem item : orderItems) {
            productSales.put(item.getProductName(), productSales.getOrDefault(item.getProductName(), 0) + item.getQuantity());
        }

        List<Map<String, Object>> topSellers = productSales.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .limit(5)
                .map(entry -> Map.<String, Object>of("name", entry.getKey(), "salesCount", entry.getValue()))
                .collect(Collectors.toList());

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalRevenue", totalRevenue);
        analytics.put("totalOrders", distinctOrderIds.size());
        analytics.put("totalItemsSold", totalItemsSold);
        analytics.put("averageOrderValue", Math.round(averageOrderValue * 100.0) / 100.0);
        analytics.put("lowStockCount", lowStockCount);
        analytics.put("topSellingProducts", topSellers);
        analytics.put("productsCount", products.size());

        return ResponseEntity.ok(analytics);
    }

    // Get all orders containing products belonging to this vendor
    @GetMapping("/{vendorId}/orders")
    public ResponseEntity<?> getVendorOrders(@PathVariable Long vendorId) {
        List<OrderItem> orderItems = orderItemRepository.findByVendorIdOrderByIdDesc(vendorId);
        
        List<Map<String, Object>> response = new ArrayList<>();
        
        for (OrderItem item : orderItems) {
            // Find overall order details
            Optional<Order> orderOpt = orderRepository.findAll().stream()
                    .filter(o -> o.getOrderId().equals(item.getOrderId()))
                    .findFirst();
            
            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                Map<String, Object> orderMap = new HashMap<>();
                orderMap.put("orderItemId", item.getId());
                orderMap.put("orderId", order.getOrderId());
                orderMap.put("date", order.getDate());
                orderMap.put("productName", item.getProductName());
                orderMap.put("price", item.getPrice());
                orderMap.put("quantity", item.getQuantity());
                orderMap.put("totalAmount", item.getPrice() * item.getQuantity());
                orderMap.put("status", order.getStatus()); // Shared order status
                orderMap.put("paymentStatus", order.getPaymentStatus() != null ? order.getPaymentStatus() : "PENDING");
                orderMap.put("paymentMethod", order.getPaymentMethod());
                response.add(orderMap);
            }
        }
        
        return ResponseEntity.ok(response);
    }

    // Update order status (Vendor action)
    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String orderId, @RequestBody Map<String, String> payload) {
        String newStatus = payload.get("status");
        if (newStatus == null) {
            return ResponseEntity.badRequest().body("Status is required");
        }

        // Find the order
        Optional<Order> orderOpt = orderRepository.findAll().stream()
                .filter(o -> o.getOrderId().equals(orderId))
                .findFirst();

        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            String oldStatus = order.getStatus() != null ? order.getStatus() : "";
            order.setStatus(newStatus.toUpperCase());
            orderRepository.save(order);

            // Handle COD Order Delivery: mark as PAID and generate vendor settlements
            if ("DELIVERED".equalsIgnoreCase(newStatus) && "COD".equalsIgnoreCase(order.getPaymentMethod())
                    && "PENDING".equalsIgnoreCase(order.getPaymentStatus())) {
                order.setPaymentStatus("PAID");
                orderRepository.save(order);
                List<OrderItem> items = orderItemRepository.findByOrderId(order.getOrderId());
                paymentService.createSettlementsForOrder(order, items);
            }

            // Restore product stock inventory if status transitions to CANCELLED or REFUNDED
            if (("CANCELLED".equalsIgnoreCase(newStatus) || "REFUNDED".equalsIgnoreCase(newStatus))
                    && !"CANCELLED".equalsIgnoreCase(oldStatus) && !"REFUNDED".equalsIgnoreCase(oldStatus)) {
                List<OrderItem> items = orderItemRepository.findByOrderId(order.getOrderId());
                for (OrderItem item : items) {
                    if (item.getProductId() != null && item.getQuantity() > 0) {
                        Optional<Product> prodOpt = productRepository.findById(item.getProductId());
                        if (prodOpt.isPresent()) {
                            Product prod = prodOpt.get();
                            int currentStock = prod.getStock() != null ? prod.getStock() : 0;
                            prod.setStock(currentStock + item.getQuantity());
                            productRepository.save(prod);
                        }
                    }
                }
            }

            return ResponseEntity.ok(order);
        }

        return ResponseEntity.notFound().build();
    }

    // Get Vendor Settlement & Payout Ledger
    @GetMapping("/{vendorId}/settlements")
    public ResponseEntity<?> getVendorSettlements(@PathVariable Long vendorId) {
        List<Settlement> settlements = settlementRepository.findByVendorIdOrderByIdDesc(vendorId);

        double totalGross = 0;
        double totalCommission = 0;
        double totalNetPayout = 0;
        double pendingPayout = 0;
        double settledPayout = 0;

        for (Settlement s : settlements) {
            totalGross += s.getGrossAmount();
            totalCommission += s.getCommissionAmount();
            totalNetPayout += s.getNetPayoutAmount();
            if ("SETTLED".equalsIgnoreCase(s.getStatus())) {
                settledPayout += s.getNetPayoutAmount();
            } else {
                pendingPayout += s.getNetPayoutAmount();
            }
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalGross", Math.round(totalGross * 100.0) / 100.0);
        summary.put("totalCommission", Math.round(totalCommission * 100.0) / 100.0);
        summary.put("totalNetPayout", Math.round(totalNetPayout * 100.0) / 100.0);
        summary.put("pendingPayout", Math.round(pendingPayout * 100.0) / 100.0);
        summary.put("settledPayout", Math.round(settledPayout * 100.0) / 100.0);

        Map<String, Object> response = new HashMap<>();
        response.put("summary", summary);
        response.put("settlements", settlements);

        return ResponseEntity.ok(response);
    }
}
