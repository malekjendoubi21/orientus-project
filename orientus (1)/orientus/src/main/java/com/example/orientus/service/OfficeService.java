package com.example.orientus.service;

import com.example.orientus.dto.OfficeRequest;
import com.example.orientus.entity.Office;
import com.example.orientus.repository.OfficeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OfficeService {

    private final OfficeRepository officeRepository;

    /**
     * Get all offices ordered by name
     */
    public List<Office> getAllOffices() {
        return officeRepository.findAllByOrderByNameAsc();
    }

    /**
     * Get office by ID
     */
    public Office getOfficeById(Long id) {
        return officeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Office not found with id: " + id));
    }

    /**
     * Create a new office
     */
    public Office createOffice(OfficeRequest request) {
        Office office = new Office();
        mapRequestToEntity(request, office);
        office.setCreatedAt(LocalDateTime.now());
        return officeRepository.save(office);
    }

    /**
     * Update an existing office
     */
    public Office updateOffice(Long id, OfficeRequest request) {
        Office office = getOfficeById(id);
        mapRequestToEntity(request, office);
        return officeRepository.save(office);
    }

    /**
     * Delete an office
     */
    public void deleteOffice(Long id) {
        Office office = getOfficeById(id);
        officeRepository.delete(office);
    }

    /**
     * Map request DTO to entity
     */
    private void mapRequestToEntity(OfficeRequest request, Office office) {
        office.setName(request.getName());
        office.setCity(request.getCity());
        office.setAddress(request.getAddress());
        office.setPhone(request.getPhone());
        office.setEmail(request.getEmail());
        office.setWorkingHours(request.getWorkingHours());
        office.setWebsite(request.getWebsite());
        office.setFacebook(request.getFacebook());
        office.setInstagram(request.getInstagram());
        office.setLatitude(request.getLatitude());
        office.setLongitude(request.getLongitude());
    }
}
