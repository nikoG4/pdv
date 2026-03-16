package com.pdv.services;

import com.pdv.models.DashboardConfig;
import com.pdv.models.User;
import com.pdv.repositories.DashboardConfigRepository;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class DashboardConfigService extends BaseService<DashboardConfig> {

    private static final String DEFAULT_CONFIG_JSON = """
            {
              "version": 2,
              "widgets": [
                { "id": "sales-today", "size": "compact", "visible": true, "order": 0 },
                { "id": "sales-month", "size": "compact", "visible": true, "order": 1 },
                { "id": "total-products", "size": "compact", "visible": true, "order": 2 },
                { "id": "low-stock", "size": "compact", "visible": true, "order": 3 },
                { "id": "sales-week-daily", "size": "wide", "visible": true, "order": 4 },
                { "id": "top-products", "size": "wide", "visible": true, "order": 5 }
              ]
            }
            """;

    private final DashboardConfigRepository dashboardConfigRepository;

    public DashboardConfigService(DashboardConfigRepository dashboardConfigRepository) {
        this.dashboardConfigRepository = dashboardConfigRepository;
        this.repository = dashboardConfigRepository;
    }

    public Optional<DashboardConfig> findByUser(User user) {
        return dashboardConfigRepository.findByUserIdAndDeletedAtIsNull(user.getId());
    }

    public DashboardConfig getOrCreateDefault(User user) {
        return dashboardConfigRepository.findByUserIdAndDeletedAtIsNull(user.getId())
                .orElseGet(() -> createDefaultConfig(user));
    }

    public DashboardConfig saveConfig(User user, String configJson) {
        Optional<DashboardConfig> existing = dashboardConfigRepository.findByUserIdAndDeletedAtIsNull(user.getId());

        DashboardConfig config = existing.orElseGet(() -> {
            DashboardConfig newConfig = new DashboardConfig();
            newConfig.setUser(user);
            return newConfig;
        });

        config.setConfigJson(isBlank(configJson) ? getDefaultConfigJson() : configJson);
        return dashboardConfigRepository.save(config);
    }

    private DashboardConfig createDefaultConfig(User user) {
        DashboardConfig config = new DashboardConfig();
        config.setUser(user);
        config.setConfigJson(getDefaultConfigJson());
        return dashboardConfigRepository.save(config);
    }

    private String getDefaultConfigJson() {
        return DEFAULT_CONFIG_JSON;
    }

    @Override
    public DashboardConfig update(DashboardConfig config, Long id) {
        DashboardConfig existing = dashboardConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("DashboardConfig not found"));

        existing.setConfigJson(isBlank(config.getConfigJson()) ? getDefaultConfigJson() : config.getConfigJson());
        return dashboardConfigRepository.save(existing);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
