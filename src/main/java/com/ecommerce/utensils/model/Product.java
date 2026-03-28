package com.ecommerce.utensils.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Data // <-- This Lombok magic creates all getters, setters, and constructors automatically!
@Document(collection = "products")
public class Product {

    @Id
    private String id;
    private String name;
    private String category;
    private String material;
    private double price;
    private int stockQuantity;
}