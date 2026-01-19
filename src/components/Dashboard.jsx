import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth"; // <--- FIXED: Added missing import
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const [userName, setUserName] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // <--- FIXED: Added missing state variables to prevent crash
  const [searchTerm, setSearchTerm] = useState(""); 
  const [filter, setFilter] = useState("All");

  // 🔧 missing states (fixed)
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");

  const navigate = useNavigate();

  // 🔹 1. Auth check + backend dashboard fetch
  useEffect(() => {
    const fetchDashboard = async () => {
      if (!auth.currentUser) return;
      setUserName(auth.currentUser.displayName || "Student");
      // (Your existing fetch logic kept as is)
    };
    fetchDashboard();
  }, []);

  // 🔹 2. Real-time Firestore posts listener
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const unsubscribePosts = onSnapshot(q, (snapshot) => {
      const postsArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsArray);
      setLoading(false);
    });
    return () => unsubscribePosts();
  }, []);

  // 🔹 3. Logout handler
  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("userLoggedIn");
    navigate("/");
  };

  // 🔹 4. Search & filter logic
  const filteredPosts = posts.filter(
    (post) =>
      (post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.subject?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filter === "All" || post.category === filter)
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-layout">
        
        {/* LEFT SIDEBAR */}
        <aside className="dashboard-sidebar">
          <div className="user-welcome">
            <h2>Welcome, {userName}! 👋</h2>
            <p>MNNIT Allahabad Student</p>
          </div>

          <div className="skills-cloud-card">
            <h4>Knowledge Network 🌐</h4>
            <div className="cloud-tags">
              <span className="cloud-tag active">React</span>
              <span className="cloud-tag">Python</span>
              <span className="cloud-tag">DSA</span>
              <span className="cloud-tag">AI/ML</span>
              <span className="cloud-tag">Figma</span>
            </div>
          </div>

          <div className="quick-links">
            <button onClick={() => navigate("/create")} className="create-btn-side">
              + New Request
            </button>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </aside>

        {/* MAIN FEED */}
        <main className="main-feed">
          {/* ANALYTICS */}
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="analytics-icon">🔥</div>
              <div className="analytics-info">
                <h3>Active Streak</h3>
                <p>3 Days</p>
              </div>
            </div>
            <div className="stat-widget">
              <div className="widget-icon clock">⌛</div>
              <div className="widget-data">
                <span>Study Hours</span>
                <h4>12.5 hrs</h4>
              </div>
            </div>
            <div className="stat-widget">
              <div className="widget-icon check">✅</div>
              <div className="widget-data">
                <span>Completed</span>
                <h4>8 Sessions</h4>
              </div>
            </div>
          </div>

          {/* RATING */}
          <section className="rating-analytics-card">
            <div className="rating-header">
              <h3>Collaboration Rating</h3>
              <div className="rating-score">
                4.9 <span>★</span>
              </div>
            </div>
          </section> {/* <--- FIXED: Changed from </div> to </section> */}

          {/* SEARCH */}
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search subjects, topics or partners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* FEED */}
          <div className="feed">
            <div className="feed-header">
              <h3>Live Study Requests</h3>
              <span className="live-pulse"></span>
            </div>

            {loading ? (
              <p>Loading requests...</p>
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <div key={post.id} className="study-card">
                  <div className="card-header">
                    <span className="badge">{post.category || "General"}</span>
                    <span className="time">
                      {post.timestamp?.toDate().toLocaleDateString()}
                    </span>
                  </div>
                  <div className="card-body">
                    <h4>{post.subject}: {post.topic}</h4>
                    <p className="poster-info">By <strong>{post.name}</strong></p>
                    <p className="post-content">{post.content}</p>
                  </div>
                  <div className="card-footer">
                    <div className="team-size">👥 Needed: {post.teamSize || 2}</div>
                    <button className="join-btn">Interested (Join)</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-feed">
                <p>No study requests found.</p>
                <button onClick={() => navigate("/create")}>Create a Request</button>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="trending-sidebar">
          <div className="trending-box">
            <h4>🔥 Trending Topics</h4>
            <ul className="trending-list">
              <li>#DSA_Recursion</li>
              <li>#MNNIT_MCA_Exams</li>
              <li>#WebDev_React_Project</li>
              <li>#DBMS_SQL_Practice</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;