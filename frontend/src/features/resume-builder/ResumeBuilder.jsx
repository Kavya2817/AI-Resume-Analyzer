import { useState } from "react";
import "./ResumeBuilder.css";

/* ---------- helpers ---------- */

const uid = () => Math.random().toString(36).slice(2, 9);

const newEntry = (patch = {}) => ({
  id: uid(),
  title: "",
  subtitle: "",
  details: "",
  ...patch,
});

const newSection = (title, bullets, entries) => ({
  id: uid(),
  title,
  bullets,
  entries,
});

const initialSections = () => [
  newSection("Summary", false, [
    newEntry({
      details:
        "Final-year computer science student with experience building web apps in React and Node.js.",
    }),
  ]),
  newSection("Education", false, [
    newEntry({
      title: "B.Tech in Computer Science",
      subtitle: "2022 - 2026",
      details: "Your college name, CGPA 8.5",
    }),
  ]),
  newSection("Experience", true, [
    newEntry({
      title: "Software Intern, Company Name",
      subtitle: "Jun 2025 - Aug 2025",
      details:
        "Built a dashboard that cut report generation time by 40%\nWrote unit tests covering 85% of the API layer",
    }),
  ]),
  newSection("Skills", false, [
    newEntry({ details: "JavaScript, React, Python, SQL, Git" }),
  ]),
  newSection("Projects", true, [
    newEntry({
      title: "AI Resume Analyzer",
      subtitle: "React, Python",
      details: "Scores resumes against job descriptions and suggests improvements",
    }),
  ]),
];

const withProtocol = (url) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);
const stripProtocol = (url) => url.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");

/* ---------- component ---------- */

