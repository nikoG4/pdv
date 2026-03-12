package com.pdv.repositories;


import org.springframework.stereotype.Repository;

import com.pdv.models.Category;

@Repository
public interface CategoryRepository extends BaseRepository<Category, Long> {
}
