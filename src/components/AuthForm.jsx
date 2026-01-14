import React, { useState } from "react";
import "./AuthForm.css"; // Make sure this CSS file exists in the same folder

const AuthForm = () => {
  // State to track which tab is active
  const [activeTab, setActiveTab] = useState("login");

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

      {/* Login Form */}
      {activeTab === "login" && (
        <form className="form-container">
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
      )}

      {/* Signup Form */}
      {activeTab === "signup" && (
        <form className="form-container">
          <input type="text" placeholder="Full Name" required />
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <input type="password" placeholder="Confirm Password" required />
          <button type="submit">Sign Up</button>
        </form>
      )}
    </div>
  );
};

export default AuthForm;
