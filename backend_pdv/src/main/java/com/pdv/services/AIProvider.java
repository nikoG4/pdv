package com.pdv.services;

import com.pdv.models.AIProviderConfig;
import com.pdv.requests.InvoiceDTO;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

public interface AIProvider {
    InvoiceDTO parseInvoice(MultipartFile file, List<String> products, List<String> categories, AIProviderConfig config);
    Map<String, Object> test(AIProviderConfig config);
    boolean supports(String providerType);
}