export default function ResumeBuilder() {
  const [header, setHeader] = useState({
    name: "Your Name",
    github: "github.com/yourname",
    linkedin: "linkedin.com/in/yourname",
    phone: "+91 98765 43210",
    email: "you@gmail.com",
  });
  const [sections, setSections] = useState(initialSections);

  /* section actions */
  const updateSection = (id, patch) =>
    setSections((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const removeSection = (id) => setSections((s) => s.filter((x) => x.id !== id));

  const moveSection = (id, dir) =>
    setSections((s) => {
      const i = s.findIndex((x) => x.id === id);
      const j = i + dir;
      if (j < 0 || j >= s.length) return s;
      const copy = [...s];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const addSection = () =>
    setSections((s) => [...s, newSection("New Section", true, [newEntry()])]);

  /* entry actions */
  const updateEntry = (sid, eid, patch) =>
    setSections((s) =>
      s.map((x) =>
        x.id !== sid
          ? x
          : { ...x, entries: x.entries.map((e) => (e.id === eid ? { ...e, ...patch } : e)) }
      )
    );

  const addEntry = (sid) =>
    setSections((s) =>
      s.map((x) => (x.id !== sid ? x : { ...x, entries: [...x.entries, newEntry()] }))
    );

  const removeEntry = (sid, eid) =>
    setSections((s) =>
      s.map((x) =>
        x.id !== sid ? x : { ...x, entries: x.entries.filter((e) => e.id !== eid) }
      )
    );

  /* contact row: only shows fields that are filled in */
  const contacts = [
    header.github && {
      key: "github",
      text: stripProtocol(header.github),
      href: withProtocol(header.github),
    },
    header.linkedin && {
      key: "linkedin",
      text: stripProtocol(header.linkedin),
      href: withProtocol(header.linkedin),
    },
    header.phone && { key: "phone", text: header.phone, href: `tel:${header.phone.replace(/\s/g, "")}` },
    header.email && { key: "email", text: header.email, href: `mailto:${header.email}` },
  ].filter(Boolean);

  return (
    <div className="rb-root">
      {/* ---------- editor ---------- */}
      <aside className="rb-editor no-print">
        <h1 className="rb-heading">Resume builder</h1>

        <fieldset className="rb-card">
          <legend>Your details</legend>
          <label>
            Full name
            <input
              value={header.name}
              onChange={(e) => setHeader({ ...header, name: e.target.value })}
            />
          </label>
          <label>
            GitHub link
            <input
              value={header.github}
              onChange={(e) => setHeader({ ...header, github: e.target.value })}
            />
          </label>
          <label>
            LinkedIn link
            <input
              value={header.linkedin}
              onChange={(e) => setHeader({ ...header, linkedin: e.target.value })}
            />
          </label>
          <label>
            Phone number
            <input
              value={header.phone}
              onChange={(e) => setHeader({ ...header, phone: e.target.value })}
            />
          </label>
          <label>
            Email
            <input
              value={header.email}
              onChange={(e) => setHeader({ ...header, email: e.target.value })}
            />
          </label>
        </fieldset>

        {sections.map((section, idx) => (
          <fieldset className="rb-card" key={section.id}>
            <div className="rb-section-bar">
              <input
                className="rb-section-title-input"
                aria-label="Section title"
                value={section.title}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
              />
              <button
                type="button"
                className="rb-icon-btn"
                onClick={() => moveSection(section.id, -1)}
                disabled={idx === 0}
                aria-label="Move section up"
              >
                Up
              </button>
              <button
                type="button"
                className="rb-icon-btn"
                onClick={() => moveSection(section.id, 1)}
                disabled={idx === sections.length - 1}
                aria-label="Move section down"
              >
                Down
              </button>
              <button
                type="button"
                className="rb-icon-btn rb-danger"
                onClick={() => removeSection(section.id)}
              >
                Remove section
              </button>
            </div>

            <label className="rb-check">
              <input
                type="checkbox"
                checked={section.bullets}
                onChange={(e) => updateSection(section.id, { bullets: e.target.checked })}
              />
              Show each line as a bullet point
            </label>

            {section.entries.map((entry) => (
              <div className="rb-entry" key={entry.id}>
                <div className="rb-entry-row">
                  <input
                    placeholder="Heading (optional)"
                    value={entry.title}
                    onChange={(e) => updateEntry(section.id, entry.id, { title: e.target.value })}
                  />
                  <input
                    placeholder="Date or detail (optional)"
                    value={entry.subtitle}
                    onChange={(e) =>
                      updateEntry(section.id, entry.id, { subtitle: e.target.value })
                    }
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder="Details. Put each point on a new line."
                  value={entry.details}
                  onChange={(e) => updateEntry(section.id, entry.id, { details: e.target.value })}
                />
                <button
                  type="button"
                  className="rb-link-btn rb-danger"
                  onClick={() => removeEntry(section.id, entry.id)}
                >
                  Remove this entry
                </button>
              </div>
            ))}

            <button type="button" className="rb-link-btn" onClick={() => addEntry(section.id)}>
              Add entry
            </button>
          </fieldset>
        ))}

        <button type="button" className="rb-primary" onClick={addSection}>
          Add section
        </button>
      </aside>

      {/* ---------- preview ---------- */}
      <main className="rb-preview-wrap">
        <article className="rb-preview" aria-label="Resume preview">
          <header className="rb-resume-header">
            <h2 className="rb-name">{header.name || "Your Name"}</h2>
            {contacts.length > 0 && (
              <p className="rb-contacts">
                {contacts.map((c) => (
                  <a key={c.key} href={c.href}>
                    {c.text}
                  </a>
                ))}
              </p>
            )}
          </header>

          {sections.map((section) => (
            <section className="rb-resume-section" key={section.id}>
              <h3>{section.title}</h3>
              {section.entries.map((entry) => {
                const lines = entry.details
                  .split("\n")
                  .map((l) => l.trim())
                  .filter(Boolean);
                return (
                  <div className="rb-resume-entry" key={entry.id}>
                    {(entry.title || entry.subtitle) && (
                      <div className="rb-entry-head">
                        <strong>{entry.title}</strong>
                        <span>{entry.subtitle}</span>
                      </div>
                    )}
                    {section.bullets ? (
                      <ul>
                        {lines.map((l, i) => (
                          <li key={i}>{l}</li>
                        ))}
                      </ul>
                    ) : (
                      lines.map((l, i) => <p key={i}>{l}</p>)
                    )}
                  </div>
                );
              })}
            </section>
          ))}
        </article>

        {/* download option at the end */}
        <div className="rb-download no-print">
          <button type="button" className="rb-primary" onClick={() => window.print()}>
            Download as PDF
          </button>
          <p>In the print window, choose "Save as PDF" as the destination.</p>
        </div>
      </main>
    </div>
  );
}
