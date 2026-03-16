package com.pdv.repositories;

import com.pdv.models.DashboardConfig;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DashboardConfigRepository extends BaseRepository<DashboardConfig, Long> {
    Optional<DashboardConfig> findByUserId(Long userId);
}
