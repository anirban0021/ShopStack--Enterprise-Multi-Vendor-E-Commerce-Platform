package com.shopstack.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shopstack.backend.model.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByIdDesc(Long userId);
    List<Order> findAllByOrderByIdDesc();
}
