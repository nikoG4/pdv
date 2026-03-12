package com.pdv.repositories;

import org.springframework.stereotype.Repository;
import com.pdv.models.User;
import java.util.Optional;

@Repository
public interface UserRepository extends BaseRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
