package com.pdv.services;

import java.io.ByteArrayInputStream;
import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pdv.models.CashOutflow;
import com.pdv.repositories.CashOutflowRepository;

@Service
public class CashOutflowService extends BaseService<CashOutflow> {

    @Autowired
    private CashOutflowRepository cashOutflowRepository;

    public CashOutflowService() {
        this.repository = cashOutflowRepository;
        this.columns = List.of("id", "description", "amount", "observation");
    }

    public ByteArrayInputStream getReport(HashMap<String, Object> parameters) {
        return generatePdfReport("reports/cash-outflows/cash-outflows.jasper", parameters);
    }

    @Override
    public CashOutflow update(CashOutflow cashOutflow, Long id) {
        CashOutflow currentCashOutflow = cashOutflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CashOutflow not found"));
        currentCashOutflow.setDescription(cashOutflow.getDescription());
        currentCashOutflow.setAmount(cashOutflow.getAmount());
        currentCashOutflow.setDate(cashOutflow.getDate());
        currentCashOutflow.setObservation(cashOutflow.getObservation());
        currentCashOutflow.setUpdatedBy(userInfoService.getCurrentUser());
        return cashOutflowRepository.save(currentCashOutflow);
    }

}
