// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, API_BASE } from "../api";
import "../App.css";

const AVATAR_PRESETS = [
  { id: 0, gradient: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" },
  { id: 1, gradient: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)" },
  { id: 2, gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
  { id: 3, gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" },
  { id: 4, gradient: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)" },
  { id: 5, gradient: "linear-gradient(135deg, #1f2937 0%, #111827 100%)" }
];

const Navbar = ({ activePage }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [meetings, setMeetings] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    setCurrentUser(auth.currentUser);
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const resRequests = await fetch(`${API_BASE}/api/requests`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("collabhub_auth_token")}`
        }
      });
      if (!resRequests.ok) return;
      const allRequests = await resRequests.json();

      // Joined/created groups only
      const userGroups = allRequests.filter(req => req.members && req.members.includes(user.uid));

      const meetingsPromises = userGroups.map(async (group) => {
        try {
          const resMeetings = await fetch(`${API_BASE}/api/meetings/${group.id}`, {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("collabhub_auth_token")}`
            }
          });
          if (resMeetings.ok) {
            const groupMeetings = await resMeetings.json();
            return groupMeetings.map(m => ({ ...m, groupTitle: group.title }));
          }
        } catch (e) {
          console.error(e);
        }
        return [];
      });

      const allMeetingsNested = await Promise.all(meetingsPromises);
      const allMeetings = allMeetingsNested.flat();

      // Sort by date (soonest first)
      allMeetings.sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.time}`);
        const dateTimeB = new Date(`${b.date}T${b.time}`);
        return dateTimeA - dateTimeB;
      });

      setMeetings(allMeetings);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const renderAvatar = () => {
    if (!currentUser) return null;
    const isActive = activePage === "profile";
    if (currentUser.customAvatarUrl) {
      return (
        <img
          src={currentUser.customAvatarUrl}
          alt="Profile"
          className={`nav-avatar-img ${isActive ? "active" : ""}`}
          onClick={() => navigate("/Profile")}
        />
      );
    } else {
      const preset = AVATAR_PRESETS[currentUser.avatarPreset || 0] || AVATAR_PRESETS[0];
      return (
        <div
          className={`nav-avatar-circle ${isActive ? "active" : ""}`}
          style={{ background: preset.gradient }}
          onClick={() => navigate("/Profile")}
        >
          {(currentUser.displayName || currentUser.email || "U")[0].toUpperCase()}
        </div>
      );
    }
  };

  // Only show upcoming meetings in notifications (e.g. date today or in future)
  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingMeetings = meetings.filter(m => m.date >= todayStr);

  return (
    <div className="navbar">
      <div className="logo" style={{ cursor: "pointer" }} onClick={() => navigate("/Home")}>
        <i className="fa-solid fa-graduation-cap" style={{ background: "var(--accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}></i>
        <span>Collab-Hub</span>
      </div>

      <div className="nav-links">
        <a className={`nav-item ${activePage === "home" ? "active" : ""}`} href="/Home">
          <i className="fa-solid fa-house"></i> Home
        </a>
        <a className={`nav-item ${activePage === "dashboard" ? "active" : ""}`} href="/Dashboard">
          <i className="fa-solid fa-chart-line"></i> Dashboard
        </a>

        {/* Notification Panel */}
        <div className="notification-container">
          <button 
            className={`notification-bell-btn ${showNotifications ? "active" : ""}`} 
            onClick={() => setShowNotifications(!showNotifications)}
            title="Meeting Notifications"
          >
            <i className="fa-solid fa-bell"></i>
            {upcomingMeetings.length > 0 && (
              <span className="notification-badge">{upcomingMeetings.length}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown glass-card">
              <div className="notification-dropdown-header">
                <h3><i className="fa-regular fa-calendar-check" style={{ marginRight: "8px", color: "var(--accent-primary)" }}></i>Study Sessions</h3>
                {upcomingMeetings.length > 0 && (
                  <span className="notification-count-label">{upcomingMeetings.length} Upcoming</span>
                )}
              </div>
              <div className="notification-list">
                {upcomingMeetings.length === 0 ? (
                  <div className="notification-empty">
                    <i className="fa-regular fa-calendar-times" style={{ fontSize: "24px", display: "block", marginBottom: "8px", color: "var(--text-muted)" }}></i>
                    <p>No upcoming study sessions scheduled.</p>
                  </div>
                ) : (
                  upcomingMeetings.map(m => (
                    <div key={m.id || m._id} className="notification-item">
                      <div className="notification-item-dot"></div>
                      <div className="notification-item-content">
                        <span className="notification-group-title">{m.groupTitle}</span>
                        <strong className="notification-meeting-title">{m.title}</strong>
                        <span className="notification-meeting-time">
                          <i className="fa-regular fa-clock" style={{ marginRight: "4px", color: "var(--text-muted)" }}></i> {m.date} at {m.time} | <i className="fa-solid fa-location-dot" style={{ marginLeft: "6px", marginRight: "4px", color: "var(--text-muted)" }}></i> {m.location}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="nav-avatar-container">
          {renderAvatar()}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
