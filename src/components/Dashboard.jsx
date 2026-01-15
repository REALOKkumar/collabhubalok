// src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "firebase/firestore";

const Dashboard = () => {
  const [userName, setUserName] = useState("");
  const [postContent, setPostContent] = useState("");
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserName(user.displayName || user.email);
    }

    // Fetch posts
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    const postsArray = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setPosts(postsArray);
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !postContent.trim()) return;

    await addDoc(collection(db, "posts"), {
      uid: user.uid,
      name: user.displayName || user.email,
      email: user.email,
      content: postContent,
      timestamp: serverTimestamp()
    });

    setPostContent(""); // clear input
    fetchPosts(); // refresh list
  };

  return (
    <>
      {/* NAVBAR */}
      <div className="navbar">
        <div className="logo">Collab-Hub</div>

        <div className="nav-links">
          <a className="nav-item" href="/Home">🏠 Home</a>
          <a className="nav-item active" href="/dashboard">📊 Dashboard</a>
          <a className="nav-item" href="/profile">👤 Profile</a>
          <a className="nav-item" href="/create">➕ Create Request</a>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="container">
        <h1>Dashboard</h1>
        <p className="subtitle">Overview of your study activity</p>

        {/* STATS */}
        <div className="stats">
          <div className="stat-card">
            <h2>5</h2>
            <p>Study Sessions Joined</p>
          </div>

          <div className="stat-card">
            <h2>2</h2>
            <p>Requests Created</p>
          </div>

          <div className="stat-card">
            <h2>1</h2>
            <p>Pending Requests</p>
          </div>

          <div className="stat-card">
            <h2>3</h2>
            <p>Completed Sessions</p>
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="recent">
          <h2>Recent Activity</h2>

          <div className="recent-item">
            ✔ Joined “Binary Trees Study Session”
          </div>

          <div className="recent-item">
            ✔ Created request “Calculus Integration Practice”
          </div>

          <div className="recent-item">
            ✔ Completed “Quantum Mechanics Group Study”
          </div>
        </div>
  
      {/* Post Form */}
      <form onSubmit={handlePostSubmit} style={{ marginTop: "20px" }}>
        <textarea
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          placeholder="Write your post..."
          rows={3}
          style={{ width: "100%", padding: "10px" }}
        />
        <button type="submit" style={{ marginTop: "10px", padding: "10px 20px" }}>
          Post
        </button>
      </form>

      {/* Posts Feed */}
      <div style={{ marginTop: "30px" }}>
        <h2>Posts</h2>
        {posts.map((post) => (
          <div key={post.id} style={{ borderBottom: "1px solid #ccc", padding: "10px 0" }}>
            <strong>{post.name}</strong> <em>({post.email})</em>
            <p>{post.content}</p>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}

export default Dashboard;
