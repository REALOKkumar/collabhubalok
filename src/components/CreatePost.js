// src/components/CreatePost.js
import React, { useState } from 'react';
import { auth } from '../firebase'; // Import auth to get current user

function CreatePost() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const handleSubmit = async (e) => {    //Make async
    e.preventDefault();
    
    const user = auth.currentUser;
    if(!user) {
      alert("You must be logged in to post!");
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          desc,
          firebaseUid: user.uid // Send the ID to link with Backend
        }),
      });

      if (response.ok) {
        alert('Post created successfully!');
        setTitle('');
        setDesc('');
      } else {
        alert('Failed to save post to database.');
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <div className="form-container">
      <h2>Create a New Request</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Title (e.g., React Study)" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
        /><br/><br/>
        
        <textarea 
          placeholder="Description (Time, location, etc.)" 
          value={desc} 
          onChange={(e) => setDesc(e.target.value)} 
          required 
        /><br/><br/>
        
        <button type="submit">Post Request</button>
      </form>
    </div>
  );
}

export default CreatePost;