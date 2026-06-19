import React, { useState } from "react";
import "./index.css";

const YourResumes = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setError("");
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select a resume to upload.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("You must be logged in.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", selectedFile);

    try {
      setLoading(true);
      setError("");

      // STEP 1: Upload Resume
      const uploadResponse = await fetch(
        "http://localhost:5000/resume/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(errorText || "Resume upload failed.");
      }

      const data = await uploadResponse.json();

      // STEP 2: Analyze Resume
      const rawData = {
        resumeText: data.text,
        jobDescription:
          "Junior Full Stack Developer. We are looking for a motivated entry-level Full Stack Developer to join our engineering team. You will work on building and maintaining web applications using modern technologies. Requirements: Bachelor's degree in Computer Science or related field. Proficiency in HTML, CSS, JavaScript, and React. Experience with Node.js, Express, and REST APIs. Familiarity with MongoDB or any NoSQL database. Understanding of Git and version control. Strong problem-solving skills and attention to detail. Good communication and teamwork abilities. Nice to Have: Experience with TypeScript, Redux, or Next.js. Exposure to cloud platforms like AWS or Azure. Knowledge of CI/CD pipelines and Docker. Responsibilities: Develop and maintain responsive web applications. Build RESTful APIs and integrate with frontend components. Write clean, maintainable, and well-documented code. Collaborate with designers, product managers, and senior developers. Participate in code reviews and contribute to team best practices. Debug and resolve technical issues across the full stack.",
      };

      const analyzeResponse = await fetch(
        "http://localhost:5000/resume/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(rawData),
        }
      );

      if (!analyzeResponse.ok) {
        const errorText = await analyzeResponse.text();
        throw new Error(errorText || "Resume analysis failed.");
      }
      const analyzeData = await analyzeResponse.json();
      setAnalysisResult(analyzeData);
      setShowModal(true);

    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-container">
      <h2>Upload Your Resume</h2>

      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
      />

      <button onClick={handleUploadAndAnalyze} disabled={loading}>
        {loading ? "Processing..." : "Upload & Analyze"}
      </button>

      {analysisResult && (
        <button onClick={() => setShowModal(true)}>
          View Report
        </button>
      )}

      {showModal && analysisResult?.success && (
  <div className="modal-overlay">
    <div className="modal">
      {(() => {
        const report = analysisResult.suggestions;

        return (
          <>
            <h1>ATS Resume Report</h1>

            <div className="score-card">
              <h2>{report.ats_score}%</h2>
              <p>
                Estimated Score After Changes:{" "}
                {report.estimated_score_after_changes}%
              </p>
            </div>

            <h2>✅ Strengths</h2>
            <ul>
              {report.strengths?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2>❌ Missing Skills</h2>
            <ul>
              {report.missing_skills?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2>💡 Improvements</h2>
            <ul>
              {report.improvements?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2>🚀 Improved Resume Sections</h2>

            {report.section_rewrites?.map((section, index) => (
              <div
                key={index}
                className="rewrite-card"
              >
                <h3>{section.section_type}</h3>

                <h4>{section.title}</h4>

                <p>{section.rewritten_description}</p>
              </div>
            ))}

            {report.certifications_to_add?.length > 0 && (
              <>
                <h2>🏆 Recommended Certifications</h2>

                <ul>
                  {report.certifications_to_add.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </>
            )}

            <h2>📋 Overall Assessment</h2>

            <p>{report.overall_assessment}</p>

            <button onClick={() => setShowModal(false)}>
              Close
            </button>
          </>
        );
      })()}
    </div>
  </div>
)}

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default YourResumes;

