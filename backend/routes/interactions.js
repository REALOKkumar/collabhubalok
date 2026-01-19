//The Chat & Request Routes (backend/routes/interactions.js)
//Create this new file to handle sending messages and join requests.

const router = require('express').Router();
const User = require('../models/User');
const Message = require('../models/Message');
const CollabRequest = require('../models/CollabRequest');
const { logActivity } = require('./activity'); // Import our logger

// --- CHAT ROUTES ---

// POST /api/interactions/message
// Send a message
router.post('/message', async (req, res) => {
  const { firebaseUid, content, projectId } = req.body;

  try {
    const user = await User.findOne({ firebaseUid });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const msg = new Message({
      sender: user._id,
      projectId,
      content
    });
    await msg.save();

    res.json(msg);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// GET /api/interactions/messages
// Get chat history
router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('sender', 'name') // Show sender's name
      .sort({ timestamp: 1 }); // Oldest first
    res.json(messages);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// --- COLLAB REQUEST ROUTES ---

// POST /api/interactions/join-request
// User asks to join a project
router.post('/join-request', async (req, res) => {
  const { firebaseUid, postId, message } = req.body;

  try {
    const user = await User.findOne({ firebaseUid });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // 1. Create the Request
    const newRequest = new CollabRequest({
      sender: user._id,
      postId,
      message
    });
    await newRequest.save();

    // 2. AUTOMATICALLY RECORD THIS ACTIVITY
    await logActivity(user._id, "SENT_REQUEST", `Requested to join post ${postId}`);

    res.json(newRequest);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;