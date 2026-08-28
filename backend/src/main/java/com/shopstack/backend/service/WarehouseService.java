package com.shopstack.backend.service;

import com.shopstack.backend.model.Inventory;
import com.shopstack.backend.model.Product;
import com.shopstack.backend.model.Warehouse;
import com.shopstack.backend.model.WarehouseAllocation;
import com.shopstack.backend.model.OrderItem;
import com.shopstack.backend.model.Order;
import com.shopstack.backend.repository.InventoryRepository;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.WarehouseAllocationRepository;
import com.shopstack.backend.repository.WarehouseRepository;
import com.shopstack.backend.repository.OrderItemRepository;
import com.shopstack.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class WarehouseService {

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private WarehouseAllocationRepository allocationRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    @org.springframework.context.annotation.Lazy
    private PaymentService paymentService;

    /**
     * Synchronizes a product's global stock field to equal the sum of available stock across all warehouses.
     */
    public void syncProductGlobalStock(Long productId) {
        List<Inventory> inventories = inventoryRepository.findByProductId(productId);
        int totalAvailable = inventories.stream()
                .mapToInt(Inventory::getAvailableQuantity)
                .sum();
        productRepository.findById(productId).ifPresent(product -> {
            product.setStock(totalAvailable);
            productRepository.save(product);
        });
    }

    /**
     * Automatically allocates warehouse stock for all items in a confirmed order.
     */
    @Transactional
    public List<WarehouseAllocation> allocateOrder(String orderId) {
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        List<WarehouseAllocation> allocations = new ArrayList<>();

        // Release any existing allocations first to avoid duplicates
        releaseAllocations(orderId);

        for (OrderItem item : items) {
            Long productId = item.getProductId();
            int qtyToAllocate = item.getQuantity();

            // Find all active warehouses with inventory for this product
            List<Inventory> activeInventories = inventoryRepository.findByProductId(productId).stream()
                    .filter(inv -> inv.getWarehouse().isActive())
                    .collect(Collectors.toList());

            // 1. Try to find a single warehouse with enough available stock
            Optional<Inventory> singleFulfillmentWh = activeInventories.stream()
                    .filter(inv -> inv.getAvailableQuantity() >= qtyToAllocate)
                    .findFirst();

            if (singleFulfillmentWh.isPresent()) {
                Inventory inv = singleFulfillmentWh.get();
                inv.setAllocated(inv.getAllocated() + qtyToAllocate);
                inventoryRepository.save(inv);

                WarehouseAllocation alloc = new WarehouseAllocation(
                        orderId, item.getId(), productId, inv.getWarehouse(), qtyToAllocate, "ALLOCATED"
                );
                allocations.add(allocationRepository.save(alloc));
            } else {
                // 2. If no single warehouse has enough stock, split across warehouses
                int remaining = qtyToAllocate;
                
                // Sort warehouses by available stock descending to minimize splits
                activeInventories.sort((a, b) -> Integer.compare(b.getAvailableQuantity(), a.getAvailableQuantity()));

                for (Inventory inv : activeInventories) {
                    int available = inv.getAvailableQuantity();
                    if (available > 0) {
                        int allocQty = Math.min(remaining, available);
                        inv.setAllocated(inv.getAllocated() + allocQty);
                        inventoryRepository.save(inv);

                        WarehouseAllocation alloc = new WarehouseAllocation(
                                orderId, item.getId(), productId, inv.getWarehouse(), allocQty, "ALLOCATED"
                        );
                        allocations.add(allocationRepository.save(alloc));
                        remaining -= allocQty;

                        if (remaining == 0) {
                            break;
                        }
                    }
                }

                // 3. If there is still a remaining unallocated quantity, assign it to an UNALLOCATED state
                if (remaining > 0) {
                    WarehouseAllocation unalloc = new WarehouseAllocation(
                            orderId, item.getId(), productId, null, remaining, "UNALLOCATED"
                    );
                    allocations.add(allocationRepository.save(unalloc));
                }
            }
        }
        return allocations;
    }

    /**
     * Manually overrides or establishes an allocation of stock for a specific order item.
     */
    @Transactional
    public WarehouseAllocation manualAllocate(String orderId, Long orderItemId, Long warehouseId, int qty) {
        // Find the item details
        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new IllegalArgumentException("Order item not found"));

        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found"));

        // If warehouse is inactive, block allocation
        if (!warehouse.isActive()) {
            throw new IllegalStateException("Cannot allocate to an inactive warehouse.");
        }

        // Find or create inventory for this warehouse & product
        Inventory inv = inventoryRepository.findByWarehouseIdAndProductId(warehouseId, item.getProductId())
                .orElseGet(() -> {
                    Product product = productRepository.findById(item.getProductId())
                            .orElseThrow(() -> new IllegalArgumentException("Product not found"));
                    return inventoryRepository.save(new Inventory(warehouse, product, 0));
                });

        // Update inventory allocation
        inv.setAllocated(inv.getAllocated() + qty);
        inventoryRepository.save(inv);

        // Save allocation log
        WarehouseAllocation alloc = new WarehouseAllocation(
                orderId, orderItemId, item.getProductId(), warehouse, qty, "ALLOCATED"
        );
        WarehouseAllocation saved = allocationRepository.save(alloc);

        // Sync global stock representation
        syncProductGlobalStock(item.getProductId());

        return saved;
    }

    /**
     * Releases (de-allocates) stock for all allocations associated with an order (e.g. order cancelled/refunded).
     */
    @Transactional
    public void releaseAllocations(String orderId) {
        List<WarehouseAllocation> allocations = allocationRepository.findByOrderId(orderId);
        for (WarehouseAllocation alloc : allocations) {
            if (alloc.getWarehouse() != null) {
                // If it was already shipped (READY_FOR_SHIPMENT), physical quantity was already deducted
                // and allocated stock was already released. So we only release if it is in ALLOCATED, PICKED, or PACKED stage.
                if (!"READY_FOR_SHIPMENT".equalsIgnoreCase(alloc.getStatus()) 
                        && !"DELIVERED".equalsIgnoreCase(alloc.getStatus())
                        && !"SHIPPED".equalsIgnoreCase(alloc.getStatus())) {
                    Optional<Inventory> invOpt = inventoryRepository.findByWarehouseIdAndProductId(
                            alloc.getWarehouse().getId(), alloc.getProductId()
                    );
                    if (invOpt.isPresent()) {
                        Inventory inv = invOpt.get();
                        inv.setAllocated(Math.max(0, inv.getAllocated() - alloc.getQuantity()));
                        inventoryRepository.save(inv);
                        syncProductGlobalStock(alloc.getProductId());
                    }
                }
            }
            allocationRepository.delete(alloc);
        }
    }

    /**
     * Advances the fulfillment workflow status of a specific warehouse allocation.
     */
    @Transactional
    public WarehouseAllocation updateFulfillmentStatus(Long allocationId, String status, Map<String, Object> details) {
        WarehouseAllocation alloc = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new IllegalArgumentException("Allocation not found"));

        String oldStatus = alloc.getStatus();
        String newStatus = status.toUpperCase();

        if (oldStatus.equals(newStatus)) {
            return alloc;
        }

        alloc.setStatus(newStatus);
        alloc.setUpdatedAt(LocalDateTime.now());

        if ("PICKED".equals(newStatus)) {
            // Picked - identified and verified. Simply change status.
        } 
        else if ("PACKED".equals(newStatus)) {
            // Packed - verify and containerize.
            if (details != null && details.containsKey("packagingType")) {
                alloc.setPackagingType(details.get("packagingType").toString());
            }
        } 
        else if ("READY_FOR_SHIPMENT".equals(newStatus)) {
            // Ship Prep - assign logistics details and deduct physical inventory.
            if (details != null) {
                if (details.containsKey("courierPartner")) {
                    alloc.setCourierPartner(details.get("courierPartner").toString());
                }
                if (details.containsKey("trackingNumber")) {
                    alloc.setTrackingNumber(details.get("trackingNumber").toString());
                }
            }

            // Deduct physical inventory stock since the item is prepared for carrier transit
            if (alloc.getWarehouse() != null) {
                Optional<Inventory> invOpt = inventoryRepository.findByWarehouseIdAndProductId(
                        alloc.getWarehouse().getId(), alloc.getProductId()
                );
                if (invOpt.isPresent()) {
                    Inventory inv = invOpt.get();
                    inv.setQuantity(Math.max(0, inv.getQuantity() - alloc.getQuantity()));
                    inv.setAllocated(Math.max(0, inv.getAllocated() - alloc.getQuantity()));
                    inventoryRepository.save(inv);
                    
                    // Sync the product's global stock
                    syncProductGlobalStock(alloc.getProductId());
                }
            }
        }
        // Also update parent Order status to propagate to Customer Dashboard and other users
        Optional<Order> orderOpt = orderRepository.findByOrderId(alloc.getOrderId());
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            if ("PICKED".equals(newStatus)) {
                order.setStatus("PICKED");
            } else if ("PACKED".equals(newStatus)) {
                order.setStatus("PACKED");
            } else if ("READY_FOR_SHIPMENT".equals(newStatus) || "SHIPPED".equals(newStatus)) {
                order.setStatus("SHIPPED");
            } else if ("DELIVERED".equals(newStatus)) {
                order.setStatus("DELIVERED");
                // For COD, mark as paid and trigger settlements
                if ("COD".equalsIgnoreCase(order.getPaymentMethod()) && "PENDING".equalsIgnoreCase(order.getPaymentStatus())) {
                    order.setPaymentStatus("PAID");
                    List<OrderItem> items = orderItemRepository.findByOrderId(order.getOrderId());
                    paymentService.createSettlementsForOrder(order, items);
                }
            }
            orderRepository.save(order);
        }

        return allocationRepository.save(alloc);
    }

    /**
     * Computes analytics metrics for warehouse capacities, occupancy, and tracking statuses.
     */
    public Map<String, Object> getAnalytics() {
        List<Warehouse> warehouses = warehouseRepository.findAll();
        List<Inventory> inventories = inventoryRepository.findAll();
        List<WarehouseAllocation> allocations = allocationRepository.findAll();

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalWarehouses", warehouses.size());
        metrics.put("activeWarehouses", warehouses.stream().filter(Warehouse::isActive).count());

        int totalPhysicalStock = inventories.stream().mapToInt(Inventory::getQuantity).sum();
        int totalAllocatedStock = inventories.stream().mapToInt(Inventory::getAllocated).sum();
        metrics.put("totalPhysicalStock", totalPhysicalStock);
        metrics.put("totalAllocatedStock", totalAllocatedStock);
        metrics.put("totalAvailableStock", totalPhysicalStock - totalAllocatedStock);

        // Status breakdown
        Map<String, Long> statusCounts = allocations.stream()
                .collect(Collectors.groupingBy(WarehouseAllocation::getStatus, Collectors.counting()));
        metrics.put("statusBreakdown", statusCounts);

        // Warehouse capacity metrics
        List<Map<String, Object>> whDetails = warehouses.stream().map(wh -> {
            List<Inventory> whInv = inventories.stream()
                    .filter(i -> i.getWarehouse().getId().equals(wh.getId()))
                    .collect(Collectors.toList());

            int whQty = whInv.stream().mapToInt(Inventory::getQuantity).sum();
            int whAlloc = whInv.stream().mapToInt(Inventory::getAllocated).sum();

            Map<String, Object> whMap = new HashMap<>();
            whMap.put("id", wh.getId());
            whMap.put("name", wh.getName());
            whMap.put("code", wh.getCode());
            whMap.put("physicalStock", whQty);
            whMap.put("allocatedStock", whAlloc);
            whMap.put("availableStock", whQty - whAlloc);
            return whMap;
        }).collect(Collectors.toList());

        metrics.put("warehouseDetails", whDetails);
        return metrics;
    }
}
