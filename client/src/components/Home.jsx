// src/components/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, getDocs, API_BASE, leaveGroup } from "../api";
import { io } from "socket.io-client";
import "./Home.css";
import Navbar from "./Navbar";

const AVATAR_PRESETS = [
  { id: 0, gradient: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)", label: "Indigo Glow" },
  { id: 1, gradient: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)", label: "Sunset Blush" },
  { id: 2, gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)", label: "Emerald Gate" },
  { id: 3, gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", label: "Amber Sun" },
  { id: 4, gradient: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)", label: "Cyber Ocean" },
  { id: 5, gradient: "linear-gradient(135deg, #1f2937 0%, #111827 100%)", label: "Carbon Dark" }
];

function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState("requests"); // "requests" or "students"
  const [searchQuery, setSearchQuery] = useState("");
  
  // Data lists
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [sentTeamRequests, setSentTeamRequests] = useState([]);
  const [sentJoinRequests, setSentJoinRequests] = useState([]);
  
  // Feature 1: Chat room states
  const [activeChatGroup, setActiveChatGroup] = useState(null); // holds group object
  const [chatMessages, setChatMessages] = useState([]);
  const [newMsgContent, setNewMsgContent] = useState("");

  // Feature 2: Meeting scheduler states
  const [meetingsMap, setMeetingsMap] = useState({}); // groupId -> array of meetings
  const [schedulingGroupId, setSchedulingGroupId] = useState(null); // groupId being scheduled
  const [meetingForm, setMeetingForm] = useState({
    title: "",
    date: "",
    time: "",
    location: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const user = auth.currentUser;
    if (user) {
      setCurrentUser(user);
    } else {
      navigate("/");
      return;
    }

    fetchRequests();
    fetchStudents();
    fetchSentTeamRequests();
    fetchSentJoinRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const [socket, setSocket] = useState(null);

  // Setup socket client
  useEffect(() => {
    const socketInstance = io(API_BASE);
    setSocket(socketInstance);
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Listen to socket chats instead of interval polling
  useEffect(() => {
    if (!socket) return;
    if (activeChatGroup) {
      fetchChatMessages(activeChatGroup.id);
      socket.emit("join_room", activeChatGroup.id);

      const handleNewMessage = (newMsg) => {
        if (newMsg.groupId === activeChatGroup.id) {
          setChatMessages((prev) => {
            if (prev.some(m => (m._id || m.id) === (newMsg._id || newMsg.id))) {
              return prev;
            }
            return [...prev, newMsg];
          });
        }
      };

      socket.on("new_message", handleNewMessage);

      return () => {
        socket.emit("leave_room", activeChatGroup.id);
        socket.off("new_message", handleNewMessage);
      };
    }
  }, [socket, activeChatGroup]);

  const fetchRequests = async () => {
    try {
      const q = { path: "requests" }; // query targeting mock database collection
      const snapshot = await getDocs(q);
      const reqList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort by timestamp desc
      reqList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setRequests(reqList);

      // Fetch meetings for all requests
      reqList.forEach(req => {
        fetchMeetingsForGroup(req.id);
      });
    } catch (e) {
      console.error("Error fetching study requests:", e);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/users`);
      const usersList = await response.json();
      // Exclude logged in user
      const filtered = usersList.filter(u => u.uid !== auth.currentUser?.uid);
      setStudents(filtered);
    } catch (e) {
      console.error("Error fetching students list:", e);
    }
  };

  const fetchSentTeamRequests = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/join-requests`);
      const allReqs = await response.json();
      const filtered = allReqs.filter(r => r.senderUid === auth.currentUser?.uid && r.type === "invite");
      setSentTeamRequests(filtered);
    } catch (e) {
      console.error("Error fetching team requests:", e);
    }
  };

  const fetchSentJoinRequests = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/join-requests`);
      const allReqs = await response.json();
      const filtered = allReqs.filter(r => r.senderUid === auth.currentUser?.uid);
      setSentJoinRequests(filtered);
    } catch (e) {
      console.error("Error fetching join requests:", e);
    }
  };

  // --- Feature 1: Chat Methods ---
  const fetchChatMessages = async (groupId) => {
    try {
      const res = await fetch(`${API_BASE}/api/messages/${groupId}`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
      }
    } catch (e) {
      console.error("Error loading chat messages:", e);
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!newMsgContent.trim() || !activeChatGroup || !currentUser) return;

    try {
      const res = await fetch(`${API_BASE}/api/messages`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("collabhub_auth_token")}`
        },
        body: JSON.stringify({
          groupId: activeChatGroup.id,
          senderUid: currentUser.uid,
          senderName: currentUser.displayName || currentUser.email,
          senderEmail: currentUser.email,
          content: newMsgContent
        })
      });
      if (res.ok) {
        setNewMsgContent("");
      }
    } catch (e) {
      alert("Error sending message: " + e.message);
    }
  };

  // --- Feature 2: Meeting Methods ---
  const fetchMeetingsForGroup = async (groupId) => {
    try {
      const res = await fetch(`${API_BASE}/api/meetings/${groupId}`);
      if (res.ok) {
        const data = await res.json();
        setMeetingsMap(prev => ({ ...prev, [groupId]: data }));
      }
    } catch (e) {
      console.error("Error loading group meetings:", e);
    }
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    if (!schedulingGroupId || !currentUser) return;

    try {
      const res = await fetch(`${API_BASE}/api/meetings`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("collabhub_auth_token")}`
        },
        body: JSON.stringify({
          groupId: schedulingGroupId,
          title: meetingForm.title,
          date: meetingForm.date,
          time: meetingForm.time,
          location: meetingForm.location,
          creatorUid: currentUser.uid
        })
      });

      if (res.ok) {
        alert("Study session scheduled successfully!");
        setMeetingForm({ title: "", date: "", time: "", location: "" });
        fetchMeetingsForGroup(schedulingGroupId);
        setSchedulingGroupId(null);
      }
    } catch (e) {
      alert("Error scheduling session: " + e.message);
    }
  };

  const handleRSVPMeeting = async (meetingId, groupId, currentRSVPStatus) => {
    if (!currentUser) return;

    try {
      const res = await fetch(`${API_BASE}/api/meetings/${meetingId}/rsvp`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("collabhub_auth_token")}`
        },
        body: JSON.stringify({
          userUid: currentUser.uid,
          rsvpStatus: !currentRSVPStatus // toggles between true (join) and false (leave)
        })
      });

      if (res.ok) {
        fetchMeetingsForGroup(groupId);
      }
    } catch (e) {
      alert("Error updating RSVP: " + e.message);
    }
  };

  const handleJoinSession = async (req) => {
    if (!currentUser) return;

    if (req.creatorUid === currentUser.uid) {
      alert("You cannot join your own study group!");
      return;
    }
    
    // Check if already a member
    if (req.members && req.members.includes(currentUser.uid)) {
      alert("You are already a member of this study group!");
      return;
    }

    // Check if there is already a pending request
    const hasPending = sentJoinRequests.some(r => r.groupId === req.id && r.status === "pending");
    if (hasPending) {
      alert("Your join request for this group is already pending approval!");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/join-requests`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("collabhub_auth_token")}`
        },
        body: JSON.stringify({
          groupId: req.id,
          groupTitle: req.title,
          groupCreatorUid: req.creatorUid,
          senderUid: currentUser.uid,
          senderName: currentUser.displayName || currentUser.email,
          senderEmail: currentUser.email,
          receiverUid: req.creatorUid
        })
      });

      if (response.ok) {
        alert(`Join request sent to ${req.creatorName}! You will be added once they approve.`);
        fetchSentJoinRequests();
      }
    } catch (e) {
      alert("Failed to send join request: " + e.message);
    }
  };

  const handleSendTeamRequest = async (student) => {
    if (!currentUser) return;

    // Check if an invitation was already sent to this student
    const alreadySent = sentTeamRequests.some(r => r.receiverUid === student.uid && r.status === "pending");
    if (alreadySent) {
      alert(`You have already sent a pending team invitation to ${student.displayName || student.email}!`);
      return;
    }

    // Filter groups created by current user
    const myGroups = requests.filter(r => r.creatorUid === currentUser.uid);
    if (myGroups.length === 0) {
      alert("You need to create a study group first before you can invite other students!");
      return;
    }

    let selectedGroup = null;
    if (myGroups.length === 1) {
      selectedGroup = myGroups[0];
    } else {
      const groupOptions = myGroups.map((g, i) => `${i + 1}. ${g.title}`).join("\n");
      const choice = window.prompt(`Which study group do you want to invite ${student.displayName || "this student"} to?\n\nChoose a number:\n${groupOptions}`);
      if (choice === null) return; // user cancelled
      const idx = parseInt(choice) - 1;
      if (isNaN(idx) || idx < 0 || idx >= myGroups.length) {
        alert("Invalid selection choice.");
        return;
      }
      selectedGroup = myGroups[idx];
    }

    try {
      const response = await fetch(`${API_BASE}/api/join-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("collabhub_auth_token")}`
        },
        body: JSON.stringify({
          groupId: selectedGroup.id,
          groupTitle: selectedGroup.title,
          groupCreatorUid: currentUser.uid,
          senderUid: currentUser.uid,
          senderName: currentUser.displayName || currentUser.email,
          senderEmail: currentUser.email,
          receiverUid: student.uid,
          type: "invite"
        })
      });

      if (response.ok) {
        alert(`Invitation to join "${selectedGroup.title}" sent successfully to ${student.displayName || student.email}!`);
        fetchSentTeamRequests();
      } else {
        const errData = await response.json();
        alert("Error sending invitation: " + (errData.error || "Unknown error"));
      }
    } catch (e) {
      alert("Error sending invitation: " + e.message);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (!window.confirm("Are you sure you want to leave this study group?")) return;
    try {
      await leaveGroup(groupId);
      alert("You have left the study group successfully!");
      fetchRequests();
    } catch (err) {
      alert("Error leaving group: " + err.message);
    }
  };


  // Filter study requests
  const filteredRequests = requests.filter(req => {
    const queryStr = searchQuery.toLowerCase();
    return (
      req.title.toLowerCase().includes(queryStr) ||
      req.subject.toLowerCase().includes(queryStr) ||
      req.description.toLowerCase().includes(queryStr) ||
      (req.creatorName && req.creatorName.toLowerCase().includes(queryStr))
    );
  });

  // Filter students
  const filteredStudents = students.filter(student => {
    const queryStr = searchQuery.toLowerCase();
    return (
      (student.displayName && student.displayName.toLowerCase().includes(queryStr)) ||
      (student.interests && student.interests.toLowerCase().includes(queryStr)) ||
      (student.course && student.course.toLowerCase().includes(queryStr)) ||
      (student.college && student.college.toLowerCase().includes(queryStr))
    );
  });

  return (
    <>
      {/* NAVBAR */}
      <Navbar activePage="home" />

      {/* MAIN CONTENT */}
      <div className="home-page-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", marginBottom: "20px" }}>
          <div>
            <h1>{activeView === "requests" ? "Available Study Groups" : "Browse College Students"}</h1>
            <p className="subtitle">
              {activeView === "requests"
                ? "Browse and join study sessions posted by fellow students"
                : "Find other students, see their specialities, and request to form a team"}
            </p>
          </div>

          {/* Toggle Views */}
          <div className="view-toggle" style={{ 
            display: "inline-flex", 
            background: "rgba(255, 255, 255, 0.03)", 
            border: "1px solid var(--glass-border)", 
            padding: "4px", 
            borderRadius: "10px", 
            marginBottom: "20px" 
          }}>
            <button
              onClick={() => { setActiveView("requests"); setSearchQuery(""); }}
              style={{
                background: activeView === "requests" ? "rgba(99, 102, 241, 0.15)" : "transparent",
                color: activeView === "requests" ? "#818cf8" : "var(--text-secondary)",
                border: activeView === "requests" ? "1px solid rgba(99, 102, 241, 0.2)" : "1px solid transparent",
                padding: "8px 20px",
                fontWeight: "600",
                fontSize: "14.5px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease"
              }}
            >
              <i className="fa-solid fa-book-open"></i> Study Groups
            </button>
            <button
              onClick={() => { setActiveView("students"); setSearchQuery(""); }}
              style={{
                background: activeView === "students" ? "rgba(99, 102, 241, 0.15)" : "transparent",
                color: activeView === "students" ? "#818cf8" : "var(--text-secondary)",
                border: activeView === "students" ? "1px solid rgba(99, 102, 241, 0.2)" : "1px solid transparent",
                padding: "8px 20px",
                fontWeight: "600",
                fontSize: "14.5px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease"
              }}
            >
              <i className="fa-solid fa-user-graduate"></i> College Students
            </button>
          </div>
        </div>

        <input
          className="search-box"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={activeView === "requests" ? "Search by subject, title or creator..." : "Search students by name, course, or skills (e.g. React)..."}
        />

        {activeView === "requests" ? (
          <div className="cards">
            {filteredRequests.length === 0 ? (
              <p style={{ gridColumn: "1/-1", textAlign: "center", color: "#666", fontSize: "16px" }}>No study requests found.</p>
            ) : (
              filteredRequests.map(req => {
                const isMember = req.members && req.members.includes(currentUser?.uid);
                const meetings = meetingsMap[req.id] || [];

                // Parse dynamic serialized request meta description
                let requestData = { 
                  text: req.description, 
                  comms: "Not Specified", 
                  difficulty: "General", 
                  frequency: "Not Specified", 
                  maxSize: 5, 
                  tags: [] 
                };
                try {
                  const parsed = JSON.parse(req.description);
                  if (parsed && typeof parsed === "object" && parsed.text !== undefined) {
                    requestData = { ...requestData, ...parsed };
                  }
                } catch (e) {
                  // Legacy fallback
                }

                const totalMembers = req.members ? req.members.length : 1;
                const maxCapacity = requestData.maxSize;
                const isFull = totalMembers >= maxCapacity;

                return (
                  <div className="card" key={req.id} style={{ paddingBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                      <span className="tag" style={{ margin: 0 }}>{req.subject}</span>
                      <span style={{ fontSize: "12.5px", color: "var(--text-secondary)", fontWeight: 700 }}>
                        {totalMembers} / {maxCapacity} Filled
                      </span>
                    </div>
                    <h3>{req.title}</h3>

                    {/* Styled Chips for Comms, Level and Frequency */}
                    <div className="meta-chips-row">
                      {/* Comms */}
                      {requestData.comms === "Discord" && (
                        <span className="meta-chip comms-discord"><i className="fa-brands fa-discord"></i> Discord</span>
                      )}
                      {requestData.comms === "WhatsApp" && (
                        <span className="meta-chip comms-whatsapp"><i className="fa-brands fa-whatsapp"></i> WhatsApp</span>
                      )}
                      {requestData.comms === "Zoom / Google Meet" && (
                        <span className="meta-chip comms-zoom"><i className="fa-solid fa-video"></i> Zoom/Meet</span>
                      )}
                      {requestData.comms === "In-Person / Library" && (
                        <span className="meta-chip comms-inperson"><i className="fa-solid fa-location-dot"></i> In-Person</span>
                      )}
                      {requestData.comms !== "Discord" && requestData.comms !== "WhatsApp" && requestData.comms !== "Zoom / Google Meet" && requestData.comms !== "In-Person / Library" && requestData.comms !== "Not Specified" && (
                        <span className="meta-chip"><i className="fa-solid fa-comments"></i> {requestData.comms}</span>
                      )}

                      {/* Difficulty */}
                      {requestData.difficulty === "Beginner Friendly" && (
                        <span className="meta-chip diff-beginner"><i className="fa-solid fa-shield-halved"></i> Beginner</span>
                      )}
                      {requestData.difficulty === "Intermediate" && (
                        <span className="meta-chip diff-intermediate"><i className="fa-solid fa-bolt"></i> Intermediate</span>
                      )}
                      {requestData.difficulty === "Advanced Prep" && (
                        <span className="meta-chip diff-advanced"><i className="fa-solid fa-skull-crossbones"></i> Advanced</span>
                      )}
                      {requestData.difficulty !== "Beginner Friendly" && requestData.difficulty !== "Intermediate" && requestData.difficulty !== "Advanced Prep" && requestData.difficulty !== "General" && (
                        <span className="meta-chip"><i className="fa-solid fa-gauge-simple"></i> {requestData.difficulty}</span>
                      )}

                      {/* Frequency */}
                      {requestData.frequency !== "Not Specified" && (
                        <span className="meta-chip"><i className="fa-solid fa-calendar-day"></i> {requestData.frequency}</span>
                      )}
                    </div>

                    <p style={{ marginBottom: "14px" }}>{requestData.text}</p>

                    {/* Tags List */}
                    {requestData.tags && requestData.tags.length > 0 && (
                      <div className="card-tags-container">
                        {requestData.tags.map((tag, idx) => (
                          <span key={idx} className="card-tag">#{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* Progress Bar for Group Capacity */}
                    <div className="occupancy-section">
                      <div className="occupancy-header">
                        <span>Group Capacity</span>
                        <span>{totalMembers} / {maxCapacity} Seats</span>
                      </div>
                      <div className="occupancy-bar-bg">
                        <div 
                          className="occupancy-bar-fill" 
                          style={{ 
                            width: `${Math.min(100, (totalMembers / maxCapacity) * 100)}%`,
                            background: isFull ? "var(--danger-gradient)" : "var(--accent-gradient)" 
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Feature 2: Upcoming Meetings display inside card for members */}
                    {isMember && (
                      <div className="meetings-section">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", paddingBottom: "6px" }}>
                          <h4 style={{ fontSize: "13.5px", textTransform: "uppercase", color: "var(--accent-primary)", letterSpacing: "0.5px" }}><i className="fa-solid fa-calendar-days" style={{ marginRight: "6px" }}></i> Study Sessions</h4>
                          {isMember && (
                            <button className="meeting-add-btn" onClick={() => setSchedulingGroupId(req.id)}>
                              + Schedule
                            </button>
                          )}
                        </div>

                        {meetings.length === 0 ? (
                          <p style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", margin: "8px 0" }}>No upcoming sessions scheduled.</p>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                            {meetings.map(m => {
                              const userRsvp = m.rsvps && m.rsvps.includes(currentUser.uid);
                              return (
                                <div key={m.id} className="meeting-item">
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>{m.title}</strong>
                                    <button 
                                      className={`meeting-rsvp-btn ${userRsvp ? "active" : ""}`}
                                      onClick={() => handleRSVPMeeting(m.id, req.id, userRsvp)}
                                    >
                                      {userRsvp ? "Going ✓" : "RSVP"}
                                    </button>
                                  </div>
                                  <span style={{ display: "block", fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>
                                    <i className="fa-regular fa-clock" style={{ marginRight: "4px" }}></i> {m.date} at {m.time} | <i className="fa-solid fa-location-dot" style={{ marginLeft: "4px", marginRight: "4px" }}></i> {m.location}
                                  </span>
                                  <span style={{ display: "block", fontSize: "10.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                                    <i className="fa-solid fa-users" style={{ marginRight: "4px" }}></i> {m.rsvps ? m.rsvps.length : 1} RSVP'd
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="card-footer" style={{ marginBottom: "12px" }}>
                      <span><i className="fa-regular fa-calendar-days"></i> {new Date(req.timestamp).toLocaleDateString()}</span>
                      <span><i className="fa-solid fa-circle-user"></i> {req.creatorName || req.creatorEmail}</span>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      {req.creatorUid === currentUser?.uid ? (
                        <button
                          className="btn"
                          style={{
                            background: "rgba(99, 102, 241, 0.15)",
                            border: "1px solid rgba(99, 102, 241, 0.25)",
                            color: "#818cf8",
                            cursor: "default",
                            flex: 1
                          }}
                          disabled={true}
                        >
                          Creator
                        </button>
                      ) : isMember ? (
                        <div style={{ display: "flex", gap: "10px", flex: 1 }}>
                          <button
                            className="btn"
                            style={{
                              background: "#2e7d32",
                              cursor: "default",
                              flex: 1
                            }}
                            disabled={true}
                          >
                            Joined ✓
                          </button>
                          <button
                            className="btn"
                            onClick={() => handleLeaveGroup(req.id)}
                            style={{
                              background: "rgba(239, 68, 68, 0.15)",
                              border: "1px solid rgba(239, 68, 68, 0.25)",
                              color: "#ef4444",
                              flex: 1
                            }}
                          >
                            Leave
                          </button>
                        </div>
                      ) : sentJoinRequests.some(r => r.groupId === req.id && r.status === "pending") ? (
                        <button
                          className="btn"
                          style={{
                            background: "#f57c00",
                            cursor: "default",
                            flex: 1
                          }}
                          disabled={true}
                        >
                          Pending...
                        </button>
                      ) : isFull ? (
                        <button
                          className="btn"
                          style={{
                            background: "rgba(239, 68, 68, 0.15)",
                            border: "1px solid rgba(239, 68, 68, 0.25)",
                            color: "#ef4444",
                            cursor: "not-allowed",
                            flex: 1
                          }}
                          disabled={true}
                        >
                          Group Full
                        </button>
                      ) : (
                        <button
                          className="btn"
                          onClick={() => handleJoinSession(req)}
                          style={{ flex: 1 }}
                        >
                          Request to Join
                        </button>
                      )}

                      {/* Feature 1: Chat room button for members */}
                      {isMember && (
                        <button
                          className="btn-premium-secondary"
                          style={{ padding: "10px", flexShrink: 0, borderRadius: "8px", minWidth: "46px" }}
                          onClick={() => setActiveChatGroup(req)}
                          title="Open Chat Room"
                        >
                          💬
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="cards">
            {filteredStudents.length === 0 ? (
              <p style={{ gridColumn: "1/-1", textAlign: "center", color: "#666", fontSize: "16px" }}>No students matching your search found.</p>
            ) : (
              filteredStudents.map(student => {
                const matchReq = sentTeamRequests.find(r => r.receiverUid === student.uid);
                const requestStatus = matchReq?.status;
                const buttonText = requestStatus === "pending"
                  ? "Pending Request..."
                  : requestStatus === "accepted"
                  ? "Team Member ✓"
                  : requestStatus === "declined"
                  ? "Request Declined"
                  : "Invite to Team";
                return (
                  <div className="card" key={student.uid}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}>
                      {student.customAvatarUrl ? (
                        <img 
                          src={student.customAvatarUrl} 
                          alt={student.displayName} 
                          style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "2px solid rgba(255,255,255,0.1)"
                          }} 
                        />
                      ) : (
                        <div style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                          background: (AVATAR_PRESETS[student.avatarPreset] || AVATAR_PRESETS[0]).gradient,
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "20px",
                          fontWeight: "600",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
                        }}>
                          {(student.displayName || "S")[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 style={{ margin: 0, fontSize: "18px" }}>{student.displayName}</h3>
                        <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{student.course} @ {student.college}</span>
                      </div>
                    </div>
                    
                    {/* Real Biography */}
                    <p style={{ 
                      fontSize: "13.5px", 
                      color: "var(--text-secondary)", 
                      fontStyle: "italic", 
                      lineHeight: "1.5", 
                      margin: "0 0 16px 0",
                      background: "rgba(255, 255, 255, 0.015)",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid rgba(255, 255, 255, 0.03)"
                    }}>
                      "{student.bio || "Passionate college student interested in peer learning."}"
                    </p>

                    <div style={{ marginBottom: "16px" }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Expertise Tags:</strong>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {(student.interests || "General").split(",").map((interest, i) => (
                          <span key={i} style={{
                            background: "rgba(99, 102, 241, 0.15)",
                            color: "#818cf8",
                            fontSize: "12px",
                            padding: "4px 10px",
                            borderRadius: "15px",
                            fontWeight: "500",
                            border: "1px solid rgba(99, 102, 241, 0.18)"
                          }}>
                            {interest.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Social Handles */}
                    {(student.github || student.linkedin || student.leetcode) && (
                      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", alignItems: "center" }}>
                        <span style={{ fontSize: "12.5px", color: "var(--text-muted)", fontWeight: "600" }}>Profiles:</span>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          {student.github && (
                            <a 
                              href={`https://github.com/${student.github}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: "#fff", opacity: 0.7, transition: "opacity 0.2s" }}
                              title={`GitHub: ${student.github}`}
                            >
                              <i className="fa-brands fa-github" style={{ fontSize: "16px" }}></i>
                            </a>
                          )}
                          {student.linkedin && (
                            <a 
                              href={student.linkedin.startsWith("http") ? student.linkedin : `https://linkedin.com/in/${student.linkedin}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: "#0a66c2", opacity: 0.8, transition: "opacity 0.2s" }}
                              title="LinkedIn"
                            >
                              <i className="fa-brands fa-linkedin" style={{ fontSize: "16px" }}></i>
                            </a>
                          )}
                          {student.leetcode && (
                            <a 
                              href={`https://leetcode.com/${student.leetcode}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: "#ffa116", opacity: 0.8, transition: "opacity 0.2s" }}
                              title={`LeetCode: ${student.leetcode}`}
                            >
                              <i className="fa-solid fa-code" style={{ fontSize: "15px" }}></i>
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      className="btn"
                      onClick={() => handleSendTeamRequest(student)}
                      style={{
                        background: requestStatus === "pending"
                          ? "#f57c00"
                          : requestStatus === "accepted"
                          ? "#2e7d32"
                          : requestStatus === "declined"
                          ? "#d32f2f"
                          : "var(--accent-gradient)",
                        cursor: requestStatus ? "default" : "pointer"
                      }}
                      disabled={!!requestStatus}
                    >
                      {buttonText}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Feature 1: Floating Chat Sidebar */}
      {activeChatGroup && (
        <div className="chat-sidebar glass-card">
          <div className="chat-header">
            <div>
              <h3><i className="fa-solid fa-comments" style={{ marginRight: "8px", color: "var(--accent-primary)" }}></i>Group Chat</h3>
              <span className="chat-group-title">{activeChatGroup.title}</span>
            </div>
            <button className="chat-close-btn" onClick={() => setActiveChatGroup(null)}>×</button>
          </div>

          <div className="chat-messages-container">
            {chatMessages.length === 0 ? (
              <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "13.5px", marginTop: "40px" }}>No messages yet. Send a greeting!</p>
            ) : (
              chatMessages.map(msg => {
                const isSelf = msg.senderUid === currentUser?.uid;
                return (
                  <div key={msg._id || msg.id} className={`chat-message-bubble ${isSelf ? "self" : ""}`}>
                    {!isSelf && <span className="bubble-author">{msg.senderName}</span>}
                    <div className="bubble-text">{msg.content}</div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSendChatMessage} className="chat-input-form">
            <input
              type="text"
              className="input-premium"
              placeholder="Send message to circle..."
              value={newMsgContent}
              onChange={(e) => setNewMsgContent(e.target.value)}
              required
            />
            <button type="submit" className="chat-send-btn">
              ➤
            </button>
          </form>
        </div>
      )}

      {/* Feature 2: Schedule Meeting Modal Dialog */}
      {schedulingGroupId && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ maxWidth: "450px", width: "90%" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "4px" }}>📅 Schedule Study Session</h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>Create a calendar invite with Location/Video links.</p>

            <form onSubmit={handleCreateMeeting} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="form-group" style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>Meeting Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 4 Problem Review"
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  required
                  className="input-premium"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div className="form-group" style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>Date</label>
                  <input
                    type="date"
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                    required
                    className="input-premium"
                  />
                </div>
                <div className="form-group" style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                  <label style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>Time</label>
                  <input
                    type="time"
                    value={meetingForm.time}
                    onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })}
                    required
                    className="input-premium"
                  />
                </div>
              </div>

              <div className="form-group" style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>Location or Link</label>
                <input
                  type="text"
                  placeholder="e.g. Library Room 204 or Google Meet link"
                  value={meetingForm.location}
                  onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })}
                  required
                  className="input-premium"
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="submit" className="btn-premium" style={{ flex: 1 }}>Schedule</button>
                <button type="button" className="btn-premium-secondary" onClick={() => setSchedulingGroupId(null)} style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Home;
