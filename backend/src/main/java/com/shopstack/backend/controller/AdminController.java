package com.shopstack.backend.controller;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.ArrayList;
import java.util.stream.Collectors;

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
import com.shopstack.backend.model.Product;
import com.shopstack.backend.model.User;
import com.shopstack.backend.repository.OrderRepository;
import com.shopstack.backend.repository.SettlementRepository;
import com.shopstack.backend.repository.UserRepository;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.RefundRepository;
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

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private RefundRepository refundRepository;

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

    /**
     * Get overall marketplace summary statistics
     */
    @GetMapping("/dashboard-summary")
    public ResponseEntity<?> getDashboardSummary() {
        try {
            List<Order> orders = orderRepository.findAll();
            double totalSalesVolume = 0;
            long totalOrdersCount = orders.size();
            for (Order o : orders) {
                if ("PAID".equalsIgnoreCase(o.getPaymentStatus()) || 
                    "REFUNDED".equalsIgnoreCase(o.getPaymentStatus()) || 
                    "PARTIALLY_REFUNDED".equalsIgnoreCase(o.getPaymentStatus())) {
                    totalSalesVolume += o.getTotalAmount();
                }
            }

            List<Settlement> settlements = settlementRepository.findAll();
            double totalCommission = 0;
            double totalPayouts = 0;
            for (Settlement s : settlements) {
                totalCommission += s.getCommissionAmount();
                totalPayouts += s.getNetPayoutAmount();
            }

            List<Product> products = productRepository.findAll();
            long totalProductsCount = products.size();
            long pendingProductsCount = products.stream().filter(p -> "PENDING".equalsIgnoreCase(p.getStatus())).count();
            long approvedProductsCount = products.stream().filter(p -> "APPROVED".equalsIgnoreCase(p.getStatus())).count();
            long lowStockProductsCount = products.stream().filter(p -> p.getStock() != null && p.getStock() <= 5).count();

            long totalVendorsCount = userRepository.countByRole("VENDOR");
            long totalCustomersCount = userRepository.countByRole("CUSTOMER");

            Map<String, Long> categoryDistribution = new HashMap<>();
            for (Product p : products) {
                if (p.getCategory() != null) {
                    categoryDistribution.put(p.getCategory(), categoryDistribution.getOrDefault(p.getCategory(), 0L) + 1);
                }
            }

            List<Order> recentOrders = orderRepository.findAllByOrderByIdDesc();
            if (recentOrders.size() > 5) {
                recentOrders = recentOrders.subList(0, 5);
            }

            Map<String, Object> summary = new HashMap<>();
            summary.put("totalSalesVolume", Math.round(totalSalesVolume * 100.0) / 100.0);
            summary.put("totalCommission", Math.round(totalCommission * 100.0) / 100.0);
            summary.put("totalPayouts", Math.round(totalPayouts * 100.0) / 100.0);
            summary.put("totalOrders", totalOrdersCount);
            summary.put("totalProducts", totalProductsCount);
            summary.put("pendingProducts", pendingProductsCount);
            summary.put("approvedProducts", approvedProductsCount);
            summary.put("lowStockProducts", lowStockProductsCount);
            summary.put("totalVendors", totalVendorsCount);
            summary.put("totalCustomers", totalCustomersCount);
            summary.put("categoryDistribution", categoryDistribution);
            summary.put("recentOrders", recentOrders);

            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve dashboard summary: " + e.getMessage());
        }
    }

    /**
     * Get vendor profiles with cumulative statistics
     */
    @GetMapping("/vendors")
    public ResponseEntity<?> getVendorsStats() {
        try {
            List<User> vendors = userRepository.findByRole("VENDOR");
            List<Map<String, Object>> statsList = new ArrayList<>();
            List<Product> allProducts = productRepository.findAll();
            List<Settlement> allSettlements = settlementRepository.findAll();

            for (User v : vendors) {
                List<Product> vProducts = allProducts.stream()
                        .filter(p -> v.getId().equals(p.getVendorId()))
                        .collect(Collectors.toList());

                List<Settlement> vSettlements = allSettlements.stream()
                        .filter(s -> v.getId().equals(s.getVendorId()))
                        .collect(Collectors.toList());

                double grossSales = 0;
                double commission = 0;
                double netPayout = 0;
                long pendingPayoutsCount = 0;

                for (Settlement s : vSettlements) {
                    grossSales += s.getGrossAmount();
                    commission += s.getCommissionAmount();
                    netPayout += s.getNetPayoutAmount();
                    if (!"SETTLED".equalsIgnoreCase(s.getStatus())) {
                        pendingPayoutsCount++;
                    }
                }

                Map<String, Object> vStat = new HashMap<>();
                vStat.put("id", v.getId());
                vStat.put("fullName", v.getFullName());
                vStat.put("email", v.getEmail());
                vStat.put("phone", v.getPhone());
                vStat.put("address", v.getAddress());
                vStat.put("vendorCode", v.getVendorCode());
                vStat.put("commissionRate", v.getCommissionRate());
                vStat.put("totalProducts", vProducts.size());
                vStat.put("grossSales", Math.round(grossSales * 100.0) / 100.0);
                vStat.put("commissionPaid", Math.round(commission * 100.0) / 100.0);
                vStat.put("netPayout", Math.round(netPayout * 100.0) / 100.0);
                vStat.put("pendingPayoutsCount", pendingPayoutsCount);
                vStat.put("status", "ACTIVE");

                statsList.add(vStat);
            }

            return ResponseEntity.ok(statsList);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve vendor stats: " + e.getMessage());
        }
    }

    /**
     * Get system and service health status
     */
    @GetMapping("/system-status")
    public ResponseEntity<?> getSystemStatus() {
        try {
            Runtime runtime = Runtime.getRuntime();
            double maxMem = runtime.maxMemory() / (1024.0 * 1024.0);
            double totalMem = runtime.totalMemory() / (1024.0 * 1024.0);
            double freeMem = runtime.freeMemory() / (1024.0 * 1024.0);
            double usedMem = totalMem - freeMem;

            int processors = runtime.availableProcessors();
            long uptimeMs = java.lang.management.ManagementFactory.getRuntimeMXBean().getUptime();
            long seconds = uptimeMs / 1000;
            long minutes = seconds / 60;
            long hours = minutes / 60;
            String uptimeStr = String.format("%02d:%02d:%02d", hours, minutes % 60, seconds % 60);

            long userCount = userRepository.count();
            long productCount = productRepository.count();
            long orderCount = orderRepository.count();
            long settlementCount = settlementRepository.count();
            long refundCount = refundRepository.count();

            long imageFilesCount = 0;
            long totalStorageSizeBytes = 0;
            try {
                java.io.File uploadsDir = new java.io.File("uploads");
                if (uploadsDir.exists() && uploadsDir.isDirectory()) {
                    List<java.io.File> filesList = new ArrayList<>();
                    findFilesRecursively(uploadsDir, filesList);
                    imageFilesCount = filesList.size();
                    for (java.io.File f : filesList) {
                        totalStorageSizeBytes += f.length();
                    }
                }
            } catch (Exception ex) {
                ex.printStackTrace();
            }

            Map<String, Object> statusMap = new HashMap<>();
            statusMap.put("apiStatus", "ONLINE");
            statusMap.put("dbStatus", "ONLINE");
            statusMap.put("razorpayStatus", "CONFIGURED");
            statusMap.put("uptime", uptimeStr);
            statusMap.put("processors", processors);
            statusMap.put("jvmMaxMemory", Math.round(maxMem * 10.0) / 10.0);
            statusMap.put("jvmTotalMemory", Math.round(totalMem * 10.0) / 10.0);
            statusMap.put("jvmUsedMemory", Math.round(usedMem * 10.0) / 10.0);
            statusMap.put("jvmFreeMemory", Math.round(freeMem * 10.0) / 10.0);
            statusMap.put("dbTotalUsers", userCount);
            statusMap.put("dbTotalProducts", productCount);
            statusMap.put("dbTotalOrders", orderCount);
            statusMap.put("dbTotalSettlements", settlementCount);
            statusMap.put("dbTotalRefunds", refundCount);
            statusMap.put("storageImagesCount", imageFilesCount);
            statusMap.put("storageTotalSizeMB", Math.round((totalStorageSizeBytes / (1024.0 * 1024.0)) * 100.0) / 100.0);

            return ResponseEntity.ok(statusMap);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve system status: " + e.getMessage());
        }
    }

    private void findFilesRecursively(java.io.File folder, List<java.io.File> result) {
        java.io.File[] files = folder.listFiles();
        if (files == null) return;
        for (java.io.File f : files) {
            if (f.isDirectory()) {
                findFilesRecursively(f, result);
            } else {
                result.add(f);
            }
        }
    }

    /**
     * Generate business reports structured data
     */
    @GetMapping("/reports/generate")
    public ResponseEntity<?> generateReport(@RequestParam String type) {
        try {
            List<?> records = getReportData(type);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to generate report: " + e.getMessage());
        }
    }

    /**
     * Export reports as standard CSV stream download
     */
    @GetMapping("/reports/export")
    public ResponseEntity<byte[]> exportReport(@RequestParam String type) {
        try {
            StringBuilder csvBuilder = new StringBuilder();
            String filename = "report_" + type.toLowerCase() + "_" + System.currentTimeMillis() + ".csv";

            if ("SALES".equalsIgnoreCase(type)) {
                csvBuilder.append("Order ID,Date,Recipient Name,Payment Method,Payment Status,Total Amount\n");
                List<Order> orders = orderRepository.findAllByOrderByIdDesc();
                for (Order o : orders) {
                    csvBuilder.append(String.format("%s,%s,%s,%s,%s,%.2f\n",
                            escapeCsv(o.getOrderId()),
                            escapeCsv(o.getDate()),
                            escapeCsv(o.getRecipientName()),
                            escapeCsv(o.getPaymentMethod()),
                            escapeCsv(o.getPaymentStatus()),
                            o.getTotalAmount()
                    ));
                }
            } else if ("VENDORS".equalsIgnoreCase(type)) {
                csvBuilder.append("Vendor ID,Full Name,Email,Vendor Code,Products Count,Gross Sales,CommissionPaid,Net Payout\n");
                List<User> vendors = userRepository.findByRole("VENDOR");
                List<Product> allProducts = productRepository.findAll();
                List<Settlement> allSettlements = settlementRepository.findAll();
                for (User v : vendors) {
                    long productsCount = allProducts.stream().filter(p -> v.getId().equals(p.getVendorId())).count();
                    double grossSales = allSettlements.stream().filter(s -> v.getId().equals(s.getVendorId())).mapToDouble(Settlement::getGrossAmount).sum();
                    double commission = allSettlements.stream().filter(s -> v.getId().equals(s.getVendorId())).mapToDouble(Settlement::getCommissionAmount).sum();
                    double netPayout = allSettlements.stream().filter(s -> v.getId().equals(s.getVendorId())).mapToDouble(Settlement::getNetPayoutAmount).sum();

                    csvBuilder.append(String.format("%d,%s,%s,%s,%d,%.2f,%.2f,%.2f\n",
                            v.getId(),
                            escapeCsv(v.getFullName()),
                            escapeCsv(v.getEmail()),
                            escapeCsv(v.getVendorCode()),
                            productsCount,
                            grossSales,
                            commission,
                            netPayout
                    ));
                }
            } else if ("INVENTORY".equalsIgnoreCase(type)) {
                csvBuilder.append("Product ID,Product Name,Category,Brand,Stock,Base Price,Final Price,Status\n");
                List<Product> products = productRepository.findAll();
                for (Product p : products) {
                    csvBuilder.append(String.format("%d,%s,%s,%s,%d,%.2f,%.2f,%s\n",
                            p.getId(),
                            escapeCsv(p.getName()),
                            escapeCsv(p.getCategory()),
                            escapeCsv(p.getBrand()),
                            p.getStock(),
                            p.getPrice(),
                            p.getFinalPrice(),
                            escapeCsv(p.getStatus())
                    ));
                }
            } else if ("REFUNDS".equalsIgnoreCase(type)) {
                csvBuilder.append("Refund ID,Order ID,Amount,Reason Category,Resolution,Stage,Status,Requested At\n");
                List<Refund> refunds = refundRepository.findAllByOrderByIdDesc();
                for (Refund r : refunds) {
                    csvBuilder.append(String.format("%d,%s,%.2f,%s,%s,%s,%s,%s\n",
                            r.getId(),
                            escapeCsv(r.getOrderId()),
                            r.getAmount(),
                            escapeCsv(r.getReturnReasonCategory()),
                            escapeCsv(r.getResolutionType()),
                            escapeCsv(r.getReturnStage()),
                            escapeCsv(r.getStatus()),
                            escapeCsv(r.getRequestedAt())
                    ));
                }
            } else {
                csvBuilder.append("Error: Unsupported report type.");
            }

            byte[] csvBytes = csvBuilder.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");
            headers.setContentType(org.springframework.http.MediaType.parseMediaType("text/csv"));

            return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private List<?> getReportData(String type) {
        if ("SALES".equalsIgnoreCase(type)) {
            return orderRepository.findAllByOrderByIdDesc();
        } else if ("VENDORS".equalsIgnoreCase(type)) {
            List<User> vendors = userRepository.findByRole("VENDOR");
            List<Map<String, Object>> vStats = new ArrayList<>();
            List<Product> allProducts = productRepository.findAll();
            List<Settlement> allSettlements = settlementRepository.findAll();
            for (User v : vendors) {
                long productsCount = allProducts.stream().filter(p -> v.getId().equals(p.getVendorId())).count();
                double grossSales = allSettlements.stream().filter(s -> v.getId().equals(s.getVendorId())).mapToDouble(Settlement::getGrossAmount).sum();
                double commission = allSettlements.stream().filter(s -> v.getId().equals(s.getVendorId())).mapToDouble(Settlement::getCommissionAmount).sum();
                double netPayout = allSettlements.stream().filter(s -> v.getId().equals(s.getVendorId())).mapToDouble(Settlement::getNetPayoutAmount).sum();

                Map<String, Object> m = new HashMap<>();
                m.put("id", v.getId());
                m.put("fullName", v.getFullName());
                m.put("email", v.getEmail());
                m.put("vendorCode", v.getVendorCode());
                m.put("commissionRate", v.getCommissionRate());
                m.put("totalProducts", productsCount);
                m.put("grossSales", grossSales);
                m.put("commissionPaid", commission);
                m.put("netPayout", netPayout);
                vStats.add(m);
            }
            return vStats;
        } else if ("INVENTORY".equalsIgnoreCase(type)) {
            return productRepository.findAll();
        } else if ("REFUNDS".equalsIgnoreCase(type)) {
            return refundRepository.findAllByOrderByIdDesc();
        }
        return new ArrayList<>();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        String escaped = value.replace("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\n") || escaped.contains("\"")) {
            return "\"" + escaped + "\"";
        }
        return escaped;
    }

    /**
     * Update a vendor's custom commission rate
     */
    @PutMapping("/vendors/{vendorId}/commission-rate")
    public ResponseEntity<?> updateVendorCommissionRate(@PathVariable Long vendorId, @RequestBody Map<String, Object> payload) {
        try {
            Optional<User> vendorOpt = userRepository.findById(vendorId);
            if (vendorOpt.isEmpty() || !"VENDOR".equalsIgnoreCase(vendorOpt.get().getRole())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Vendor not found or user is not a vendor.");
            }

            Double commissionRate = null;
            if (payload.containsKey("commissionRate") && payload.get("commissionRate") != null) {
                commissionRate = Double.parseDouble(payload.get("commissionRate").toString());
                if (commissionRate < 0 || commissionRate > 100) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Commission percentage must be between 0 and 100.");
                }
            }

            User vendor = vendorOpt.get();
            vendor.setCommissionRate(commissionRate);
            userRepository.save(vendor);

            return ResponseEntity.ok(Map.of(
                "message", "Vendor commission rate updated successfully",
                "commissionRate", commissionRate != null ? commissionRate : "default"
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update commission rate: " + e.getMessage());
        }
    }
}
