package com.pdv.repositories;

import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.pdv.models.CashRegister;
import com.pdv.models.CashRegisterStatus;

@Repository
public interface CashRegisterRepository extends BaseRepository<CashRegister, Long> {
    Optional<CashRegister> findFirstByStatusAndDeletedAtIsNullOrderByOpeningDateDesc(CashRegisterStatus status);
    boolean existsByStatusAndDeletedAtIsNull(CashRegisterStatus status);
}
