// import React from "react";
// import "./Profile.css";

// const Profile = () => {
//   return (
    
//     <div className="profile-page">
//       <h1 className="profile-title">My Profile</h1>
//       <p className="profile-subtitle">
//         Manage your personal information and study preferences
//       </p>

//       <div className="profile-card">
//         {/* Avatar */}
//         <div className="profile-avatar-section">
//           <div className="profile-avatar">A</div>
//           <h2 className="profile-name">Alok Kumar</h2>
//           <p className="profile-email">alok.kumar@example.com</p>
//         </div>

//         {/* Info */}
//         <div className="profile-info-grid">
//           <div className="info-box">
//             <span className="label">Course</span>
//             <span>MCA</span>
//           </div>

//           <div className="info-box">
//             <span className="label">College</span>
//             <span>MNNIT Allahabad</span>
//           </div>

//           <div className="info-box">
//             <span className="label">Interests</span>
//             <span>DSA, Web Development</span>
//           </div>

//           <div className="info-box">
//             <span className="label">Study Sessions</span>
//             <span>5 Joined</span>
//           </div>
//         </div>

//         {/* Buttons */}
//         <div className="profile-actions">
//           <button className="btn-primary">Edit Profile</button>
//           <button className="btn-secondary">Logout</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;


  
import React from "react";
import { Link } from "react-router-dom"; // Navigation ke liye zaroori hai
import "./Profile.css";
import "./Home.css"; // Navbar ki styling isi file mein hai

const Profile = () => {
  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">Collab-Hub</div>

        <div className="nav-links">
          <Link className="nav-item" to="/Home">🏠 Home</Link>
          <Link className="nav-item" to="/Dashboard">📊 Dashboard</Link>
          <Link className="nav-item active" to="/profile">👤 Profile</Link>
          <Link className="nav-item" to="/CreateRequest">➕ Create Request</Link>
        </div>
      </nav>

      {/* PROFILE CONTENT */}
      <div className="profile-page">
        <h1 className="profile-title">My Profile</h1>
        <p className="profile-subtitle">
          Manage your personal information and study preferences
        </p>

        <div className="profile-card">
          {/* Avatar */}
          <div className="profile-avatar-section">
            <div className="profile-avatar">A</div>
            <h2 className="profile-name">Alok Kumar</h2>
            <p className="profile-email">alok.kumar@example.com</p>
          </div>

          {/* Info */}
          <div className="profile-info-grid">
            <div className="info-box">
              <span className="label">Course</span>
              <span>MCA</span>
            </div>

            <div className="info-box">
              <span className="label">College</span>
              <span>MNNIT Allahabad</span>
            </div>

            <div className="info-box">
              <span className="label">Interests</span>
              <span>DSA, Web Development</span>
            </div>

            <div className="info-box">
              <span className="label">Study Sessions</span>
              <span>5 Joined</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="profile-actions">
            <button className="btn-primary">Edit Profile</button>
            <button className="btn-secondary">Logout</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;