package com.shopstack.backend.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.backend.model.User;
import com.shopstack.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = "http://localhost:5173")
public class CustomerController {

    @Autowired
    private UserRepository userRepository;

    // Get Customer Profile Details
    @GetMapping("/{id}")
    public ResponseEntity<?> getCustomerProfile(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        }
        return ResponseEntity.notFound().build();
    }

    // Update Customer Profile Details (Phone, Address, Full Name)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCustomerProfile(@PathVariable Long id, @RequestBody User updatedData) {
        Optional<User> optionalUser = userRepository.findById(id);

        if (optionalUser.isPresent()) {
            User existingUser = optionalUser.get();
            existingUser.setFullName(updatedData.getFullName());
            existingUser.setPhone(updatedData.getPhone());
            existingUser.setAddress(updatedData.getAddress());

            User savedUser = userRepository.save(existingUser);
            return ResponseEntity.ok(savedUser);
        }

        return ResponseEntity.notFound().build();
    }
}