package com.pdv.services;

import com.pdv.models.AIProviderConfig;
import com.pdv.repositories.AIProviderConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AIProviderConfigService extends BaseService<AIProviderConfig> {

    private final AIProviderConfigRepository repo;
    private final List<AIProvider> providers;

    @Autowired
    public AIProviderConfigService(AIProviderConfigRepository repo, List<AIProvider> providers) {
        this.repo = repo;
        this.providers = providers;
        this.repository = repo;
        this.columns = List.of("id", "name", "providerType", "model");
    }

    @Override
    public AIProviderConfig update(AIProviderConfig t, Long id) {
        AIProviderConfig existing = repo.findById(id).orElseThrow();
        existing.setName(t.getName());
        existing.setProviderType(t.getProviderType());
        existing.setApiKey(t.getApiKey());
        existing.setModel(t.getModel());
        existing.setPriority(t.getPriority());
        existing.setEnabled(t.getEnabled());
        existing.setBaseUrl(t.getBaseUrl());
        existing.setCustomPrompt(t.getCustomPrompt());
        existing.setRequestTemplate(t.getRequestTemplate());
        existing.setResponsePath(t.getResponsePath());
        existing.setExtraHeaders(t.getExtraHeaders());
        return repo.save(existing);
    }

    public List<AIProviderConfig> getEnabledProviders() {
        return repo.findByEnabledOrderByPriorityAsc(true);
    }

    public java.util.Map<String, Object> testProvider(Long id) {
        AIProviderConfig config = repo.findById(id).orElseThrow(() -> new RuntimeException("Config no encontrada"));
        AIProvider provider = providers.stream()
                .filter(p -> p.supports(config.getProviderType()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No hay proveedor que soporte: " + config.getProviderType()));
        
        return provider.test(config);
    }
}
