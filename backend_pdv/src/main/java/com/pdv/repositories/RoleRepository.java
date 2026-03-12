package com.pdv.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.pdv.models.Role;

@Repository
public interface RoleRepository extends BaseRepository<Role, Long> {
    @Query("SELECT r FROM Role r LEFT JOIN FETCH r.permissions WHERE r.deletedAt IS NULL" )
    Page<Role> findAllRolesWithPermissions(Pageable pageable);
}
