// server.js  
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/collabhub";
const JWT_SECRET = process.env.JWT_SECRET || "collabhub_jwt_secret_token";

app.use(cors());
app.use(express.json());

// --- Setup HTTP & Socket.io Server ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"]
  }
});

// --- Database Connection ---
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB database successfully!");
    seedInitialData();
  })
  .catch(err => {
    console.error("MongoDB Database Connection Error:", err.message);
  });

// --- Schema Definitions ---

// 1. Users Schema
const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String, default: "" },
  course: { type: String, default: "Not Specified" },
  college: { type: String, default: "Not Specified" },
  interests: { type: String, default: "Not Specified" },
  
  // Extended Metadata synced with Database
  avatarPreset: { type: Number, default: 0 },
  customAvatarUrl: { type: String, default: "" },
  leetcode: { type: String, default: "" },
  linkedin: { type: String, default: "" },
  github: { type: String, default: "" },
  bio: { type: String, default: "Passionate college student interested in peer learning." }
});

// Bcrypt password hashing pre-save hook
UserSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model("User", UserSchema);

// 2. Study Requests (Groups) Schema
const RequestSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  creatorName: { type: String, required: true },
  creatorEmail: { type: String, required: true },
  creatorUid: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  members: { type: [String], default: [] }
});
const Request = mongoose.model("Request", RequestSchema);

// 3. Join / Invite Requests Schema
const JoinRequestSchema = new mongoose.Schema({
  groupId: { type: String, required: true },
  groupTitle: { type: String, required: true },
  groupCreatorUid: { type: String, required: true },
  senderUid: { type: String, required: true },
  senderName: { type: String, required: true },
  senderEmail: { type: String, required: true },
  receiverUid: { type: String, required: true }, // UID of receiver (creator for join, student for invite)
  status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
  type: { type: String, enum: ["join", "invite"], default: "join" }, // join request vs creator invitation
  timestamp: { type: Date, default: Date.now }
});
const JoinRequest = mongoose.model("JoinRequest", JoinRequestSchema);

// 4. Group Chat Messages Schema
const MessageSchema = new mongoose.Schema({
  groupId: { type: String, required: true },
  senderUid: { type: String, required: true },
  senderName: { type: String, required: true },
  senderEmail: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model("Message", MessageSchema);

// 5. Meetings Schema
const MeetingSchema = new mongoose.Schema({
  groupId: { type: String, required: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  creatorUid: { type: String, required: true },
  rsvps: { type: [String], default: [] }
});
const Meeting = mongoose.model("Meeting", MeetingSchema);

// --- JWT Authentication Middleware ---
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. Unauthorized." });
    }
    const token = authHeader.split(" ")[1];
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // contains uid and email
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid authorization token." });
  }
};

// --- Data Seeding ---
async function seedInitialData() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const seedUsers = [
        {
          uid: "user_sarah",
          email: "sarah.j@mnnit.ac.in",
          displayName: "Sarah Johnson",
          course: "MCA",
          college: "MNNIT Allahabad",
          interests: "React, Web Development, UI/UX",
          password: "password123",
          avatarPreset: 0,
          bio: "Passionate about full-stack architectures and frontend design. Let's study together!"
        },
        {
          uid: "user_michael",
          email: "micheal.c@mnnit.ac.in",
          displayName: "Michael Chen",
          course: "B.Tech CSE",
          college: "MNNIT Allahabad",
          interests: "Data Structures, C++, Algorithms",
          password: "password123",
          avatarPreset: 4,
          bio: "Competitive programmer focusing on algorithmic problem sets and DS."
        },
        {
          uid: "user_emma",
          email: "emma.d@mnnit.ac.in",
          displayName: "Emma Davis",
          course: "B.Tech ECE",
          college: "MNNIT Allahabad",
          interests: "Python, Machine Learning, Data Science",
          password: "password123",
          avatarPreset: 1,
          bio: "ECE student researching computer vision models. Always up to talk python."
        }
      ];
      
      // Save individually to trigger mongoose pre-save hash hooks
      for (let userObj of seedUsers) {
        const u = new User(userObj);
        await u.save();
      }
      console.log("Seeded default college students.");
    }

    const requestCount = await Request.countDocuments();
    if (requestCount === 0) {
      const seedRequests = [
        {
          subject: "Mathematics",
          title: "Calculus II - Integration Techniques",
          description: JSON.stringify({
            text: "Looking for study partners to review integration by parts and substitution methods. Preparing for midterm exam.",
            comms: "In-Person / Library",
            difficulty: "Intermediate",
            frequency: "Weekly Sessions",
            maxSize: 5,
            tags: ["Calculus", "M1", "Integration"]
          }),
          creatorName: "Sarah Johnson",
          creatorEmail: "sarah.j@mnnit.ac.in",
          creatorUid: "user_sarah",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          members: ["user_sarah"]
        },
        {
          subject: "Computer Science",
          title: "Data Structures - Binary Trees",
          description: JSON.stringify({
            text: "Need help understanding tree traversal algorithms. Let's work through problems together!",
            comms: "Discord",
            difficulty: "Beginner Friendly",
            frequency: "Daily Review",
            maxSize: 4,
            tags: ["Binary Trees", "DFS", "BFS"]
          }),
          creatorName: "Michael Chen",
          creatorEmail: "micheal.c@mnnit.ac.in",
          creatorUid: "user_michael",
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
          members: ["user_michael"]
        }
      ];
      
      for(let req of seedRequests) {
        const r = new Request(req);
        await r.save();
      }
      console.log("Seeded default study requests.");
    }
  } catch (e) {
    console.error("Error seeding initial MongoDB data:", e);
  }
}

