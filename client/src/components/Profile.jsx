// src/components/Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, updateProfile, signOut, getDocs } from "../api";
import "./Profile.css";
import Navbar from "./Navbar";

const AVATAR_PRESETS = [
  { id: 0, gradient: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)", label: "Indigo Glow" },
  { id: 1, gradient: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)", label: "Sunset Blush" },
  { id: 2, gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)", label: "Emerald Gate" },
  { id: 3, gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", label: "Amber Sun" },
  { id: 4, gradient: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)", label: "Cyber Ocean" },
  { id: 5, gradient: "linear-gradient(135deg, #1f2937 0%, #111827 100%)", label: "Carbon Dark" }
];

const Profile = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    course: "",
    college: "",
    interests: ""
  });

  // Extended Profile Metadata
  const [meta, setMeta] = useState({
    avatarPreset: 0,
    customAvatarUrl: "",
    leetcode: "",
    linkedin: "",
    github: "",
    bio: ""
  });

  // Real Database Statistics
  const [stats, setStats] = useState({
    createdCount: 0,
    joinedCount: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setCurrentUser(user);
      setFormData({
        displayName: user.displayName || "",
        course: user.course || "Not Specified",
        college: user.college || "Not Specified",
        interests: user.interests || "Not Specified"
      });

      // Load database-synced metadata directly from user object
      setMeta({
        avatarPreset: user.avatarPreset || 0,
        customAvatarUrl: user.customAvatarUrl || "",
        leetcode: user.leetcode || "",
        linkedin: user.linkedin || "",
        github: user.github || "",
        bio: user.bio || "Passionate college student interested in peer learning and team collaboration."
      });

      // Fetch actual stats from DB
      fetchUserStatistics(user.uid);
    } else {
      navigate("/");
    }
  }, [navigate]);

  const fetchUserStatistics = async (userUid) => {
    try {
      const q = { path: "requests" };
      const snapshot = await getDocs(q);
      const allReqs = snapshot.docs.map(doc => doc.data());
      
      const created = allReqs.filter(r => r.creatorUid === userUid);
      const joined = allReqs.filter(r => r.members && r.members.includes(userUid) && r.creatorUid !== userUid);

      setStats({
        createdCount: created.length,
        joinedCount: joined.length
      });
    } catch (e) {
      console.error("Error loading user statistics:", e);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMetaChange = (e) => {
    setMeta({ ...meta, [e.target.name]: e.target.value });
  };

  const handleSelectPreset = (presetId) => {
    setMeta({ ...meta, avatarPreset: presetId, customAvatarUrl: "" });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    try {
      // Save primary info and metadata to backend profile database
      await updateProfile(auth.currentUser, {
        displayName: formData.displayName,
        course: formData.course,
        college: formData.college,
        interests: formData.interests,
        avatarPreset: meta.avatarPreset,
        customAvatarUrl: meta.customAvatarUrl,
        leetcode: meta.leetcode,
        linkedin: meta.linkedin,
        github: meta.github,
        bio: meta.bio
      });

      // Update global states
      setCurrentUser({
        ...auth.currentUser,
        displayName: formData.displayName,
        course: formData.course,
        college: formData.college,
        interests: formData.interests,
        avatarPreset: meta.avatarPreset,
        customAvatarUrl: meta.customAvatarUrl,
        leetcode: meta.leetcode,
        linkedin: meta.linkedin,
        github: meta.github,
        bio: meta.bio
      });
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Error updating profile: " + err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (!currentUser) return <div className="loading-screen">Loading Profile...</div>;

  const currentPreset = AVATAR_PRESETS[meta.avatarPreset] || AVATAR_PRESETS[0];

  return (
    <div className="profile-page-wrapper">
      {/* NAVBAR */}
      <Navbar activePage="profile" />

      <div className="profile-page">
        <h1 className="profile-title">My Profile</h1>
        <p className="profile-subtitle">
          Manage your personal information, specialized skills, and professional platform connections
        </p>

        <div className="profile-layout-grid">
          {/* LEFT COLUMN: HERO CARD */}
          <div className="profile-column-left">
            <div className="profile-hero-card glass-card">
              {/* Profile Avatar */}
              <div className="profile-avatar-container">
                {meta.customAvatarUrl ? (
                  <img src={meta.customAvatarUrl} alt="Avatar" className="profile-avatar-img" />
                ) : (
                  <div className="profile-avatar-initials" style={{ background: currentPreset.gradient }}>
                    {(formData.displayName || currentUser.email || "S")[0].toUpperCase()}
                  </div>
                )}
                <div className="avatar-status-badge"></div>
              </div>

              <h2 className="hero-name">{formData.displayName || currentUser.email.split("@")[0]}</h2>
              <p className="hero-email">{currentUser.email}</p>
              <div className="hero-location">
                <i className="fa-solid fa-school"></i> {formData.college}
              </div>

              <div className="hero-bio-section">
                <p className="hero-bio-text">"{meta.bio || "No biography provided yet."}"</p>
              </div>

              <div className="profile-stats-grid">
                <div className="stat-card">
                  <span className="stat-value">{stats.createdCount}</span>
                  <span className="stat-label">Groups Led</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{stats.joinedCount}</span>
                  <span className="stat-label">Teams Joined</span>
                </div>
              </div>
            </div>

            {/* SOCIAL CHIPS / PLATFORMS CARD */}
            <div className="platforms-card glass-card">
              <h3>Connect Platforms</h3>
              <p className="platforms-subtitle">Click to visit verified profiles</p>

              <div className="social-links-grid">
                {/* GitHub */}
                {meta.github ? (
                  <a
                    href={`https://github.com/${meta.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-chip github-chip"
                  >
                    <div className="chip-content">
                      <i className="fa-brands fa-github"></i>
                      <span>{meta.github}</span>
                    </div>
                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                  </a>
                ) : (
                  <div className="social-chip disabled-chip">
                    <div className="chip-content">
                      <i className="fa-brands fa-github"></i>
                      <span>GitHub: Not Linked</span>
                    </div>
                  </div>
                )}

                {/* LinkedIn */}
                {meta.linkedin ? (
                  <a
                    href={meta.linkedin.startsWith("http") ? meta.linkedin : `https://linkedin.com/in/${meta.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-chip linkedin-chip"
                  >
                    <div className="chip-content">
                      <i className="fa-brands fa-linkedin"></i>
                      <span>LinkedIn Profile</span>
                    </div>
                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                  </a>
                ) : (
                  <div className="social-chip disabled-chip">
                    <div className="chip-content">
                      <i className="fa-brands fa-linkedin"></i>
                      <span>LinkedIn: Not Linked</span>
                    </div>
                  </div>
                )}

                {/* LeetCode */}
                {meta.leetcode ? (
                  <a
                    href={`https://leetcode.com/${meta.leetcode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-chip leetcode-chip"
                  >
                    <div className="chip-content">
                      <i className="fa-solid fa-code"></i>
                      <span>{meta.leetcode}</span>
                    </div>
                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                  </a>
                ) : (
                  <div className="social-chip disabled-chip">
                    <div className="chip-content">
                      <i className="fa-solid fa-code"></i>
                      <span>LeetCode: Not Linked</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: MAIN FORM OR INFO CARD */}
          <div className="profile-column-right">
            {editMode ? (
              <form onSubmit={handleSave} className="profile-edit-form glass-card">
                <h3>Edit Profile Details</h3>
                <p className="form-subtitle">Customize your user profile details and avatars</p>

                {/* Section: Academic Details */}
                <div className="form-section-title">Academic Info</div>
                <div className="form-group-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="displayName"
                      className="input-premium"
                      value={formData.displayName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Course / Major</label>
                    <input
                      type="text"
                      name="course"
                      className="input-premium"
                      value={formData.course}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>College / University</label>
                  <input
                    type="text"
                    name="college"
                    className="input-premium"
                    value={formData.college}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Section: Specialities / Skills */}
                <div className="form-section-title">Specialties & Biography</div>
                <div className="form-group">
                  <label>Interests & Skills (comma separated)</label>
                  <input
                    type="text"
                    name="interests"
                    className="input-premium"
                    placeholder="e.g. React, Python, UI/UX"
                    value={formData.interests}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Profile Biography</label>
                  <textarea
                    name="bio"
                    className="input-premium textarea-premium"
                    rows="3"
                    placeholder="Tell other students about your goals, specialties, and target projects..."
                    value={meta.bio}
                    onChange={handleMetaChange}
                  />
                </div>

                {/* Section: Profile Avatar Selection */}
                <div className="form-section-title">Profile Picture Options</div>
                
                <div className="avatar-presets-grid">
                  {AVATAR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={`preset-circle-btn ${meta.avatarPreset === preset.id && !meta.customAvatarUrl ? "active" : ""}`}
                      style={{ background: preset.gradient }}
                      title={preset.label}
                      onClick={() => handleSelectPreset(preset.id)}
                    >
                      {(formData.displayName || currentUser.email || "S")[0].toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="form-group" style={{ marginTop: "12px" }}>
                  <label>Or Paste Custom Image URL</label>
                  <input
                    type="url"
                    name="customAvatarUrl"
                    className="input-premium"
                    placeholder="https://example.com/your-image.png"
                    value={meta.customAvatarUrl}
                    onChange={handleMetaChange}
                  />
                </div>

                {/* Section: Platform Handles */}
                <div className="form-section-title">Platform Accounts</div>
                <div className="form-group-grid">
                  <div className="form-group">
                    <label><i className="fa-brands fa-github"></i> GitHub Username</label>
                    <input
                      type="text"
                      name="github"
                      className="input-premium"
                      placeholder="e.g. sandipanray"
                      value={meta.github}
                      onChange={handleMetaChange}
                    />
                  </div>

                  <div className="form-group">
                    <label><i className="fa-solid fa-code"></i> LeetCode Username</label>
                    <input
                      type="text"
                      name="leetcode"
                      className="input-premium"
                      placeholder="e.g. alok_kumar"
                      value={meta.leetcode}
                      onChange={handleMetaChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label><i className="fa-brands fa-linkedin"></i> LinkedIn URL / Username</label>
                  <input
                    type="text"
                    name="linkedin"
                    className="input-premium"
                    placeholder="e.g. https://linkedin.com/in/username"
                    value={meta.linkedin}
                    onChange={handleMetaChange}
                  />
                </div>

                <div className="form-actions-buttons">
                  <button type="submit" className="btn-premium flex-1">
                    <i className="fa-solid fa-check"></i> Save Changes
                  </button>
                  <button type="button" className="btn-premium-secondary flex-1" onClick={() => setEditMode(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-details-card glass-card">
                <h3>About Me</h3>
                
                <div className="details-section">
                  <h4 className="details-header"><i className="fa-solid fa-graduation-cap"></i> Academic Overview</h4>
                  <div className="details-info-grid">
                    <div className="details-item">
                      <span className="details-label">Degree / Course</span>
                      <span className="details-value">{formData.course}</span>
                    </div>
                    <div className="details-item">
                      <span className="details-label">College</span>
                      <span className="details-value">{formData.college}</span>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h4 className="details-header"><i className="fa-solid fa-lightbulb"></i> Expertise & Skills</h4>
                  <div className="skills-badge-container">
                    {formData.interests && formData.interests !== "Not Specified" ? (
                      formData.interests.split(",").map((interest, idx) => (
                        <span key={idx} className="badge-premium skill-badge">
                          {interest.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-value">No skills listed yet.</span>
                    )}
                  </div>
                </div>

                <div className="details-section" style={{ borderBottom: "none", paddingBottom: "0" }}>
                  <h4 className="details-header"><i className="fa-solid fa-circle-nodes"></i> Engagement Overview</h4>
                  <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6", marginTop: "8px" }}>
                    Active member of the Collab-Hub college network. Ready to schedule group study sessions, join peer projects, and collaborate on shared subjects.
                  </p>
                </div>

                <div className="edit-btn-container" style={{ marginTop: "30px", display: "flex", gap: "10px" }}>
                  <button className="btn-premium flex-1" onClick={() => setEditMode(true)}>
                    <i className="fa-solid fa-user-pen"></i> Edit Profile
                  </button>
                  <button className="btn-premium-secondary" onClick={handleLogout} style={{ border: "1px solid rgba(239, 68, 68, 0.25)", color: "#ef4444" }}>
                    <i className="fa-solid fa-sign-out-alt"></i> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
