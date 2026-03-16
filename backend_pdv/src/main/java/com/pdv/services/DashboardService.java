package com.pdv.services;

import com.pdv.repositories.ProductRepository;
import com.pdv.repositories.ProductSaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private ProductSaleRepository productSaleRepository;

    @Autowired
    private ProductRepository productRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("salesToday", getSalesToday().get("value"));
        stats.put("salesMonth", getSalesMonth().get("value"));
        stats.put("totalProducts", getTotalProducts().get("value"));
        stats.put("lowStockCount", getLowStock().get("count"));
        stats.put("salesWeekDaily", getSalesWeekDaily().get("data"));
        stats.put("topProducts", getTopProducts().get("data"));
        return stats;
    }

    public Map<String, Object> getSalesToday() {
        LocalDate today = LocalDate.now();
        Double sales = productSaleRepository.sumTotalByDate(today);

        Map<String, Object> result = new HashMap<>();
        result.put("value", sales != null ? sales : 0.0);
        result.put("label", "Ventas de Hoy");
        result.put("icon", "CartIcon");
        result.put("color", "blue");
        return result;
    }

    public Map<String, Object> getSalesMonth() {
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate endOfMonth = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());
        Double sales = productSaleRepository.sumTotalByDateBetween(startOfMonth, endOfMonth);

        Map<String, Object> result = new HashMap<>();
        result.put("value", sales != null ? sales : 0.0);
        result.put("label", "Ventas del Mes");
        result.put("icon", "CurrenciesIcon");
        result.put("color", "green");
        return result;
    }

    public Map<String, Object> getTotalProducts() {
        Long count = productRepository.countActive();

        Map<String, Object> result = new HashMap<>();
        result.put("value", count != null ? count : 0);
        result.put("label", "Total Productos");
        result.put("icon", "PackageIcon");
        result.put("color", "purple");
        return result;
    }

    public Map<String, Object> getLowStock() {
        List<Map<String, Object>> products = productRepository.findLowStockProducts();

        Map<String, Object> result = new HashMap<>();
        result.put("count", products != null ? products.size() : 0);
        result.put("data", products);
        result.put("label", "Stock Bajo");
        result.put("icon", "PackageIcon");
        result.put("color", "red");
        return result;
    }

    public Map<String, Object> getSalesWeekDaily() {
        LocalDate sevenDaysAgo = LocalDate.now().minusDays(6);
        LocalDate today = LocalDate.now();
        List<Map<String, Object>> dailySales = productSaleRepository.findDailySalesBetween(sevenDaysAgo, today);

        Map<String, Object> result = new HashMap<>();
        result.put("data", dailySales);
        result.put("label", "Ventas Últimos 7 Días");
        return result;
    }

    public Map<String, Object> getTopProducts() {
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        LocalDate today = LocalDate.now();
        List<Map<String, Object>> topProducts = productSaleRepository.findTopProductsBetween(thirtyDaysAgo, today);

        Map<String, Object> result = new HashMap<>();
        result.put("data", topProducts);
        result.put("label", "Top 5 Productos");
        return result;
    }
}
