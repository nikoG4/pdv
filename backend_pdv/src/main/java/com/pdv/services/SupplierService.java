package com.pdv.services;



import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pdv.models.Supplier;
import com.pdv.models.User;
import com.pdv.repositories.SupplierRepository;

@Service
public class SupplierService extends BaseService<Supplier> {

    @Autowired
    private SupplierRepository supplierRepository;

    public SupplierService() {
        this.repository = supplierRepository;
        this.columns = List.of("name", "contactName", "email", "phone", "address");
        
    }
    
    @Override
    public Supplier update(Supplier supplier, Long id) {
        User currentUser = userInfoService.getCurrentUser();
        Supplier currentSupplier = supplierRepository.findById(id).orElseThrow(() -> new RuntimeException("Supplier not found"));

        String oldSupplier = currentSupplier.toString();

        currentSupplier.setName(supplier.getName());
        currentSupplier.setContactName(supplier.getContactName());
        currentSupplier.setEmail(supplier.getEmail());
        currentSupplier.setPhone(supplier.getPhone());
        currentSupplier.setAddress(supplier.getAddress());
        currentSupplier.setUpdatedBy(currentUser);
        
        Supplier updatedSupplier = supplierRepository.save(currentSupplier);
        
        String newSupplier = updatedSupplier.toString();

        log("update", newSupplier, oldSupplier, currentUser);

        return updatedSupplier;
    }

}

