package com.shopstack.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderId;
    private Long userId;
    private String date;
    private double totalAmount;
    private String status; // CONFIRMED, SHIPPED, DELIVERED, CANCELLED, REFUNDED, PARTIALLY_REFUNDED

    private String paymentStatus = "PENDING"; // PENDING, PAID, FAILED, REFUNDED, PARTIALLY_REFUNDED
    private String paymentMethod; // RAZORPAY, COD, etc.
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String recipientName;
    private String recipientPhone;
    @Column(length = 1000)
    private String deliveryAddress;

    public Order() {}

    public Order(String orderId, Long userId, String date, double totalAmount, String status) {
        this.orderId = orderId;
        this.userId = userId;
        this.date = date;
        this.totalAmount = totalAmount;
        this.status = status;
        this.paymentStatus = "PENDING";
    }

    public Order(String orderId, Long userId, String date, double totalAmount, String status, 
                 String paymentMethod, String razorpayOrderId, String razorpayPaymentId, 
                 String recipientName, String recipientPhone, String deliveryAddress) {
        this.orderId = orderId;
        this.userId = userId;
        this.date = date;
        this.totalAmount = totalAmount;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.razorpayOrderId = razorpayOrderId;
        this.razorpayPaymentId = razorpayPaymentId;
        this.recipientName = recipientName;
        this.recipientPhone = recipientPhone;
        this.deliveryAddress = deliveryAddress;
        this.paymentStatus = "PAID".equalsIgnoreCase(paymentMethod) || razorpayPaymentId != null ? "PAID" : "PENDING";
    }

    public Order(String orderId, Long userId, String date, double totalAmount, String status, 
                 String paymentStatus, String paymentMethod, String razorpayOrderId, String razorpayPaymentId, 
                 String recipientName, String recipientPhone, String deliveryAddress) {
        this.orderId = orderId;
        this.userId = userId;
        this.date = date;
        this.totalAmount = totalAmount;
        this.status = status;
        this.paymentStatus = paymentStatus != null ? paymentStatus : "PENDING";
        this.paymentMethod = paymentMethod;
        this.razorpayOrderId = razorpayOrderId;
        this.razorpayPaymentId = razorpayPaymentId;
        this.recipientName = recipientName;
        this.recipientPhone = recipientPhone;
        this.deliveryAddress = deliveryAddress;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

    public String getRecipientPhone() { return recipientPhone; }
    public void setRecipientPhone(String recipientPhone) { this.recipientPhone = recipientPhone; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
}
