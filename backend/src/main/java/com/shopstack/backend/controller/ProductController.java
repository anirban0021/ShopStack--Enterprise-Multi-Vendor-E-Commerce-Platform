package com.shopstack.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.backend.model.Product;
import com.shopstack.backend.model.Review;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.ReviewRepository;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private com.shopstack.backend.repository.UserRepository userRepository;

    @jakarta.annotation.PostConstruct
    public void initProducts() {
        // Ensure all existing products have discountPercentage and finalPrice populated
        List<Product> all = productRepository.findAll();
        for (Product p : all) {
            boolean changed = false;
            if (p.getDiscountPercentage() == null) {
                p.setDiscountPercentage(0.0);
                changed = true;
            }
            if (p.getFinalPrice() == null || p.getFinalPrice() == 0.0) {
                p.setFinalPrice(p.calculateFinalPrice());
                changed = true;
            }
            if (p.getStatus() == null || "PENDING".equalsIgnoreCase(p.getStatus())) {
                p.setStatus("APPROVED");
                changed = true;
            }
            if (changed) {
                productRepository.save(p);
            }
        }
    }

    // Get all approved products
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll().stream()
                .filter(p -> "APPROVED".equalsIgnoreCase(p.getStatus()))
                .map(this::populateRatings)
                .collect(Collectors.toList());
    }

    // Get product by id
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        Optional<Product> optional = productRepository.findById(id);
        if (optional.isPresent()) {
            return ResponseEntity.ok(populateRatings(optional.get()));
        }
        return ResponseEntity.notFound().build();
    }

    // Search approved products
    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String query) {
        return productRepository.findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(query, query)
                .stream()
                .filter(p -> "APPROVED".equalsIgnoreCase(p.getStatus()))
                .map(this::populateRatings)
                .collect(Collectors.toList());
    }

    // Vendor: Add product (defaults to PENDING awaiting Admin approval)
    @PostMapping
    public ResponseEntity<?> addProduct(@RequestBody Product product) {
        if (product.getName() == null || product.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Product name is required.");
        }
        if (product.getPrice() < 0) {
            return ResponseEntity.badRequest().body("Price cannot be negative.");
        }
        if (product.getDiscountPercentage() == null || product.getDiscountPercentage() < 0) {
            product.setDiscountPercentage(0.0);
        } else if (product.getDiscountPercentage() > 100) {
            return ResponseEntity.badRequest().body("Discount percentage cannot exceed 100%.");
        }
        product.setFinalPrice(product.calculateFinalPrice());

        // Always require admin approval for new products
        product.setStatus("PENDING");
        Product saved = productRepository.save(product);
        return ResponseEntity.ok(saved);
    }

    // Vendor: Update product price, discount, stock, category, name
    // Whenever vendor updates product price or discount, status goes back to PENDING for Admin review
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product updated) {
        Optional<Product> optional = productRepository.findById(id);
        if (optional.isPresent()) {
            Product p = optional.get();
            p.setName(updated.getName());
            p.setCategory(updated.getCategory());
            p.setPrice(updated.getPrice());
            if (updated.getDiscountPercentage() != null) {
                if (updated.getDiscountPercentage() < 0 || updated.getDiscountPercentage() > 100) {
                    return ResponseEntity.badRequest().body("Discount percentage must be between 0% and 100%.");
                }
                p.setDiscountPercentage(updated.getDiscountPercentage());
            } else {
                p.setDiscountPercentage(0.0);
            }
            p.setFinalPrice(p.calculateFinalPrice());
            p.setStock(updated.getStock());
            p.setImageUrl(updated.getImageUrl());
            p.setBrand(updated.getBrand());
            p.setDescription(updated.getDescription());
            p.setImages(updated.getImages());
            // Changes to product pricing/discount require Admin re-approval
            p.setStatus("PENDING");
            p.setRejectionReason(null);
            Product saved = productRepository.save(p);
            return ResponseEntity.ok(saved);
        }
        return ResponseEntity.notFound().build();
    }

    // Vendor: Delete product
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return ResponseEntity.ok("Product deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }

    // Vendor: Get all products listed by a vendor
    @GetMapping("/vendor/{vendorId}")
    public List<Product> getProductsByVendor(@PathVariable Long vendorId) {
        return productRepository.findAll().stream()
                .filter(p -> p.getVendorId() != null && p.getVendorId().equals(vendorId))
                .map(this::populateRatings)
                .collect(Collectors.toList());
    }

    // Admin: Get all pending products
    @GetMapping("/pending")
    public List<Product> getPendingProducts() {
        return productRepository.findAll().stream()
                .filter(p -> "PENDING".equalsIgnoreCase(p.getStatus()))
                .map(this::populateRatings)
                .collect(Collectors.toList());
    }

    // Admin: Approve product
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveProduct(@PathVariable Long id) {
        Optional<Product> optional = productRepository.findById(id);
        if (optional.isPresent()) {
            Product p = optional.get();
            p.setStatus("APPROVED");
            productRepository.save(p);
            return ResponseEntity.ok(p);
        }
        return ResponseEntity.notFound().build();
    }

    // Admin: Reject product with optional reason
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectProduct(@PathVariable Long id, @RequestBody(required = false) Map<String, String> payload) {
        Optional<Product> optional = productRepository.findById(id);
        if (optional.isPresent()) {
            Product p = optional.get();
            p.setStatus("REJECTED");
            if (payload != null && payload.containsKey("rejectionReason")) {
                p.setRejectionReason(payload.get("rejectionReason"));
            } else {
                p.setRejectionReason("Rejected by Administrator");
            }
            productRepository.save(p);
            return ResponseEntity.ok(p);
        }
        return ResponseEntity.notFound().build();
    }

    // Reviews: Get all reviews for a product
    @GetMapping("/{id}/reviews")
    public List<Review> getReviewsForProduct(@PathVariable Long id) {
        return reviewRepository.findByProductIdOrderByIdDesc(id);
    }

    // Reviews: Submit review
    @PostMapping("/{id}/reviews")
    public ResponseEntity<?> addReview(@PathVariable Long id, @RequestBody Review review) {
        review.setProductId(id);
        if (review.getRating() < 1 || review.getRating() > 5) {
            return ResponseEntity.badRequest().body("Rating must be between 1 and 5 stars.");
        }
        Review saved = reviewRepository.save(review);
        return ResponseEntity.ok(saved);
    }

    private Product populateRatings(Product p) {
        if (p.getDiscountPercentage() == null) {
            p.setDiscountPercentage(0.0);
        }
        if (p.getFinalPrice() == null) {
            p.setFinalPrice(p.calculateFinalPrice());
        }
        List<Review> reviews = reviewRepository.findByProductIdOrderByIdDesc(p.getId());
        if (reviews.isEmpty()) {
            p.setAverageRating(0.0);
            p.setReviewCount(0);
        } else {
            double sum = 0;
            for (Review r : reviews) {
                sum += r.getRating();
            }
            p.setAverageRating(Math.round((sum / reviews.size()) * 10.0) / 10.0);
            p.setReviewCount(reviews.size());
        }

        // Populate Vendor Details
        if (p.getVendorId() != null) {
            Optional<com.shopstack.backend.model.User> vendorOpt = userRepository.findById(p.getVendorId());
            if (vendorOpt.isPresent()) {
                com.shopstack.backend.model.User v = vendorOpt.get();
                p.setVendorName(v.getFullName());
                p.setVendorEmail(v.getEmail());
                p.setVendorPhone(v.getPhone());
                p.setVendorCode(v.getVendorCode());
                p.setVendorAddress(v.getAddress());
            }
        }

        return p;
    }

    @PutMapping("/reviews/{reviewId}")
    public ResponseEntity<?> updateReview(@PathVariable Long reviewId, @RequestBody Map<String, Object> payload) {
        Optional<Review> opt = reviewRepository.findById(reviewId);
        if (opt.isPresent()) {
            Review r = opt.get();
            Long userId = Long.valueOf(payload.get("userId").toString());
            if (!r.getUserId().equals(userId)) {
                return ResponseEntity.status(403).body("Error: You can only edit your own reviews!");
            }
            r.setRating(Integer.parseInt(payload.get("rating").toString()));
            r.setComment(payload.get("comment").toString());
            Review saved = reviewRepository.save(r);
            return ResponseEntity.ok(saved);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable Long reviewId, @RequestParam Long userId) {
        Optional<Review> opt = reviewRepository.findById(reviewId);
        if (opt.isPresent()) {
            Review r = opt.get();
            if (!r.getUserId().equals(userId)) {
                return ResponseEntity.status(403).body("Error: You can only delete your own reviews!");
            }
            reviewRepository.deleteById(reviewId);
            return ResponseEntity.ok("Review deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }

    // Quick stock update (does not reset status to PENDING)
    @PutMapping("/{id}/stock")
    public ResponseEntity<?> updateProductStock(@PathVariable Long id, @RequestBody Map<String, Integer> payload) {
        if (!payload.containsKey("stock")) {
            return ResponseEntity.badRequest().body("Stock value is required.");
        }
        Integer newStock = payload.get("stock");
        if (newStock < 0) {
            return ResponseEntity.badRequest().body("Stock cannot be negative.");
        }
        Optional<Product> optional = productRepository.findById(id);
        if (optional.isPresent()) {
            Product p = optional.get();
            p.setStock(newStock);
            Product saved = productRepository.save(p);
            return ResponseEntity.ok(saved);
        }
        return ResponseEntity.notFound().build();
    }
}