import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged
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

  // ---------------- AUTH PERSISTENCE ----------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        navigate("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // ---------------- ERROR MAPPING ----------------
  const getErrorMessage = (code) => {
    switch (code) {
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/email-already-in-use":
        return "Email already registered.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/invalid-email":
        return "Invalid email address.";
      default:
        return "Something went wrong. Try again.";
    }
  };

  // ---------------- LOGIN ----------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword
      );

      if (!res.user.emailVerified) {
        setError("Please verify your email before logging in.");
        return;
      }

      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
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

      await sendEmailVerification(userCredential.user);

      setError("Verification email sent. Please check your inbox.");
      setActiveTab("login");
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  // ---------------- FORGOT PASSWORD ----------------
  const handleForgotPassword = async () => {
    if (!loginEmail) {
      setError("Enter your email to reset password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, loginEmail);
      setError("Password reset email sent.");
    } catch (err) {
      setError(getErrorMessage(err.code));
    }
  };

  // ---------------- GOOGLE ----------------
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  // ---------------- GITHUB ----------------
  const handleGithubLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, githubProvider);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
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
            <i className="fa-solid fa-envelope"></i>&nbsp;
            {loading ? "Logging in..." : "Login with Email"}
          </button>

          <p className="forgot" onClick={handleForgotPassword}>
            Forgot password?
          </p>

          <div className="oauth-buttons">
            <button type="button" disabled={loading} onClick={handleGoogleLogin}>
              <i className="fa-brands fa-google"></i> Continue with Google
            </button>
            <button type="button" disabled={loading} onClick={handleGithubLogin}>
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
            <i className="fa-solid fa-user-plus"></i>&nbsp;
            {loading ? "Creating account..." : "Sign Up with Email"}
          </button>

          <div className="oauth-buttons">
            <button type="button" disabled={loading} onClick={handleGoogleLogin}>
              <i className="fa-brands fa-google"></i> Continue with Google
            </button>
            <button type="button" disabled={loading} onClick={handleGithubLogin}>
              <i className="fa-brands fa-github"></i> Continue with GitHub
            </button>
          </div>
        </form>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default AuthForm;
