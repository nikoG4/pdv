package com.pdv.controllers;

import com.pdv.auth.CheckPermission;
import com.pdv.services.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    @CheckPermission(action = "read")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }

    @GetMapping("/stats/sales-today")
    @CheckPermission(action = "read")
    public ResponseEntity<Map<String, Object>> getSalesToday() {
        return ResponseEntity.ok(dashboardService.getSalesToday());
    }

    @GetMapping("/stats/sales-month")
    @CheckPermission(action = "read")
    public ResponseEntity<Map<String, Object>> getSalesMonth() {
        return ResponseEntity.ok(dashboardService.getSalesMonth());
    }

    @GetMapping("/stats/total-products")
    @CheckPermission(action = "read")
    public ResponseEntity<Map<String, Object>> getTotalProducts() {
        return ResponseEntity.ok(dashboardService.getTotalProducts());
    }

    @GetMapping("/stats/low-stock")
    @CheckPermission(action = "read")
    public ResponseEntity<Map<String, Object>> getLowStock() {
        return ResponseEntity.ok(dashboardService.getLowStock());
    }

    @GetMapping("/stats/sales-week-daily")
    @CheckPermission(action = "read")
    public ResponseEntity<Map<String, Object>> getSalesWeekDaily() {
        return ResponseEntity.ok(dashboardService.getSalesWeekDaily());
    }

    @GetMapping("/stats/top-products")
    @CheckPermission(action = "read")
    public ResponseEntity<Map<String, Object>> getTopProducts() {
        return ResponseEntity.ok(dashboardService.getTopProducts());
    }
}
