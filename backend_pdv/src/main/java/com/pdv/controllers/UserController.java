package com.pdv.controllers;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.pdv.auth.CheckPermission;
import com.pdv.models.User;
import com.pdv.requests.UserRequest;
import com.pdv.services.UserService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/api/users")
public class UserController extends BaseController<User> {


    private UserService service;

    public UserController(UserService service) {
        super(service);
        this.service = service;
    }



    @PostMapping("/create-user")
    @CheckPermission(action = "create")
    public ResponseEntity<User> create(@RequestBody UserRequest userR) {

        User user = new User();
        user.setUsername(userR.getUsername());
        user.setEmail(userR.getEmail());
        user.setPassword(userR.getPassword());
        user.setRole(userR.getRole());

        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(user));
    }

    @PutMapping("/update-user/{id}")
    @CheckPermission(action = "update")
    public ResponseEntity<User> update(@RequestBody UserRequest userR, @PathVariable Long id) {
        
        User user = new User();
        user.setId(id);
        user.setUsername(userR.getUsername());
        user.setEmail(userR.getEmail());
        user.setPassword(userR.getPassword());
        user.setRole(userR.getRole());

        return ResponseEntity.ok(service.update(user, id));
       
    }


    // overriding methods
    @Override
    @PostMapping
    @CheckPermission(action = "create")
    public ResponseEntity<User> create(User t) {
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).build();
    }


    @Override
    @PutMapping("/{id}")
    @CheckPermission(action = "update")
    public ResponseEntity<User> update(@Positive Long id, @Valid User t) {
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).build();
    }


}
