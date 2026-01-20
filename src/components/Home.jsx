import React, { useEffect, useState, useMemo } from "react";
import { db, auth } from "../firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import "./Home.css";

function Home() {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [userData, setUserData] = useState({
    streak: 5,
    badges: ["Fast Learner", "Top Helper"],
    interests: ["React", "AI", "Python", "UI/UX"]
  });

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsArray = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsArray);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const matchedPosts = useMemo(() => {
    return posts.filter(post => 
      userData.interests.some(interest => 
        post.subject?.toLowerCase().includes(interest.toLowerCase()) ||
        post.topic?.toLowerCase().includes(interest.toLowerCase())
      )
    ).slice(0, 3);
  }, [posts, userData.interests]);

  const handleJoinSession = async (postId, posterName) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please login to join!");
      return;
    }
    try {
      await addDoc(collection(db, "notifications"), {
        postId: postId,
        senderId: user.uid,
        senderName: user.displayName || user.email.split('@')[0],
        receiverName: posterName,
        status: "pending",
        timestamp: serverTimestamp(),
        type: "session_request"
      });
      alert(`Request sent to ${posterName}!`);
    } catch (error) {
      console.error("Error joining:", error);
    }
  };

  // Logic for Group Joining
  const handleJoinGroup = async (groupName) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please login to join groups!");
      return;
    }
    try {
      await addDoc(collection(db, "notifications"), {
        senderId: user.uid,
        senderName: user.displayName || user.email.split('@')[0],
        groupName: groupName,
        status: "pending",
        timestamp: serverTimestamp(),
        type: "group_request"
      });
      alert(`Join request sent for ${groupName}!`);
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const addToCalendar = (event) => {
    const gCalUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=20260215T100000Z/20260215T120000Z`;
    window.open(gCalUrl, '_blank');
  };

  return (
    <div className="home-page">
      <main className="container">
        {/* SMART MATCHING SECTION */}
        {matchedPosts.length > 0 && (
          <section className="matching-section">
            <h2>Recommended for You 🎯</h2>
            <div className="match-grid">
              {matchedPosts.map(post => (
                <div key={post.id} className="match-card">
                  <span className="match-tag">Matched with your interests</span>
                  <h4>{post.subject}: {post.topic}</h4>
                  <button onClick={() => handleJoinSession(post.id, post.name)}>Quick Join</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* HACKATHONS SECTION (Horizontal Scroll) */}
        <section className="section-container">
          <div className="section-header">
            <h2>Upcoming Hackathons</h2>
            <span className="arrow-icon">➔</span>
          </div>
          <div className="hackathon-row">
            {[
              { id: 1, title: "Code-Sprint 2026", desc: "Build the future of AI" },
              { id: 2, title: "Design-a-thon", desc: "UI/UX Challenge" },
              { id: 3, title: "Web3 Summit", desc: "Blockchain Innovation" },
              { id: 4, title: "Data-Hacks", desc: "Big Data Solutions" }
            ].map((event) => (
              <div className="hackathon-card" key={event.id}>
                <div className="event-tag">Upcoming</div>
                <h4>{event.title}</h4>
                <p>{event.desc}</p>
                <button className="cal-btn" onClick={() => addToCalendar(event)}>📅 Add to Calendar</button>
              </div>
            ))}
          </div>
        </section>

        {/* NEW: POPULAR GROUPS SECTION (Horizontal Scroll) */}
        <section className="section-container">
          <div className="section-header">
            <h2>Explore Communities</h2>
            <span className="arrow-icon">➔</span>
          </div>
          <div className="hackathon-row">
            {[
              { id: 1, name: "React Experts", members: 120, category: "Web Dev" },
              { id: 2, name: "Python Pioneers", members: 85, category: "Data Science" },
              { id: 3, name: "AI Enthusiasts", members: 210, category: "Machine Learning" },
              { id: 4, name: "UI/UX Designers", members: 60, category: "Design" },
              { id: 5, name: "Competitive Coders", members: 340, category: "DSA" }
            ].map((group) => (
              <div className="hackathon-card group-card" key={group.id}>
                <div className="event-tag group-tag">{group.category}</div>
                <h4>{group.name}</h4>
                <p>👤 {group.members} Members</p>
                <button 
                  className="btn-primary-home" 
                  style={{ marginTop: '15px' }}
                  onClick={() => handleJoinGroup(group.name)}
                >
                  Request to Join
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* FRIENDS WITH SAME INTERESTS */}
        <section className="interests-section">
          <h2>Friends with same Interests</h2>
          <div className="friends-grid">
            <div className="profile-match-card">
              <div className="avatar-placeholder"></div>
              <p>Alex Rivera</p>
              <div className="badge-list">
                {userData.badges.map(b => <span key={b} className="mini-badge">🏆</span>)}
              </div>
              <span>Expert in React</span>
            </div>
          </div>
        </section>

        {/* BOTTOM TWO-COLUMN GRID */}
        <div className="bottom-layout-grid">
          <div className="progress-card">
            <h3>Daily Progress</h3>
            <div className="streak-visual">
              <span className="streak-number">{userData.streak}</span>
              <p>Days Knowledge Streak</p>
            </div>
            <div className="badge-shelf">
              {userData.badges.map(badge => (
                <span key={badge} className="skill-badge">🏆 {badge}</span>
              ))}
            </div>
          </div>

          <div className="groups-section">
            <h3>Quick Stats</h3>
            <div className="groups-list">
              <div className="group-item-card">
                <span>Total Connections</span>
                <strong>42</strong>
              </div>
              <div className="group-item-card">
                <span>Sessions Attended</span>
                <strong>18</strong>
              </div>
            </div>
          </div>
        </div>

        <hr className="divider" />
        <h1 className="page-title">Available Study Requests</h1>
        
        <div className="search-container">
          <input
            className="search-box"
            type="text"
            placeholder="🔍 Search by subject, topic, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="card-grid">
          {loading ? (
            <p>Loading sessions...</p>
          ) : posts.length > 0 ? (
            posts.filter(post => 
              post.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              post.topic?.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((post) => (
              <div className="card" key={post.id}>
                <div className="card-header">
                  <span className="tag">{post.category || post.subject}</span>
                  {post.isVerified && <span className="verified-badge">✅ Verified Expert</span>}
                </div>
                <h3>{post.subject}: {post.topic}</h3>
                <p>{post.content}</p>

                <div className="card-footer">
                  <div className="footer-item">👤 {post.name || "Student"}</div>
                  <div className="footer-item">⏰ {post.timestamp?.toDate().toLocaleDateString()}</div>
                </div>

                <button 
                  className="btn-primary-home" 
                  onClick={() => handleJoinSession(post.id, post.name)}
                >
                  Join Study Session
                </button>
              </div>
            ))
          ) : (
            <p className="no-results">No requests found.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;