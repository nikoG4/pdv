package com.pdv.repositories;


import org.springframework.stereotype.Repository;

import com.pdv.models.Supplier;

@Repository
public interface SupplierRepository extends BaseRepository<Supplier, Long> {
}
