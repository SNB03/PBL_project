package com.ecommerce.utensils.controller;


import com.ecommerce.utensils.model.User;
import com.ecommerce.utensils.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") // Allows our Vite React app to connect!
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // --- SIGN UP ENDPOINT ---
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody User newUser) {
        // Check if email already exists
        if (userRepository.findByEmail(newUser.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already taken!");
        }

        // Set default role and save to MySQL
        newUser.setRole("customer");
        userRepository.save(newUser);

        return ResponseEntity.ok("User registered successfully!");
    }

    // --- LOGIN ENDPOINT ---
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginRequest) {

        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isPresent()) {
            User existingUser = userOptional.get();
            // In a production app, we would hash passwords! For learning, we compare plain text.
            if (existingUser.getPassword().equals(loginRequest.getPassword())) {
                return ResponseEntity.ok(existingUser); // Send user details back to React
            }
        }

        return ResponseEntity.status(401).body("Invalid email or password");
    }
}