import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateRequest.css";




const CreateRequest = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subject: "",
    title: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData); // backend later
    alert("Request Created!");
    navigate("/"); // home page
  };

  return (
    <div className="create-page">
      <h1 className="create-title">Create Study Request</h1>
      <p className="create-subtitle">
        Post a new study session and find study partners
      </p>

      <div className="create-card">
        <form onSubmit={handleSubmit}>
          {/* Subject */}
          <div className="form-group">
            <label>Subject</label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
            >
              <option value="">Select subject</option>
              <option>Mathematics</option>
              <option>Computer Science</option>
              <option>Physics</option>
              <option>Chemistry</option>
              <option>Biology</option>
              <option>Literature</option>
            </select>
          </div>

          {/* Title */}
          <div className="form-group">
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

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Describe what you want to study and goals..."
              rows="4"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* Buttons */}
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Create Request
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequest;
