package com.pdv.services;

import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;

import com.pdv.auth.UserInfoDetails;
import com.pdv.models.User;
import com.pdv.repositories.UserRepository;

import java.util.Optional;

@Service
public class UserInfoService implements UserDetailsService {

    @Autowired
    private UserRepository repository;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> userDetail = repository.findByUsername(username);

        User user = userDetail.orElseThrow(() -> new UsernameNotFoundException("User not found " + username));
        
        // Inicializar los permisos del rol
        Hibernate.initialize(user.getRole().getPermissions());

        return new UserInfoDetails(user);
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            UserInfoDetails userDetails = (UserInfoDetails) authentication.getPrincipal();
            User user = repository.findById(userDetails.getId()).orElse(null); ;
            return  user;
        }
        return null;
    }

    public User addUser(User userInfo) {
        userInfo.setPassword(encoder.encode(userInfo.getPassword()));
        return repository.save(userInfo);
    }
}
