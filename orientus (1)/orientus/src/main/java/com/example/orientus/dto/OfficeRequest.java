package com.example.orientus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OfficeRequest {
    @NotBlank(message = "Office name is required")
    private String name;

    private String city;
    private String address;
    private String phone;
    private String email;
    private String workingHours;
    private String website;
    private String facebook;
    private String instagram;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;
}
