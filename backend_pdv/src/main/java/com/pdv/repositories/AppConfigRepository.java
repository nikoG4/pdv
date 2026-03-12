package com.pdv.repositories;

import com.pdv.models.AppConfig;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppConfigRepository extends BaseRepository<AppConfig, Long> {
    Optional<AppConfig> findFirstByDeletedAtIsNull();
}
