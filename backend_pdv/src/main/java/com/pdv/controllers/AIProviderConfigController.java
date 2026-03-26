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

    protected AIProviderConfigController(AIProviderConfigService service) {
        super(service);
    }
}
