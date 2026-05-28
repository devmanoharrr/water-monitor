package com.example.authservice.controller;

import com.example.authservice.dto.LoginRequest;
import com.example.authservice.dto.LoginResponse;
import com.example.authservice.service.UserStore;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final UserStore userStore;

    public AuthController(UserStore userStore) {
        this.userStore = userStore;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req) {
        try {
            String token = userStore.login(req.getUsername(), req.getPassword());
            return ResponseEntity.ok(new LoginResponse(token, req.getUsername()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).build();
        }
    }
}

