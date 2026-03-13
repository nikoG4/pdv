package com.pdv.services;

import com.pdv.models.AppConfig;
import com.pdv.models.User;
import com.pdv.repositories.AppConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AppConfigService extends BaseService<AppConfig> {

    public static final String APP_NAME_KEY = "appName";
    public static final String LOGO_URL_KEY = "logoUrl";
    public static final String FAVICON_URL_KEY = "faviconUrl";
    public static final String POS_DEFAULT_USERS_KEY = "posDefaultUsers";

    @Autowired
    private AppConfigRepository appConfigRepository;

    public AppConfigService() {
        this.columns = List.of("keyName", "value");
    }

    public Map<String, String> getConfig() {
        ensureDefaults();

        Map<String, String> config = new LinkedHashMap<>();
        config.put(APP_NAME_KEY, getValue(APP_NAME_KEY, "Punto de Venta"));
        config.put(LOGO_URL_KEY, getValue(LOGO_URL_KEY, ""));
        config.put(FAVICON_URL_KEY, getValue(FAVICON_URL_KEY, ""));
        config.put(POS_DEFAULT_USERS_KEY, getValue(POS_DEFAULT_USERS_KEY, ""));
        return config;
    }

    public void saveConfig(String appName, String logoUrl, String faviconUrl, String posDefaultUsers) {
        ensureDefaults();

        saveValue(APP_NAME_KEY, appName == null || appName.isBlank() ? "Punto de Venta" : appName);
        saveValue(LOGO_URL_KEY, logoUrl == null ? "" : logoUrl);
        saveValue(FAVICON_URL_KEY, faviconUrl == null ? "" : faviconUrl);
        saveValue(POS_DEFAULT_USERS_KEY, posDefaultUsers == null ? "" : posDefaultUsers);
    }

    public String getValue(String key, String defaultValue) {
        return appConfigRepository.findByKeyNameAndDeletedAtIsNull(key)
                .map(AppConfig::getValue)
                .orElse(defaultValue);
    }

    @Override
    public AppConfig update(AppConfig config, Long id) {
        AppConfig currentConfig = appConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Configuracion no encontrada"));

        currentConfig.setKeyName(config.getKeyName());
        currentConfig.setValue(config.getValue());
        currentConfig.setUpdatedBy(userInfoService.getCurrentUser());
        return appConfigRepository.save(currentConfig);
    }

    private void ensureDefaults() {
        ensureValue(APP_NAME_KEY, "Punto de Venta");
        ensureValue(LOGO_URL_KEY, "");
        ensureValue(FAVICON_URL_KEY, "");
        ensureValue(POS_DEFAULT_USERS_KEY, "");
    }

    private void ensureValue(String key, String defaultValue) {
        if (appConfigRepository.findByKeyNameAndDeletedAtIsNull(key).isPresent()) {
            return;
        }

        AppConfig config = new AppConfig();
        config.setKeyName(key);
        config.setValue(defaultValue);

        try {
            User currentUser = userInfoService.getCurrentUser();
            config.setCreatedBy(currentUser);
        } catch (Exception ignored) {
            // The config can be created lazily without an authenticated user.
        }

        appConfigRepository.save(config);
    }

    private void saveValue(String key, String value) {
        AppConfig config = appConfigRepository.findByKeyNameAndDeletedAtIsNull(key)
                .orElseGet(() -> {
                    AppConfig newConfig = new AppConfig();
                    newConfig.setKeyName(key);
                    return newConfig;
                });

        User currentUser = userInfoService.getCurrentUser();
        config.setValue(value);
        if (config.getId() == null) {
            config.setCreatedBy(currentUser);
        } else {
            config.setUpdatedBy(currentUser);
        }

        appConfigRepository.save(config);
    }
}
