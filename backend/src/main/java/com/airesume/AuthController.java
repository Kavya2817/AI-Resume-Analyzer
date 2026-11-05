
package com.airesume;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // Signup API
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {

        try {
            String message = authService.signup(user);

            return ResponseEntity.ok(
                Map.of("message", message)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }

    // Login API
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {

        try {
            String token = authService.login(
                request.get("email"),
                request.get("password")
            );

            return ResponseEntity.ok(
                Map.of(
                    "message", "Login successful!",
                    "token", token
                )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", e.getMessage()));
        }
    }
}