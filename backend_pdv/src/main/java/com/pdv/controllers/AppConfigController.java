package com.pdv.controllers;

import com.pdv.auth.CheckPermission;
import com.pdv.models.AppConfig;
import com.pdv.services.AppConfigService;
import com.pdv.services.FileStorageService;
import jakarta.validation.constraints.Positive;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/app-config")
@Validated
public class AppConfigController extends BaseController<AppConfig> {

    private final AppConfigService appConfigService;
    private final FileStorageService fileStorageService;

    public AppConfigController(AppConfigService service, FileStorageService fileStorageService) {
        super(service);
        this.appConfigService = service;
        this.fileStorageService = fileStorageService;
    }

    @Override
    @GetMapping
    @CheckPermission(action = "active")
    public org.springframework.data.domain.Page<AppConfig> getActive(
            @RequestParam(defaultValue = "0", required = false) int page,
            @RequestParam(defaultValue = "10", required = false) int size,
            @RequestParam(defaultValue = "id", required = false) String sort,
            @RequestParam(defaultValue = "ASC", required = false) String direction,
            @RequestParam(required = false) String q) {
        return super.getActive(page, size, sort, direction, q);
    }

    @GetMapping("/current")
    @CheckPermission(action = "read")
    public ResponseEntity<Map<String, String>> getCurrentConfig() {
        return ResponseEntity.ok(appConfigService.getConfig());
    }

    @PostMapping(value = "/current", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @CheckPermission(action = "update")
    public ResponseEntity<Map<String, String>> saveCurrentConfig(
            @RequestParam String appName,
            @RequestParam(required = false, defaultValue = "") String posDefaultUsers,
            @RequestParam(required = false) MultipartFile logo,
            @RequestParam(required = false) MultipartFile favicon
    ) throws IOException {
        Map<String, String> current = appConfigService.getConfig();

        String logoUrl = current.getOrDefault(AppConfigService.LOGO_URL_KEY, "");
        String faviconUrl = current.getOrDefault(AppConfigService.FAVICON_URL_KEY, "");

        if (logo != null && !logo.isEmpty()) {
            if (logoUrl != null && logoUrl.startsWith("/files/")) {
                fileStorageService.deleteFile(logoUrl.replace("/files/", ""));
            }
            String logoFileName = fileStorageService.saveFile(logo);
            logoUrl = "/files/" + logoFileName;
        }

        if (favicon != null && !favicon.isEmpty()) {
            if (faviconUrl != null && faviconUrl.startsWith("/files/")) {
                fileStorageService.deleteFile(faviconUrl.replace("/files/", ""));
            }
            String faviconFileName = fileStorageService.saveFile(favicon);
            faviconUrl = "/files/" + faviconFileName;
        }

        appConfigService.saveConfig(appName, logoUrl, faviconUrl, posDefaultUsers);
        return ResponseEntity.ok(appConfigService.getConfig());
    }

    @Override
    @GetMapping("/{id}")
    @CheckPermission(action = "read")
    public ResponseEntity<AppConfig> getById(@PathVariable @Positive Long id) {
        return super.getById(id);
    }
}
