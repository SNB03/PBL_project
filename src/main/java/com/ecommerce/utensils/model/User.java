package com.ecommerce.utensils.model;


import jakarta.persistence.*;

@Entity // Tells Spring to create a SQL table for this class
@Table(name = "users")
public class User {

    @Id // Makes this the Primary Key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increments the ID
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true) // Ensures no duplicate emails
    private String email;

    @Column(nullable = false)
    private String password;

    private String role; // "customer" or "admin"

    // Default Constructor (Required by JPA)
    public User() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}