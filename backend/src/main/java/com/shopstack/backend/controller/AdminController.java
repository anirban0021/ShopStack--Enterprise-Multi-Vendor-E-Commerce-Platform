package com.shopstack.backend.controller;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.razorpay.RazorpayException;
import com.shopstack.backend.model.Order;
import com.shopstack.backend.model.Refund;
import com.shopstack.backend.model.Settlement;
import com.shopstack.backend.repository.OrderRepository;
import com.shopstack.backend.repository.SettlementRepository;
import com.shopstack.backend.service.PaymentService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private SettlementRepository settlementRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentService paymentService;

    /**
     * Get all vendor settlements across the platform
     */
    @GetMapping("/settlements")
    public ResponseEntity<?> getAllSettlements() {
        try {
            List<Settlement> settlements = settlementRepository.findAllByOrderByIdDesc();

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
            summary.put("totalSettlementRecords", settlements.size());

            Map<String, Object> response = new HashMap<>();
            response.put("summary", summary);
            response.put("settlements", settlements);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve settlements: " + e.getMessage());
        }
    }

    /**
     * Mark a vendor payout/settlement as SETTLED
     */
    @PutMapping("/settlements/{settlementId}/mark-settled")
    public ResponseEntity<?> markSettlementAsSettled(@PathVariable Long settlementId) {
        try {
            Optional<Settlement> settlementOpt = settlementRepository.findById(settlementId);
            if (settlementOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Settlement settlement = settlementOpt.get();
            settlement.setStatus("SETTLED");
            settlement.setSettledAt(new SimpleDateFormat("MMM dd, yyyy HH:mm").format(new Date()));
            Settlement saved = settlementRepository.save(settlement);

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update settlement: " + e.getMessage());
        }
    }

    /**
     * Admin payment status monitoring overview & metrics
     */
    @GetMapping("/payment-monitoring")
    public ResponseEntity<?> getPaymentMonitoringOverview() {
        try {
            List<Order> allOrders = orderRepository.findAllByOrderByIdDesc();

            long totalOrders = allOrders.size();
            long paidCount = allOrders.stream().filter(o -> "PAID".equalsIgnoreCase(o.getPaymentStatus())).count();
            long pendingCount = allOrders.stream().filter(o -> o.getPaymentStatus() == null || "PENDING".equalsIgnoreCase(o.getPaymentStatus()) || "REFUND_PENDING".equalsIgnoreCase(o.getPaymentStatus())).count();
            long failedCount = allOrders.stream().filter(o -> "FAILED".equalsIgnoreCase(o.getPaymentStatus())).count();
            long refundedCount = allOrders.stream().filter(o -> "REFUNDED".equalsIgnoreCase(o.getPaymentStatus()) || "PARTIALLY_REFUNDED".equalsIgnoreCase(o.getPaymentStatus())).count();

            double totalPaidVolume = allOrders.stream()
                    .filter(o -> "PAID".equalsIgnoreCase(o.getPaymentStatus()) || "REFUNDED".equalsIgnoreCase(o.getPaymentStatus()) || "PARTIALLY_REFUNDED".equalsIgnoreCase(o.getPaymentStatus()))
                    .mapToDouble(Order::getTotalAmount)
                    .sum();

            Map<String, Object> metrics = new HashMap<>();
            metrics.put("totalOrders", totalOrders);
            metrics.put("paidCount", paidCount);
            metrics.put("pendingCount", pendingCount);
            metrics.put("failedCount", failedCount);
            metrics.put("refundedCount", refundedCount);
            metrics.put("totalPaidVolume", Math.round(totalPaidVolume * 100.0) / 100.0);

            Map<String, Object> response = new HashMap<>();
            response.put("metrics", metrics);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve payment monitoring overview: " + e.getMessage());
        }
    }

    /**
     * Get all return and refund requests across the marketplace
     */
    @GetMapping("/refunds")
    public ResponseEntity<?> getAllRefunds(@RequestParam(required = false) String status) {
        try {
            List<Map<String, Object>> requests = paymentService.getAllRefundRequests(status);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch refund requests: " + e.getMessage());
        }
    }

    /**
     * Admin approves a return request after product is returned and QC inspection passes,
     * executing Razorpay test-mode refund.
     */
    @PostMapping("/refunds/{refundId}/approve")
    public ResponseEntity<?> approveRefund(@PathVariable Long refundId, @RequestBody(required = false) Map<String, String> payload) {
        try {
            String adminNotes = payload != null && payload.containsKey("adminNotes") ? payload.get("adminNotes") : "QC Passed. Refund approved.";
            Refund refund = paymentService.approveAndExecuteRefund(refundId, adminNotes);
            return ResponseEntity.ok(refund);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RazorpayException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Razorpay refund failed: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to approve refund: " + e.getMessage());
        }
    }

    /**
     * Admin rejects a return request (e.g. Ineligible / Item damaged by customer / QC failed).
     */
    @PostMapping("/refunds/{refundId}/reject")
    public ResponseEntity<?> rejectRefund(@PathVariable Long refundId, @RequestBody(required = false) Map<String, String> payload) {
        try {
            String rejectionReason = payload != null && payload.containsKey("rejectionReason") 
                    ? payload.get("rejectionReason") : "Return request rejected after inspection.";
            Refund refund = paymentService.rejectReturnRequest(refundId, rejectionReason);
            return ResponseEntity.ok(refund);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to reject refund: " + e.getMessage());
        }
    }
}
