import React, { useEffect, useState, useMemo } from "react";
import { db, auth } from "../firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import "./Home.css";

function Home() {
  // STATE
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // FETCH POSTS FROM BACKEND
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

  // FILTER LOGIC
  const filteredPosts = posts.filter(
    (post) =>
      post.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.topic?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // DATE FORMATTER
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
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
        </section>

          {/* LOADING */}
          {loading && <p>Loading study requests...</p>}

          {/* EMPTY */}
          {!loading && filteredPosts.length === 0 && (
            <p>No study requests found.</p>
          )}

          {/* POSTS */}
          <div className="cards">
            {!loading &&
              filteredPosts.map((post) => (
                <div className="card" key={post._id}>
                  <span className="tag">{post.category || "General"}</span>

                  <h3>
                    {post.subject} {post.topic && `- ${post.topic}`}
                  </h3>

                  <p>{post.content}</p>

                  <div className="card-footer">
                    <span>⏰ {formatDate(post.createdAt)}</span>
                    <span>👤 {post.name || "Anonymous"}</span>
                  </div>

                  <button className="btn">Join Study Session</button>
                </div>
              ))}
          </div>
        </main>
      </div>
    </>
  );
}

export default Home;
