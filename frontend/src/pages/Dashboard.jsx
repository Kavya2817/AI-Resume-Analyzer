
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  function handleLogout() {
    sessionStorage.removeItem("token");
    navigate("/login", { replace: true });
  }

  return (
    <div className="dashboard-container">

      <nav className="dashboard-navbar">
        <h2>AI Resume Analyzer</h2>
        <button onClick={handleLogout}>Logout</button>
      </nav>

      <div className="dashboard-content">

        <h1>Welcome to Your Career Workspace</h1>
        <p>Everything you need to build your career, in one place.</p>

        <div className="dashboard-grid">

          <div className="dashboard-card">
            <h2>Resume Builder</h2>
            <p>Create professional resumes using customizable templates.</p>
            <button onClick={() => navigate("/resume-builder")}>
              Get Started
            </button>
          </div>

          <div className="dashboard-card">
            <h2>ATS Resume Analyzer</h2>
            <p>Analyze your resume against job descriptions and improve your score.</p>
            <button onClick={() => navigate("/ats-score")}>
              Analyze Resume
            </button>
          </div>

          <div className="dashboard-card">
            <h2>Career Mentor</h2>
            <p>Get personalized career guidance and advice from AI.</p>
            <button onClick={() => navigate("/career-mentor")}>
              Chat Now
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Dashboard;
