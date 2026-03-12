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
	Optional<Product> findByCode(@Param("code") String code);
}
