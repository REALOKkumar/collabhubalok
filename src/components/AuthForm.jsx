import React, { useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  updateProfile
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./AuthForm.css";

const AuthForm = () => {
  const [activeTab, setActiveTab] = useState("login");
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
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  // ---------------- GITHUB ----------------
  const handleGithubLogin = async () => {
    setError("");
    try {
      await signInWithPopup(auth, githubProvider);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
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

      {/* LOGIN */}
      {activeTab === "login" && (
        <form className="form-container" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            <i className="fa-solid fa-envelope"></i> &nbsp;
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="oauth-buttons">
            <button type="button" onClick={handleGoogleLogin}>
              <i className="fa-brands fa-google"></i> Continue with Google
            </button>
            <button type="button" onClick={handleGithubLogin}>
              <i className="fa-brands fa-github"></i> Continue with GitHub
            </button>
          </div>
        </form>
      )}

      {/* SIGNUP */}
      {activeTab === "signup" && (
        <form className="form-container" onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Full Name"
            value={signupName}
            onChange={(e) => setSignupName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={signupEmail}
            onChange={(e) => setSignupEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={signupPassword}
            onChange={(e) => setSignupPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={signupConfirmPassword}
            onChange={(e) => setSignupConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            <i className="fa-solid fa-user-plus"></i> &nbsp;
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          <div className="oauth-buttons">
            <button type="button" onClick={handleGoogleLogin}>
              <i className="fa-brands fa-google"></i> Continue with Google
            </button>
            <button type="button" onClick={handleGithubLogin}>
              <i className="fa-brands fa-github"></i> Continue with GitHub
            </button>
          </div>
        </form>
      )}

      {/* Error */}
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
};

export default AuthForm;
