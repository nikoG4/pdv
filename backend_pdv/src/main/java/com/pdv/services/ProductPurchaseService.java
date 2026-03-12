package com.pdv.services;

import com.pdv.models.ProductPurchase;
import com.pdv.models.ProductPurchaseItem;
import com.pdv.models.User;
import com.pdv.repositories.ProductPurchaseRepository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductPurchaseService extends BaseService<ProductPurchase> {

    @Autowired
    private ProductPurchaseRepository ProductpurchaseRepository;

    public ProductPurchaseService(){
        this.repository = ProductpurchaseRepository;
        this.columns = List.of("date", "invoiceNumber", "total");
        this.relatedEntity = "supplier";
        this.relatedColumns = List.of("name");

    }

    @Transactional
    @Override
    public ProductPurchase save(ProductPurchase purchase) {
        User currentUser = this.userInfoService.getCurrentUser();
        purchase.setCreatedBy(currentUser);

        ProductPurchase savedPurchase = this.repository.save(purchase);

        String newProductPurchase = savedPurchase.toString();
        this.log("create", newProductPurchase, null, currentUser);

        return savedPurchase;
    }
    
    @Transactional
    @Override
    public ProductPurchase update(ProductPurchase purchase, Long id) {

        User currentUser = this.userInfoService.getCurrentUser();

        ProductPurchase purchaseFound = this.repository.findById(purchase.getId()).orElseThrow(() -> new RuntimeException("ProductPurchase not found"));

        String oldProductPurchase = purchaseFound.toString();

        purchaseFound.setDate(purchase.getDate());
        purchaseFound.setInvoiceNumber(purchase.getInvoiceNumber());
        purchaseFound.setTotal(purchase.getTotal());
        purchaseFound.setSupplier(purchase.getSupplier());
        purchaseFound.setUpdatedBy(currentUser);

        List<ProductPurchaseItem> existingItems = purchaseFound.getItems();
        existingItems.removeIf(item -> !purchase.getItems().contains(item));
        for (ProductPurchaseItem newItem : purchase.getItems()) {
            if (existingItems.contains(newItem)) {
                ProductPurchaseItem existingItem = existingItems.get(existingItems.indexOf(newItem));
                existingItem.setQuantity(newItem.getQuantity());
                existingItem.setPrice(newItem.getPrice());
                existingItem.setSubtotal(newItem.getSubtotal());
            } else {
                newItem.setPurchase(purchaseFound);
                existingItems.add(newItem);
            }
        }
        
        ProductPurchase updatedPurchase = this.repository.save(purchaseFound);

         String newProductPurchase = updatedPurchase.toString();

         this.log("update", newProductPurchase, oldProductPurchase, currentUser);

        return updatedPurchase;
    }


}
