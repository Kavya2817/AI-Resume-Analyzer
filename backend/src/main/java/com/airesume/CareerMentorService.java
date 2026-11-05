package com.airesume;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.*;

@Service
public class CareerMentorService {

    private final RestClient restClient = RestClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String API_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";

    private static final int[] RETRY_DELAYS = {3000, 5000, 7000};

    public String getCareerAdvice(
            String message,
            List<CareerMentorRequest.ChatMessage> history) {

        String apiKey = System.getenv("GEMINI_API_KEY");

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                "Gemini API key is not configured."
            );
        }

        List<Map<String, Object>> contents = new ArrayList<>();

        if (history != null) {
            for (CareerMentorRequest.ChatMessage chat : history) {

                if (chat.getContent() == null ||
                    chat.getContent().isBlank()) {
                    continue;
                }

                String role = "assistant".equals(chat.getRole())
                    ? "model"
                    : "user";

                contents.add(Map.of(
                    "role", role,
                    "parts", List.of(
                        Map.of("text", chat.getContent())
                    )
                ));
            }
        }

        contents.add(Map.of(
            "role", "user",
            "parts", List.of(
                Map.of("text", message)
            )
        ));

        Map<String, Object> requestBody = Map.of(
            "systemInstruction", Map.of(
                "parts", List.of(
                    Map.of("text",
                        "You are an expert AI Career Mentor. " +
                        "Help students with career guidance, programming, " +
                        "projects, internships, placements and interviews. " +
                        "Give practical, clear and personalized advice. " +
                        "Use previous conversation messages to understand " +
                        "follow-up questions and maintain context."
                    )
                )
            ),
            "contents", contents
        );

        for (int attempt = 1; attempt <= 4; attempt++) {

            try {

                String response = restClient.post()
                    .uri(API_URL)
                    .header("x-goog-api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

                JsonNode json = objectMapper.readTree(response);

                String reply = json.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text")
                    .asText();

                if (reply.isBlank()) {
                    return "Sorry, I couldn't generate a response.";
                }

                return reply;

            } catch (RestClientResponseException e) {

                int status = e.getStatusCode().value();

                if (status != 503 && status != 429) {
                    throw new RuntimeException(
                        "Gemini API error: " +
                        e.getResponseBodyAsString(), e
                    );
                }

                if (attempt == 4) {
                    return "Gemini is temporarily busy. Please try again shortly.";
                }

                try {
                    Thread.sleep(RETRY_DELAYS[attempt - 1]);
                } catch (InterruptedException interrupted) {
                    Thread.currentThread().interrupt();
                    return "Request interrupted. Please try again.";
                }

            } catch (Exception e) {
                throw new RuntimeException(
                    "Failed to get response from Gemini: " +
                    e.getMessage(), e
                );
            }
        }

        return "Please try again later.";
    }
}