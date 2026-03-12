package com.pdv.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pdv.models.Log;

@Repository
public interface LogRepository extends JpaRepository<Log, Long> {
    
}
