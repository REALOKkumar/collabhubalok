// src/components/CreatePost.js
import React, { useState } from 'react';

function CreatePost() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Form submitted: ${title}`); // Just for testing today
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