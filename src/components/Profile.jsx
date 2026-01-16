
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Navigation ke liye useNavigate add kiya
import { auth } from "../firebase"; // Logout ke liye auth zaroori hai
import { signOut } from "firebase/auth";
import "./Profile.css";
import "./Home.css";

const Profile = () => {
  const navigate = useNavigate();
  
  // 1. User ki details save karne ke liye state
  const [user, setUser] = useState({
    name: "Alok Kumar", // Default fallback name
    email: "alok.kumar@example.com",
    photo: null
  });

  // 2. Page load hote hi LocalStorage se data nikalna
  useEffect(() => {
    const savedData = localStorage.getItem("userLoggedIn");
    if (savedData) {
      const parsedUser = JSON.parse(savedData);
      setUser({
        name: parsedUser.name || "User",
        email: parsedUser.email || "No email provided",
        photo: parsedUser.photo || null
      });
    }
  }, []);

  // 3. Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase se logout
      localStorage.removeItem("userLoggedIn"); // Memory clear karna
      navigate("/"); // Login page par bhejna
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <>
     
      {/* PROFILE CONTENT */}
      <div className="profile-page">
        <h1 className="profile-title">My Profile</h1>
        <p className="profile-subtitle">
          Manage your personal information and study preferences
        </p>

        <div className="profile-card">
          {/* Avatar Section (Now Dynamic) */}
          <div className="profile-avatar-section">
            {user.photo ? (
              <img src={user.photo} alt="Profile" className="profile-avatar-img" style={{width: '80px', borderRadius: '50%', marginBottom: '10px'}} />
            ) : (
              <div className="profile-avatar">{user.name.charAt(0)}</div>
            )}
            
            {/* Ab yahan user ka real naam dikhega */}
            <h2 className="profile-name">{user.name}</h2>
            <p className="profile-email">{user.email}</p>
          </div>

          {/* Info Section */}
          <div className="profile-info-grid">
            <div className="info-box">
              <span className="label">Course</span>
              <span>MCA</span>
            </div>

            <div className="info-box">
              <span className="label">College</span>
              <span>MNNIT Allahabad</span>
            </div>

            <div className="info-box">
              <span className="label">Interests</span>
              <span>DSA, Web Development</span>
            </div>

            <div className="info-box">
              <span className="label">Study Sessions</span>
              <span>5 Joined</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="profile-actions">
            <button className="btn-primary">Edit Profile</button>
            {/* Logout button par handleLogout function lagaya */}
            <button className="btn-secondary" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;