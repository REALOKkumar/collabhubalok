import React, { useState, useEffect } from "react";
import JoinButton from './JoinButton'; // <--- We keep this!
import "./Home.css";

function Home() {
  // --- STATE ---
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // Fixed: Was declared twice before

  // --- FETCH FROM YOUR BACKEND ---
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/posts");
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // --- FILTER LOGIC ---
  const filteredPosts = posts.filter((post) => {
    // We check both 'title' (your backend) and 'subject' (teammate's potential name) to be safe
    const title = post.title || post.subject || "";
    const desc = post.description || post.content || "";
    return (
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      desc.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // --- HELPER ---
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <>
      {/* NAVBAR */}
      <div className="navbar">
        <div className="logo">Collab-Hub</div>
        <div className="nav-links">
          <a className="nav-item active" href="/Home">🏠 Home</a>
          <a className="nav-item" href="/Dashboard">📊 Dashboard</a>
          <a className="nav-item" href="/profile">👤 Profile</a>
          <a className="nav-item" href="/create">➕ Create Request</a>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="home-page">
        <main className="container">
          <h1 className="page-title">Available Study Requests</h1>
          <p className="subtitle">
            Browse and join study sessions posted by fellow students
          </p>

          {/* SEARCH */}
          <div className="search-container">
            <input
              className="search-box"
              type="text"
              placeholder="🔍 Search by subject or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* LOADING & ERROR STATES */}
          {loading && <p style={{textAlign: 'center'}}>Loading study requests...</p>}
          
          {!loading && filteredPosts.length === 0 && (
            <p style={{textAlign: 'center', color: '#666'}}>No study requests found.</p>
          )}

          {/* POSTS LIST */}
          <div className="cards">
            {!loading && filteredPosts.map((post) => (
              <div className="card" key={post._id}>
                {/* Fallback to 'General' if no tag provided */}
                <span className="tag">{post.category || "General"}</span>

                {/* Display Title (Backend: title, Teammate: subject) */}
                <h3>
                  {post.title || post.subject} 
                  {post.topic && ` - ${post.topic}`}
                </h3>

                {/* Display Description */}
                <p>{post.description || post.content}</p>

                <div className="card-footer">
                  <span>⏰ {formatDate(post.createdAt)}</span>
                  {/* Handle User Name (Populated object vs string) */}
                  <span>👤 {post.user?.name || post.name || "Anonymous"}</span>
                </div>

                {/* CRITICAL: Use your Backend Recorder Button */}
                <JoinButton postId={post._id} />
                
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}

export default Home;