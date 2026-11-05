
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./ProtectedRoute";

import ResumeBuilder from "./features/resume-builder/ResumeBuilder";
import AtsScore from "./features/ats-score/AtsScore";
import CareerMentor from "./features/career-mentor/CareerMentor";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resume-builder" element={<ResumeBuilder />} />
          <Route path="/ats-score" element={<AtsScore />} />
          <Route path="/career-mentor" element={<CareerMentor />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
