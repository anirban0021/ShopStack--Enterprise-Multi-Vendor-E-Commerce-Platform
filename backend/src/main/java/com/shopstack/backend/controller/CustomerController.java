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

import com.shopstack.backend.model.Address;
import com.shopstack.backend.model.Order;
import com.shopstack.backend.model.OrderItem;
import com.shopstack.backend.model.Product;
import com.shopstack.backend.model.User;
import com.shopstack.backend.model.WishlistItem;
import com.shopstack.backend.repository.AddressRepository;
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

    @Autowired
    private AddressRepository addressRepository;

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

    // Addresses: Get all saved shipping addresses for customer
    @GetMapping("/{id}/addresses")
    public ResponseEntity<?> getCustomerAddresses(@PathVariable Long id) {
        List<Address> addresses = addressRepository.findByUserId(id);
        // Sort: default address first, then by ID descending
        addresses.sort((a, b) -> {
            boolean aDef = Boolean.TRUE.equals(a.getIsDefault());
            boolean bDef = Boolean.TRUE.equals(b.getIsDefault());
            if (aDef != bDef) {
                return aDef ? -1 : 1;
            }
            return Long.compare(b.getId() != null ? b.getId() : 0, a.getId() != null ? a.getId() : 0);
        });
        return ResponseEntity.ok(addresses);
    }

    // Addresses: Add a new address
    @PostMapping("/{id}/addresses")
    @Transactional
    public ResponseEntity<?> addCustomerAddress(@PathVariable Long id, @RequestBody Address address) {
        if (address.getStreetAddress() == null || address.getStreetAddress().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Street address is required.");
        }
        address.setUserId(id);
        List<Address> existing = addressRepository.findByUserId(id);
        
        // If this is the user's first address or marked default, set isDefault = true and unset others
        if (existing.isEmpty() || Boolean.TRUE.equals(address.getIsDefault())) {
            address.setIsDefault(true);
            for (Address a : existing) {
                a.setIsDefault(false);
                addressRepository.save(a);
            }
        } else {
            address.setIsDefault(false);
        }
        Address saved = addressRepository.save(address);
        return ResponseEntity.ok(saved);
    }

    // Addresses: Update an existing address
    @PutMapping("/{id}/addresses/{addressId}")
    @Transactional
    public ResponseEntity<?> updateCustomerAddress(@PathVariable Long id, @PathVariable Long addressId, @RequestBody Address updated) {
        Optional<Address> opt = addressRepository.findById(addressId);
        if (opt.isPresent() && opt.get().getUserId().equals(id)) {
            Address addr = opt.get();
            addr.setFullName(updated.getFullName());
            addr.setPhone(updated.getPhone());
            addr.setStreetAddress(updated.getStreetAddress());
            addr.setCity(updated.getCity());
            addr.setState(updated.getState());
            addr.setPostalCode(updated.getPostalCode());
            addr.setAddressType(updated.getAddressType());

            if (Boolean.TRUE.equals(updated.getIsDefault())) {
                List<Address> all = addressRepository.findByUserId(id);
                for (Address a : all) {
                    if (!a.getId().equals(addressId)) {
                        a.setIsDefault(false);
                        addressRepository.save(a);
                    }
                }
                addr.setIsDefault(true);
            }
            Address saved = addressRepository.save(addr);
            return ResponseEntity.ok(saved);
        }
        return ResponseEntity.notFound().build();
    }

    // Addresses: Set an address as default
    @PutMapping("/{id}/addresses/{addressId}/default")
    @Transactional
    public ResponseEntity<?> setDefaultAddress(@PathVariable Long id, @PathVariable Long addressId) {
        Optional<Address> opt = addressRepository.findById(addressId);
        if (opt.isPresent() && opt.get().getUserId().equals(id)) {
            List<Address> all = addressRepository.findByUserId(id);
            for (Address a : all) {
                a.setIsDefault(a.getId().equals(addressId));
                addressRepository.save(a);
            }
            return ResponseEntity.ok("Address marked as default successfully.");
        }
        return ResponseEntity.notFound().build();
    }

    // Addresses: Delete an address
    @DeleteMapping("/{id}/addresses/{addressId}")
    @Transactional
    public ResponseEntity<?> deleteCustomerAddress(@PathVariable Long id, @PathVariable Long addressId) {
        Optional<Address> opt = addressRepository.findById(addressId);
        if (opt.isPresent() && opt.get().getUserId().equals(id)) {
            boolean wasDefault = Boolean.TRUE.equals(opt.get().getIsDefault());
            addressRepository.deleteById(addressId);

            // If we deleted the default address, promote another address to default if one exists
            if (wasDefault) {
                List<Address> remaining = addressRepository.findByUserIdOrderByIdDesc(id);
                if (!remaining.isEmpty()) {
                    Address newDef = remaining.get(0);
                    newDef.setIsDefault(true);
                    addressRepository.save(newDef);
                }
            }
            return ResponseEntity.ok("Address deleted successfully.");
        }
        return ResponseEntity.notFound().build();
    }

    // Orders: Get order history for customer
    @GetMapping("/{id}/orders")
    public ResponseEntity<?> getCustomerOrders(@PathVariable Long id) {
        List<Order> orders = orderRepository.findByUserIdOrderByIdDesc(id);

        // Map order headers along with their order items
        List<Map<String, Object>> response = orders.stream().map(order -> {
            List<OrderItem> items = orderItemRepository.findByOrderId(order.getOrderId());
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", order.getId());
            map.put("orderId", order.getOrderId());
            map.put("date", order.getDate());
            map.put("totalAmount", order.getTotalAmount());
            map.put("status", order.getStatus());
            map.put("paymentStatus", order.getPaymentStatus() != null ? order.getPaymentStatus() : "PENDING");
            map.put("paymentMethod", order.getPaymentMethod() != null ? order.getPaymentMethod() : "RAZORPAY");
            map.put("razorpayOrderId", order.getRazorpayOrderId());
            map.put("razorpayPaymentId", order.getRazorpayPaymentId());
            map.put("recipientName", order.getRecipientName());
            map.put("recipientPhone", order.getRecipientPhone());
            map.put("deliveryAddress", order.getDeliveryAddress());
            map.put("items", items);
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // Orders: Get all orders across the platform (Warehouse/Admin usage)
    @GetMapping("/orders/all")
    public ResponseEntity<?> getAllOrders() {
        List<Order> orders = orderRepository.findAllByOrderByIdDesc();

        List<Map<String, Object>> response = orders.stream().map(order -> {
            List<OrderItem> items = orderItemRepository.findByOrderId(order.getOrderId());
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", order.getId());
            map.put("orderId", order.getOrderId());
            map.put("date", order.getDate());
            map.put("totalAmount", order.getTotalAmount());
            map.put("status", order.getStatus());
            map.put("paymentStatus", order.getPaymentStatus() != null ? order.getPaymentStatus() : "PENDING");
            map.put("paymentMethod", order.getPaymentMethod() != null ? order.getPaymentMethod() : "RAZORPAY");
            map.put("razorpayOrderId", order.getRazorpayOrderId());
            map.put("razorpayPaymentId", order.getRazorpayPaymentId());
            map.put("recipientName", order.getRecipientName());
            map.put("recipientPhone", order.getRecipientPhone());
            map.put("deliveryAddress", order.getDeliveryAddress());
            map.put("items", items);
            return map;
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
        double itemsSubtotal = 0.0;
        for (Map<String, Object> itemData : itemsList) {
            Long productId = Long.parseLong(itemData.get("id").toString());
            int quantity = Integer.parseInt(itemData.get("quantity").toString());
            double price = Double.parseDouble(itemData.get("price").toString());

            Optional<Product> prodOpt = productRepository.findById(productId);
            if (prodOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Product with ID " + productId + " not found.");
            }
            Product product = prodOpt.get();
            if (product.getStock() < quantity) {
                return ResponseEntity.badRequest().body("Insufficient stock for product '" + product.getName() + "'. Only " + product.getStock() + " units available.");
            }
            itemsSubtotal += price * quantity;
        }
        itemsSubtotal = Math.round(itemsSubtotal * 100.0) / 100.0;

        // Delivery fee: under 500 = 99, 500 and above = free (0)
        double deliveryFee = (itemsSubtotal < 500.0 && itemsSubtotal > 0) ? 99.0 : 0.0;
        double totalAmount = Math.round((itemsSubtotal + deliveryFee) * 100.0) / 100.0;

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
            Double originalPrice = product.getPrice();
            Double discountPercentage = product.getDiscountPercentage();

            // If itemData contains explicit originalPrice or discountPercentage, use it
            if (itemData.containsKey("originalPrice") && itemData.get("originalPrice") != null) {
                originalPrice = Double.parseDouble(itemData.get("originalPrice").toString());
            }
            if (itemData.containsKey("discountPercentage") && itemData.get("discountPercentage") != null) {
                discountPercentage = Double.parseDouble(itemData.get("discountPercentage").toString());
            }

            // Reduce stock
            product.setStock(product.getStock() - quantity);
            productRepository.save(product);

            // Create and save Order Line Item with discounted price, original price and discount %
            OrderItem orderItem = new OrderItem(orderIdStr, productId, productName, price, originalPrice, discountPercentage, quantity, vendorId);
            orderItemRepository.save(orderItem);
        }

        return ResponseEntity.ok(order);
    }
}