// src/components/CreateRequest.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, collection, addDoc, serverTimestamp } from "../api";
import "./CreateRequest.css";
import Navbar from "./Navbar";

const CreateRequest = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subject: "",
    title: "",
    description: "",
    comms: "Discord",
    difficulty: "Beginner Friendly",
    frequency: "Weekly Sessions",
    maxSize: "5",
    tags: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Please login first!");
        navigate("/");
        return;
      }
      
      // Serialize advanced attributes into the description string (Mongoose compatibility)
      const descriptionPayload = JSON.stringify({
        text: formData.description,
        comms: formData.comms,
        difficulty: formData.difficulty,
        frequency: formData.frequency,
        maxSize: parseInt(formData.maxSize) || 5,
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean)
      });
      
      await addDoc(collection(db, "requests"), {
        subject: formData.subject,
        title: formData.title,
        description: descriptionPayload,
        creatorName: user.displayName || user.email,
        creatorEmail: user.email,
        creatorUid: user.uid,
        timestamp: serverTimestamp(),
        members: [user.uid]
      });

      alert("Study Request Group Created Successfully!");
      navigate("/Home");
    } catch (err) {
      alert("Error creating request: " + err.message);
    }
  };

  return (
    <div className="create-page-wrapper">
      {/* NAVBAR */}
      <Navbar activePage="" />

      <div className="create-page">
        <h1 className="create-title">Create Study Group</h1>
        <p className="create-subtitle">
          Host a new study team, specify capacity limits, level of preparation, and find relevant study peers
        </p>

        <div className="create-card glass-card">
          <form onSubmit={handleSubmit}>
            {/* Academic Info Header */}
            <div className="form-section-header">
              <i className="fa-solid fa-book-open"></i> Core Details
            </div>

            <div className="form-group-row">
              {/* Subject */}
              <div className="form-group flex-1">
                <label>Subject Category</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Subject</option>
                  <option>Mathematics</option>
                  <option>Computer Science</option>
                  <option>Physics</option>
                  <option>Chemistry</option>
                  <option>Biology</option>
                  <option>Literature</option>
                </select>
              </div>

              {/* Title */}
              <div className="form-group flex-2">
                <label>Request Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Data Structures - Binary Trees"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Detailed Description</label>
              <textarea
                name="description"
                placeholder="Describe study goals, chapters to cover, or specific homework review targets..."
                rows="3"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            {/* Platform / Configs Header */}
            <div className="form-section-header">
              <i className="fa-solid fa-sliders"></i> Group Preferences & Limits
            </div>

            <div className="form-group-row">
              {/* Comms */}
              <div className="form-group flex-1">
                <label><i className="fa-solid fa-comments"></i> Communication Channel</label>
                <select name="comms" value={formData.comms} onChange={handleChange} required>
                  <option>Discord</option>
                  <option>WhatsApp</option>
                  <option>Zoom / Google Meet</option>
                  <option>In-Person / Library</option>
                </select>
              </div>

              {/* Difficulty */}
              <div className="form-group flex-1">
                <label><i className="fa-solid fa-gauge-high"></i> Prep Level / Difficulty</label>
                <select name="difficulty" value={formData.difficulty} onChange={handleChange} required>
                  <option>Beginner Friendly</option>
                  <option>Intermediate</option>
                  <option>Advanced Prep</option>
                </select>
              </div>
            </div>

            <div className="form-group-row">
              {/* Frequency */}
              <div className="form-group flex-1">
                <label><i className="fa-solid fa-calendar-days"></i> Meeting Frequency</label>
                <select name="frequency" value={formData.frequency} onChange={handleChange} required>
                  <option>Weekly Sessions</option>
                  <option>Daily Review</option>
                  <option>Weekend Huddles</option>
                  <option>One-time Session</option>
                </select>
              </div>

              {/* Capacity */}
              <div className="form-group flex-1">
                <label><i className="fa-solid fa-user-group"></i> Max Capacity (2 to 10 seats)</label>
                <input
                  type="number"
                  name="maxSize"
                  min="2"
                  max="10"
                  placeholder="e.g. 5"
                  value={formData.maxSize}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Tags */}
            <div className="form-group">
              <label><i className="fa-solid fa-tags"></i> Related Skills / Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                placeholder="e.g. Algorithms, C++, Midterm Prep"
                value={formData.tags}
                onChange={handleChange}
              />
            </div>

            {/* Form Action Buttons */}
            <div className="form-actions-buttons">
              <button type="submit" className="btn-premium flex-1">
                <i className="fa-solid fa-plus-circle"></i> Create Study Group
              </button>
              <button
                type="button"
                className="btn-premium-secondary flex-1"
                onClick={() => navigate("/Home")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;
