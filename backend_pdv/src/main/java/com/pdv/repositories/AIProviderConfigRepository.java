package com.pdv.repositories;

import com.pdv.models.AIProviderConfig;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIProviderConfigRepository extends BaseRepository<AIProviderConfig, Long> {
    List<AIProviderConfig> findByEnabledOrderByPriorityAsc(Boolean enabled);
}
