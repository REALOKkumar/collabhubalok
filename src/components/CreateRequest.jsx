import React, { useState } from "react";
import { db, auth } from "../firebase"; // Firebase connection
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; // Firestore methods
import { useNavigate } from "react-router-dom";
import "./CreateRequest.css";

const CreateRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    subject: "",
    title: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Check if user is logged in
    const user = auth.currentUser;
    if (!user) {
      alert("Session expired. Please login again.");
      navigate("/");
      return;
    }

    try {
      // DATABASE ME SAVE KARNA
      await addDoc(collection(db, "posts"), {
        uid: user.uid,
        name: user.displayName || user.email.split('@')[0],
        subject: formData.subject,
        topic: formData.title, // 'title' ko 'topic' ki tarah save kar rahe hain
        content: formData.description,
        timestamp: serverTimestamp(),
      });

      alert("Request Created Successfully!");
      navigate("/Dashboard"); // Dashboard par bhejein, "/" par nahi
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error: Data save nahi hua. Firestore Rules check karein!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-page">
      <h1 className="create-title">Create Study Request</h1>
      <p className="create-subtitle">
        Post a new study session and find study partners
      </p>

      <div className="create-card">
        <form onSubmit={handleSubmit}>
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

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              rows="4"
              placeholder="Describe what you want to study and goals..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Request"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/Dashboard")}
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