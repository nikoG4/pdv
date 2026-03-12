package com.pdv.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.pdv.models.User;
import com.pdv.repositories.UserRepository;

@Service
public class UserService extends BaseService<User> {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    public UserService() {
        this.repository = userRepository;
        this.columns = List.of("username", "email");
        this.relatedEntity = "role";
        this.relatedColumns = List.of("name");
    }

    @Override
    public User save(User user) {
        User currentUser = userInfoService.getCurrentUser();
        user.setCreatedBy(currentUser);
        user.setPassword(encoder.encode(user.getPassword()));

        String userString = user.toString();

        log("create", userString, null, currentUser);

        return userRepository.save(user);
    }

    @Override
    public User update(User user, Long id) {
        User LogedUser = userInfoService.getCurrentUser();

        User currentUser = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        
        String oldUser = currentUser.toString();
        
        currentUser.setUsername(user.getUsername());
        currentUser.setEmail(user.getEmail());
        currentUser.setRole(user.getRole());
        currentUser.setUpdatedBy(LogedUser);
        
        if(user.getPassword() != null) {
            currentUser.setPassword(encoder.encode(user.getPassword()));
        }
        
        User updatedUser = userRepository.save(currentUser);
        
        String newUser = updatedUser.toString();

        log("update", newUser, oldUser, LogedUser);

        return userRepository.save(updatedUser);
    }

}
