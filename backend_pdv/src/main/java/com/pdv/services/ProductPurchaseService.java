package com.pdv.services;

import com.pdv.models.Product;
import com.pdv.models.ProductPurchase;
import com.pdv.models.ProductPurchaseItem;
import com.pdv.models.User;
import com.pdv.repositories.ProductPurchaseRepository;

import java.time.LocalDate;
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
        purchase.setDate(resolveDate(purchase.getDate(), null));

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

        purchaseFound.setDate(resolveDate(purchase.getDate(), purchaseFound.getDate()));
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

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private ProductService productService;

    @Transactional
    public void confirmInvoice(com.pdv.requests.InvoiceDTO dto, Long supplierId) {
        com.pdv.models.Supplier supplier = null;
        if (supplierId != null) {
            supplier = new com.pdv.models.Supplier();
            supplier.setId(supplierId);
        }

        ProductPurchase purchase = new ProductPurchase();
        purchase.setDate(dto.getDate() != null ? dto.getDate() : LocalDate.now());
        purchase.setInvoiceNumber(dto.getInvoiceNumber());
        purchase.setSupplier(supplier);
        purchase.setItems(new java.util.ArrayList<>());

        for (com.pdv.requests.InvoiceItemDTO itemDto : dto.getItems()) {
            Product product = processProduct(itemDto);
            
            ProductPurchaseItem item = new ProductPurchaseItem();
            item.setProduct(product);
            item.setQuantity(itemDto.getQuantity());
            item.setPrice(itemDto.getPrice());
            item.setSubtotal(itemDto.getQuantity() * itemDto.getPrice());
            item.setPurchase(purchase);
            purchase.getItems().add(item);
        }

        this.save(purchase);
    }

    @Transactional
    public void confirmProducts(com.pdv.requests.InvoiceDTO dto) {
        for (com.pdv.requests.InvoiceItemDTO itemDto : dto.getItems()) {
            processProduct(itemDto);
        }
    }

    private Product processProduct(com.pdv.requests.InvoiceItemDTO itemDto) {
        com.pdv.models.Category category = null;
        
        // Handle Category
        if (itemDto.getCategoryId() != null) {
            category = categoryService.findById(itemDto.getCategoryId()).orElse(null);
        }
        
        if (category == null && itemDto.getCategoryName() != null && !itemDto.getCategoryName().isEmpty()) {
            // Try matching by name or create new one if flagged
            final String catName = itemDto.getCategoryName();
            category = categoryService.findAll().stream()
                    .filter(c -> c.getName() != null && c.getName().equalsIgnoreCase(catName))
                    .findFirst()
                    .orElse(null);
            
            if (category == null && Boolean.TRUE.equals(itemDto.getIsNewCategory())) {
                category = new com.pdv.models.Category();
                category.setName(catName);
                category = categoryService.save(category);
            }
        }

        // Handle Product
        Product product = null;
        if (itemDto.getProductId() != null) {
            product = productService.findById(itemDto.getProductId()).orElse(null);
        }

        if (product == null) {
            // Fallback match by name to avoid duplicates if ID was missing but name matches
            final String prodName = itemDto.getDescription();
            product = productService.findAll().stream()
                    .filter(p -> p.getName() != null && p.getName().equalsIgnoreCase(prodName))
                    .findFirst()
                    .orElse(null);
            
            if (product == null && Boolean.TRUE.equals(itemDto.getIsNewProduct())) {
                product = new Product();
                product.setName(prodName);
                product.setCategory(category);
                product.setPrice(itemDto.getPrice());
                product.setStockControl(true);
                product = productService.save(product);
            }
        }

        if (product == null) {
            throw new RuntimeException("No se pudo resolver el producto: " + itemDto.getDescription());
        }

        return product;
    }

    private LocalDate resolveDate(LocalDate requestedDate, LocalDate currentDate) {
        if (requestedDate != null) {
            return requestedDate;
        }

        if (currentDate != null) {
            return currentDate;
        }

        return LocalDate.now();
    }
}
