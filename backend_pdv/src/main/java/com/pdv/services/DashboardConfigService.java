package com.pdv.services;

import com.pdv.models.DashboardConfig;
import com.pdv.models.User;
import com.pdv.repositories.DashboardConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class DashboardConfigService extends BaseService<DashboardConfig> {

    @Autowired
    private DashboardConfigRepository dashboardConfigRepository;

    public DashboardConfigService() {
        this.repository = dashboardConfigRepository;
    }

    public Optional<DashboardConfig> findByUser(User user) {
        return dashboardConfigRepository.findByUserId(user.getId());
    }

    public DashboardConfig getOrCreateDefault(User user) {
        return dashboardConfigRepository.findByUserId(user.getId())
                .orElseGet(() -> createDefaultConfig(user));
    }

    public DashboardConfig saveConfig(User user, String configJson) {
        Optional<DashboardConfig> existing = dashboardConfigRepository.findByUserId(user.getId());

        DashboardConfig config;
        if (existing.isPresent()) {
            config = existing.get();
            config.setConfigJson(configJson);
        } else {
            config = new DashboardConfig();
            config.setUser(user);
            config.setConfigJson(configJson);
        }

        return dashboardConfigRepository.save(config);
    }

    private DashboardConfig createDefaultConfig(User user) {
        DashboardConfig config = new DashboardConfig();
        config.setUser(user);
        config.setConfigJson(getDefaultConfigJson());
        return dashboardConfigRepository.save(config);
    }

    private String getDefaultConfigJson() {
        return "{\n" +
                "    \"widgets\": [\n" +
                "        {\n" +
                "            \"id\": \"widget-1\",\n" +
                "            \"type\": \"STAT_CARD\",\n" +
                "            \"title\": \"Ventas de Hoy\",\n" +
                "            \"dataSource\": \"sales-today\",\n" +
                "            \"w\": 1,\n" +
                "            \"h\": 1,\n" +
                "            \"x\": 0,\n" +
                "            \"y\": 0,\n" +
                "            \"icon\": \"CartIcon\",\n" +
                "            \"color\": \"blue\"\n" +
                "        },\n" +
                "        {\n" +
                "            \"id\": \"widget-2\",\n" +
                "            \"type\": \"STAT_CARD\",\n" +
                "            \"title\": \"Ventas del Mes\",\n" +
                "            \"dataSource\": \"sales-month\",\n" +
                "            \"w\": 1,\n" +
                "            \"h\": 1,\n" +
                "            \"x\": 1,\n" +
                "            \"y\": 0,\n" +
                "            \"icon\": \"CurrenciesIcon\",\n" +
                "            \"color\": \"green\"\n" +
                "        },\n" +
                "        {\n" +
                "            \"id\": \"widget-3\",\n" +
                "            \"type\": \"STAT_CARD\",\n" +
                "            \"title\": \"Total Productos\",\n" +
                "            \"dataSource\": \"total-products\",\n" +
                "            \"w\": 1,\n" +
                "            \"h\": 1,\n" +
                "            \"x\": 2,\n" +
                "            \"y\": 0,\n" +
                "            \"icon\": \"PackageIcon\",\n" +
                "            \"color\": \"purple\"\n" +
                "        },\n" +
                "        {\n" +
                "            \"id\": \"widget-4\",\n" +
                "            \"type\": \"STAT_CARD\",\n" +
                "            \"title\": \"Stock Bajo\",\n" +
                "            \"dataSource\": \"low-stock\",\n" +
                "            \"w\": 1,\n" +
                "            \"h\": 1,\n" +
                "            \"x\": 3,\n" +
                "            \"y\": 0,\n" +
                "            \"icon\": \"PackageIcon\",\n" +
                "            \"color\": \"red\"\n" +
                "        },\n" +
                "        {\n" +
                "            \"id\": \"widget-5\",\n" +
                "            \"type\": \"LINE_CHART\",\n" +
                "            \"title\": \"Ventas Últimos 7 Días\",\n" +
                "            \"dataSource\": \"sales-week-daily\",\n" +
                "            \"w\": 2,\n" +
                "            \"h\": 2,\n" +
                "            \"x\": 0,\n" +
                "            \"y\": 1\n" +
                "        },\n" +
                "        {\n" +
                "            \"id\": \"widget-6\",\n" +
                "            \"type\": \"BAR_CHART\",\n" +
                "            \"title\": \"Top 5 Productos\",\n" +
                "            \"dataSource\": \"top-products\",\n" +
                "            \"w\": 2,\n" +
                "            \"h\": 2,\n" +
                "            \"x\": 2,\n" +
                "            \"y\": 1\n" +
                "        }\n" +
                "    ]\n" +
                "}";
    }

    @Override
    public DashboardConfig update(DashboardConfig config, Long id) {
        DashboardConfig existing = dashboardConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("DashboardConfig not found"));

        existing.setConfigJson(config.getConfigJson());
        return dashboardConfigRepository.save(existing);
    }
}
