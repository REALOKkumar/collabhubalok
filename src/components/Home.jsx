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