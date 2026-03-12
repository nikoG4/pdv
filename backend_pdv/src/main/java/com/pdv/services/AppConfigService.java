package com.pdv.services;

import com.pdv.models.AppConfig;
import com.pdv.repositories.AppConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppConfigService extends BaseService<AppConfig> {

    @Autowired
    private AppConfigRepository appConfigRepository;

    public AppConfigService() {
        this.columns = List.of("appName");
    }

    public AppConfig getConfig() {
        return appConfigRepository.findFirstByDeletedAtIsNull()
                .orElseGet(() -> {
                    AppConfig defaultConfig = new AppConfig();
                    defaultConfig.setAppName("Punto de Venta");
                    return appConfigRepository.save(defaultConfig);
                });
    }

    @Override
    public AppConfig update(AppConfig config, Long id) {
        AppConfig currentConfig = appConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Configuración no encontrada"));

        currentConfig.setAppName(config.getAppName());
        currentConfig.setLogoUrl(config.getLogoUrl());
        currentConfig.setFaviconUrl(config.getFaviconUrl());
        currentConfig.setUpdatedBy(userInfoService.getCurrentUser());

        return appConfigRepository.save(currentConfig);
    }
}
