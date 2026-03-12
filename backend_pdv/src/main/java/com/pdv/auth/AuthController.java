package com.pdv.auth;

import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    
    @PostMapping("login")
    public ResponseEntity<HashMap<String, Object>> login(@RequestBody AuthRequest authRequest) {

        try {

            Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword()));
            if (authentication.isAuthenticated()) {
               
                String username = authentication.getName();
                Long id = ((UserInfoDetails) authentication.getPrincipal()).getId();
                List<String> authorities = ((UserInfoDetails) authentication.getPrincipal()).getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList());
                String token = jwtService.generateToken(authRequest.getUsername());

                HashMap<String, Object> map = new HashMap<>();
                map.put("id", id);
                map.put("username", username);
                map.put("authorities", authorities);
                map.put("token", token);

                return ResponseEntity.ok().body(map);
            } else {
                return ResponseEntity.badRequest().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }

    }

}
