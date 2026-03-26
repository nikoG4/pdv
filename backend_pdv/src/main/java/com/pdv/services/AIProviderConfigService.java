package com.pdv.services;

import com.pdv.models.AIProviderConfig;
import com.pdv.repositories.AIProviderConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AIProviderConfigService extends BaseService<AIProviderConfig> {

    private final AIProviderConfigRepository repo;

    @Autowired
    public AIProviderConfigService(AIProviderConfigRepository repo) {
        this.repo = repo;
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
        return repo.save(existing);
    }

    public List<AIProviderConfig> getEnabledProviders() {
        return repo.findByEnabledOrderByPriorityAsc(true);
    }
}
