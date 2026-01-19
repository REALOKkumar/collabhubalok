//The "Record Keeper" Component
//As the database manager, this is Harshit's most important frontend component. This button replaces the generic "Join" button. When clicked, it talks to your backend interactions.js route to record the request in MongoDB.

import React, { useState } from 'react';
import { auth } from '../firebase';

const JoinButton = ({ postId }) => {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleJoin = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Please log in to join.");

    setStatus('loading');

    try {
      // CALL YOUR BACKEND RECORDER
      const response = await fetch('http://localhost:5000/api/interactions/join-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUid: user.uid, // Who is asking?
          postId: postId,        // Which project?
          message: "I'm interested in collaborating!" // Default message
        }),
      });

      if (response.ok) {
        setStatus('success');
        // Optional: Trigger a notification or log success
        console.log("Record saved to MongoDB: CollabRequest created.");
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error("Failed to save record:", err);
      setStatus('error');
    }
  };

  // RENDER DIFFERENT STATES
  if (status === 'loading') return <button className="btn" disabled>Recording...</button>;
  if (status === 'success') return <button className="btn" style={{background: '#28a745'}}>Request Sent ✓</button>;
  if (status === 'error') return <button className="btn" style={{background: '#dc3545'}}>Error. Try Again.</button>;

  return (
    <button className="btn" onClick={handleJoin}>
      Join Study Session
    </button>
  );
};

export default JoinButton;