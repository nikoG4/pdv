package com.pdv.requests;


import com.pdv.models.Role;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRequest {

    private Long id;
    private String username;
    private String email;
    private String password;
    private Role role;

}

