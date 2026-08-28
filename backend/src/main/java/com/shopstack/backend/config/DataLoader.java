package com.shopstack.backend.config;

import com.shopstack.backend.model.Inventory;
import com.shopstack.backend.model.Product;
import com.shopstack.backend.model.Warehouse;
import com.shopstack.backend.repository.InventoryRepository;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        // Seed default warehouses if none exist
        if (warehouseRepository.count() == 0) {
            Warehouse whMumbai = new Warehouse("Mumbai Central Warehouse", "WH-MUM-01", "12 Industrial Area, Andheri East", "Mumbai");
            Warehouse whDelhi = new Warehouse("Delhi NCR Fulfillment Center", "WH-DEL-02", "45 Sector Road, Gurugram", "Delhi");
            Warehouse whBangalore = new Warehouse("Bangalore Logistics Hub", "WH-BLR-03", "88 Electronics City Phase 1", "Bangalore");

            whMumbai = warehouseRepository.save(whMumbai);
            whDelhi = warehouseRepository.save(whDelhi);
            whBangalore = warehouseRepository.save(whBangalore);

            System.out.println("Default warehouses seeded successfully.");

            // Distribute existing product stock into warehouse inventories
            List<Product> products = productRepository.findAll();
            for (Product product : products) {
                int totalStock = product.getStock() != null ? product.getStock() : 10;
                
                // Distribute stock: 50% to Mumbai, 30% to Delhi, 20% to Bangalore
                int mumQty = (int) Math.round(totalStock * 0.5);
                int delQty = (int) Math.round(totalStock * 0.3);
                int blrQty = Math.max(0, totalStock - (mumQty + delQty));

                if (mumQty > 0 || totalStock == 0) {
                    inventoryRepository.save(new Inventory(whMumbai, product, mumQty));
                }
                if (delQty > 0) {
                    inventoryRepository.save(new Inventory(whDelhi, product, delQty));
                }
                if (blrQty > 0) {
                    inventoryRepository.save(new Inventory(whBangalore, product, blrQty));
                }
            }
            System.out.println("Distributed product stocks into warehouse inventories successfully.");
        }
    }
}
