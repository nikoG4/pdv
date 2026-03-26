package com.pdv.services;

import com.pdv.models.AIProviderConfig;
import com.pdv.models.Category;
import com.pdv.models.Product;
import com.pdv.requests.InvoiceDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InvoiceAIParserService {

    @Autowired
    private AIProviderConfigService configService;

    @Autowired
    private ProductService productService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private List<AIProvider> providers;

    public InvoiceDTO parse(MultipartFile file) {
        List<AIProviderConfig> configs = configService.getEnabledProviders();

        if (configs.isEmpty()) {
            throw new RuntimeException("No hay proveedores de IA habilitados");
        }

        List<String> products = productService.findAll().stream()
                .map((Product p) -> String.format("[%d] %s", p.getId(), p.getName()))
                .collect(Collectors.toList());

        List<String> categories = categoryService.findAll().stream()
                .map((Category c) -> String.format("[%d] %s", c.getId(), c.getName()))
                .collect(Collectors.toList());

        for (AIProviderConfig config : configs) {
            AIProvider provider = findProvider(config.getProviderType());
            if (provider != null) {
                try {
                    InvoiceDTO result = provider.parseInvoice(file, products, categories, config);
                    if (result != null) return result;
                } catch (Exception e) {
                    System.err.println("Error con proveedor " + config.getName() + ": " + e.getMessage());
                }
            }
        }

        throw new RuntimeException("Todos los proveedores de IA fallaron");
    }

    private AIProvider findProvider(String type) {
        return providers.stream()
                .filter(p -> p.supports(type))
                .findFirst()
                .orElse(null);
    }
}
