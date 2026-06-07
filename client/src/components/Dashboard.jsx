// src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, getDocs, API_BASE, deleteGroup, leaveGroup } from "../api";
import "./Dashboard.css";
import Navbar from "./Navbar";

const Dashboard = () => {
  const [userName, setUserName] = useState("");
  
  // Data list states
  const [createdGroups, setCreatedGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [incomingJoinRequests, setIncomingJoinRequests] = useState([]);
  const [incomingInvitations, setIncomingInvitations] = useState([]);
  const [usersList, setUsersList] = useState([]);

  const navigate = useNavigate();

  const parseGroupDescription = (description) => {
    let data = { text: description, comms: "Not Specified", difficulty: "General", frequency: "Not Specified", maxSize: 5, tags: [] };
    try {
      const parsed = JSON.parse(description);
      if (parsed && typeof parsed === "object" && parsed.text !== undefined) {
        data = { ...data, ...parsed };
      }
    } catch (e) {}
    return data;
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserName(user.displayName || user.email);
    } else {
      navigate("/");
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // 1. Fetch study requests
      const q = { path: "requests" };
      const snapshot = await getDocs(q);
      const allRequests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter groups created by you
      const created = allRequests.filter(req => req.creatorUid === user.uid);
      setCreatedGroups(created);

      // Filter groups joined by you
      const joined = allRequests.filter(req => req.members && req.members.includes(user.uid) && req.creatorUid !== user.uid);
      setJoinedGroups(joined);

      // 2. Fetch users directory list
      const uSnapshot = await getDocs({ path: "users" });
      const allUsers = uSnapshot.docs.map(doc => doc.data());
      setUsersList(allUsers);

      // 3. Fetch join and invite requests
      const jrSnapshot = await getDocs({ path: "join-requests" });
      const allJoinRequests = jrSnapshot.docs.map(doc => {
        const d = doc.data();
        d.id = doc.id;
        return d;
      });

      // Join requests sent to your owned groups
      const incoming = allJoinRequests.filter(r => r.groupCreatorUid === user.uid && (!r.type || r.type === "join") && r.status === "pending");
      setIncomingJoinRequests(incoming);

      // Invitations sent to you
      const invites = allJoinRequests.filter(r => r.receiverUid === user.uid && r.type === "invite" && r.status === "pending");
      setIncomingInvitations(invites);
    } catch (e) {
      console.error("Error fetching dashboard data:", e);
    }
  };

  const handleAcceptJoinRequest = async (reqId, groupId, senderUid, senderName) => {
    try {
      const res = await fetch(`${API_BASE}/api/join-requests/${reqId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("collabhub_auth_token")}`
        },
        body: JSON.stringify({ status: "accepted" })
      });
      if (!res.ok) {
        throw new Error("Server error approving request");
      }

      alert(`Successfully added ${senderName} to your group!`);
      fetchDashboardData();
    } catch (e) {
      alert("Error accepting request: " + e.message);
    }
  };

  const handleDeclineJoinRequest = async (reqId, senderName) => {
    try {
      const res = await fetch(`${API_BASE}/api/join-requests/${reqId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("collabhub_auth_token")}`
        },
        body: JSON.stringify({ status: "declined" })
      });
      if (!res.ok) {
        throw new Error("Server error declining request");
      }

      alert(`Declined join request from ${senderName}.`);
      fetchDashboardData();
    } catch (e) {
      alert("Error declining request: " + e.message);
    }
  };

  const handleDeleteGroup = async (groupId, groupTitle) => {
    if (!window.confirm(`Are you sure you want to permanently delete the group "${groupTitle}"? This will remove all chats and sessions.`)) return;
    try {
      await deleteGroup(groupId);
      alert("Study group and all associated records deleted successfully!");
      fetchDashboardData();
    } catch (err) {
      alert("Error deleting group: " + err.message);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (!window.confirm("Are you sure you want to leave this study group?")) return;
    try {
      await leaveGroup(groupId);
      alert("You have successfully left the study group.");
      fetchDashboardData();
    } catch (err) {
      alert("Error leaving group: " + err.message);
    }
  };

  const handleAcceptInvite = async (reqId, groupTitle) => {
    try {
      const res = await fetch(`${API_BASE}/api/join-requests/${reqId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("collabhub_auth_token")}`
        },
        body: JSON.stringify({ status: "accepted" })
      });
      if (!res.ok) {
        throw new Error("Server error approving invitation");
      }
      alert(`Successfully joined study group "${groupTitle}"!`);
      fetchDashboardData();
    } catch (e) {
      alert("Error accepting invitation: " + e.message);
    }
  };

  const handleDeclineInvite = async (reqId, groupTitle) => {
    try {
      const res = await fetch(`${API_BASE}/api/join-requests/${reqId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("collabhub_auth_token")}`
        },
        body: JSON.stringify({ status: "declined" })
      });
      if (!res.ok) {
        throw new Error("Server error declining invitation");
      }
      alert(`Declined invitation to join "${groupTitle}".`);
      fetchDashboardData();
    } catch (e) {
      alert("Error declining invitation: " + e.message);
    }
  };


  // Helper to lookup usernames of members in a group
  const getGroupMembersNames = (memberUids = []) => {
    const names = memberUids
      .map(uid => {
        const found = usersList.find(u => u.uid === uid);
        return found ? (found.displayName || found.email) : "Unknown Student";
      });
    return names.length > 0 ? names.join(", ") : "None";
  };

  return (
    <>
      {/* NAVBAR */}
      <Navbar activePage="dashboard" />

      {/* MAIN CONTENT */}
      <div className="dashboard-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", marginBottom: "24px", gap: "15px" }}>
          <div>
            <h1 style={{ marginBottom: "8px" }}>Dashboard Overview</h1>
            <p className="subtitle" style={{ margin: 0 }}>Welcome back, {userName}! Manage your study teams and group memberships.</p>
          </div>
          <button
            className="btn-premium"
            onClick={() => navigate("/create-request")}
            style={{ padding: "10px 20px", fontSize: "14px", height: "fit-content" }}
          >
            <i className="fa-solid fa-plus-circle"></i> Create Group
          </button>
        </div>

        {/* STATS */}
        <div className="stats">
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <i className="fa-solid fa-folder-plus"></i>
            </div>
            <div className="stat-info">
              <h2>{createdGroups.length}</h2>
              <p>Groups Created</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper icon-teal">
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div className="stat-info">
              <h2>{joinedGroups.length}</h2>
              <p>Groups Joined</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper icon-amber">
              <i className="fa-solid fa-bell"></i>
            </div>
            <div className="stat-info">
              <h2>{incomingJoinRequests.length}</h2>
              <p>Pending Join Requests</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper icon-purple">
              <i className="fa-solid fa-users"></i>
            </div>
            <div className="stat-info">
              <h2>{createdGroups.length + joinedGroups.length}</h2>
              <p>Total Study Circles</p>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* LEFT PANEL: GROUPS LISTS */}
          <div className="dashboard-col">
            {/* GROUPS CREATED BY YOU */}
            <div className="dashboard-panel glass-card">
              <div className="panel-header-row">
                <div className="panel-header-icon">
                  <i className="fa-solid fa-graduation-cap"></i>
                </div>
                <div>
                  <h2>Groups Created by You</h2>
                  <p className="panel-sub">Study circles you own and host</p>
                </div>
              </div>

              {createdGroups.length === 0 ? (
                <div className="empty-dashboard-state">
                  <div className="empty-state-icon">
                    <i className="fa-regular fa-folder-open"></i>
                  </div>
                  <p className="empty-message">You haven't created any study groups yet.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {createdGroups.map(group => {
                    const parsedDesc = parseGroupDescription(group.description);
                    const totalMembers = group.members ? group.members.length : 1;
                    const maxCapacity = parsedDesc.maxSize;
                    return (
                      <div key={group.id} className="invitation-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                          <span className="tag">{group.subject}</span>
                          <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 700 }}>
                            {totalMembers} / {maxCapacity} seats filled
                          </span>
                        </div>
                        <h3 style={{ fontSize: "17px", fontWeight: "700" }}>{group.title}</h3>
                        
                        {/* Chips Row */}
                        <div className="meta-chips-row" style={{ marginTop: "4px", marginBottom: "8px" }}>
                          {parsedDesc.comms !== "Not Specified" && (
                            <span className="meta-chip"><i className="fa-solid fa-comments"></i> {parsedDesc.comms}</span>
                          )}
                          {parsedDesc.difficulty !== "General" && (
                            <span className="meta-chip"><i className="fa-solid fa-gauge-simple"></i> {parsedDesc.difficulty}</span>
                          )}
                          {parsedDesc.frequency !== "Not Specified" && (
                            <span className="meta-chip"><i className="fa-solid fa-calendar-day"></i> {parsedDesc.frequency}</span>
                          )}
                        </div>

                        <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: "1.5" }}>{parsedDesc.text}</p>
                        
                        {/* Tags */}
                        {parsedDesc.tags && parsedDesc.tags.length > 0 && (
                          <div className="card-tags-container" style={{ marginBottom: "12px", marginTop: "0" }}>
                            {parsedDesc.tags.map((tag, idx) => (
                              <span key={idx} className="card-tag">#{tag}</span>
                            ))}
                          </div>
                        )}

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "10px", width: "100%", marginTop: "10px" }}>
                          <div style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
                            <strong style={{ color: "var(--text-secondary)" }}>Members: </strong>
                            {getGroupMembersNames(group.members)}
                          </div>
                          <button
                            onClick={() => handleDeleteGroup(group.id, group.title)}
                            style={{
                              background: "rgba(239, 68, 68, 0.12)",
                              border: "1px solid rgba(239, 68, 68, 0.25)",
                              color: "#f87171",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              fontSize: "12.5px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontWeight: "600",
                              transition: "all 0.2s"
                            }}
                          >
                            <i className="fa-solid fa-trash-can"></i> Delete Group
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* JOINED GROUPS */}
            <div className="dashboard-panel glass-card">
              <div className="panel-header-row">
                <div className="panel-header-icon icon-teal">
                  <i className="fa-solid fa-circle-check"></i>
                </div>
                <div>
                  <h2>Joined Study Groups</h2>
                  <p className="panel-sub">Classes and topics you study with others</p>
                </div>
              </div>

              {joinedGroups.length === 0 ? (
                <div className="empty-dashboard-state">
                  <div className="empty-state-icon">
                    <i className="fa-regular fa-circle-question"></i>
                  </div>
                  <p className="empty-message">You haven't joined any other study groups yet.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {joinedGroups.map(group => {
                    const parsedDesc = parseGroupDescription(group.description);
                    const totalMembers = group.members ? group.members.length : 1;
                    const maxCapacity = parsedDesc.maxSize;
                    return (
                      <div key={group.id} className="invitation-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                          <span className="tag">{group.subject}</span>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
                            👤 Creator: {group.creatorName}
                          </span>
                        </div>
                        <h3 style={{ fontSize: "17px", fontWeight: "700" }}>{group.title}</h3>

                        {/* Chips Row */}
                        <div className="meta-chips-row" style={{ marginTop: "4px", marginBottom: "8px" }}>
                          <span className="meta-chip"><i className="fa-solid fa-users"></i> {totalMembers}/{maxCapacity} Seats</span>
                          {parsedDesc.comms !== "Not Specified" && (
                            <span className="meta-chip"><i className="fa-solid fa-comments"></i> {parsedDesc.comms}</span>
                          )}
                          {parsedDesc.difficulty !== "General" && (
                            <span className="meta-chip"><i className="fa-solid fa-gauge-simple"></i> {parsedDesc.difficulty}</span>
                          )}
                        </div>

                        <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: "1.5" }}>{parsedDesc.text}</p>
                        
                        {/* Tags */}
                        {parsedDesc.tags && parsedDesc.tags.length > 0 && (
                          <div className="card-tags-container" style={{ marginBottom: "12px", marginTop: "0" }}>
                            {parsedDesc.tags.map((tag, idx) => (
                              <span key={idx} className="card-tag">#{tag}</span>
                            ))}
                          </div>
                        )}

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "10px", width: "100%", marginTop: "10px" }}>
                          <div style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
                            <strong style={{ color: "var(--text-secondary)" }}>Study Circle: </strong>
                            {getGroupMembersNames(group.members)}
                          </div>
                          <button
                            onClick={() => handleLeaveGroup(group.id)}
                            style={{
                              background: "rgba(239, 68, 68, 0.12)",
                              border: "1px solid rgba(239, 68, 68, 0.25)",
                              color: "#f87171",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              fontSize: "12.5px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontWeight: "600",
                              transition: "all 0.2s"
                            }}
                          >
                            <i className="fa-solid fa-arrow-right-from-bracket"></i> Leave Group
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: JOIN GROUP REQUESTS & TEAM INVITATIONS */}
          <div className="dashboard-col">
            {/* JOIN GROUP REQUESTS SENT TO YOU */}
            <div className="dashboard-panel glass-card">
              <div className="panel-header-row">
                <div className="panel-header-icon icon-amber">
                  <i className="fa-solid fa-bell"></i>
                </div>
                <div>
                  <h2>Join Group Requests</h2>
                  <p className="panel-sub">Students asking to join your study circles</p>
                </div>
              </div>

              {incomingJoinRequests.length === 0 ? (
                <div className="empty-dashboard-state" style={{ height: "100%" }}>
                  <div className="empty-state-icon">
                    <i className="fa-regular fa-envelope"></i>
                  </div>
                  <p className="empty-message">All caught up! No pending join requests.</p>
                </div>
              ) : (
                <div className="invitations-list">
                  {incomingJoinRequests.map(req => (
                    <div key={req.id} className="invitation-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <div className="sender-avatar">
                            {(req.senderName || "S")[0].toUpperCase()}
                          </div>
                          <div>
                            <strong style={{ display: "block", fontSize: "14.5px" }}>{req.senderName}</strong>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{req.senderEmail}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ background: "rgba(255,255,255,0.02)", width: "100%", padding: "10px 14px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Wants to join your group:</span>
                        <strong style={{ display: "block", fontSize: "13.5px", marginTop: "2px", color: "var(--text-primary)" }}>{req.groupTitle}</strong>
                      </div>

                      <div className="invitation-actions" style={{ width: "100%", justifyContent: "flex-end", marginTop: "6px" }}>
                        <button
                          onClick={() => handleAcceptJoinRequest(req.id, req.groupId, req.senderUid, req.senderName)}
                          className="btn-accept"
                        >
                          <i className="fa-solid fa-check"></i> Approve
                        </button>
                        <button
                          onClick={() => handleDeclineJoinRequest(req.id, req.senderName)}
                          className="btn-decline"
                        >
                          <i className="fa-solid fa-xmark"></i> Ignore
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* INCOMING INVITATIONS */}
            <div className="dashboard-panel glass-card">
              <div className="panel-header-row">
                <div className="panel-header-icon icon-purple">
                  <i className="fa-solid fa-envelope-open-text"></i>
                </div>
                <div>
                  <h2>Invitations from Creators</h2>
                  <p className="panel-sub">Invitations to join other student's study teams</p>
                </div>
              </div>

              {incomingInvitations.length === 0 ? (
                <div className="empty-dashboard-state" style={{ height: "100%" }}>
                  <div className="empty-state-icon">
                    <i className="fa-regular fa-envelope"></i>
                  </div>
                  <p className="empty-message">No pending team invitations.</p>
                </div>
              ) : (
                <div className="invitations-list">
                  {incomingInvitations.map(invite => (
                    <div key={invite.id} className="invitation-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <div className="sender-avatar" style={{ background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)" }}>
                            {(invite.senderName || "S")[0].toUpperCase()}
                          </div>
                          <div>
                            <strong style={{ display: "block", fontSize: "14.5px" }}>{invite.senderName}</strong>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{invite.senderEmail}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ background: "rgba(255,255,255,0.02)", width: "100%", padding: "10px 14px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Invited you to join:</span>
                        <strong style={{ display: "block", fontSize: "13.5px", marginTop: "2px", color: "var(--text-primary)" }}>{invite.groupTitle}</strong>
                      </div>

                      <div className="invitation-actions" style={{ width: "100%", justifyContent: "flex-end", marginTop: "6px" }}>
                        <button
                          onClick={() => handleAcceptInvite(invite.id, invite.groupTitle)}
                          className="btn-accept"
                        >
                          <i className="fa-solid fa-check"></i> Accept
                        </button>
                        <button
                          onClick={() => handleDeclineInvite(invite.id, invite.groupTitle)}
                          className="btn-decline"
                        >
                          <i className="fa-solid fa-xmark"></i> Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
