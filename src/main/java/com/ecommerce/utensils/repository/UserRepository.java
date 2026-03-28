package com.ecommerce.utensils.repository;


import com.ecommerce.utensils.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

// JpaRepository gives us built-in save(), findAll(), delete() methods
public interface UserRepository extends JpaRepository<User, Long> {

    // Spring Boot is incredibly smart. Just by naming this method "findByEmail",
    // it automatically generates the SQL: SELECT * FROM users WHERE email = ?
    Optional<User> findByEmail(String email);
}