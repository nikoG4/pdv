package com.pdv.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pdv.models.Log;
import com.pdv.repositories.LogRepository;

@Service
public class LogService {

    @Autowired
    private LogRepository repository;
    
    public void save(Log log) {

        repository.save(log);

    }

}
