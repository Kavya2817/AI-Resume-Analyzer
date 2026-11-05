package com.airesume;

public record AtsRequest(
        String resumeText,
        String jobDescription
) {}