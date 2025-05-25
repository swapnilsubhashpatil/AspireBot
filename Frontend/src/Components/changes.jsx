import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Style from "../App.module.css";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";

function MainPage() {
  const navigate = useNavigate();
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [recommendationPopUp, setRecommendationPopUp] = useState(false);
  const [cohereRecommendation, setCohereRecommendation] = useState(null);
  const [geminiRecommendation, setGeminiRecommendation] = useState(null);
  const [showCohere, setShowCohere] = useState(true);
  const [showGemini, setShowGemini] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // User data from localStorage
  const userFirstName = localStorage.getItem("userFirstName") || "John";
  const userLastName = localStorage.getItem("userLastName") || "Doe";
  const userEmailAddress =
    localStorage.getItem("userEmailAddress") || "john.doe@example.com";

  // Form state
  const [formData, setFormData] = useState({
    interest: "",
    skills: "",
    goals: "",
  });

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(null); // Clear error on input change
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic form validation
    if (!formData.interest || !formData.skills || !formData.goals) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/counsel",
        {
          interests: formData.interest,
          skills_to_learn: formData.skills,
          career_goals: formData.goals,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      setCohereRecommendation(response.data.cohere_recommendation);
      setGeminiRecommendation(response.data.gemini_recommendation);
      setShowPopup(false);
      setRecommendationPopUp(true);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setError(
        error.response?.data?.message ||
          "Failed to fetch recommendations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const logoutUser = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userFirstName");
    localStorage.removeItem("userLastName");
    localStorage.removeItem("userEmailAddress");
    navigate("/");
  };

  // Toggle recommendation display
  const handleCohereClick = () => {
    setShowCohere(true);
    setShowGemini(false);
  };

  const handleGeminiClick = () => {
    setShowCohere(false);
    setShowGemini(true);
  };

  // Parse and format recommendation data
  const formatRecommendation = (recommendation) => {
    if (!recommendation) return null;
    return (
      <div className={Style.recommendationContent}>
        <h3>Career Paths</h3>
        <ul>
          {recommendation.career_paths.map((path, index) => (
            <li key={index}>{path}</li>
          ))}
        </ul>
        <h3>Skills to Learn</h3>
        <ul>
          {recommendation.skills.map((skill, index) => (
            <li key={index}>{skill}</li>
          ))}
        </ul>
        <h3>Learning Resources</h3>
        <ul>
          {recommendation.resources.map((resource, index) => (
            <li key={index}>{resource}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className={Style.mainDiv}>
      <div className={Style.mainPageMainDiv}>
        {/* Navigation Bar */}
        <div className={Style.navBarMainPage}>
          <div className={Style.logoNavBarMainPage}>
            <h1>AspireBot</h1>
          </div>
          <div className={Style.ProfileBtnNavBarMainPage}>
            <button
              className={Style.profileBtn}
              onClick={() => setShowUserInfo(!showUserInfo)}
            >
              Profile
            </button>
            {showUserInfo && (
              <div className={Style.userInfoDiv}>
                <p className={Style.userInfoDivPara1}>
                  {`${userFirstName} ${userLastName}`}
                </p>
                <p className={Style.userInfoDivPara2}>{userEmailAddress}</p>
                <button className={Style.logoutBtn} onClick={logoutUser}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className={Style.contentDivMainPage}>
          <div className={Style.converterHeadingDiv}>
            <h1>
              <span className={Style.cryptoCurrencyText}>AspireBot</span> - Your
              Career Guide
            </h1>
          </div>
          <div className={Style.sendCryptoCurrencyMainDiv}>
            <div className={Style.sendCryptoCurrencyContentDiv}>
              <div className={Style.mainDivInvestment}>
                <p className={Style.investmentPara}>
                  AspireBot leverages advanced AI technologies to provide
                  personalized career guidance. Powered by LangChain, Cohere,
                  and Gemini, it analyzes your interests, skills, and goals to
                  suggest tailored career paths, essential skills to learn, and
                  curated resources to help you succeed in your professional
                  journey.
                </p>
                <div className={Style.logoMainDiv}>
                  <div className={Style.imageContainerDiv}>
                    <img
                      src="https://logowik.com/content/uploads/images/google-ai-gemini91216.logowik.com.webp"
                      alt="Gemini Logo"
                    />
                  </div>
                  <div className={Style.imageContainerDiv}>
                    <img
                      src="https://images.seeklogo.com/logo-png/61/1/langchain-logo-png_seeklogo-611654.png"
                      alt="LangChain Logo"
                    />
                  </div>
                  <div className={Style.imageContainerDiv}>
                    <img
                      src="https://logowik.com/content/uploads/images/cohere-new9011.logowik.com.webp"
                      alt="Cohere Logo"
                    />
                  </div>
                </div>
                <div className={Style.getStartedBtnDiv}>
                  <button onClick={() => setShowPopup(true)}>
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Form */}
      {showPopup && (
        <div className={Style.popupOverlay}>
          <div className={Style.popupContent}>
            <h2>Enter Your Career Preferences</h2>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <form onSubmit={handleSubmit}>
              <label>
                Interests
                <input
                  type="text"
                  name="interest"
                  value={formData.interest}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Web Development, Data Science, AI"
                />
              </label>
              <label>
                Skills to Learn
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  required
                  placeholder="e.g., JavaScript, React, Python"
                />
              </label>
              <label>
                Career Goals
                <input
                  type="text"
                  name="goals"
                  value={formData.goals}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Become a Full Stack Developer, Work in AI"
                />
              </label>
              <div className={Style.popupActions}>
                <button type="submit" disabled={loading}>
                  {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    "Submit"
                  )}
                </button>
                <button type="button" onClick={() => setShowPopup(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recommendation Popup */}
      {recommendationPopUp && (
        <div className={Style.recommendationPopUpOverlay}>
          <div className={Style.recommendationPopUpContent}>
            <h2>Career Recommendations</h2>
            <div className={Style.recommendationBtnDivOption}>
              <button
                onClick={handleCohereClick}
                className={showCohere ? Style.activeBtn : ""}
              >
                Cohere Recommendation
              </button>
              <button
                onClick={handleGeminiClick}
                className={showGemini ? Style.activeBtn : ""}
              >
                Gemini Recommendation
              </button>
            </div>
            {showCohere && cohereRecommendation && (
              <div className={Style.responseDiv}>
                {formatRecommendation(cohereRecommendation)}
              </div>
            )}
            {showGemini && geminiRecommendation && (
              <div className={Style.responseDiv}>
                {formatRecommendation(geminiRecommendation)}
              </div>
            )}
            <button
              className={Style.closeRecommendationBtn}
              onClick={() => setRecommendationPopUp(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainPage;