package com.airesume;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ats")
@CrossOrigin(origins = "http://localhost:5173")
public class AtsController {

    private final AtsService atsService;

    public AtsController(AtsService atsService) {
        this.atsService = atsService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeResume(
            @RequestBody AtsRequest request) {

        return ResponseEntity.ok(
                atsService.analyze(
                        request.resumeText(),
                        request.jobDescription()
                )
        );
    }
}