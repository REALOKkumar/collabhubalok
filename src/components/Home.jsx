

import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import "./Home.css";

function Home() {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. Firestore se real-time requests fetch karna
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

  // 2. Join Button Logic
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
        timestamp: serverTimestamp()
      });
      alert(`Request sent to ${posterName}!`);
    } catch (error) {
      console.error("Error joining:", error);
    }
  };

  // 3. Search Filter
  const filteredPosts = posts.filter(post => 
    post.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        {/* CARD GRID */}
        <div className="card-grid">
          {loading ? (
            <p>Loading sessions...</p>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div className="card" key={post.id}>
                <span className="tag">{post.category || post.subject}</span>
                <h3>{post.subject}: {post.topic}</h3>
                <p>{post.content}</p>

                <div className="card-footer">
                  <div className="footer-item">
                    <span>👤 {post.name || "Student"}</span>
                  </div>
                  <div className="footer-item">
                    <span>⏰ {post.timestamp?.toDate().toLocaleDateString()}</span>
                  </div>
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
            <p className="no-results">No study requests found for "{searchTerm}"</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;