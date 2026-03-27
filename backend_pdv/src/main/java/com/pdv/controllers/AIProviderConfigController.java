package com.pdv.controllers;

import com.pdv.models.AIProviderConfig;
import com.pdv.services.AIProviderConfigService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai-provider-configs")
@Validated
public class AIProviderConfigController extends BaseController<AIProviderConfig> {

    private final AIProviderConfigService aiService;

    protected AIProviderConfigController(AIProviderConfigService service) {
        super(service);
        this.aiService = service;
    }

    @org.springframework.web.bind.annotation.GetMapping("/test/{id}")
    @com.pdv.auth.CheckPermission(action = "read")
    public org.springframework.http.ResponseEntity<java.util.Map<String, Object>> test(@org.springframework.web.bind.annotation.PathVariable(name = "id") Long id) {
        return org.springframework.http.ResponseEntity.ok(aiService.testProvider(id));
    }
}
