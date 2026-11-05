
package com.airesume;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // Signup
    public String signup(User user) {

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already registered!");
        }

        user.setPassword(
            passwordEncoder.encode(user.getPassword())
        );

        userRepository.save(user);

        return "Registration successful!";
    }

    // Login
    public String login(String email, String password) {

        User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                new RuntimeException("User not found!")
            );

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password!");
        }

        // Generate JWT token
        return jwtService.generateToken(user.getEmail());
    }
}