// --- API Router & Handlers ---

// 1. Authentication Routes
app.post("/api/auth/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already registered." });
    }
    const uid = "user_" + Math.random().toString(36).substr(2, 9);
    const newUser = new User({
      uid,
      email,
      password, // Bcrypt hooks will hash this
      displayName: email.split("@")[0],
      course: "Not Specified",
      college: "Not Specified",
      interests: "Not Specified"
    });
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ uid, email }, JWT_SECRET, { expiresIn: "7d" });
    
    const userObj = newUser.toObject();
    delete userObj.password;
    res.json({ user: userObj, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password." });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Generate JWT token
    const token = jwt.sign({ uid: user.uid, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    
    const userObj = user.toObject();
    delete userObj.password;
    res.json({ user: userObj, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/auth/profile", authMiddleware, async (req, res) => {
  const { displayName, course, college, interests, avatarPreset, customAvatarUrl, leetcode, linkedin, github, bio } = req.body;
  const uid = req.user.uid;
  try {
    const updated = await User.findOneAndUpdate(
      { uid },
      { displayName, course, college, interests, avatarPreset, customAvatarUrl, leetcode, linkedin, github, bio },
      { new: true }
    );
    const userObj = updated.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Student Directory (All profiles metadata are public)
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Study Group Requests (Groups)
app.get("/api/requests", async (req, res) => {
  try {
    const requests = await Request.find().sort({ timestamp: -1 });
    const mapped = requests.map(r => {
      const obj = r.toObject();
      obj.id = obj._id.toString();
      return obj;
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/requests", authMiddleware, async (req, res) => {
  const { subject, title, description, creatorName, creatorEmail } = req.body;
  const creatorUid = req.user.uid;
  try {
    const newReq = new Request({
      subject,
      title,
      description,
      creatorName,
      creatorEmail,
      creatorUid,
      members: [creatorUid]
    });
    await newReq.save();
    const obj = newReq.toObject();
    obj.id = obj._id.toString();
    res.json(obj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Leave group route
app.post("/api/requests/:id/leave", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const uid = req.user.uid;
  try {
    const group = await Request.findById(id);
    if (!group) {
      return res.status(404).json({ error: "Study group not found." });
    }
    if (group.creatorUid === uid) {
      return res.status(400).json({ error: "Creator cannot leave their own group. Delete the group instead." });
    }
    
    group.members = group.members.filter(m => m !== uid);
    await group.save();
    
    res.json({ message: "Left group successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete group route
app.delete("/api/requests/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const uid = req.user.uid;
  try {
    const group = await Request.findById(id);
    if (!group) {
      return res.status(404).json({ error: "Study group not found." });
    }
    if (group.creatorUid !== uid) {
      return res.status(403).json({ error: "Only the group creator can delete this study group." });
    }

    // Cascade deletions
    await Request.findByIdAndDelete(id);
    await JoinRequest.deleteMany({ groupId: id });
    await Meeting.deleteMany({ groupId: id });
    await Message.deleteMany({ groupId: id });

    res.json({ message: "Group deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Join & Invite Request Operations
app.get("/api/join-requests", async (req, res) => {
  try {
    const joinReqs = await JoinRequest.find().sort({ timestamp: -1 });
    const mapped = joinReqs.map(j => {
      const obj = j.toObject();
      obj.id = obj._id.toString();
      return obj;
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/join-requests", authMiddleware, async (req, res) => {
  const { groupId, groupTitle, groupCreatorUid, senderUid, senderName, senderEmail, receiverUid, type } = req.body;
  try {
    const newJoinReq = new JoinRequest({
      groupId,
      groupTitle,
      groupCreatorUid,
      senderUid,
      senderName,
      senderEmail,
      receiverUid,
      type: type || "join"
    });
    await newJoinReq.save();
    const obj = newJoinReq.toObject();
    obj.id = obj._id.toString();
    res.json(obj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve or ignore request
app.patch("/api/join-requests/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'accepted' or 'declined'
  try {
    const joinReq = await JoinRequest.findByIdAndUpdate(id, { status }, { new: true });
    
    if (status === "accepted" && joinReq) {
      // Append member to requests members array (accepting user to group)
      const targetUserUid = joinReq.type === "join" ? joinReq.senderUid : joinReq.receiverUid;
      await Request.findByIdAndUpdate(joinReq.groupId, {
        $addToSet: { members: targetUserUid }
      });
    }
    const obj = joinReq ? joinReq.toObject() : {};
    obj.id = obj._id ? obj._id.toString() : "";
    res.json(obj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Chat Room Message Operations
app.get("/api/messages/:groupId", async (req, res) => {
  const { groupId } = req.params;
  try {
    const messages = await Message.find({ groupId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/messages", authMiddleware, async (req, res) => {
  const { groupId, senderUid, senderName, senderEmail, content } = req.body;
  try {
    const newMsg = new Message({
      groupId,
      senderUid,
      senderName,
      senderEmail,
      content
    });
    await newMsg.save();
    
    // Broadcast instantly to active socket room
    io.to(groupId).emit("new_message", newMsg);
    
    res.json(newMsg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Scheduler Meeting Operations
app.get("/api/meetings/:groupId", async (req, res) => {
  const { groupId } = req.params;
  try {
    const meetings = await Meeting.find({ groupId }).sort({ date: 1, time: 1 });
    const mapped = meetings.map(m => {
      const obj = m.toObject();
      obj.id = obj._id.toString();
      return obj;
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/meetings", authMiddleware, async (req, res) => {
  const { groupId, title, date, time, location, creatorUid } = req.body;
  try {
    const newMeeting = new Meeting({
      groupId,
      title,
      date,
      time,
      location,
      creatorUid,
      rsvps: [creatorUid]
    });
    await newMeeting.save();
    const obj = newMeeting.toObject();
    obj.id = obj._id.toString();
    res.json(obj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/meetings/:id/rsvp", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { userUid, rsvpStatus } = req.body;
  try {
    const update = rsvpStatus 
      ? { $addToSet: { rsvps: userUid } } 
      : { $pull: { rsvps: userUid } };
      
    const updatedMeeting = await Meeting.findByIdAndUpdate(id, update, { new: true });
    const obj = updatedMeeting ? updatedMeeting.toObject() : {};
    obj.id = obj._id ? obj._id.toString() : "";
    res.json(obj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve React Frontend static files
app.use(express.static(path.join(__dirname, "..", "client", "build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"));
});

// --- Socket.io Rooms Handling ---
io.on("connection", (socket) => {
  console.log("Client connected to socket:", socket.id);
  
  socket.on("join_room", (groupId) => {
    socket.join(groupId);
    console.log(`Socket ${socket.id} joined room ${groupId}`);
  });
  
  socket.on("leave_room", (groupId) => {
    socket.leave(groupId);
    console.log(`Socket ${socket.id} left room ${groupId}`);
  });
  
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// --- Server Startup ---
server.listen(PORT, () => {
  console.log(`Server is running in background at http://localhost:${PORT}`);
});
