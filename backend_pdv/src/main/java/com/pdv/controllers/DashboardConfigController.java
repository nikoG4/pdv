package com.pdv.controllers;

import com.pdv.auth.CheckPermission;
import com.pdv.models.DashboardConfig;
import com.pdv.models.User;
import com.pdv.services.DashboardConfigService;
import com.pdv.services.UserInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard/config")
public class DashboardConfigController {

    @Autowired
    private DashboardConfigService dashboardConfigService;

    @Autowired
    private UserInfoService userInfoService;

    @GetMapping
    @CheckPermission(entity = "Dashboard", action = "read")
    public ResponseEntity<DashboardConfig> getConfig() {
        User currentUser = userInfoService.getCurrentUser();
        DashboardConfig config = dashboardConfigService.getOrCreateDefault(currentUser);
        return ResponseEntity.ok(config);
    }

    @PostMapping
    @CheckPermission(entity = "Dashboard", action = "update")
    public ResponseEntity<DashboardConfig> saveConfig(@RequestBody Map<String, Object> configData) {
        User currentUser = userInfoService.getCurrentUser();
        String configJson = configData.get("configJson") != null ?
                configData.get("configJson").toString() : "";
        DashboardConfig config = dashboardConfigService.saveConfig(currentUser, configJson);
        return ResponseEntity.ok(config);
    }

    @DeleteMapping
    @CheckPermission(entity = "Dashboard", action = "update")
    public ResponseEntity<DashboardConfig> resetConfig() {
        User currentUser = userInfoService.getCurrentUser();
        dashboardConfigService.findByUser(currentUser).ifPresent(config -> {
            dashboardConfigService.delete(config);
        });
        DashboardConfig defaultConfig = dashboardConfigService.getOrCreateDefault(currentUser);
        return ResponseEntity.ok(defaultConfig);
    }
}
