package com.pdv.repositories;

import org.springframework.stereotype.Repository;

import com.pdv.models.CashInflow;

@Repository
public interface CashInflowRepository extends BaseRepository<CashInflow, Long> {
}
