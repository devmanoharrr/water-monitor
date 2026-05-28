package com.example.authservice.service;

import com.example.authservice.model.UserAccount;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class UserStore {
    private final BCryptPasswordEncoder encoder;

    private final Map<String, UserAccount> usersByUsername = new ConcurrentHashMap<>();
    private final Map<String, String> tokensToUsername = new ConcurrentHashMap<>();

    public UserStore(BCryptPasswordEncoder encoder) {
        this.encoder = encoder;
    }

    public List<String> listUsernames() {
        return usersByUsername.keySet().stream().sorted().collect(Collectors.toList());
    }

    public Optional<UserAccount> getUser(String username) {
        return Optional.ofNullable(usersByUsername.get(username));
    }

    public void createUser(String username, String rawPassword) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("username is required");
        }
        if (rawPassword == null || rawPassword.isEmpty()) {
            throw new IllegalArgumentException("password is required");
        }
        String u = username.trim();
        if (usersByUsername.containsKey(u)) {
            throw new IllegalArgumentException("user already exists");
        }
        usersByUsername.put(u, new UserAccount(u, encoder.encode(rawPassword)));
    }

    public void deleteUser(String username) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("username is required");
        }
        String u = username.trim();
        usersByUsername.remove(u);
        tokensToUsername.entrySet().removeIf(e -> e.getValue().equals(u));
    }

    public void changePassword(String username, String newRawPassword) {
        if (newRawPassword == null || newRawPassword.isEmpty()) {
            throw new IllegalArgumentException("newPassword is required");
        }
        String u = username.trim();
        UserAccount existing = usersByUsername.get(u);
        if (existing == null) {
            throw new IllegalArgumentException("user not found");
        }
        usersByUsername.put(u, new UserAccount(u, encoder.encode(newRawPassword)));
        tokensToUsername.entrySet().removeIf(e -> e.getValue().equals(u));
    }

    public String login(String username, String rawPassword) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("username is required");
        }
        if (rawPassword == null) {
            throw new IllegalArgumentException("password is required");
        }
        String u = username.trim();
        UserAccount user = usersByUsername.get(u);
        if (user == null || !encoder.matches(rawPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("invalid credentials");
        }
        String token = UUID.randomUUID().toString();
        tokensToUsername.put(token, u);
        return token;
    }

    public Optional<String> getUsernameForToken(String token) {
        return Optional.ofNullable(tokensToUsername.get(token));
    }
}

