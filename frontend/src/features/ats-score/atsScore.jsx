
import { useState } from "react";
import "./AtsScore.css";
import { validateInputs, formatScore } from "./atsUtils";
import { extractResumeText } from "./resumeParser";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function AtsScore() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setResult(null);

    const allowedExtensions = ["pdf", "docx", "txt"];
    const extension = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setError("Please upload a PDF, DOCX or TXT file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5 MB.");
      event.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const extractedText = await extractResumeText(file);

      if (!extractedText.trim()) {
        throw new Error("No readable text found in the uploaded file.");
      }

      setResumeText(extractedText);
      setFileName(file.name);

    } catch (err) {
      setError(err.message || "Unable to read this file.");
      setFileName("");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function removeFile() {
    setFileName("");
    setResumeText("");
    setResult(null);
    setError("");
  }

  async function analyzeResume() {
    const validationError = validateInputs(
      resumeText,
      jobDescription
    );

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/ats/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            resumeText,
            jobDescription,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Analysis failed. Please try again."
        );
      }

      setResult(data);

    } catch (err) {
      setError(
        err.message ||
        "Could not connect to the backend. Is Spring Boot running?"
      );
    } finally {
      setLoading(false);
    }
  }

  function clearForm() {
    setResumeText("");
    setJobDescription("");
    setFileName("");
    setResult(null);
    setError("");
  }

  const breakdown = result?.scoreBreakdown || {};
  const extracted = result?.extractedInformation || {};

  const scoreItems = [
    ["Technical skills", breakdown.technicalSkills],
    ["Keyword match", breakdown.keywordMatch],
    ["Project relevance", breakdown.projectRelevance],
    ["Experience", breakdown.experience],
    ["Education", breakdown.education],
  ];

  return (
    <main className="ats-page">

      {/* Header */}
      <header className="ats-header">
        <div>
          <p className="ats-eyebrow">AI RESUME ANALYZER</p>
          <h1>ATS Resume Analyzer</h1>
          <p className="ats-subtitle">
            Upload your resume and compare it with a job description.
          </p>
        </div>

        <span className="ats-status">Resume insights</span>
      </header>

      {/* Resume Upload */}
      <section className="ats-input-grid">

        <div className="ats-panel">
          <span className="ats-label">Your resume</span>

          <span className="ats-hint">
            Upload PDF, DOCX or TXT (maximum 5 MB)
          </span>

          <label className="ats-upload-box">
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              disabled={uploading || loading}
            />

            <span className="ats-upload-icon">↑</span>
            <strong>Choose a resume file</strong>
            <span>or click to browse your device</span>
          </label>

          {uploading && (
            <p className="ats-notice">
              Extracting resume text...
            </p>
          )}

          {fileName && (
            <div className="ats-file-info">
              <span>📄 {fileName}</span>
              <button
                type="button"
                onClick={removeFile}
                disabled={loading}
              >
                Remove
              </button>
            </div>
          )}

          <p className="ats-hint">
            You can also paste your resume below.
          </p>

          <textarea
            value={resumeText}
            onChange={(e) => {
              setResumeText(e.target.value);
              setFileName("");
              setResult(null);
            }}
            placeholder="Paste your resume here..."
            rows={10}
            disabled={uploading || loading}
          />

          <span className="ats-count">
            {resumeText.length} characters
          </span>
        </div>

        {/* Job Description */}
        <label className="ats-panel">
          <span className="ats-label">Job description</span>

          <span className="ats-hint">
            Paste the job description you're targeting.
          </span>

          <textarea
            value={jobDescription}
            onChange={(e) => {
              setJobDescription(e.target.value);
              setResult(null);
            }}
            placeholder="Paste the complete job description here..."
            rows={17}
          />

          <span className="ats-count">
            {jobDescription.length} characters
          </span>
        </label>

      </section>

      {/* Actions */}
      <div className="ats-actions">
        <button
          className="ats-primary-button"
          onClick={analyzeResume}
          disabled={loading || uploading}
        >
          {loading ? "Analyzing..." : "Analyze resume"}
        </button>

        <button
          className="ats-secondary-button"
          onClick={clearForm}
          disabled={loading || uploading}
        >
          Clear
        </button>
      </div>

      {loading && (
        <div className="ats-notice">
          Comparing your resume with the job description...
        </div>
      )}

      {error && (
        <div className="ats-error" role="alert">
          {error}
        </div>
      )}

      {/* Analysis Results */}
      {result && (
        <section className="ats-results">

          <div className="ats-results-heading">
            <div>
              <p className="ats-eyebrow">YOUR REPORT</p>
              <h2>Analysis results</h2>
            </div>

            <span className="ats-mode">
              {result.analysisMode === "AI"
                ? "AI-assisted analysis"
                : "Basic analysis"}
            </span>
          </div>

          {/* Score */}
          <div className="ats-overview-grid">

            <article className="ats-card ats-score-card">
              <p className="ats-card-label">
                Estimated ATS match
              </p>

              <div className="ats-score-number">
                {formatScore(result.atsScore)}
                <small>/100</small>
              </div>

              <div className="ats-progress">
                <span
                  style={{
                    width: `${formatScore(result.atsScore)}%`,
                  }}
                />
              </div>

              <p className="ats-muted">
                {result.scoreSummary}
              </p>
            </article>

            <article className="ats-card">
              <h3>Score breakdown</h3>

              {scoreItems.map(([label, score]) => {
                const value = formatScore(score ?? 0);

                return (
                  <div className="ats-breakdown-row" key={label}>
                    <div>
                      <span>{label}</span>
                      <strong>{value}/100</strong>
                    </div>

                    <div className="ats-mini-progress">
                      <span style={{ width: `${value}%` }} />
                    </div>
                  </div>
                );
              })}
            </article>

          </div>

          {/* Extracted Information */}
          <article className="ats-card">
            <h3>Resume information detected</h3>

            <div className="ats-info-grid">
              {Object.entries({
                Skills: extracted.skills,
                Education: extracted.education,
                Experience: extracted.experience,
                Projects: extracted.projects,
                Certifications: extracted.certifications,
              }).map(([label, values]) => (
                <div className="ats-info-item" key={label}>
                  <h4>{label}</h4>

                  {Array.isArray(values) && values.length > 0 ? (
                    <ul>
                      {values.map((value, index) => (
                        <li key={`${label}-${index}`}>
                          {value}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="ats-muted">
                      No clear information detected.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </article>

          {/* Keywords */}
          <div className="ats-two-columns">

            <article className="ats-card">
              <h3>Matched keywords</h3>

              <div className="ats-tags">
                {(result.matchedKeywords || []).map((word) => (
                  <span
                    className="ats-tag ats-tag-good"
                    key={word}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </article>

            <article className="ats-card">
              <h3>Missing keywords</h3>

              <div className="ats-tags">
                {(result.missingKeywords || []).map((word) => (
                  <span
                    className="ats-tag ats-tag-missing"
                    key={word}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </article>

          </div>

          {/* Recommended Keywords */}
          <article className="ats-card">
            <h3>Recommended keywords</h3>

            <p className="ats-muted">
              Add only skills you genuinely possess.
            </p>

            <div className="ats-tags">
              {(result.recommendedKeywords || []).map((word) => (
                <span className="ats-tag" key={word}>
                  {word}
                </span>
              ))}
            </div>
          </article>

          {/* Grammar */}
          <article className="ats-card">
            <h3>Grammar and spelling suggestions</h3>

            {(result.grammarIssues || []).length > 0 ? (
              result.grammarIssues.map((issue, index) => (
                <div className="ats-issue" key={index}>
                  <p>
                    <strong>Original:</strong> {issue.original}
                  </p>

                  <p>
                    <strong>Suggested:</strong> {issue.corrected}
                  </p>

                  <p className="ats-muted">
                    {issue.explanation}
                  </p>
                </div>
              ))
            ) : (
              <p className="ats-muted">
                No grammar suggestions returned.
              </p>
            )}
          </article>

          {/* Projects */}
          <article className="ats-card">
            <h3>Project recommendations</h3>

            {(result.projectRecommendations || []).length > 0 ? (
              <div className="ats-project-grid">
                {result.projectRecommendations.map((project, index) => (
                  <div
                    className="ats-project"
                    key={`${project.title}-${index}`}
                  >
                    <h4>{project.title}</h4>
                    <p>{project.description}</p>

                    <p>
                      <strong>Technologies:</strong>{" "}
                      {project.technologies}
                    </p>

                    <p>
                      <strong>Skills demonstrated:</strong>{" "}
                      {project.skillsDemonstrated}
                    </p>

                    <div className="ats-resource-links">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          GitHub resource ↗
                        </a>
                      )}

                      {project.youtubeUrl && (
                        <a
                          href={project.youtubeUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          YouTube tutorial ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="ats-muted">
                No project recommendations available.
              </p>
            )}
          </article>

          <p className="ats-disclaimer">
            {result.disclaimer}
          </p>

        </section>
      )}
    </main>
  );
}

export default AtsScore;
