// import React from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { auth } from "../firebase";
// import { signOut } from "firebase/auth";

// const Navbar = () => {
//   const navigate = useNavigate();

//   const handleLogout = async () => {
//     await signOut(auth);
//     localStorage.removeItem("userLoggedIn");
//     navigate("/");
//   };

//   return (
//     <nav className="navbar">
//       <div className="logo">Collab-Hub</div>
//       <div className="nav-links">
//         <Link className="nav-item" to="/Home">🏠 Home</Link>
//         <Link className="nav-item" to="/dashboard">📊 Dashboard</Link>
//         <Link className="nav-item" to="/profile">👤 Profile</Link>
//         <Link className="nav-item" to="/CreateRequest">➕ Create Request</Link>
//         {/* <button onClick={handleLogout} className="logout-btn">Logout</button> */}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;


import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // useLocation add kiya
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Current path pata karne ke liye
  const [streak, setStreak] = useState(0);
  const user = auth.currentUser;

  // Real-time Streak Listener
  useEffect(() => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setStreak(doc.data().streak || 5);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("userLoggedIn");
    navigate("/");
  };

  // Function to check if link is active
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/Home" className="logo-placeholder" style={{ textDecoration: 'none' }}>
          Collab-Hub
        </Link>
      </div>

      <div className="nav-right">
        {/* Conditional class "active" apply hogi based on URL */}
        {/* <Link className={`nav-item ${isActive("/Home") ? "active" : ""}`} to="/Home">
          Home
        </Link>
        <Link className={`nav-item ${isActive("/dashboard") ? "active" : ""}`} to="/dashboard">
          Dashboard
        </Link>
        <Link className={`nav-item ${isActive("/profile") ? "active" : ""}`} to="/profile">
          Profile
        </Link> */}
        
        <button 
          className={`cta-button ${isActive("/Home") ? "active-cta" : ""}`} 
          onClick={() => navigate("/Home")}
        >
          Home
        </button>
        
        <button 
          className={`cta-button ${isActive("/dashboard") ? "active-cta" : ""}`} 
          onClick={() => navigate("/dashboard")}
        >
          Dashboard
        </button>
        
        <button 
          className={`cta-button ${isActive("/profile") ? "active-cta" : ""}`} 
          onClick={() => navigate("/profile")}
        >
          Profile
        </button>

        {/* Create Request button standard primary style mein rahega */}
        <button 
          className={`cta-button ${isActive("/CreateRequest") ? "active-cta" : ""}`} 
          onClick={() => navigate("/CreateRequest")}
        >
          Create Request
        </button>

        
      </div>
    </nav>
  );
};

export default Navbar;