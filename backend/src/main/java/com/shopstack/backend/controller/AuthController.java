package com.shopstack.backend.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.backend.model.User;
import com.shopstack.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") // Allow React Frontend
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (user.getEmail() == null || user.getRole() == null) {
            return ResponseEntity.badRequest().body("Error: Email and Role are required!");
        }

        String email = user.getEmail().trim().toLowerCase();
        String role = user.getRole().toUpperCase();

        if (role.equals("ADMINISTRATOR") && !email.endsWith("@admin")) {
            return ResponseEntity.badRequest().body("Error: Administrator email must end with @admin (e.g. name@admin)");
        }
        if (role.equals("WAREHOUSE_STAFF") && !email.endsWith("@staff")) {
            return ResponseEntity.badRequest().body("Error: Warehouse Staff email must end with @staff (e.g. name@staff)");
        }
        if (role.equals("CUSTOMER") && (email.endsWith("@admin") || email.endsWith("@seller") || email.endsWith("@staff"))) {
            return ResponseEntity.badRequest().body("Error: Customer email cannot end with restricted domains (@admin, @seller, @staff)");
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already registered!");
        }

        String generatedCode = null;
        if (role.equals("VENDOR")) {
            // Generate a random 6-digit unique code
            generatedCode = String.valueOf((int)(100000 + Math.random() * 900000));
            user.setVendorCode(generatedCode);
        }

        userRepository.save(user);

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("message", "User registered successfully!");
        if (generatedCode != null) {
            response.put("vendorCode", generatedCode);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String requestedRole = request.get("role");
        String vendorCode = request.get("vendorCode");

        if (email == null || password == null || requestedRole == null) {
            return ResponseEntity.badRequest().body("Error: Email, password, and role selection are required.");
        }

        email = email.trim().toLowerCase();
        requestedRole = requestedRole.toUpperCase();

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty() || !userOpt.get().getPassword().equals(password)) {
            return ResponseEntity.status(401).body("Error: Invalid email or password!");
        }

        User user = userOpt.get();

        // Enforce role-specific login rules
        if (requestedRole.equals("VENDOR")) {
            String storedCode = user.getVendorCode();
            if (storedCode == null || storedCode.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Error: This account is not registered as a Vendor. Please register or upgrade first.");
            }
            if (vendorCode == null || !vendorCode.trim().equals(storedCode)) {
                return ResponseEntity.badRequest().body("Error: Invalid 6-digit Vendor ID.");
            }
            user.setRole("VENDOR");
        } 
        else if (requestedRole.equals("ADMINISTRATOR")) {
            if (!email.endsWith("@admin")) {
                return ResponseEntity.badRequest().body("Error: Access Denied. Administrator logins must use @admin emails.");
            }
            user.setRole("ADMINISTRATOR");
        } 
        else if (requestedRole.equals("WAREHOUSE_STAFF")) {
            if (!email.endsWith("@staff")) {
                return ResponseEntity.badRequest().body("Error: Access Denied. Warehouse Staff logins must use @staff emails.");
            }
            user.setRole("WAREHOUSE_STAFF");
        } 
        else if (requestedRole.equals("CUSTOMER")) {
            user.setRole("CUSTOMER");
        } else {
            return ResponseEntity.badRequest().body("Error: Invalid role requested.");
        }

        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    // Endpoint to allow user role switching based on strict rules matrix & 6-digit Vendor ID
    @PutMapping("/customer/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        User user = userOptional.get();
        String currentRole = user.getRole().toUpperCase();
        String newRole = request.get("role");
        if (newRole == null) {
            return ResponseEntity.badRequest().body("Error: Role is required");
        }
        newRole = newRole.toUpperCase();
        String email = user.getEmail().toLowerCase();

        // Role switching rules:
        if (currentRole.equals("CUSTOMER")) {
            if (newRole.equals("VENDOR")) {
                String existingCode = user.getVendorCode();
                if (existingCode == null || existingCode.trim().isEmpty()) {
                    // First time upgrade: Generate a new 6-digit unique code
                    String code = String.valueOf((int)(100000 + Math.random() * 900000));
                    user.setVendorCode(code);
                    user.setRole("VENDOR");
                } else {
                    // Subsequent switch: Validate the provided vendor code
                    String providedCode = request.get("vendorCode");
                    if (providedCode == null || !providedCode.trim().equals(existingCode)) {
                        return ResponseEntity.badRequest().body("Error: Invalid 6-digit Vendor ID. Switch denied.");
                    }
                    user.setRole("VENDOR");
                }
            } else if (newRole.equals("ADMINISTRATOR")) {
                if (!email.endsWith("@admin")) {
                    return ResponseEntity.badRequest().body("Error: Unauthorized. Email must end with @admin to switch to Administrator.");
                }
                user.setRole("ADMINISTRATOR");
            } else if (newRole.equals("WAREHOUSE_STAFF")) {
                if (!email.endsWith("@staff")) {
                    return ResponseEntity.badRequest().body("Error: Unauthorized. Email must end with @staff to switch to Warehouse Staff.");
                }
                user.setRole("WAREHOUSE_STAFF");
            } else {
                return ResponseEntity.badRequest().body("Error: Invalid role transition from Customer.");
            }
        } 
        else if (currentRole.equals("VENDOR")) {
            if (newRole.equals("CUSTOMER")) {
                user.setRole("CUSTOMER");
            } else {
                return ResponseEntity.badRequest().body("Error: Vendors can only switch to Customer mode.");
            }
        } 
        else if (currentRole.equals("ADMINISTRATOR")) {
            if (newRole.equals("CUSTOMER")) {
                user.setRole("CUSTOMER");
            } else {
                return ResponseEntity.badRequest().body("Error: Administrators can only switch to Customer mode.");
            }
        } 
        else if (currentRole.equals("WAREHOUSE_STAFF")) {
            if (newRole.equals("CUSTOMER")) {
                user.setRole("CUSTOMER");
            } else {
                return ResponseEntity.badRequest().body("Error: Warehouse staff can only switch to Customer mode.");
            }
        } else {
            return ResponseEntity.badRequest().body("Error: Unknown user role.");
        }

        userRepository.save(user);
        return ResponseEntity.ok(user);
    }
}