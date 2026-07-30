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
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already registered!");
        }
        // Save user (Note: In production, hash passwords using PasswordEncoder)
        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginReq) {
        Optional<User> userOpt = userRepository.findByEmail(loginReq.getEmail());
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(loginReq.getPassword())) {
            return ResponseEntity.ok(userOpt.get());
        }
        return ResponseEntity.status(401).body("Invalid email or password!");
    }

    // Endpoint to allow customers to upgrade their account role (e.g., to VENDOR)
    @PutMapping("/customer/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        User user = userOptional.get();
        String newRole = request.get("role");
        
        if (newRole != null && (newRole.equalsIgnoreCase("VENDOR") || newRole.equalsIgnoreCase("CUSTOMER"))) {
            user.setRole(newRole.toUpperCase());
            userRepository.save(user);
            return ResponseEntity.ok(user);
        }

        return ResponseEntity.badRequest().body("Invalid role requested");
    }
}