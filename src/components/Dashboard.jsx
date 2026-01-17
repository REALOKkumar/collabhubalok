import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const [userName, setUserName] = useState("");
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Mock Rating Data (This could later come from Firestore)
  const ratingData = [
    { stars: 5, percentage: 85, color: "#0b0b1d" },
    { stars: 4, percentage: 10, color: "#2d3748" },
    { stars: 3, percentage: 3, color: "#4a5568" },
    { stars: 2, percentage: 1, color: "#718096" },
    { stars: 1, percentage: 1, color: "#a0aec0" },
  ];

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserName(user.displayName || user.email.split('@')[0]);
      } else {
        navigate("/");
      }
    });

    const qPosts = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const unsubscribePosts = onSnapshot(qPosts, (snapshot) => {
      setPosts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    const qNotify = query(collection(db, "notifications"), orderBy("timestamp", "desc"));
    const unsubscribeNotify = onSnapshot(qNotify, (snapshot) => {
      setNotifications(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubscribeAuth();
      unsubscribePosts();
      unsubscribeNotify();
    };
  }, [navigate]);

  const handleRequestAction = async (notificationId, status) => {
    try {
      const notifyRef = doc(db, "notifications", notificationId);
      await updateDoc(notifyRef, { status: status });
      alert(`User ${status} successfully!`);
    } catch (err) {
      console.error(err);
    }
  };

  const myPosts = posts.filter(p => p.uid === auth.currentUser?.uid);

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        
        {/* --- LEFT SIDEBAR: PROFILE & SKILLS --- */}
        <aside className="sidebar-left">
          <div className="profile-card-static">
            <div className="avatar-circle">{userName.charAt(0)}</div>
            <h3>{userName}</h3>
            <p className="university-tag">MNNIT Allahabad</p>
            <div className="profile-stats-row">
              <div><strong>12</strong><br/>Collabs</div>
              <div><strong>4.9</strong><br/>Rating</div>
            </div>
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

          <button className="create-request-btn-large" onClick={() => navigate("/CreateRequest")}>
            + Start New Session
          </button>
        </aside>

        {/* --- CENTER COLUMN: MAIN CONTENT --- */}
        <main className="dashboard-main">
          <header className="dash-header">
            <h1>Student Command Center</h1>
            <p>Track your progress and manage collaborations</p>
          </header>

          {/* Performance Analytics Widgets */}
          <section className="analytics-section-grid">
            <div className="stat-widget">
              <div className="widget-icon fire">🔥</div>
              <div className="widget-data">
                <span>Active Streak</span>
                <h4>5 Days</h4>
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
          </section>

          {/* --- RATING BREAKDOWN GRAPH --- */}
          <section className="rating-analytics-card">
            <div className="rating-header">
              <h3>Collaboration Rating</h3>
              <div className="rating-score">4.9 <span>★</span></div>
            </div>
            <div className="rating-chart">
              {ratingData.map((data) => (
                <div key={data.stars} className="rating-row">
                  <span className="star-num">{data.stars} ★</span>
                  <div className="bar-container">
                    <div 
                      className="bar-fill" 
                      style={{ 
                        width: `${data.percentage}%`, 
                        backgroundColor: data.color 
                      }}
                    ></div>
                  </div>
                  <span className="percent-text">{data.percentage}%</span>
                </div>
              ))}
            </div>
          </section>

          {/* Management Area */}
          <section className="management-area">
            <div className="section-title-row">
              <h3>My Active Requests</h3>
              <span className="count-pill">{myPosts.length}</span>
            </div>

            <div className="management-stack">
              {myPosts.length > 0 ? myPosts.map(post => (
                <div key={post.id} className="request-mgmt-card">
                  <div className="mgmt-header">
                    <div className="subject-info">
                      <span className="cat-badge">{post.category || "General"}</span>
                      <h4>{post.subject}: {post.topic}</h4>
                    </div>
                    <span className={`status-label ${post.status || 'open'}`}>
                      ● {post.status || 'Open'}
                    </span>
                  </div>

                  <div className="applicants-tray">
                    <h5>Pending Applications</h5>
                    <div className="tray-scroll">
                      {notifications.filter(n => n.postId === post.id && n.status === "pending").length > 0 ? (
                        notifications.filter(n => n.postId === post.id && n.status === "pending").map(n => (
                          <div key={n.id} className="applicant-row">
                            <span className="applicant-name">👤 {n.senderName}</span>
                            <div className="action-buttons">
                              <button className="accept-tiny" onClick={() => handleRequestAction(n.id, "accepted")}>Accept</button>
                              <button className="decline-tiny" onClick={() => handleRequestAction(n.id, "declined")}>Decline</button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="no-app-text">No pending applicants yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="empty-state">You haven't posted any requests yet.</div>
              )}
            </div>
          </section>
        </main>

        {/* --- RIGHT SIDEBAR: AGENDA --- */}
        <aside className="sidebar-right">
          <div className="agenda-card">
            <h4>Upcoming Agenda 🗓</h4>
            <div className="agenda-list">
              <div className="agenda-item-modern">
                <div className="agenda-time">14:00</div>
                <div className="agenda-content">
                  <h5>DSA Recursion</h5>
                  <p>Starting in 20m</p>
                </div>
              </div>
              <div className="agenda-item-modern">
                <div className="agenda-time">18:30</div>
                <div className="agenda-content">
                  <h5>React UI Review</h5>
                  <p>Tomorrow</p>
                </div>
              </div>
            </div>
          </div>

          <div className="activity-card-modern">
            <h4>History</h4>
            <ul className="history-list">
              <li>Completed OS Prep</li>
              <li>Joined WebDev Group</li>
              <li>Earned "Helper" Badge</li>
            </ul>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default Dashboard;