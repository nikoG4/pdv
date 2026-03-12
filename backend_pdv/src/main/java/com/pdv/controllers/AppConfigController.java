package com.pdv.controllers;

import com.pdv.auth.CheckPermission;
import com.pdv.models.AppConfig;
import com.pdv.services.AppConfigService;
import com.pdv.services.FileStorageService;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

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

    @GetMapping("/current")
    @CheckPermission(action = "read")
    public ResponseEntity<AppConfig> getCurrentConfig() {
        return ResponseEntity.ok(appConfigService.getConfig());
    }

    @PostMapping(value = "/current", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @CheckPermission(action = "update")
    public ResponseEntity<AppConfig> saveCurrentConfig(
            @RequestParam String appName,
            @RequestParam(required = false) MultipartFile logo,
            @RequestParam(required = false) MultipartFile favicon
    ) throws IOException {

        AppConfig current = appConfigService.getConfig();

        // Procesar logo
        if (logo != null && !logo.isEmpty()) {
            // Borrar logo anterior si existe
            if (current.getLogoUrl() != null) {
                String oldFileName = current.getLogoUrl().replace("/files/", "");
                fileStorageService.deleteFile(oldFileName);
            }
            String logoFileName = fileStorageService.saveFile(logo);
            current.setLogoUrl("/files/" + logoFileName);
        }

        // Procesar favicon
        if (favicon != null && !favicon.isEmpty()) {
            // Borrar favicon anterior si existe
            if (current.getFaviconUrl() != null) {
                String oldFileName = current.getFaviconUrl().replace("/files/", "");
                fileStorageService.deleteFile(oldFileName);
            }
            String faviconFileName = fileStorageService.saveFile(favicon);
            current.setFaviconUrl("/files/" + faviconFileName);
        }

        current.setAppName(appName);

        if (current.getId() != null) {
            return ResponseEntity.ok(appConfigService.update(current, current.getId()));
        } else {
            return ResponseEntity.ok(appConfigService.save(current));
        }
    }


}
