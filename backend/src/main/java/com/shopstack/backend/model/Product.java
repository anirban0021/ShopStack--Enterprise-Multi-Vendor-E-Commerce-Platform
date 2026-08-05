package com.shopstack.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @jakarta.persistence.Column(length = 1000)
    private String name;
    private String category;
    private double price;
    
    @jakarta.persistence.Column(columnDefinition = "TEXT")
    private String imageUrl;
    
    private Long vendorId;
    private Integer stock = 10;
    private String status = "APPROVED"; // PENDING, APPROVED, REJECTED

    private String brand;
    @jakarta.persistence.Column(columnDefinition = "TEXT")
    private String description;

    @jakarta.persistence.ElementCollection
    @jakarta.persistence.CollectionTable(name = "product_images", joinColumns = @jakarta.persistence.JoinColumn(name = "product_id"))
    @jakarta.persistence.Column(name = "image_url", columnDefinition = "TEXT")
    private List<String> images = new ArrayList<>();

    public Product() {}

    public Product(String name, String category, double price, String imageUrl) {
        this.name = name;
        this.category = category;
        this.price = price;
        this.imageUrl = imageUrl;
        this.vendorId = null;
        this.stock = 10;
        this.status = "APPROVED";
    }

    public Product(String name, String category, double price, String imageUrl, Long vendorId, Integer stock, String status) {
        this.name = name;
        this.category = category;
        this.price = price;
        this.imageUrl = imageUrl;
        this.vendorId = vendorId;
        this.stock = stock != null ? stock : 10;
        this.status = status != null ? status : "PENDING";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    @jakarta.persistence.Transient
    private Double averageRating;

    @jakarta.persistence.Transient
    private Integer reviewCount;

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
}