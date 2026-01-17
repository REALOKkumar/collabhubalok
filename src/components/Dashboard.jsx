import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import "./Dashboard.css";

const Dashboard = () => {
  const [userName, setUserName] = useState("");
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Auth check aur Real-time data fetching
  useEffect(() => {
  const fetchDashboard = async () => {
    const token = await auth.currentUser.getIdToken();

    const res = await fetch("http://localhost:5000/api/user/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    console.log("Backend data:", data);
  };

  fetchDashboard();
  }, []);


  const fetchPosts = async () => {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const unsubscribePosts = onSnapshot(q, (snapshot) => {
      const postsArray = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsArray);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribePosts();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("userLoggedIn");
    navigate("/");
  };

  // 2. Search aur Filter logic
  const filteredPosts = posts.filter(post => 
    (post.content?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     post.subject?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filter === "All" || post.category === filter)
  );

  // 3. Simple analytics calculation
  const myRequestsCount = posts.filter(p => p.uid === auth.currentUser?.uid).length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-layout">
        
        {/* LEFT SIDEBAR: Stats & Filters */}
        <aside className="dashboard-sidebar">
          <div className="user-welcome">
            <h2>Welcome, {userName}! 👋</h2>
            <p>MNNIT Allahabad Student</p>
          </div>

          <div className="filter-section">
            <h4>Filter by Category</h4>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="All">All Categories</option>
              <option value="Exam Prep">Exam Prep</option>
              <option value="Project Team">Project Team</option>
              <option value="Assignment">Assignment</option>
              <option value="Daily Study">Daily Study</option>
            </select>
          </div>

          <div className="quick-links">
            <button onClick={() => navigate("/CreateRequest")} className="create-btn-side">
              + New Request
            </button>
          </div>
        </aside>

        {/* CENTER: Analytics & Feed */}
        <main className="main-feed">
          
          {/* --- ANALYTICS SECTION --- */}
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="analytics-icon">🔥</div>
              <div className="analytics-info">
                <h3>Active Streak</h3>
                <p>3 Days</p>
              </div>
            </div>

            <div className="analytics-card">
              <div className="analytics-icon">🤝</div>
              <div className="analytics-info">
                <h3>My Requests</h3>
                <p>{myRequestsCount} Posts</p>
              </div>
            </div>

            <div className="analytics-card">
              <div className="analytics-icon">📚</div>
              <div className="analytics-info">
                <h3>Study Hours</h3>
                <p>8.2 hrs</p>
              </div>
            </div>

            <div className="analytics-card">
              <div className="analytics-icon">⭐</div>
              <div className="analytics-info">
                <h3>Reputation</h3>
                <p>4.9/5.0</p>
              </div>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="search-box">
            <input 
              type="text" 
              placeholder="🔍 Search subjects, topics or partners..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* STUDY REQUESTS LIST */}
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
                    <span className="time">{post.timestamp?.toDate().toLocaleDateString()}</span>
                  </div>
                  <div className="card-body">
                    <h4>{post.subject}: {post.topic}</h4>
                    <p className="poster-info">By <strong>{post.name}</strong></p>
                    <p className="post-content">{post.content}</p>
                    {post.deadline && <p className="deadline">🗓 Target Date: {post.deadline}</p>}
                  </div>
                  <div className="card-footer">
                    <div className="team-size">👥 Needed: {post.teamSize || 2} Partners</div>
                    <button className="join-btn">Interested (Join)</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-feed">
                <p>No study requests found. Be the first to post!</p>
                <button onClick={() => navigate("/CreateRequest")}>Create a Request</button>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT SIDEBAR: Trending & Activity */}
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

          <div className="activity-box">
            <h4>Activity History</h4>
            <div className="activity-item">✔ Joined OS Session</div>
            <div className="activity-item">✔ Posted DSA Request</div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;