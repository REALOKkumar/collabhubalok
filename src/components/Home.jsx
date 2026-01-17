import { useState, useEffect } from "react";
import "./Home.css";


function Home() {
  // 1. STATE: To store the data from MongoDB
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. EFFECT: Fetch data when page loads
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Fetch from your Backend API
        const response = await fetch('http://localhost:5000/api/posts'); 
        const data = await response.json();
        
        setPosts(data); // Save the real data
        setLoading(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Helper to format date (e.g., "2 hours ago" or "Jan 15")
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
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

  return (
    <div className="home-page">
      <main className="container">
        <h1 className="page-title">Available Study Requests</h1>
        <p className="subtitle">
          Browse and join study sessions posted by fellow students
        </p>

        <div className="search-container">
          <input
            className="search-box"
            type="text"
            placeholder="🔍 Search by subject or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="cards">
          {/* CARD 1 */}
          <div className="card">
            <span className="tag">Mathematics</span>
            <h3>Calculus II - Integration Techniques</h3>
            <p>
              Looking for study partners to review integration by parts and
              substitution methods. Preparing for midterm exam.
            </p>
            <div className="card-footer">
              <span>⏰ 2 hours ago</span>
              <span>👤 Sarah Johnson</span>
            </div>
            <button className="btn">Join Study Session</button>
          </div>

          {/* CARD 2 */}
          <div className="card">
            <span className="tag">Computer Science</span>
            <h3>Data Structures - Binary Trees</h3>
            <p>
              Need help understanding tree traversal algorithms. Let's work
              through problems together!
            </p>
            <div className="card-footer">
              <span>⏰ 5 hours ago</span>
              <span>👤 Michael Chen</span>
            </div>
            <button className="btn">Join Study Session</button>
          </div>

          {/* CARD 3 */}
          <div className="card">
            <span className="tag">Physics</span>
            <h3>Quantum Mechanics - Wave Functions</h3>
            <p>
              Study group for Chapter 5–7. Working on problem sets and discussing
              key concepts.
            </p>
            <div className="card-footer">
              <span>⏰ 1 day ago</span>
              <span>👤 Emma Davis</span>
            </div>
            <button className="btn">Join Study Session</button>
          </div>

          {/* CARD 4 */}
          <div className="card">
            <span className="tag">Chemistry</span>
            <h3>Organic Chemistry - Reaction Mechanisms</h3>
            <p>
              Looking to form a study group for organic chemistry. Focus on
              understanding reaction mechanisms.
            </p>
            <button className="btn">Join Study Session</button>
          </div>

          {/* CARD 5 */}
          <div className="card">
            <span className="tag">Biology</span>
            <h3>Molecular Biology - DNA Replication</h3>
            <p>
              Collaborative study session on DNA replication and transcription.
              Bringing my notes to share!
            </p>
            <button className="btn">Join Study Session</button>
          </div>

          {/* CARD 6 */}
          <div className="card">
            <span className="tag">Literature</span>
            <h3>Shakespeare - Hamlet Analysis</h3>
            <p>
              Discussion group for Hamlet. Analyzing themes, character
              development, and literary devices.
            </p>
            <button className="btn">Join Study Session</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;