package com.pdv.services;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pdv.models.Category;
import com.pdv.models.User;
import com.pdv.repositories.CategoryRepository;


@Service
public class CategoryService extends BaseService<Category> {

    @Autowired
    private CategoryRepository categoryRepository;


    
    public CategoryService() {
        this.repository = categoryRepository;
        this.columns = List.of("id", "name", "description");
    }


    @Override
    public Category update(Category category, Long id) {
        User user = userInfoService.getCurrentUser();
        Category currentCategory = repository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));

        String oldData = currentCategory.toString();

        currentCategory.setName(category.getName());
        currentCategory.setDescription(category.getDescription());
        currentCategory.setUpdatedBy(userInfoService.getCurrentUser());

        Category savedCategory = repository.save(currentCategory);

        String newData = savedCategory.toString();

        log("update", newData, oldData, user);

        return savedCategory;
    }

}
