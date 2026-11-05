
package com.airesume;

import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class AtsService {

    private final List<String> skillList = Arrays.asList(
        "java", "python", "javascript", "react",
        "spring boot", "sql", "mysql", "html",
        "css", "node.js", "git", "rest api",
        "aws", "docker", "machine learning",
        "data structures", "algorithms",
        "mongodb", "c++", "typescript", "express",
        "django", "flask", "hibernate",
        "postgresql", "angular", "vue",
        "bootstrap", "tailwind css",
        "redis", "kubernetes", "linux"
    );

    public Map<String, Object> analyze(
            String resumeText,
            String jobDescription) {

        resumeText = resumeText == null ? "" : resumeText;
        jobDescription = jobDescription == null ? "" : jobDescription;

        String resume = resumeText.toLowerCase();
        String job = jobDescription.toLowerCase();

        // Extract required skills from job description
        List<String> requiredSkills = new ArrayList<>();

        for (String skill : skillList) {
            if (containsKeyword(job, skill)) {
                requiredSkills.add(skill);
            }
        }

        // Match skills
        List<String> matchedKeywords = new ArrayList<>();
        List<String> missingKeywords = new ArrayList<>();

        for (String skill : requiredSkills) {
            if (containsKeyword(resume, skill)) {
                matchedKeywords.add(skill);
            } else {
                missingKeywords.add(skill);
            }
        }

        double keywordScore = requiredSkills.isEmpty()
                ? 0
                : (matchedKeywords.size() * 100.0)
                / requiredSkills.size();

        // Extract resume sections
        Map<String, String> sections = extractSections(resumeText);

        int sectionCount = 0;

        for (String section : sections.values()) {
            if (!section.isBlank()) {
                sectionCount++;
            }
        }

        double sectionScore = (sectionCount * 100.0) / 4;

        // Final ATS score
        int atsScore = (int) Math.round(
                keywordScore * 0.7 + sectionScore * 0.3
        );

        // Extract resume skills
        List<String> extractedSkills = new ArrayList<>();

        for (String skill : skillList) {
            if (containsKeyword(resume, skill)) {
                extractedSkills.add(skill);
            }
        }

        // Extracted information
        Map<String, Object> extractedInformation =
                new LinkedHashMap<>();

        extractedInformation.put("skills", extractedSkills);
        extractedInformation.put(
                "education", toLines(sections.get("education")));
        extractedInformation.put(
                "experience", toLines(sections.get("experience")));
        extractedInformation.put(
                "projects", toLines(sections.get("projects")));
        extractedInformation.put(
                "certifications", toLines(sections.get("certifications")));

        // Recommended keywords
        List<String> recommendedKeywords =
                new ArrayList<>(missingKeywords);

        // Grammar suggestions
        List<Map<String, String>> grammarIssues =
                checkGrammar(resumeText);

        // Project recommendations
        List<Map<String, String>> projectRecommendations =
                recommendProjects(missingKeywords);

        // Score breakdown
        Map<String, Object> scoreBreakdown =
                new LinkedHashMap<>();

        scoreBreakdown.put(
                "technicalSkills", Math.round(keywordScore));

        scoreBreakdown.put(
                "keywordMatch", Math.round(keywordScore));

        scoreBreakdown.put(
                "projectRelevance",
                sections.get("projects").isBlank() ? 0 : 100);

        scoreBreakdown.put(
                "experience",
                sections.get("experience").isBlank() ? 0 : 100);

        scoreBreakdown.put(
                "education",
                sections.get("education").isBlank() ? 0 : 100);

        // Final response
        Map<String, Object> result = new LinkedHashMap<>();

        result.put("atsScore", atsScore);
        result.put("scoreBreakdown", scoreBreakdown);
        result.put("extractedInformation", extractedInformation);
        result.put("matchedKeywords", matchedKeywords);
        result.put("missingKeywords", missingKeywords);
        result.put("recommendedKeywords", recommendedKeywords);
        result.put("grammarIssues", grammarIssues);
        result.put("projectRecommendations", projectRecommendations);
        result.put("analysisMode", "basic");

        result.put(
                "scoreSummary",
                atsScore >= 80 ? "Strong resume match"
                : atsScore >= 60 ? "Moderate resume match"
                : "Your resume needs improvement"
        );

        result.put(
                "disclaimer",
                "This is a basic rule-based ATS estimate, not a real ATS system."
        );

        return result;
    }

    // Check keyword with word boundaries
    private boolean containsKeyword(String text, String keyword) {

        String regex = "(?i)(?<![a-z0-9])"
                + Pattern.quote(keyword)
                + "(?![a-z0-9])";

        return Pattern.compile(regex).matcher(text).find();
    }

    // Extract resume sections
    private Map<String, String> extractSections(String resumeText) {

        Map<String, StringBuilder> builders =
                new LinkedHashMap<>();

        builders.put("education", new StringBuilder());
        builders.put("experience", new StringBuilder());
        builders.put("projects", new StringBuilder());
        builders.put("certifications", new StringBuilder());

        String currentSection = "";

        String[] lines = resumeText.split("\\R");

        for (String line : lines) {

            String heading = normalizeHeading(line);
            String detectedSection = identifySection(heading);

            if (!detectedSection.isEmpty()) {
                currentSection = detectedSection.equals("stop")
                        ? ""
                        : detectedSection;
                continue;
            }

            if (!currentSection.isEmpty()) {
                builders.get(currentSection)
                        .append(line.trim())
                        .append("\n");
            }
        }

        Map<String, String> sections = new LinkedHashMap<>();

        for (String key : builders.keySet()) {
            sections.put(
                    key,
                    builders.get(key).toString().trim()
            );
        }

        return sections;
    }

    // Clean heading text
    private String normalizeHeading(String line) {

        return line.toLowerCase()
                .replaceAll("[*#_]", "")
                .replaceAll("^[\\s\\-•]+", "")
                .replaceAll("[:\\-]+$", "")
                .trim()
                .replaceAll("\\s+", " ");
    }

    // Identify section headings
    private String identifySection(String heading) {

        Set<String> educationHeadings = Set.of(
            "education",
            "educational qualifications",
            "academic qualifications",
            "academic background"
        );

        Set<String> experienceHeadings = Set.of(
            "experience",
            "work experience",
            "professional experience",
            "work history",
            "internship",
            "internships"
        );

        Set<String> projectHeadings = Set.of(
            "projects",
            "personal projects",
            "academic projects",
            "technical projects"
        );

        Set<String> certificationHeadings = Set.of(
            "certifications",
            "certificates",
            "licenses and certifications"
        );

        Set<String> otherHeadings = Set.of(
            "skills",
            "technical skills",
            "soft skills",
            "achievements",
            "awards",
            "languages",
            "interests",
            "career objective",
            "professional summary",
            "summary",
            "references"
        );

        if (educationHeadings.contains(heading)) {
            return "education";
        }

        if (experienceHeadings.contains(heading)) {
            return "experience";
        }

        if (projectHeadings.contains(heading)) {
            return "projects";
        }

        if (certificationHeadings.contains(heading)) {
            return "certifications";
        }

        if (otherHeadings.contains(heading)) {
            return "stop";
        }

        return "";
    }

    // Convert section text into a list
    private List<String> toLines(String section) {

        if (section == null || section.isBlank()) {
            return new ArrayList<>();
        }

        List<String> lines = new ArrayList<>();

        for (String line : section.split("\\R")) {

            String cleaned = line.trim()
                    .replaceAll("^[\\s•*\\-]+", "")
                    .trim();

            if (!cleaned.isEmpty()) {
                lines.add(cleaned);
            }
        }

        return lines;
    }

    // Grammar suggestions
    private List<Map<String, String>> checkGrammar(String text) {

        List<Map<String, String>> issues = new ArrayList<>();

        addGrammarIssue(text, issues,
                "responsible of",
                "responsible for",
                "Use the correct preposition.");

        addGrammarIssue(text, issues,
                "discussed about",
                "discussed",
                "The verb discussed does not need about.");

        addGrammarIssue(text, issues,
                "good in",
                "skilled in",
                "Skilled in is more suitable for describing professional abilities.");

        addGrammarIssue(text, issues,
                "team work",
                "teamwork",
                "Teamwork is normally written as one word.");

        addGrammarIssue(text, issues,
                "hardworking",
                "dedicated",
                "Dedicated can be a more professional alternative in a resume.");

        return issues;
    }

    private void addGrammarIssue(
            String text,
            List<Map<String, String>> issues,
            String original,
            String corrected,
            String explanation) {

        if (containsKeyword(text.toLowerCase(), original)) {

            Map<String, String> issue = new LinkedHashMap<>();

            issue.put("original", original);
            issue.put("corrected", corrected);
            issue.put("explanation", explanation);

            issues.add(issue);
        }
    }

    // Project recommendations
    private List<Map<String, String>> recommendProjects(
            List<String> missingKeywords) {

        Map<String, String> projectMap = new LinkedHashMap<>();

        projectMap.put("java",
                "Java Student Management System");

        projectMap.put("spring boot",
                "Spring Boot REST API Project");

        projectMap.put("react",
                "React Task Management Application");

        projectMap.put("python",
                "Python Data Analysis Project");

        projectMap.put("sql",
                "SQL Database Management Project");

        projectMap.put("mysql",
                "MySQL CRUD Application");

        projectMap.put("javascript",
                "JavaScript Interactive Web Application");

        projectMap.put("node.js",
                "Node.js Backend API Project");

        projectMap.put("mongodb",
                "MongoDB Database Project");

        projectMap.put("docker",
                "Docker Containerization Project");

        projectMap.put("aws",
                "AWS Cloud Deployment Project");

        projectMap.put("machine learning",
                "Machine Learning Prediction Project");

        projectMap.put("rest api",
                "REST API Development Project");

        projectMap.put("git",
                "Git and GitHub Collaboration Project");

        projectMap.put("django",
                "Django Job Portal Application");

        projectMap.put("flask",
                "Flask REST API Application");

        projectMap.put("hibernate",
                "Hibernate Employee Management System");

        projectMap.put("postgresql",
                "PostgreSQL Database Application");

        projectMap.put("angular",
                "Angular Dashboard Application");

        List<Map<String, String>> recommendations =
                new ArrayList<>();

        for (String skill : missingKeywords) {

            if (!projectMap.containsKey(skill)) {
                continue;
            }

            String projectName = projectMap.get(skill);

            String youtubeQuery = projectName + " tutorial";

            String youtubeUrl =
                    "https://www.youtube.com/results?search_query="
                    + URLEncoder.encode(
                            youtubeQuery,
                            StandardCharsets.UTF_8
                    );

            String githubUrl =
                    "https://github.com/search?q="
                    + URLEncoder.encode(
                            projectName,
                            StandardCharsets.UTF_8
                    )
                    + "&type=repositories";

            Map<String, String> project = new LinkedHashMap<>();

            project.put("title", projectName);

            project.put(
                    "description",
                    "Build a practical project to demonstrate your "
                    + skill + " skills."
            );

            project.put("technologies", skill);

            project.put(
                    "skillsDemonstrated",
                    skill + ", problem-solving and application development"
            );

            project.put("githubUrl", githubUrl);
            project.put("youtubeUrl", youtubeUrl);

            recommendations.add(project);

            if (recommendations.size() == 3) {
                break;
            }
        }

        return recommendations;
    }
}
