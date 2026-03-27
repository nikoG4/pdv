package com.pdv.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdv.models.AIProviderConfig;
import com.pdv.requests.InvoiceDTO;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.Base64;

@Service
public class GenericAIProvider implements AIProvider {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public InvoiceDTO parseInvoice(MultipartFile file, List<String> products, List<String> categories, AIProviderConfig config) {
        try {
            String base64Image = Base64.getEncoder().encodeToString(file.getBytes());
            
            String prompt = config.getCustomPrompt();
            if (prompt == null || prompt.isEmpty()) {
                prompt = String.format(
                    "Actúa como un experto en extracción de datos de facturas. " +
                    "Extrae los datos en formato JSON. Productos existentes: %s. Categorías existentes: %s. " +
                    "Responde con este esquema: {invoiceNumber, date, supplierName, total, items: [{description, quantity, price, subtotal, categoryName, productId, categoryId, confidence}]}. " +
                    "Si el producto existe en la lista, pon su nombre en description. Si no, sugiere uno. " +
                    "Importante: Responde SOLO el JSON, sin markdown.",
                    products.toString(), categories.toString()
                );
            }

            // Prepare Request Body
            Map<String, Object> requestBody;
            if (config.getRequestTemplate() != null && !config.getRequestTemplate().isEmpty()) {
                // For advanced users, we could use a template engine, but here we just replace simple placeholders
                String template = config.getRequestTemplate()
                    .replace("{{prompt}}", prompt)
                    .replace("{{model}}", config.getModel())
                    .replace("{{image}}", base64Image)
                    .replace("{{contentType}}", file.getContentType());
                
                @SuppressWarnings("unchecked")
                Map<String, Object> tempMap = objectMapper.readValue(template, Map.class);
                requestBody = tempMap;
            } else {
                // Default OpenAI compatible format
                requestBody = new HashMap<>();
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
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(config.getApiKey());

            // Add extra headers if present
            if (config.getExtraHeaders() != null && !config.getExtraHeaders().isEmpty()) {
                @SuppressWarnings("unchecked")
                Map<String, String> extra = objectMapper.readValue(config.getExtraHeaders(), Map.class);
                extra.forEach(headers::add);
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String url = config.getBaseUrl();
            if (url == null || url.isEmpty()) {
                // Default to OpenAI if not set
                url = "https://api.openai.com/v1/chat/completions";
            }

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            System.out.println("AI RESPONSE STATUS: " + response.getStatusCode());
            
            if (response.getStatusCode() == HttpStatus.OK) {
                String responseBody = response.getBody();
                System.out.println("AI RESPONSE BODY: " + responseBody);
                JsonNode rootNode = objectMapper.readTree(responseBody);
                
                // Navigate to content using responsePath (e.g. "choices[0].message.content")
                String path = config.getResponsePath();
                if (path == null || path.isEmpty()) path = "choices[0].message.content";
                
                JsonNode contentNode = rootNode;
                String[] pathSegments = path.split("\\.|(\\[)|(\\])");
                for (String segment : pathSegments) {
                    if (segment == null || segment.isEmpty()) continue;
                    if (Character.isDigit(segment.charAt(0))) {
                        contentNode = contentNode.get(Integer.parseInt(segment));
                    } else {
                        contentNode = contentNode.get(segment);
                    }
                    if (contentNode == null) {
                        System.out.println("FAILED TO NAVIGATE TO SEGMENT: " + segment);
                        break;
                    }
                }

                if (contentNode != null) {
                    String contentResult = contentNode.asText();
                    System.out.println("EXTRACTED CONTENT: " + contentResult);
                    // Clean markdown if present
                    contentResult = contentResult.replace("```json", "").replace("```", "").trim();
                    return objectMapper.readValue(contentResult, InvoiceDTO.class);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Error en GenericAIProvider: " + e.getMessage(), e);
        }
        return null;
    }

    @Override
    public Map<String, Object> test(AIProviderConfig config) {
        Map<String, Object> result = new HashMap<>();
        try {
            String prompt = "Responde exactamente con la palabra 'Punto de Venta OK' si recibes este mensaje.";
            String base64Image = "R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs="; // 1x1 black gif
            
            Map<String, Object> requestBody;
            if (config.getRequestTemplate() != null && !config.getRequestTemplate().isEmpty()) {
                String template = config.getRequestTemplate()
                    .replace("{{prompt}}", prompt)
                    .replace("{{model}}", config.getModel())
                    .replace("{{image}}", base64Image)
                    .replace("{{contentType}}", "image/gif");
                
                @SuppressWarnings("unchecked")
                Map<String, Object> tempMap = objectMapper.readValue(template, Map.class);
                requestBody = tempMap;
            } else {
                requestBody = new HashMap<>();
                requestBody.put("model", config.getModel());
                List<Map<String, Object>> messages = new ArrayList<>();
                Map<String, Object> userMessage = new HashMap<>();
                userMessage.put("role", "user");
                userMessage.put("content", prompt);
                messages.add(userMessage);
                requestBody.put("messages", messages);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(config.getApiKey());
            if (config.getExtraHeaders() != null && !config.getExtraHeaders().isEmpty()) {
                @SuppressWarnings("unchecked")
                Map<String, String> extra = objectMapper.readValue(config.getExtraHeaders(), Map.class);
                extra.forEach(headers::add);
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String url = config.getBaseUrl();
            if (url == null || url.isEmpty()) url = "https://api.openai.com/v1/chat/completions";

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            
            result.put("status", response.getStatusCode().value());
            result.put("success", response.getStatusCode() == HttpStatus.OK);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode rootNode = objectMapper.readTree(response.getBody());
                String path = config.getResponsePath();
                if (path == null || path.isEmpty()) path = "choices[0].message.content";
                
                JsonNode contentNode = rootNode;
                String[] pathSegments = path.split("\\.|(\\[)|(\\])");
                for (String segment : pathSegments) {
                    if (segment == null || segment.isEmpty()) continue;
                    if (Character.isDigit(segment.charAt(0))) {
                        contentNode = contentNode.get(Integer.parseInt(segment));
                    } else {
                        contentNode = contentNode.get(segment);
                    }
                    if (contentNode == null) break;
                }
                result.put("response", contentNode != null ? contentNode.asText() : "No se encontró el contenido en la ruta especificada");
            } else {
                result.put("response", response.getBody());
            }

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            result.put("success", false);
            result.put("status", e.getStatusCode().value());
            result.put("response", e.getResponseBodyAsString());
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) result.put("error", "API Key inválida o no autorizada");
            else if (e.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) result.put("error", "Cuota agotada o límite de velocidad excedido");
            else result.put("error", "Error de cliente: " + e.getMessage());
        } catch (Exception e) {
            result.put("success", false);
            result.put("status", 500);
            result.put("error", "Error inesperado: " + e.getMessage());
        }
        return result;
    }

    @Override
    public boolean supports(String providerType) {
        // Generic provider supports everything since it's user-configurable
        return true;
    }
}
