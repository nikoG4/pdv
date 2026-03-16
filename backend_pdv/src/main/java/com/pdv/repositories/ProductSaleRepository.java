package com.pdv.repositories;


import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.pdv.models.ProductSale;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Repository
public interface ProductSaleRepository extends BaseRepository<ProductSale, Long> {

    @Query("SELECT COALESCE(SUM(ps.total), 0) FROM ProductSale ps WHERE ps.date = :date AND ps.deletedAt IS NULL")
    Double sumTotalByDate(@Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(ps.total), 0) FROM ProductSale ps WHERE ps.date BETWEEN :startDate AND :endDate AND ps.deletedAt IS NULL")
    Double sumTotalByDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query(value = """
            SELECT
                ps.date as date,
                COALESCE(SUM(ps.total), 0) as total
            FROM products_sales ps
            WHERE ps.date BETWEEN :startDate AND :endDate
              AND ps.deleted_at IS NULL
            GROUP BY ps.date
            ORDER BY ps.date ASC
            """, nativeQuery = true)
    List<Map<String, Object>> findDailySalesBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query(value = """
            SELECT
                p.name as name,
                COALESCE(SUM(si.quantity), 0) as quantity,
                COALESCE(SUM(si.subtotal), 0) as total
            FROM sale_items si
            JOIN products p ON si.product_id = p.id
            JOIN products_sales ps ON si.sale_id = ps.id
            WHERE ps.date BETWEEN :startDate AND :endDate
              AND ps.deleted_at IS NULL
            GROUP BY p.id, p.name
            ORDER BY SUM(si.quantity) DESC
            LIMIT 5
            """, nativeQuery = true)
    List<Map<String, Object>> findTopProductsBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}


