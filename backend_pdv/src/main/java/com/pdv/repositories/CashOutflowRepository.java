package com.pdv.repositories;

import org.springframework.stereotype.Repository;

import com.pdv.models.CashOutflow;

@Repository
public interface CashOutflowRepository extends BaseRepository<CashOutflow, Long> {
}
