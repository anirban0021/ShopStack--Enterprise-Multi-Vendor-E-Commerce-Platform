package com.shopstack.backend.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.backend.model.Order;
import com.shopstack.backend.model.OrderItem;
import com.shopstack.backend.model.Product;
import com.shopstack.backend.model.User;
import com.shopstack.backend.model.WishlistItem;
import com.shopstack.backend.repository.OrderItemRepository;
import com.shopstack.backend.repository.OrderRepository;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.UserRepository;
import com.shopstack.backend.repository.WishlistItemRepository;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = "http://localhost:5173")
public class CustomerController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WishlistItemRepository wishlistItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    // Get Customer Profile Details
    @GetMapping("/{id}")
    public ResponseEntity<?> getCustomerProfile(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        }
        return ResponseEntity.notFound().build();
    }

    // Update Customer Profile Details (Phone, Address, Full Name)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCustomerProfile(@PathVariable Long id, @RequestBody User updatedData) {
        Optional<User> optionalUser = userRepository.findById(id);

        if (optionalUser.isPresent()) {
            User existingUser = optionalUser.get();
            existingUser.setFullName(updatedData.getFullName());
            existingUser.setPhone(updatedData.getPhone());
            existingUser.setAddress(updatedData.getAddress());

            User savedUser = userRepository.save(existingUser);
            return ResponseEntity.ok(savedUser);
        }

        return ResponseEntity.notFound().build();
    }

    // Wishlist: Get all wishlisted products
    @GetMapping("/{id}/wishlist")
    public ResponseEntity<?> getWishlist(@PathVariable Long id) {
        List<WishlistItem> items = wishlistItemRepository.findByUserId(id);
        List<Product> products = new ArrayList<>();
        for (WishlistItem item : items) {
            Optional<Product> prod = productRepository.findById(item.getProductId());
            prod.ifPresent(products::add);
        }
        return ResponseEntity.ok(products);
    }

    // Wishlist: Add item to wishlist
    @PostMapping("/{id}/wishlist/{productId}")
    public ResponseEntity<?> addToWishlist(@PathVariable Long id, @PathVariable Long productId) {
        Optional<WishlistItem> existing = wishlistItemRepository.findByUserIdAndProductId(id, productId);
        if (existing.isPresent()) {
            return ResponseEntity.ok("Product already in wishlist.");
        }
        WishlistItem newItem = new WishlistItem(id, productId);
        wishlistItemRepository.save(newItem);
        return ResponseEntity.ok("Added to wishlist.");
    }

    // Wishlist: Remove item from wishlist
    @DeleteMapping("/{id}/wishlist/{productId}")
    @Transactional
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long id, @PathVariable Long productId) {
        wishlistItemRepository.deleteByUserIdAndProductId(id, productId);
        return ResponseEntity.ok("Removed from wishlist.");
    }

    // Orders: Get order history for customer
    @GetMapping("/{id}/orders")
    public ResponseEntity<?> getCustomerOrders(@PathVariable Long id) {
        List<Order> orders = orderRepository.findByUserIdOrderByIdDesc(id);

        // Map order headers along with their order items
        List<Map<String, Object>> response = orders.stream().map(order -> {
            List<OrderItem> items = orderItemRepository.findByOrderId(order.getOrderId());
            return Map.of(
                    "id", order.getId(),
                    "orderId", order.getOrderId(),
                    "date", order.getDate(),
                    "totalAmount", order.getTotalAmount(),
                    "status", order.getStatus(),
                    "items", items);
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // Orders: Get all orders across the platform (Warehouse/Admin usage)
    @GetMapping("/orders/all")
    public ResponseEntity<?> getAllOrders() {
        List<Order> orders = orderRepository.findAllByOrderByIdDesc();

        List<Map<String, Object>> response = orders.stream().map(order -> {
            List<OrderItem> items = orderItemRepository.findByOrderId(order.getOrderId());
            return Map.of(
                    "id", order.getId(),
                    "orderId", order.getOrderId(),
                    "date", order.getDate(),
                    "totalAmount", order.getTotalAmount(),
                    "status", order.getStatus(),
                    "items", items);
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // Orders: Place order (Checkout)
    @PostMapping("/{id}/orders")
    @Transactional
    public ResponseEntity<?> placeOrder(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        List<Map<String, Object>> itemsList = (List<Map<String, Object>>) payload.get("items");
        if (itemsList == null || itemsList.isEmpty()) {
            return ResponseEntity.badRequest().body("Cart is empty");
        }

        // Validate stock for all items first
        for (Map<String, Object> itemData : itemsList) {
            Long productId = Long.parseLong(itemData.get("id").toString());
            int quantity = Integer.parseInt(itemData.get("quantity").toString());

            Optional<Product> prodOpt = productRepository.findById(productId);
            if (prodOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Product with ID " + productId + " not found.");
            }
            Product product = prodOpt.get();
            if (product.getStock() < quantity) {
                return ResponseEntity.badRequest().body("Insufficient stock for product '" + product.getName() + "'. Only " + product.getStock() + " units available.");
            }
        }

        double totalAmount = Double.parseDouble(payload.get("totalAmount").toString());
        String orderIdStr = "ORD-" + (int) (100000 + Math.random() * 900000);
        String dateStr = new java.text.SimpleDateFormat("MMM dd, yyyy").format(new java.util.Date());

        // Create and save Order Header
        Order order = new Order(orderIdStr, id, dateStr, totalAmount, "CONFIRMED");
        orderRepository.save(order);

        // Process each cart item
        for (Map<String, Object> itemData : itemsList) {
            Long productId = Long.parseLong(itemData.get("id").toString());
            String productName = itemData.get("name").toString();
            double price = Double.parseDouble(itemData.get("price").toString());
            int quantity = Integer.parseInt(itemData.get("quantity").toString());

            Product product = productRepository.findById(productId).get();
            Long vendorId = product.getVendorId();

            // Reduce stock
            product.setStock(product.getStock() - quantity);
            productRepository.save(product);

            // Create and save Order Line Item
            OrderItem orderItem = new OrderItem(orderIdStr, productId, productName, price, quantity, vendorId);
            orderItemRepository.save(orderItem);
        }

        return ResponseEntity.ok(order);
    }
}