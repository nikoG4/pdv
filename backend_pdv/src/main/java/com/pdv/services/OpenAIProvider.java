package com.pdv.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdv.models.AIProviderConfig;
import com.pdv.requests.InvoiceDTO;
import com.pdv.requests.InvoiceItemDTO;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.Base64;

@Service
public class OpenAIProvider implements AIProvider {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public InvoiceDTO parseInvoice(MultipartFile file, List<String> products, List<String> categories, AIProviderConfig config) {
        try {
            String base64Image = Base64.getEncoder().encodeToString(file.getBytes());
            String prompt = String.format(
                "Actúa como un experto en extracción de datos de facturas. " +
                "Extrae los datos en formato JSON. Productos existentes: %s. Categorías existentes: %s. " +
                "Responde con este esquema: {invoiceNumber, date, supplierName, total, items: [{description, quantity, price, subtotal, categoryName, productId, categoryId, confidence}]}. " +
                "Si el producto existe en la lista, pon su nombre en description. Si no, sugiere uno. " +
                "Importante: Responde SOLO el JSON, sin markdown.",
                products.toString(), categories.toString()
            );

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", config.getModel());
            
            List<Map<String, Object>> messages = new ArrayList<>();
            Map<String, Object> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            
            List<Map<String, Object>> content = new ArrayList<>();
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("type", "text");
            textPart.put("text", prompt);
            content.add(textPart);

            Map<String, Object> imagePart = new HashMap<>();
            imagePart.put("type", "image_url");
            Map<String, String> imageUrl = new HashMap<>();
            imageUrl.put("url", "data:" + file.getContentType() + ";base64," + base64Image);
            imagePart.put("image_url", imageUrl);
            content.add(imagePart);

            userMessage.put("content", content);
            messages.add(userMessage);
            requestBody.put("messages", messages);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(config.getApiKey());

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String url = (config.getBaseUrl() != null && !config.getBaseUrl().isEmpty()) ? config.getBaseUrl() : "https://api.openai.com/v1/chat/completions";

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> body = objectMapper.readValue(response.getBody(), Map.class);
                List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
                String contentResult = (String) ((Map<String, Object>) choices.get(0).get("message")).get("content");
                
                // Clean markdown if present
                contentResult = contentResult.replaceAll("```json", "").replaceAll("```", "").trim();
                
                return objectMapper.readValue(contentResult, InvoiceDTO.class);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error en OpenAIProvider: " + e.getMessage(), e);
        }
        return null;
    }

    @Override
    public boolean supports(String providerType) {
        return "OPENAI".equalsIgnoreCase(providerType);
    }
}
