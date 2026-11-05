package com.airesume;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;

import java.util.Map;

@RestController
@RequestMapping("/api/career-mentor")
@CrossOrigin(origins = "http://localhost:5173")
public class CareerMentorController {

    private final CareerMentorService careerMentorService;

    public CareerMentorController(
            CareerMentorService careerMentorService) {

        this.careerMentorService = careerMentorService;
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(
            @Valid @RequestBody CareerMentorRequest request) {

        String reply = careerMentorService.getCareerAdvice(
            request.getMessage(),
            request.getHistory()
        );

        return ResponseEntity.ok(
            Map.of("reply", reply)
        );
    }
}