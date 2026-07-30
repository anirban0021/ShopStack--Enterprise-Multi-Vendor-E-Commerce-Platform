package com.shopstack.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.backend.model.Product;
import com.shopstack.backend.repository.ProductRepository;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public List<Product> getAllProducts() {
        if (productRepository.count() == 0) {
            // Seed initial sample data if table is empty
            productRepository.saveAll(List.of(
                new Product("Luxury Vanity Box", "Beauty", 1499.00, "📦"),
                new Product("Wireless Headphones", "Electronics", 2999.00, "🎧"),
                new Product("Smart Watch Series 7", "Electronics", 4999.00, "⌚"),
                new Product("Designer Gift Set", "Beauty", 899.00, "🎁"),
                new Product("Silver Anklets", "Fashion", 1299.00, "✨")
            ));
        }
        return productRepository.findAll();
    }

    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String query) {
        return productRepository.findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(query, query);
    }
}