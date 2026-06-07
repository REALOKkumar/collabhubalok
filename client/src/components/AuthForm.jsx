// src/components/AuthForm.jsx
import React, { useState } from "react";
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  updateProfile
} from "../api";
import { useNavigate } from "react-router-dom";
import "./AuthForm.css";

const AuthForm = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const googleProvider = new GoogleAuthProvider();
  const githubProvider = new GithubAuthProvider();

  const openAuth = (tabName) => {
    setActiveTab(tabName);
    setError("");
    setShowModal(true);
  };

  // ---------------- LOGIN ----------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      navigate("/Home");
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  // ---------------- SIGNUP ----------------
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (signupPassword !== signupConfirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signupEmail,
        signupPassword
      );

      await updateProfile(userCredential.user, {
        displayName: signupName,
      });

      navigate("/Home");
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  // ---------------- GOOGLE ----------------
  const handleGoogleLogin = async () => {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/Home");
    } catch (err) {
      setError(err.message);
    }
  };

  // ---------------- GITHUB ----------------
  const handleGithubLogin = async () => {
    setError("");
    try {
      await signInWithPopup(auth, githubProvider);
      navigate("/Home");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="landing-container">
      {/* NAVBAR */}
      <div className="landing-navbar">
        <div className="logo" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          <i className="fa-solid fa-graduation-cap" style={{ background: "var(--accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}></i>
          <span>Collab-Hub</span>
        </div>

        <div className="nav-links">
          <button className="nav-item" onClick={() => openAuth("login")} style={{ background: "none", border: "none", fontSize: "inherit", cursor: "pointer" }}>
            Login
          </button>
          <button className="btn-premium" onClick={() => openAuth("signup")} style={{ padding: "8px 16px", fontSize: "14px" }}>
            Sign Up
          </button>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="landing-hero">
        <div className="landing-hero-content">
          <h1 className="landing-title">Collaborate, Learn, and Succeed Together</h1>
          <p className="landing-subtitle">
            Collab-Hub is a peer-to-peer collaboration network for college students. 
            Form study groups, coordinate sessions, and study with peers who share your courses and skills.
          </p>

          <div className="landing-cta-row">
            <button className="btn-premium" onClick={() => openAuth("signup")} style={{ padding: "14px 28px", fontSize: "16px" }}>
              Get Started for Free
            </button>
            <button className="btn-premium-secondary" onClick={() => openAuth("login")} style={{ padding: "14px 28px", fontSize: "16px" }}>
              Access Account
            </button>
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="landing-features-grid">
          <div className="feature-card glass-card">
            <div className="feature-icon">
              <i className="fa-solid fa-users-viewfinder"></i>
            </div>
            <h3>Form Study Groups</h3>
            <p>
              Create dedicated study groups for any course or topic. Define maximum member limits, difficulty levels, and find compatible learning partners.
            </p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon">
              <i className="fa-solid fa-comments"></i>
            </div>
            <h3>Real-Time Discussion</h3>
            <p>
              Collaborate and exchange knowledge instantly in dedicated chat rooms for your study circles. Share resources, notes, and solve problems together.
            </p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon">
              <i className="fa-solid fa-calendar-days"></i>
            </div>
            <h3>Seamless Scheduling</h3>
            <p>
              Schedule library meetups or virtual sessions. Set location links and coordinate attendance using interactive RSVP tracking.
            </p>
          </div>
        </div>
      </div>

      {/* AUTH MODAL DIALOG */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="auth-card glass-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowModal(false)}>×</button>
            
            {/* Title */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <h1 style={{ background: "var(--accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontSize: "28px", fontWeight: 800, marginBottom: "4px" }}>Collab-Hub</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "13.5px" }}>Connect and build study teams in your college</p>
            </div>

            {/* Tabs */}
            <div className="tab-header">
              <div
                className={`tab ${activeTab === "login" ? "active" : ""}`}
                onClick={() => setActiveTab("login")}
              >
                Login
              </div>
              <div
                className={`tab ${activeTab === "signup" ? "active" : ""}`}
                onClick={() => setActiveTab("signup")}
              >
                Sign Up
              </div>
            </div>

            {/* LOGIN FORM */}
            {activeTab === "login" && (
              <form className="form-container" onSubmit={handleLogin}>
                <input
                  type="email"
                  className="input-premium"
                  placeholder="College Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />

                <input
                  type="password"
                  className="input-premium"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />

                <button type="submit" className="btn-premium" disabled={loading}>
                  <i className="fa-solid fa-envelope"></i> &nbsp;
                  {loading ? "Logging in..." : "Login"}
                </button>

                <div className="oauth-buttons">
                  <button type="button" className="btn-premium-secondary" onClick={handleGoogleLogin}>
                    <i className="fa-brands fa-google" style={{ color: "#4285f4" }}></i> Continue with Google
                  </button>
                  <button type="button" className="btn-premium-secondary" onClick={handleGithubLogin}>
                    <i className="fa-brands fa-github"></i> Continue with GitHub
                  </button>
                </div>
              </form>
            )}

            {/* SIGNUP FORM */}
            {activeTab === "signup" && (
              <form className="form-container" onSubmit={handleSignup}>
                <input
                  type="text"
                  className="input-premium"
                  placeholder="Full Name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                />

                <input
                  type="email"
                  className="input-premium"
                  placeholder="College Email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />

                <input
                  type="password"
                  className="input-premium"
                  placeholder="Password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                />

                <input
                  type="password"
                  className="input-premium"
                  placeholder="Confirm Password"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  required
                />

                <button type="submit" className="btn-premium" disabled={loading}>
                  <i className="fa-solid fa-user-plus"></i> &nbsp;
                  {loading ? "Creating account..." : "Sign Up"}
                </button>

                <div className="oauth-buttons">
                  <button type="button" className="btn-premium-secondary" onClick={handleGoogleLogin}>
                    <i className="fa-brands fa-google" style={{ color: "#4285f4" }}></i> Continue with Google
                  </button>
                  <button type="button" className="btn-premium-secondary" onClick={handleGithubLogin}>
                    <i className="fa-brands fa-github"></i> Continue with GitHub
                  </button>
                </div>
              </form>
            )}

            {/* Error Message */}
            {error && <p style={{ color: "#ef4444", marginTop: "16px", fontWeight: "500", fontSize: "14px", textAlign: "center" }}>{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthForm;
