package com.pdv.repositories;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.pdv.models.Product;

@Repository
public interface ProductRepository extends BaseRepository<Product, Long> {
	@Query("SELECT p FROM Product p WHERE (LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(p.code) LIKE LOWER(CONCAT('%', :q, '%'))) AND p.deletedAt is null")
	Page<Product> findByNameOrDescriptionOrCode(@Param("q") String q, Pageable pageable);

	@Query(
		value = """
			SELECT p.*
			FROM products p
			LEFT JOIN sale_items si ON si.product_id = p.id
			LEFT JOIN products_sales ps ON ps.id = si.sale_id AND ps.deleted_at IS NULL
			WHERE p.deleted_at IS NULL
			  AND (
			    :q = ''
			    OR LOWER(COALESCE(p.name, '')) LIKE LOWER(CONCAT('%', :q, '%'))
			    OR LOWER(COALESCE(p.description, '')) LIKE LOWER(CONCAT('%', :q, '%'))
			    OR LOWER(COALESCE(p.code, '')) LIKE LOWER(CONCAT('%', :q, '%'))
			  )
			GROUP BY p.id
			ORDER BY COALESCE(SUM(CASE WHEN ps.id IS NOT NULL THEN si.quantity ELSE 0 END), 0) DESC, p.name ASC
			""",
		countQuery = """
			SELECT COUNT(*)
			FROM products p
			WHERE p.deleted_at IS NULL
			  AND (
			    :q = ''
			    OR LOWER(COALESCE(p.name, '')) LIKE LOWER(CONCAT('%', :q, '%'))
			    OR LOWER(COALESCE(p.description, '')) LIKE LOWER(CONCAT('%', :q, '%'))
			    OR LOWER(COALESCE(p.code, '')) LIKE LOWER(CONCAT('%', :q, '%'))
			  )
			""",
		nativeQuery = true
	)
	Page<Product> findRankedProducts(@Param("q") String q, Pageable pageable);

	Optional<Product> findByCode(@Param("code") String code);
}
