package com.pdv.services;

import com.pdv.models.ProductSale;
import com.pdv.models.ProductSaleItem;
import com.pdv.models.User;
import com.pdv.repositories.ProductSaleRepository;
import com.pdv.services.PrinterService.PrintAlignment;
import com.pdv.services.PrinterService.PrintLine;

import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductSaleService extends BaseService<ProductSale> {

    @Autowired
    private ProductSaleRepository ProductSaleRepository;

    @Autowired
    private PrinterService printerService;

    ProductSaleService() {
        this.repository = ProductSaleRepository;
        this.columns = List.of("date", "invoiceNumber", "total");
        this.relatedEntity = "client";
        this.relatedColumns = List.of("name");
    }

    @Transactional
    @Override
    public ProductSale save(ProductSale sale) {
        User currentUser = this.userInfoService.getCurrentUser();
        sale.setCreatedBy(currentUser);

        ProductSale savedSale = this.repository.save(sale);

        String newProductSale = savedSale.toString();
        this.log("create", newProductSale, null, currentUser);

        return savedSale;
    }

    @Override
    public ProductSale update(ProductSale sale, Long id) {

        User currentUser = this.userInfoService.getCurrentUser();

        ProductSale saleFound = this.repository.findById(id)
                .orElseThrow(() -> new RuntimeException("ProductSale not found"));

        String oldProductSale = saleFound.toString();

        saleFound.setDate(sale.getDate());
        saleFound.setInvoiceNumber(sale.getInvoiceNumber());
        saleFound.setTotal(sale.getTotal());
        saleFound.setClient(sale.getClient());
        saleFound.setUpdatedBy(currentUser);

        List<ProductSaleItem> existingItems = saleFound.getItems();

        existingItems.removeIf(item -> !sale.getItems().contains(item));
        for (ProductSaleItem newItem : sale.getItems()) {
            if (existingItems.contains(newItem)) {
                ProductSaleItem existingItem = existingItems.get(existingItems.indexOf(newItem));
                existingItem.setQuantity(newItem.getQuantity());
                existingItem.setPrice(newItem.getPrice());
                existingItem.setSubtotal(newItem.getSubtotal());
            } else {
                newItem.setSale(saleFound);
                existingItems.add(newItem);
            }
        }

        ProductSale updatedSale = this.repository.save(saleFound);

        String newProductSale = updatedSale.toString();

        this.log("update", newProductSale, oldProductSale, currentUser);

        return updatedSale;
    }

    public void printSale(ProductSale sale) {
        List<PrintLine> printLines = new ArrayList<>();
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        // Formato de números
        NumberFormat integerFormat = NumberFormat.getIntegerInstance(Locale.GERMANY);
        NumberFormat decimalFormat = NumberFormat.getNumberInstance(Locale.GERMANY);
        decimalFormat.setMinimumFractionDigits(2);
        decimalFormat.setMaximumFractionDigits(2);
        
        // Encabezado del ticket
        printLines.add(new PrintLine("Comprobante de Venta #" + sale.getId() , PrintAlignment.CENTER));
        printLines.add(new PrintLine("--------------------------------", PrintAlignment.CENTER));
        printLines.add(new PrintLine("Fecha: " + sale.getDate().format(dateFormatter), PrintAlignment.LEFT));
        printLines.add(new PrintLine("Factura Nro.: " + sale.getInvoiceNumber(), PrintAlignment.LEFT));
        printLines.add(new PrintLine("Cliente: " + sale.getClient().getName(), PrintAlignment.LEFT));
        printLines.add(new PrintLine("--------------------------------", PrintAlignment.CENTER));

        // Detalle de productos
        printLines.add(new PrintLine("Cant       P.Unit       Subtotal", PrintAlignment.LEFT));
        printLines.add(new PrintLine("--------------------------------", PrintAlignment.LEFT));

        for (ProductSaleItem item : sale.getItems()) {
            String productName = item.getProduct().getName();
            double quantity = item.getQuantity();
            double unitPrice = item.getPrice();
            double total = item.getSubtotal();

 
            printLines.add(new PrintLine(productName.length() > 28 ? productName.substring(0, 28) : productName, PrintAlignment.LEFT));
            printLines.add(
                new PrintLine(
                    String.format(
                        "%-6s    %7s     %9s", 
                        decimalFormat.format(quantity), 
                        integerFormat.format((int) unitPrice), 
                        integerFormat.format((int) total)
                    ), 
                    PrintAlignment.LEFT
                )
            );
        }

        printLines.add(new PrintLine("--------------------------------", PrintAlignment.CENTER));

        // Totales
        double total = sale.getTotal();
        printLines.add(new PrintLine(String.format("TOTAL:                  %s", integerFormat.format((int) total)), PrintAlignment.LEFT));
        printLines.add(new PrintLine("--------------------------------", PrintAlignment.CENTER));
        printLines.add(new PrintLine("Sin valor fiscal", PrintAlignment.CENTER));
        printLines.add(new PrintLine("Gracias por su compra!", PrintAlignment.CENTER));
        printLines.add(new PrintLine("\n\n\n\n", PrintAlignment.LEFT)); // Espacios adicionales para el corte de papel

        // Imprimir el contenido
        this.printerService.printReceipt(printLines);
    }

}
