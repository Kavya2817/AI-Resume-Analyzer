export function validateInputs(resumeText, jobDescription) {
  if (!resumeText.trim()) return "Please paste your resume text.";
  if (!jobDescription.trim()) return "Please paste the job description.";
  if (resumeText.trim().length < 80) return "Please provide more resume text so the analysis is useful.";
  if (jobDescription.trim().length < 40) return "Please provide a more complete job description.";
  return "";
}

export function formatScore(score) {
  const value = Number(score);
  return Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : 0;
}
